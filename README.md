# YouTube Music Auto Like on Focus - Chrome Extension

A Chrome extension that automatically likes YouTube Music songs when the browser window is focused by clicking the button with `aria-label="Like"`.

## Features

- **Primary**: Automatically clicks the "Like" button when the window gains focus
- Prevents auto-like when clicking 'n', 'x', 's', or Arrow Down after focusing the window
- Keyboard shortcuts (with SUPER/Windows key):
  - `SUPER + y` or `SUPER + Arrow Up` → Like the song (also undoes dislike)
  - `SUPER + n`, `SUPER + x`, or `SUPER + Arrow Down` → Dislike the song (also undoes like)
  - `SUPER + u` or `SUPER + Backspace` → Undo last action (like/dislike)
- Prevents duplicate clicks with a 1-second cooldown
- Checks if the song is already liked/disliked before clicking
- Works with tab switching and window focus events

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the directory containing this extension
5. The extension will now be active

## How It Works

The extension uses a content script that:
- Automatically likes songs when the window/tab gains focus
- Tracks keys that prevent auto-like ('n', 'x', 's', Arrow Down)
- Listens for keyboard shortcuts with SUPER modifier
- Searches for buttons with `aria-label="Like"` or `aria-label="Dislike"/"Unlike"`
- Clicks the appropriate button based on user action
- Includes a cooldown mechanism to prevent rapid clicking

## Usage

### Auto-Like on Focus (Primary Feature)
- Simply switch to the YouTube Music tab/window - the song will be auto-liked after 5 seconds
- To cancel auto-like: Press and hold 'n', 'x', 's', or Arrow Down within 5 seconds of switching to the tab/window

### Manual Keyboard Shortcuts
- `SUPER + y` or `SUPER + Arrow Up` → Manually like the current song (also undoes dislike)
- `SUPER + n`, `SUPER + x`, or `SUPER + Arrow Down` → Dislike the current song (also undoes like)
- `SUPER + u` or `SUPER + Backspace` → Undo last action (toggle like/dislike state)

**Undo Examples:**
- Accidentally disliked? Press `SUPER + y` or `SUPER + u` to undo
- Accidentally liked? Press `SUPER + n` or `SUPER + u` to undo

**Note**: On Linux, SUPER key detection uses `metaKey`. If it doesn't work, you may need to configure your window manager to pass SUPER key events to the browser.

## Notes

- The extension only works on YouTube Music (`music.youtube.com`)
- No permissions required
- The extension checks for buttons with the exact aria-label "Like"
- Designed specifically for YouTube Music

