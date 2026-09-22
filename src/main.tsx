import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

const root = document.getElementById("root");

// Enregistrement PWA automatique avec rechargement fluide
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log("KoobNaaba PWA : Nouvelle mise à jour disponible");
    },
    onOfflineReady() {
      console.log("KoobNaaba PWA : Prêt pour le fonctionnement hors-ligne");
    },
  });
}

function showFatalError(error: unknown) {
  if (!root) return;
  const message = error instanceof Error ? error.message : String(error);
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#faf8f5;font-family:system-ui,sans-serif;color:#1f2937">
      <div style="max-width:680px;width:100%;background:white;border:1px solid #e5e7eb;border-radius:16px;padding:28px;box-shadow:0 10px 30px rgba(0,0,0,.08)">
        <h1 style="margin:0 0 10px;font-size:24px;color:#166534">KoobNaaba</h1>
        <p style="margin:0 0 16px;color:#b91c1c;font-weight:600">Le chargement de l'application a rencontré un imprévu.</p>
        <pre style="white-space:pre-wrap;overflow:auto;background:#f3f4f6;border-radius:10px;padding:14px;font-size:13px">${message.replace(/[&<>]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c] || c))}</pre>
        <button onclick="location.reload()" style="margin-top:16px;padding:12px 20px;border:0;border-radius:10px;background:#166534;color:white;font-weight:600;font-size:15px;cursor:pointer">Actualiser</button>
      </div>
    </div>`;
  console.error("KoobNaaba bootstrap error:", error);
}

async function bootstrap() {
  if (!root) {
    throw new Error("KoobNaaba: #root introuvable");
  }

  await import("./index.css");

  const { default: App } = await import("./App");
  createRoot(root).render(<App />);
}

bootstrap().catch(showFatalError);
