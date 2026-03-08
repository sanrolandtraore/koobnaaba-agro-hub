import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, DollarSign, Users, TrendingUp, CheckCircle, Download, FileText, FileSpreadsheet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const productTypes = ["Céréale", "Légumineuse", "Oléagineux", "Tubercule", "Fruit", "Légume", "Coton", "Autre"];
const paymentStatuses = [
  { value: "en_attente", label: "En attente" },
  { value: "partiel", label: "Partiel" },
  { value: "paye", label: "Payé" },
];
const buyers = ["Marché local", "Grossiste", "Exportateur", "ONG", "Industrie", "État/SONAGESS", "Autre"];

type Sale = {
  id: string; sale_date: string; product_name: string; product_type: string;
  quantity_kg: number; unit_price: number; total_amount: number;
  buyer: string | null; payment_status: string; notes: string | null;
};
type Distribution = {
  id: string; sale_id: string; member_id: string; quantity_kg: number;
  member_share: number; paid: boolean; paid_date: string | null; notes: string | null;
  member_name?: string; sale_product?: string;
};
type Member = { id: string; full_name: string };

const CooperativeFinancePage = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saleOpen, setSaleOpen] = useState(false);
  const [distOpen, setDistOpen] = useState(false);
  const [saleForm, setSaleForm] = useState({ product_name: "", product_type: "Céréale", quantity_kg: "", unit_price: "", buyer: "Marché local", notes: "" });
  const [distForm, setDistForm] = useState({ sale_id: "", member_id: "", quantity_kg: "", notes: "" });

  const fetchAll = async () => {
    if (!user) return;
    const [sRes, dRes, mRes] = await Promise.all([
      supabase.from("cooperative_sales").select("*").order("sale_date", { ascending: false }),
      supabase.from("cooperative_distributions").select("*, cooperative_members(full_name), cooperative_sales(product_name)").order("created_at", { ascending: false }),
      supabase.from("cooperative_members").select("id, full_name").eq("status", "actif").order("full_name"),
    ]);
    setSales((sRes.data as any[]) || []);
    setDistributions(((dRes.data as any[]) || []).map((d: any) => ({
      ...d,
      member_name: d.cooperative_members?.full_name || "",
      sale_product: d.cooperative_sales?.product_name || "",
    })));
    setMembers((mRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(saleForm.quantity_kg);
    const price = parseFloat(saleForm.unit_price);
    if (!qty || !price) { toast.error("Quantité et prix requis"); return; }
    const { error } = await supabase.from("cooperative_sales").insert({
      cooperative_user_id: user!.id,
      product_name: saleForm.product_name,
      product_type: saleForm.product_type,
      quantity_kg: qty,
      unit_price: price,
      total_amount: qty * price,
      buyer: saleForm.buyer,
      notes: saleForm.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Vente enregistrée");
    setSaleOpen(false);
    setSaleForm({ product_name: "", product_type: "Céréale", quantity_kg: "", unit_price: "", buyer: "Marché local", notes: "" });
    fetchAll();
  };

  const handleDistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(distForm.quantity_kg);
    const sale = sales.find(s => s.id === distForm.sale_id);
    if (!sale || !qty) { toast.error("Vente et quantité requis"); return; }
    const memberShare = qty * sale.unit_price;
    const { error } = await supabase.from("cooperative_distributions").insert({
      cooperative_user_id: user!.id,
      sale_id: distForm.sale_id,
      member_id: distForm.member_id,
      quantity_kg: qty,
      member_share: memberShare,
      notes: distForm.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Répartition enregistrée");
    setDistOpen(false);
    setDistForm({ sale_id: "", member_id: "", quantity_kg: "", notes: "" });
    fetchAll();
  };

  const togglePaid = async (d: Distribution) => {
    await supabase.from("cooperative_distributions").update({
      paid: !d.paid,
      paid_date: !d.paid ? new Date().toISOString().slice(0, 10) : null,
    }).eq("id", d.id);
    fetchAll();
  };

  const deleteSale = async (id: string) => {
    await supabase.from("cooperative_sales").delete().eq("id", id);
    toast.success("Vente supprimée");
    fetchAll();
  };

  const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");
  const totalRevenue = sales.reduce((s, r) => s + Number(r.total_amount), 0);
  const totalDistributed = distributions.reduce((s, r) => s + Number(r.member_share), 0);
  const totalPaid = distributions.filter(d => d.paid).reduce((s, r) => s + Number(r.member_share), 0);
  const totalUnpaid = totalDistributed - totalPaid;

  // --- EXPORT ---
  const exportBilanCSV = () => {
    const header = "Vente,Date,Produit,Quantité (kg),Prix unit.,Total,Acheteur,Statut";
    const rows = sales.map(s => `"${s.product_name}","${s.sale_date}","${s.product_type}",${s.quantity_kg},${s.unit_price},${s.total_amount},"${s.buyer || ""}","${s.payment_status}"`);
    const distHeader = "\n\nRépartitions\nMembre,Vente,Quantité (kg),Part (FCFA),Payé,Date paiement";
    const distRows = distributions.map(d => `"${d.member_name}","${d.sale_product}",${d.quantity_kg},${d.member_share},${d.paid ? "Oui" : "Non"},"${d.paid_date || ""}"`);
    const csv = [header, ...rows, distHeader, ...distRows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bilan_cooperatif.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exporté");
  };

  const exportBilanPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16); doc.text("Koobnaaba — Bilan financier coopératif", 14, 18);
    doc.setFontSize(9); doc.text(`Généré le ${new Date().toLocaleDateString("fr")}`, 14, 25);
    doc.setFontSize(11);
    doc.text(`Revenu total : ${fmt(totalRevenue)} FCFA`, 14, 34);
    doc.text(`Distribué : ${fmt(totalDistributed)} FCFA | Payé : ${fmt(totalPaid)} FCFA | Impayé : ${fmt(totalUnpaid)} FCFA`, 14, 41);

    autoTable(doc, {
      startY: 48,
      head: [["Produit", "Date", "Type", "Qté (kg)", "Prix unit.", "Total", "Acheteur", "Statut"]],
      body: sales.map(s => [s.product_name, s.sale_date, s.product_type, s.quantity_kg, s.unit_price, fmt(s.total_amount), s.buyer || "", s.payment_status]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 120, 74] },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(12); doc.text("Répartitions par membre", 14, finalY + 12);
    autoTable(doc, {
      startY: finalY + 18,
      head: [["Membre", "Vente", "Qté (kg)", "Part (FCFA)", "Payé", "Date"]],
      body: distributions.map(d => [d.member_name, d.sale_product, d.quantity_kg, fmt(d.member_share), d.paid ? "Oui" : "Non", d.paid_date || ""]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 120, 74] },
    });

    doc.save("bilan_cooperatif.pdf");
    toast.success("PDF exporté");
  };

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">Finances coopérative</h1>
          <p className="text-muted-foreground mt-1">Ventes groupées, répartitions et bilan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportBilanCSV}><FileSpreadsheet className="h-4 w-4 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={exportBilanPDF}><FileText className="h-4 w-4 mr-1" />PDF</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Revenu total</CardTitle><DollarSign className="h-5 w-5 text-primary" /></CardHeader><CardContent><p className="text-2xl font-heading font-bold">{fmt(totalRevenue)} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Distribué</CardTitle><Users className="h-5 w-5 text-secondary" /></CardHeader><CardContent><p className="text-2xl font-heading font-bold">{fmt(totalDistributed)} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Payé</CardTitle><CheckCircle className="h-5 w-5 text-primary" /></CardHeader><CardContent><p className="text-2xl font-heading font-bold">{fmt(totalPaid)} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Impayé</CardTitle><TrendingUp className="h-5 w-5 text-destructive" /></CardHeader><CardContent><p className="text-2xl font-heading font-bold">{fmt(totalUnpaid)} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p></CardContent></Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Ventes groupées</TabsTrigger>
          <TabsTrigger value="distributions">Répartitions</TabsTrigger>
        </TabsList>

        {/* SALES TAB */}
        <TabsContent value="sales" className="space-y-4">
          <Dialog open={saleOpen} onOpenChange={setSaleOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouvelle vente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Enregistrer une vente groupée</DialogTitle></DialogHeader>
              <form onSubmit={handleSaleSubmit} className="space-y-3">
                <div><Label>Produit</Label><Input value={saleForm.product_name} onChange={e => setSaleForm(f => ({ ...f, product_name: e.target.value }))} required /></div>
                <div><Label>Type</Label>
                  <Select value={saleForm.product_type} onValueChange={v => setSaleForm(f => ({ ...f, product_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{productTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Quantité (kg)</Label><Input type="number" step="0.1" value={saleForm.quantity_kg} onChange={e => setSaleForm(f => ({ ...f, quantity_kg: e.target.value }))} required /></div>
                  <div><Label>Prix unitaire (FCFA)</Label><Input type="number" step="1" value={saleForm.unit_price} onChange={e => setSaleForm(f => ({ ...f, unit_price: e.target.value }))} required /></div>
                </div>
                <div><Label>Acheteur</Label>
                  <Select value={saleForm.buyer} onValueChange={v => setSaleForm(f => ({ ...f, buyer: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{buyers.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Notes</Label><Input value={saleForm.notes} onChange={e => setSaleForm(f => ({ ...f, notes: e.target.value }))} /></div>
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>

          {sales.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">Aucune vente enregistrée</CardContent></Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead><TableHead>Produit</TableHead><TableHead>Qté (kg)</TableHead>
                    <TableHead>Prix unit.</TableHead><TableHead>Total</TableHead><TableHead>Acheteur</TableHead>
                    <TableHead>Statut</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.sale_date}</TableCell>
                      <TableCell className="font-medium">{s.product_name}</TableCell>
                      <TableCell>{s.quantity_kg}</TableCell>
                      <TableCell>{s.unit_price}</TableCell>
                      <TableCell className="font-bold">{fmt(s.total_amount)}</TableCell>
                      <TableCell>{s.buyer}</TableCell>
                      <TableCell>
                        <Badge variant={s.payment_status === "paye" ? "default" : s.payment_status === "partiel" ? "secondary" : "outline"}>
                          {paymentStatuses.find(p => p.value === s.payment_status)?.label || s.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => deleteSale(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* DISTRIBUTIONS TAB */}
        <TabsContent value="distributions" className="space-y-4">
          <Dialog open={distOpen} onOpenChange={setDistOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouvelle répartition</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Répartir un revenu</DialogTitle></DialogHeader>
              <form onSubmit={handleDistSubmit} className="space-y-3">
                <div><Label>Vente</Label>
                  <Select value={distForm.sale_id} onValueChange={v => setDistForm(f => ({ ...f, sale_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Choisir une vente" /></SelectTrigger>
                    <SelectContent>{sales.map(s => <SelectItem key={s.id} value={s.id}>{s.product_name} — {s.sale_date} ({fmt(s.total_amount)} FCFA)</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Membre</Label>
                  <Select value={distForm.member_id} onValueChange={v => setDistForm(f => ({ ...f, member_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Choisir un membre" /></SelectTrigger>
                    <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Quantité contribuée (kg)</Label><Input type="number" step="0.1" value={distForm.quantity_kg} onChange={e => setDistForm(f => ({ ...f, quantity_kg: e.target.value }))} required /></div>
                <div><Label>Notes</Label><Input value={distForm.notes} onChange={e => setDistForm(f => ({ ...f, notes: e.target.value }))} /></div>
                {distForm.sale_id && distForm.quantity_kg && (
                  <p className="text-sm text-muted-foreground">Part calculée : <strong>{fmt(parseFloat(distForm.quantity_kg || "0") * (sales.find(s => s.id === distForm.sale_id)?.unit_price || 0))} FCFA</strong></p>
                )}
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>

          {distributions.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">Aucune répartition</CardContent></Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membre</TableHead><TableHead>Vente</TableHead><TableHead>Qté (kg)</TableHead>
                    <TableHead>Part (FCFA)</TableHead><TableHead>Statut</TableHead><TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributions.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.member_name}</TableCell>
                      <TableCell>{d.sale_product}</TableCell>
                      <TableCell>{d.quantity_kg}</TableCell>
                      <TableCell className="font-bold">{fmt(d.member_share)}</TableCell>
                      <TableCell>
                        <Badge variant={d.paid ? "default" : "outline"} className="cursor-pointer" onClick={() => togglePaid(d)}>
                          {d.paid ? "Payé" : "Impayé"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{d.paid_date || ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CooperativeFinancePage;
