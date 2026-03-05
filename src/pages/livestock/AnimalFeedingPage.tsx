import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, Wheat, Package } from "lucide-react";

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
  const { user } = useAuth();
  const [feedings, setFeedings] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFeeding, setOpenFeeding] = useState(false);
  const [openStock, setOpenStock] = useState(false);

  const [feedForm, setFeedForm] = useState({
    animal_id: "", farm_id: "", feed_type: "", quantity_kg: "", cost: "",
    feeding_date: new Date().toISOString().split("T")[0], notes: "",
  });
  const [stockForm, setStockForm] = useState({
    farm_id: "", feed_name: "", quantity_kg: "", unit_price: "", supplier: "", notes: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    const [farmsRes, animalsRes, feedingsRes, stocksRes] = await Promise.all([
      supabase.from("farms").select("id, name"),
      supabase.from("animals").select("id, name, identification_number, species").eq("status", "actif"),
      supabase.from("animal_feedings").select("*, animals(name, species), farms(name)").order("feeding_date", { ascending: false }),
      supabase.from("feed_stocks").select("*, farms(name)").order("feed_name"),
    ]);
    setFarms(farmsRes.data || []);
    setAnimals(animalsRes.data || []);
    setFeedings(feedingsRes.data || []);
    setStocks(stocksRes.data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const handleFeedingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("animal_feedings").insert({
      animal_id: feedForm.animal_id || null,
      farm_id: feedForm.farm_id,
      feed_type: feedForm.feed_type,
      quantity_kg: Number(feedForm.quantity_kg),
      cost: feedForm.cost ? Number(feedForm.cost) : 0,
      feeding_date: feedForm.feeding_date,
      notes: feedForm.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Alimentation enregistrée ✓");
    setOpenFeeding(false);
    setFeedForm({ animal_id: "", farm_id: "", feed_type: "", quantity_kg: "", cost: "", feeding_date: new Date().toISOString().split("T")[0], notes: "" });
    fetchAll();
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("feed_stocks").insert({
      farm_id: stockForm.farm_id,
      feed_name: stockForm.feed_name,
      quantity_kg: Number(stockForm.quantity_kg),
      unit_price: stockForm.unit_price ? Number(stockForm.unit_price) : 0,
      supplier: stockForm.supplier || null,
      last_purchase_date: new Date().toISOString().split("T")[0],
      notes: stockForm.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Stock ajouté ✓");
    setOpenStock(false);
    setStockForm({ farm_id: "", feed_name: "", quantity_kg: "", unit_price: "", supplier: "", notes: "" });
    fetchAll();
  };

  const handleDeleteFeeding = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("animal_feedings").delete().eq("id", id);
    toast.success("Supprimé");
    fetchAll();
  };

  const handleDeleteStock = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("feed_stocks").delete().eq("id", id);
    toast.success("Supprimé");
    fetchAll();
  };

  const totalStockValue = stocks.reduce((s, st) => s + Number(st.quantity_kg) * Number(st.unit_price), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Alimentation & Stocks</h1>

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
                      <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Animal (optionnel)</Label>
                    <Select value={feedForm.animal_id} onValueChange={(v) => setFeedForm({ ...feedForm, animal_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Groupe / individuel" /></SelectTrigger>
                      <SelectContent>{animals.map((a) => <SelectItem key={a.id} value={a.id}>{a.name || a.identification_number || a.id.slice(0, 8)}</SelectItem>)}</SelectContent>
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
              {feedings.map((f) => (
                <Card key={f.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{f.feed_type} — {Number(f.quantity_kg)} kg</p>
                      <p className="text-sm text-muted-foreground">
                        {(f as any).animals?.name || "Groupe"} • {(f as any).farms?.name} • {new Date(f.feeding_date).toLocaleDateString("fr-FR")}
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
                      <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
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
              {stocks.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{s.feed_name}</p>
                        <p className="text-sm text-muted-foreground">{(s as any).farms?.name}</p>
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
