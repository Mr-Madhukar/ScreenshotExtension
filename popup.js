// ── DOM Elements ─────────────────────────────────────────
const btnVisible = document.getElementById('btn-visible');
const btnFullpage = document.getElementById('btn-fullpage');
const statusEl = document.getElementById('status');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');

// ── Helpers ──────────────────────────────────────────────
function setStatus(icon, text, type = '') {
  statusEl.className = 'status ' + type;
  statusIcon.textContent = icon;
  statusText.textContent = text;
  statusEl.classList.remove('hidden');
}

function hideStatus() {
  statusEl.classList.add('hidden');
}

function setProgress(percent) {
  progressBar.classList.remove('hidden');
  progressFill.style.width = percent + '%';
}

function hideProgress() {
  progressBar.classList.add('hidden');
  progressFill.style.width = '0%';
}

function disableButtons(disabled) {
  btnVisible.disabled = disabled;
  btnFullpage.disabled = disabled;
}

// ── Capture handler ──────────────────────────────────────
function startCapture(type) {
  disableButtons(true);
  hideProgress();

  const label = type === 'visible' ? 'Capturing visible area…' : 'Capturing full page…';
  setStatus('⏳', label, 'capturing');

  if (type === 'fullpage') {
    setProgress(0);
  }

  chrome.runtime.sendMessage({ action: 'capture', type: type }, (response) => {
    if (chrome.runtime.lastError) {
      setStatus('❌', chrome.runtime.lastError.message || 'Capture failed', 'error');
      disableButtons(false);
      hideProgress();
      return;
    }

    if (response && response.success) {
      hideProgress();
      setStatus('✅', 'Screenshot saved!', 'success');
      setTimeout(() => {
        hideStatus();
        disableButtons(false);
      }, 2000);
    } else {
      hideProgress();
      setStatus('❌', response?.error || 'Capture failed', 'error');
      setTimeout(() => {
        disableButtons(false);
      }, 2000);
    }
  });
}

// ── Progress listener (for full-page scroll updates) ─────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'captureProgress') {
    setProgress(msg.percent);
  }
});

// ── Button events ────────────────────────────────────────
btnVisible.addEventListener('click', () => startCapture('visible'));
btnFullpage.addEventListener('click', () => startCapture('fullpage'));
