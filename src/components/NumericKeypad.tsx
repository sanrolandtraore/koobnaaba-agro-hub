import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumericKeypadProps {
  value: string;
  onChange: (next: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

export function NumericKeypad({ value, onChange, maxLength = 4, disabled }: NumericKeypadProps) {
  const press = (digit: string) => {
    if (disabled) return;
    if (value.length >= maxLength) return;
    onChange(value + digit);
  };
  const back = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="space-y-4">
      {/* Dots indicator */}
      <div className="flex justify-center gap-3" aria-label="Indicateur PIN">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 w-4 rounded-full border-2 transition-all",
              i < value.length ? "bg-primary border-primary scale-110" : "border-muted-foreground/40",
            )}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            disabled={disabled}
            className="h-16 rounded-2xl bg-card border-2 border-border text-2xl font-bold text-foreground hover:bg-primary/10 hover:border-primary active:scale-95 transition-all disabled:opacity-50"
          >
            {k}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => press("0")}
          disabled={disabled}
          className="h-16 rounded-2xl bg-card border-2 border-border text-2xl font-bold text-foreground hover:bg-primary/10 hover:border-primary active:scale-95 transition-all disabled:opacity-50"
        >
          0
        </button>
        <button
          type="button"
          onClick={back}
          disabled={disabled || value.length === 0}
          className="h-16 rounded-2xl bg-muted border-2 border-border flex items-center justify-center text-foreground hover:bg-destructive/10 hover:border-destructive active:scale-95 transition-all disabled:opacity-30"
          aria-label="Effacer"
        >
          <Delete className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
