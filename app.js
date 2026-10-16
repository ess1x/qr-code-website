const $ = (id) => document.getElementById(id);
const fields = $("fields");
const mainInput = $("mainInput");
const qrNode = $("qrcode");
const placeholder = $("qrPlaceholder");
const downloadBtn = $("downloadBtn");
const message = $("message");
let currentType = "url";
let deferredInstall = null;
let qrInstance = null;

const templates = {
  url: { label: "Website URL", placeholder: "https://example.com", value: "https://qr-code.tn", type: "url", helper: "Include https:// for the best results." },
  text: { label: "Your text", placeholder: "Write something to share...", value: "", type: "text", helper: "Keep it short for a simpler QR code." },
  wifi: { label: "Network name (SSID)", placeholder: "Your Wi-Fi name", value: "", type: "text", helper: "The password is encoded into the QR. Share it only with people you trust." },
  email: { label: "Email address", placeholder: "hello@example.com", value: "", type: "email", helper: "Scanning opens the user's email app." },
  phone: { label: "Phone number", placeholder: "+216 12 345 678", value: "", type: "tel", helper: "Scanning opens the phone dialer." }
};

function showFields() {
  const t = templates[currentType];
  let html = "";
  if (currentType === "wifi") {
    html = `<label class="field-label" for="wifiName">Network name (SSID)</label><div class="input-wrap"><span class="input-icon">⌁</span><input id="wifiName" type="text" placeholder="Your Wi-Fi name" autocomplete="off"></div>
    <label class="field-label" for="wifiPassword" style="margin-top:12px">Password</label><div class="input-wrap"><span class="input-icon">⌑</span><input id="wifiPassword" type="password" placeholder="Wi-Fi password" autocomplete="off"></div>
    <label class="field-label" for="wifiSecurity" style="margin-top:12px">Security</label><div class="input-wrap"><select id="wifiSecurity" style="width:100%;background:transparent;border:0;outline:0;color:#f7f1ff;padding:12px 0"><option value="WPA" style="background:#170c24">WPA/WPA2</option><option value="WEP" style="background:#170c24">WEP</option><option value="nopass" style="background:#170c24">No password</option></select></div>`;
  } else {
    html = `<label class="field-label" for="mainInput">${t.label}</label><div class="input-wrap"><span class="input-icon">${currentType === "email" ? "✉" : currentType === "phone" ? "⌕" : currentType === "text" ? "☷" : "↗"}</span><input id="mainInput" type="${t.type}" placeholder="${t.placeholder}" ${currentType === "url" ? 'value="https://qr-code.tn" autocomplete="url"' : 'autocomplete="off"'}></div>`;
  }
  html += `<p class="helper">${t.helper}</p>`;
  fields.innerHTML = html;
  clearMessage();
  updateQR();
}

function contentValue() {
  if (currentType === "wifi") {
    const ssid = $("wifiName")?.value.trim() || "";
    const password = $("wifiPassword")?.value || "";
    const security = $("wifiSecurity")?.value || "WPA";
    if (!ssid) return "";
    const esc = (s) => s.replace(/([\\;,:"])/g, "\\$1");
    return `WIFI:T:${security};S:${esc(ssid)};P:${esc(password)};;`;
  }
  const value = $("mainInput")?.value.trim() || "";
  if (!value) return "";
  if (currentType === "url") {
    if (!/^https?:\/\//i.test(value)) return `https://${value}`;
    return value;
  }
  if (currentType === "email") return `mailto:${value}`;
  if (currentType === "phone") return `tel:${value.replace(/[^\d+*#,;]/g, "")}`;
  return value;
}

function clearMessage() { message.textContent = ""; message.className = "message"; }

function updateQR() {
  const content = contentValue();
  if (!content || typeof QRCode === "undefined") {
    qrNode.innerHTML = "";
    qrNode.style.display = "none";
    placeholder.style.display = "flex";
    downloadBtn.disabled = true;
    if (typeof QRCode === "undefined") message.textContent = "QR library did not load. Check your internet connection and refresh.";
    return;
  }
  try {
    qrNode.innerHTML = "";
    const size = Number($("qrSize").value);
    const dark = $("qrColor").value;
    const light = $("bgColor").value;
    qrNode.style.display = "block";
    placeholder.style.display = "none";
    qrInstance = new QRCode(qrNode, {
      text: content, width: size, height: size,
      colorDark: dark, colorLight: light,
      correctLevel: QRCode.CorrectLevel.H
    });
    downloadBtn.disabled = false;
    clearMessage();
  } catch (err) {
    qrNode.innerHTML = "";
    qrNode.style.display = "none";
    placeholder.style.display = "flex";
    downloadBtn.disabled = true;
    message.textContent = "This content is too long or cannot be encoded. Try a shorter text.";
  }
}

function validateAndGenerate() {
  const content = contentValue();
  if (!content) {
    message.textContent = currentType === "wifi" ? "Enter your Wi-Fi network name first." : "Enter some content first to create your QR code.";
    message.className = "message";
    return;
  }
  if (currentType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("mainInput").value.trim())) {
    message.textContent = "Enter a valid email address.";
    return;
  }
  if (currentType === "url" && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test($("mainInput").value.trim())) {
    message.textContent = "Enter a valid website, like example.com.";
    return;
  }
  updateQR();
  if (!downloadBtn.disabled) { message.textContent = "Your QR code is ready."; message.className = "message success"; }
}

function downloadQR() {
  const canvas = qrNode.querySelector("canvas");
  const img = qrNode.querySelector("img");
  const finish = (dataUrl) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qr-code-tn.png";
    document.body.appendChild(a); a.click(); a.remove();
    message.textContent = "Download started.";
    message.className = "message success";
  };
  if (canvas) finish(canvas.toDataURL("image/png"));
  else if (img && img.src) {
    const image = new Image();
    image.onload = () => {
      const size = Number($("qrSize").value);
      const c = document.createElement("canvas"); c.width = size; c.height = size;
      const ctx = c.getContext("2d"); ctx.fillStyle = $("bgColor").value; ctx.fillRect(0, 0, size, size);
      ctx.drawImage(image, 0, 0, size, size); finish(c.toDataURL("image/png"));
    };
    image.src = img.src;
  }
}

document.querySelectorAll(".type-card").forEach((btn) => btn.addEventListener("click", () => {
  document.querySelectorAll(".type-card").forEach((b) => b.classList.toggle("active", b === btn));
  currentType = btn.dataset.type;
  showFields();
}));
fields.addEventListener("input", () => { updateQR(); });
fields.addEventListener("change", () => { updateQR(); });
$("generateBtn").addEventListener("click", validateAndGenerate);
downloadBtn.addEventListener("click", downloadQR);
$("qrColor").addEventListener("input", (e) => { $("qrColorText").textContent = e.target.value.toUpperCase(); updateQR(); });
$("bgColor").addEventListener("input", (e) => { $("bgColorText").textContent = e.target.value.toUpperCase(); updateQR(); });
$("qrSize").addEventListener("input", (e) => { $("sizeValue").textContent = `${e.target.value} px`; updateQR(); });
$("year").textContent = new Date().getFullYear();

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault(); deferredInstall = event; $("installBtn").hidden = false;
});
$("installBtn").addEventListener("click", async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  $("installBtn").hidden = true;
});
window.addEventListener("appinstalled", () => { $("installBtn").hidden = true; });

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
showFields();
