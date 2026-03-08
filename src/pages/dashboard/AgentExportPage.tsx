import { useState } from "react";
import PremiumGate from "@/components/PremiumGate";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, Loader2 } from "lucide-react";
import ExportPreviewTable from "@/components/ExportPreviewTable";

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
  const [previewRows, setPreviewRows] = useState<Record<string, any>[] | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("created_at, service_type, status, description, location, phone, preferred_date, expert_notes, estimated_cost")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data?.length) { toast.error("Aucune donnée"); setPreviewRows(null); return; }
      const rows = data.map(flattenRow);
      setPreviewHeaders(Object.keys(rows[0]));
      setPreviewRows(rows);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <PremiumGate feature="export">
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Export — Expert Agronome</h1>
        <p className="text-muted-foreground mt-1">Prévisualisez et modifiez vos rapports avant export</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Rapport des demandes reçues</CardTitle></CardHeader>
        <CardContent>
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
          title="Demandes d'expertise"
          filePrefix="koobnaaba_demandes_expertise"
          headerColor={[41, 98, 155]}
          onRowsChange={setPreviewRows}
        />
      )}
    </div>
  );
};

export default AgentExportPage;
