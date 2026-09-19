import { useState } from "react";
import { Outlet } from "react-router-dom";
import { RoleSidebar, SidebarNavContent } from "@/components/RoleSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import logo from "@/assets/logo.png";
import VoiceAssistant from "@/components/VoiceAssistant";
import BackendStatusButton from "@/components/BackendStatusButton";
import { useSubscription } from "@/hooks/useSubscription";

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const { isPremium } = useSubscription();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <RoleSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Top header (desktop & mobile) */}
        <header className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-background/95 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden shrink-0 text-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 border-r border-sidebar-border">
                <SidebarNavContent onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <img src={logo} alt="KoobNaaba" className="h-7 w-auto md:hidden" />
          </div>

          <div className="flex items-center gap-2">
            <BackendStatusButton />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl py-4 px-4 md:py-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {isPremium && <VoiceAssistant />}
    </div>
  );
};

export default DashboardLayout;
