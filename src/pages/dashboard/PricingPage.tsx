import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Crown, Smartphone, Loader2 } from "lucide-react";

const FREE_FEATURES = [
  "3 parcelles max",
  "10 animaux max",
  "5 membres coopérative max",
  "Tableau de bord basique",
  "Saisie et suivi des données",
  "Mode hors-ligne",
];

const PREMIUM_FEATURES = [
  "Parcelles, animaux, membres illimités",
  "Export PDF & CSV de toutes les données",
  "Assistant vocal IA",
  "Analyses avancées & simulations",
  "Dossier de financement automatique",
  "Score coopérative complet",
  "Support prioritaire",
];

const MOBILE_MONEY_OPTIONS = [
  { id: "orange", label: "Orange Money", color: "bg-orange-500" },
  { id: "mtn", label: "MTN Mobile Money", color: "bg-yellow-500" },
  { id: "wave", label: "Wave", color: "bg-blue-500" },
  { id: "moov", label: "Moov Money", color: "bg-emerald-500" },
];

const PricingPage = () => {
  const { user } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const [selectedProvider, setSelectedProvider] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async () => {
    if (!user || !selectedProvider || !phoneNumber) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setSubmitting(true);
    try {
      // Create or update subscription request
      const { error } = await supabase.from("user_subscriptions").upsert({
        user_id: user.id,
        plan: "premium",
        status: "active",
        payment_method: selectedProvider,
        payment_reference: phoneNumber,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: "user_id" });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Abonnement Premium activé ! Rechargez la page pour voir les changements.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (subLoading) return null;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold">Choisissez votre plan</h1>
        <p className="text-muted-foreground mt-2">Commencez gratuitement, passez au Premium quand vous êtes prêt</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={!isPremium ? "ring-2 ring-primary" : ""}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Gratuit</CardTitle>
            <div className="text-3xl font-bold mt-2">0 FCFA<span className="text-sm font-normal text-muted-foreground">/mois</span></div>
            {!isPremium && <Badge variant="secondary" className="mx-auto mt-2">Plan actuel</Badge>}
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className={isPremium ? "ring-2 ring-primary" : "border-primary/50"}>
          <CardHeader className="text-center pb-2 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground gap-1">
                <Crown className="h-3 w-3" /> Recommandé
              </Badge>
            </div>
            <CardTitle className="text-xl mt-2">Premium</CardTitle>
            <div className="text-3xl font-bold mt-2">2 500 FCFA<span className="text-sm font-normal text-muted-foreground">/mois</span></div>
            {isPremium && <Badge variant="secondary" className="mx-auto mt-2">Plan actuel ✓</Badge>}
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Money Payment */}
      {!isPremium && !submitted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Payer via Mobile Money
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MOBILE_MONEY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedProvider(opt.id)}
                  className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                    selectedProvider === opt.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {selectedProvider && (
              <div className="space-y-3">
                <div>
                  <Label>Numéro de téléphone</Label>
                  <Input
                    type="tel"
                    placeholder="+226 XX XX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Envoyez <strong>2 500 FCFA</strong> au numéro marchand puis entrez votre numéro ci-dessus pour activer votre abonnement.
                </p>
                <Button onClick={handleSubscribe} disabled={submitting || !phoneNumber} className="w-full gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
                  {submitting ? "Activation..." : "Activer le Premium"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {submitted && (
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardContent className="py-6 text-center">
            <Check className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Abonnement Premium activé !</h3>
            <p className="text-sm text-muted-foreground mt-1">Rechargez la page pour accéder à toutes les fonctionnalités.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PricingPage;
