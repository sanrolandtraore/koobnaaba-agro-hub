import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumericKeypad } from "@/components/NumericKeypad";
import { toast } from "sonner";
import { ShieldCheck, Smartphone } from "lucide-react";
import logo from "@/assets/logo.png";

const PinSetup = () => {
  const navigate = useNavigate();
  const { user, loading, setupPin } = useAuth();
  const [step, setStep] = useState<"choose" | "confirm">("choose");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (step === "choose" && pin.length === 4) {
      setStep("confirm");
    }
  }, [pin, step]);

  useEffect(() => {
    if (step === "confirm" && confirm.length === 4) {
      void handleConfirm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm, step]);

  const handleConfirm = async () => {
    if (pin !== confirm) {
      toast.error("Les codes PIN ne correspondent pas");
      setConfirm("");
      setPin("");
      setStep("choose");
      return;
    }
    setSubmitting(true);
    const res = await setupPin(pin);
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error || "Erreur configuration PIN");
      setConfirm("");
      setPin("");
      setStep("choose");
      return;
    }
    toast.success("Code PIN configuré ! Connexion rapide activée.");
    navigate("/dashboard", { replace: true });
  };

  const handleSkip = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-md border-border/50 shadow-warm animate-fade-in">
        <CardHeader className="text-center space-y-3">
          <img src={logo} alt="KoobNaaba" className="mx-auto h-14 w-auto" />
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-heading">
            {step === "choose" ? "Créez votre code PIN" : "Confirmez votre code PIN"}
          </CardTitle>
          <CardDescription>
            {step === "choose"
              ? "4 chiffres pour vous reconnecter rapidement sur ce téléphone."
              : "Saisissez à nouveau le même code pour confirmer."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NumericKeypad
            value={step === "choose" ? pin : confirm}
            onChange={step === "choose" ? setPin : setConfirm}
            disabled={submitting}
          />

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="h-3.5 w-3.5" />
            <span>Lié uniquement à cet appareil</span>
          </div>

          <div className="flex flex-col gap-2">
            {step === "confirm" && (
              <Button
                variant="outline"
                onClick={() => { setConfirm(""); setPin(""); setStep("choose"); }}
                disabled={submitting}
              >
                Recommencer
              </Button>
            )}
            <Button variant="ghost" onClick={handleSkip} disabled={submitting}>
              Passer cette étape
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinSetup;
