import { useEffect, useState } from "react";
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
import { ClipboardList, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Mission { id: string; title: string; client_name: string; }
interface Intervention {
  id: string; mission_id: string; intervention_date: string; intervention_type: string;
  observations: string | null; actions_done: string | null; recommendations: string | null;
  products_used: string | null; duration_hours: number | null; cost: number | null;
  latitude: number | null; longitude: number | null;
}

const TYPES = ["visite de suivi", "diagnostic", "traitement", "conseil technique", "formation", "autre"];

export default function InterventionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Intervention[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [missionId, setMissionId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState(TYPES[0]);
  const [observations, setObservations] = useState("");
  const [actions, setActions] = useState("");
  const [reco, setReco] = useState("");
  const [products, setProducts] = useState("");
  const [duration, setDuration] = useState("");
  const [cost, setCost] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [i, m] = await Promise.all([
      supabase.from("mission_interventions").select("*").eq("provider_id", user.id).order("intervention_date", { ascending: false }),
      supabase.from("provider_missions").select("id, title, client_name").eq("provider_id", user.id).order("scheduled_date", { ascending: false }),
    ]);
    setItems((i.data ?? []) as Intervention[]);
    setMissions((m.data ?? []) as Mission[]);
    setLoading(false);
  };

  useEffect(() => { load();   }, [user]);

  const reset = () => {
    setMissionId(missions[0]?.id ?? ""); setDate(new Date().toISOString().slice(0, 10));
    setType(TYPES[0]); setObservations(""); setActions(""); setReco("");
    setProducts(""); setDuration(""); setCost(""); setCoords(null);
  };

  const capture = () => {
    if (!navigator.geolocation) return toast({ title: "GPS indisponible", variant: "destructive" });
    navigator.geolocation.getCurrentPosition(
      (p) => { setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); toast({ title: "Position enregistrée" }); },
      () => toast({ title: "Impossible d'obtenir la position", variant: "destructive" })
    );
  };

  const save = async () => {
    if (!user) return;
    if (!missionId) return toast({ title: "Choisissez une mission", variant: "destructive" });
    setSaving(true);
    const { error } = await supabase.from("mission_interventions").insert({
      provider_id: user.id, mission_id: missionId, intervention_date: date, intervention_type: type,
      observations: observations || null, actions_done: actions || null, recommendations: reco || null,
      products_used: products || null,
      duration_hours: duration ? Number(duration) : null,
      cost: cost ? Number(cost) : null,
      latitude: coords?.lat ?? null, longitude: coords?.lng ?? null,
    });
    setSaving(false);
    if (error) return toast({ title: "Enregistrement impossible", description: error.message, variant: "destructive" });
    toast({ title: "Intervention enregistrée" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("mission_interventions").delete().eq("id", id);
    if (error) return toast({ title: "Suppression impossible", variant: "destructive" });
    load();
  };

  const missionOf = (id: string) => missions.find((m) => m.id === id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Interventions</h1>
          <p className="text-sm text-muted-foreground">Journal de vos passages sur le terrain</p>
        </div>
        <Button onClick={() => { reset(); setOpen(true); }} disabled={missions.length === 0}>
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>

      {missions.length === 0 && !loading && (
        <Card><CardContent className="py-6 text-sm text-muted-foreground">Créez d'abord une mission pour enregistrer une intervention.</CardContent></Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : items.length === 0 ? (
        <Card><CardContent className="py-6 text-sm text-muted-foreground">Aucune intervention enregistrée.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{missionOf(it.mission_id)?.title ?? "Mission"}</CardTitle>
                  <p className="text-xs text-muted-foreground truncate">
                    {missionOf(it.mission_id)?.client_name} · {new Date(it.intervention_date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary">{it.intervention_type}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => remove(it.id)} aria-label="Supprimer l'intervention">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {it.observations && <p><span className="text-muted-foreground">Observations : </span>{it.observations}</p>}
                {it.actions_done && <p><span className="text-muted-foreground">Actions : </span>{it.actions_done}</p>}
                {it.recommendations && <p><span className="text-muted-foreground">Recommandations : </span>{it.recommendations}</p>}
                {it.products_used && <p><span className="text-muted-foreground">Produits : </span>{it.products_used}</p>}
                <p className="text-xs text-muted-foreground">
                  {it.duration_hours ? `${it.duration_hours} h · ` : ""}
                  {it.cost ? `${Number(it.cost).toLocaleString("fr-FR")} FCFA` : ""}
                  {it.latitude ? ` · GPS ${it.latitude.toFixed(4)}, ${it.longitude?.toFixed(4)}` : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvelle intervention</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Mission</Label>
              <Select value={missionId} onValueChange={setMissionId}>
                <SelectTrigger><SelectValue placeholder="Choisir une mission" /></SelectTrigger>
                <SelectContent>
                  {missions.map((m) => <SelectItem key={m.id} value={m.id}>{m.title} — {m.client_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="int-date">Date</Label>
                <Input id="int-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="int-obs">Observations</Label>
              <Textarea id="int-obs" value={observations} onChange={(e) => setObservations(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="int-act">Actions réalisées</Label>
              <Textarea id="int-act" value={actions} onChange={(e) => setActions(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="int-reco">Recommandations</Label>
              <Textarea id="int-reco" value={reco} onChange={(e) => setReco(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="int-prod">Produits utilisés</Label>
              <Input id="int-prod" value={products} onChange={(e) => setProducts(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="int-dur">Durée (heures)</Label>
                <Input id="int-dur" type="number" inputMode="decimal" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="int-cost">Coût (FCFA)</Label>
                <Input id="int-cost" type="number" inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={capture} className="w-full">
              <MapPin className="h-4 w-4 mr-1" /> {coords ? "Position enregistrée" : "Enregistrer ma position"}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
