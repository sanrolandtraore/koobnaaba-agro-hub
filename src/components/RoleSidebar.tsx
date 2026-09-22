import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import {
  GraduationCap, Sprout, LayoutDashboard, MapPin, Wheat, Activity, DollarSign, LogOut, User, Calculator,
  Users, Wrench, Package, CalendarDays, BarChart3, Download, Settings, Tractor,
  Beef, Heart, Baby, Utensils, Wallet, Building2, Compass, Handshake, ClipboardList,
  FolderOpen, Layers, Award, Store, Eye, Microscope, FileText, BookOpen, Sparkles,
  Briefcase, ShieldCheck, Landmark, FolderKanban, FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";
import { PartnerProfileType, PARTNER_PROFILES } from "@/lib/partnerProfiles";

export type NavItem = {
  to: string;
  labelKey: string;
  icon: React.ElementType;
  section?: string;
};

/** Module « Agriculteur » : Planning et Services Experts uniquement. */
export const agriculteurNav: NavItem[] = [
  { to: "/dashboard/crop-planning", labelKey: "nav.planning", icon: Calculator },
  { to: "/dashboard/services", labelKey: "nav.expertServices", icon: ClipboardList },
];

/** Module « Éleveur » (Filière Pastorale directe) */
export const eleveurNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/animals", labelKey: "nav.animals", icon: Beef },
  { to: "/dashboard/animal-health", labelKey: "nav.health", icon: Heart },
  { to: "/dashboard/animal-reproduction", labelKey: "nav.reproduction", icon: Baby },
  { to: "/dashboard/animal-feeding", labelKey: "nav.feeding", icon: Utensils },
  { to: "/dashboard/livestock-services", labelKey: "nav.vetServices", icon: ClipboardList },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings },
  { to: "/dashboard/export", labelKey: "nav.export", icon: Download },
];

/** 1. Profil Partenaire : Fournisseur d'Intrants & Semences */
export const fournisseurNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/partenaire-mes-offres", labelKey: "nav.myOffers", icon: Store, section: "Vente & Intrants" },
  { to: "/dashboard/quote-requests", labelKey: "nav.quoteRequests", icon: FileText, section: "Vente & Intrants" },
  { to: "/dashboard/provider-clients", labelKey: "nav.providerClients", icon: Users, section: "Vente & Intrants" },
  { to: "/dashboard/revenus", labelKey: "nav.revenue", icon: Wallet, section: "Vente & Intrants" },
  { to: "/dashboard/partenaire-fournisseurs", labelKey: "nav.suppliers", icon: Package, section: "Réseau d'Approvisionnement" },
  { to: "/dashboard/partenaire-vitrine", labelKey: "Vitrine Publique", icon: ShieldCheck, section: "Visibilité & Gestion" },
  { to: "/dashboard/expert-calculator", labelKey: "nav.calculator", icon: Calculator, section: "Visibilité & Gestion" },
  { to: "/dashboard/partenaire-abonnement", labelKey: "nav.providerSubscription", icon: Sparkles, section: "Visibilité & Gestion" },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings, section: "Visibilité & Gestion" },
];

/** 2. Profil Partenaire : Machinisme & Travaux Agricoles (Location & Chantiers) */
export const machinismeNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/equipment", labelKey: "nav.equipmentFleet", icon: Tractor, section: "Flotte & Chantiers" },
  { to: "/dashboard/missions", labelKey: "nav.missions", icon: Briefcase, section: "Flotte & Chantiers" },
  { to: "/dashboard/interventions", labelKey: "nav.interventions", icon: ClipboardList, section: "Flotte & Chantiers" },
  { to: "/dashboard/quote-requests", labelKey: "nav.quoteRequests", icon: FileText, section: "Flotte & Chantiers" },
  { to: "/dashboard/provider-clients", labelKey: "nav.providerClients", icon: Users, section: "Flotte & Chantiers" },
  { to: "/dashboard/revenus", labelKey: "nav.revenue", icon: Wallet, section: "Flotte & Chantiers" },
  { to: "/dashboard/partenaire-vitrine", labelKey: "Vitrine Publique", icon: ShieldCheck, section: "Visibilité & Gestion" },
  { to: "/dashboard/partenaire-abonnement", labelKey: "nav.providerSubscription", icon: Sparkles, section: "Visibilité & Gestion" },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings, section: "Visibilité & Gestion" },
];

/** 3. Profil Partenaire : Cabinet d'Agronomie & Conseil Technique */
export const agronomeNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/expert-diagnosis", labelKey: "nav.aiDiagnosis", icon: Microscope, section: "Expertise Agronomique" },
  { to: "/dashboard/expert-prescriptions", labelKey: "nav.prescriptions", icon: FileText, section: "Expertise Agronomique" },
  { to: "/dashboard/scouting", labelKey: "nav.scouting", icon: Eye, section: "Expertise Agronomique" },
  { to: "/dashboard/expert-calculator", labelKey: "nav.calculator", icon: Calculator, section: "Expertise Agronomique" },
  { to: "/dashboard/expert-cartography", labelKey: "nav.gpsMapping", icon: MapPin, section: "Expertise Agronomique" },
  { to: "/dashboard/crop-library", labelKey: "nav.technicalSheets", icon: BookOpen, section: "Expertise Agronomique" },
  { to: "/dashboard/quote-requests", labelKey: "nav.quoteRequests", icon: FileText, section: "Clients & Interventions" },
  { to: "/dashboard/expert-clients", labelKey: "nav.myClients", icon: Users, section: "Clients & Interventions" },
  { to: "/dashboard/partenaire-vitrine", labelKey: "Vitrine Publique", icon: ShieldCheck, section: "Visibilité & Gestion" },
  { to: "/dashboard/partenaire-abonnement", labelKey: "nav.providerSubscription", icon: Sparkles, section: "Visibilité & Gestion" },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings, section: "Visibilité & Gestion" },
];

/** 4. Profil Partenaire : Santé Animale, Élevage & Zootechnie */
export const veterinaireNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/animals", labelKey: "nav.animals", icon: Beef, section: "Pôle Vétérinaire & Cheptel" },
  { to: "/dashboard/animal-health", labelKey: "nav.health", icon: Heart, section: "Pôle Vétérinaire & Cheptel" },
  { to: "/dashboard/animal-feeding", labelKey: "nav.feeding", icon: Utensils, section: "Pôle Vétérinaire & Cheptel" },
  { to: "/dashboard/animal-reproduction", labelKey: "nav.reproduction", icon: Baby, section: "Pôle Vétérinaire & Cheptel" },
  { to: "/dashboard/livestock-services", labelKey: "nav.vetServices", icon: ClipboardList, section: "Pôle Vétérinaire & Cheptel" },
  { to: "/dashboard/quote-requests", labelKey: "nav.quoteRequests", icon: FileText, section: "Clients & Prestations" },
  { to: "/dashboard/provider-clients", labelKey: "nav.providerClients", icon: Users, section: "Clients & Prestations" },
  { to: "/dashboard/partenaire-vitrine", labelKey: "Vitrine Publique", icon: ShieldCheck, section: "Visibilité & Gestion" },
  { to: "/dashboard/partenaire-abonnement", labelKey: "nav.providerSubscription", icon: Sparkles, section: "Visibilité & Gestion" },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings, section: "Visibilité & Gestion" },
];

/** 5. Profil Partenaire : Banque, Microfinance & Assurance Agricole */
export const institutionNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/dashboard/partenaire-banques", labelKey: "nav.banking", icon: Landmark, section: "Finance & Assurance" },
  { to: "/dashboard/partenaire-assurance", labelKey: "nav.insurance", icon: ShieldCheck, section: "Finance & Assurance" },
  { to: "/dashboard/partenaire-programmes", labelKey: "nav.programs", icon: FolderKanban, section: "Finance & Assurance" },
  { to: "/dashboard/partners-directory", labelKey: "nav.partners", icon: Handshake, section: "Finance & Assurance" },
  { to: "/dashboard/quote-requests", labelKey: "nav.quoteRequests", icon: FileText, section: "Dossiers & Souscriptions" },
  { to: "/dashboard/provider-clients", labelKey: "nav.providerClients", icon: Users, section: "Dossiers & Souscriptions" },
  { to: "/dashboard/partenaire-vitrine", labelKey: "Vitrine Publique", icon: ShieldCheck, section: "Visibilité & Gestion" },
  { to: "/dashboard/partenaire-abonnement", labelKey: "nav.providerSubscription", icon: Sparkles, section: "Visibilité & Gestion" },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings, section: "Visibilité & Gestion" },
];

/**
 * Module « Partenaire / Hub Entreprise Polyvalent » :
 * Regroupe l'ensemble des expertises pour les entreprises polyvalentes.
 */
export const partenaireNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },

  // Pôle 1: Expertise Agronome
  { to: "/dashboard/expert-diagnosis", labelKey: "nav.aiDiagnosis", icon: Microscope, section: "Expertise Agronome" },
  { to: "/dashboard/expert-prescriptions", labelKey: "nav.prescriptions", icon: FileText, section: "Expertise Agronome" },
  { to: "/dashboard/scouting", labelKey: "nav.scouting", icon: Eye, section: "Expertise Agronome" },
  { to: "/dashboard/expert-calculator", labelKey: "nav.calculator", icon: Calculator, section: "Expertise Agronome" },
  { to: "/dashboard/expert-cartography", labelKey: "nav.gpsMapping", icon: MapPin, section: "Expertise Agronome" },
  { to: "/dashboard/crop-library", labelKey: "nav.technicalSheets", icon: BookOpen, section: "Expertise Agronome" },

  // Pôle 2: Élevage & Zootechnie
  { to: "/dashboard/animals", labelKey: "nav.animals", icon: Beef, section: "Élevage & Zootechnie" },
  { to: "/dashboard/animal-health", labelKey: "nav.health", icon: Heart, section: "Élevage & Zootechnie" },
  { to: "/dashboard/animal-feeding", labelKey: "nav.feeding", icon: Utensils, section: "Élevage & Zootechnie" },
  { to: "/dashboard/animal-reproduction", labelKey: "nav.reproduction", icon: Baby, section: "Élevage & Zootechnie" },
  { to: "/dashboard/livestock-services", labelKey: "nav.vetServices", icon: ClipboardList, section: "Élevage & Zootechnie" },

  // Pôle 3: Commerce, Matériel & Chantiers
  { to: "/dashboard/partenaire-mes-offres", labelKey: "nav.myOffers", icon: Store, section: "Commerce & Chantiers" },
  { to: "/dashboard/quote-requests", labelKey: "nav.quoteRequests", icon: FileText, section: "Commerce & Chantiers" },
  { to: "/dashboard/missions", labelKey: "nav.missions", icon: Briefcase, section: "Commerce & Chantiers" },
  { to: "/dashboard/interventions", labelKey: "nav.interventions", icon: ClipboardList, section: "Commerce & Chantiers" },
  { to: "/dashboard/equipment", labelKey: "nav.equipmentFleet", icon: Tractor, section: "Commerce & Chantiers" },
  { to: "/dashboard/provider-clients", labelKey: "nav.providerClients", icon: Users, section: "Commerce & Chantiers" },
  { to: "/dashboard/revenus", labelKey: "nav.revenue", icon: Wallet, section: "Commerce & Chantiers" },

  // Pôle 4: Réseau Écosystème & Partenariats
  { to: "/dashboard/partenaire-fournisseurs", labelKey: "nav.suppliers", icon: Package, section: "Réseau Écosystème" },
  { to: "/dashboard/partenaire-assurance", labelKey: "nav.insurance", icon: ShieldCheck, section: "Réseau Écosystème" },
  { to: "/dashboard/partenaire-banques", labelKey: "nav.banking", icon: Landmark, section: "Réseau Écosystème" },
  { to: "/dashboard/partenaire-programmes", labelKey: "nav.programs", icon: FolderKanban, section: "Réseau Écosystème" },
  { to: "/dashboard/partners-directory", labelKey: "nav.partners", icon: Handshake, section: "Réseau Écosystème" },

  // Pôle 5: Gestion & Configuration
  { to: "/dashboard/partenaire-abonnement", labelKey: "nav.providerSubscription", icon: Sparkles, section: "Gestion & Paramètres" },
  { to: "/dashboard/export", labelKey: "nav.export", icon: Download, section: "Gestion & Paramètres" },
  { to: "/dashboard/settings", labelKey: "nav.settings", icon: Settings, section: "Gestion & Paramètres" },
];

export const roleLabelKeys: Record<string, string> = {
  agriculteur: "roles.agriculteur",
  eleveur: "roles.eleveur",
  formation: "roles.partenaire",
  agent_technique: "roles.partenaire",
  expert: "roles.partenaire",
  partenaire: "roles.partenaire",
  admin: "roles.admin",
  manager: "roles.manager",
  farmer: "roles.agriculteur",
  viewer: "roles.viewer",
};

export const roleIcons: Record<string, React.ElementType> = {
  agriculteur: Wheat,
  eleveur: Beef,
  formation: Handshake,
  agent_technique: Handshake,
  expert: Handshake,
  partenaire: Handshake,
  admin: LayoutDashboard,
  manager: LayoutDashboard,
  farmer: Wheat,
  viewer: BarChart3,
};

export const partnerTypeIcons: Record<PartnerProfileType, React.ElementType> = {
  fournisseur_intrants: FlaskConical,
  machinisme_travaux: Tractor,
  expert_agronome: Microscope,
  elevage_veterinaire: Beef,
  institution_agri: Landmark,
  polyvalent: Handshake,
};

/**
 * Routeur de navigation par rôle et spécialisation partenaire.
 * Les comptes partenaires ne sont PAS unifiés : chaque type a son espace dédié.
 */
export function getNavForRole(role: string | null, partnerType?: string | null): { main: NavItem[] } {
  switch (role) {
    case "eleveur":
      return { main: eleveurNav };
    case "agriculteur":
    case "farmer":
      return { main: agriculteurNav };
    case "partenaire":
    case "agent_technique":
    case "expert":
    case "formation":
    case "admin":
    case "manager":
    default:
      if (partnerType === "fournisseur_intrants") return { main: fournisseurNav };
      if (partnerType === "machinisme_travaux") return { main: machinismeNav };
      if (partnerType === "expert_agronome") return { main: agronomeNav };
      if (partnerType === "elevage_veterinaire") return { main: veterinaireNav };
      if (partnerType === "institution_agri") return { main: institutionNav };
      return { main: partenaireNav };
  }
}

interface SidebarContentProps {
  onNavigate?: () => void;
}

export const SidebarNavContent = ({ onNavigate }: SidebarContentProps) => {
  const { profile, signOut, primaryRole, partnerType } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const effectiveRole = primaryRole;
  const nav = getNavForRole(effectiveRole, partnerType);
  const isPartner = effectiveRole === "partenaire" || !["agriculteur", "farmer", "eleveur"].includes(effectiveRole || "");
  const partnerMeta = isPartner && partnerType ? PARTNER_PROFILES[partnerType] : null;
  const RoleIcon = isPartner && partnerType
    ? partnerTypeIcons[partnerType] || Handshake
    : roleIcons[effectiveRole || "agriculteur"] || Wheat;

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <img src={logo} alt="KoobNaaba" className="h-10 w-auto shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-sidebar-primary uppercase tracking-wider flex items-center gap-1.5 truncate">
            <RoleIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">
              {isPartner && partnerMeta ? partnerMeta.shortLabel : t(roleLabelKeys[primaryRole || "agriculteur"] || "roles.agriculteur")}
            </span>
          </span>
          {isPartner && partnerMeta && (
            <span className="text-[9px] text-sidebar-foreground/60 truncate">
              {partnerMeta.badge}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {nav.main.map(({ to, labelKey, icon: Icon, section }, index) => {
          const isFirstOfSection = Boolean(section && (index === 0 || nav.main[index - 1]?.section !== section));
          return (
            <div key={to} className="space-y-0.5">
              {isFirstOfSection && (
                <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 border-t border-sidebar-border/40 first:border-0 first:pt-0">
                  {section}
                </div>
              )}
              <Link
                to={to}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  (
                    to === "/dashboard"
                      ? location.pathname === "/dashboard"
                      : to === "/dashboard/crop-planning"
                        ? (location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/crop-planning"))
                        : location.pathname.startsWith(to)
                  )
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold shadow-xs"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {labelKey.startsWith("nav.") ? t(labelKey) : labelKey}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <LanguageSelector className="mb-2 w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" />
        <Link
          to="/dashboard/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 mb-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent shrink-0">
            <User className="h-4 w-4 text-sidebar-accent-foreground" />
          </div>
          <span className="text-sm font-medium truncate">{profile?.full_name || t("common.user")}</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => { onNavigate?.(); signOut(); }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t("common.logout")}
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
