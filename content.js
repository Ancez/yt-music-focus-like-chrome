let lastClickTime = 0;
const CLICK_COOLDOWN = 1000;
let preventAutoLikeKeys = new Set();

function findAndClickLikeButton(forceToggle = false) {
  if (!forceToggle && preventAutoLikeKeys.size > 0) return;
  
  const likeButtonRenderer = document.querySelector('ytmusic-like-button-renderer');
  if (!likeButtonRenderer) return;
  
  const likeStatus = likeButtonRenderer.getAttribute('like-status');
  const isAlreadyLiked = likeStatus === 'LIKE';
  
  if (!forceToggle && isAlreadyLiked) return;

  const likeButton = likeButtonRenderer.querySelector('button[aria-label="Like"]');
  if (!likeButton) return;

  const now = Date.now();
  if (now - lastClickTime < CLICK_COOLDOWN) return;

  likeButton.click();
  lastClickTime = now;
}

function findAndClickDislikeButton(forceToggle = false) {
  const dislikeButton = document.querySelector('button[aria-label="Dislike"], button[aria-label="Unlike"]');
  if (!dislikeButton) return;

  const now = Date.now();
  if (now - lastClickTime < CLICK_COOLDOWN) return;

  const isAlreadyDisliked = dislikeButton.getAttribute('aria-label') === 'Like';
  if (forceToggle || !isAlreadyDisliked) {
    dislikeButton.click();
    lastClickTime = now;
  }
}

function undoLastAction() {
  const dislikeButton = document.querySelector('button[aria-label="Dislike"], button[aria-label="Unlike"]');
  const likeButton = document.querySelector('button[aria-label="Like"]');
  
  const now = Date.now();
  if (now - lastClickTime < CLICK_COOLDOWN) return;

  if (dislikeButton) dislikeButton.click();
  else if (likeButton) likeButton.click();
  lastClickTime = now;
}

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  const normalizedKey = e.key === 'ArrowDown' ? 'ArrowDown' : key;
  const isSuperHeld = e.metaKey || e.ctrlKey;
  
  if (!isSuperHeld && (normalizedKey === 'n' || normalizedKey === 'x' || normalizedKey === 's' || normalizedKey === 'ArrowDown')) {
    preventAutoLikeKeys.add(normalizedKey);
    hideTooltip();
  }
  
  if (isSuperHeld) {
    const originalKey = e.key;
    if (key === 'y' || originalKey === 'ArrowUp') {
      e.preventDefault();
      findAndClickLikeButton(true);
    } else if (key === 'n' || key === 'x' || originalKey === 'ArrowDown') {
      e.preventDefault();
      findAndClickDislikeButton(true);
    } else if (key === 'u' || originalKey === 'Backspace') {
      e.preventDefault();
      undoLastAction();
    }
  }
}, { capture: true });

document.addEventListener('keyup', (e) => {
  const normalizedKey = e.key === 'ArrowDown' ? 'ArrowDown' : e.key.toLowerCase();
  preventAutoLikeKeys.delete(normalizedKey);
}, { capture: true });

let autoLikeTimeout = null;
let countdownInterval = null;
let tooltipElement = null;

function createTooltip() {
  if (tooltipElement) return tooltipElement;
  
  tooltipElement = document.createElement('div');
  tooltipElement.id = 'focus-like-tooltip';
  tooltipElement.style.cssText = `
    position: fixed;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  `;
  document.body.appendChild(tooltipElement);
  return tooltipElement;
}

function showTooltip(secondsRemaining) {
  const tooltip = createTooltip();
  tooltip.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">Auto-like in ${secondsRemaining}s</div>
    <div style="font-size: 12px; color: #ccc;">Press <kbd style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px;">N</kbd>, <kbd style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px;">X</kbd>, <kbd style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px;">S</kbd>, or <kbd style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px;">↓</kbd> to cancel</div>
  `;
  tooltip.style.opacity = '1';
}

function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.style.opacity = '0';
    setTimeout(() => {
      if (tooltipElement && tooltipElement.style.opacity === '0') {
        tooltipElement.remove();
        tooltipElement = null;
      }
    }, 200);
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function scheduleAutoLike() {
  const likeButtonRenderer = document.querySelector('ytmusic-like-button-renderer');
  if (!likeButtonRenderer) return;
  
  const likeStatus = likeButtonRenderer.getAttribute('like-status');
  if (likeStatus === 'LIKE') {
    return;
  }
  
  if (autoLikeTimeout) clearTimeout(autoLikeTimeout);
  if (countdownInterval) clearInterval(countdownInterval);
  
  let secondsRemaining = 5;
  showTooltip(secondsRemaining);
  
  countdownInterval = setInterval(() => {
    secondsRemaining--;
    if (secondsRemaining > 0) {
      showTooltip(secondsRemaining);
    } else {
      hideTooltip();
    }
  }, 1000);
  
  autoLikeTimeout = setTimeout(() => {
    if (preventAutoLikeKeys.size === 0) {
      findAndClickLikeButton();
    }
    autoLikeTimeout = null;
    hideTooltip();
  }, 5000);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) scheduleAutoLike();
});

window.addEventListener('focus', () => scheduleAutoLike());

setTimeout(() => findAndClickLikeButton(), 1000);
