import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Briefcase, Plus, Trash2, ClipboardList } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Client { id: string; client_full_name: string; }
interface Mission {
  id: string; client_id: string | null; client_name: string; domain: string; service_type: string;
  title: string; description: string | null; location_name: string | null; scheduled_date: string;
  completed_date: string | null; status: string; price: number | null; paid: boolean;
}

const SERVICES_AGRI = ["conseil", "diagnostic", "traitement phytosanitaire", "labour / préparation", "semis", "irrigation", "récolte", "formation", "autre"];
const SERVICES_ELEV = ["consultation vétérinaire", "vaccination", "déparasitage", "insémination", "conseil alimentation", "formation", "autre"];
const STATUSES = [
  { value: "planifiee", label: "Planifiée" },
  { value: "en_cours", label: "En cours" },
  { value: "terminee", label: "Terminée" },
  { value: "annulee", label: "Annulée" },
];

export default function MissionsPage() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Mission | null>(null);

  const [clientId, setClientId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [domain, setDomain] = useState("agriculture");
  const [serviceType, setServiceType] = useState("conseil");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("planifiee");
  const [price, setPrice] = useState("");
  const [paid, setPaid] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [m, c] = await Promise.all([
      supabase.from("provider_missions").select("*").eq("provider_id", user.id).order("scheduled_date", { ascending: false }),
      supabase.from("expert_clients").select("id, client_full_name").eq("expert_id", user.id).order("client_full_name"),
    ]);
    setMissions((m.data ?? []) as Mission[]);
    setClients((c.data ?? []) as Client[]);
    setLoading(false);
  };

  useEffect(() => { load();   }, [user]);

  const services = domain === "elevage" ? SERVICES_ELEV : SERVICES_AGRI;

  const reset = () => {
    setEditing(null); setClientId(""); setClientName(""); setDomain("agriculture"); setServiceType("conseil");
    setTitle(""); setDescription(""); setLocation(""); setDate(new Date().toISOString().slice(0, 10));
    setStatus("planifiee"); setPrice(""); setPaid(false);
  };

  const openEdit = (m: Mission) => {
    setEditing(m);
    setClientId(m.client_id ?? ""); setClientName(m.client_name); setDomain(m.domain);
    setServiceType(m.service_type); setTitle(m.title); setDescription(m.description ?? "");
    setLocation(m.location_name ?? ""); setDate(m.scheduled_date); setStatus(m.status);
    setPrice(m.price != null ? String(m.price) : ""); setPaid(m.paid);
    setOpen(true);
  };

  const save = async () => {
    if (!user || !title.trim()) return;
    const resolvedName = clientId ? (clients.find((c) => c.id === clientId)?.client_full_name ?? clientName) : clientName;
    if (!resolvedName.trim()) { toast({ title: "Indiquez un client", variant: "destructive" }); return; }
    setSaving(true);
    const payload = {
      provider_id: user.id,
      client_id: clientId || null,
      client_name: resolvedName.trim(),
      domain, service_type: serviceType,
      title: title.trim(),
      description: description.trim() || null,
      location_name: location.trim() || null,
      scheduled_date: date,
      status,
      completed_date: status === "terminee" ? (editing?.completed_date ?? new Date().toISOString().slice(0, 10)) : null,
      price: price ? Number(price) : null,
      paid,
    };
    const { error } = editing
      ? await supabase.from("provider_missions").update(payload).eq("id", editing.id)
      : await supabase.from("provider_missions").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Mission mise à jour" : "Mission créée" });
    setOpen(false); reset(); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("provider_missions").delete().eq("id", id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const grouped = useMemo(() => ({
    actives: missions.filter((m) => m.status === "planifiee" || m.status === "en_cours"),
    terminees: missions.filter((m) => m.status === "terminee"),
    toutes: missions,
  }), [missions]);

  const MissionList = ({ items }: { items: Mission[] }) => (
    items.length === 0 ? (
      <Card><CardContent className="py-10 text-center text-muted-foreground">Aucune mission.</CardContent></Card>
    ) : (
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((m) => (
          <Card key={m.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{m.title}</CardTitle>
                <Badge variant={m.status === "terminee" ? "default" : "secondary"}>
                  {STATUSES.find((s) => s.value === m.status)?.label ?? m.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {m.client_name} · {m.domain === "elevage" ? "Élevage" : "Agriculture"} · {m.service_type}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                {new Date(m.scheduled_date).toLocaleDateString("fr-FR")}{m.location_name ? ` · ${m.location_name}` : ""}
              </p>
              {m.description && <p>{m.description}</p>}
              {m.price != null && (
                <p className="font-medium">
                  {Number(m.price).toLocaleString("fr-FR")} FCFA · {m.paid ? "payé" : "non payé"}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => openEdit(m)}>Modifier</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(m.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Briefcase className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold">Missions</h1>
            <p className="text-sm text-muted-foreground">Prestations agricoles et d'élevage</p>
          </div>
        </div>
        <Button onClick={() => { reset(); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Nouvelle</Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <Tabs defaultValue="actives">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="actives">En cours ({grouped.actives.length})</TabsTrigger>
            <TabsTrigger value="terminees">Terminées ({grouped.terminees.length})</TabsTrigger>
            <TabsTrigger value="toutes">Toutes ({grouped.toutes.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="actives" className="mt-4"><MissionList items={grouped.actives} /></TabsContent>
          <TabsContent value="terminees" className="mt-4"><MissionList items={grouped.terminees} /></TabsContent>
          <TabsContent value="toutes" className="mt-4"><MissionList items={grouped.toutes} /></TabsContent>
        </Tabs>
      )}

      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Enregistrez vos comptes-rendus de terrain depuis le journal d'interventions.
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Modifier la mission" : "Nouvelle mission"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Client</Label>
              <Select value={clientId || "manuel"} onValueChange={(v) => setClientId(v === "manuel" ? "" : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manuel">Saisir un nom</SelectItem>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.client_full_name}</SelectItem>)}
                </SelectContent>
              </Select>
              {!clientId && (
                <Input className="mt-2" placeholder="Nom du client" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Domaine</Label>
                <Select value={domain} onValueChange={(v) => { setDomain(v); setServiceType(v === "elevage" ? SERVICES_ELEV[0] : SERVICES_AGRI[0]); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="elevage">Élevage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type de prestation</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Intitulé</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div><Label>Lieu</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Statut</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Montant (FCFA)</Label>
                <Input type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
              Paiement reçu
            </label>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving || !title.trim()}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
