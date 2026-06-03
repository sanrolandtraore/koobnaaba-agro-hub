import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOfflineData } from "@/hooks/useOfflineData";
import { useDefaultLivestockFarm } from "@/hooks/useDefaultLivestockFarm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, TrendingDown, TrendingUp, DollarSign, WifiOff } from "lucide-react";
import MarketplacePricePicker from "@/components/MarketplacePricePicker";

const expenseCategories = [
  { value: "alimentation", label: "🌾 Alimentation" },
  { value: "sante", label: "💊 Santé / Véto" },
  { value: "equipement", label: "🔧 Équipement" },
  { value: "transport", label: "🚛 Transport" },
  { value: "main_oeuvre", label: "👷 Main d'œuvre" },
  { value: "habitat", label: "🏠 Habitat / Abri" },
  { value: "eau_energie", label: "💧 Eau / Énergie" },
  { value: "autre", label: "📝 Autre" },
];

const expenseDescriptions: Record<string, string[]> = {
  alimentation: ["Achat provende", "Achat fourrage", "Achat son", "Achat tourteau", "Pierre à lécher", "Compléments", "Autre"],
  sante: ["Vaccination", "Traitement maladie", "Consultation vétérinaire", "Vermifuge", "Chirurgie", "Médicaments", "Autre"],
  equipement: ["Mangeoire/Abreuvoir", "Clôture", "Enclos/Poulailler", "Bassin (pisciculture)", "Couveuse", "Outil de pesée", "Autre"],
  transport: ["Transport animaux", "Transport aliments", "Déplacement vétérinaire", "Autre"],
  main_oeuvre: ["Berger/Gardien", "Ouvrier journalier", "Technicien", "Autre"],
  habitat: ["Construction abri", "Réparation enclos", "Litière/Paille", "Nettoyage", "Autre"],
  eau_energie: ["Facture eau", "Facture électricité", "Pompage", "Autre"],
  autre: ["Assurance", "Taxes", "Formation", "Autre"],
};

const saleTypes = [
  { value: "animal", label: "🐄 Vente animal" },
  { value: "lait", label: "🥛 Lait" },
  { value: "oeufs", label: "🥚 Œufs" },
  { value: "poisson", label: "🐟 Poisson" },
  { value: "fumier", label: "💩 Fumier" },
  { value: "peau_cuir", label: "🧥 Peau / Cuir" },
  { value: "miel", label: "🍯 Miel" },
  { value: "autre", label: "📝 Autre" },
];

const saleDescriptions: Record<string, string[]> = {
  animal: ["Vente sur pied", "Vente après engraissement", "Vente réforme", "Vente jeune", "Autre"],
  lait: ["Lait frais", "Lait caillé", "Fromage", "Yaourt", "Autre"],
  oeufs: ["Œufs de consommation", "Œufs à couver", "Autre"],
  poisson: ["Tilapia", "Clarias", "Carpe", "Autre"],
  fumier: ["Fumier frais", "Compost", "Autre"],
  peau_cuir: ["Peau brute", "Cuir traité", "Autre"],
  miel: ["Miel brut", "Miel filtré", "Autre"],
  autre: ["Autre produit", "Service (saillie)", "Autre"],
};

const buyers = ["Marché local", "Boucher", "Grossiste", "Particulier", "Restaurant/Hôtel", "Exportation", "Autre"];

const LivestockFinancePage = () => {
  const { user } = useAuth();
  const { farmId } = useDefaultLivestockFarm();

  const { data: expenses, loading: loadingExp, isOffline, insertRow: insertExpense, deleteRow: deleteExpense } = useOfflineData({
    table: "livestock_expenses",
    select: "*, animals(name)",
    orderBy: "expense_date",
  });

  const { data: sales, loading: loadingSale, insertRow: insertSale, deleteRow: deleteSale } = useOfflineData({
    table: "livestock_sales",
    select: "*, animals(name)",
    orderBy: "sale_date",
  });

  const { data: animals } = useOfflineData({ table: 'animals', select: 'id, name, identification_number, species', queryKey: 'finance-animals-actif', filter: [{ column: 'status', value: 'actif' }] });
  const [openExpense, setOpenExpense] = useState(false);
  const [openSale, setOpenSale] = useState(false);

  const [expForm, setExpForm] = useState({
    animal_id: "", category: "alimentation", description: "",
    amount: "", expense_date: new Date().toISOString().split("T")[0], notes: "",
  });
  const [saleForm, setSaleForm] = useState({
    animal_id: "", sale_type: "animal", description: "",
    quantity: "1", unit_price: "", buyer: "",
    sale_date: new Date().toISOString().split("T")[0], notes: "",
  });

  const loading = loadingExp || loadingSale;

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId) { toast.error("Initialisation en cours, réessayez"); return; }
    if (!expForm.description) { toast.error("Description requise"); return; }
    const amount = Number(expForm.amount);
    if (!amount || amount <= 0) { toast.error("Montant invalide"); return; }
    const result = await insertExpense({
      farm_id: farmId,
      animal_id: expForm.animal_id || null,
      category: expForm.category,
      description: expForm.description,
      amount,
      expense_date: expForm.expense_date,
      notes: expForm.notes || null,
    });
    if (result) {
      toast.success("Dépense enregistrée ✓");
      setOpenExpense(false);
      setExpForm({ animal_id: "", category: "alimentation", description: "", amount: "", expense_date: new Date().toISOString().split("T")[0], notes: "" });
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.farm_id) { toast.error("Veuillez sélectionner une exploitation"); return; }
    if (!saleForm.description) { toast.error("Description requise"); return; }
    const quantity = Number(saleForm.quantity);
    const unitPrice = Number(saleForm.unit_price);
    if (!quantity || quantity <= 0) { toast.error("Quantité invalide"); return; }
    if (!unitPrice || unitPrice <= 0) { toast.error("Prix unitaire invalide"); return; }
    const total = quantity * unitPrice;
    const result = await insertSale({
      farm_id: saleForm.farm_id,
      animal_id: saleForm.animal_id || null,
      sale_type: saleForm.sale_type,
      description: saleForm.description,
      quantity,
      unit_price: unitPrice,
      total_amount: total,
      buyer: saleForm.buyer || null,
      sale_date: saleForm.sale_date,
      notes: saleForm.notes || null,
    });
    if (result) {
      toast.success("Vente enregistrée ✓");
      setOpenSale(false);
      setSaleForm({ farm_id: "", animal_id: "", sale_type: "animal", description: "", quantity: "1", unit_price: "", buyer: "", sale_date: new Date().toISOString().split("T")[0], notes: "" });
    }
  };

  const totalExpenses = expenses.reduce((s, e: any) => s + Number(e.amount), 0);
  const totalSales = sales.reduce((s, e: any) => s + Number(e.total_amount), 0);
  const profit = totalSales - totalExpenses;

  const currentExpDescs = expenseDescriptions[expForm.category] || [];
  const currentSaleDescs = saleDescriptions[saleForm.sale_type] || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
        Comptabilité Élevage
        {isOffline && <WifiOff className="h-4 w-4 text-warning" />}
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><TrendingDown className="h-8 w-8 text-destructive" /><div><p className="text-sm text-muted-foreground">Total dépenses</p><p className="text-xl font-bold">{totalExpenses.toLocaleString()} FCFA</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-8 w-8 text-emerald-500" /><div><p className="text-sm text-muted-foreground">Total ventes</p><p className="text-xl font-bold">{totalSales.toLocaleString()} FCFA</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><DollarSign className={`h-8 w-8 ${profit >= 0 ? "text-emerald-500" : "text-destructive"}`} /><div><p className="text-sm text-muted-foreground">Bénéfice net</p><p className="text-xl font-bold">{profit.toLocaleString()} FCFA</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses"><TrendingDown className="h-4 w-4 mr-1" />Dépenses ({expenses.length})</TabsTrigger>
          <TabsTrigger value="sales"><TrendingUp className="h-4 w-4 mr-1" />Ventes ({sales.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openExpense} onOpenChange={setOpenExpense}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Nouvelle dépense</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Dépense élevage</DialogTitle></DialogHeader>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Exploitation *</Label>
                    <Select value={expForm.farm_id} onValueChange={(v) => setExpForm({ ...expForm, farm_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Catégorie *</Label>
                    <Select value={expForm.category} onValueChange={(v) => setExpForm({ ...expForm, category: v, description: "" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{expenseCategories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Description *</Label>
                    <Select value={expForm.description} onValueChange={(v) => setExpForm({ ...expForm, description: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{currentExpDescs.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Montant (FCFA) *</Label><MarketplacePricePicker value={expForm.amount} onChange={(v) => setExpForm({ ...expForm, amount: v })} searchHint={expForm.description} unit="FCFA" /></div>
                    <div className="space-y-1"><Label>Date</Label><Input type="date" value={expForm.expense_date} onChange={(e) => setExpForm({ ...expForm, expense_date: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1">
                    <Label>Animal (optionnel)</Label>
                    <Select value={expForm.animal_id} onValueChange={(v) => setExpForm({ ...expForm, animal_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Dépense générale" /></SelectTrigger>
                      <SelectContent>{animals.map((a) => <SelectItem key={a.id} value={a.id}>{a.name || a.identification_number || a.id.slice(0, 8)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={!expForm.farm_id || !expForm.description}>Enregistrer</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? <Skeleton className="h-40" /> : expenses.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Aucune dépense</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {expenses.map((e: any) => (
                <Card key={e.id} className={e._offline ? "border-warning/50" : ""}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{e.description} {e._offline && <span className="text-xs text-warning">(hors-ligne)</span>}</p>
                      <p className="text-sm text-muted-foreground">{expenseCategories.find((c) => c.value === e.category)?.label || e.category} • {e.farms?.name} • {new Date(e.expense_date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-destructive">{Number(e.amount).toLocaleString()} FCFA</span>
                      <Button variant="ghost" size="icon" onClick={async () => { if (!confirm("Supprimer ?")) return; const ok = await deleteExpense(e.id); if (ok) toast.success("Supprimé"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openSale} onOpenChange={setOpenSale}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Nouvelle vente</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Vente élevage</DialogTitle></DialogHeader>
                <form onSubmit={handleSaleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Label>Exploitation *</Label>
                    <Select value={saleForm.farm_id} onValueChange={(v) => setSaleForm({ ...saleForm, farm_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Type de vente *</Label>
                    <Select value={saleForm.sale_type} onValueChange={(v) => setSaleForm({ ...saleForm, sale_type: v, description: "" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{saleTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Description *</Label>
                    <Select value={saleForm.description} onValueChange={(v) => setSaleForm({ ...saleForm, description: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{currentSaleDescs.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Quantité *</Label><Input type="number" placeholder="1" value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })} required /></div>
                    <div className="space-y-1"><Label>Prix unitaire (FCFA) *</Label><MarketplacePricePicker value={saleForm.unit_price} onChange={(v) => setSaleForm({ ...saleForm, unit_price: v })} searchHint={saleForm.description} unit="FCFA" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Acheteur</Label>
                      <Select value={saleForm.buyer} onValueChange={(v) => setSaleForm({ ...saleForm, buyer: v })}>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>{buyers.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Date</Label><Input type="date" value={saleForm.sale_date} onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1">
                    <Label>Animal (optionnel)</Label>
                    <Select value={saleForm.animal_id} onValueChange={(v) => setSaleForm({ ...saleForm, animal_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Vente générale" /></SelectTrigger>
                      <SelectContent>{animals.map((a) => <SelectItem key={a.id} value={a.id}>{a.name || a.identification_number || a.id.slice(0, 8)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={!saleForm.farm_id || !saleForm.description}>Enregistrer</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? <Skeleton className="h-40" /> : sales.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Aucune vente</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {sales.map((s: any) => (
                <Card key={s.id} className={s._offline ? "border-warning/50" : ""}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.description} {s._offline && <span className="text-xs text-warning">(hors-ligne)</span>}</p>
                      <p className="text-sm text-muted-foreground">{saleTypes.find((t) => t.value === s.sale_type)?.label || s.sale_type} • {s.buyer || "—"} • {new Date(s.sale_date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600">{Number(s.total_amount).toLocaleString()} FCFA</span>
                      <Button variant="ghost" size="icon" onClick={async () => { if (!confirm("Supprimer ?")) return; const ok = await deleteSale(s.id); if (ok) toast.success("Supprimé"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default LivestockFinancePage;
