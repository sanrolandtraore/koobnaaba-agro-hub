import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ClipboardList, Clock, CheckCircle, Loader2, XCircle,
  Microscope, Bug, Droplets, Tractor, Fish, Egg, MapPin, GraduationCap,
  BarChart3, Users, Wheat, Leaf, TreePine, Shield, Beef, Utensils, Heart, Baby,
  Waves, Mountain, Sun, Home, FileSearch, FileText, Award, Warehouse, Factory,
  ShoppingBag, QrCode, Salad,
} from "lucide-react";

const SERVICE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  // Productions végétales
  diagnostic_sol: { label: "Diagnostic sol et aménagement", icon: Microscope },
  diagnostic_maladie: { label: "Diagnostic maladie et traitement", icon: Bug },
  lutte_biologique: { label: "Lutte biologique intégrée", icon: Bug },
  semences: { label: "Sélection et certification semences", icon: Sprout },
  fertilisation: { label: "Plan de fertilisation", icon: Sprout },
  compostage: { label: "Compostage et fumure organique", icon: Leaf },
  maraichage: { label: "Maraîchage et cultures horticoles", icon: Salad },
  culture_bio: { label: "Agriculture biologique", icon: Leaf },
  pepiniere: { label: "Pépinière et production de plants", icon: TreePine },
  agroforesterie: { label: "Agroforesterie", icon: TreePine },
  protection_cultures: { label: "Protection phytosanitaire", icon: Shield },
  // Productions animales
  ferme_volaille: { label: "Aviculture et ferme volaille", icon: Egg },
  elevage_bovin: { label: "Élevage bovin", icon: Beef },
  elevage_caprin: { label: "Élevage caprin et ovin", icon: Beef },
  nutrition_animale: { label: "Nutrition et alimentation animale", icon: Utensils },
  sante_animale: { label: "Santé animale et prophylaxie", icon: Heart },
  insemination: { label: "Insémination artificielle", icon: Baby },
  etang_piscicole: { label: "Pisciculture et aquaculture", icon: Fish },
  apiculture: { label: "Apiculture", icon: Bug },
  // Aménagement et infrastructure
  ferme_agricole: { label: "Mise en place ferme agricole", icon: Tractor },
  irrigation: { label: "Système d'irrigation", icon: Droplets },
  forage: { label: "Forage et adduction d'eau", icon: Droplets },
  amenagement_bas_fonds: { label: "Aménagement de bas-fonds", icon: Waves },
  conservation_sol: { label: "Conservation des sols et eaux", icon: Mountain },
  mecanisation: { label: "Mécanisation agricole", icon: Tractor },
  energie_solaire: { label: "Énergie solaire agricole", icon: Sun },
  serre: { label: "Serres et tunnels agricoles", icon: Home },
  // Gestion et accompagnement
  suivi_exploitation: { label: "Planification et suivi d'exploitation", icon: ClipboardList },
  cartographie_gps: { label: "Mesure et cartographie GPS", icon: MapPin },
  audit_exploitation: { label: "Audit d'exploitation agricole", icon: FileSearch },
  plan_affaires: { label: "Business plan agricole", icon: FileText },
  certification: { label: "Certification et labels", icon: Award },
  analyse_eau: { label: "Analyse de la qualité de l'eau", icon: Droplets },
  // Post-récolte et commercialisation
  stockage: { label: "Stockage et conservation", icon: Warehouse },
  transformation: { label: "Transformation agroalimentaire", icon: Factory },
  commercialisation: { label: "Commercialisation et marchés", icon: ShoppingBag },
  tracabilite: { label: "Traçabilité des produits", icon: QrCode },
  // Formation
  formation: { label: "Formations techniques", icon: GraduationCap },
  formation_gestion: { label: "Formation en gestion", icon: GraduationCap },
  conseil_cooperatif: { label: "Conseil aux coopératives", icon: Users },
  champ_ecole: { label: "Champ école paysan (CEP)", icon: GraduationCap },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  en_attente: { label: "En attente", variant: "secondary", icon: Clock },
  en_cours: { label: "En cours", variant: "default", icon: Loader2 },
  terminee: { label: "Terminée", variant: "outline", icon: CheckCircle },
  annulee: { label: "Annulée", variant: "destructive", icon: XCircle },
};

type ServiceRequest = {
  id: string;
  user_id: string;
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

const AgentDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRequests((data as ServiceRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const openDetail = (req: ServiceRequest) => {
    setSelectedReq(req);
    setEditNotes(req.expert_notes || "");
    setEditCost(String(req.estimated_cost || ""));
    setEditStatus(req.status);
  };

  const handleSave = async () => {
    if (!selectedReq) return;
    const { error } = await supabase.from("service_requests").update({
      expert_notes: editNotes || null,
      estimated_cost: editCost ? parseFloat(editCost) : 0,
      status: editStatus,
    }).eq("id", selectedReq.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Demande mise à jour");
      setSelectedReq(null);
      fetchRequests();
    }
  };

  // Stats
  const total = requests.length;
  const pending = requests.filter(r => r.status === "en_attente").length;
  const inProgress = requests.filter(r => r.status === "en_cours").length;
  const completed = requests.filter(r => r.status === "terminee").length;

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  // Service type distribution
  const byType: Record<string, number> = {};
  requests.forEach(r => { byType[r.service_type] = (byType[r.service_type] || 0) + 1; });

  const kpiCards = [
    { label: "Total demandes", value: total, icon: ClipboardList, color: "text-primary" },
    { label: "En attente", value: pending, icon: Clock, color: "text-yellow-600" },
    { label: "En cours", value: inProgress, icon: Loader2, color: "text-blue-600" },
    { label: "Terminées", value: completed, icon: CheckCircle, color: "text-green-600" },
  ];

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}</div>
      <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Espace Expert Agronome</h1>
        <p className="text-muted-foreground mt-1">Gérez les demandes de services techniques</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-sm hover:shadow-warm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent><p className="text-2xl font-heading font-bold">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* Répartition par service */}
      {Object.keys(byType).length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Répartition par type de service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                const svc = SERVICE_LABELS[type] || { label: type, icon: ClipboardList };
                const SvcIcon = svc.icon;
                return (
                  <div key={type} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <SvcIcon className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{svc.label}</p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div className="bg-primary rounded-full h-1.5" style={{ width: `${Math.min(100, (count / total) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtre + liste des demandes */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-lg font-heading font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> Demandes reçues</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="terminee">Terminées</SelectItem>
              <SelectItem value="annulee">Annulées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune demande {filter !== "all" ? "avec ce statut" : "pour le moment"}.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => {
              const svc = SERVICE_LABELS[req.service_type] || { label: req.service_type, icon: ClipboardList };
              const SvcIcon = svc.icon;
              const st = statusConfig[req.status] || statusConfig.en_attente;
              const StIcon = st.icon;
              return (
                <Card key={req.id} className="shadow-sm hover:shadow-warm transition-shadow cursor-pointer" onClick={() => openDetail(req)}>
                  <CardContent className="flex items-start gap-4 pt-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <SvcIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{svc.label}</p>
                        <Badge variant={st.variant} className="flex items-center gap-1 text-xs">
                          <StIcon className="h-3 w-3" />{st.label}
                        </Badge>
                      </div>
                      {req.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{req.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {req.location && <span>📍 {req.location}</span>}
                        {req.preferred_date && <span>📅 {new Date(req.preferred_date).toLocaleDateString("fr-FR")}</span>}
                        {req.phone && <span>📞 {req.phone}</span>}
                        <span>Reçue le {new Date(req.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog de traitement */}
      <Dialog open={!!selectedReq} onOpenChange={v => !v && setSelectedReq(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Traiter la demande</DialogTitle>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2 text-sm">
                <p><strong>Service :</strong> {SERVICE_LABELS[selectedReq.service_type]?.label || selectedReq.service_type}</p>
                {selectedReq.description && <p><strong>Description :</strong> {selectedReq.description}</p>}
                {selectedReq.location && <p><strong>Localisation :</strong> {selectedReq.location}</p>}
                {selectedReq.preferred_date && <p><strong>Date souhaitée :</strong> {new Date(selectedReq.preferred_date).toLocaleDateString("fr-FR")}</p>}
                {selectedReq.phone && <p><strong>Téléphone :</strong> {selectedReq.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="terminee">Terminée</SelectItem>
                    <SelectItem value="annulee">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Coût estimé (FCFA)</Label>
                <Input type="number" value={editCost} onChange={e => setEditCost(e.target.value)} placeholder="0" />
              </div>

              <div className="space-y-2">
                <Label>Notes / Réponse de l'expert</Label>
                <Textarea rows={4} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Votre diagnostic, recommandations, planning…" />
              </div>

              <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground">Enregistrer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentDashboard;
