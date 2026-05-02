import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumericKeypad } from "@/components/NumericKeypad";
import { toast } from "sonner";
import { Lock, WifiOff, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { hasPin } from "@/lib/pinAuth";

const PinUnlock = () => {
  const navigate = useNavigate();
  const { user, loading, unlockWithPin, getPinIdentifier, signOut } = useAuth();
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOn = () => setIsOnline(true);
    const goOff = () => setIsOnline(false);
    window.addEventListener("online", goOn);
    window.addEventListener("offline", goOff);
    return () => {
      window.removeEventListener("online", goOn);
      window.removeEventListener("offline", goOff);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const exists = await hasPin();
      if (!exists) {
        navigate("/auth", { replace: true });
        return;
      }
      const id = await getPinIdentifier();
      setIdentifier(id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If session already valid (auto-login total succeeded), go straight to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (pin.length === 4 && !submitting) {
      void handleUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleUnlock = async () => {
    setSubmitting(true);
    const res = await unlockWithPin(pin);
    setSubmitting(false);
    if (!res.ok) {
      const next = attempts + 1;
      setAttempts(next);
      toast.error(res.error || "Code PIN incorrect");
      setPin("");
      if (next >= 5) {
        toast.error("Trop d'essais. Connectez-vous avec votre mot de passe.");
        navigate("/auth", { replace: true });
      }
      return;
    }
    toast.success("Bienvenue !");
    navigate("/dashboard", { replace: true });
  };

  const maskedId = identifier
    ? identifier.includes("@koobnaaba.local")
      ? `Tél. •••${identifier.replace("@koobnaaba.local", "").slice(-3)}`
      : identifier.replace(/^(.{2}).*(@.*)$/, "$1•••$2")
    : "";

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-md border-border/50 shadow-warm animate-fade-in">
        <CardHeader className="text-center space-y-3">
          <img src={logo} alt="KoobNaaba" className="mx-auto h-14 w-auto" />
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-heading">Entrez votre code PIN</CardTitle>
          <CardDescription>
            {maskedId && <span className="block font-medium text-foreground">{maskedId}</span>}
            <span className="text-xs">
              {!isOnline && (
                <span className="inline-flex items-center gap-1 text-amber-600 mr-2">
                  <WifiOff className="h-3 w-3" /> Hors-ligne
                </span>
              )}
              4 chiffres pour ouvrir l'application
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NumericKeypad value={pin} onChange={setPin} disabled={submitting} />

          {attempts > 0 && (
            <p className="text-center text-xs text-destructive">
              Essai {attempts}/5
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={() => navigate("/auth", { replace: true })}
              disabled={submitting}
            >
              Utiliser le mot de passe
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => { await signOut(); navigate("/auth", { replace: true }); }}
              disabled={submitting}
              className="text-muted-foreground"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Changer de compte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinUnlock;
