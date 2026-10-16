# QR code.tn — QR Studio

A responsive Progressive Web App (PWA) QR generator built with HTML, CSS, and JavaScript.

## Features
- Website, text, Wi-Fi, email, and phone QR codes
- Live preview and custom foreground/background colors
- PNG export at 200–800 px
- Responsive dark/purple design
- PWA manifest and service worker for installability and caching of app files

## Run locally on Windows
You need Python installed, or use Node.js.

### Option A: Python
Open Command Prompt in this folder and run:
```bat
py -m http.server 8080
```
Then open http://localhost:8080

### Option B: Node.js
```bat
npx serve .
```

PWA installation requires localhost or an HTTPS website. Opening `index.html` directly as a file will not enable service workers or installation. QR generation uses qrcodejs loaded from a CDN, so the first load needs an internet connection.

## Deploy
Upload the project files to a GitHub repository and create a **Static Site** on Render:
- Build Command: leave blank
- Publish Directory: `.`
- No environment variables required

After deploy, open the HTTPS URL on your phone. On Android, use the browser menu and choose Install app / Add to Home screen. On iPhone, open in Safari, tap Share, then Add to Home Screen. On desktop Chromium browsers, use the install icon or browser menu if offered.

## Privacy
QR data is processed in the browser. Wi-Fi QR codes include the password you enter, so only share those codes with people you trust.
