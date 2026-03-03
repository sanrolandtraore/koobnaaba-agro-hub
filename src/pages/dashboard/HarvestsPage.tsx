import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, Package, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const HarvestsPage = () => {
  const [harvests, setHarvests] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ crop_cycle_id: "", date: "", quantity_kg: "", quality_grade: "A", lot_number: "", unit_price_kg: "", buyer: "", sold: false, notes: "" });

  const fetchHarvests = async () => {
    const { data, error } = await supabase.from("harvests").select("*, crop_cycles(season, parcels(name), crop_references(name))").order("date", { ascending: false });
    if (error) toast.error(error.message);
    else setHarvests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHarvests();
    supabase.from("crop_cycles").select("id, season, parcels(name), crop_references(name)").order("created_at", { ascending: false }).then(({ data }) => setCycles(data || []));
  }, []);

  const generateLot = () => {
    const now = new Date();
    return `LOT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("harvests").insert({
      crop_cycle_id: form.crop_cycle_id,
      date: form.date,
      quantity_kg: parseFloat(form.quantity_kg) || 0,
      quality_grade: form.quality_grade,
      lot_number: form.lot_number || generateLot(),
      unit_price_kg: form.unit_price_kg ? parseFloat(form.unit_price_kg) : null,
      buyer: form.buyer || null,
      sold: form.sold,
      notes: form.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Récolte enregistrée !");
    setForm({ crop_cycle_id: "", date: "", quantity_kg: "", quality_grade: "A", lot_number: "", unit_price_kg: "", buyer: "", sold: false, notes: "" });
    setOpen(false);
    fetchHarvests();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette récolte ?")) return;
    const { error } = await supabase.from("harvests").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimée"); fetchHarvests(); }
  };

  const toggleSold = async (h: any) => {
    const { error } = await supabase.from("harvests").update({ sold: !h.sold }).eq("id", h.id);
    if (error) toast.error(error.message);
    else fetchHarvests();
  };

  const totalKg = harvests.reduce((s, h) => s + Number(h.quantity_kg), 0);
  const totalRevenue = harvests.filter(h => h.sold && h.unit_price_kg).reduce((s, h) => s + Number(h.quantity_kg) * Number(h.unit_price_kg), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Récoltes & Traçabilité</h1>
          <p className="text-muted-foreground mt-1">Lots, qualité et ventes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground" disabled={cycles.length === 0}><Plus className="h-4 w-4 mr-2" />Nouvelle récolte</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Enregistrer une récolte</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cycle cultural *</Label>
                <Select value={form.crop_cycle_id} onValueChange={(v) => setForm({ ...form, crop_cycle_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{cycles.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.crop_references?.name || "—"} · {c.parcels?.name} · {c.season}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Quantité (kg) *</Label><Input type="number" value={form.quantity_kg} onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Qualité</Label>
                  <Select value={form.quality_grade} onValueChange={(v) => setForm({ ...form, quality_grade: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A (Premium)</SelectItem>
                      <SelectItem value="B">Grade B (Standard)</SelectItem>
                      <SelectItem value="C">Grade C (Secondaire)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>N° Lot</Label><Input value={form.lot_number} onChange={(e) => setForm({ ...form, lot_number: e.target.value })} placeholder="Auto-généré" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Prix/kg (FCFA)</Label><Input type="number" value={form.unit_price_kg} onChange={(e) => setForm({ ...form, unit_price_kg: e.target.value })} /></div>
                <div className="space-y-2"><Label>Acheteur</Label><Input value={form.buyer} onChange={(e) => setForm({ ...form, buyer: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.sold} onCheckedChange={(v) => setForm({ ...form, sold: !!v })} id="sold" />
                <Label htmlFor="sold">Vendue</Label>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {harvests.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total récolté</p><p className="text-2xl font-bold">{Math.round(totalKg).toLocaleString()} kg</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Revenu ventes</p><p className="text-2xl font-bold">{Math.round(totalRevenue).toLocaleString()} FCFA</p></CardContent></Card>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">{[1, 2].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}</div>
      ) : harvests.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12"><Package className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucune récolte enregistrée</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {harvests.map((h) => (
            <Card key={h.id} className="shadow-sm hover:shadow-warm transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {h.lot_number}
                    {h.sold && <CheckCircle2 className="h-4 w-4 text-success" />}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{h.crop_cycles?.crop_references?.name} · {h.crop_cycles?.parcels?.name} · {h.crop_cycles?.season}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline">Grade {h.quality_grade}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => toggleSold(h)} title={h.sold ? "Marquer non vendu" : "Marquer vendu"}><CheckCircle2 className={`h-4 w-4 ${h.sold ? "text-success" : "text-muted-foreground"}`} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Date:</span> {new Date(h.date).toLocaleDateString("fr-FR")}</div>
                  <div><span className="text-muted-foreground">Quantité:</span> {Number(h.quantity_kg).toLocaleString()} kg</div>
                  {h.unit_price_kg && <div><span className="text-muted-foreground">Prix/kg:</span> {Number(h.unit_price_kg).toLocaleString()} FCFA</div>}
                  {h.buyer && <div><span className="text-muted-foreground">Acheteur:</span> {h.buyer}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HarvestsPage;
