import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Wifi, WifiOff } from "lucide-react";
import { getSupabaseConfig } from "@/integrations/supabase/client";
import BackendConnectionModal from "./BackendConnectionModal";

interface BackendStatusButtonProps {
  className?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const BackendStatusButton = ({
  className = "",
  variant = "outline",
  size = "sm",
}: BackendStatusButtonProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const config = getSupabaseConfig();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setModalOpen(true)}
        className={`text-xs gap-1.5 font-medium transition-all ${
          config.isConfigured
            ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            : "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
        } ${className}`}
        title="Gérer la connexion au backend de données (Supabase)"
      >
        <Database className="h-3.5 w-3.5" />
        {config.isConfigured ? (
          <span className="hidden sm:inline flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            Backend Connecté
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block animate-pulse" />
            Connecter le Backend
          </span>
        )}
      </Button>

      <BackendConnectionModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
};
export default BackendStatusButton;
