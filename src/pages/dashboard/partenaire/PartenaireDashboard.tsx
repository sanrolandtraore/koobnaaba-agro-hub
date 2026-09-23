import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Store, Plus, Phone, CheckCircle2, Clock, XCircle, Trash2,
  ExternalLink, Copy, SlidersHorizontal, Package, Briefcase, FileText,
  FlaskConical, Tractor, Microscope, Beef, Landmark, Handshake, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoredProviderSubscription } from "@/lib/providerSubscription";
import { partnerStorage, PartnerOffer, QuoteRequest, PartnerMission } from "@/lib/partnerStorage";
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
  const [sub] = useState(() => getStoredProviderSubscription());
  const [offers, setOffers] = useState<PartnerOffer[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [missions, setMissions] = useState<PartnerMission[]>([]);
  const [loading, setLoading] = useState(true);

  // Vue active : "offres" ou "commandes"
  const [activeTab, setActiveTab] = useState<"offres" | "commandes">("offres");

  // Dialogs
  const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);

  // Formulaire d'ajout d'offre
  const [offerTitle, setOfferTitle] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerUnit, setOfferUnit] = useState("sac");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerPhone, setOfferPhone] = useState(user?.phone || "+226 ");

  const activeMeta = PARTNER_PROFILES[partnerType] || PARTNER_PROFILES.fournisseur_intrants;

  const loadData = async () => {
    setLoading(true);
    try {
      const [o, q, m] = await Promise.all([
        partnerStorage.getOffers(user?.id),
        partnerStorage.getQuotes(),
        partnerStorage.getMissions(user?.id),
      ]);
      setOffers(o);
      setQuotes(q);
      setMissions(m);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("koobnaaba-partner-data-updated", handleUpdate);
    return () => window.removeEventListener("koobnaaba-partner-data-updated", handleUpdate);
  }, [user]);

  // Ajouter une offre simplement
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim()) {
      toast.error("Veuillez saisir le nom de votre produit ou service.");
      return;
    }

    try {
      await partnerStorage.saveOffer({
        owner_id: user?.id || "demo-partner-id",
        partner_name: profile?.full_name || sub.companyName || "Partenaire KoobNaaba",
        category: partnerType === "fournisseur_intrants" ? "intrants" : partnerType === "machinisme_travaux" ? "materiel" : "services",
        title: offerTitle.trim(),
        description: offerDesc.trim() || null,
        price_indication: offerPrice.trim() || "Sur devis",
        unit: offerUnit.trim() || "unité",
        contact_phone: offerPhone.trim() || null,
        is_active: true,
      });

      toast.success("Produit / Service publié avec succès !");
      setIsAddOfferOpen(false);
      setOfferTitle("");
      setOfferPrice("");
      setOfferDesc("");
      loadData();
    } catch (err: any) {
      toast.error("Erreur lors de la publication : " + (err?.message || "Erreur inconnue"));
    }
  };

  // Supprimer une offre
  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm("Voulez-vous vraiment retirer cette offre ?")) return;
    try {
      await partnerStorage.deleteOffer(offerId);
      toast.success("Offre supprimée.");
      loadData();
    } catch (err: any) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  // Traiter une commande (Accepter / Refuser)
  const handleQuoteStatus = async (quoteId: string, status: "acceptee" | "refusee") => {
    try {
      await partnerStorage.updateQuoteStatus(quoteId, status);
      toast.success(status === "acceptee" ? "Commande validée !" : "Commande déclinée.");
      loadData();
    } catch (err: any) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const pendingQuotesCount = quotes.filter((q) => q.status === "en_attente").length;
  const activeMissionsCount = missions.filter((m) => m.status === "planifiee" || m.status === "en_cours").length;

  return (
    <div className="p-3 sm:p-5 md:p-6 max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* ── 1. EN-TÊTE SIMPLIFIÉ PARTENAIRE ── */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {getProfileIcon(activeMeta.iconName, "h-3.5 w-3.5")}
              {activeMeta.badge}
            </span>
            <button
              onClick={() => setIsSwitchDialogOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <SlidersHorizontal className="h-3 w-3" /> Changer de spécialisation
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight">
            Espace {profile?.full_name || sub.companyName || "Partenaire"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {activeMeta.dashboardTitle} — Gérez simplement votre catalogue et répondez directement aux producteurs.
          </p>
        </div>

        {/* Boutons Vitrine & Partage */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = `${window.location.origin}/partenaire/${user?.id || "demo-partner-id"}`;
              navigator.clipboard.writeText(url);
              toast.success("Lien de votre vitrine copié ! Vous pouvez le coller sur WhatsApp.");
            }}
            className="rounded-xl h-10 gap-1.5 text-xs font-bold"
          >
            <Copy className="h-3.5 w-3.5" /> Copier lien vitrine
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-xl h-10 gradient-primary text-primary-foreground gap-1.5 text-xs font-bold shadow-xs"
          >
            <Link to={`/partenaire/${user?.id || "demo-partner-id"}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" /> Voir ma vitrine
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 2. LES 3 INDICATEURS CLÉS (SANS INFORMATION INUTILE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => setActiveTab("offres")}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all",
            activeTab === "offres"
              ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30"
              : "bg-card border-border hover:border-primary/40"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Mes Produits & Offres</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{offers.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {offers.filter((o) => o.is_active).length} disponibles sur le hub
          </p>
        </button>

        <button
          onClick={() => setActiveTab("commandes")}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all relative",
            activeTab === "commandes"
              ? "bg-emerald-500/5 border-emerald-600 shadow-xs ring-1 ring-emerald-600/30"
              : "bg-card border-border hover:border-emerald-600/40"
          )}
        >
          {pendingQuotesCount > 0 && (
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold animate-pulse">
              {pendingQuotesCount} nouvelle(s)
            </span>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Commandes & Devis</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{quotes.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {pendingQuotesCount} en attente de réponse
          </p>
        </button>

        <Link
          to="/dashboard/missions"
          className="p-4 rounded-2xl border bg-card border-border hover:border-amber-500/40 text-left transition-all block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Chantiers & Prestations</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{activeMissionsCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Dossiers en cours de réalisation</p>
        </Link>
      </div>

      {/* ── 3. VUE PRINCIPALE : 2 BOUTONS D'ONGLETS DIRECTS ── */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("offres")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === "offres"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Package className="h-4 w-4" /> Mes Produits & Services ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab("commandes")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === "commandes"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="h-4 w-4" /> Commandes Reçues ({quotes.length})
        </button>
      </div>

      {/* ── CONTENU ONGLET 1 : PRODUITS ET SERVICES ── */}
      {activeTab === "offres" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Catalogue de vos offres</h2>
              <p className="text-xs text-muted-foreground">
                Visible immédiatement par tous les agriculteurs et éleveurs du Burkina Faso.
              </p>
            </div>
            <Button
              onClick={() => setIsAddOfferOpen(true)}
              className="gradient-primary text-primary-foreground font-bold text-xs h-10 px-4 rounded-xl gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Ajouter un produit / service
            </Button>
          </div>

          {offers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-3">
              <Package className="h-10 w-10 text-muted-foreground mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-foreground">Aucune offre publiée</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  Publiez vos engrais, semences certifiées, matériel ou prestations pour recevoir des commandes.
                </p>
              </div>
              <Button
                onClick={() => setIsAddOfferOpen(true)}
                className="gradient-primary text-primary-foreground font-bold text-xs rounded-xl"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Publier ma première offre
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-card border border-border/80 hover:border-primary/50 transition-all rounded-2xl p-4 flex flex-col justify-between shadow-xs space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/30">
                        {offer.category}
                      </Badge>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="text-muted-foreground hover:text-rose-600 transition-colors p-1"
                        title="Supprimer l'offre"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                      {offer.title}
                    </h3>
                    {offer.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {offer.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-foreground text-sm">
                        {offer.price_indication}
                      </span>
                      {offer.unit && (
                        <span className="text-muted-foreground text-[11px]"> / {offer.unit}</span>
                      )}
                    </div>
                    <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-none text-[10px] font-bold">
                      Actif
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CONTENU ONGLET 2 : COMMANDES ET DEVIS REÇUS ── */}
      {activeTab === "commandes" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Demandes de devis & commandes directes</h2>
            <p className="text-xs text-muted-foreground">
              Les producteurs vous contactent pour vos articles. Validez en 1 clic ou appelez-les directement.
            </p>
          </div>

          {quotes.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
              <h4 className="text-sm font-bold text-foreground">Aucune commande reçue</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Dès qu'un producteur commande vos intrants ou réserve vos services, la demande s'affichera ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => {
                const isPending = quote.status === "en_attente";
                const isAccepted = quote.status === "acceptee";

                return (
                  <div
                    key={quote.id}
                    className={cn(
                      "p-4 rounded-2xl border bg-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs",
                      isPending ? "border-emerald-600/40 bg-emerald-500/5" : "border-border"
                    )}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {quote.requester_name || "Producteur Agricole"}
                        </span>
                        <Badge
                          className={cn(
                            "text-[10px] font-bold border-none",
                            isAccepted
                              ? "bg-emerald-600 text-white"
                              : quote.status === "refusee"
                              ? "bg-rose-600 text-white"
                              : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                          )}
                        >
                          {isAccepted ? "Validée" : quote.status === "refusee" ? "Refusée" : "En attente"}
                        </Badge>
                      </div>

                      <p className="text-sm font-semibold text-foreground">
                        {quote.offer_title || quote.message || "Demande de fourniture"}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {quote.quantity && (
                          <span>Quantité : <strong className="text-foreground">{quote.quantity}</strong></span>
                        )}
                        {quote.contact_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-emerald-600" />
                            <strong className="text-foreground">{quote.contact_phone}</strong>
                          </span>
                        )}
                        <span>Reçue le {new Date(quote.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>

                    {/* Actions directes 1-Clic */}
                    <div className="flex items-center gap-2 shrink-0">
                      {quote.contact_phone && (
                        <a
                          href={`tel:${quote.contact_phone}`}
                          className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-primary" /> Appeler
                        </a>
                      )}

                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleQuoteStatus(quote.id, "acceptee")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-3 gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuoteStatus(quote.id, "refusee")}
                            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold rounded-xl h-9 px-2.5"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Refuser
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL AJOUT D'OFFRE (PRODUIT / PRESTATION) ── */}
      <Dialog open={isAddOfferOpen} onOpenChange={setIsAddOfferOpen}>
        <DialogContent className="max-w-md rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Publier un produit ou un service</DialogTitle>
            <DialogDescription className="text-xs">
              Remplissez les informations essentielles pour diffuser votre offre auprès des producteurs.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOffer} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <Label htmlFor="oTitle" className="text-xs font-bold">Nom du produit / service *</Label>
              <Input
                id="oTitle"
                placeholder="Ex: Engrais NPK 14-23-14, Labour tracteur 75CV, Semence maïs…"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                required
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="oPrice" className="text-xs font-bold">Prix indicatif</Label>
                <Input
                  id="oPrice"
                  placeholder="Ex: 22 500 FCFA"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="oUnit" className="text-xs font-bold">Unité de vente</Label>
                <Input
                  id="oUnit"
                  placeholder="Ex: sac de 50kg, hectare, jour"
                  value={offerUnit}
                  onChange={(e) => setOfferUnit(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="oDesc" className="text-xs font-bold">Courte description</Label>
              <Textarea
                id="oDesc"
                rows={2}
                placeholder="Précisez la marque, la disponibilité ou les conditions de livraison…"
                value={offerDesc}
                onChange={(e) => setOfferDesc(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="oPhone" className="text-xs font-bold">Numéro de commande WhatsApp / Appel</Label>
              <Input
                id="oPhone"
                placeholder="+226 70 00 00 00"
                value={offerPhone}
                onChange={(e) => setOfferPhone(e.target.value)}
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOfferOpen(false)}
                className="rounded-xl text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground font-bold text-xs rounded-xl"
              >
                Publier l'offre
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL CHANGEMENT DE SPÉCIALISATION PARTENAIRE ── */}
      <Dialog open={isSwitchDialogOpen} onOpenChange={setIsSwitchDialogOpen}>
        <DialogContent className="max-w-xl rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Changer de spécialisation métier</DialogTitle>
            <DialogDescription className="text-xs">
              Les comptes partenaires ne sont pas unifiés : chaque métier dispose de son interface sur-mesure.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {PARTNER_PROFILE_LIST.filter((p) => p.id !== "polyvalent").map((p) => {
              const isSelected = partnerType === p.id;
              const IconComp = getProfileIcon(PARTNER_PROFILES[p.id].iconName, "h-4 w-4");

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setPartnerType(p.id);
                    setIsSwitchDialogOpen(false);
                    toast.success(`Espace adapté : ${p.title}`);
                  }}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {IconComp}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block text-foreground truncate">{p.shortLabel}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{p.tagline}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
