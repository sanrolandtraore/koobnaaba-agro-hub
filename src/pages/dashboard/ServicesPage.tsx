import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus, Microscope, Bug, Droplets, Tractor, Fish, Egg,
  ClipboardList, MapPin, GraduationCap, Trash2, Clock, CheckCircle, XCircle, Loader2,
} from "lucide-react";

const SERVICE_TYPES = [
  { value: "diagnostic_sol", label: "Diagnostic sol et aménagement", icon: Microscope, desc: "Analyse de la qualité du sol, recommandations d'amendement et plan d'aménagement foncier." },
  { value: "diagnostic_maladie", label: "Diagnostic maladie et traitement", icon: Bug, desc: "Identification des maladies et ravageurs, prescription de traitements phytosanitaires adaptés." },
  { value: "irrigation", label: "Installation système d'irrigation", icon: Droplets, desc: "Conception et mise en place de systèmes d'irrigation (goutte-à-goutte, aspersion, gravitaire)." },
  { value: "ferme_agricole", label: "Mise en place ferme agricole", icon: Tractor, desc: "Accompagnement complet : choix du site, préparation terrain, plan cultural et calendrier." },
  { value: "etang_piscicole", label: "Mise en place d'étangs piscicoles", icon: Fish, desc: "Conception d'étangs, aménagement hydraulique et conseil en espèces adaptées." },
  { value: "ferme_volaille", label: "Mise en place ferme volaille", icon: Egg, desc: "Conception du poulailler, choix des races, plan sanitaire et alimentation." },
  { value: "suivi_exploitation", label: "Planification et suivi d'exploitation", icon: ClipboardList, desc: "Suivi régulier de vos cultures/élevages avec rapports et recommandations." },
  { value: "cartographie_gps", label: "Mesure et cartographie GPS", icon: MapPin, desc: "Relevés GPS précis de vos parcelles, calcul de superficie et cartographie SIG." },
  { value: "formation", label: "Formations et conseils", icon: GraduationCap, desc: "Sessions de formation sur les bonnes pratiques agricoles et techniques modernes." },
] as const;

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  en_attente: { label: "En attente", variant: "secondary", icon: Clock },
  en_cours: { label: "En cours", variant: "default", icon: Loader2 },
  terminee: { label: "Terminée", variant: "outline", icon: CheckCircle },
  annulee: { label: "Annulée", variant: "destructive", icon: XCircle },
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

const ServicesPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [farms, setFarms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    service_type: "",
    description: "",
    location: "",
    farm_id: "",
    preferred_date: "",
    phone: "",
  });

  const fetchAll = async () => {
    if (!user) return;
    const [rRes, fRes] = await Promise.all([
      supabase.from("service_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("farms").select("id, name"),
    ]);
    setRequests((rRes.data as ServiceRequest[]) || []);
    setFarms(fRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service_type) {
      toast.error("Sélectionnez un type de service");
      return;
    }
    const { error } = await supabase.from("service_requests").insert({
      user_id: user!.id,
      service_type: form.service_type,
      description: form.description || null,
      location: form.location || null,
      farm_id: form.farm_id || null,
      preferred_date: form.preferred_date || null,
      phone: form.phone || null,
    });
    if (error) {
      toast.error("Erreur: " + error.message);
    } else {
      toast.success("Demande envoyée avec succès !");
      setForm({ service_type: "", description: "", location: "", farm_id: "", preferred_date: "", phone: "" });
      setOpen(false);
      fetchAll();
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Annuler cette demande ?")) return;
    const { error } = await supabase.from("service_requests").update({ status: "annulee" }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Demande annulée"); fetchAll(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;
    const { error } = await supabase.from("service_requests").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Demande supprimée"); fetchAll(); }
  };

  const getServiceLabel = (type: string) => SERVICE_TYPES.find(s => s.value === type)?.label || type;
  const getServiceIcon = (type: string) => SERVICE_TYPES.find(s => s.value === type)?.icon || ClipboardList;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Services Techniques</h1>
          <p className="text-muted-foreground mt-1">Demandez l'accompagnement de nos Experts Agronomes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nouvelle demande</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Demander un service technique</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">Type de service *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SERVICE_TYPES.map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, service_type: value }))}
                      className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                        form.service_type === value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${form.service_type === value ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <span className="text-sm font-semibold leading-tight block">{label}</span>
                        <span className="text-[11px] text-muted-foreground leading-tight">{desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
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
                  <Label>Téléphone de contact</Label>
                  <Input placeholder="+226 70 00 00 00" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
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

      {/* Catalogue des services */}
      <div>
        <h2 className="text-lg font-heading font-semibold mb-3">Nos prestations</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_TYPES.map(({ value, label, icon: Icon, desc }) => (
            <Card key={value} className="shadow-sm hover:shadow-warm transition-shadow cursor-pointer" onClick={() => { setForm(f => ({ ...f, service_type: value })); setOpen(true); }}>
              <CardContent className="flex items-start gap-3 pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mes demandes */}
      <div>
        <h2 className="text-lg font-heading font-semibold mb-3">Mes demandes</h2>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
        ) : requests.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Aucune demande de service. Cliquez sur un service ci-dessus pour commencer.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map(req => {
              const ServiceIcon = getServiceIcon(req.service_type);
              const st = statusConfig[req.status] || statusConfig.en_attente;
              const StIcon = st.icon;
              return (
                <Card key={req.id} className="shadow-sm">
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
