import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Instant language switcher (FR/EN). The choice is persisted by i18next
 * in localStorage, no page reload required.
 */
const LanguageSelector = ({ className }: { className?: string }) => {
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 text-muted-foreground", className)}>
      <Languages className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
      <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">FR • Français</span>
    </div>
  );
};

export default LanguageSelector;
