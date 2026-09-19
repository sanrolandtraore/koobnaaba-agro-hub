import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Key,
  Globe,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  getSupabaseConfig,
  setSupabaseConfig,
  clearSupabaseConfig,
  testBackendConnection,
  DEFAULT_SUPABASE_URL,
} from "@/integrations/supabase/client";

interface BackendConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BackendConnectionModal = ({
  open,
  onOpenChange,
}: BackendConnectionModalProps) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.rawKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setKey(cfg.rawKey);
      setTestResult(null);
    }
  }, [open]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testBackendConnection(url, key);
    setTestResult(result);
    setTesting(false);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleSave = () => {
    if (!key.trim()) {
      toast.error("Veuillez saisir votre clé Anon avant de valider.");
      return;
    }
    setSupabaseConfig(url, key);
    toast.success("Configuration du backend enregistrée ! Reconnexion...");
    onOpenChange(false);
  };

  const handleReset = () => {
    clearSupabaseConfig();
    toast.info("Configuration réinitialisée au mode local.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Connexion au Backend (Supabase)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Synchronisation des données de l'exploitation agricole & élevage
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Statut actuel */}
          <div className="p-3.5 rounded-xl border bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {currentConfig.isConfigured ? (
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-amber-500" />
              )}
              <div>
                <p className="text-xs font-semibold">
                  {currentConfig.isConfigured
                    ? "Backend Supabase Configuré"
                    : "Mode Hors-ligne / Clé Anon en attente"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                  {currentConfig.url}
                </p>
              </div>
            </div>
            <Badge
              variant={currentConfig.isConfigured ? "default" : "secondary"}
              className="text-[10px] uppercase font-bold"
            >
              {currentConfig.isConfigured ? (
                <span className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" /> Connecté
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" /> Local / Offline
                </span>
              )}
            </Badge>
          </div>

          {/* Formulaire URL & Clé */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="supabase-url" className="text-xs font-medium flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                URL du projet Supabase
              </Label>
              <Input
                id="supabase-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://votre-projet.supabase.co"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supabase-key" className="text-xs font-medium flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-muted-foreground" />
                Clé API Publique (anon / publishable key)
              </Label>
              <Input
                id="supabase-key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Cette clé est sécurisée côté client avec les politiques de sécurité Row Level Security (RLS).
              </p>
            </div>
          </div>

          {/* Diagnostic de test */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {testResult.success ? "Test réussi" : "Erreur de connexion"}
                </p>
                <p className="mt-0.5 text-[11px] opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Guide d'aide */}
          <div className="rounded-xl border p-3 bg-card text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Où trouver ces informations ?</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] pl-1">
              <li>Connectez-vous à votre compte sur <span className="font-medium text-foreground">supabase.com</span></li>
              <li>Ouvrez le projet <span className="font-mono text-primary font-medium">dtfirensnobimhjqlngl</span> (ou votre projet)</li>
              <li>Allez dans <span className="font-medium text-foreground">Project Settings &gt; API</span></li>
              <li>Copiez l'URL et la clé <span className="font-mono text-xs font-medium">anon public</span></li>
            </ol>
            <div className="pt-1">
              <a
                href="https://supabase.com/dashboard/project/dtfirensnobimhjqlngl/settings/api"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                Ouvrir la console Supabase du projet <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={testing}
            className="w-full sm:w-auto text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${testing ? "animate-spin" : ""}`} />
            {testing ? "Vérification..." : "Tester la connexion"}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentConfig.isConfigured && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Réinitialiser
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="text-xs gap-1.5 font-medium"
            >
              Enregistrer & Connecter
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default BackendConnectionModal;
