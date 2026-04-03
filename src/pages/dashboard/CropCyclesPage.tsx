import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Wheat, Calculator, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOfflineData } from "@/hooks/useOfflineData";
import { supabase } from "@/integrations/supabase/client";

const seasons = [
  "Saison pluvieuse 2025", "Saison sèche 2025", "Contre-saison 2025",
  "Saison pluvieuse 2026", "Saison sèche 2026", "Contre-saison 2026",
  "Saison pluvieuse 2027", "Saison sèche 2027",
];

const statusOptions = [
  { value: "planning", label: "Planification" },
  { value: "active", label: "En cours" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
];

const CropCyclesPage = () => {
  const { data: cycles, loading, isOffline, refetch, insertRow, deleteRow } = useOfflineData({
    table: 'crop_cycles',
    select: '*, parcels(name, area_ha, farms(name, climate_zones(climate_coefficient))), crop_references(name, avg_yield_per_ha, avg_price_per_kg, variety)',
  });
  const { data: parcels } = useOfflineData({ table: 'parcels', select: 'id, name, area_ha' });
  const { data: crops } = useOfflineData({ table: 'crop_references', select: '*' });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ parcel_id: "", crop_reference_id: "", season: "", start_date: "", end_date: "", status: "planning" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parcel = parcels.find((p: any) => p.id === form.parcel_id);
    const crop = crops.find((c: any) => c.id === form.crop_reference_id);

    let expected_yield_kg: number | null = null;
    let expected_revenue: number | null = null;
    if (parcel && crop && (crop as any).avg_yield_per_ha) {
      expected_yield_kg = ((parcel as any).area_ha || 0) * (crop as any).avg_yield_per_ha;
      if ((crop as any).avg_price_per_kg) expected_revenue = expected_yield_kg * (crop as any).avg_price_per_kg;
    }

    const result = await insertRow({
      parcel_id: form.parcel_id,
      crop_reference_id: form.crop_reference_id || null,
      season: form.season,
      start_date: form.start_date,
      end_date: form.end_date || null,
      status: form.status,
      expected_yield_kg,
      expected_revenue,
    });
    if (result) {
      toast.success("Cycle cultural créé !");
      setForm({ parcel_id: "", crop_reference_id: "", season: "", start_date: "", end_date: "", status: "planning" });
      setOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce cycle ?")) return;
    const ok = await deleteRow(id);
    if (ok) toast.success("Cycle supprimé");
  };

  const handleCalculate = async (id: string) => {
    if (!navigator.onLine) { toast.warning("Calcul disponible uniquement en ligne"); return; }
    try {
      const { error } = await supabase.functions.invoke("calculate-crop-cycle", { body: { crop_cycle_id: id } });
      if (error) throw error;
      toast.success("Calculs exécutés !");
      // Refetch to show updated data
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Erreur de calcul");
    }
  };

  const statusColors: Record<string, string> = {
    planning: "bg-info/10 text-info",
    active: "bg-primary/10 text-primary",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Cycles culturaux</h1>
          <p className="text-muted-foreground mt-1">
            Planifiez et suivez vos saisons de culture
            {isOffline && <Badge variant="outline" className="ml-2 text-xs"><WifiOff className="h-3 w-3 mr-1" />Hors-ligne</Badge>}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground" disabled={parcels.length === 0}><Plus className="h-4 w-4 mr-2" />Nouveau cycle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau cycle cultural</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Parcelle *</Label>
                <Select value={form.parcel_id} onValueChange={(v) => setForm({ ...form, parcel_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir la parcelle" /></SelectTrigger>
                  <SelectContent>{parcels.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.area_ha} ha)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Culture</Label>
                <Select value={form.crop_reference_id} onValueChange={(v) => setForm({ ...form, crop_reference_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir la culture" /></SelectTrigger>
                  <SelectContent>{crops.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}{c.variety ? ` (${c.variety})` : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Saison *</Label>
                <Select value={form.season} onValueChange={(v) => setForm({ ...form, season: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir la saison" /></SelectTrigger>
                  <SelectContent>{seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Date début *</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Date fin</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.parcel_id && form.crop_reference_id && (() => {
                const p = parcels.find((x: any) => x.id === form.parcel_id) as any;
                const c = crops.find((x: any) => x.id === form.crop_reference_id) as any;
                if (!p || !c) return null;
                const yld = (p.area_ha || 0) * (c.avg_yield_per_ha || 0);
                const rev = yld * (c.avg_price_per_kg || 0);
                return (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 space-y-1 text-sm">
                    <p className="font-medium text-primary">Estimations automatiques</p>
                    <p>Rendement attendu : <strong>{fmt(yld)} kg</strong></p>
                    {rev > 0 && <p>Revenu estimé : <strong>{fmt(rev)} FCFA</strong></p>}
                    {c.plants_per_ha && <p>Plants : <strong>{fmt(c.plants_per_ha * (p.area_ha || 0))}</strong></p>}
                  </div>
                );
              })()}
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Créer le cycle</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">{[1, 2].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-40" /></Card>)}</div>
      ) : cycles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wheat className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{parcels.length === 0 ? "Créez d'abord des parcelles" : "Aucun cycle. Planifiez votre première saison !"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cycles.map((c: any) => (
            <Card key={c.id} className={`shadow-sm hover:shadow-warm transition-shadow ${c._offline ? 'border-dashed border-amber-400' : ''}`}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">
                    {c.crop_references?.name || "Culture non définie"}
                    {c._offline && <Badge variant="outline" className="ml-2 text-xs">En attente</Badge>}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{c.parcels?.name} · {c.season}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[c.status] || ""} variant="outline">
                    {statusOptions.find(s => s.value === c.status)?.label || c.status}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleCalculate(c.id)} title="Recalculer">
                    <Calculator className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-muted-foreground">Début:</span> {new Date(c.start_date).toLocaleDateString("fr-FR")}</p>
                  {c.end_date && <p><span className="text-muted-foreground">Fin:</span> {new Date(c.end_date).toLocaleDateString("fr-FR")}</p>}
                  {c.expected_yield_kg && <p><span className="text-muted-foreground">Rendement:</span> {fmt(c.expected_yield_kg)} kg</p>}
                  {c.expected_revenue && <p><span className="text-muted-foreground">Revenu:</span> {fmt(c.expected_revenue)} FCFA</p>}
                  {c.plant_count && <p><span className="text-muted-foreground">Plants:</span> {c.plant_count.toLocaleString()}</p>}
                  {c.climate_coefficient && c.climate_coefficient !== 1 && <p><span className="text-muted-foreground">Coeff. climat:</span> {c.climate_coefficient}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropCyclesPage;
