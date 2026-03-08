import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";

interface PremiumGateProps {
  feature: "export" | "ai" | "analytics";
  children: ReactNode;
  fallbackMessage?: string;
}

const featureLabels: Record<string, string> = {
  export: "l'export de données",
  ai: "l'assistant IA",
  analytics: "les analyses avancées",
};

const PremiumGate = ({ feature, children, fallbackMessage }: PremiumGateProps) => {
  const { isPremium, loading } = useSubscription();

  if (loading) return <>{children}</>;

  if (isPremium) return <>{children}</>;

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-heading font-bold text-foreground">
          Fonctionnalité Premium
        </h3>
        <p className="text-muted-foreground max-w-md">
          {fallbackMessage || `L'accès à ${featureLabels[feature]} est réservé aux abonnés Premium. Passez au plan Premium pour débloquer toutes les fonctionnalités.`}
        </p>
        <Link to="/dashboard/pricing">
          <Button className="gap-2">
            <Crown className="h-4 w-4" />
            Passer au Premium
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default PremiumGate;
