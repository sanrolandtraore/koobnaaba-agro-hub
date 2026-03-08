import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import {
  Sprout, LayoutDashboard, MapPin, Wheat, Activity, DollarSign, LogOut, User, Calculator,
  Users, Wrench, Package, CalendarDays, BarChart3, Download,
  Beef, Heart, Baby, Utensils, Wallet, Building2, Compass, Handshake, ClipboardList,
  FolderOpen, Layers, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type NavItem = { to: string; label: string; icon: React.ElementType };

export const agriculteurNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/farms", label: "Exploitations", icon: MapPin },
  { to: "/dashboard/parcels", label: "Parcelles", icon: MapPin },
  { to: "/dashboard/planning", label: "Planification", icon: Calculator },
  { to: "/dashboard/cycles", label: "Cycles culturaux", icon: Wheat },
  { to: "/dashboard/activities", label: "Activités", icon: Activity },
  { to: "/dashboard/harvests", label: "Récoltes & Lots", icon: Package },
  { to: "/dashboard/calendar", label: "Calendrier", icon: CalendarDays },
  { to: "/dashboard/workers", label: "Main d'œuvre", icon: Users },
  { to: "/dashboard/equipment", label: "Équipements", icon: Wrench },
  { to: "/dashboard/costs", label: "Coûts", icon: DollarSign },
  { to: "/dashboard/investment", label: "Investissement", icon: Calculator },
  { to: "/dashboard/analytics", label: "Analyse", icon: BarChart3 },
  { to: "/dashboard/services", label: "Services Experts", icon: ClipboardList },
  { to: "/dashboard/export", label: "Export", icon: Download },
];

export const eleveurNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/farms", label: "Exploitations", icon: MapPin },
  { to: "/dashboard/livestock", label: "Tableau élevage", icon: Beef },
  { to: "/dashboard/livestock/animals", label: "Animaux", icon: Beef },
  { to: "/dashboard/livestock/health", label: "Santé", icon: Heart },
  { to: "/dashboard/livestock/reproduction", label: "Reproduction", icon: Baby },
  { to: "/dashboard/livestock/feeding", label: "Alimentation", icon: Utensils },
  { to: "/dashboard/livestock/finance", label: "Comptabilité", icon: Wallet },
  { to: "/dashboard/workers", label: "Main d'œuvre", icon: Users },
  { to: "/dashboard/equipment", label: "Équipements", icon: Wrench },
  { to: "/dashboard/analytics", label: "Analyse", icon: BarChart3 },
  { to: "/dashboard/services", label: "Services Experts", icon: ClipboardList },
  { to: "/dashboard/export-eleveur", label: "Export", icon: Download },
];

export const cooperativeNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/cooperative-profile", label: "Profil coopérative", icon: Building2 },
  { to: "/dashboard/members", label: "Membres", icon: Users },
  { to: "/dashboard/collectes", label: "Collectes", icon: Package },
  { to: "/dashboard/cooperative-cotisations", label: "Cotisations & Fonds", icon: Wallet },
  { to: "/dashboard/cooperative-finance", label: "Ventes & Répartitions", icon: DollarSign },
  { to: "/dashboard/cooperative-parcels", label: "Parcelles groupées", icon: Layers },
  { to: "/dashboard/cooperative-equipment", label: "Mécanisation", icon: Wrench },
  { to: "/dashboard/cooperative-documents", label: "Documents", icon: FolderOpen },
  { to: "/dashboard/cooperative-score", label: "Score coopérative", icon: Award },
  { to: "/dashboard/cooperative-export", label: "Export PDF/CSV", icon: Download },
];

export const agentNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/expert/requests", label: "Demandes reçues", icon: ClipboardList },
  { to: "/dashboard/analytics", label: "Rapports", icon: BarChart3 },
  { to: "/dashboard/export-agent", label: "Export", icon: Download },
];

export const partenaireNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/analytics", label: "Statistiques", icon: BarChart3 },
  { to: "/dashboard/investment", label: "Investissements", icon: Calculator },
  { to: "/dashboard/export-partenaire", label: "Rapports", icon: Download },
];

const fullNav: NavItem[] = [...agriculteurNav];

export const roleLabels: Record<string, string> = {
  agriculteur: "Agriculteur",
  eleveur: "Éleveur",
  cooperative: "Coopérative",
  agent_technique: "Expert Agronome",
  partenaire: "Partenaire",
  admin: "Administrateur",
  manager: "Gestionnaire",
  farmer: "Agriculteur",
  viewer: "Observateur",
};

export const roleIcons: Record<string, React.ElementType> = {
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

export function getNavForRole(role: string | null): { main: NavItem[] } {
  switch (role) {
    case "eleveur": return { main: eleveurNav };
    case "cooperative": return { main: cooperativeNav };
    case "agent_technique": return { main: agentNav };
    case "partenaire": return { main: partenaireNav };
    case "agriculteur": return { main: agriculteurNav };
    case "admin":
    case "manager":
    case "farmer":
      return { main: fullNav };
    default:
      return { main: agriculteurNav };
  }
}

interface SidebarContentProps {
  onNavigate?: () => void;
}

export const SidebarNavContent = ({ onNavigate }: SidebarContentProps) => {
  const { profile, signOut, primaryRole } = useAuth();
  const location = useLocation();
  const nav = getNavForRole(primaryRole);
  const RoleIcon = roleIcons[primaryRole || "agriculteur"] || Wheat;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <img src={logo} alt="KoobNaaba" className="h-10 w-auto shrink-0" />
        <span className="text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-wider flex items-center gap-1">
          <RoleIcon className="h-3 w-3" />
          {roleLabels[primaryRole || "agriculteur"]}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.main.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              location.pathname === to
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent shrink-0">
            <User className="h-4 w-4 text-sidebar-accent-foreground" />
          </div>
          <span className="text-sm font-medium truncate">{profile?.full_name || "Utilisateur"}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => { onNavigate?.(); signOut(); }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

// Desktop sidebar (hidden on mobile)
export const RoleSidebar = () => (
  <aside className="hidden md:flex h-screen w-64 flex-col border-r border-sidebar-border shrink-0">
    <SidebarNavContent />
  </aside>
);
