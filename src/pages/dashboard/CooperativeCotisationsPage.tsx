import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, DollarSign, Users, TrendingUp, Search, Wallet } from "lucide-react";

const periods = [
  { value: "mensuel", label: "Mensuel" },
  { value: "trimestriel", label: "Trimestriel" },
  { value: "annuel", label: "Annuel" },
  { value: "ponctuel", label: "Ponctuel" },
];

type Member = { id: string; full_name: string };
type Cotisation = {
  id: string; member_id: string; amount: number; cotisation_date: string;
  period: string; status: string; notes: string | null; member_name?: string;
};
type Expense = {
  id: string; description: string; amount: number; category: string;
  expense_date: string; approved_by: string | null; notes: string | null;
};

const expenseCategories = [
  { value: "fonctionnement", label: "Fonctionnement" },
  { value: "investissement", label: "Investissement" },
  { value: "intrants", label: "Intrants" },
  { value: "transport", label: "Transport" },
  { value: "formation", label: "Formation" },
  { value: "autre", label: "Autre" },
];

const CooperativeCotisationsPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [cotOpen, setCotOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cotForm, setCotForm] = useState({ member_id: "", amount: "", period: "mensuel", cotisation_date: new Date().toISOString().split("T")[0], notes: "" });
  const [expForm, setExpForm] = useState({ description: "", amount: "", category: "fonctionnement", expense_date: new Date().toISOString().split("T")[0], approved_by: "", notes: "" });

  const fetchAll = async () => {
    if (!user) return;
    const [mRes, cRes, eRes] = await Promise.all([
      supabase.from("cooperative_members").select("id, full_name").eq("status", "actif").order("full_name"),
      supabase.from("cooperative_cotisations").select("*, cooperative_members(full_name)").order("cotisation_date", { ascending: false }),
      supabase.from("cooperative_expenses").select("*").order("expense_date", { ascending: false }),
    ]);
    setMembers((mRes.data as any[]) || []);
    setCotisations(((cRes.data as any[]) || []).map((c: any) => ({
      ...c, member_name: c.cooperative_members?.full_name || "—",
    })));
    setExpenses((eRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const handleCotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cotForm.amount);
    if (!amount || !cotForm.member_id) { toast.error("Membre et montant requis"); return; }
    const { error } = await supabase.from("cooperative_cotisations").insert({
      cooperative_user_id: user!.id, member_id: cotForm.member_id,
      amount, period: cotForm.period, cotisation_date: cotForm.cotisation_date,
      notes: cotForm.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Cotisation enregistrée");
    setCotOpen(false);
    setCotForm({ member_id: "", amount: "", period: "mensuel", cotisation_date: new Date().toISOString().split("T")[0], notes: "" });
    fetchAll();
  };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expForm.amount);
    if (!amount || !expForm.description) { toast.error("Description et montant requis"); return; }
    const { error } = await supabase.from("cooperative_expenses").insert({
      cooperative_user_id: user!.id, description: expForm.description,
      amount, category: expForm.category, expense_date: expForm.expense_date,
      approved_by: expForm.approved_by || null, notes: expForm.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Dépense enregistrée");
    setExpOpen(false);
    setExpForm({ description: "", amount: "", category: "fonctionnement", expense_date: new Date().toISOString().split("T")[0], approved_by: "", notes: "" });
    fetchAll();
  };

  const deleteCot = async (id: string) => {
    await supabase.from("cooperative_cotisations").delete().eq("id", id);
    toast.success("Cotisation supprimée"); fetchAll();
  };
  const deleteExp = async (id: string) => {
    await supabase.from("cooperative_expenses").delete().eq("id", id);
    toast.success("Dépense supprimée"); fetchAll();
  };

  const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");
  const totalCotisations = cotisations.reduce((s, c) => s + Number(c.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const fondsCommun = totalCotisations - totalExpenses;

  const filtered = cotisations.filter(c =>
    (c.member_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="space-y-4"><div className="h-8 w-64 bg-muted animate-pulse rounded" /><div className="grid gap-4 md:grid-cols-3">{[1,2,3].map(i=><div key={i} className="h-28 bg-muted animate-pulse rounded" />)}</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" /> Cotisations & Fonds commun
        </h1>
        <p className="text-muted-foreground mt-1">Gestion financière de la coopérative</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Total cotisations</CardTitle><DollarSign className="h-5 w-5 text-primary" /></CardHeader><CardContent><p className="text-2xl font-heading font-bold">{fmt(totalCotisations)} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Dépenses</CardTitle><TrendingUp className="h-5 w-5 text-destructive" /></CardHeader><CardContent><p className="text-2xl font-heading font-bold">{fmt(totalExpenses)} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p></CardContent></Card>
        <Card className="border-primary/30 bg-primary/5"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm text-muted-foreground">Fonds commun</CardTitle><Wallet className="h-5 w-5 text-primary" /></CardHeader><CardContent><p className="text-2xl font-heading font-bold">{fmt(fondsCommun)} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p></CardContent></Card>
      </div>

      {/* Cotisations section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Cotisations membres</CardTitle>
          <Dialog open={cotOpen} onOpenChange={setCotOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Cotisation</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Enregistrer une cotisation</DialogTitle></DialogHeader>
              <form onSubmit={handleCotSubmit} className="space-y-3">
                <div><Label>Membre *</Label>
                  <Select value={cotForm.member_id} onValueChange={v => setCotForm(f => ({ ...f, member_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Montant (FCFA) *</Label><Input type="number" value={cotForm.amount} onChange={e => setCotForm(f => ({ ...f, amount: e.target.value }))} required /></div>
                  <div><Label>Période</Label>
                    <Select value={cotForm.period} onValueChange={v => setCotForm(f => ({ ...f, period: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{periods.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Date</Label><Input type="date" value={cotForm.cotisation_date} onChange={e => setCotForm(f => ({ ...f, cotisation_date: e.target.value }))} /></div>
                <div><Label>Notes</Label><Input value={cotForm.notes} onChange={e => setCotForm(f => ({ ...f, notes: e.target.value }))} /></div>
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-3 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune cotisation enregistrée</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Membre</TableHead><TableHead>Montant</TableHead><TableHead>Période</TableHead><TableHead>Statut</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.cotisation_date}</TableCell>
                    <TableCell className="font-medium">{c.member_name}</TableCell>
                    <TableCell className="font-bold">{fmt(c.amount)} FCFA</TableCell>
                    <TableCell>{periods.find(p => p.value === c.period)?.label}</TableCell>
                    <TableCell><Badge variant={c.status === "paye" ? "default" : "secondary"}>{c.status === "paye" ? "Payé" : c.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => deleteCot(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Expenses section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dépenses coopérative</CardTitle>
          <Dialog open={expOpen} onOpenChange={setExpOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Dépense</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Enregistrer une dépense</DialogTitle></DialogHeader>
              <form onSubmit={handleExpSubmit} className="space-y-3">
                <div><Label>Description *</Label><Input value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Montant (FCFA) *</Label><Input type="number" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} required /></div>
                  <div><Label>Catégorie</Label>
                    <Select value={expForm.category} onValueChange={v => setExpForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{expenseCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Date</Label><Input type="date" value={expForm.expense_date} onChange={e => setExpForm(f => ({ ...f, expense_date: e.target.value }))} /></div>
                <div><Label>Approuvé par</Label><Input value={expForm.approved_by} onChange={e => setExpForm(f => ({ ...f, approved_by: e.target.value }))} /></div>
                <div><Label>Notes</Label><Input value={expForm.notes} onChange={e => setExpForm(f => ({ ...f, notes: e.target.value }))} /></div>
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune dépense enregistrée</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Catégorie</TableHead><TableHead>Montant</TableHead><TableHead>Approuvé par</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {expenses.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{e.expense_date}</TableCell>
                    <TableCell className="font-medium">{e.description}</TableCell>
                    <TableCell><Badge variant="outline">{expenseCategories.find(c => c.value === e.category)?.label}</Badge></TableCell>
                    <TableCell className="font-bold">{fmt(e.amount)} FCFA</TableCell>
                    <TableCell>{e.approved_by || "—"}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => deleteExp(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CooperativeCotisationsPage;
