import { ReactNode } from "react";

interface PremiumGateProps {
  feature?: "export" | "ai" | "analytics";
  children: ReactNode;
  fallbackMessage?: string;
}

// Toutes les fonctionnalités sont désormais gratuites : aucun blocage.
const PremiumGate = ({ children }: PremiumGateProps) => <>{children}</>;

export default PremiumGate;
