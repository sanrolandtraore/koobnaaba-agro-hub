import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Instant language switcher (FR/EN). The choice is persisted by i18next
 * in localStorage, no page reload required.
 */
const LanguageSelector = ({ className }: { className?: string }) => {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage === "en" ? "en" : "fr";

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("gap-2", className)}
      aria-label={t("common.language")}
      onClick={() => i18n.changeLanguage(current === "fr" ? "en" : "fr")}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span className="text-xs font-semibold uppercase">{current === "fr" ? "FR" : "EN"}</span>
    </Button>
  );
};

export default LanguageSelector;
