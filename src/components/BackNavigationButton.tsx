import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface BackNavigationButtonProps {
  /**
   * Chemin de repli si l'historique du navigateur est vide ou lors d'un accès direct par URL.
   * Par défaut "/dashboard" si on est dans le dashboard, sinon "/".
   */
  fallbackTo?: string;
  /**
   * Libellé du bouton (par défaut "Retour").
   */
  label?: string;
  /**
   * Style du bouton (outline, ghost, secondary, default).
   */
  variant?: "outline" | "ghost" | "secondary" | "default";
  /**
   * Taille du bouton.
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * Si true, masque le texte sur petits écrans pour n'afficher que l'icône flèche.
   */
  iconOnlyOnMobile?: boolean;
  /**
   * Masquer automatiquement si l'utilisateur est sur la page d'accueil du dashboard (/dashboard) ou du site (/).
   */
  hideOnRoot?: boolean;
  /**
   * Classes CSS additionnelles.
   */
  className?: string;
  /**
   * Callback facultatif exécuté avant le retour (annule si retourne false).
   */
  onBeforeBack?: () => boolean | void;
}

export const BackNavigationButton: React.FC<BackNavigationButtonProps> = ({
  fallbackTo,
  label = "Retour",
  variant = "outline",
  size = "sm",
  iconOnlyOnMobile = true,
  hideOnRoot = false,
  className,
  onBeforeBack,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isRoot = location.pathname === "/" || location.pathname === "/dashboard";
  if (hideOnRoot && isRoot) {
    return null;
  }

  const effectiveFallback =
    fallbackTo || (location.pathname === "/dashboard" ? "/" : location.pathname.startsWith("/dashboard") ? "/dashboard" : "/");

  const handleBack = () => {
    if (onBeforeBack && onBeforeBack() === false) {
      return;
    }

    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (window.history.length > 1 && !isRoot) {
      navigate(-1);
    } else {
      navigate(effectiveFallback);
    }
  };

  const buttonElement = (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-xl border-border text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-accent/80 transition-all shadow-2xs active:scale-95 shrink-0",
        size === "sm" ? "h-9 px-2.5 sm:px-3" : "",
        className
      )}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      <span className={iconOnlyOnMobile ? "hidden sm:inline" : "inline"}>
        {label}
      </span>
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {buttonElement}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Page précédente ({label})
      </TooltipContent>
    </Tooltip>
  );
};

export default BackNavigationButton;
