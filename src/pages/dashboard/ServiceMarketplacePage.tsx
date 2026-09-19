import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ProviderMap from "@/components/marketplace/ProviderMap";
import {
  Search, X, MapPin, Phone, Plus, ShoppingBag, Lock, Unlock, CheckCircle,
  Clock, Loader2, XCircle, Eye, FileImage, Trash2, Package, Send, Shield,
  Tractor, Star, Calendar, Mail, Globe, Store,
} from "lucide-react";

// ─── Service categories ───
const CATEGORIES = [
  { value: "conseil_agronomique", label: "Conseil agronomique" },
  { value: "labour_mecanise", label: "Labour mécanisé" },
  { value: "traitement_phytosanitaire", label: "Traitement phytosanitaire" },
  { value: "irrigation", label: "Irrigation" },
  { value: "semis", label: "Semis & plantation" },
  { value: "recolte", label: "Récolte & battage" },
  { value: "transport", label: "Transport agricole" },
  { value: "stockage", label: "Stockage & conservation" },
  { value: "transformation", label: "Transformation" },
  { value: "formation", label: "Formation" },
  { value: "veterinaire", label: "Service vétérinaire" },
  { value: "forage", label: "Forage & hydraulique" },
  { value: "cartographie", label: "Cartographie GPS" },
  { value: "construction", label: "Construction agricole" },
  { value: "autre", label: "Autre" },
];

const PRICE_UNITS = [
  { value: "forfait", label: "Forfait" },
  { value: "par_hectare", label: "Par hectare" },
  { value: "par_jour", label: "Par jour" },
  { value: "par_heure", label: "Par heure" },
  { value: "par_tonne", label: "Par tonne" },
];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  en_attente: { label: "En attente", icon: Clock, color: "text-yellow-600" },
  acceptee: { label: "Acceptée", icon: CheckCircle, color: "text-blue-600" },
  en_cours: { label: "En cours", icon: Loader2, color: "text-blue-600" },
  terminee: { label: "Service rendu", icon: CheckCircle, color: "text-green-600" },
  annulee: { label: "Annulée", icon: XCircle, color: "text-destructive" },
  litige: { label: "Litige", icon: Shield, color: "text-orange-600" },
};

const ESCROW_CONFIG: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  bloque: { label: "💰 Fonds bloqués", icon: Lock, variant: "secondary" },
  debloque: { label: "✅ Fonds débloqués", icon: Unlock, variant: "default" },
  rembourse: { label: "↩️ Remboursé", icon: XCircle, variant: "destructive" },
};

const equipTypeLabels: Record<string, string> = {
  tracteur: "Tracteur", motoculteur: "Motoculteur", semoir: "Semoir",
  pulverisateur: "Pulvérisateur", remorque: "Remorque", irrigation: "Irrigation",
  batteuse: "Batteuse", autre: "Autre",
};

// ─── Types ───
type MarketService = {
  id: string; provider_id: string; title: string; description: string | null;
  category: string; price: number; price_unit: string; location_name: string | null;
  phone: string | null; images: string[] | null; is_active: boolean; created_at: string;
};
type MarketOrder = {
  id: string; service_id: string; client_id: string; provider_id: string;
  amount: number; status: string; escrow_status: string; client_notes: string | null;
  provider_proof: string | null; provider_proof_images: string[] | null;
  completed_at: string | null; released_at: string | null; created_at: string;
  service?: MarketService;
};
type EquipmentListing = {
  id: string; title: string; equipment_type: string; brand: string | null;
  model: string | null; daily_rate: number; deposit_amount: number;
  location_name: string | null; description: string | null; status: string;
  avg_rating: number | null; review_count: number | null;
  availability_start: string | null; availability_end: string | null; images: string[] | null;
};
type InputSupplier = {
  id: string; name: string; category: string; description: string | null;
  address: string | null; contact_phone: string | null; contact_email: string | null;
  website: string | null; is_verified: boolean;
};

const ServiceMarketplacePage = () => {
  const { user, primaryRole } = useAuth();
  const isProvider = primaryRole === "agent_technique" || primaryRole === "agriculteur" || primaryRole === "partenaire";
  const isClient = primaryRole === "agriculteur" || primaryRole === "eleveur";

  const [services, setServices] = useState<MarketService[]>([]);
  const [myOrders, setMyOrders] = useState<MarketOrder[]>([]);
  const [equipment, setEquipment] = useState<EquipmentListing[]>([]);
  const [suppliers, setSuppliers] = useState<InputSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [searchEquip, setSearchEquip] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [selectedMapService, setSelectedMapService] = useState<MarketService | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  const [showCreateService, setShowCreateService] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState<MarketOrder | null>(null);
  const [selectedService, setSelectedService] = useState<MarketService | null>(null);

  const [serviceForm, setServiceForm] = useState({
    title: "", description: "", category: "autre", price: "", price_unit: "forfait",
    location_name: "", phone: "",
  });
  const [orderNotes, setOrderNotes] = useState("");
  const [proofText, setProofText] = useState("");

  const fetchData = async () => {
    if (!user) return;
    const [svcRes, ordRes, eqRes, supRes] = await Promise.all([
      supabase.from("marketplace_services").select("*").order("created_at", { ascending: false }),
      supabase.from("marketplace_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("equipment_listings").select("*").eq("status", "disponible").order("created_at", { ascending: false }),
      supabase.from("partner_directory").select("*").eq("category", "fournisseur_intrants").order("name"),
    ]);
    const allServices = (svcRes.data || []) as MarketService[];
    setServices(allServices);
    const orders = (ordRes.data || []) as MarketOrder[];
    setMyOrders(orders.map(o => ({ ...o, service: allServices.find(s => s.id === o.service_id) })));
    setEquipment((eqRes.data as EquipmentListing[]) || []);
    setSuppliers((supRes.data as InputSupplier[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setUserPosition([coords.latitude, coords.longitude]),
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 },
    );
  }, []);

  // ─── Service CRUD ───
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.price) { toast.error("Titre et prix requis"); return; }
    const { error } = await supabase.from("marketplace_services").insert({
      provider_id: user!.id, title: serviceForm.title, description: serviceForm.description || null,
      category: serviceForm.category, price: parseFloat(serviceForm.price), price_unit: serviceForm.price_unit,
      location_name: serviceForm.location_name || null, phone: serviceForm.phone || null,
      latitude: userPosition?.[0] ?? null, longitude: userPosition?.[1] ?? null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Service publié !"); setShowCreateService(false); setServiceForm({ title: "", description: "", category: "autre", price: "", price_unit: "forfait", location_name: "", phone: "" }); fetchData(); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedService || !user) return;
    const { error } = await supabase.from("marketplace_orders").insert({
      service_id: selectedService.id, client_id: user.id, provider_id: selectedService.provider_id,
      amount: selectedService.price, client_notes: orderNotes || null, status: "en_attente", escrow_status: "bloque",
    });
    if (error) toast.error(error.message);
    else { toast.success("Commande passée ! Le paiement est bloqué chez KoobNaaba."); setShowOrderDialog(false); setOrderNotes(""); setSelectedService(null); fetchData(); }
  };

  const handleSubmitProof = async (orderId: string) => {
    const { error } = await supabase.from("marketplace_orders").update({ provider_proof: proofText, status: "terminee", completed_at: new Date().toISOString() }).eq("id", orderId);
    if (error) toast.error(error.message);
    else { toast.success("Preuve soumise."); setProofText(""); setShowOrderDetail(null); fetchData(); }
  };

  const handleReleaseFunds = async (orderId: string) => {
    const { error } = await supabase.from("marketplace_orders").update({ escrow_status: "debloque", released_at: new Date().toISOString() }).eq("id", orderId);
    if (error) toast.error(error.message);
    else { toast.success("Fonds débloqués !"); setShowOrderDetail(null); fetchData(); }
  };

  const handleAcceptOrder = async (orderId: string) => {
    const { error } = await supabase.from("marketplace_orders").update({ status: "acceptee" }).eq("id", orderId);
    if (error) toast.error(error.message);
    else { toast.success("Commande acceptée"); fetchData(); setShowOrderDetail(null); }
  };

  const handleCancelOrder = async (orderId: string) => {
    const { error } = await supabase.from("marketplace_orders").update({ status: "annulee", escrow_status: "rembourse" }).eq("id", orderId);
    if (error) toast.error(error.message);
    else { toast.success("Commande annulée, fonds remboursés"); fetchData(); setShowOrderDetail(null); }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;
    const { error } = await supabase.from("marketplace_services").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Service supprimé"); fetchData(); }
  };

  const getCategoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;
  const getPriceUnitLabel = (u: string) => PRICE_UNITS.find(p => p.value === u)?.label || u;

  const filteredServices = services.filter(s => {
    const matchSearch = `${s.title} ${s.description || ""} ${s.location_name || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || s.category === catFilter;
    return matchSearch && matchCat;
  });
  const filteredEquip = equipment.filter(e => `${e.title} ${e.equipment_type} ${e.brand || ""} ${e.location_name || ""}`.toLowerCase().includes(searchEquip.toLowerCase()));
  const filteredSuppliers = suppliers.filter(s => `${s.name} ${s.address || ""} ${s.description || ""}`.toLowerCase().includes(searchSupplier.toLowerCase()));

  const myServices = services.filter(s => s.provider_id === user?.id);
  const clientOrders = myOrders.filter(o => o.client_id === user?.id);
  const providerOrders = myOrders.filter(o => o.provider_id === user?.id);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" /> Marketplace Agricole
          </h1>
          <p className="text-muted-foreground mt-1">Services, matériels et fournisseurs — paiement sécurisé par KoobNaaba</p>
        </div>
        {isProvider && (
          <Button onClick={() => setShowCreateService(true)} className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> Proposer un service
          </Button>
        )}
      </div>

      {/* Escrow explainer */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 pt-4">
          <Shield className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Paiement sécurisé par KoobNaaba</p>
            <p className="text-xs text-muted-foreground mt-1">
              Quand vous commandez un service, le paiement est <strong>bloqué chez KoobNaaba</strong>.
              Le prestataire reçoit les fonds <strong>uniquement après avoir fourni la preuve</strong> que le service a été rendu et que vous l'avez validé.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="services" className="flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4" /> Services
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> Carte
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-1.5">
            <Tractor className="h-4 w-4" /> Matériels ({equipment.length})
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-1.5">
            <Package className="h-4 w-4" /> Fournisseurs ({suppliers.length})
          </TabsTrigger>
          {isClient && (
            <TabsTrigger value="orders" className="flex items-center gap-1.5">
              <Package className="h-4 w-4" /> Mes commandes ({clientOrders.length})
            </TabsTrigger>
          )}
          {isProvider && (
            <>
              <TabsTrigger value="my-services" className="flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4" /> Mes services ({myServices.length})
              </TabsTrigger>
              <TabsTrigger value="received-orders" className="flex items-center gap-1.5">
                <Send className="h-4 w-4" /> Commandes reçues ({providerOrders.length})
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* ═══ SERVICES TAB ═══ */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 pr-8" placeholder="Rechercher un service..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filteredServices.filter(s => s.is_active && s.provider_id !== user?.id).length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun service disponible pour le moment.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.filter(s => s.is_active && s.provider_id !== user?.id).map(svc => (
                <Card key={svc.id} className="shadow-sm hover:shadow-warm transition-shadow">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{svc.title}</h3>
                        <Badge variant="secondary" className="text-[10px] mt-1">{getCategoryLabel(svc.category)}</Badge>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold text-primary">{Number(svc.price).toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground block">{getPriceUnitLabel(svc.price_unit)}</span>
                      </div>
                    </div>
                    {svc.description && <p className="text-xs text-muted-foreground line-clamp-3">{svc.description}</p>}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {svc.location_name && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{svc.location_name}</span>}
                      {svc.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{svc.phone}</span>}
                    </div>
                    {isClient ? (
                      <Button size="sm" className="w-full gradient-primary text-primary-foreground" onClick={() => { setSelectedService(svc); setShowOrderDialog(true); }}>
                        <Lock className="h-3.5 w-3.5 mr-1.5" /> Commander (paiement sécurisé)
                      </Button>
                    ) : (
                      <p className="text-[11px] text-muted-foreground text-center italic">Réservé aux agriculteurs et éleveurs</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ MAP TAB ═══ */}
        <TabsContent value="map" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold">Prestataires autour de vous</h2>
              <p className="text-xs text-muted-foreground">La carte affiche les services dont la position GPS a été enregistrée.</p>
            </div>
            <Badge variant="outline" className="gap-1.5"><MapPin className="h-3.5 w-3.5" /> GPS {userPosition ? "actif" : "non disponible"}</Badge>
          </div>
          <ProviderMap
            services={filteredServices.filter((s) => s.is_active && s.provider_id !== user?.id)}
            selectedId={selectedMapService?.id}
            onSelect={(service) => setSelectedMapService(services.find((s) => s.id === service.id) ?? null)}
          />
          {selectedMapService && (
            <Card className="border-primary/20 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{selectedMapService.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedMapService.location_name ?? "Localisation GPS"} · {Number(selectedMapService.price).toLocaleString("fr-FR")} FCFA</p>
                </div>
                {isClient && <Button size="sm" onClick={() => { setSelectedService(selectedMapService); setShowOrderDialog(true); }}>Commander</Button>}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ EQUIPMENT TAB ═══ */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 pr-8" placeholder="Rechercher un matériel..." value={searchEquip} onChange={e => setSearchEquip(e.target.value)} />
            {searchEquip && <button onClick={() => setSearchEquip("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
          {filteredEquip.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun matériel disponible.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEquip.map(eq => (
                <Card key={eq.id} className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {eq.images && eq.images.length > 0 && (
                    <div className="h-40 bg-muted overflow-hidden">
                      <img src={eq.images[0]} alt={eq.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className={`space-y-3 ${eq.images?.length ? "pt-3" : "pt-4"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm leading-tight">{eq.title}</h3>
                        <Badge variant="secondary" className="text-[10px] mt-1">{equipTypeLabels[eq.equipment_type] || eq.equipment_type}</Badge>
                      </div>
                      {(eq.avg_rating ?? 0) > 0 && (
                        <div className="flex items-center gap-0.5 text-xs shrink-0">
                          <Star className="h-3.5 w-3.5 text-chart-4 fill-chart-4" />
                          <span className="font-medium">{Number(eq.avg_rating).toFixed(1)}</span>
                          <span className="text-muted-foreground">({eq.review_count})</span>
                        </div>
                      )}
                    </div>
                    {eq.brand && <p className="text-xs text-muted-foreground">{eq.brand} {eq.model || ""}</p>}
                    {eq.description && <p className="text-xs text-muted-foreground line-clamp-2">{eq.description}</p>}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">{Number(eq.daily_rate).toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground"> FCFA/jour</span>
                      </div>
                      {eq.deposit_amount > 0 && <span className="text-[10px] text-muted-foreground">Caution : {Number(eq.deposit_amount).toLocaleString()} FCFA</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {eq.location_name && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{eq.location_name}</span>}
                      {eq.availability_start && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(eq.availability_start).toLocaleDateString("fr-FR")}
                          {eq.availability_end && ` — ${new Date(eq.availability_end).toLocaleDateString("fr-FR")}`}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ SUPPLIERS TAB ═══ */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 pr-8" placeholder="Rechercher un fournisseur..." value={searchSupplier} onChange={e => setSearchSupplier(e.target.value)} />
            {searchSupplier && <button onClick={() => setSearchSupplier("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
          {filteredSuppliers.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun fournisseur référencé.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSuppliers.map(sup => (
                <Card key={sup.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm">{sup.name}</h3>
                      {sup.is_verified && <Badge variant="default" className="text-[10px] shrink-0">Vérifié ✓</Badge>}
                    </div>
                    {sup.description && <p className="text-xs text-muted-foreground line-clamp-3">{sup.description}</p>}
                    <div className="space-y-1.5 text-xs">
                      {sup.address && <div className="flex items-start gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>{sup.address}</span></div>}
                      {sup.contact_phone && <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><a href={`tel:${sup.contact_phone}`} className="text-primary hover:underline font-medium">{sup.contact_phone}</a></div>}
                      {sup.contact_email && <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><a href={`mailto:${sup.contact_email}`} className="text-primary hover:underline">{sup.contact_email}</a></div>}
                      {sup.website && <div className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><a href={sup.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{sup.website}</a></div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ CLIENT ORDERS ═══ */}
        <TabsContent value="orders" className="space-y-3">
          {clientOrders.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Aucune commande.</CardContent></Card>
          ) : clientOrders.map(order => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.en_attente;
            const esc = ESCROW_CONFIG[order.escrow_status] || ESCROW_CONFIG.bloque;
            const StIcon = st.icon;
            return (
              <Card key={order.id} className="shadow-sm hover:shadow-warm transition-shadow cursor-pointer" onClick={() => setShowOrderDetail(order)}>
                <CardContent className="flex items-center gap-4 pt-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{order.service?.title || "Service"}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={esc.variant} className="text-[10px]">{esc.label}</Badge>
                      <span className="flex items-center gap-1 text-xs"><StIcon className={`h-3 w-3 ${st.color}`} />{st.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{Number(order.amount).toLocaleString()} FCFA • {new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ═══ PROVIDER: MY SERVICES ═══ */}
        {isProvider && (
          <TabsContent value="my-services" className="space-y-3">
            {myServices.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Vous n'avez publié aucun service.</CardContent></Card>
            ) : myServices.map(svc => (
              <Card key={svc.id} className="shadow-sm">
                <CardContent className="flex items-center gap-4 pt-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{svc.title}</p>
                      <Badge variant={svc.is_active ? "default" : "secondary"} className="text-[10px]">{svc.is_active ? "Actif" : "Inactif"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{getCategoryLabel(svc.category)} • {Number(svc.price).toLocaleString()} FCFA / {getPriceUnitLabel(svc.price_unit)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteService(svc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}

        {/* ═══ PROVIDER: RECEIVED ORDERS ═══ */}
        {isProvider && (
          <TabsContent value="received-orders" className="space-y-3">
            {providerOrders.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Aucune commande reçue.</CardContent></Card>
            ) : providerOrders.map(order => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.en_attente;
              const esc = ESCROW_CONFIG[order.escrow_status] || ESCROW_CONFIG.bloque;
              const StIcon = st.icon;
              return (
                <Card key={order.id} className="shadow-sm hover:shadow-warm transition-shadow cursor-pointer" onClick={() => setShowOrderDetail(order)}>
                  <CardContent className="flex items-center gap-4 pt-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{order.service?.title || "Service"}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={esc.variant} className="text-[10px]">{esc.label}</Badge>
                        <span className="flex items-center gap-1 text-xs"><StIcon className={`h-3 w-3 ${st.color}`} />{st.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{Number(order.amount).toLocaleString()} FCFA • {new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        )}
      </Tabs>

      {/* ═══ DIALOGS ═══ */}
      {/* Create Service */}
      <Dialog open={showCreateService} onOpenChange={setShowCreateService}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">Proposer un service</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateService} className="space-y-4">
            <div className="space-y-2"><Label>Titre du service *</Label><Input value={serviceForm.title} onChange={e => setServiceForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Labour mécanisé avec tracteur" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Catégorie</Label><Select value={serviceForm.category} onValueChange={v => setServiceForm(f => ({ ...f, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Unité de prix</Label><Select value={serviceForm.price_unit} onValueChange={v => setServiceForm(f => ({ ...f, price_unit: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRICE_UNITS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Prix (FCFA) *</Label><Input type="number" value={serviceForm.price} onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))} placeholder="50000" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Localisation</Label><Input value={serviceForm.location_name} onChange={e => setServiceForm(f => ({ ...f, location_name: e.target.value }))} placeholder="Ouagadougou" /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={serviceForm.phone} onChange={e => setServiceForm(f => ({ ...f, phone: e.target.value }))} placeholder="+226 70 00 00 00" /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={serviceForm.description} onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))} placeholder="Décrivez votre service..." rows={3} /></div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">Publier le service</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Place Order */}
      <Dialog open={showOrderDialog} onOpenChange={v => { if (!v) { setShowOrderDialog(false); setSelectedService(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">Commander ce service</DialogTitle></DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                <p className="text-sm font-semibold">{selectedService.title}</p>
                <p className="text-xs text-muted-foreground">{getCategoryLabel(selectedService.category)}</p>
                <p className="text-lg font-bold text-primary">{Number(selectedService.price).toLocaleString()} FCFA <span className="text-xs font-normal text-muted-foreground">/ {getPriceUnitLabel(selectedService.price_unit)}</span></p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4 text-primary" /> Paiement sécurisé</div>
                <p className="text-xs text-muted-foreground mt-1">Votre paiement de <strong>{Number(selectedService.price).toLocaleString()} FCFA</strong> sera bloqué chez KoobNaaba jusqu'à validation.</p>
              </div>
              <div className="space-y-2"><Label>Notes (optionnel)</Label><Textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Précisions sur votre besoin..." rows={3} /></div>
              <Button onClick={handlePlaceOrder} className="w-full gradient-primary text-primary-foreground"><Lock className="h-4 w-4 mr-2" /> Confirmer et bloquer le paiement</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Detail */}
      <Dialog open={!!showOrderDetail} onOpenChange={v => { if (!v) setShowOrderDetail(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">Détail de la commande</DialogTitle></DialogHeader>
          {showOrderDetail && (() => {
            const order = showOrderDetail;
            const isClient = order.client_id === user?.id;
            const isOrderProvider = order.provider_id === user?.id;
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.en_attente;
            const esc = ESCROW_CONFIG[order.escrow_status] || ESCROW_CONFIG.bloque;
            const StIcon = st.icon;
            return (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2 text-sm">
                  <p><strong>Service :</strong> {order.service?.title || "—"}</p>
                  <p><strong>Montant :</strong> {Number(order.amount).toLocaleString()} FCFA</p>
                  <p><strong>Date :</strong> {new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
                  {order.client_notes && <p><strong>Notes client :</strong> {order.client_notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={esc.variant} className="flex items-center gap-1">{esc.label}</Badge>
                  <span className="flex items-center gap-1 text-sm"><StIcon className={`h-4 w-4 ${st.color}`} />{st.label}</span>
                </div>
                {order.provider_proof && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 space-y-1">
                    <p className="text-sm font-semibold text-green-800 flex items-center gap-1"><FileImage className="h-4 w-4" /> Preuve du prestataire</p>
                    <p className="text-xs text-green-700">{order.provider_proof}</p>
                  </div>
                )}
                {isOrderProvider && order.status === "en_attente" && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleAcceptOrder(order.id)} className="flex-1 gradient-primary text-primary-foreground"><CheckCircle className="h-4 w-4 mr-1" /> Accepter</Button>
                    <Button variant="destructive" onClick={() => handleCancelOrder(order.id)} className="flex-1"><XCircle className="h-4 w-4 mr-1" /> Refuser</Button>
                  </div>
                )}
                {isOrderProvider && (order.status === "acceptee" || order.status === "en_cours") && !order.provider_proof && (
                  <div className="space-y-2">
                    <Label>Preuve de prestation *</Label>
                    <Textarea value={proofText} onChange={e => setProofText(e.target.value)} placeholder="Décrivez le travail effectué..." rows={3} />
                    <Button onClick={() => handleSubmitProof(order.id)} disabled={!proofText.trim()} className="w-full gradient-primary text-primary-foreground"><Send className="h-4 w-4 mr-2" /> Soumettre la preuve</Button>
                  </div>
                )}
                {isClient && order.status === "terminee" && order.escrow_status === "bloque" && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Le prestataire a fourni une preuve. Vérifiez et débloquez les fonds.</p>
                    <div className="flex gap-2">
                      <Button onClick={() => handleReleaseFunds(order.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white"><Unlock className="h-4 w-4 mr-1" /> Débloquer les fonds</Button>
                      <Button variant="outline" onClick={() => { supabase.from("marketplace_orders").update({ status: "litige" }).eq("id", order.id).then(() => { fetchData(); setShowOrderDetail(null); toast.info("Litige signalé"); }); }} className="flex-1"><Shield className="h-4 w-4 mr-1" /> Signaler un litige</Button>
                    </div>
                  </div>
                )}
                {isClient && order.status === "en_attente" && (
                  <Button variant="destructive" onClick={() => handleCancelOrder(order.id)} className="w-full"><XCircle className="h-4 w-4 mr-2" /> Annuler la commande</Button>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceMarketplacePage;
