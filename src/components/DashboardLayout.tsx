import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { RoleSidebar, SidebarNavContent } from "@/components/RoleSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, Wifi, WifiOff, Sparkles, Smartphone } from "lucide-react";
import logo from "@/assets/logo.png";
import VoiceAssistant from "@/components/VoiceAssistant";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { useSubscription } from "@/hooks/useSubscription";

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const { isPremium } = useSubscription();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <RoleSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Top header Premium sans barres de navigation superflues */}
        <header className="flex items-center justify-between border-b border-border/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 bg-card/90 backdrop-blur-md shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-foreground h-11 w-11 rounded-xl">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menu principal</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 sm:w-80 p-0 border-r border-sidebar-border">
                <SidebarNavContent onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <img src={logo} alt="NAFA -AGRITECH" className="h-8 sm:h-9 w-auto lg:hidden" />
            <span className="hidden lg:inline-block font-heading font-extrabold text-base text-foreground/90">
              NAFA <span className="text-emerald-600 dark:text-emerald-400">-AGRITECH</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Indicateur de connectivité en direct */}
            <Badge
              variant="outline"
              className={`gap-1.5 py-1 px-3 text-xs font-semibold rounded-full border transition-all ${
                isOnline
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300"
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                  <span>En ligne</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-600" />
                  <span>Mode Hors-ligne actif</span>
                </>
              )}
            </Badge>

            {isPremium && (
              <Badge className="hidden sm:inline-flex bg-primary/15 text-primary border-primary/20 gap-1 text-xs font-semibold py-1 px-2.5 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Premium
              </Badge>
            )}
          </div>
        </header>

        {/* Main content avec typographie confortable et aérée */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl py-4 px-3.5 sm:py-6 sm:px-6 lg:py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {isPremium && <VoiceAssistant />}
    </div>
  );
};

export default DashboardLayout;
