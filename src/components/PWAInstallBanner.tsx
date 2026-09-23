import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user dismissed previously in this session
      const dismissed = sessionStorage.getItem("koobnaaba_pwa_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("koobnaaba_pwa_dismissed", "true");
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] animate-slide-in">
      <div className="bg-card/95 backdrop-blur-md border border-primary/30 p-4 rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-heading font-bold text-sm text-foreground">NAFA -AGRITECH</h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-semibold">PWA</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">La technologie au service de l'agriculture africaine</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="gradient-primary text-primary-foreground font-semibold text-xs h-9 px-3.5 rounded-xl shadow-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Installer
          </Button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fermer"
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
