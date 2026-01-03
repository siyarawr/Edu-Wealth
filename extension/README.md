# Edu Wealth Chrome Extension

A Chrome extension for quick access to the Edu Wealth student platform.

## Features

- **Quick Popup Access**: Click the extension icon to see quick links to all app features
- **Direct Navigation**: Jump straight to Dashboard, Expenses, AI Notes, or Calendar
- **One-Click App Launch**: Open the full web application instantly

## Installation (Development)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `extension` folder
5. The Edu Wealth icon will appear in your toolbar

## Publishing to Chrome Web Store

### Prerequisites

1. Create icon files (see `icons/create-icons.md`):
   - `icons/icon16.png` (16x16)
   - `icons/icon48.png` (48x48)
   - `icons/icon128.png` (128x128)

2. Update the `APP_URL` in `popup.js` and `background.js` to your deployed app URL

### Steps to Publish

1. **Create a ZIP file** of the extension folder:
   ```bash
   cd extension
   zip -r edu-wealth-extension.zip . -x "*.md" -x "*.git*"
   ```

2. **Go to Chrome Web Store Developer Dashboard**:
   https://chrome.google.com/webstore/developer/dashboard

3. **Pay the one-time developer fee** ($5 USD)

4. **Click "New Item"** and upload your ZIP file

5. **Fill in the listing details**:
   - Store listing description
   - Screenshots (1280x800 or 640x400)
   - Promotional images (optional)
   - Category: Productivity
   - Language: English

6. **Submit for review** (usually takes 1-3 days)

## Configuration

Update the `APP_URL` constant in these files to match your deployed URL:
- `popup.js`
- `background.js`

## File Structure

```
extension/
├── manifest.json      # Chrome extension manifest v3
├── popup.html         # Popup UI
├── popup.js           # Popup functionality
├── background.js      # Service worker
├── icons/
│   ├── icon16.png     # Toolbar icon
│   ├── icon48.png     # Extensions page icon
│   └── icon128.png    # Store listing icon
└── README.md          # This file
```

## Permissions Used

- `storage`: For saving user preferences locally
- `activeTab`: For interacting with the current tab when needed

## Privacy

This extension:
- Does NOT collect any personal data
- Does NOT track browsing history
- Only connects to the Edu Wealth web application
- Stores minimal preferences locally using Chrome storage API
