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

export type NavItem = { to: string; labelKey: string; icon: React.ElementType };

export const agriculteurNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/farms", labelKey: "nav.farms", icon: MapPin },
  { to: "/dashboard/parcels", labelKey: "nav.parcels", icon: MapPin },
  { to: "/dashboard/crop-planning", labelKey: "nav.planning", icon: Calculator },
  { to: "/dashboard/crop-cycles", labelKey: "nav.cropCycles", icon: Wheat },
  { to: "/dashboard/activities", labelKey: "nav.activities", icon: Activity },
  { to: "/dashboard/harvests", labelKey: "nav.harvests", icon: Package },
  { to: "/dashboard/calendar", labelKey: "nav.calendar", icon: CalendarDays },
  { to: "/dashboard/workers", labelKey: "nav.workers", icon: Users },
  { to: "/dashboard/equipment", labelKey: "nav.equipment", icon: Wrench },
  { to: "/dashboard/costs", labelKey: "nav.costs", icon: DollarSign },
  { to: "/dashboard/investment", labelKey: "nav.investment", icon: Calculator },
  { to: "/dashboard/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { to: "/dashboard/marketplace", labelKey: "nav.marketplace", icon: Store },
  { to: "/dashboard/services", labelKey: "nav.expertServices", icon: ClipboardList },
  { to: "/dashboard/partners-directory", labelKey: "nav.partners", icon: Handshake },
  { to: "/dashboard/pricing", labelKey: "nav.premium", icon: Crown },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
  { to: "/dashboard/export", labelKey: "nav.export", icon: Download },
];

export const eleveurNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/animals", labelKey: "nav.animals", icon: Beef },
  { to: "/dashboard/animal-health", labelKey: "nav.health", icon: Heart },
  { to: "/dashboard/animal-reproduction", labelKey: "nav.reproduction", icon: Baby },
  { to: "/dashboard/animal-feeding", labelKey: "nav.feeding", icon: Utensils },
  { to: "/dashboard/livestock-finance", labelKey: "nav.accounting", icon: Wallet },
  { to: "/dashboard/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { to: "/dashboard/livestock-services", labelKey: "nav.vetServices", icon: ClipboardList },
  { to: "/dashboard/partners-directory", labelKey: "nav.partners", icon: Handshake },
  { to: "/dashboard/pricing", labelKey: "nav.premium", icon: Crown },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
  { to: "/dashboard/export", labelKey: "nav.export", icon: Download },
];

export const cooperativeNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/cooperative-profile", labelKey: "nav.coopProfile", icon: Building2 },
  { to: "/dashboard/members", labelKey: "nav.members", icon: Users },
  { to: "/dashboard/collectes", labelKey: "nav.collectes", icon: Package },
  { to: "/dashboard/cooperative-cotisations", labelKey: "nav.cotisations", icon: Wallet },
  { to: "/dashboard/cooperative-finance", labelKey: "nav.salesDistribution", icon: DollarSign },
  { to: "/dashboard/cooperative-parcels", labelKey: "nav.groupParcels", icon: Layers },
  { to: "/dashboard/cooperative-equipment", labelKey: "nav.mechanization", icon: Wrench },
  { to: "/dashboard/cooperative-documents", labelKey: "nav.documents", icon: FolderOpen },
  { to: "/dashboard/cooperative-score", labelKey: "nav.coopScore", icon: Award },
  { to: "/dashboard/partners-directory", labelKey: "nav.partners", icon: Handshake },
  { to: "/dashboard/pricing", labelKey: "nav.premium", icon: Crown },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
  { to: "/dashboard/export", labelKey: "nav.exportPdfCsv", icon: Download },
];

export const partenaireNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/partenaire-fournisseurs", labelKey: "nav.suppliers", icon: Package },
  { to: "/dashboard/partenaire-assurance", labelKey: "nav.insurance", icon: Award },
  { to: "/dashboard/partenaire-programmes", labelKey: "nav.programs", icon: FolderOpen },
  { to: "/dashboard/partenaire-banques", labelKey: "nav.banking", icon: Wallet },
  { to: "/dashboard/pricing", labelKey: "nav.premium", icon: Crown },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
];

export const agentNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/expert-toolbox", labelKey: "nav.toolbox", icon: Sparkles },
  { to: "/dashboard/expert-clients", labelKey: "nav.myClients", icon: Users },
  { to: "/dashboard/expert-diagnosis", labelKey: "nav.aiDiagnosis", icon: Microscope },
  { to: "/dashboard/expert-calculator", labelKey: "nav.calculator", icon: Calculator },
  { to: "/dashboard/expert-prescriptions", labelKey: "nav.prescriptions", icon: FileText },
  { to: "/dashboard/crop-library", labelKey: "nav.technicalSheets", icon: BookOpen },
  { to: "/dashboard/scouting", labelKey: "nav.scouting", icon: Eye },
  { to: "/dashboard/expert-cartography", labelKey: "nav.gpsMapping", icon: MapPin },
  { to: "/dashboard/marketplace", labelKey: "nav.marketplace", icon: Store },
  { to: "/dashboard/partners-directory", labelKey: "nav.partners", icon: Handshake },
  { to: "/dashboard/expert-analytics", labelKey: "nav.statistics", icon: BarChart3 },
  { to: "/dashboard/pricing", labelKey: "nav.premium", icon: Crown },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
  { to: "/dashboard/export", labelKey: "nav.export", icon: Download },
];


const fullNav: NavItem[] = [...agriculteurNav];

/** Translation keys for each role label (see `roles.*` in the locale files). */
export const roleLabelKeys: Record<string, string> = {
  agriculteur: "roles.agriculteur",
  eleveur: "roles.eleveur",
  cooperative: "roles.cooperative",
  agent_technique: "roles.agent_technique",
  partenaire: "roles.partenaire",
  admin: "roles.admin",
  manager: "roles.manager",
  farmer: "roles.farmer",
  viewer: "roles.viewer",
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
