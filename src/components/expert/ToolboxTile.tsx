import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: "primary" | "accent" | "secondary";
}

export function ToolboxTile({ to, icon: Icon, title, description, accent = "primary" }: Props) {
  return (
    <Link to={to} className="block">
      <Card className="h-full p-4 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
          accent === "primary" && "bg-primary/10 text-primary",
          accent === "accent" && "bg-accent/20 text-accent-foreground",
          accent === "secondary" && "bg-secondary text-secondary-foreground",
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </Card>
    </Link>
  );
}
