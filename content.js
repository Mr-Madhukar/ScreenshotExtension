// ── Content Script ─────────────────────────────────────
// Runs in the context of the web page.
// Handles scrolling and dimension queries from the background script.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {

    case 'getDimensions':
      sendResponse({
        scrollHeight: Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        ),
        scrollWidth: Math.max(
          document.body.scrollWidth,
          document.documentElement.scrollWidth
        ),
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        devicePixelRatio: window.devicePixelRatio || 1
      });
      break;

    case 'scrollTo':
      window.scrollTo({
        top: message.top,
        left: 0,
        behavior: 'instant'
      });
      // Small delay to let the browser paint
      setTimeout(() => {
        sendResponse({ scrolled: true });
      }, 50);
      return true; // async response

    case 'getScroll':
      sendResponse({
        scrollY: window.scrollY || window.pageYOffset,
        scrollX: window.scrollX || window.pageXOffset
      });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});
