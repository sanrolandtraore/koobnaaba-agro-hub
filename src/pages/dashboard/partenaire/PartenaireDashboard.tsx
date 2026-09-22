import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Briefcase, Store, Users, Handshake, CheckCircle2, ArrowRight,
  ShieldCheck, Zap, Package, Tractor, Wallet, FileText, ClipboardList, Clock, Plus,
  Microscope, Beef, Heart, Baby, Utensils, BookOpen, MapPin, Calculator, Eye,
  Landmark, FolderKanban, Copy, ExternalLink, FlaskConical, SlidersHorizontal, Check, Wrench
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getStoredProviderSubscription, ProviderSubscription, SUBSCRIPTION_PLANS } from "@/lib/providerSubscription";
import { partnerStorage, PartnerOffer, PartnerMission, QuoteRequest, ProviderClient } from "@/lib/partnerStorage";
import { PARTNER_PROFILES, PARTNER_PROFILE_LIST, PartnerProfileType } from "@/lib/partnerProfiles";

const getProfileIcon = (iconName: string, className = "h-5 w-5") => {
  switch (iconName) {
    case "FlaskConical":
      return <FlaskConical className={className} />;
    case "Tractor":
      return <Tractor className={className} />;
    case "Microscope":
      return <Microscope className={className} />;
    case "Beef":
      return <Beef className={className} />;
    case "Landmark":
      return <Landmark className={className} />;
    default:
      return <Handshake className={className} />;
  }
};

export default function PartenaireDashboard() {
  const { user, profile, partnerType, setPartnerType } = useAuth();
  const [sub, setSub] = useState<ProviderSubscription>(getStoredProviderSubscription());
  const [offers, setOffers] = useState<PartnerOffer[]>([]);
  const [missions, setMissions] = useState<PartnerMission[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [clients, setClients] = useState<ProviderClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);

  const activeMeta = PARTNER_PROFILES[partnerType] || PARTNER_PROFILES.fournisseur_intrants;

  const loadData = async () => {
    setLoading(true);
    try {
      const [o, m, q, c] = await Promise.all([
        partnerStorage.getOffers(user?.id),
        partnerStorage.getMissions(user?.id),
        partnerStorage.getQuotes(),
        partnerStorage.getClients(user?.id),
      ]);
      setOffers(o);
      setMissions(m);
      setQuotes(q);
      setClients(c);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const subHandler = () => setSub(getStoredProviderSubscription());
    const dataHandler = () => loadData();
    window.addEventListener("koobnaaba-subscription-updated", subHandler);
    window.addEventListener("koobnaaba-partner-data-updated", dataHandler);
    return () => {
      window.removeEventListener("koobnaaba-subscription-updated", subHandler);
      window.removeEventListener("koobnaaba-partner-data-updated", dataHandler);
    };
  }, [user]);

  const activePlan = SUBSCRIPTION_PLANS.find((p) => p.id === sub.tier) || SUBSCRIPTION_PLANS[2];
  const activeMissions = missions.filter((m) => m.status === "planifiee" || m.status === "en_cours");
  const pendingQuotes = quotes.filter((q) => q.status === "en_attente");
  const totalRevenue = missions.filter((m) => m.paid && m.price).reduce((acc, m) => acc + Number(m.price || 0), 0);
  const pendingRevenue = missions.filter((m) => !m.paid && m.price).reduce((acc, m) => acc + Number(m.price || 0), 0);

  const handleSelectPartnerType = (type: PartnerProfileType) => {
    setPartnerType(type);
    setIsSwitchDialogOpen(false);
    toast.success(`Profil activé : ${PARTNER_PROFILES[type].title}`, {
      description: "Votre tableau de bord et votre menu latéral ont été adaptés à votre métier."
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Banner Spécialisé */}
      <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              {getProfileIcon(activeMeta.iconName, "h-3.5 w-3.5")}
              {activeMeta.badge}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSwitchDialogOpen(true)}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2.5 rounded-full border border-dashed border-border"
            >
              <SlidersHorizontal className="h-3 w-3" /> Changer de profil métier
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Bonjour {profile?.full_name || sub.companyName}
          </h1>
          <p className="text-sm font-medium text-foreground/90">
            {activeMeta.dashboardTitle}
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            {activeMeta.tagline}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 bg-background/80 backdrop-blur-sm p-4 rounded-xl border shrink-0">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Formule {activePlan.title}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Valide jusqu'au {new Date(sub.endDate).toLocaleDateString("fr-FR")}
          </p>
          <Button asChild size="sm" variant="outline" className="text-xs font-semibold mt-1">
            <Link to="/dashboard/partenaire-abonnement">
              Gérer mon abonnement <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Vitrine Partenaire Publique & Lien Unique */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-primary/5 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Store className="h-3.5 w-3.5" /> Votre Vitrine Partenaire Dédiée & URL Unique
          </div>
          <h3 className="text-base font-heading font-bold text-foreground">
            Votre vitrine officielle KoobNaaba est active
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Tous vos produits, intrants, matériels et prestations spécialisés avec photos/vidéos sont synchronisés sur votre page vitrine, le module agriculteur et l'accueil.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => {
              const url = `${window.location.origin}/partenaire/${user?.id || 'demo-partner-id'}`;
              navigator.clipboard.writeText(url);
              toast.success("Lien unique de votre vitrine copié dans le presse-papier !");
            }}
          >
            <Copy className="h-3.5 w-3.5" /> Copier mon lien vitrine
          </Button>
          <Button
            asChild
            size="sm"
            className="gradient-primary text-primary-foreground text-xs font-semibold gap-2 shadow-xs"
          >
            <Link to={`/partenaire/${user?.id || 'demo-partner-id'}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" /> Voir ma vitrine publique
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link to="/dashboard/partenaire-mes-offres">
          <Card className="hover:border-primary/50 transition-all h-full">
            <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Offres & Articles</CardTitle>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600"><Store className="h-4 w-4" /></div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-2xl font-heading font-bold">{offers.length}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{offers.filter(o => o.is_active).length} actifs sur la plateforme</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/missions">
          <Card className="hover:border-primary/50 transition-all h-full">
            <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Missions & Chantiers</CardTitle>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600"><Briefcase className="h-4 w-4" /></div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-2xl font-heading font-bold">{activeMissions.length}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{missions.length} dossiers au total</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/quote-requests">
          <Card className="hover:border-primary/50 transition-all h-full">
            <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Demandes de devis</CardTitle>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600"><FileText className="h-4 w-4" /></div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-2xl font-heading font-bold">{pendingQuotes.length}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{quotes.length} demandes reçues</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/revenus">
          <Card className="hover:border-primary/50 transition-all h-full">
            <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Recettes encaissées</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600"><Wallet className="h-4 w-4" /></div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-2xl font-heading font-bold">{totalRevenue.toLocaleString("fr-FR")} F</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">+{pendingRevenue.toLocaleString("fr-FR")} F en cours</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Actions rapides adaptées au profil actif */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> Raccourcis prioritaires : {activeMeta.shortLabel}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {partnerType === "fournisseur_intrants" && (
            <>
              <Button asChild className="h-auto py-3 justify-start gap-2 gradient-primary text-primary-foreground font-semibold shadow-xs">
                <Link to="/dashboard/partenaire-mes-offres">
                  <Plus className="h-4 w-4" /> Publier un Intrant / Semence
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/quote-requests">
                  <FileText className="h-4 w-4 text-rose-600" /> Commandes & Devis reçus
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/partenaire-fournisseurs">
                  <Package className="h-4 w-4 text-indigo-600" /> Réseau Fournisseurs & Usines
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/expert-calculator">
                  <Calculator className="h-4 w-4 text-emerald-600" /> Calculatrice de dosages
                </Link>
              </Button>
            </>
          )}

          {partnerType === "machinisme_travaux" && (
            <>
              <Button asChild className="h-auto py-3 justify-start gap-2 gradient-primary text-primary-foreground font-semibold shadow-xs">
                <Link to="/dashboard/partenaire-mes-offres">
                  <Plus className="h-4 w-4" /> Proposer un Engin / Chantier
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/equipment">
                  <Tractor className="h-4 w-4 text-emerald-600" /> Parc Matériel & Maintenance
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/missions">
                  <Briefcase className="h-4 w-4 text-indigo-600" /> Planning Chantiers Labour/Moisson
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/quote-requests">
                  <FileText className="h-4 w-4 text-amber-600" /> Réservations de tracteurs
                </Link>
              </Button>
            </>
          )}

          {partnerType === "expert_agronome" && (
            <>
              <Button asChild className="h-auto py-3 justify-start gap-2 gradient-primary text-primary-foreground font-semibold shadow-xs">
                <Link to="/dashboard/expert-diagnosis">
                  <Microscope className="h-4 w-4" /> Diagnostic IA cultures
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/expert-prescriptions">
                  <FileText className="h-4 w-4 text-emerald-600" /> Ordonnances phytosanitaires
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/expert-cartography">
                  <MapPin className="h-4 w-4 text-rose-600" /> Cartographie GPS Parcelles
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/scouting">
                  <Eye className="h-4 w-4 text-amber-600" /> Surveillance Ravageurs
                </Link>
              </Button>
            </>
          )}

          {partnerType === "elevage_veterinaire" && (
            <>
              <Button asChild className="h-auto py-3 justify-start gap-2 gradient-primary text-primary-foreground font-semibold shadow-xs">
                <Link to="/dashboard/animal-health">
                  <Heart className="h-4 w-4" /> Soins & Vaccinations
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/animals">
                  <Beef className="h-4 w-4 text-amber-600" /> Suivi Cheptel & Bétail
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/animal-feeding">
                  <Utensils className="h-4 w-4 text-emerald-600" /> Rations & Provendes
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/partenaire-mes-offres">
                  <Plus className="h-4 w-4 text-indigo-600" /> Publier Produits Vétérinaires
                </Link>
              </Button>
            </>
          )}

          {partnerType === "institution_agri" && (
            <>
              <Button asChild className="h-auto py-3 justify-start gap-2 gradient-primary text-primary-foreground font-semibold shadow-xs">
                <Link to="/dashboard/partenaire-banques">
                  <Landmark className="h-4 w-4" /> Crédits de Campagne
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/partenaire-assurance">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Assurances Récolte & Bétail
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/partenaire-programmes">
                  <FolderKanban className="h-4 w-4 text-rose-600" /> Programmes Bailleurs
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/provider-clients">
                  <Users className="h-4 w-4 text-teal-600" /> Producteurs Adhérents ({clients.length})
                </Link>
              </Button>
            </>
          )}

          {partnerType === "polyvalent" && (
            <>
              <Button asChild className="h-auto py-3 justify-start gap-2 gradient-primary text-primary-foreground font-semibold shadow-xs">
                <Link to="/dashboard/partenaire-mes-offres">
                  <Plus className="h-4 w-4" /> Publier une offre multimédia
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/expert-diagnosis">
                  <Microscope className="h-4 w-4 text-emerald-600" /> Diagnostic IA cultures
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/animals">
                  <Beef className="h-4 w-4 text-amber-600" /> Suivi troupeaux & bétail
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2 font-medium">
                <Link to="/dashboard/missions">
                  <Briefcase className="h-4 w-4 text-indigo-600" /> Chantiers & missions
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Pôle Spécialisé Principal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold flex items-center gap-2">
            <span className="p-1 rounded-lg bg-primary/10 text-primary">
              {getProfileIcon(activeMeta.iconName, "h-5 w-5")}
            </span>
            Votre Espace Métier : {activeMeta.title}
          </h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">{activeMeta.dashboardSubtitle}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pôle 1: Fournisseur d'Intrants & Semences */}
          <Card className={`transition-all flex flex-col justify-between ${partnerType === "fournisseur_intrants" ? "border-primary ring-1 ring-primary shadow-xs" : "hover:border-primary/50"}`}>
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">1. Intrants & Semences</CardTitle>
                {partnerType === "fournisseur_intrants" && <Badge className="bg-primary text-primary-foreground text-[10px]">Votre Métier</Badge>}
              </div>
              <CardDescription className="text-xs">
                Engrais NPK, urée, semences certifiées, biofertilisants et traitements homologués.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex flex-col gap-1.5 text-xs">
                <Link to="/dashboard/partenaire-mes-offres" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Store className="h-3.5 w-3.5 text-emerald-600" /> Mon catalogue d'intrants</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/quote-requests" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-rose-600" /> Commandes d'engrais</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/partenaire-fournisseurs" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Package className="h-3.5 w-3.5 text-indigo-600" /> Fournisseurs & Grossistes</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/expert-calculator" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Calculator className="h-3.5 w-3.5 text-amber-600" /> Calculatrice de doses</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pôle 2: Machinisme & Travaux Agricoles */}
          <Card className={`transition-all flex flex-col justify-between ${partnerType === "machinisme_travaux" ? "border-primary ring-1 ring-primary shadow-xs" : "hover:border-primary/50"}`}>
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                <Tractor className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">2. Machinisme & Travaux</CardTitle>
                {partnerType === "machinisme_travaux" && <Badge className="bg-primary text-primary-foreground text-[10px]">Votre Métier</Badge>}
              </div>
              <CardDescription className="text-xs">
                Tracteurs, motoculteurs, batteuses, prestations de labour et logistique champ.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex flex-col gap-1.5 text-xs">
                <Link to="/dashboard/equipment" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Tractor className="h-3.5 w-3.5 text-amber-600" /> Parc Matériel & Engins</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/missions" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-indigo-600" /> Chantiers de labour & battage</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/interventions" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><ClipboardList className="h-3.5 w-3.5 text-emerald-600" /> Interventions sur le terrain</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/partenaire-mes-offres" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Store className="h-3.5 w-3.5 text-rose-600" /> Locations d'engins en ligne</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pôle 3: Expertise Agronomique */}
          <Card className={`transition-all flex flex-col justify-between ${partnerType === "expert_agronome" ? "border-primary ring-1 ring-primary shadow-xs" : "hover:border-primary/50"}`}>
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
                <Microscope className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">3. Expertise Agronome</CardTitle>
                {partnerType === "expert_agronome" && <Badge className="bg-primary text-primary-foreground text-[10px]">Votre Métier</Badge>}
              </div>
              <CardDescription className="text-xs">
                Diagnostics IA, ordonnances phytosanitaires, scouting et cartographie GPS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex flex-col gap-1.5 text-xs">
                <Link to="/dashboard/expert-diagnosis" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Microscope className="h-3.5 w-3.5 text-blue-600" /> Diagnostic IA maladies foliaires</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/expert-prescriptions" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-primary" /> Ordonnances phytosanitaires</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/scouting" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Eye className="h-3.5 w-3.5 text-amber-600" /> Scouting & Ravageurs</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/expert-cartography" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-rose-600" /> Cartographie GPS</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pôle 4: Élevage, Santé Animale & Zootechnie */}
          <Card className={`transition-all flex flex-col justify-between ${partnerType === "elevage_veterinaire" ? "border-primary ring-1 ring-primary shadow-xs" : "hover:border-primary/50"}`}>
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-2">
                <Beef className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">4. Élevage & Vétérinaire</CardTitle>
                {partnerType === "elevage_veterinaire" && <Badge className="bg-primary text-primary-foreground text-[10px]">Votre Métier</Badge>}
              </div>
              <CardDescription className="text-xs">
                Cheptels, prophylaxie, vaccins, alimentation animale et insémination.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex flex-col gap-1.5 text-xs">
                <Link to="/dashboard/animals" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Beef className="h-3.5 w-3.5 text-rose-600" /> Suivi du Cheptel</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/animal-health" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Heart className="h-3.5 w-3.5 text-red-600" /> Santé & Vaccinations</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/animal-feeding" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Utensils className="h-3.5 w-3.5 text-emerald-600" /> Rations & Provendes</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/animal-reproduction" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Baby className="h-3.5 w-3.5 text-indigo-600" /> Reproduction & Génétique</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pôle Financement & Assurances Agricoles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Card className={`transition-all ${partnerType === "institution_agri" ? "border-primary ring-1 ring-primary shadow-xs" : "hover:border-primary/50"}`}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold">Banque, Microfinance & Assurance Agricole</CardTitle>
                    {partnerType === "institution_agri" && <Badge className="bg-primary text-primary-foreground text-[10px]">Votre Métier</Badge>}
                  </div>
                  <CardDescription className="text-xs">
                    Crédits de campagne pour intrants/équipements, assurances récoltes et garanties.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <Link to="/dashboard/partenaire-banques" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Landmark className="h-3.5 w-3.5 text-purple-600" /> Crédits de campagne</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/partenaire-assurance" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Assurances récoltes & bétail</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/partenaire-programmes" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><FolderKanban className="h-3.5 w-3.5 text-rose-600" /> Subventions & Bailleurs</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/provider-clients" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-teal-600" /> Producteurs clients ({clients.length})</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Hub Polyvalent & Annuaire Écosystème */}
          <Card className="hover:border-primary/50 transition-all">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Handshake className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Annuaire & Partenariats Écosystème</CardTitle>
                  <CardDescription className="text-xs">
                    Connectez votre structure avec l'ensemble du réseau agro-pastoral de KoobNaaba.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <Link to="/dashboard/partners-directory" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Handshake className="h-3.5 w-3.5 text-blue-600" /> Annuaire des partenaires</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/crop-library" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5 text-teal-600" /> Fiches techniques cultures</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/revenus" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5 text-emerald-600" /> Suivi de facturation & recettes</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/partenaire-abonnement" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-primary" /> Abonnement & Services Premium</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subscription upgrade banner */}
      <div className="bg-card border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base">Abonnement Professionnel KoobNaaba</h3>
            <p className="text-xs text-muted-foreground">
              Formule <strong>{activePlan.title}</strong> active avec paiement Mobile Money (Orange Money, Moov Money, Wave).
            </p>
          </div>
        </div>
        <Button asChild className="gradient-primary text-primary-foreground font-semibold shrink-0">
          <Link to="/dashboard/partenaire-abonnement">
            Gérer mon abonnement
          </Link>
        </Button>
      </div>

      {/* Boîte de dialogue de changement de spécialisation métier */}
      <Dialog open={isSwitchDialogOpen} onOpenChange={setIsSwitchDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Sélectionnez votre profil partenaire spécialisé
            </DialogTitle>
            <DialogDescription className="text-xs">
              Les comptes partenaires ne sont pas unifiés : chaque profil dispose d'un espace de travail, d'outils et d'un menu adaptés à son corps de métier.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            {PARTNER_PROFILE_LIST.map((p) => {
              const isSelected = partnerType === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPartnerType(p.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                        {getProfileIcon(p.iconName, "h-4 w-4")}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-foreground leading-snug">{p.title}</h4>
                        <span className="text-[11px] text-muted-foreground">{p.badge}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {p.tagline}
                  </p>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
