import { useState } from "react";
import { Outlet } from "react-router-dom";
import { RoleSidebar, SidebarNavContent } from "@/components/RoleSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import logo from "@/assets/logo.png";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useSubscription } from "@/hooks/useSubscription";

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const { isPremium } = useSubscription();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <RoleSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex md:hidden items-center gap-3 border-b border-border px-4 py-3 bg-sidebar">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 text-sidebar-foreground">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r border-sidebar-border">
              <SidebarNavContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <img src={logo} alt="KoobNaaba" className="h-8 w-auto" />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl py-4 px-4 md:py-6 md:px-8">
          <Outlet />
          </div>
        </main>
      </div>

      <VoiceAssistant />
    </div>
  );
};

export default DashboardLayout;
