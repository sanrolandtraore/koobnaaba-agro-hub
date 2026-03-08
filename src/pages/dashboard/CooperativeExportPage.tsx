import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ExportType = "members" | "collectes" | "sales" | "distributions";

const exportOptions: { value: ExportType; label: string }[] = [
  { value: "members", label: "Registre des membres" },
  { value: "collectes", label: "Collectes / Achats" },
  { value: "sales", label: "Ventes groupées" },
  { value: "distributions", label: "Répartitions par membre" },
];

const CooperativeExportPage = () => {
  const { user } = useAuth();
  const [exportType, setExportType] = useState<ExportType>("members");
  const [loading, setLoading] = useState(false);

  const fetchData = async (type: ExportType) => {
    if (type === "members") {
      const { data } = await supabase.from("cooperative_members").select("*").order("full_name");
      return { rows: data || [], columns: ["full_name", "phone", "location", "member_type", "crop_type", "livestock_type", "area_ha", "status", "joined_date"], title: "Registre des membres" };
    }
    if (type === "collectes") {
      const { data } = await supabase.from("cooperative_collectes").select("*, cooperative_members(full_name)").order("collecte_date", { ascending: false });
      const rows = (data || []).map((r: any) => ({ ...r, membre: r.cooperative_members?.full_name || "" }));
      return { rows, columns: ["collecte_date", "membre", "product_name", "quantity_kg", "quality_grade", "unit_price", "total_amount", "status", "warehouse", "buyer"], title: "Collectes" };
    }
    if (type === "sales") {
      const { data } = await supabase.from("cooperative_sales").select("*").order("sale_date", { ascending: false });
      return { rows: data || [], columns: ["sale_date", "product_name", "product_type", "quantity_kg", "unit_price", "total_amount", "buyer", "payment_status"], title: "Ventes groupées" };
    }
    // distributions
    const { data } = await supabase.from("cooperative_distributions").select("*, cooperative_members(full_name), cooperative_sales(product_name)").order("created_at", { ascending: false });
    const rows = (data || []).map((r: any) => ({ ...r, membre: r.cooperative_members?.full_name || "", vente: r.cooperative_sales?.product_name || "", payé: r.paid ? "Oui" : "Non" }));
    return { rows, columns: ["membre", "vente", "quantity_kg", "member_share", "payé", "paid_date"], title: "Répartitions" };
  };

  const exportCSV = async () => {
    setLoading(true);
    try {
      const { rows, columns, title } = await fetchData(exportType);
      if (!rows.length) { toast.error("Aucune donnée"); return; }
      const header = columns.join(",");
      const csv = [header, ...rows.map((r: any) => columns.map(c => `"${r[c] ?? ""}"`).join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${title}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exporté !");
    } finally { setLoading(false); }
  };

  const exportPDF = async () => {
    setLoading(true);
    try {
      const { rows, columns, title } = await fetchData(exportType);
      if (!rows.length) { toast.error("Aucune donnée"); return; }
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(16); doc.text(`Koobnaaba — ${title}`, 14, 18);
      doc.setFontSize(9); doc.text(`Généré le ${new Date().toLocaleDateString("fr")}`, 14, 25);
      autoTable(doc, {
        startY: 30,
        head: [columns],
        body: rows.map((r: any) => columns.map(c => r[c] ?? "")),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 120, 74] },
      });
      doc.save(`${title}.pdf`);
      toast.success("PDF exporté !");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Export coopérative</h1>
        <p className="text-muted-foreground mt-1">Exportez vos données en PDF ou CSV</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Choisir les données à exporter</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Type de données</Label>
            <Select value={exportType} onValueChange={v => setExportType(v as ExportType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{exportOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportCSV} disabled={loading} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />Exporter CSV
            </Button>
            <Button onClick={exportPDF} disabled={loading}>
              <FileText className="h-4 w-4 mr-2" />Exporter PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CooperativeExportPage;
