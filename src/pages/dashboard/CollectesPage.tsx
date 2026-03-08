import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCooperativeRole } from "@/hooks/useCooperativeRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Package, Search } from "lucide-react";

const productTypes = [
  { value: "cereale", label: "Céréale" },
  { value: "legumineuse", label: "Légumineuse" },
  { value: "oleagineux", label: "Oléagineux" },
  { value: "tubercule", label: "Tubercule" },
  { value: "fruit", label: "Fruit" },
  { value: "legume", label: "Légume" },
  { value: "coton", label: "Coton" },
  { value: "autre", label: "Autre" },
];

const productNames: Record<string, string[]> = {
  cereale: ["Maïs", "Riz", "Sorgho", "Mil", "Fonio", "Blé"],
  legumineuse: ["Niébé", "Soja", "Arachide", "Haricot", "Pois de terre"],
  oleagineux: ["Sésame", "Tournesol", "Karité (amandes)"],
  tubercule: ["Igname", "Manioc", "Patate douce", "Pomme de terre"],
  fruit: ["Mangue", "Banane", "Papaye", "Anacarde", "Orange"],
  legume: ["Tomate", "Oignon", "Piment", "Gombo", "Aubergine"],
  coton: ["Coton graine"],
  autre: ["Autre produit"],
};

const qualityGrades = ["A", "B", "C"];
const seasons = ["2024/2025", "2025/2026", "2026/2027"];
const collecteStatuses = [
  { value: "collecte", label: "Collecté", variant: "default" as const },
  { value: "stocke", label: "Stocké", variant: "secondary" as const },
  { value: "vendu", label: "Vendu", variant: "outline" as const },
];

type Member = { id: string; full_name: string };
type Collecte = {
  id: string; member_id: string | null; product_type: string; product_name: string;
  quantity_kg: number; quality_grade: string | null; unit_price: number; total_amount: number;
  collecte_date: string; season: string | null; warehouse: string | null;
  status: string; buyer: string | null; notes: string | null;
  cooperative_members?: { full_name: string } | null;
};

const CollectesPage = () => {
  const { user } = useAuth();
  const { isCoopOwner, isCoopAdmin, cooperativeUserId } = useCooperativeRole();
  const canEdit = isCoopOwner || isCoopAdmin;
  const [collectes, setCollectes] = useState<Collecte[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    member_id: "", product_type: "cereale", product_name: "", quantity_kg: "",
    quality_grade: "A", unit_price: "", collecte_date: new Date().toISOString().split("T")[0],
    season: "2025/2026", warehouse: "", status: "collecte", buyer: "", notes: "",
  });

  const fetchData = async () => {
    if (!user) return;
    const [cRes, mRes] = await Promise.all([
      supabase.from("cooperative_collectes").select("*, cooperative_members(full_name)").order("collecte_date", { ascending: false }),
      supabase.from("cooperative_members").select("id, full_name").eq("status", "actif").order("full_name"),
    ]);
    setCollectes((cRes.data as Collecte[]) || []);
    setMembers((mRes.data as Member[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const effectiveId = cooperativeUserId || user.id;
    const price = parseFloat(form.unit_price) || 0;
    const { error } = await supabase.from("cooperative_collectes").insert({
      cooperative_user_id: user.id,
      member_id: form.member_id || null,
      product_type: form.product_type,
      product_name: form.product_name,
      quantity_kg: qty,
      quality_grade: form.quality_grade,
      unit_price: price,
      total_amount: qty * price,
      collecte_date: form.collecte_date,
      season: form.season || null,
      warehouse: form.warehouse || null,
      status: form.status,
      buyer: form.buyer || null,
      notes: form.notes || null,
    });
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Collecte enregistrée !");
    setOpen(false);
    setForm({ member_id: "", product_type: "cereale", product_name: "", quantity_kg: "", quality_grade: "A", unit_price: "", collecte_date: new Date().toISOString().split("T")[0], season: "2025/2026", warehouse: "", status: "collecte", buyer: "", notes: "" });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cooperative_collectes").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Collecte supprimée");
    fetchData();
  };

  const filtered = collectes.filter(c =>
    c.product_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.cooperative_members?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalKg = collectes.reduce((s, c) => s + Number(c.quantity_kg), 0);
  const totalValue = collectes.reduce((s, c) => s + Number(c.total_amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Collectes</h1>
          <p className="text-muted-foreground mt-1">Enregistrez et suivez les collectes de vos membres</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvelle collecte</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Enregistrer une collecte</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Membre</Label>
                <Select value={form.member_id} onValueChange={v => setForm(f => ({ ...f, member_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
                  <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Type de produit *</Label>
                <Select value={form.product_type} onValueChange={v => setForm(f => ({ ...f, product_type: v, product_name: "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{productTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Produit *</Label>
                <Select value={form.product_name} onValueChange={v => setForm(f => ({ ...f, product_name: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{(productNames[form.product_type] || []).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Quantité (kg) *</Label><Input type="number" required value={form.quantity_kg} onChange={e => setForm(f => ({ ...f, quantity_kg: e.target.value }))} /></div>
                <div><Label>Qualité</Label>
                  <Select value={form.quality_grade} onValueChange={v => setForm(f => ({ ...f, quality_grade: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{qualityGrades.map(g => <SelectItem key={g} value={g}>Grade {g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Prix unitaire (FCFA/kg)</Label><Input type="number" value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: e.target.value }))} /></div>
                <div><Label>Saison</Label>
                  <Select value={form.season} onValueChange={v => setForm(f => ({ ...f, season: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Date de collecte</Label><Input type="date" value={form.collecte_date} onChange={e => setForm(f => ({ ...f, collecte_date: e.target.value }))} /></div>
              <div><Label>Entrepôt</Label><Input value={form.warehouse} onChange={e => setForm(f => ({ ...f, warehouse: e.target.value }))} placeholder="Ex: Magasin central" /></div>
              <div><Label>Statut</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{collecteStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.status === "vendu" && <div><Label>Acheteur</Label><Input value={form.buyer} onChange={e => setForm(f => ({ ...f, buyer: e.target.value }))} /></div>}
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total collectes</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{collectes.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Quantité totale</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{Math.round(totalKg).toLocaleString()} kg</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Valeur totale</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{Math.round(totalValue).toLocaleString()} FCFA</p></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher par produit ou membre..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Chargement...</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center py-12"><Package className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucune collecte enregistrée</p></CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Membre</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix/kg</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{new Date(c.collecte_date).toLocaleDateString("fr")}</TableCell>
                  <TableCell>{c.cooperative_members?.full_name || "—"}</TableCell>
                  <TableCell className="font-medium">{c.product_name}</TableCell>
                  <TableCell>{Number(c.quantity_kg).toLocaleString()} kg</TableCell>
                  <TableCell>{Number(c.unit_price).toLocaleString()} FCFA</TableCell>
                  <TableCell className="font-medium">{Number(c.total_amount).toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Badge variant={collecteStatuses.find(s => s.value === c.status)?.variant || "default"}>
                      {collecteStatuses.find(s => s.value === c.status)?.label || c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default CollectesPage;
