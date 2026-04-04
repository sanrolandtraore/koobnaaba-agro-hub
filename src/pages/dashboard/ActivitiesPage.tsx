import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Activity, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOfflineData } from "@/hooks/useOfflineData";

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
  const { data: activities, loading, isOffline, insertRow, deleteRow } = useOfflineData({
    table: 'activity_logs',
    select: '*, crop_cycles(season, parcels(name), crop_references(name))',
    orderBy: 'date',
  });
  const { data: cycles } = useOfflineData({
    table: 'crop_cycles',
    select: 'id, season, parcels(name), crop_references(name)',
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ crop_cycle_id: "", activity_type: "labour" as string, description: "", date: new Date().toISOString().split("T")[0], quantity: "", unit: "", cost: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.crop_cycle_id) { toast.error("Veuillez sélectionner un cycle cultural"); return; }
    if (!form.date) { toast.error("La date est requise"); return; }
    const result = await insertRow({
      crop_cycle_id: form.crop_cycle_id,
      activity_type: form.activity_type,
      description: form.description || null,
      date: form.date,
      quantity: form.quantity ? parseFloat(form.quantity) : null,
      unit: form.unit || null,
      cost: form.cost ? parseFloat(form.cost) : 0,
      performed_by: user.id,
    });
    if (result) {
      toast.success("Activité enregistrée !");
      setForm({ crop_cycle_id: "", activity_type: "labour", description: "", date: new Date().toISOString().split("T")[0], quantity: "", unit: "", cost: "" });
      setOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette activité ?")) return;
    const ok = await deleteRow(id);
    if (ok) toast.success("Supprimée");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Activités</h1>
          <p className="text-muted-foreground mt-1">
            Journal des activités agricoles
            {isOffline && <Badge variant="outline" className="ml-2 text-xs"><WifiOff className="h-3 w-3 mr-1" />Hors-ligne</Badge>}
          </p>
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
                  <SelectContent>{cycles.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.crop_references?.name || "N/A"} - {c.parcels?.name} ({c.season})</SelectItem>)}</SelectContent>
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
          {activities.map((a: any) => (
            <Card key={a.id} className={`shadow-sm ${a._offline ? 'border-dashed border-amber-400' : ''}`}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium capitalize">{activityTypes.find(t => t.value === a.activity_type)?.label || a.activity_type}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{a.crop_cycles?.crop_references?.name} · {a.crop_cycles?.parcels?.name}</span>
                    {a._offline && <Badge variant="outline" className="text-xs">En attente</Badge>}
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
