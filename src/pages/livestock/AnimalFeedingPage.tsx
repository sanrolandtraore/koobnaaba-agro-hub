import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Wheat, Package, WifiOff } from "lucide-react";
import { useOfflineData } from "@/hooks/useOfflineData";

const feedTypes = [
  { value: "Fourrage vert", label: "🌿 Fourrage vert" },
  { value: "Foin", label: "🌾 Foin" },
  { value: "Paille", label: "🥬 Paille" },
  { value: "Son de blé", label: "🌾 Son de blé" },
  { value: "Son de maïs", label: "🌽 Son de maïs" },
  { value: "Tourteau de coton", label: "🧶 Tourteau de coton" },
  { value: "Tourteau d'arachide", label: "🥜 Tourteau d'arachide" },
  { value: "Tourteau de soja", label: "🫘 Tourteau de soja" },
  { value: "Provende pondeuse", label: "🐔 Provende pondeuse" },
  { value: "Provende chair", label: "🐓 Provende chair" },
  { value: "Provende porcin", label: "🐷 Provende porcin" },
  { value: "Aliment poisson", label: "🐟 Aliment poisson" },
  { value: "Pierre à lécher", label: "🧂 Pierre à lécher" },
  { value: "CMV (Complément)", label: "💊 CMV (Complément)" },
  { value: "Céréales (maïs, mil)", label: "🌽 Céréales (maïs, mil)" },
  { value: "Drêche de brasserie", label: "🍺 Drêche de brasserie" },
  { value: "Autre", label: "📝 Autre" },
];

const suppliers = [
  "Marché local", "Coopérative", "Provenderie", "Grossiste", "Production propre", "Autre",
];

const AnimalFeedingPage = () => {
  const { data: feedings, loading: loadingFeedings, isOffline, insertRow: insertFeeding, deleteRow: deleteFeeding } = useOfflineData({
    table: 'animal_feedings',
    select: '*, animals(name, species), farms(name)',
    orderBy: 'feeding_date',
  });
  const { data: stocks, loading: loadingStocks, insertRow: insertStock, deleteRow: deleteStock } = useOfflineData({
    table: 'feed_stocks',
    select: '*, farms(name)',
    orderBy: 'feed_name',
    ascending: true,
  });
  const { data: farms } = useOfflineData({ table: 'farms', select: 'id, name' });
  const { data: animals } = useOfflineData({ table: 'animals', select: 'id, name, identification_number, species' });

  const [openFeeding, setOpenFeeding] = useState(false);
  const [openStock, setOpenStock] = useState(false);

  const [feedForm, setFeedForm] = useState({
    animal_id: "", farm_id: "", feed_type: "", quantity_kg: "", cost: "",
    feeding_date: new Date().toISOString().split("T")[0], notes: "",
  });
  const [stockForm, setStockForm] = useState({
    farm_id: "", feed_name: "", quantity_kg: "", unit_price: "", supplier: "", notes: "",
  });

  const handleFeedingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedForm.farm_id) { toast.error("Veuillez sélectionner une exploitation"); return; }
    if (!feedForm.feed_type) { toast.error("Le type d'aliment est requis"); return; }
    if (!feedForm.quantity_kg || Number(feedForm.quantity_kg) <= 0) { toast.error("La quantité est requise"); return; }
    const result = await insertFeeding({
      animal_id: feedForm.animal_id || null,
      farm_id: feedForm.farm_id,
      feed_type: feedForm.feed_type,
      quantity_kg: Number(feedForm.quantity_kg),
      cost: feedForm.cost ? Number(feedForm.cost) : 0,
      feeding_date: feedForm.feeding_date,
      notes: feedForm.notes || null,
    });
    if (result) {
      toast.success("Alimentation enregistrée ✓");
      setOpenFeeding(false);
      setFeedForm({ animal_id: "", farm_id: "", feed_type: "", quantity_kg: "", cost: "", feeding_date: new Date().toISOString().split("T")[0], notes: "" });
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await insertStock({
      farm_id: stockForm.farm_id,
      feed_name: stockForm.feed_name,
      quantity_kg: Number(stockForm.quantity_kg),
      unit_price: stockForm.unit_price ? Number(stockForm.unit_price) : 0,
      supplier: stockForm.supplier || null,
      last_purchase_date: new Date().toISOString().split("T")[0],
      notes: stockForm.notes || null,
    });
    if (result) {
      toast.success("Stock ajouté ✓");
      setOpenStock(false);
      setStockForm({ farm_id: "", feed_name: "", quantity_kg: "", unit_price: "", supplier: "", notes: "" });
    }
  };

  const handleDeleteFeeding = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    await deleteFeeding(id);
    toast.success("Supprimé");
  };

  const handleDeleteStock = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    await deleteStock(id);
    toast.success("Supprimé");
  };

  const loading = loadingFeedings || loadingStocks;
  const totalStockValue = stocks.reduce((s: number, st: any) => s + Number(st.quantity_kg) * Number(st.unit_price), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Alimentation & Stocks</h1>
          {isOffline && <Badge variant="outline" className="mt-1 text-xs"><WifiOff className="h-3 w-3 mr-1" />Mode hors-ligne</Badge>}
        </div>
      </div>

      <Tabs defaultValue="feedings">
        <TabsList>
          <TabsTrigger value="feedings"><Wheat className="h-4 w-4 mr-1" />Alimentation</TabsTrigger>
          <TabsTrigger value="stocks"><Package className="h-4 w-4 mr-1" />Stocks ({stocks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="feedings" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openFeeding} onOpenChange={setOpenFeeding}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Enregistrer alimentation</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Alimentation</DialogTitle></DialogHeader>
                <form onSubmit={handleFeedingSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Exploitation *</Label>
                    <Select value={feedForm.farm_id} onValueChange={(v) => setFeedForm({ ...feedForm, farm_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{farms.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Animal (optionnel)</Label>
                    <Select value={feedForm.animal_id} onValueChange={(v) => setFeedForm({ ...feedForm, animal_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Groupe / individuel" /></SelectTrigger>
                      <SelectContent>{animals.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name || a.identification_number || a.id.slice(0, 8)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Type d'aliment *</Label>
                    <Select value={feedForm.feed_type} onValueChange={(v) => setFeedForm({ ...feedForm, feed_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir l'aliment..." /></SelectTrigger>
                      <SelectContent>{feedTypes.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Quantité (kg) *</Label><Input type="number" placeholder="0" value={feedForm.quantity_kg} onChange={(e) => setFeedForm({ ...feedForm, quantity_kg: e.target.value })} required /></div>
                    <div className="space-y-1"><Label>Coût (FCFA)</Label><Input type="number" placeholder="0" value={feedForm.cost} onChange={(e) => setFeedForm({ ...feedForm, cost: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1"><Label>Date</Label><Input type="date" value={feedForm.feeding_date} onChange={(e) => setFeedForm({ ...feedForm, feeding_date: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Notes</Label><Input placeholder="Observations..." value={feedForm.notes} onChange={(e) => setFeedForm({ ...feedForm, notes: e.target.value })} /></div>
                  <Button type="submit" className="w-full" disabled={!feedForm.farm_id || !feedForm.feed_type}>Enregistrer</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : feedings.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Aucune alimentation enregistrée</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {feedings.map((f: any) => (
                <Card key={f.id} className={f._offline ? 'border-dashed border-amber-400' : ''}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{f.feed_type} — {Number(f.quantity_kg)} kg {f._offline && <Badge variant="outline" className="text-xs">En attente</Badge>}</p>
                      <p className="text-sm text-muted-foreground">
                        {f.animals?.name || "Groupe"} • {f.farms?.name} • {new Date(f.feeding_date).toLocaleDateString("fr-FR")}
                        {f.cost > 0 && ` • ${Number(f.cost).toLocaleString()} FCFA`}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteFeeding(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stocks" className="space-y-4">
          <div className="flex items-center justify-between">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Valeur totale stock</p><p className="text-xl font-bold">{totalStockValue.toLocaleString()} FCFA</p></CardContent></Card>
            <Dialog open={openStock} onOpenChange={setOpenStock}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Ajouter stock</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nouveau stock aliment</DialogTitle></DialogHeader>
                <form onSubmit={handleStockSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Exploitation *</Label>
                    <Select value={stockForm.farm_id} onValueChange={(v) => setStockForm({ ...stockForm, farm_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{farms.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Aliment *</Label>
                    <Select value={stockForm.feed_name} onValueChange={(v) => setStockForm({ ...stockForm, feed_name: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir l'aliment..." /></SelectTrigger>
                      <SelectContent>{feedTypes.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Quantité (kg) *</Label><Input type="number" placeholder="0" value={stockForm.quantity_kg} onChange={(e) => setStockForm({ ...stockForm, quantity_kg: e.target.value })} required /></div>
                    <div className="space-y-1"><Label>Prix/kg (FCFA)</Label><Input type="number" placeholder="0" value={stockForm.unit_price} onChange={(e) => setStockForm({ ...stockForm, unit_price: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1">
                    <Label>Fournisseur</Label>
                    <Select value={stockForm.supplier} onValueChange={(v) => setStockForm({ ...stockForm, supplier: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{suppliers.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Notes</Label><Input placeholder="Observations..." value={stockForm.notes} onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })} /></div>
                  <Button type="submit" className="w-full" disabled={!stockForm.farm_id || !stockForm.feed_name}>Enregistrer</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {stocks.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun stock enregistré</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stocks.map((s: any) => (
                <Card key={s.id} className={s._offline ? 'border-dashed border-amber-400' : ''}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{s.feed_name} {s._offline && <Badge variant="outline" className="text-xs">En attente</Badge>}</p>
                        <p className="text-sm text-muted-foreground">{s.farms?.name}</p>
                        <p className="text-sm mt-1">{Number(s.quantity_kg)} kg × {Number(s.unit_price).toLocaleString()} FCFA/kg</p>
                        {s.supplier && <p className="text-xs text-muted-foreground">Fournisseur: {s.supplier}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteStock(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnimalFeedingPage;
