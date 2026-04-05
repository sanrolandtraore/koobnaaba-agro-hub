import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, Package, CheckCircle2, WifiOff } from "lucide-react";
import MarketplacePricePicker from "@/components/MarketplacePricePicker";
import { Badge } from "@/components/ui/badge";
import { useOfflineData } from "@/hooks/useOfflineData";

const HarvestsPage = () => {
  const { data: harvests, loading, isOffline, insertRow, updateRow, deleteRow } = useOfflineData({
    table: 'harvests',
    select: '*, crop_cycles(season, parcels(name), crop_references(name))',
    orderBy: 'date',
  });
  const { data: cycles } = useOfflineData({
    table: 'crop_cycles',
    select: 'id, season, parcels(name), crop_references(name)',
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ crop_cycle_id: "", date: "", quantity_kg: "", quality_grade: "A", lot_number: "", unit_price_kg: "", buyer: "", sold: false, notes: "" });

  const generateLot = () => {
    const now = new Date();
    return `LOT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.crop_cycle_id) { toast.error("Veuillez sélectionner un cycle cultural"); return; }
    if (!form.date) { toast.error("La date de récolte est requise"); return; }
    if (!form.quantity_kg || parseFloat(form.quantity_kg) <= 0) { toast.error("La quantité est requise"); return; }
    const result = await insertRow({
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
    if (result) {
      toast.success("Récolte enregistrée !");
      setForm({ crop_cycle_id: "", date: "", quantity_kg: "", quality_grade: "A", lot_number: "", unit_price_kg: "", buyer: "", sold: false, notes: "" });
      setOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette récolte ?")) return;
    const ok = await deleteRow(id);
    if (ok) toast.success("Supprimée");
  };

  const toggleSold = async (h: any) => {
    await updateRow(h.id, { sold: !h.sold });
  };

  const totalKg = harvests.reduce((s: number, h: any) => s + Number(h.quantity_kg), 0);
  const totalRevenue = harvests.filter((h: any) => h.sold && h.unit_price_kg).reduce((s: number, h: any) => s + Number(h.quantity_kg) * Number(h.unit_price_kg), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Récoltes & Traçabilité</h1>
          <p className="text-muted-foreground mt-1">
            Lots, qualité et ventes
            {isOffline && <Badge variant="outline" className="ml-2 text-xs"><WifiOff className="h-3 w-3 mr-1" />Hors-ligne</Badge>}
          </p>
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
                <div className="space-y-2"><Label>Prix/kg (FCFA)</Label><MarketplacePricePicker value={form.unit_price_kg} onChange={(v) => setForm({ ...form, unit_price_kg: v })} searchHint={cycles.find((c: any) => c.id === form.crop_cycle_id)?.crop_references?.name || ""} unit="FCFA" /></div>
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
          {harvests.map((h: any) => (
            <Card key={h.id} className={`shadow-sm hover:shadow-warm transition-shadow ${h._offline ? 'border-dashed border-amber-400' : ''}`}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {h.lot_number}
                    {h.sold && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {h._offline && <Badge variant="outline" className="text-xs">En attente</Badge>}
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
