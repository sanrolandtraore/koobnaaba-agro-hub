import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calculator, Wheat, Sprout, FlaskConical, Users, DollarSign, TrendingUp, Download, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Labour coefficients per ha (person-days)
const labourCoefficients: Record<string, { labour_per_ha: number; daily_rate: number; phases: { name: string; days_per_ha: number }[] }> = {
  "Maïs": {
    labour_per_ha: 85, daily_rate: 2000,
    phases: [
      { name: "Défrichage/Labour", days_per_ha: 15 },
      { name: "Semis", days_per_ha: 8 },
      { name: "Sarclage (×2)", days_per_ha: 20 },
      { name: "Épandage engrais (×2)", days_per_ha: 8 },
      { name: "Traitement phyto", days_per_ha: 4 },
      { name: "Récolte", days_per_ha: 20 },
      { name: "Battage/Séchage", days_per_ha: 10 },
    ],
  },
  "Sorgho": {
    labour_per_ha: 75, daily_rate: 2000,
    phases: [
      { name: "Défrichage/Labour", days_per_ha: 15 },
      { name: "Semis", days_per_ha: 6 },
      { name: "Sarclage (×2)", days_per_ha: 18 },
      { name: "Épandage engrais", days_per_ha: 6 },
      { name: "Récolte", days_per_ha: 18 },
      { name: "Battage/Séchage", days_per_ha: 12 },
    ],
  },
  "Riz": {
    labour_per_ha: 120, daily_rate: 2500,
    phases: [
      { name: "Préparation pépinière", days_per_ha: 10 },
      { name: "Labour/Planage", days_per_ha: 20 },
      { name: "Repiquage", days_per_ha: 25 },
      { name: "Désherbage (×2)", days_per_ha: 20 },
      { name: "Épandage engrais (×3)", days_per_ha: 12 },
      { name: "Traitement phyto", days_per_ha: 5 },
      { name: "Récolte", days_per_ha: 18 },
      { name: "Battage/Vannage", days_per_ha: 10 },
    ],
  },
  "Coton": {
    labour_per_ha: 110, daily_rate: 2000,
    phases: [
      { name: "Labour", days_per_ha: 15 },
      { name: "Semis", days_per_ha: 8 },
      { name: "Sarclage (×3)", days_per_ha: 25 },
      { name: "Épandage engrais (×2)", days_per_ha: 10 },
      { name: "Traitement phyto (×6)", days_per_ha: 18 },
      { name: "Récolte (×3)", days_per_ha: 30 },
      { name: "Conditionnement", days_per_ha: 4 },
    ],
  },
};

// Default for crops not in the map
const defaultLabour = {
  labour_per_ha: 70, daily_rate: 2000,
  phases: [
    { name: "Défrichage/Labour", days_per_ha: 15 },
    { name: "Semis", days_per_ha: 8 },
    { name: "Sarclage (×2)", days_per_ha: 16 },
    { name: "Épandage engrais", days_per_ha: 6 },
    { name: "Traitement", days_per_ha: 5 },
    { name: "Récolte", days_per_ha: 15 },
    { name: "Post-récolte", days_per_ha: 5 },
  ],
};

const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");

const CropPlanningPage = () => {
  const [parcels, setParcels] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedParcel, setSelectedParcel] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [manualArea, setManualArea] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("parcels").select("id, name, area_ha, calculated_area_ha, soil_type, irrigation_type, farms(name)"),
      supabase.from("crop_references").select("*"),
    ]).then(([pRes, cRes]) => {
      setParcels(pRes.data || []);
      setCrops(cRes.data || []);
      setLoading(false);
    });
  }, []);

  const parcel = parcels.find(p => p.id === selectedParcel);
  const crop = crops.find(c => c.id === selectedCrop);
  const area = manualArea ? parseFloat(manualArea) : (parcel?.calculated_area_ha || parcel?.area_ha || 0);

  // Compute inputs
  const inputReqs = crop?.input_requirements || {};
  const inputs = Object.entries(inputReqs).map(([name, v]: [string, any]) => {
    const qtyPerHa = v.qty_per_ha || v.quantity_per_ha || 0;
    const totalQty = Math.round(qtyPerHa * area * 100) / 100;
    const unitPrice = v.unit_price || 0;
    const totalCost = Math.round(totalQty * unitPrice);
    return { name, qtyPerHa, unit: v.unit || "kg", totalQty, unitPrice, totalCost };
  });
  const totalInputCost = inputs.reduce((s, i) => s + i.totalCost, 0);

  // Labour
  const labourData = crop ? (labourCoefficients[crop.name] || defaultLabour) : defaultLabour;
  const phases = labourData.phases.map(p => ({
    ...p,
    totalDays: Math.round(p.days_per_ha * area * 10) / 10,
    cost: Math.round(p.days_per_ha * area * labourData.daily_rate),
  }));
  const totalLabourDays = phases.reduce((s, p) => s + p.totalDays, 0);
  const totalLabourCost = phases.reduce((s, p) => s + p.cost, 0);

  // Yield & revenue
  const expectedYield = crop ? Math.round((crop.avg_yield_per_ha || 0) * area) : 0;
  const expectedRevenue = crop ? Math.round(expectedYield * (crop.avg_price_per_kg || 0)) : 0;
  const plantCount = crop?.plants_per_ha ? Math.round(crop.plants_per_ha * area) : 0;

  // Totals
  const totalBudget = totalInputCost + totalLabourCost;
  const profit = expectedRevenue - totalBudget;
  const roi = totalBudget > 0 ? Math.round(((expectedRevenue - totalBudget) / totalBudget) * 100) : 0;
  const breakEvenKg = crop?.avg_price_per_kg ? Math.round(totalBudget / crop.avg_price_per_kg) : 0;

  const hasResult = area > 0 && crop;

  // Export PDF
  const exportPDF = () => {
    if (!hasResult) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Koobnaaba — Plan de production`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Culture: ${crop.name}${crop.variety ? ` (${crop.variety})` : ""} | Parcelle: ${parcel?.name || "Manuel"} | Superficie: ${area} ha`, 14, 26);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr")}`, 14, 32);

    // KPIs
    doc.setFontSize(11);
    doc.text(`Rendement estimé: ${fmt(expectedYield)} kg`, 14, 42);
    doc.text(`Revenu estimé: ${fmt(expectedRevenue)} FCFA`, 14, 48);
    doc.text(`Budget total: ${fmt(totalBudget)} FCFA`, 14, 54);
    doc.text(`Profit potentiel: ${fmt(profit)} FCFA (ROI: ${roi}%)`, 14, 60);
    doc.text(`Seuil rentabilité: ${fmt(breakEvenKg)} kg`, 14, 66);
    if (plantCount) doc.text(`Nombre de plants: ${fmt(plantCount)}`, 14, 72);

    // Inputs table
    autoTable(doc, {
      startY: 80,
      head: [["Intrant", "Dose/ha", "Unité", "Total", "Prix unit.", "Coût total (FCFA)"]],
      body: inputs.map(i => [i.name, i.qtyPerHa, i.unit, i.totalQty, fmt(i.unitPrice), fmt(i.totalCost)]),
      foot: [["", "", "", "", "TOTAL INTRANTS", fmt(totalInputCost)]],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 120, 74] },
    });

    const y1 = (doc as any).lastAutoTable?.finalY || 140;
    // Labour table
    autoTable(doc, {
      startY: y1 + 8,
      head: [["Phase", "Jours/ha", "Total jours", "Coût (FCFA)"]],
      body: phases.map(p => [p.name, p.days_per_ha, p.totalDays, fmt(p.cost)]),
      foot: [["", "", fmt(totalLabourDays) + " jours", fmt(totalLabourCost)]],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 120, 74] },
    });

    doc.save(`plan_production_${crop.name}_${area}ha.pdf`);
    toast.success("PDF exporté !");
  };

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Planification & Calcul automatique
        </h1>
        <p className="text-muted-foreground mt-1">
          Calculez automatiquement les intrants, la main d'œuvre et la rentabilité à partir de la superficie GPS
        </p>
      </div>

      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paramètres</CardTitle>
          <CardDescription>Choisissez la parcelle et la culture pour lancer le calcul</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Parcelle</Label>
              <Select value={selectedParcel} onValueChange={setSelectedParcel}>
                <SelectTrigger><SelectValue placeholder="Choisir la parcelle" /></SelectTrigger>
                <SelectContent>
                  {parcels.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.calculated_area_ha || p.area_ha} ha {p.calculated_area_ha ? "📍GPS" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Culture</Label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger><SelectValue placeholder="Choisir la culture" /></SelectTrigger>
                <SelectContent>
                  {crops.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.variety ? ` (${c.variety})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Superficie (ha) {parcel?.calculated_area_ha && <Badge variant="outline" className="ml-1 text-xs">GPS</Badge>}</Label>
              <Input
                type="number"
                step="any"
                value={manualArea || (parcel?.calculated_area_ha || parcel?.area_ha || "")}
                onChange={e => setManualArea(e.target.value)}
                placeholder="Auto depuis parcelle"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasResult && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <Card className="border-primary/20">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Superficie</CardTitle>
                <Sprout className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-heading font-bold">{area} <span className="text-sm font-normal">ha</span></p>
                {parcel?.calculated_area_ha && <p className="text-[10px] text-primary">📍 Mesurée par GPS</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Rendement estimé</CardTitle>
                <Wheat className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent><p className="text-xl font-heading font-bold">{fmt(expectedYield)} <span className="text-sm font-normal">kg</span></p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Budget nécessaire</CardTitle>
                <DollarSign className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent><p className="text-xl font-heading font-bold">{fmt(totalBudget)} <span className="text-sm font-normal">FCFA</span></p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Revenu estimé</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><p className="text-xl font-heading font-bold">{fmt(expectedRevenue)} <span className="text-sm font-normal">FCFA</span></p></CardContent>
            </Card>
            <Card className={profit >= 0 ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">Profit potentiel</CardTitle>
                <TrendingUp className={`h-4 w-4 ${profit >= 0 ? "text-primary" : "text-destructive"}`} />
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-heading font-bold ${profit >= 0 ? "text-primary" : "text-destructive"}`}>
                  {profit >= 0 ? "+" : ""}{fmt(profit)} <span className="text-sm font-normal">FCFA</span>
                </p>
                <p className="text-[10px] text-muted-foreground">ROI: {roi}% · Seuil: {fmt(breakEvenKg)} kg</p>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Intrants */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    Intrants nécessaires
                  </CardTitle>
                  <CardDescription>Calculés automatiquement à partir de {area} ha</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {inputs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">Aucune donnée d'intrants pour cette culture</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Intrant</TableHead>
                        <TableHead className="text-right">Dose/ha</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Coût (FCFA)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inputs.map(i => (
                        <TableRow key={i.name}>
                          <TableCell className="font-medium">{i.name}</TableCell>
                          <TableCell className="text-right">{i.qtyPerHa} {i.unit}</TableCell>
                          <TableCell className="text-right font-mono">{i.totalQty} {i.unit}</TableCell>
                          <TableCell className="text-right font-bold">{fmt(i.totalCost)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={3}>Total intrants</TableCell>
                        <TableCell className="text-right">{fmt(totalInputCost)} FCFA</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Main d'œuvre */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  Main d'œuvre estimée
                </CardTitle>
                <CardDescription>Basé sur {labourData.daily_rate.toLocaleString("fr-FR")} FCFA/jour</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead className="text-right">Jours/ha</TableHead>
                      <TableHead className="text-right">Total jours</TableHead>
                      <TableHead className="text-right">Coût (FCFA)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phases.map(p => (
                      <TableRow key={p.name}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right">{p.days_per_ha}</TableCell>
                        <TableCell className="text-right font-mono">{p.totalDays}</TableCell>
                        <TableCell className="text-right font-bold">{fmt(p.cost)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={2}>Total main d'œuvre</TableCell>
                      <TableCell className="text-right">{fmt(totalLabourDays)} j</TableCell>
                      <TableCell className="text-right">{fmt(totalLabourCost)} FCFA</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Summary + Export */}
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Récapitulatif budgétaire</CardTitle>
              <Button onClick={exportPDF} size="sm">
                <FileText className="h-4 w-4 mr-1" />Exporter PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Coût intrants</p>
                  <p className="text-lg font-bold">{fmt(totalInputCost)} FCFA</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Coût main d'œuvre</p>
                  <p className="text-lg font-bold">{fmt(totalLabourCost)} FCFA</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Budget total</p>
                  <p className="text-lg font-bold text-destructive">{fmt(totalBudget)} FCFA</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Profit potentiel</p>
                  <p className={`text-lg font-bold ${profit >= 0 ? "text-primary" : "text-destructive"}`}>
                    {profit >= 0 ? "+" : ""}{fmt(profit)} FCFA
                  </p>
                </div>
              </div>
              {plantCount > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">
                    <strong>{fmt(plantCount)}</strong> plants · Durée du cycle : <strong>{crop.growth_duration_days || "—"}</strong> jours ·
                    Seuil de rentabilité : <strong>{fmt(breakEvenKg)} kg</strong> · ROI estimé : <strong>{roi}%</strong>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!hasResult && area === 0 && selectedCrop && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            Sélectionnez une parcelle ou entrez une superficie pour voir les calculs
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CropPlanningPage;
