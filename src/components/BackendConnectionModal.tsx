import { Database, Lock, Wifi, WifiOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getSupabaseConfig } from "@/integrations/supabase/client";

interface BackendConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BackendConnectionModal = ({ open, onOpenChange }: BackendConnectionModalProps) => {
  const config = getSupabaseConfig();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary"><Database className="h-5 w-5" /></div>
            <div>
              <DialogTitle className="text-lg font-bold">Connexion au Backend (Supabase)</DialogTitle>
              <DialogDescription className="text-xs">Synchronisation sécurisée des données de l'exploitation agricole & élevage</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3.5 rounded-xl border bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`h-3 w-3 rounded-full ${config.isConfigured ? "bg-emerald-500" : "bg-amber-500"}`} />
              <div>
                <p className="text-xs font-semibold">{config.isConfigured ? "Backend Supabase configuré" : "Mode hors-ligne / configuration en attente"}</p>
                <p className="text-[11px] text-muted-foreground truncate max-w-[280px]">{config.url}</p>
              </div>
            </div>
            <Badge variant={config.isConfigured ? "default" : "secondary"} className="text-[10px] uppercase font-bold">
              {config.isConfigured ? <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> Configuré</span> : <span className="flex items-center gap-1"><WifiOff className="h-3 w-3" /> Hors-ligne</span>}
            </Badge>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 font-semibold text-sm"><Lock className="h-4 w-4 text-emerald-600" /> Aucune clé API à saisir ici</div>
            <p className="mt-2 text-xs text-muted-foreground">
              La clé publique Supabase utilisée par le navigateur est injectée au moment du déploiement. Elle n'est pas demandée, affichée ni enregistrée par cette interface.
            </p>
          </div>

          <div className="rounded-xl border p-4 bg-card text-xs space-y-2">
            <p className="font-medium">Configuration technique</p>
            <p className="text-muted-foreground">Les variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY sont gérées dans les variables d'environnement du déploiement. Les secrets serveur ne doivent jamais être exposés au frontend.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackendConnectionModal;
