# 📸 ScreenSnap — One Click Screenshot Extension

A sleek, cross-browser extension to capture screenshots with a single click. Choose between **Visible Area** or **Full Page** capture — no sign-ups, no servers, everything stays local.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blueviolet?style=flat-square)
![Chrome](https://img.shields.io/badge/Chrome-✓-brightgreen?style=flat-square&logo=googlechrome&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-✓-brightgreen?style=flat-square&logo=microsoftedge&logoColor=white)
![Brave](https://img.shields.io/badge/Brave-✓-brightgreen?style=flat-square&logo=brave&logoColor=white)
![Opera](https://img.shields.io/badge/Opera-✓-brightgreen?style=flat-square&logo=opera&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📷 **Visible Area** | Captures exactly what's on your screen right now |
| 📸 **Full Page** | Scrolls the entire page and stitches it into one image |
| 🎨 **Premium UI** | Dark glassmorphism popup with glow effects & animations |
| 📊 **Progress Bar** | Real-time progress indicator for full-page captures |
| 💾 **Auto-Download** | Saves as `screenshot-YYYY-MM-DD-HHmmss.png` |
| 🔒 **Privacy First** | No data leaves your browser — zero tracking |

---

## 🚀 Installation

### From Source (Developer Mode)

1. **Clone** this repository:
   ```bash
   git clone https://github.com/Mr-Madhukar/ScreenshotExtension.git
   ```

2. Open your browser's extensions page:
   - **Chrome** → `chrome://extensions/`
   - **Edge** → `edge://extensions/`
   - **Brave** → `brave://extensions/`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **"Load unpacked"** and select the `ScreenshotExtension` folder

5. The 📸 icon appears in your toolbar — you're ready to go!

---

## 🎯 How to Use

1. Navigate to any webpage
2. Click the **ScreenSnap** icon in the toolbar
3. Choose your capture mode:
   - **📷 Visible Area** — instant capture of the current viewport
   - **📸 Full Page** — captures the entire scrollable page
4. Screenshot auto-downloads to your default folder

---

## 🗂️ Project Structure

```
ScreenshotExtension/
├── manifest.json      # Extension config (Manifest V3)
├── popup.html         # Popup UI
├── popup.css          # Dark glassmorphism styles
├── popup.js           # Popup interaction logic
├── background.js      # Capture & stitch service worker
├── content.js         # Page scroll & dimension helper
├── icons/
│   ├── icon16.png     # Toolbar icon
│   ├── icon48.png     # Extensions page icon
│   └── icon128.png    # Chrome Web Store icon
└── README.md
```

---

## 🛠️ Tech Stack

- **Manifest V3** — Latest extension platform standard
- **Chrome Extensions API** — `tabs.captureVisibleTab`, `scripting`, `downloads`
- **OffscreenCanvas** — High-performance image stitching in the background
- **Vanilla JS/CSS** — Zero dependencies, fast and lightweight

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Mr-Madhukar">Mr-Madhukar</a>
</p>
