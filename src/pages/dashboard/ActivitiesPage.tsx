import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Activity } from "lucide-react";

const activityTypes = [
  { value: "labour", label: "Labour" },
  { value: "semis", label: "Semis" },
  { value: "irrigation", label: "Irrigation" },
  { value: "fertilisation", label: "Fertilisation" },
  { value: "traitement", label: "Traitement" },
  { value: "recolte", label: "Récolte" },
  { value: "autre", label: "Autre" },
];

const ActivitiesPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ crop_cycle_id: "", activity_type: "labour" as string, description: "", date: new Date().toISOString().split("T")[0], quantity: "", unit: "", cost: "" });

  const fetchActivities = async () => {
    const { data, error } = await supabase.from("activity_logs").select("*, crop_cycles(season, parcels(name), crop_references(name))").order("date", { ascending: false });
    if (error) toast.error(error.message);
    else setActivities(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
    supabase.from("crop_cycles").select("id, season, parcels(name), crop_references(name)").then(({ data }) => setCycles(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("activity_logs").insert({
      crop_cycle_id: form.crop_cycle_id,
      activity_type: form.activity_type as any,
      description: form.description || null,
      date: form.date,
      quantity: form.quantity ? parseFloat(form.quantity) : null,
      unit: form.unit || null,
      cost: form.cost ? parseFloat(form.cost) : 0,
      performed_by: user.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Activité enregistrée !");
    setForm({ crop_cycle_id: "", activity_type: "labour", description: "", date: new Date().toISOString().split("T")[0], quantity: "", unit: "", cost: "" });
    setOpen(false);
    fetchActivities();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette activité ?")) return;
    const { error } = await supabase.from("activity_logs").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimée"); fetchActivities(); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Activités</h1>
          <p className="text-muted-foreground mt-1">Journal des activités agricoles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground" disabled={cycles.length === 0}><Plus className="h-4 w-4 mr-2" />Nouvelle activité</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle activité</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cycle cultural *</Label>
                <Select value={form.crop_cycle_id} onValueChange={(v) => setForm({ ...form, crop_cycle_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{cycles.map((c) => <SelectItem key={c.id} value={c.id}>{c.crop_references?.name || "N/A"} - {c.parcels?.name} ({c.season})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.activity_type} onValueChange={(v) => setForm({ ...form, activity_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{activityTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails..." /></div>
              <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>Quantité</Label><Input type="number" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
                <div className="space-y-2"><Label>Unité</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg" /></div>
                <div className="space-y-2"><Label>Coût (FCFA)</Label><Input type="number" step="any" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-16" /></Card>)}</div>
      ) : activities.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{cycles.length === 0 ? "Créez d'abord un cycle cultural" : "Aucune activité enregistrée"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <Card key={a.id} className="shadow-sm">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium capitalize">{activityTypes.find(t => t.value === a.activity_type)?.label || a.activity_type}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{a.crop_cycles?.crop_references?.name} · {a.crop_cycles?.parcels?.name}</span>
                  </div>
                  {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(a.date).toLocaleDateString("fr-FR")}</span>
                    {a.quantity && <span>{a.quantity} {a.unit}</span>}
                    {a.cost > 0 && <span>{Number(a.cost).toLocaleString()} FCFA</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;
