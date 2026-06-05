import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import {
  Sprout, LayoutDashboard, MapPin, Wheat, Activity, DollarSign, LogOut, User, Calculator,
  Users, Wrench, Package, CalendarDays, BarChart3, Download, Settings, Crown,
  Beef, Heart, Baby, Utensils, Wallet, Building2, Compass, Handshake, ClipboardList,
  FolderOpen, Layers, Award, Store, Eye, Microscope, FileText, BookOpen, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCooperativeRole } from "@/hooks/useCooperativeRole";

export type NavItem = { to: string; label: string; icon: React.ElementType };

export const agriculteurNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/farms", label: "Exploitations", icon: MapPin },
  { to: "/dashboard/parcels", label: "Parcelles", icon: MapPin },
  { to: "/dashboard/crop-planning", label: "Planification", icon: Calculator },
  { to: "/dashboard/crop-cycles", label: "Cycles culturaux", icon: Wheat },
  { to: "/dashboard/activities", label: "Activités", icon: Activity },
  { to: "/dashboard/harvests", label: "Récoltes & Lots", icon: Package },
  { to: "/dashboard/calendar", label: "Calendrier", icon: CalendarDays },
  { to: "/dashboard/workers", label: "Main d'œuvre", icon: Users },
  { to: "/dashboard/equipment", label: "Équipements", icon: Wrench },
  { to: "/dashboard/costs", label: "Coûts", icon: DollarSign },
  { to: "/dashboard/investment", label: "Investissement", icon: Calculator },
  { to: "/dashboard/analytics", label: "Analyse", icon: BarChart3 },
  { to: "/dashboard/marketplace", label: "Marketplace", icon: Store },
  { to: "/dashboard/services", label: "Services Experts", icon: ClipboardList },
  { to: "/dashboard/partners-directory", label: "Partenaires", icon: Handshake },
  { to: "/dashboard/pricing", label: "Premium", icon: Crown },
  { to: "/dashboard/settings", label: "Paramètres", icon: Settings },
  { to: "/dashboard/export", label: "Export", icon: Download },
];

export const eleveurNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/animals", label: "Animaux", icon: Beef },
  { to: "/dashboard/animal-health", label: "Santé", icon: Heart },
  { to: "/dashboard/animal-reproduction", label: "Reproduction", icon: Baby },
  { to: "/dashboard/animal-feeding", label: "Alimentation", icon: Utensils },
  { to: "/dashboard/livestock-finance", label: "Comptabilité", icon: Wallet },
  { to: "/dashboard/analytics", label: "Analyse", icon: BarChart3 },
  { to: "/dashboard/livestock-services", label: "Services Vétérinaires", icon: ClipboardList },
  { to: "/dashboard/partners-directory", label: "Partenaires", icon: Handshake },
  { to: "/dashboard/pricing", label: "Premium", icon: Crown },
  { to: "/dashboard/settings", label: "Paramètres", icon: Settings },
  { to: "/dashboard/export", label: "Export", icon: Download },
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
  { to: "/dashboard/partners-directory", label: "Partenaires", icon: Handshake },
  { to: "/dashboard/pricing", label: "Premium", icon: Crown },
  { to: "/dashboard/settings", label: "Paramètres", icon: Settings },
  { to: "/dashboard/export", label: "Export PDF/CSV", icon: Download },
];

export const partenaireNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/partenaire-fournisseurs", label: "Fournisseurs", icon: Package },
  { to: "/dashboard/partenaire-assurance", label: "Assurance", icon: Award },
  { to: "/dashboard/partenaire-programmes", label: "Programmes / Projets", icon: FolderOpen },
  { to: "/dashboard/partenaire-banques", label: "Services bancaires agricoles", icon: Wallet },
  { to: "/dashboard/pricing", label: "Premium", icon: Crown },
  { to: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export const agentNav: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dashboard/expert-toolbox", label: "Boîte à outils", icon: Sparkles },
  { to: "/dashboard/expert-clients", label: "Mes clients", icon: Users },
  { to: "/dashboard/expert-diagnosis", label: "Diagnostic IA", icon: Microscope },
  { to: "/dashboard/expert-calculator", label: "Calculatrice", icon: Calculator },
  { to: "/dashboard/expert-prescriptions", label: "Ordonnances", icon: FileText },
  { to: "/dashboard/crop-library", label: "Fiches techniques", icon: BookOpen },
  { to: "/dashboard/scouting", label: "Scouting terrain", icon: Eye },
  { to: "/dashboard/expert-cartography", label: "Cartographie GPS", icon: MapPin },
  { to: "/dashboard/marketplace", label: "Marketplace", icon: Store },
  { to: "/dashboard/partners-directory", label: "Partenaires", icon: Handshake },
  { to: "/dashboard/expert-analytics", label: "Statistiques", icon: BarChart3 },
  { to: "/dashboard/pricing", label: "Premium", icon: Crown },
  { to: "/dashboard/settings", label: "Paramètres", icon: Settings },
  { to: "/dashboard/export", label: "Export", icon: Download },
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
  eleveur: Beef,
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
  const { isCoopMember, isReadOnly, memberRole } = useCooperativeRole();

  // If user is a cooperative member, show cooperative nav
  const effectiveRole = isCoopMember ? "cooperative" : primaryRole;
  const nav = getNavForRole(effectiveRole);
  const RoleIcon = roleIcons[effectiveRole || "agriculteur"] || Wheat;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <img src={logo} alt="KoobNaaba" className="h-10 w-auto shrink-0" />
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-wider flex items-center gap-1">
            <RoleIcon className="h-3 w-3" />
            {isCoopMember ? "Coopérative" : roleLabels[primaryRole || "agriculteur"]}
          </span>
          {isReadOnly && (
            <Badge variant="outline" className="text-[9px] mt-1 gap-1 border-sidebar-foreground/20 text-sidebar-foreground/50">
              <Eye className="h-2.5 w-2.5" />
              Lecture seule
            </Badge>
          )}
        </div>
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
              (to === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(to))
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
        <Link
          to="/dashboard/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 mb-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent shrink-0">
            <User className="h-4 w-4 text-sidebar-accent-foreground" />
          </div>
          <span className="text-sm font-medium truncate">{profile?.full_name || "Utilisateur"}</span>
        </Link>
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
