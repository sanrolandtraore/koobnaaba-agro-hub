import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Droplets, Leaf, Bug, Download, Loader2, Sprout, Calendar, FlaskConical } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Reference data ────────────────────────────────────────
const CROPS: Record<string, { npk: [number, number, number]; water_mm: number; cycle_days: number }> = {
  "Maïs": { npk: [120, 60, 40], water_mm: 500, cycle_days: 120 },
  "Riz": { npk: [100, 50, 50], water_mm: 900, cycle_days: 130 },
  "Sorgho": { npk: [80, 40, 30], water_mm: 350, cycle_days: 110 },
  "Mil": { npk: [60, 30, 20], water_mm: 300, cycle_days: 90 },
  "Arachide": { npk: [20, 40, 30], water_mm: 400, cycle_days: 100 },
  "Coton": { npk: [100, 50, 40], water_mm: 600, cycle_days: 150 },
  "Niébé": { npk: [15, 30, 20], water_mm: 300, cycle_days: 70 },
  "Soja": { npk: [20, 50, 40], water_mm: 450, cycle_days: 100 },
  "Tomate": { npk: [150, 80, 100], water_mm: 600, cycle_days: 90 },
  "Oignon": { npk: [100, 60, 80], water_mm: 450, cycle_days: 100 },
};

const SOIL_TYPES = [
  { value: "argileux", label: "Argileux", coeff: 0.85 },
  { value: "sableux", label: "Sableux", coeff: 1.15 },
  { value: "limoneux", label: "Limoneux", coeff: 1.0 },
  { value: "argilo-sableux", label: "Argilo-sableux", coeff: 0.95 },
  { value: "lateritique", label: "Latéritique", coeff: 1.1 },
];

const IRRIGATION_TYPES = [
  { value: "goutte_a_goutte", label: "Goutte-à-goutte", efficiency: 0.9 },
  { value: "aspersion", label: "Aspersion", efficiency: 0.75 },
  { value: "gravite", label: "Gravitaire", efficiency: 0.5 },
  { value: "californien", label: "Californien", efficiency: 0.7 },
  { value: "pluvial", label: "Pluvial (pluie)", efficiency: 1.0 },
];

const HEALTH_STATES = ["Sain", "Léger stress", "Attaque modérée", "Attaque sévère", "Critique"];

const TREATMENT_PRODUCTS: Record<string, { name: string; dose_per_ha: string; unit: string; cost_per_unit: number }[]> = {
  fongicide: [
    { name: "Mancozèbe 80% WP", dose_per_ha: "2.5", unit: "kg", cost_per_unit: 5000 },
    { name: "Carbendazime 50% SC", dose_per_ha: "1.0", unit: "L", cost_per_unit: 8000 },
  ],
  insecticide: [
    { name: "Lambda-cyhalothrine 50 EC", dose_per_ha: "0.5", unit: "L", cost_per_unit: 12000 },
    { name: "Acétamipride 20 SP", dose_per_ha: "0.25", unit: "kg", cost_per_unit: 15000 },
  ],
  herbicide: [
    { name: "Glyphosate 360 SL", dose_per_ha: "3.0", unit: "L", cost_per_unit: 4000 },
    { name: "Atrazine 500 SC", dose_per_ha: "2.0", unit: "L", cost_per_unit: 6000 },
  ],
  nematicide: [
    { name: "Carbofuran 5G", dose_per_ha: "20", unit: "kg", cost_per_unit: 3000 },
  ],
};

interface Props {
  sessionData?: {
    client_name?: string | null;
    parcel_name?: string | null;
    crop_type?: string | null;
    general_condition?: string | null;
  };
}

// ─── Fertilization plan generator ──────────────────────────
function FertilizationPlan({ sessionData }: Props) {
  const [crop, setCrop] = useState(sessionData?.crop_type && CROPS[sessionData.crop_type] ? sessionData.crop_type : "");
  const [area, setArea] = useState("");
  const [soil, setSoil] = useState("");
  const [targetYield, setTargetYield] = useState("");
  const [plan, setPlan] = useState<any>(null);

  const generate = () => {
    if (!crop || !area || !soil) { toast.error("Remplir culture, superficie et type de sol"); return; }
    const areaHa = parseFloat(area);
    const ref = CROPS[crop];
    const soilCoeff = SOIL_TYPES.find(s => s.value === soil)?.coeff || 1.0;
    const yieldCoeff = targetYield ? parseFloat(targetYield) / 100 : 1.0;

    const nTotal = Math.round(ref.npk[0] * areaHa * soilCoeff * yieldCoeff);
    const pTotal = Math.round(ref.npk[1] * areaHa * soilCoeff * yieldCoeff);
    const kTotal = Math.round(ref.npk[2] * areaHa * soilCoeff * yieldCoeff);

    // Convert to commercial fertilizers
    const urea = Math.round(nTotal / 0.46); // 46% N
    const tsp = Math.round(pTotal / 0.46);  // 46% P2O5
    const kcl = Math.round(kTotal / 0.60);  // 60% K2O
    const npk15 = Math.round(Math.min(nTotal, pTotal, kTotal) / 0.15); // NPK 15-15-15

    const calendar = [
      { phase: "Fumure de fond (semis)", timing: "0 jour", product: `NPK 15-15-15: ${npk15} kg`, action: "Enfouir au labour ou épandre au semis" },
      { phase: "1er apport Urée", timing: `${Math.round(ref.cycle_days * 0.2)} jours`, product: `Urée 46%: ${Math.round(urea * 0.5)} kg`, action: "Épandre en couronne autour des plants" },
      { phase: "2e apport Urée", timing: `${Math.round(ref.cycle_days * 0.45)} jours`, product: `Urée 46%: ${Math.round(urea * 0.5)} kg`, action: "Épandre avant la floraison" },
      { phase: "Apport Potasse (si nécessaire)", timing: `${Math.round(ref.cycle_days * 0.35)} jours`, product: `KCl 60%: ${kcl} kg`, action: "Apport fractionnaire si sol pauvre en K" },
    ];

    const costUrea = urea * 450;
    const costNPK = npk15 * 500;
    const costTSP = tsp * 480;
    const costKCl = kcl * 420;

    setPlan({
      npk: { n: nTotal, p: pTotal, k: kTotal },
      fertilizers: { urea, tsp, kcl, npk15 },
      calendar,
      totalCost: costUrea + costNPK + costTSP + costKCl,
      costs: { urea: costUrea, npk: costNPK, tsp: costTSP, kcl: costKCl },
    });
    toast.success("Plan de fertilisation généré !");
  };

  const downloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    doc.setFillColor(34, 120, 74); doc.rect(0, 0, w, 30, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(16);
    doc.text("Plan de Fertilisation Intelligent", 14, 18);
    doc.setTextColor(0, 0, 0); let y = 40;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Paramètres", 14, y); y += 7;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(`Culture: ${crop} | Superficie: ${area} ha | Sol: ${SOIL_TYPES.find(s => s.value === soil)?.label}`, 14, y); y += 12;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Besoins nutritifs (kg)", 14, y); y += 7;
    autoTable(doc, { startY: y, head: [["Azote (N)", "Phosphore (P₂O₅)", "Potassium (K₂O)"]], body: [[`${plan.npk.n} kg`, `${plan.npk.p} kg`, `${plan.npk.k} kg`]], theme: "striped", headStyles: { fillColor: [34, 120, 74] }, margin: { left: 14, right: 14 } });
    y = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Calendrier de fertilisation", 14, y); y += 7;
    autoTable(doc, { startY: y, head: [["Phase", "Timing", "Produit", "Action"]], body: plan.calendar.map((c: any) => [c.phase, c.timing, c.product, c.action]), theme: "striped", headStyles: { fillColor: [34, 120, 74] }, margin: { left: 14, right: 14 }, styles: { fontSize: 8 } });
    y = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text(`Coût estimé total: ${plan.totalCost.toLocaleString()} FCFA`, 14, y);

    const pH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7); doc.setTextColor(120); doc.text("NAFA - AGRITECH - Plan de fertilisation", 14, pH - 8);
    doc.save(`plan_fertilisation_${crop}_${area}ha.pdf`);
    toast.success("PDF téléchargé");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Culture *</Label>
          <Select value={crop} onValueChange={setCrop}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>{Object.keys(CROPS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Superficie (ha) *</Label><Input type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="ex: 2.5" /></div>
        <div>
          <Label>Type de sol *</Label>
          <Select value={soil} onValueChange={setSoil}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>{SOIL_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Rendement cible (% du potentiel)</Label><Input type="number" value={targetYield} onChange={e => setTargetYield(e.target.value)} placeholder="100 = potentiel max" /></div>
      </div>
      <Button onClick={generate} className="gap-2"><Sprout className="h-4 w-4" />Générer le plan</Button>

      {plan && (
        <div className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" />Besoins nutritifs totaux</CardTitle></CardHeader>
            <CardContent className="flex gap-4 flex-wrap">
              <Badge variant="outline" className="text-sm px-3 py-1">N: {plan.npk.n} kg</Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">P₂O₅: {plan.npk.p} kg</Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">K₂O: {plan.npk.k} kg</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Leaf className="h-4 w-4 text-primary" />Engrais commerciaux nécessaires</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="border rounded p-2"><strong>NPK 15-15-15:</strong> {plan.fertilizers.npk15} kg<br/><span className="text-muted-foreground">{plan.costs.npk.toLocaleString()} FCFA</span></div>
              <div className="border rounded p-2"><strong>Urée 46%:</strong> {plan.fertilizers.urea} kg<br/><span className="text-muted-foreground">{plan.costs.urea.toLocaleString()} FCFA</span></div>
              <div className="border rounded p-2"><strong>TSP 46%:</strong> {plan.fertilizers.tsp} kg<br/><span className="text-muted-foreground">{plan.costs.tsp.toLocaleString()} FCFA</span></div>
              <div className="border rounded p-2"><strong>KCl 60%:</strong> {plan.fertilizers.kcl} kg<br/><span className="text-muted-foreground">{plan.costs.kcl.toLocaleString()} FCFA</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Calendrier de fertilisation</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {plan.calendar.map((c: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 border-l-2 border-primary pl-3 py-1">
                    <Badge variant="secondary" className="shrink-0 text-xs">{c.timing}</Badge>
                    <div className="text-sm"><strong>{c.phase}</strong><br/>{c.product}<br/><span className="text-muted-foreground">{c.action}</span></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="font-semibold">Coût total estimé: <span className="text-primary">{plan.totalCost.toLocaleString()} FCFA</span></p>
            <Button variant="outline" onClick={downloadPDF} className="gap-2"><Download className="h-4 w-4" />PDF</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Irrigation plan generator ─────────────────────────────
function IrrigationPlan({ sessionData }: Props) {
  const [crop, setCrop] = useState(sessionData?.crop_type && CROPS[sessionData.crop_type] ? sessionData.crop_type : "");
  const [area, setArea] = useState("");
  const [irrigType, setIrrigType] = useState("");
  const [plan, setPlan] = useState<any>(null);

  const generate = () => {
    if (!crop || !area || !irrigType) { toast.error("Remplir tous les champs"); return; }
    const areaHa = parseFloat(area);
    const ref = CROPS[crop];
    const irrig = IRRIGATION_TYPES.find(i => i.value === irrigType)!;

    const totalWaterNeed = ref.water_mm * areaHa; // m³ (1mm on 1ha = 10m³)
    const totalM3 = totalWaterNeed * 10;
    const adjustedM3 = Math.round(totalM3 / irrig.efficiency);
    const daysNeeded = ref.cycle_days;
    const dailyM3 = Math.round(adjustedM3 / daysNeeded * 10) / 10;
    const weeklyM3 = Math.round(dailyM3 * 7 * 10) / 10;

    const phases = [
      { phase: "Installation (0-20%)", duration: `${Math.round(daysNeeded * 0.2)} jours`, frequency: irrigType === "goutte_a_goutte" ? "Quotidien" : "Tous les 2 jours", volume: `${Math.round(dailyM3 * 0.6)} m³/jour`, note: "Arrosage léger pour favoriser l'enracinement" },
      { phase: "Croissance végétative (20-50%)", duration: `${Math.round(daysNeeded * 0.3)} jours`, frequency: irrigType === "goutte_a_goutte" ? "Quotidien" : "Tous les 3 jours", volume: `${Math.round(dailyM3 * 1.0)} m³/jour`, note: "Augmenter progressivement les apports" },
      { phase: "Floraison / Fructification (50-80%)", duration: `${Math.round(daysNeeded * 0.3)} jours`, frequency: "Quotidien", volume: `${Math.round(dailyM3 * 1.3)} m³/jour`, note: "Phase critique - ne pas stresser la culture" },
      { phase: "Maturation (80-100%)", duration: `${Math.round(daysNeeded * 0.2)} jours`, frequency: "Tous les 3-4 jours", volume: `${Math.round(dailyM3 * 0.5)} m³/jour`, note: "Réduire progressivement avant récolte" },
    ];

    const costPerM3 = irrigType === "goutte_a_goutte" ? 150 : irrigType === "aspersion" ? 120 : 80;
    setPlan({ totalM3: adjustedM3, dailyM3, weeklyM3, phases, efficiency: irrig.efficiency * 100, totalCost: adjustedM3 * costPerM3, costPerM3, cycleDays: daysNeeded });
    toast.success("Plan d'irrigation généré !");
  };

  const downloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    doc.setFillColor(30, 100, 160); doc.rect(0, 0, w, 30, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(16);
    doc.text("Plan d'Irrigation", 14, 18);
    doc.setTextColor(0, 0, 0); let y = 40;

    doc.setFontSize(9); doc.text(`Culture: ${crop} | Superficie: ${area} ha | Système: ${IRRIGATION_TYPES.find(i => i.value === irrigType)?.label} | Efficience: ${plan.efficiency}%`, 14, y); y += 12;

    autoTable(doc, { startY: y, head: [["Besoin total (m³)", "Débit quotidien", "Débit hebdo", "Durée cycle"]], body: [[`${plan.totalM3} m³`, `${plan.dailyM3} m³/j`, `${plan.weeklyM3} m³/sem`, `${plan.cycleDays} jours`]], theme: "striped", headStyles: { fillColor: [30, 100, 160] }, margin: { left: 14, right: 14 } });
    y = (doc as any).lastAutoTable.finalY + 10;

    autoTable(doc, { startY: y, head: [["Phase", "Durée", "Fréquence", "Volume", "Recommandation"]], body: plan.phases.map((p: any) => [p.phase, p.duration, p.frequency, p.volume, p.note]), theme: "striped", headStyles: { fillColor: [30, 100, 160] }, margin: { left: 14, right: 14 }, styles: { fontSize: 8 } });
    y = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text(`Coût estimé: ${plan.totalCost.toLocaleString()} FCFA`, 14, y);
    const pH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7); doc.setTextColor(120); doc.text("NAFA - AGRITECH", 14, pH - 8);
    doc.save(`plan_irrigation_${crop}_${area}ha.pdf`);
    toast.success("PDF téléchargé");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label>Culture *</Label>
          <Select value={crop} onValueChange={setCrop}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>{Object.keys(CROPS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Superficie (ha) *</Label><Input type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="ex: 2.5" /></div>
        <div>
          <Label>Type d'irrigation *</Label>
          <Select value={irrigType} onValueChange={setIrrigType}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>{IRRIGATION_TYPES.map(i => <SelectItem key={i.value} value={i.value}>{i.label} ({Math.round(i.efficiency * 100)}%)</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={generate} className="gap-2"><Droplets className="h-4 w-4" />Générer le plan</Button>

      {plan && (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Volume total", value: `${plan.totalM3} m³` },
              { label: "Débit/jour", value: `${plan.dailyM3} m³` },
              { label: "Efficience", value: `${plan.efficiency}%` },
              { label: "Coût estimé", value: `${plan.totalCost.toLocaleString()} F` },
            ].map((s, i) => (
              <Card key={i}><CardContent className="pt-3 pb-2 text-center"><p className="text-lg font-bold text-primary">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Phases d'irrigation</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {plan.phases.map((p: any, i: number) => (
                <div key={i} className="border-l-2 border-blue-500 pl-3 py-1 text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong>{p.phase}</strong>
                    <Badge variant="outline" className="text-xs">{p.duration}</Badge>
                    <Badge variant="secondary" className="text-xs">{p.frequency}</Badge>
                  </div>
                  <p className="text-muted-foreground">{p.volume} — {p.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end"><Button variant="outline" onClick={downloadPDF} className="gap-2"><Download className="h-4 w-4" />PDF</Button></div>
        </div>
      )}
    </div>
  );
}

// ─── Treatment plan generator ──────────────────────────────
function TreatmentPlan({ sessionData }: Props) {
  const [crop, setCrop] = useState(sessionData?.crop_type && CROPS[sessionData.crop_type] ? sessionData.crop_type : "");
  const [area, setArea] = useState("");
  const [healthState, setHealthState] = useState(sessionData?.general_condition || "");
  const [productType, setProductType] = useState("");
  const [plan, setPlan] = useState<any>(null);

  const generate = () => {
    if (!crop || !area || !healthState || !productType) { toast.error("Remplir tous les champs"); return; }
    const areaHa = parseFloat(area);
    const products = TREATMENT_PRODUCTS[productType] || [];

    const severityCoeff = { "Sain": 0.5, "Léger stress": 0.7, "Attaque modérée": 1.0, "Attaque sévère": 1.3, "Critique": 1.5 }[healthState] || 1.0;
    const nbApplications = healthState === "Sain" ? 1 : healthState === "Léger stress" ? 2 : healthState === "Attaque modérée" ? 3 : 4;
    const interval = healthState === "Critique" ? 7 : healthState === "Attaque sévère" ? 10 : 14;

    const treatments = products.map(p => {
      const doseTotal = Math.round(parseFloat(p.dose_per_ha) * areaHa * severityCoeff * 100) / 100;
      const costTotal = Math.round(doseTotal * p.cost_per_unit);
      return { ...p, dose_total: doseTotal, cost_total: costTotal, applications: nbApplications };
    });

    const calendar = Array.from({ length: nbApplications }, (_, i) => ({
      application: `Application ${i + 1}`,
      jour: `Jour ${i * interval}`,
      products: treatments.map(t => `${t.name}: ${Math.round(t.dose_total / nbApplications * 100) / 100} ${t.unit}`).join(" + "),
      note: i === 0 ? "Traitement initial complet" : i === nbApplications - 1 ? "Dernière application - observer évolution" : "Traitement de suivi",
    }));

    const totalCost = treatments.reduce((sum, t) => sum + t.cost_total, 0);

    setPlan({ treatments, calendar, totalCost, nbApplications, interval, severityCoeff });
    toast.success("Plan de traitement généré !");
  };

  const downloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    doc.setFillColor(180, 60, 40); doc.rect(0, 0, w, 30, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(16);
    doc.text("Plan de Traitement Phytosanitaire", 14, 18);
    doc.setTextColor(0, 0, 0); let y = 40;

    doc.setFontSize(9); doc.text(`Culture: ${crop} | Superficie: ${area} ha | État: ${healthState} | Type: ${productType}`, 14, y); y += 12;

    autoTable(doc, { startY: y, head: [["Produit", "Dose/ha", "Dose totale", "Applications", "Coût total"]], body: plan.treatments.map((t: any) => [t.name, `${t.dose_per_ha} ${t.unit}/ha`, `${t.dose_total} ${t.unit}`, plan.nbApplications, `${t.cost_total.toLocaleString()} FCFA`]), theme: "striped", headStyles: { fillColor: [180, 60, 40] }, margin: { left: 14, right: 14 } });
    y = (doc as any).lastAutoTable.finalY + 10;

    autoTable(doc, { startY: y, head: [["Application", "Timing", "Produits", "Note"]], body: plan.calendar.map((c: any) => [c.application, c.jour, c.products, c.note]), theme: "striped", headStyles: { fillColor: [180, 60, 40] }, margin: { left: 14, right: 14 }, styles: { fontSize: 8 } });
    y = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text(`Coût total estimé: ${plan.totalCost.toLocaleString()} FCFA`, 14, y);
    const pH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7); doc.setTextColor(120); doc.text("NAFA - AGRITECH", 14, pH - 8);
    doc.save(`plan_traitement_${crop}_${area}ha.pdf`);
    toast.success("PDF téléchargé");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Culture *</Label>
          <Select value={crop} onValueChange={setCrop}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>{Object.keys(CROPS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Superficie (ha) *</Label><Input type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="ex: 2.5" /></div>
        <div>
          <Label>État de santé *</Label>
          <Select value={healthState} onValueChange={setHealthState}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>{HEALTH_STATES.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Type de produit *</Label>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fongicide">Fongicide</SelectItem>
              <SelectItem value="insecticide">Insecticide</SelectItem>
              <SelectItem value="herbicide">Herbicide</SelectItem>
              <SelectItem value="nematicide">Nématicide</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={generate} className="gap-2"><Bug className="h-4 w-4" />Générer le plan</Button>

      {plan && (
        <div className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Produits recommandés</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {plan.treatments.map((t: any, i: number) => (
                <div key={i} className="border rounded p-3 text-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <strong>{t.name}</strong>
                    <Badge variant="outline">{t.cost_total.toLocaleString()} FCFA</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1">Dose/ha: {t.dose_per_ha} {t.unit} → Total: {t.dose_total} {t.unit} × {plan.nbApplications} applications</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Calendrier des traitements (intervalle: {plan.interval} jours)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {plan.calendar.map((c: any, i: number) => (
                <div key={i} className="border-l-2 border-red-500 pl-3 py-1 text-sm">
                  <div className="flex items-center gap-2"><strong>{c.application}</strong><Badge variant="secondary" className="text-xs">{c.jour}</Badge></div>
                  <p className="text-xs mt-1">{c.products}</p>
                  <p className="text-xs text-muted-foreground">{c.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="font-semibold">Coût total: <span className="text-primary">{plan.totalCost.toLocaleString()} FCFA</span></p>
            <Button variant="outline" onClick={downloadPDF} className="gap-2"><Download className="h-4 w-4" />PDF</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────
export default function AgronomicPlansGenerator({ sessionData }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FlaskConical className="h-5 w-5 text-primary" />
          Plans agronomiques intelligents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fertilisation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fertilisation" className="gap-1 text-xs sm:text-sm"><Sprout className="h-3 w-3 sm:h-4 sm:w-4" />Fertilisation</TabsTrigger>
            <TabsTrigger value="irrigation" className="gap-1 text-xs sm:text-sm"><Droplets className="h-3 w-3 sm:h-4 sm:w-4" />Irrigation</TabsTrigger>
            <TabsTrigger value="traitement" className="gap-1 text-xs sm:text-sm"><Bug className="h-3 w-3 sm:h-4 sm:w-4" />Traitement</TabsTrigger>
          </TabsList>
          <TabsContent value="fertilisation"><FertilizationPlan sessionData={sessionData} /></TabsContent>
          <TabsContent value="irrigation"><IrrigationPlan sessionData={sessionData} /></TabsContent>
          <TabsContent value="traitement"><TreatmentPlan sessionData={sessionData} /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
