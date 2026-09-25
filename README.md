# Web Recon Recorder

A powerful cross-browser extension for **Firefox**, **Chrome**, and **Edge** built with **React**, **TypeScript**, **Vite**, and **Manifest V3** for recording reconnaissance metadata about websites during security research, bug bounty workflows, or technical documentation. Includes a domain-aware built-in Notepad with auto-save, search, pinning, and exports.

Can also be deployed directly to **Vercel** as a live interactive web app demo!

![Web Recon Recorder](public/icons/icon128.png)

---

## 🚀 Features

- **Automated Website Reconnaissance**:
  - Detect current URL, domain name, page title, and meta description.
  - Detect technology stacks in real time (React, Next.js, Vercel, Vue.js, Nuxt.js, Angular, Svelte, WordPress, Shopify, Tailwind CSS, Bootstrap, jQuery, Vite, Google Analytics, Font Awesome).
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

- **Cross-Browser & Vercel Hosting**:
  - Full Manifest V3 support for **Mozilla Firefox**, **Google Chrome**, and **Microsoft Edge**.
  - Single-click deployment support for **Vercel** via `vercel.json` and Vite `index.html`.

---

## 🔺 Deploying to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Vercel Dashboard / Git
1. Push this repository to GitHub or GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the repository. Vercel automatically detects the `vite` framework and `vercel.json`.
4. Click **Deploy**.

---

## 🛠️ Local Development & Building

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Project
```bash
npm run build
```
This outputs `dist/index.html` (for Vercel deployment) and extension files (`manifest.json`, `popup.html`, `background.js`, `content.js`).

---

## 🌐 Loading into Browsers (Unpacked Extension)

### 🦊 Mozilla Firefox:
1. Navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `dist/manifest.json`.

### 🌐 Google Chrome / 🌊 Microsoft Edge:
1. Navigate to `chrome://extensions` or `edge://extensions`.
2. Enable **Developer Mode**.
3. Click **Load unpacked** and select the `dist/` directory.

---

## 📄 License
MIT License.
