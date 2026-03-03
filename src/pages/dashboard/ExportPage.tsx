import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ExportType = "cycles" | "costs" | "activities" | "harvests" | "investment" | "workers" | "equipment";

const exportOptions: { value: ExportType; label: string }[] = [
  { value: "cycles", label: "Cycles culturaux" },
  { value: "costs", label: "Coûts" },
  { value: "activities", label: "Activités" },
  { value: "harvests", label: "Récoltes & Lots" },
  { value: "investment", label: "Plans d'investissement" },
  { value: "workers", label: "Main d'œuvre" },
  { value: "equipment", label: "Équipements" },
];

const ExportPage = () => {
  const [selected, setSelected] = useState<ExportType>("cycles");
  const [loading, setLoading] = useState(false);

  const fetchData = async (type: ExportType) => {
    switch (type) {
      case "cycles": return supabase.from("crop_cycles").select("season, status, start_date, end_date, expected_yield_kg, expected_revenue, actual_yield_kg, actual_revenue, plant_count, parcels(name, area_ha), crop_references(name)").order("created_at", { ascending: false });
      case "costs": return supabase.from("cost_entries").select("date, category, description, amount, crop_cycles(season, parcels(name))").order("date", { ascending: false });
      case "activities": return supabase.from("activity_logs").select("date, activity_type, description, quantity, unit, cost, crop_cycles(season, parcels(name))").order("date", { ascending: false });
      case "harvests": return supabase.from("harvests").select("date, lot_number, quantity_kg, quality_grade, unit_price_kg, buyer, sold, crop_cycles(season, crop_references(name))").order("date", { ascending: false });
      case "investment": return supabase.from("investment_plans").select("total_input_cost, total_labor_cost, total_equipment_cost, total_transport_cost, total_investment, expected_revenue, expected_roi_percent, break_even_yield_kg, crop_cycles(season, parcels(name), crop_references(name))").order("created_at", { ascending: false });
      case "workers": return supabase.from("workers").select("full_name, role, phone, daily_rate, status, farms(name)").order("full_name");
      case "equipment": return supabase.from("equipment").select("name, type, status, purchase_date, purchase_cost, farms(name)").order("name");
    }
  };

  const flattenRow = (row: any): Record<string, any> => {
    const flat: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        for (const [k2, v2] of Object.entries(v as Record<string, any>)) {
          flat[`${k}_${k2}`] = v2;
        }
      } else {
        flat[k] = v;
      }
    }
    return flat;
  };

  const exportCSV = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchData(selected);
      if (error) throw error;
      if (!data || data.length === 0) { toast.error("Aucune donnée à exporter"); return; }
      const rows = data.map(flattenRow);
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(";"), ...rows.map(r => headers.map(h => `"${r[h] ?? ""}"`).join(";"))].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `koobnaaba_${selected}_${new Date().toISOString().split("T")[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success("CSV exporté !");
    } catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  const exportPDF = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchData(selected);
      if (error) throw error;
      if (!data || data.length === 0) { toast.error("Aucune donnée à exporter"); return; }
      const rows = data.map(flattenRow);
      const headers = Object.keys(rows[0]);

      const doc = new jsPDF({ orientation: headers.length > 6 ? "landscape" : "portrait" });
      doc.setFontSize(18);
      doc.text("Koobnaaba — Rapport", 14, 20);
      doc.setFontSize(12);
      doc.text(`${exportOptions.find(o => o.value === selected)?.label || selected}`, 14, 28);
      doc.setFontSize(9);
      doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`, 14, 34);

      autoTable(doc, {
        startY: 40,
        head: [headers],
        body: rows.map(r => headers.map(h => String(r[h] ?? ""))),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [139, 90, 43] },
      });

      doc.save(`koobnaaba_${selected}_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF exporté !");
    } catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Export de données</h1>
        <p className="text-muted-foreground mt-1">Téléchargez vos rapports en PDF ou CSV</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Sélection du rapport</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Type de données</Label>
            <Select value={selected} onValueChange={(v) => setSelected(v as ExportType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{exportOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportPDF} disabled={loading} className="flex-1 gradient-primary text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" />{loading ? "Export..." : "Exporter PDF"}
            </Button>
            <Button onClick={exportCSV} disabled={loading} variant="outline" className="flex-1">
              <FileSpreadsheet className="h-4 w-4 mr-2" />{loading ? "Export..." : "Exporter CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Dossier de financement</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Générez un dossier complet pour présentation bancaire incluant plans d'investissement, projections et historique.</p>
          <Button
            onClick={async () => {
              setLoading(true);
              try {
                const [cyclesRes, plansRes, costsRes, harvestsRes] = await Promise.all([
                  supabase.from("crop_cycles").select("season, status, start_date, expected_yield_kg, expected_revenue, plant_count, parcels(name, area_ha, farms(name)), crop_references(name)"),
                  supabase.from("investment_plans").select("*, crop_cycles(season, parcels(name), crop_references(name))"),
                  supabase.from("cost_entries").select("date, category, description, amount"),
                  supabase.from("harvests").select("date, lot_number, quantity_kg, quality_grade, unit_price_kg, sold"),
                ]);

                const doc = new jsPDF();
                doc.setFontSize(20);
                doc.text("DOSSIER DE FINANCEMENT", 14, 20);
                doc.setFontSize(10);
                doc.text("Koobnaaba — Plateforme de Gestion Agricole", 14, 28);
                doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 14, 34);

                let y = 45;
                doc.setFontSize(14);
                doc.text("1. Exploitations & Cycles culturaux", 14, y);
                const cycleRows = (cyclesRes.data || []).map(c => [
                  c.parcels?.farms?.name || "", c.parcels?.name || "", c.crop_references?.name || "",
                  c.season, String(c.parcels?.area_ha || ""), String(Math.round(c.expected_yield_kg || 0)),
                  String(Math.round(c.expected_revenue || 0)),
                ]);
                autoTable(doc, { startY: y + 5, head: [["Exploitation", "Parcelle", "Culture", "Saison", "Surface ha", "Rend. kg", "Revenu FCFA"]], body: cycleRows, styles: { fontSize: 7 }, headStyles: { fillColor: [139, 90, 43] } });

                y = (doc as any).lastAutoTable.finalY + 10;
                doc.setFontSize(14);
                doc.text("2. Plans d'investissement", 14, y);
                const planRows = (plansRes.data || []).map(p => [
                  `${p.crop_cycles?.crop_references?.name} · ${p.crop_cycles?.season}`,
                  String(Math.round(p.total_investment)), String(Math.round(p.expected_revenue)),
                  `${p.expected_roi_percent}%`, String(Math.round(p.break_even_yield_kg || 0)),
                ]);
                autoTable(doc, { startY: y + 5, head: [["Cycle", "Investissement", "Revenu projeté", "ROI", "Seuil kg"]], body: planRows, styles: { fontSize: 7 }, headStyles: { fillColor: [139, 90, 43] } });

                y = (doc as any).lastAutoTable.finalY + 10;
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFontSize(14);
                doc.text("3. Historique des coûts", 14, y);
                const totalCosts = (costsRes.data || []).reduce((s: number, c: any) => s + Number(c.amount), 0);
                doc.setFontSize(10);
                doc.text(`Total des coûts: ${Math.round(totalCosts).toLocaleString()} FCFA`, 14, y + 8);

                y = y + 15;
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFontSize(14);
                doc.text("4. Production & Ventes", 14, y);
                const totalHarvest = (harvestsRes.data || []).reduce((s: number, h: any) => s + Number(h.quantity_kg), 0);
                const totalSales = (harvestsRes.data || []).filter((h: any) => h.sold).reduce((s: number, h: any) => s + Number(h.quantity_kg) * Number(h.unit_price_kg || 0), 0);
                doc.setFontSize(10);
                doc.text(`Total récolté: ${Math.round(totalHarvest).toLocaleString()} kg`, 14, y + 8);
                doc.text(`Revenu ventes: ${Math.round(totalSales).toLocaleString()} FCFA`, 14, y + 14);

                doc.save(`koobnaaba_dossier_financement_${new Date().toISOString().split("T")[0]}.pdf`);
                toast.success("Dossier de financement généré !");
              } catch (err: any) { toast.error(err.message); }
              setLoading(false);
            }}
            disabled={loading}
            className="gradient-primary text-primary-foreground"
          >
            <FileText className="h-4 w-4 mr-2" />{loading ? "Génération..." : "Générer le dossier de financement (PDF)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportPage;
