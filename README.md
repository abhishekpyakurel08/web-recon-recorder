# Web Recon Recorder

A powerful cross-browser extension for **Firefox**, **Chrome**, and **Edge** built with **React**, **TypeScript**, **Vite**, and **Manifest V3** for recording reconnaissance metadata about websites during security research, bug bounty workflows, or technical documentation. Includes a domain-aware built-in Notepad with auto-save, search, pinning, and exports.

![Web Recon Recorder](public/icons/icon128.png)

---

## 🚀 Features

- **Automated Website Reconnaissance**:
  - Detect current URL, domain name, page title, and meta description.
  - Detect technology stacks in real time (React, Next.js, Vue.js, Nuxt.js, Angular, Svelte, WordPress, Shopify, Tailwind CSS, Bootstrap, jQuery, Vite, Google Analytics, Font Awesome).
  - Capture visible tab screenshots.
  - Automatic timestamping of website visit records.

- **Built-in Domain Notepad**:
  - Auto-save notes per domain while typing with visual status indicators.
  - Separate note files stored per domain.
  - Markdown preview toggle mode.
  - Pin important domain notes to the top.
  - Quick copy note to clipboard.
  - Download domain notes as `.txt` files.
  - Global note search across all visited domains.

- **History & Data Management**:
  - Comprehensive history log of saved website records.
  - Filter records by detected technology badges.
  - Instant search across domain, URL, title, notes, and technologies.
  - Detail view modal displaying complete metadata and screenshot previews.
  - Export records as **JSON** or **CSV**.
  - Delete individual records or clear entire history.

- **Cross-Browser Compatibility**:
  - Full Manifest V3 support for **Mozilla Firefox**, **Google Chrome**, and **Microsoft Edge**.
  - Polyfilled cross-browser WebExtension storage and messaging wrappers.

---

## 🛠️ Installation & Building

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Extension
```bash
npm run build
```
This compiles TypeScript and bundles all assets into the `dist/` directory.

---

## 🌐 Loading into Firefox, Chrome & Edge

### 🦊 Mozilla Firefox:
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `dist/manifest.json` inside this repository.

### 🌐 Google Chrome:
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the `dist/` folder inside this repository.

### 🌊 Microsoft Edge:
1. Open Edge and navigate to `edge://extensions`.
2. Enable **Developer mode** toggle on the left sidebar.
3. Click **Load unpacked**.
4. Select the `dist/` folder inside this repository.

---

## 📝 Usage Guide

1. **Recon Tab**: Click the extension icon on any active tab. Click **Save Recon Record** to capture metadata, detected technologies, screenshot, and current note.
2. **Notepad Tab**: Write domain-specific notes. Notes auto-save continuously while typing. Toggle between Edit mode and Markdown preview mode.
3. **History Tab**: View past website scans, filter by technology stack, view full detail modals, and click **JSON** or **CSV** to export your recon data.

---

## 📄 License
MIT License.
