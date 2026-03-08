import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const flattenRow = (row: any): Record<string, any> => {
  const flat: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const [k2, v2] of Object.entries(v as Record<string, any>)) flat[`${k}_${k2}`] = v2;
    } else flat[k] = v;
  }
  return flat;
};

const AgentExportPage = () => {
  const [loading, setLoading] = useState(false);

  const doExport = async (format: "csv" | "pdf") => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("created_at, service_type, status, description, location, phone, preferred_date, expert_notes, estimated_cost")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data?.length) { toast.error("Aucune donnée"); return; }
      const rows = data.map(flattenRow);
      const headers = Object.keys(rows[0]);

      if (format === "csv") {
        const csv = [headers.join(";"), ...rows.map(r => headers.map(h => `"${r[h] ?? ""}"`).join(";"))].join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `koobnaaba_demandes_expertise.csv`; a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exporté !");
      } else {
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16); doc.text("KoobNaaba — Demandes d'expertise", 14, 18);
        doc.setFontSize(9); doc.text(`Généré le ${new Date().toLocaleDateString("fr")}`, 14, 25);
        autoTable(doc, { startY: 30, head: [headers], body: rows.map(r => headers.map(h => String(r[h] ?? ""))), styles: { fontSize: 7 }, headStyles: { fillColor: [41, 98, 155] } });
        doc.save(`koobnaaba_demandes_expertise.pdf`);
        toast.success("PDF exporté !");
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Export — Expert Agronome</h1>
        <p className="text-muted-foreground mt-1">Exportez vos rapports de demandes d'expertise</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Rapport des demandes reçues</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => doExport("pdf")} disabled={loading} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />{loading ? "Export..." : "Exporter PDF"}
          </Button>
          <Button onClick={() => doExport("csv")} disabled={loading} variant="outline" className="flex-1">
            <FileSpreadsheet className="h-4 w-4 mr-2" />{loading ? "Export..." : "Exporter CSV"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentExportPage;
