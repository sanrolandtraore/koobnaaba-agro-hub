import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import { registerSW } from "virtual:pwa-register";

// Gestion automatique des versions et préchargements de chunks Vite
// En cas de mise à jour ou de cache CDN, évite le blocage "Unable to preload CSS/JS"
window.addEventListener("vite:preload-error", (event) => {
  console.warn("NAFA -AGRITECH : Nouveau déploiement détecté, rechargement automatique:", event);
  window.location.reload();
});

const root = document.getElementById("root");

// Enregistrement PWA automatique avec rechargement fluide
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log("NAFA -AGRITECH PWA : Nouvelle mise à jour disponible");
    },
    onOfflineReady() {
      console.log("NAFA -AGRITECH PWA : Prêt pour le fonctionnement hors-ligne");
    },
  });
}

if (!root) {
  throw new Error("NAFA -AGRITECH: élément #root introuvable");
}

createRoot(root).render(<App />);
