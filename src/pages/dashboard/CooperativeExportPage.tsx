import { useState } from "react";
import PremiumGate from "@/components/PremiumGate";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, Loader2 } from "lucide-react";
import ExportPreviewTable from "@/components/ExportPreviewTable";

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
  const [previewRows, setPreviewRows] = useState<Record<string, any>[] | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);

  const loadPreview = async () => {
    setLoading(true);
    try {
      let rows: any[] = [];
      let columns: string[] = [];
      let title = "";

      if (exportType === "members") {
        const { data } = await supabase.from("cooperative_members").select("*").order("full_name");
        rows = data || [];
        columns = ["full_name", "phone", "location", "member_type", "crop_type", "livestock_type", "area_ha", "status", "joined_date"];
        title = "Registre des membres";
      } else if (exportType === "collectes") {
        const { data } = await supabase.from("cooperative_collectes").select("*, cooperative_members(full_name)").order("collecte_date", { ascending: false });
        rows = (data || []).map((r: any) => ({ ...r, membre: r.cooperative_members?.full_name || "" }));
        columns = ["collecte_date", "membre", "product_name", "quantity_kg", "quality_grade", "unit_price", "total_amount", "status", "warehouse", "buyer"];
        title = "Collectes";
      } else if (exportType === "sales") {
        const { data } = await supabase.from("cooperative_sales").select("*").order("sale_date", { ascending: false });
        rows = data || [];
        columns = ["sale_date", "product_name", "product_type", "quantity_kg", "unit_price", "total_amount", "buyer", "payment_status"];
        title = "Ventes groupées";
      } else {
        const { data } = await supabase.from("cooperative_distributions").select("*, cooperative_members(full_name), cooperative_sales(product_name)").order("created_at", { ascending: false });
        rows = (data || []).map((r: any) => ({ ...r, membre: r.cooperative_members?.full_name || "", vente: r.cooperative_sales?.product_name || "", payé: r.paid ? "Oui" : "Non" }));
        columns = ["membre", "vente", "quantity_kg", "member_share", "payé", "paid_date"];
        title = "Répartitions";
      }

      if (!rows.length) { toast.error("Aucune donnée"); setPreviewRows(null); return; }

      // Project only selected columns
      const projected = rows.map(r => {
        const obj: Record<string, any> = {};
        columns.forEach(c => { obj[c] = r[c] ?? ""; });
        return obj;
      });

      setPreviewHeaders(columns);
      setPreviewRows(projected);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <PremiumGate feature="export">
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Export coopérative</h1>
        <p className="text-muted-foreground mt-1">Prévisualisez et modifiez vos données avant export</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Choisir les données à exporter</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Type de données</Label>
            <Select value={exportType} onValueChange={v => { setExportType(v as ExportType); setPreviewRows(null); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{exportOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={loadPreview} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
            {loading ? "Chargement..." : "Charger l'aperçu"}
          </Button>
        </CardContent>
      </Card>

      {previewRows && (
        <ExportPreviewTable
          rows={previewRows}
          headers={previewHeaders}
          title={exportOptions.find(o => o.value === exportType)?.label || exportType}
          filePrefix={`koobnaaba_coop_${exportType}`}
          headerColor={[34, 120, 74]}
          onRowsChange={setPreviewRows}
        />
      )}
    </div>
  );
};

export default CooperativeExportPage;
