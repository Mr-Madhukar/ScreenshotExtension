// ── Filename helper ──────────────────────────────────────
function getFilename() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `screenshot-${stamp}.png`;
}

// ── Download a data URL as PNG ───────────────────────────
function downloadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    chrome.downloads.download({
      url: dataUrl,
      filename: getFilename(),
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(downloadId);
      }
    });
  });
}

// ── Capture visible area ─────────────────────────────────
async function captureVisible() {
  const dataUrl = await chrome.tabs.captureVisibleTab(null, {
    format: 'png',
    quality: 100
  });
  await downloadImage(dataUrl);
  return { success: true };
}

// ── Capture full page (scroll + stitch) ──────────────────
async function captureFullPage(tab, senderPort) {
  // 1. Inject content script if not already present
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } catch (e) {
    // Content script may already be injected, that's fine
  }

  // 2. Get page dimensions from content script
  const dims = await sendToContent(tab.id, { action: 'getDimensions' });

  const totalHeight = dims.scrollHeight;
  const viewportHeight = dims.viewportHeight;
  const viewportWidth = dims.viewportWidth;
  const devicePixelRatio = dims.devicePixelRatio;

  // 3. Scroll & capture each viewport slice
  const slices = [];
  let currentScroll = 0;
  const totalScrolls = Math.ceil(totalHeight / viewportHeight);
  let scrollIndex = 0;

  // Save original scroll position
  await sendToContent(tab.id, { action: 'scrollTo', top: 0 });
  await delay(300);

  while (currentScroll < totalHeight) {
    await sendToContent(tab.id, { action: 'scrollTo', top: currentScroll });
    await delay(250); // Wait for rendering

    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100
    });

    const actualScroll = await sendToContent(tab.id, { action: 'getScroll' });

    slices.push({
      dataUrl: dataUrl,
      scrollY: actualScroll.scrollY,
      viewportHeight: viewportHeight
    });

    scrollIndex++;
    const percent = Math.min(Math.round((scrollIndex / totalScrolls) * 90), 90);

    // Send progress to popup
    try {
      chrome.runtime.sendMessage({ action: 'captureProgress', percent: percent });
    } catch(e) { /* popup might be closed */ }

    currentScroll += viewportHeight;
  }

  // 4. Restore scroll position
  await sendToContent(tab.id, { action: 'scrollTo', top: 0 });

  // 5. Stitch images together using OffscreenCanvas
  const stitchedDataUrl = await stitchImages(slices, viewportWidth, totalHeight, viewportHeight, devicePixelRatio);

  // 6. Download
  await downloadImage(stitchedDataUrl);

  try {
    chrome.runtime.sendMessage({ action: 'captureProgress', percent: 100 });
  } catch(e) {}

  return { success: true };
}

// ── Stitch images on a canvas ────────────────────────────
async function stitchImages(slices, viewportWidth, totalHeight, viewportHeight, dpr) {
  // Create an offscreen document for canvas operations
  const canvasWidth = viewportWidth * dpr;
  const canvasHeight = totalHeight * dpr;

  // We'll stitch using createImageBitmap and OffscreenCanvas
  const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];
    const response = await fetch(slice.dataUrl);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    const yPos = slice.scrollY * dpr;

    // For the last slice, we might need to clip to avoid overlap
    if (i === slices.length - 1) {
      const remainingHeight = (totalHeight * dpr) - yPos;
      if (remainingHeight < bitmap.height) {
        // Draw only the bottom portion of this capture
        const sourceY = bitmap.height - remainingHeight;
        ctx.drawImage(bitmap, 0, sourceY, bitmap.width, remainingHeight, 0, yPos, bitmap.width, remainingHeight);
      } else {
        ctx.drawImage(bitmap, 0, yPos);
      }
    } else {
      ctx.drawImage(bitmap, 0, yPos);
    }

    bitmap.close();
  }

  const resultBlob = await canvas.convertToBlob({ type: 'image/png' });
  return await blobToDataUrl(resultBlob);
}

// ── Utility: blob → data URL ─────────────────────────────
function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// ── Utility: send message to content script ──────────────
function sendToContent(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(response);
      }
    });
  });
}

// ── Utility: delay ──────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Message listener ─────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== 'capture') return false;

  (async () => {
    try {
      if (message.type === 'visible') {
        const result = await captureVisible();
        sendResponse(result);
      } else if (message.type === 'fullpage') {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const result = await captureFullPage(tab);
        sendResponse(result);
      }
    } catch (err) {
      console.error('Capture error:', err);
      sendResponse({ success: false, error: String(err) });
    }
  })();

  return true; // Keep the message channel open for async response
});
