import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { partnerStorage, PartnerOffer, QuoteRequest } from "@/lib/partnerStorage";
import { ProductMediaViewer } from "@/components/partner/ProductMediaViewer";
import {
  Plus, Microscope, Bug, Droplets, Tractor, Fish, Egg,
  ClipboardList, MapPin, GraduationCap, Trash2, Clock, CheckCircle, XCircle, Loader2,
  Wheat, Leaf, TreePine, Shield, Beef, Utensils, Heart, Baby, Waves, Mountain, Sun, Home,
  FileSearch, FileText, Award, Warehouse, Factory, ShoppingBag, QrCode, Users, Salad, Sparkles, Eye, Calculator,
  Store, Send, Search, ExternalLink, ShieldCheck, ShoppingCart, RefreshCw
} from "lucide-react";

const SERVICE_CATEGORIES = [
  {
    category: "✨ Aide à la décision & Diagnostic IA",
    services: [
      { value: "diagnostic_ia", label: "Diagnostic IA (Maladie & Ravageur)", icon: Microscope, desc: "Photo de feuille ou tige analysée par vision IA avec détection de carences et recommandations." },
      { value: "ordonnance_agronomique", label: "Ordonnance phytosanitaire signée", icon: FileText, desc: "Prescription agronomique officielle au format PDF délivrée par un conseiller certifié." },
      { value: "scouting_geolocalise", label: "Scouting terrain géolocalisé", icon: Eye, desc: "Audit et relevé d'observations terrain avec coordonnées GPS, intensité d'attaque et rapport." },
      { value: "calcul_agronomique", label: "Calculatrice & Plan de doses", icon: Calculator, desc: "Calcul de densité de semis, fractionnement NPK et besoins en eau ETc selon la parcelle." },
    ],
  },
  {
    category: "🌱 Productions végétales",
    services: [
      { value: "diagnostic_sol", label: "Diagnostic sol et aménagement", icon: Microscope, desc: "Analyse de la qualité du sol, recommandations d'amendement et plan d'aménagement foncier." },
      { value: "diagnostic_maladie", label: "Diagnostic maladie et traitement", icon: Bug, desc: "Identification des maladies et ravageurs, prescription de traitements phytosanitaires adaptés." },
      { value: "lutte_biologique", label: "Lutte biologique intégrée", icon: Bug, desc: "Utilisation d'auxiliaires naturels et méthodes biologiques pour la protection des cultures." },
      { value: "semences", label: "Sélection et certification semences", icon: Wheat, desc: "Conseil sur le choix variétal, semences améliorées et certification des lots de semences." },
      { value: "fertilisation", label: "Plan de fertilisation", icon: Wheat, desc: "Élaboration de plans de fertilisation organique et minérale adaptés à vos sols et cultures." },
      { value: "compostage", label: "Compostage et fumure organique", icon: Leaf, desc: "Techniques de compostage, lombricompostage et valorisation des résidus agricoles." },
      { value: "maraichage", label: "Maraîchage et cultures horticoles", icon: Salad, desc: "Accompagnement technique en cultures maraîchères : planification, rotations et itinéraires techniques." },
      { value: "culture_bio", label: "Agriculture biologique", icon: Leaf, desc: "Conversion et conduite de l'agriculture biologique, cahier des charges et bonnes pratiques." },
      { value: "pepiniere", label: "Pépinière et production de plants", icon: TreePine, desc: "Création de pépinières, multiplication végétative, greffage et production de plants certifiés." },
      { value: "agroforesterie", label: "Agroforesterie", icon: TreePine, desc: "Association arbres-cultures, haies vives, brise-vents et régénération naturelle assistée." },
      { value: "protection_cultures", label: "Protection phytosanitaire", icon: Shield, desc: "Programmes de traitement préventif et curatif, gestion intégrée des nuisibles et résistances." },
    ],
  },
  {
    category: "🐄 Productions animales",
    services: [
      { value: "ferme_volaille", label: "Aviculture et ferme volaille", icon: Egg, desc: "Conception du poulailler, choix des races, plan sanitaire et alimentation." },
      { value: "elevage_bovin", label: "Élevage bovin", icon: Beef, desc: "Conseil en conduite d'élevage bovin : alimentation, reproduction, santé et amélioration génétique." },
      { value: "elevage_caprin", label: "Élevage caprin et ovin", icon: Beef, desc: "Accompagnement technique pour l'élevage de petits ruminants : embouche, lait et viande." },
      { value: "nutrition_animale", label: "Nutrition et alimentation animale", icon: Utensils, desc: "Formulation de rations alimentaires équilibrées et gestion des stocks fourragers." },
      { value: "sante_animale", label: "Santé animale et prophylaxie", icon: Heart, desc: "Plans de vaccination, déparasitage, surveillance épidémiologique et biosécurité." },
      { value: "insemination", label: "Insémination artificielle", icon: Baby, desc: "Service d'insémination artificielle pour l'amélioration génétique du cheptel." },
      { value: "etang_piscicole", label: "Pisciculture et aquaculture", icon: Fish, desc: "Conception d'étangs, aménagement hydraulique, choix des espèces et techniques d'élevage." },
      { value: "apiculture", label: "Apiculture", icon: Bug, desc: "Installation de ruchers, techniques apicoles modernes, récolte et transformation du miel." },
    ],
  },
  {
    category: "🚜 Aménagement et infrastructure",
    services: [
      { value: "ferme_agricole", label: "Mise en place ferme agricole", icon: Tractor, desc: "Accompagnement complet : choix du site, préparation terrain, plan cultural et calendrier." },
      { value: "irrigation", label: "Système d'irrigation", icon: Droplets, desc: "Conception et mise en place de systèmes d'irrigation (goutte-à-goutte, aspersion, gravitaire)." },
      { value: "forage", label: "Forage et adduction d'eau", icon: Droplets, desc: "Étude hydrogéologique, forage de puits, adduction et stockage d'eau pour l'exploitation." },
      { value: "amenagement_bas_fonds", label: "Aménagement de bas-fonds", icon: Waves, desc: "Études topographiques et aménagement de bas-fonds pour la riziculture et le maraîchage." },
      { value: "conservation_sol", label: "Conservation des sols et eaux", icon: Mountain, desc: "Techniques anti-érosives : zaï, demi-lunes, cordons pierreux, terrasses et diguettes." },
      { value: "mecanisation", label: "Mécanisation agricole", icon: Tractor, desc: "Conseil en équipements agricoles, motorisation, entretien et réparation du matériel." },
      { value: "energie_solaire", label: "Énergie solaire agricole", icon: Sun, desc: "Pompage solaire, électrification de fermes et séchage solaire des récoltes." },
      { value: "serre", label: "Serres et tunnels agricoles", icon: Home, desc: "Conception et installation de serres pour les cultures sous abri et hors-sol." },
    ],
  },
  {
    category: "📊 Gestion et accompagnement",
    services: [
      { value: "suivi_exploitation", label: "Planification et suivi d'exploitation", icon: ClipboardList, desc: "Suivi régulier de vos cultures/élevages avec rapports et recommandations." },
      { value: "cartographie_gps", label: "Mesure et cartographie GPS", icon: MapPin, desc: "Relevés GPS précis de vos parcelles, calcul de superficie et cartographie SIG." },
      { value: "audit_exploitation", label: "Audit d'exploitation agricole", icon: FileSearch, desc: "Diagnostic complet de votre exploitation : forces, faiblesses et plan d'amélioration." },
      { value: "plan_affaires", label: "Business plan agricole", icon: FileText, desc: "Élaboration de plans d'affaires et dossiers de financement pour projets agricoles." },
      { value: "certification", label: "Certification et labels", icon: Award, desc: "Accompagnement pour l'obtention de certifications bio, commerce équitable et labels qualité." },
      { value: "analyse_eau", label: "Analyse de la qualité de l'eau", icon: Droplets, desc: "Prélèvement et analyse physico-chimique et bactériologique de l'eau d'irrigation." },
    ],
  },
  {
    category: "📦 Post-récolte et commercialisation",
    services: [
      { value: "stockage", label: "Stockage et conservation", icon: Warehouse, desc: "Techniques de stockage : magasins, silos, sacs hermétiques et lutte contre les ravageurs de stocks." },
      { value: "transformation", label: "Transformation agroalimentaire", icon: Factory, desc: "Techniques de transformation des produits : séchage, décorticage, mouture, conditionnement." },
      { value: "commercialisation", label: "Commercialisation et marchés", icon: ShoppingBag, desc: "Stratégies de vente, accès aux marchés, négociation des prix et mise en réseau." },
      { value: "tracabilite", label: "Traçabilité des produits", icon: QrCode, desc: "Mise en place de systèmes de traçabilité du champ à l'assiette : lots, codes et registres." },
    ],
  },
  {
    category: "🎓 Formation et renforcement",
    services: [
      { value: "formation", label: "Formations techniques", icon: GraduationCap, desc: "Sessions de formation sur les bonnes pratiques agricoles et techniques modernes." },
      { value: "formation_gestion", label: "Formation en gestion", icon: GraduationCap, desc: "Comptabilité simplifiée, gestion financière de l'exploitation et tenue de cahiers." },
      { value: "champ_ecole", label: "Champ école paysan (CEP)", icon: GraduationCap, desc: "Animation de champs écoles pour l'apprentissage pratique en groupe des innovations agricoles." },
    ],
  },
];

const SERVICE_TYPES = SERVICE_CATEGORIES.flatMap(cat => cat.services);

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  en_attente: { label: "En attente", variant: "secondary", icon: Clock },
  en_cours: { label: "En cours", variant: "default", icon: Loader2 },
  terminee: { label: "Terminée", variant: "outline", icon: CheckCircle },
  annulee: { label: "Annulée", variant: "destructive", icon: XCircle },
};

const quoteStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  en_attente: { label: "Transmis — En attente du partenaire", variant: "secondary", icon: Clock },
  acceptee: { label: "Confirmé par le partenaire", variant: "default", icon: CheckCircle },
  refusee: { label: "Annulé / Non disponible", variant: "destructive", icon: XCircle },
  cloturee: { label: "Terminé", variant: "outline", icon: CheckCircle },
};

type ServiceRequest = {
  id: string;
  service_type: string;
  description: string | null;
  location: string | null;
  farm_id: string | null;
  preferred_date: string | null;
  phone: string | null;
  status: string;
  expert_notes: string | null;
  estimated_cost: number | null;
  created_at: string;
};

const PARTNER_CATEGORY_FILTERS = [
  { value: "all", label: "Toutes les offres" },
  { value: "materiel", label: "🚜 Matériel & Tracteurs" },
  { value: "intrants", label: "🧪 Intrants & Fertilisants" },
  { value: "semences", label: "🌱 Semences Certifiées" },
  { value: "elevage", label: "🐄 Élevage & Nutrition" },
  { value: "service", label: "🛠️ Services & Travaux" },
];

const ServicesPage = () => {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [partnerQuotes, setPartnerQuotes] = useState<QuoteRequest[]>([]);
  const [farms, setFarms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [myRequestsTab, setMyRequestsTab] = useState<"quotes" | "technical">("quotes");

  const [form, setForm] = useState({
    service_type: "",
    description: "",
    location: "",
    farm_id: "",
    preferred_date: "",
    phone: "",
  });

  // Partner Offers State
  const [partnerOffers, setPartnerOffers] = useState<PartnerOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [offerSearch, setOfferSearch] = useState("");
  const [offerCategory, setOfferCategory] = useState("all");

  // Quote Request State
  const [quoteOffer, setQuoteOffer] = useState<PartnerOffer | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    requester_name: "",
    contact_phone: "",
    quantity: "1",
    needed_by: "",
    location: "",
    message: "",
  });

  const localRequestsKey = `koobnaaba_local_service_requests_${user?.id || "demo"}`;

  const fetchAll = async () => {
    try {
      // 1. Load local service requests backup
      const rawLocal = localStorage.getItem(localRequestsKey);
      const localReqs: ServiceRequest[] = rawLocal ? JSON.parse(rawLocal) : [];

      let remoteReqs: ServiceRequest[] = [];
      let remoteFarms: any[] = [];

      if (user) {
        try {
          const [rRes, fRes] = await Promise.all([
            supabase.from("service_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
            supabase.from("farms").select("id, name"),
          ]);
          remoteReqs = (rRes.data as ServiceRequest[]) || [];
          remoteFarms = fRes.data || [];
        } catch (sbErr) {
          console.warn("Service requests remote fetch fallback:", sbErr);
        }
      }

      // Merge remote and local requests
      const mergedMap = new Map<string, ServiceRequest>();
      remoteReqs.forEach(r => mergedMap.set(r.id, r));
      localReqs.forEach(r => {
        if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
      });
      const finalRequests = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRequests(finalRequests);
      setFarms(remoteFarms);

      // 2. Load partner offers and quotes
      const [pOffers, pQuotes] = await Promise.all([
        partnerStorage.getOffers(),
        partnerStorage.getQuotes(),
      ]);

      setPartnerOffers(pOffers || []);

      // Filter farmer quotes
      const myQuotes = (pQuotes || []).filter(
        q =>
          q.requester_id === user?.id ||
          q.requester_id === "demo-farmer" ||
          (profile?.phone && q.contact_phone === profile.phone)
      );
      setPartnerQuotes(myQuotes);
    } catch (e) {
      console.error("Error in fetchAll:", e);
    } finally {
      setLoading(false);
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const handlePartnerUpdate = () => {
      fetchAll();
    };
    window.addEventListener("koobnaaba-partner-data-updated", handlePartnerUpdate);
    return () => window.removeEventListener("koobnaaba-partner-data-updated", handlePartnerUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service_type) {
      toast.error("Sélectionnez un type de service");
      return;
    }

    const newReq: ServiceRequest = {
      id: "sr-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      service_type: form.service_type,
      description: form.description || null,
      location: form.location || null,
      farm_id: form.farm_id || null,
      preferred_date: form.preferred_date || null,
      phone: form.phone || null,
      status: "en_attente",
      expert_notes: null,
      estimated_cost: null,
      created_at: new Date().toISOString(),
    };

    // Attempt Supabase insert
    if (user) {
      try {
        const { data, error } = await supabase.from("service_requests").insert({
          user_id: user.id,
          service_type: form.service_type,
          description: form.description || null,
          location: form.location || null,
          farm_id: form.farm_id || null,
          preferred_date: form.preferred_date || null,
          phone: form.phone || null,
        }).select().single();

        if (!error && data) {
          newReq.id = data.id;
        }
      } catch (err) {
        console.warn("Supabase insert warning:", err);
      }
    }

    // Persist to local storage
    const rawLocal = localStorage.getItem(localRequestsKey);
    const existing: ServiceRequest[] = rawLocal ? JSON.parse(rawLocal) : [];
    existing.unshift(newReq);
    localStorage.setItem(localRequestsKey, JSON.stringify(existing));

    setRequests(prev => [newReq, ...prev.filter(r => r.id !== newReq.id)]);
    toast.success("Demande d'intervention envoyée avec succès !");
    setForm({ service_type: "", description: "", location: "", farm_id: "", preferred_date: "", phone: "" });
    setOpen(false);
    setMyRequestsTab("technical");
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Annuler cette demande ?")) return;
    if (user) {
      await supabase.from("service_requests").update({ status: "annulee" }).eq("id", id);
    }
    const rawLocal = localStorage.getItem(localRequestsKey);
    if (rawLocal) {
      const existing: ServiceRequest[] = JSON.parse(rawLocal);
      const updated = existing.map(r => r.id === id ? { ...r, status: "annulee" } : r);
      localStorage.setItem(localRequestsKey, JSON.stringify(updated));
    }
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "annulee" } : r));
    toast.success("Demande annulée");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;
    if (user) {
      await supabase.from("service_requests").delete().eq("id", id);
    }
    const rawLocal = localStorage.getItem(localRequestsKey);
    if (rawLocal) {
      const existing: ServiceRequest[] = JSON.parse(rawLocal);
      const updated = existing.filter(r => r.id !== id);
      localStorage.setItem(localRequestsKey, JSON.stringify(updated));
    }
    setRequests(prev => prev.filter(r => r.id !== id));
    toast.success("Demande supprimée");
  };

  const handleOpenQuote = (offer: PartnerOffer) => {
    setQuoteOffer(offer);
    setQuoteForm({
      requester_name: profile?.full_name || "",
      contact_phone: profile?.phone || "",
      quantity: "1",
      needed_by: "",
      location: "",
      message: `Bonjour, je suis exploitant agricole et intéressé par votre offre « ${offer.title} ». Merci de m'indiquer vos conditions et disponibilités.`,
    });
    setQuoteOpen(true);
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteOffer) return;
    if (!quoteForm.contact_phone.trim()) {
      toast.error("Veuillez renseigner votre numéro de téléphone pour être recontacté.");
      return;
    }

    setQuoteSending(true);
    try {
      const fullMessage = [
        quoteForm.message.trim(),
        quoteForm.location ? `Lieu : ${quoteForm.location}` : null,
      ].filter(Boolean).join("\n\n");

      await partnerStorage.saveQuote({
        offer_id: quoteOffer.id,
        offer_title: quoteOffer.title,
        owner_id: quoteOffer.owner_id,
        partner_name: quoteOffer.partner_name,
        requester_id: user?.id || "demo-farmer",
        requester_name: quoteForm.requester_name.trim() || profile?.full_name || "Exploitant Agricole",
        contact_phone: quoteForm.contact_phone.trim(),
        quantity: quoteForm.quantity.trim() || null,
        needed_by: quoteForm.needed_by || null,
        message: fullMessage || null,
        status: "en_attente",
      });

      toast.success(`Votre demande a été transmise à ${quoteOffer.partner_name} ! Retrouvez-la dans « Mes Demandes »`);
      setQuoteOpen(false);
      window.dispatchEvent(new CustomEvent("koobnaaba-partner-data-updated"));
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de l'envoi de la commande.");
    } finally {
      setQuoteSending(false);
    }
  };

  const handleCancelQuote = async (id: string) => {
    if (!confirm("Annuler cette demande de devis ?")) return;
    await partnerStorage.updateQuoteStatus(id, "refusee", "Demande annulée par l'agriculteur.");
    toast.success("Demande annulée.");
    window.dispatchEvent(new CustomEvent("koobnaaba-partner-data-updated"));
    fetchAll();
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm("Supprimer cette demande de votre historique ?")) return;
    await partnerStorage.deleteQuote(id);
    toast.success("Demande supprimée.");
    window.dispatchEvent(new CustomEvent("koobnaaba-partner-data-updated"));
    fetchAll();
  };

  const getServiceLabel = (type: string) => SERVICE_TYPES.find(s => s.value === type)?.label || type;
  const getServiceIcon = (type: string) => SERVICE_TYPES.find(s => s.value === type)?.icon || ClipboardList;

  // Offres filtrées
  const filteredOffers = useMemo(() => {
    return partnerOffers.filter((o) => {
      const matchCat = offerCategory === "all" || o.category === offerCategory;
      const q = offerSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        o.title.toLowerCase().includes(q) ||
        (o.description || "").toLowerCase().includes(q) ||
        (o.location_name || "").toLowerCase().includes(q) ||
        o.partner_name.toLowerCase().includes(q);
      return matchCat && matchQuery && o.is_active;
    });
  }, [partnerOffers, offerCategory, offerSearch]);

  const totalMyRequests = partnerQuotes.length + requests.length;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Store className="h-3.5 w-3.5" />
            Services & Offres Partenaires Agréés
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Services & Approvisionnement</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Commandez vos intrants, semences certifiées et prestations de matériel (tracteurs, batteuses), ou demandez un accompagnement technique officiel.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground font-semibold shadow-xs shrink-0">
              <Plus className="h-4 w-4 mr-2" /> Demander un service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Demander un service technique</DialogTitle>
              <DialogDescription className="text-xs">
                Sélectionnez la prestation requise pour votre exploitation agricole ou pastorale.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label className="font-semibold">Type de service *</Label>
                {SERVICE_CATEGORIES.map(({ category, services }) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">{category}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      {services.map(({ value, label, icon: Icon, desc }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, service_type: value }))}
                          className={`flex items-start gap-3 rounded-xl border-2 p-2.5 text-left transition-all ${
                            form.service_type === value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40 hover:bg-muted/50"
                          }`}
                        >
                          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${form.service_type === value ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <span className="text-xs font-semibold leading-tight block">{label}</span>
                            <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {farms.length > 0 && (
                  <div className="space-y-2">
                    <Label>Exploitation concernée</Label>
                    <Select value={form.farm_id} onValueChange={v => setForm(f => ({ ...f, farm_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner (optionnel)" /></SelectTrigger>
                      <SelectContent>
                        {farms.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Localisation</Label>
                  <Input placeholder="Village, commune…" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Date souhaitée</Label>
                  <Input type="date" value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone de contact *</Label>
                  <Input required placeholder="+226 70 00 00 00" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description détaillée</Label>
                <Textarea placeholder="Décrivez votre besoin, la situation actuelle, etc." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Envoyer la demande</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="offres-partenaires" className="space-y-6">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full max-w-2xl h-auto p-1 gap-1">
          <TabsTrigger value="offres-partenaires" className="gap-2 py-2.5">
            <Store className="h-4 w-4" /> Offres des Partenaires ({partnerOffers.filter(o => o.is_active).length})
          </TabsTrigger>
          <TabsTrigger value="mes-demandes" className="gap-2 py-2.5">
            <ClipboardList className="h-4 w-4" /> Mes Demandes ({totalMyRequests})
          </TabsTrigger>
          <TabsTrigger value="catalogue-technique" className="gap-2 py-2.5">
            <Microscope className="h-4 w-4" /> Prestations Agronomiques
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OFFRES DES PARTENAIRES AGRÉÉS */}
        <TabsContent value="offres-partenaires" className="space-y-6">
          {/* Search & Categories Bar */}
          <div className="bg-card border rounded-2xl p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher tracteur, semences maïs, NPK, vaccin, broyeur, ville..."
                value={offerSearch}
                onChange={(e) => setOfferSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {PARTNER_CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setOfferCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    offerCategory === cat.value
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loadingOffers ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : filteredOffers.length === 0 ? (
            <Card className="shadow-xs border-dashed text-center py-12">
              <CardContent className="space-y-3">
                <Store className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-base font-semibold">Aucune offre trouvée</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Aucune offre ne correspond à vos filtres actuels. Modifiez votre recherche ou explorez une autre catégorie.
                </p>
                <Button size="sm" variant="outline" onClick={() => { setOfferSearch(""); setOfferCategory("all"); }}>
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((offer) => (
                <Card
                  key={offer.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border hover:shadow-warm transition-all"
                >
                  <div>
                    {/* Media Header */}
                    <div className="relative h-44 bg-muted overflow-hidden">
                      {offer.media && offer.media.length > 0 ? (
                        <div className="h-full w-full">
                          <ProductMediaViewer media={offer.media} title={offer.title} />
                        </div>
                      ) : offer.image_url ? (
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary">
                          <Store className="h-10 w-10" />
                        </div>
                      )}
                      <Badge className="absolute top-2.5 left-2.5 bg-background/90 text-foreground border backdrop-blur-xs text-[10px] font-semibold">
                        {offer.category.toUpperCase()}
                      </Badge>
                    </div>

                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
                        <Link
                          to={`/partenaire/${offer.owner_id}`}
                          className="font-medium hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[200px]"
                          title="Voir la vitrine complète du partenaire"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{offer.partner_name}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
                        </Link>
                        {offer.location_name && (
                          <span className="flex items-center gap-1 shrink-0">
                            <MapPin className="h-3 w-3" /> {offer.location_name}
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-base leading-snug line-clamp-2 text-foreground">
                        {offer.title}
                      </h3>

                      {offer.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {offer.description}
                        </p>
                      )}

                      {offer.price_indication && (
                        <div className="pt-2">
                          <span className="text-xs text-muted-foreground">Tarif indicatif : </span>
                          <span className="text-sm font-bold text-primary">
                            {offer.price_indication} {offer.unit ? `/ ${offer.unit}` : ""}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0 border-t mt-2 flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      <Link to={`/partenaire/${offer.owner_id}`}>
                        Voir vitrine
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenQuote(offer)}
                      className="gradient-primary text-primary-foreground font-semibold text-xs flex-1"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Commander
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2 : MES DEMANDES & COMMANDES */}
        <TabsContent value="mes-demandes" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-heading font-semibold">Suivi de vos demandes et commandes</h2>
              <p className="text-xs text-muted-foreground">
                Consultez en temps réel vos commandes de matériel/intrants et vos demandes d'intervention technique.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={fetchAll} title="Actualiser les demandes">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Actualiser
              </Button>
              <Button size="sm" onClick={() => setOpen(true)} className="gradient-primary text-primary-foreground text-xs font-semibold">
                <Plus className="h-3.5 w-3.5 mr-1" /> Nouvelle demande
              </Button>
            </div>
          </div>

          {/* Sub-tabs for Quotes vs Technical Requests */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setMyRequestsTab("quotes")}
              className={`pb-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                myRequestsTab === "quotes"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Commandes & Devis Partenaires ({partnerQuotes.length})
            </button>
            <button
              onClick={() => setMyRequestsTab("technical")}
              className={`pb-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                myRequestsTab === "technical"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Microscope className="h-4 w-4" />
              Interventions Techniques ({requests.length})
            </button>
          </div>

          {/* SOUS-ONGLET COMMANDES & DEVIS PARTENAIRES */}
          {myRequestsTab === "quotes" && (
            <div className="space-y-3">
              {partnerQuotes.length === 0 ? (
                <Card className="shadow-xs border-dashed text-center py-10">
                  <CardContent className="space-y-3">
                    <Store className="h-10 w-10 text-muted-foreground mx-auto" />
                    <p className="text-sm font-semibold">Aucune commande ou demande de devis partenaire</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Parcourez le catalogue des partenaires pour commander du matériel, des semences, des engrais ou des prestations.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                partnerQuotes.map((quote) => {
                  const st = quoteStatusConfig[quote.status] || quoteStatusConfig.en_attente;
                  const StIcon = st.icon;
                  return (
                    <Card key={quote.id} className="shadow-xs hover:border-primary/40 transition-colors">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Store className="h-5 w-5" />
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-foreground">
                                {quote.offer_title || "Prestation / Produit partenaire"}
                              </h3>
                              <Badge variant={st.variant} className="flex items-center gap-1 text-xs">
                                <StIcon className="h-3 w-3" />
                                {st.label}
                              </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground">
                              Partenaire : <strong className="text-foreground">{quote.partner_name || "Partenaire agréé"}</strong>
                            </p>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                              {quote.quantity && <span>📦 Quantité : <strong className="text-foreground">{quote.quantity}</strong></span>}
                              {quote.needed_by && <span>📅 Échéance : <strong className="text-foreground">{quote.needed_by}</strong></span>}
                              {quote.contact_phone && <span>📞 Contact : <strong className="text-foreground">{quote.contact_phone}</strong></span>}
                              <span>Créée le {new Date(quote.created_at).toLocaleDateString("fr-FR")}</span>
                            </div>

                            {quote.message && (
                              <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-md mt-1 leading-relaxed">
                                {quote.message}
                              </p>
                            )}

                            {quote.response && (
                              <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                                <p className="text-xs font-semibold text-primary">Réponse du partenaire :</p>
                                <p className="text-xs text-foreground mt-0.5">{quote.response}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center sm:flex-col gap-1 shrink-0 self-end sm:self-auto">
                          {quote.status === "en_attente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelQuote(quote.id)}
                              className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Annuler
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Supprimer la demande"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* SOUS-ONGLET INTERVENTIONS TECHNIQUES */}
          {myRequestsTab === "technical" && (
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
              ) : requests.length === 0 ? (
                <Card className="shadow-xs border-dashed text-center py-10">
                  <CardContent className="space-y-3">
                    <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto" />
                    <p className="text-sm font-semibold">Aucune demande d'intervention enregistrée</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Besoin d'un diagnostic sol, d'un traitement phytosanitaire ou d'un aménagement ? Soumettez votre demande en un clic.
                    </p>
                    <Button size="sm" onClick={() => setOpen(true)} className="gradient-primary text-primary-foreground">
                      Créer ma première demande
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                requests.map(req => {
                  const ServiceIcon = getServiceIcon(req.service_type);
                  const st = statusConfig[req.status] || statusConfig.en_attente;
                  const StIcon = st.icon;
                  return (
                    <Card key={req.id} className="shadow-xs hover:border-primary/40 transition-colors">
                      <CardContent className="flex items-start gap-4 pt-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <ServiceIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">{getServiceLabel(req.service_type)}</p>
                            <Badge variant={st.variant} className="flex items-center gap-1 text-xs">
                              <StIcon className="h-3 w-3" />{st.label}
                            </Badge>
                          </div>
                          {req.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{req.description}</p>}
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                            {req.location && <span>📍 {req.location}</span>}
                            {req.preferred_date && <span>📅 {new Date(req.preferred_date).toLocaleDateString("fr-FR")}</span>}
                            {req.phone && <span>📞 {req.phone}</span>}
                            <span>Créée le {new Date(req.created_at).toLocaleDateString("fr-FR")}</span>
                          </div>
                          {req.expert_notes && (
                            <div className="mt-2 p-2 rounded-lg bg-muted/50 border border-border">
                              <p className="text-xs font-semibold text-foreground">Réponse de l'expert :</p>
                              <p className="text-xs text-muted-foreground">{req.expert_notes}</p>
                              {(req.estimated_cost ?? 0) > 0 && (
                                <p className="text-xs font-semibold text-primary mt-1">Coût estimé : {Number(req.estimated_cost).toLocaleString()} FCFA</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {req.status === "en_attente" && (
                            <Button variant="ghost" size="icon" onClick={() => handleCancel(req.id)} title="Annuler">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                          {(req.status === "annulee" || req.status === "terminee") && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(req.id)} title="Supprimer">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: CATALOGUE TECHNIQUE OFFICIEL */}
        <TabsContent value="catalogue-technique" className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-heading font-semibold">Prestations agronomiques et d'ingénierie</h2>
            <p className="text-xs text-muted-foreground">
              Cliquez sur un service pour planifier directement une intervention sur vos parcelles.
            </p>
          </div>

          <div className="space-y-6">
            {SERVICE_CATEGORIES.map(({ category, services }) => (
              <div key={category}>
                <h3 className="text-sm font-heading font-semibold mb-2.5 text-foreground">{category}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map(({ value, label, icon: Icon, desc }) => (
                    <Card
                      key={value}
                      className="shadow-xs hover:shadow-warm transition-all cursor-pointer border-border hover:border-primary/50"
                      onClick={() => { setForm(f => ({ ...f, service_type: value })); setOpen(true); }}
                    >
                      <CardContent className="flex items-start gap-3 pt-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quote Request Modal */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Demande de Devis & Commande
            </DialogTitle>
            <DialogDescription className="text-xs">
              Votre demande sera transmise immédiatement au partenaire agréé via son espace professionnel KoobNaaba.
            </DialogDescription>
          </DialogHeader>

          {quoteOffer && (
            <div className="bg-muted/60 p-3 rounded-xl border border-border flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-background overflow-hidden shrink-0 border">
                {quoteOffer.media && quoteOffer.media.length > 0 ? (
                  <img src={quoteOffer.media[0].url} alt="" className="w-full h-full object-cover" />
                ) : quoteOffer.image_url ? (
                  <img src={quoteOffer.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary"><Store className="h-5 w-5" /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{quoteOffer.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">Partenaire : {quoteOffer.partner_name}</p>
                {quoteOffer.price_indication && (
                  <p className="text-xs font-bold text-primary mt-0.5">
                    {quoteOffer.price_indication} {quoteOffer.unit && `/ ${quoteOffer.unit}`}
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSendQuote} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Votre Nom / Exploitation *</Label>
                <Input
                  required
                  placeholder="Ex: Coopérative Wend-Panga"
                  value={quoteForm.requester_name}
                  onChange={(e) => setQuoteForm((f) => ({ ...f, requester_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Téléphone WhatsApp / Appel *</Label>
                <Input
                  required
                  placeholder="Ex: +226 70 00 00 00"
                  value={quoteForm.contact_phone}
                  onChange={(e) => setQuoteForm((f) => ({ ...f, contact_phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Quantité / Hectares souhaités</Label>
                <Input
                  placeholder="Ex: 5 sacs, 3 hectares, 2 jours…"
                  value={quoteForm.quantity}
                  onChange={(e) => setQuoteForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date ou échéance souhaitée</Label>
                <Input
                  type="date"
                  value={quoteForm.needed_by}
                  onChange={(e) => setQuoteForm((f) => ({ ...f, needed_by: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Lieu de livraison ou d'intervention</Label>
              <Input
                placeholder="Ex: Commune de Koudougou, Village de Villy"
                value={quoteForm.location}
                onChange={(e) => setQuoteForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Précisions & Questions</Label>
              <Textarea
                rows={3}
                placeholder="Décrivez vos besoins spécifiques, accès terrain, etc."
                value={quoteForm.message}
                onChange={(e) => setQuoteForm((f) => ({ ...f, message: e.target.value }))}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setQuoteOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={quoteSending} className="gradient-primary text-primary-foreground font-semibold">
                {quoteSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Envoyer ma demande au partenaire
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;
