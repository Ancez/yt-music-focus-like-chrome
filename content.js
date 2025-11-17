let lastClickTime = 0;
const CLICK_COOLDOWN = 1000; // 1 second cooldown between clicks
let preventAutoLikeKeys = new Set(); // Track keys that prevent auto-like: n, x, s, ArrowDown
let modifierKeysHeld = { meta: false, ctrl: false, alt: false, shift: false };

function findAndClickLikeButton(forceToggle = false) {
  // Don't auto-like if prevent keys are being held (unless forcing toggle)
  if (!forceToggle && preventAutoLikeKeys.size > 0) {
    return;
  }
  
  // Don't auto-like if any modifier keys are held (SUPER, Ctrl, Alt, Shift)
  if (!forceToggle && (modifierKeysHeld.meta || modifierKeysHeld.ctrl || modifierKeysHeld.alt || modifierKeysHeld.shift)) {
    return;
  }

  const likeButton = document.querySelector('button[aria-label="Like"]');
  
  if (likeButton) {
    const now = Date.now();
    // Only click if enough time has passed since last click
    if (now - lastClickTime >= CLICK_COOLDOWN) {
      // Check if button is not already liked (aria-pressed might be "true" if already liked)
      const isAlreadyLiked = likeButton.getAttribute('aria-pressed') === 'true' || 
                             likeButton.classList.contains('liked') ||
                             likeButton.getAttribute('aria-label') === 'Unlike';
      
      // If forcing toggle (manual action), always click to allow undoing dislike
      // Otherwise, only click if not already liked
      if (forceToggle || !isAlreadyLiked) {
        likeButton.click();
        lastClickTime = now;
        console.log(forceToggle ? 'Liked/undisliked song' : 'Auto-liked song');
      }
    }
  }
}

function findAndClickDislikeButton(forceToggle = false) {
  const dislikeButton = document.querySelector('button[aria-label="Dislike"], button[aria-label="Unlike"]');
  
  if (dislikeButton) {
    const now = Date.now();
    if (now - lastClickTime >= CLICK_COOLDOWN) {
      const isAlreadyDisliked = dislikeButton.getAttribute('aria-pressed') === 'true' || 
                                dislikeButton.classList.contains('disliked') ||
                                dislikeButton.getAttribute('aria-label') === 'Like';
      
      // If forcing toggle (manual action), always click to allow undoing like
      // Otherwise, only click if not already disliked
      if (forceToggle || !isAlreadyDisliked) {
        dislikeButton.click();
        lastClickTime = now;
        console.log(forceToggle ? 'Disliked/unliked song' : 'Disliked song');
      }
    }
  }
}

function undoLastAction() {
  // Try to find and click the opposite button to undo
  // First check if there's a dislike button (to undo a dislike)
  const dislikeButton = document.querySelector('button[aria-label="Dislike"], button[aria-label="Unlike"]');
  const likeButton = document.querySelector('button[aria-label="Like"]');
  
  const now = Date.now();
  if (now - lastClickTime >= CLICK_COOLDOWN) {
    // If there's a dislike button visible, clicking like will undo dislike
    // If there's a like button visible, clicking dislike will undo like
    if (dislikeButton && likeButton) {
      // Check which state we're in
      const isDisliked = dislikeButton.getAttribute('aria-pressed') === 'true' || 
                        dislikeButton.classList.contains('disliked');
      const isLiked = likeButton.getAttribute('aria-pressed') === 'true' || 
                     likeButton.classList.contains('liked') ||
                     likeButton.getAttribute('aria-label') === 'Unlike';
      
      if (isDisliked) {
        likeButton.click();
        lastClickTime = now;
        console.log('Undid dislike - liked song');
      } else if (isLiked) {
        dislikeButton.click();
        lastClickTime = now;
        console.log('Undid like - disliked song');
      }
    } else if (likeButton) {
      // If only like button exists, try toggling it
      likeButton.click();
      lastClickTime = now;
      console.log('Toggled like state');
    } else if (dislikeButton) {
      // If only dislike button exists, try toggling it
      dislikeButton.click();
      lastClickTime = now;
      console.log('Toggled dislike state');
    }
  }
}

// Track modifier keys and keys that prevent auto-like
document.addEventListener('keydown', (e) => {
  const key = e.key;
  const isSuperHeld = e.metaKey || e.ctrlKey; // metaKey is SUPER on Linux/Mac, ctrlKey as fallback
  
  // Track modifier keys
  modifierKeysHeld.meta = e.metaKey;
  modifierKeysHeld.ctrl = e.ctrlKey;
  modifierKeysHeld.alt = e.altKey;
  modifierKeysHeld.shift = e.shiftKey;
  
  // Keys that prevent auto-like when pressed (without SUPER)
  if (!isSuperHeld && (key === 'n' || key === 'x' || key === 's' || key === 'ArrowDown')) {
    preventAutoLikeKeys.add(key);
  }
  
  // Keyboard shortcuts with SUPER modifier
  if (isSuperHeld) {
    if (key === 'y' || key === 'ArrowUp') {
      e.preventDefault();
      findAndClickLikeButton(true); // Force toggle to allow undoing dislike
    } else if (key === 'n' || key === 'x' || key === 'ArrowDown') {
      e.preventDefault();
      findAndClickDislikeButton(true); // Force toggle to allow undoing like
    } else if (key === 'u' || key === 'Backspace') {
      e.preventDefault();
      undoLastAction();
    }
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key;
  
  // Update modifier keys
  modifierKeysHeld.meta = e.metaKey;
  modifierKeysHeld.ctrl = e.ctrlKey;
  modifierKeysHeld.alt = e.altKey;
  modifierKeysHeld.shift = e.shiftKey;
  
  if (preventAutoLikeKeys.has(key)) {
    preventAutoLikeKeys.delete(key);
  }
});

// Helper function to check if modifier keys are currently held
function areModifierKeysHeld() {
  // We can't directly check modifier keys without an event, so we rely on tracking
  // But we'll also check on focus events to be safe
  return modifierKeysHeld.meta || modifierKeysHeld.ctrl || modifierKeysHeld.alt || modifierKeysHeld.shift;
}

// Listen for when page becomes visible (handles tab switching and window focus)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Small delay to ensure page is fully loaded and check modifier keys
    setTimeout(() => {
      // Check modifier keys one more time before auto-like
      // If any are still held (from before tab switch), don't auto-like
      if (!areModifierKeysHeld()) {
        findAndClickLikeButton();
      }
      // Reset modifier keys after check (for next time)
      modifierKeysHeld.meta = false;
      modifierKeysHeld.ctrl = false;
      modifierKeysHeld.alt = false;
      modifierKeysHeld.shift = false;
    }, 500);
  }
});

// Listen for window focus events (works when switching between browser windows)
window.addEventListener('focus', () => {
  setTimeout(() => {
    // Check modifier keys one more time before auto-like
    // If any are still held (from before focus change), don't auto-like
    if (!areModifierKeysHeld()) {
      findAndClickLikeButton();
    }
    // Reset modifier keys after check (for next time)
    modifierKeysHeld.meta = false;
    modifierKeysHeld.ctrl = false;
    modifierKeysHeld.alt = false;
    modifierKeysHeld.shift = false;
  }, 500);
});

// Initial check when content script loads
setTimeout(() => {
  findAndClickLikeButton();
}, 1000);


