import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Wheat, Calculator } from "lucide-react";

const CropCyclesPage = () => {
  const [cycles, setCycles] = useState<any[]>([]);
  const [parcels, setParcels] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ parcel_id: "", crop_reference_id: "", season: "", start_date: "", end_date: "", status: "planning" });

  const fetchCycles = async () => {
    const { data, error } = await supabase.from("crop_cycles").select("*, parcels(name, area_ha, farms(name, climate_zones(climate_coefficient))), crop_references(name, avg_yield_per_ha, avg_price_per_kg)").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setCycles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCycles();
    supabase.from("parcels").select("id, name, area_ha").then(({ data }) => setParcels(data || []));
    supabase.from("crop_references").select("*").then(({ data }) => setCrops(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parcel = parcels.find(p => p.id === form.parcel_id);
    const crop = crops.find(c => c.id === form.crop_reference_id);
    
    // Calcul rendement & revenu estimés
    let expected_yield_kg: number | null = null;
    let expected_revenue: number | null = null;
    if (parcel && crop && crop.avg_yield_per_ha) {
      expected_yield_kg = (parcel.area_ha || 0) * crop.avg_yield_per_ha;
      if (crop.avg_price_per_kg) {
        expected_revenue = expected_yield_kg * crop.avg_price_per_kg;
      }
    }

    const { error } = await supabase.from("crop_cycles").insert({
      parcel_id: form.parcel_id,
      crop_reference_id: form.crop_reference_id || null,
      season: form.season,
      start_date: form.start_date,
      end_date: form.end_date || null,
      status: form.status,
      expected_yield_kg,
      expected_revenue,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Cycle cultural créé !");
    setForm({ parcel_id: "", crop_reference_id: "", season: "", start_date: "", end_date: "", status: "planning" });
    setOpen(false);
    fetchCycles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce cycle ?")) return;
    const { error } = await supabase.from("crop_cycles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Cycle supprimé"); fetchCycles(); }
  };

  const handleCalculate = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke("calculate-crop-cycle", {
        body: { crop_cycle_id: id },
      });
      if (error) throw error;
      toast.success("Calculs exécutés !");
      fetchCycles();
    } catch (err: any) {
      toast.error(err.message || "Erreur de calcul");
    }
  };

  const statusLabels: Record<string, string> = { planning: "Planification", active: "En cours", completed: "Terminé", cancelled: "Annulé" };
  const statusColors: Record<string, string> = { planning: "bg-info/10 text-info", active: "bg-success/10 text-success", completed: "bg-muted text-muted-foreground", cancelled: "bg-destructive/10 text-destructive" };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Cycles culturaux</h1>
          <p className="text-muted-foreground mt-1">Planifiez et suivez vos saisons de culture</p>
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
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{parcels.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.area_ha} ha)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Culture</Label>
                <Select value={form.crop_reference_id} onValueChange={(v) => setForm({ ...form, crop_reference_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{crops.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} {c.variety && `(${c.variety})`}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Saison *</Label>
                <Input value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} required placeholder="Saison pluvieuse 2026" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Date début *</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Date fin</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planification</SelectItem>
                    <SelectItem value="active">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Créer le cycle</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">{[1,2].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-40" /></Card>)}</div>
      ) : cycles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wheat className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{parcels.length === 0 ? "Créez d'abord des parcelles" : "Aucun cycle. Planifiez votre première saison !"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cycles.map((c) => (
            <Card key={c.id} className="shadow-sm hover:shadow-warm transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{c.crop_references?.name || "Culture non définie"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{c.parcels?.name} · {c.season}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[c.status] || ""}`}>{statusLabels[c.status] || c.status}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleCalculate(c.id)} title="Recalculer"><Calculator className="h-4 w-4 text-primary" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Début:</span> {new Date(c.start_date).toLocaleDateString("fr-FR")}</div>
                  {c.end_date && <div><span className="text-muted-foreground">Fin:</span> {new Date(c.end_date).toLocaleDateString("fr-FR")}</div>}
                  {c.expected_yield_kg && <div><span className="text-muted-foreground">Rendement estimé:</span> {Math.round(c.expected_yield_kg).toLocaleString()} kg</div>}
                  {c.expected_revenue && <div><span className="text-muted-foreground">Revenu estimé:</span> {Math.round(c.expected_revenue).toLocaleString()} FCFA</div>}
                  {c.plant_count && <div><span className="text-muted-foreground">Plants:</span> {c.plant_count.toLocaleString()}</div>}
                  {c.climate_coefficient && c.climate_coefficient !== 1 && <div><span className="text-muted-foreground">Coeff. climat:</span> {c.climate_coefficient}</div>}
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
