import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ClipboardList, Clock, Loader2, CheckCircle, XCircle, MapPin, CalendarDays,
  Phone, MessageSquare, DollarSign, Send,
} from "lucide-react";

const SERVICE_LABELS: Record<string, string> = {
  diagnostic_sol: "Diagnostic sol",
  diagnostic_maladie: "Diagnostic maladie",
  irrigation: "Irrigation",
  ferme_agricole: "Ferme agricole",
  etang_piscicole: "Étangs piscicoles",
  ferme_volaille: "Ferme volaille",
  suivi_exploitation: "Suivi exploitation",
  cartographie_gps: "Cartographie GPS",
  formation: "Formations",
};

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
  preferred_date: string | null;
  phone: string | null;
  status: string;
  expert_notes: string | null;
  estimated_cost: number | null;
  created_at: string;
};

const PartnerRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [response, setResponse] = useState({ expert_notes: "", estimated_cost: "", status: "en_cours" });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setRequests((data as ServiceRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleRespond = async () => {
    if (!selected) return;
    setSubmitting(true);
    const { error } = await supabase.from("service_requests").update({
      expert_notes: response.expert_notes || null,
      estimated_cost: response.estimated_cost ? Number(response.estimated_cost) : null,
      status: response.status,
    }).eq("id", selected.id);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Réponse envoyée !");
    setSelected(null);
    fetchRequests();
  };

  const openResponse = (req: ServiceRequest) => {
    setSelected(req);
    setResponse({
      expert_notes: req.expert_notes || "",
      estimated_cost: req.estimated_cost?.toString() || "",
      status: req.status === "en_attente" ? "en_cours" : req.status,
    });
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const counts = {
    all: requests.length,
    en_attente: requests.filter(r => r.status === "en_attente").length,
    en_cours: requests.filter(r => r.status === "en_cours").length,
    terminee: requests.filter(r => r.status === "terminee").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" /> Demandes de services
        </h1>
        <p className="text-muted-foreground mt-1">Consultez et répondez aux demandes des agriculteurs</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Toutes", count: counts.all },
          { key: "en_attente", label: "En attente", count: counts.en_attente },
          { key: "en_cours", label: "En cours", count: counts.en_cours },
          { key: "terminee", label: "Terminées", count: counts.terminee },
        ].map(f => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
          >
            {f.label} ({f.count})
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Aucune demande de service pour le moment.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const st = statusConfig[req.status] || statusConfig.en_attente;
            const StIcon = st.icon;
            return (
              <Card key={req.id} className="shadow-sm hover:shadow-warm transition-shadow">
                <CardContent className="flex items-start gap-4 pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{SERVICE_LABELS[req.service_type] || req.service_type}</p>
                      <Badge variant={st.variant} className="flex items-center gap-1 text-xs">
                        <StIcon className="h-3 w-3" />{st.label}
                      </Badge>
                    </div>
                    {req.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{req.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      {req.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.location}</span>}
                      {req.preferred_date && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(req.preferred_date).toLocaleDateString("fr-FR")}</span>}
                      {req.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{req.phone}</span>}
                      <span>Reçue le {new Date(req.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {req.expert_notes && (
                      <div className="mt-2 p-2 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xs font-semibold">Votre réponse :</p>
                        <p className="text-xs text-muted-foreground">{req.expert_notes}</p>
                        {(req.estimated_cost ?? 0) > 0 && (
                          <p className="text-xs font-semibold text-primary mt-1">Coût proposé : {Number(req.estimated_cost).toLocaleString()} FCFA</p>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openResponse(req)}
                    className="shrink-0"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />Répondre
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog réponse */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              Répondre à la demande
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-semibold">{SERVICE_LABELS[selected.service_type] || selected.service_type}</p>
                {selected.description && <p className="text-xs text-muted-foreground mt-1">{selected.description}</p>}
                {selected.location && <p className="text-xs text-muted-foreground mt-1">📍 {selected.location}</p>}
              </div>

              <div>
                <Label>Statut</Label>
                <div className="flex gap-2 mt-1">
                  {["en_cours", "terminee"].map(s => (
                    <Button
                      key={s}
                      type="button"
                      variant={response.status === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setResponse(r => ({ ...r, status: s }))}
                    >
                      {s === "en_cours" ? "En cours" : "Terminée"}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Coût estimé (FCFA)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 50000"
                  value={response.estimated_cost}
                  onChange={e => setResponse(r => ({ ...r, estimated_cost: e.target.value }))}
                />
              </div>

              <div>
                <Label>Votre réponse / proposition</Label>
                <Textarea
                  rows={4}
                  placeholder="Décrivez votre offre, vos disponibilités, les conditions…"
                  value={response.expert_notes}
                  onChange={e => setResponse(r => ({ ...r, expert_notes: e.target.value }))}
                />
              </div>

              <Button onClick={handleRespond} disabled={submitting} className="w-full">
                <Send className="h-4 w-4 mr-2" />{submitting ? "Envoi…" : "Envoyer la réponse"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerRequestsPage;
