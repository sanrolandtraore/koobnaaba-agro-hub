import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, TrendingDown, TrendingUp, DollarSign } from "lucide-react";

const expenseCategories = [
  { value: "alimentation", label: "Alimentation" },
  { value: "sante", label: "Santé / Véto" },
  { value: "equipement", label: "Équipement" },
  { value: "transport", label: "Transport" },
  { value: "main_oeuvre", label: "Main d'œuvre" },
  { value: "autre", label: "Autre" },
];

const saleTypes = [
  { value: "animal", label: "Vente animal" },
  { value: "lait", label: "Lait" },
  { value: "oeufs", label: "Œufs" },
  { value: "poisson", label: "Poisson" },
  { value: "fumier", label: "Fumier" },
  { value: "autre", label: "Autre" },
];

const LivestockFinancePage = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openExpense, setOpenExpense] = useState(false);
  const [openSale, setOpenSale] = useState(false);

  const [expForm, setExpForm] = useState({
    farm_id: "", animal_id: "", category: "alimentation", description: "",
    amount: "", expense_date: new Date().toISOString().split("T")[0], notes: "",
  });
  const [saleForm, setSaleForm] = useState({
    farm_id: "", animal_id: "", sale_type: "animal", description: "",
    quantity: "1", unit_price: "", buyer: "",
    sale_date: new Date().toISOString().split("T")[0], notes: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    const [farmsRes, animalsRes, expRes, salesRes] = await Promise.all([
      supabase.from("farms").select("id, name"),
      supabase.from("animals").select("id, name, identification_number, species"),
      supabase.from("livestock_expenses").select("*, farms(name), animals(name)").order("expense_date", { ascending: false }),
      supabase.from("livestock_sales").select("*, farms(name), animals(name)").order("sale_date", { ascending: false }),
    ]);
    setFarms(farmsRes.data || []);
    setAnimals(animalsRes.data || []);
    setExpenses(expRes.data || []);
    setSales(salesRes.data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("livestock_expenses").insert({
      farm_id: expForm.farm_id,
      animal_id: expForm.animal_id || null,
      category: expForm.category,
      description: expForm.description,
      amount: Number(expForm.amount),
      expense_date: expForm.expense_date,
      notes: expForm.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Dépense enregistrée");
    setOpenExpense(false);
    setExpForm({ farm_id: "", animal_id: "", category: "alimentation", description: "", amount: "", expense_date: new Date().toISOString().split("T")[0], notes: "" });
    fetchAll();
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(saleForm.quantity) * Number(saleForm.unit_price);
    const { error } = await supabase.from("livestock_sales").insert({
      farm_id: saleForm.farm_id,
      animal_id: saleForm.animal_id || null,
      sale_type: saleForm.sale_type,
      description: saleForm.description,
      quantity: Number(saleForm.quantity),
      unit_price: Number(saleForm.unit_price),
      total_amount: total,
      buyer: saleForm.buyer || null,
      sale_date: saleForm.sale_date,
      notes: saleForm.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Vente enregistrée");
    setOpenSale(false);
    setSaleForm({ farm_id: "", animal_id: "", sale_type: "animal", description: "", quantity: "1", unit_price: "", buyer: "", sale_date: new Date().toISOString().split("T")[0], notes: "" });
    fetchAll();
  };

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalSales = sales.reduce((s, e) => s + Number(e.total_amount), 0);
  const profit = totalSales - totalExpenses;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Comptabilité Élevage</h1>

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
                  <Select value={expForm.farm_id} onValueChange={(v) => setExpForm({ ...expForm, farm_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Exploitation *" /></SelectTrigger>
                    <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={expForm.category} onValueChange={(v) => setExpForm({ ...expForm, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{expenseCategories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Description *" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} required />
                  <Input type="number" placeholder="Montant (FCFA) *" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} required />
                  <Input type="date" value={expForm.expense_date} onChange={(e) => setExpForm({ ...expForm, expense_date: e.target.value })} />
                  <Button type="submit" className="w-full" disabled={!expForm.farm_id || !expForm.description}>Enregistrer</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? <Skeleton className="h-40" /> : expenses.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Aucune dépense</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {expenses.map((e) => (
                <Card key={e.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{e.description}</p>
                      <p className="text-sm text-muted-foreground">{expenseCategories.find((c) => c.value === e.category)?.label} • {(e as any).farms?.name} • {new Date(e.expense_date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-destructive">{Number(e.amount).toLocaleString()} FCFA</span>
                      <Button variant="ghost" size="icon" onClick={async () => { await supabase.from("livestock_expenses").delete().eq("id", e.id); toast.success("Supprimé"); fetchAll(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
                  <Select value={saleForm.farm_id} onValueChange={(v) => setSaleForm({ ...saleForm, farm_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Exploitation *" /></SelectTrigger>
                    <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={saleForm.sale_type} onValueChange={(v) => setSaleForm({ ...saleForm, sale_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{saleTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Description *" value={saleForm.description} onChange={(e) => setSaleForm({ ...saleForm, description: e.target.value })} required />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="number" placeholder="Quantité *" value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })} required />
                    <Input type="number" placeholder="Prix unitaire *" value={saleForm.unit_price} onChange={(e) => setSaleForm({ ...saleForm, unit_price: e.target.value })} required />
                  </div>
                  <Input placeholder="Acheteur" value={saleForm.buyer} onChange={(e) => setSaleForm({ ...saleForm, buyer: e.target.value })} />
                  <Input type="date" value={saleForm.sale_date} onChange={(e) => setSaleForm({ ...saleForm, sale_date: e.target.value })} />
                  <Button type="submit" className="w-full" disabled={!saleForm.farm_id || !saleForm.description}>Enregistrer</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? <Skeleton className="h-40" /> : sales.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Aucune vente</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {sales.map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.description}</p>
                      <p className="text-sm text-muted-foreground">{saleTypes.find((t) => t.value === s.sale_type)?.label} • {s.buyer || "—"} • {new Date(s.sale_date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600">{Number(s.total_amount).toLocaleString()} FCFA</span>
                      <Button variant="ghost" size="icon" onClick={async () => { await supabase.from("livestock_sales").delete().eq("id", s.id); toast.success("Supprimé"); fetchAll(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
