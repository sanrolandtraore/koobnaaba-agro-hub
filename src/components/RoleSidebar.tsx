import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sprout, LayoutDashboard, MapPin, Wheat, Activity, DollarSign, LogOut, User, Calculator,
  Users, Wrench, Package, CalendarDays, BarChart3, Download,
  Bug, Heart, Baby, Utensils, Wallet, Building2, Compass, Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string; icon: React.ElementType };

const agriculteurNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/farms", label: "Exploitations", icon: MapPin },
  { to: "/dashboard/parcels", label: "Parcelles", icon: MapPin },
  { to: "/dashboard/cycles", label: "Cycles culturaux", icon: Wheat },
  { to: "/dashboard/activities", label: "Activités", icon: Activity },
  { to: "/dashboard/harvests", label: "Récoltes & Lots", icon: Package },
  { to: "/dashboard/calendar", label: "Calendrier", icon: CalendarDays },
  { to: "/dashboard/workers", label: "Main d'œuvre", icon: Users },
  { to: "/dashboard/equipment", label: "Équipements", icon: Wrench },
  { to: "/dashboard/costs", label: "Coûts", icon: DollarSign },
  { to: "/dashboard/investment", label: "Investissement", icon: Calculator },
  { to: "/dashboard/analytics", label: "Analyse", icon: BarChart3 },
  { to: "/dashboard/export", label: "Export", icon: Download },
];

const eleveurNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/farms", label: "Exploitations", icon: MapPin },
  { to: "/dashboard/livestock", label: "Tableau élevage", icon: Bug },
  { to: "/dashboard/livestock/animals", label: "Animaux", icon: Bug },
  { to: "/dashboard/livestock/health", label: "Santé", icon: Heart },
  { to: "/dashboard/livestock/reproduction", label: "Reproduction", icon: Baby },
  { to: "/dashboard/livestock/feeding", label: "Alimentation", icon: Utensils },
  { to: "/dashboard/livestock/finance", label: "Comptabilité", icon: Wallet },
  { to: "/dashboard/workers", label: "Main d'œuvre", icon: Users },
  { to: "/dashboard/equipment", label: "Équipements", icon: Wrench },
  { to: "/dashboard/analytics", label: "Analyse", icon: BarChart3 },
  { to: "/dashboard/export", label: "Export", icon: Download },
];

const cooperativeNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/members", label: "Membres", icon: Users },
  { to: "/dashboard/farms", label: "Exploitations", icon: MapPin },
  { to: "/dashboard/harvests", label: "Collectes", icon: Package },
  { to: "/dashboard/costs", label: "Finances", icon: DollarSign },
  { to: "/dashboard/analytics", label: "Statistiques", icon: BarChart3 },
  { to: "/dashboard/export", label: "Export", icon: Download },
];

const agentNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/farms", label: "Exploitations suivies", icon: MapPin },
  { to: "/dashboard/parcels", label: "Parcelles", icon: MapPin },
  { to: "/dashboard/cycles", label: "Cycles culturaux", icon: Wheat },
  { to: "/dashboard/livestock", label: "Élevage", icon: Bug },
  { to: "/dashboard/calendar", label: "Calendrier", icon: CalendarDays },
  { to: "/dashboard/analytics", label: "Rapports", icon: BarChart3 },
  { to: "/dashboard/export", label: "Export", icon: Download },
];

const partenaireNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/analytics", label: "Statistiques", icon: BarChart3 },
  { to: "/dashboard/investment", label: "Investissements", icon: Calculator },
  { to: "/dashboard/export", label: "Rapports", icon: Download },
];

// Admin/manager/farmer/viewer get full menus (legacy)
const fullNav: NavItem[] = [...agriculteurNav];
const fullLivestockNav: NavItem[] = [
  { to: "/dashboard/livestock", label: "Tableau élevage", icon: Bug },
  { to: "/dashboard/livestock/animals", label: "Animaux", icon: Bug },
  { to: "/dashboard/livestock/health", label: "Santé", icon: Heart },
  { to: "/dashboard/livestock/reproduction", label: "Reproduction", icon: Baby },
  { to: "/dashboard/livestock/feeding", label: "Alimentation", icon: Utensils },
  { to: "/dashboard/livestock/finance", label: "Comptabilité", icon: Wallet },
];

const roleLabels: Record<string, string> = {
  agriculteur: "Agriculteur",
  eleveur: "Éleveur",
  cooperative: "Coopérative",
  agent_technique: "Agent technique",
  partenaire: "Partenaire",
  admin: "Administrateur",
  manager: "Gestionnaire",
  farmer: "Agriculteur",
  viewer: "Observateur",
};

const roleIcons: Record<string, React.ElementType> = {
  agriculteur: Wheat,
  eleveur: Bug,
  cooperative: Building2,
  agent_technique: Compass,
  partenaire: Handshake,
  admin: LayoutDashboard,
  manager: LayoutDashboard,
  farmer: Wheat,
  viewer: BarChart3,
};

function getNavForRole(role: string | null): { main: NavItem[]; livestock?: NavItem[]; } {
  switch (role) {
    case "eleveur": return { main: eleveurNav };
    case "cooperative": return { main: cooperativeNav };
    case "agent_technique": return { main: agentNav };
    case "partenaire": return { main: partenaireNav };
    case "agriculteur": return { main: agriculteurNav };
    // Legacy roles get full access
    case "admin":
    case "manager":
    case "farmer":
      return { main: fullNav, livestock: fullLivestockNav };
    default:
      return { main: agriculteurNav };
  }
}

export const RoleSidebar = () => {
  const { profile, signOut, primaryRole } = useAuth();
  const location = useLocation();
  const nav = getNavForRole(primaryRole);
  const RoleIcon = roleIcons[primaryRole || "agriculteur"] || Wheat;

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-warm">
          <Sprout className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-heading font-bold text-sidebar-foreground leading-tight">Koobnaaba</span>
          <span className="text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-wider flex items-center gap-1">
            <RoleIcon className="h-3 w-3" />
            {roleLabels[primaryRole || "agriculteur"]}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.main.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              location.pathname === to
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}

        {nav.livestock && (
          <>
            <div className="pt-3 pb-1 px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Élevage</span>
            </div>
            {nav.livestock.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  location.pathname === to
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
            <User className="h-4 w-4 text-sidebar-accent-foreground" />
          </div>
          <span className="text-sm font-medium truncate">{profile?.full_name || "Utilisateur"}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};
