import { createRoot } from "react-dom/client";

const root = document.getElementById("root");

function showFatalError(error: unknown) {
  if (!root) return;
  const message = error instanceof Error ? error.message : String(error);
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#faf8f5;font-family:system-ui,sans-serif;color:#1f2937">
      <div style="max-width:680px;width:100%;background:white;border:1px solid #e5e7eb;border-radius:16px;padding:28px;box-shadow:0 10px 30px rgba(0,0,0,.08)">
        <h1 style="margin:0 0 10px;font-size:22px">KoobNaaba</h1>
        <p style="margin:0 0 16px;color:#b91c1c;font-weight:600">Le chargement de l'application a échoué.</p>
        <pre style="white-space:pre-wrap;overflow:auto;background:#f3f4f6;border-radius:10px;padding:14px;font-size:12px">${message.replace(/[&<>]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c] || c))}</pre>
        <button onclick="location.reload()" style="margin-top:16px;padding:10px 16px;border:0;border-radius:10px;background:#2d6a4f;color:white;font-weight:600;cursor:pointer">Réessayer</button>
      </div>
    </div>`;
  console.error("KoobNaaba bootstrap error:", error);
}

async function bootstrap() {
  if (!root) {
    throw new Error("KoobNaaba: #root introuvable");
  }

  // Keep application imports behind the fatal-error guard so startup failures
  // render a diagnostic screen instead of an unexplained white screen.
  await import("./index.css");

  const { default: App } = await import("./App");
  createRoot(root).render(<App />);
}

bootstrap().catch(showFatalError);
