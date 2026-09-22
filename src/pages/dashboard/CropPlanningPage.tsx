import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Calculator,
  Wheat,
  Sprout,
  FlaskConical,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  RotateCcw,
  Plus,
  Trash2,
  TreePine,
  CloudSun,
  Save,
  CheckCircle2,
  ClipboardList,
  CalendarDays,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  CLIMATE_ZONES_BURKINA,
  FRUIT_TREE_PRESETS,
  calculateTreeDensity,
  calculateOrchardPlan,
  PlantingPattern,
} from "@/lib/agronomicEngine";
import { WEST_AFRICA_12_CROPS } from "@/lib/cropLibraryData";

const fallbackCrops = WEST_AFRICA_12_CROPS.map(c => ({
  id: c.id,
  name: c.name_fr.split(" (")[0],
  variety: c.recommended_varieties?.[0] || "Standard",
  type: c.category === "Céréales" ? "annual" : "perennial",
  avg_yield_per_ha: (c.yield_potential_t_ha || 3) * 1000,
  avg_price_per_kg: 200,
  growth_duration_days: c.cycle_days_max || 120,
  spacing_m: 0.8,
  plants_per_ha: 50000,
  input_requirements: {
    "NPK (15-15-15)": { qty_per_ha: (c.npk_needs?.N || 100) * 2, unit: "kg" },
    "Urée 46%": { qty_per_ha: 100, unit: "kg" },
    "Fumure organique": { qty_per_ha: 2000, unit: "kg" },
  }
}));

// Prix de référence réalistes au Burkina Faso (FCFA)
const getInputDefaultPrice = (name: string): number => {
  const n = name.toLowerCase();
  if (n.includes("npk")) return 450; // 22 500 F / sac de 50 kg
  if (n.includes("urée") || n.includes("uree")) return 420; // 21 000 F / sac de 50 kg
  if (n.includes("fumure") || n.includes("compost")) return 30; // 30 000 F / tonne
  if (n.includes("semence")) return 1500; // 1 500 F / kg
  if (n.includes("phyto") || n.includes("traitement") || n.includes("insecticide")) return 5000;
  if (n.includes("plant") || n.includes("arbre")) return 1500;
  return 500;
};

// Coefficients de main-d'œuvre par hectare (estimations indicatives modifiables)
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

const defaultLabour = {
  labour_per_ha: 70, daily_rate: 2000,
  phases: [
    { name: "Défrichage/Labour", days_per_ha: 15 },
    { name: "Semis / Trouaison", days_per_ha: 10 },
    { name: "Sarclage (×2)", days_per_ha: 16 },
    { name: "Épandage fertilisants", days_per_ha: 6 },
    { name: "Traitement / Entretien", days_per_ha: 5 },
    { name: "Récolte", days_per_ha: 15 },
    { name: "Post-récolte", days_per_ha: 5 },
  ],
};

const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");
const numv = (v: string | number) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export type InputRow = { name: string; totalQty: number; unit: string; unitPrice: number };
export type PhaseRow = { name: string; totalDays: number; workers: number; dailyRate: number };

export interface SavedCropPlan {
  id: string;
  createdAt: string;
  seasonName: string;
  cropId: string;
  cropName: string;
  variety?: string;
  areaHa: number;
  parcelName?: string;
  climateZoneName: string;
  climateCoeff: number;
  expectedYieldKg: number;
  expectedRevenue: number;
  totalBudget: number;
  profit: number;
  roi: number;
  breakEvenKg: number;
  plantCount: number;
  inputRows: InputRow[];
  phaseRows: PhaseRow[];
  yieldOverride?: string;
  priceOverride?: string;
  notes?: string;
}

const defaultInitialPlans: SavedCropPlan[] = [
  {
    id: "plan-modele-mais-1ha",
    createdAt: new Date().toISOString(),
    seasonName: "Modèle de référence — Maïs (1 ha)",
    cropId: fallbackCrops[0]?.id || "sheet-mais",
    cropName: "Maïs",
    variety: "Barkas",
    areaHa: 1,
    parcelName: "Mode direct (1 ha)",
    climateZoneName: "Soudano-Sahélien",
    climateCoeff: 1.0,
    expectedYieldKg: 4500,
    expectedRevenue: 900000,
    totalBudget: 285000,
    profit: 615000,
    roi: 216,
    breakEvenKg: 1425,
    plantCount: 50000,
    inputRows: [
      { name: "NPK (15-15-15)", totalQty: 200, unit: "kg", unitPrice: 450 },
      { name: "Urée 46%", totalQty: 100, unit: "kg", unitPrice: 420 },
      { name: "Fumure organique", totalQty: 2000, unit: "kg", unitPrice: 30 },
      { name: "Semences certifiées (Barkas)", totalQty: 20, unit: "kg", unitPrice: 1500 },
    ],
    phaseRows: [
      { name: "Défrichage/Labour", totalDays: 15, workers: 1, dailyRate: 2000 },
      { name: "Semis", totalDays: 8, workers: 1, dailyRate: 2000 },
      { name: "Sarclage (×2)", totalDays: 20, workers: 1, dailyRate: 2000 },
      { name: "Épandage engrais", totalDays: 8, workers: 1, dailyRate: 2000 },
      { name: "Récolte & Post-récolte", totalDays: 25, workers: 1, dailyRate: 2000 },
    ],
    yieldOverride: "",
    priceOverride: "",
  }
];

const CropPlanningPage = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>(fallbackCrops);
  const [climateZones, setClimateZones] = useState<any[]>(CLIMATE_ZONES_BURKINA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"simulateur" | "mes-campagnes">("simulateur");

  // Selection state
  const [selectedParcel, setSelectedParcel] = useState("");
  const [selectedCrop, setSelectedCrop] = useState(fallbackCrops[0]?.id || "");
  const [manualArea, setManualArea] = useState("1");
  const [selectedClimateZoneId, setSelectedClimateZoneId] = useState("soudano_sahelien");

  // Saved plans state
  const storageKey = `koobnaaba_saved_crop_plans_${user?.id || "demo"}`;
  const [savedPlans, setSavedPlans] = useState<SavedCropPlan[]>([]);

  // Mode Verger / Arboriculture
  const [orchardPresetId, setOrchardPresetId] = useState<string>("manguier_greffe");
  const [orchardPattern, setOrchardPattern] = useState<PlantingPattern>("carre");
  const [rowSpacingM, setRowSpacingM] = useState<number>(10);
  const [plantSpacingM, setPlantSpacingM] = useState<number>(10);
  const [manurePerHoleKg, setManurePerHoleKg] = useState<number>(20);
  const [npkPerHoleG, setNpkPerHoleG] = useState<number>(250);

  // Editable rows
  const [inputRows, setInputRows] = useState<InputRow[]>([]);
  const [phaseRows, setPhaseRows] = useState<PhaseRow[]>([]);
  const [yieldOverride, setYieldOverride] = useState<string>("");
  const [priceOverride, setPriceOverride] = useState<string>("");

  // Charge saved plans from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedPlans(parsed);
        } else {
          setSavedPlans(defaultInitialPlans);
          localStorage.setItem(storageKey, JSON.stringify(defaultInitialPlans));
        }
      } else {
        setSavedPlans(defaultInitialPlans);
        localStorage.setItem(storageKey, JSON.stringify(defaultInitialPlans));
      }
    } catch {
      setSavedPlans(defaultInitialPlans);
    }
  }, [storageKey]);

  // Load backend references
  useEffect(() => {
    Promise.all([
      supabase.from("parcels").select("id, name, area_ha, calculated_area_ha, soil_type, irrigation_type, farms(id, name, climate_zone_id, climate_zones(id, name, climate_coefficient))"),
      supabase.from("crop_references").select("*"),
      supabase.from("climate_zones").select("*"),
    ]).then(([pRes, cRes, czRes]) => {
      setParcels(pRes.data || []);
      const loadedCrops = (cRes.data && cRes.data.length > 0) ? cRes.data : fallbackCrops;
      setCrops(loadedCrops);

      // Assurer que la culture sélectionnée existe bien dans la liste chargée
      setSelectedCrop(prev => {
        const found = loadedCrops.some(c => c.id === prev);
        return found ? prev : loadedCrops[0]?.id || fallbackCrops[0].id;
      });

      if (czRes.data && czRes.data.length > 0) {
        setClimateZones(czRes.data);
      }
      setLoading(false);
    }).catch(() => {
      setCrops(fallbackCrops);
      setLoading(false);
    });
  }, []);

  const parcel = parcels.find(p => p.id === selectedParcel);
  // Résolution sécurisée : ne peut jamais être undefined
  const crop = crops.find(c => c.id === selectedCrop) || crops[0] || fallbackCrops[0];
  const area = manualArea ? (parseFloat(manualArea) > 0 ? parseFloat(manualArea) : 1) : (parcel?.calculated_area_ha || parcel?.area_ha || 1);

  // Synchronisation automatique de la zone climatique dès qu'une parcelle est choisie
  useEffect(() => {
    if (parcel?.farms?.climate_zones?.id) {
      setSelectedClimateZoneId(parcel.farms.climate_zones.id);
    } else if (parcel?.farms?.climate_zone_id) {
      setSelectedClimateZoneId(parcel.farms.climate_zone_id);
    }
  }, [selectedParcel, parcel]);

  const activeClimateZone = useMemo(() => {
    const found = climateZones.find(cz => cz.id === selectedClimateZoneId || cz.name?.toLowerCase().includes(selectedClimateZoneId.toLowerCase()));
    if (found) return found;
    return CLIMATE_ZONES_BURKINA.find(cz => cz.id === selectedClimateZoneId) || CLIMATE_ZONES_BURKINA[1];
  }, [climateZones, selectedClimateZoneId]);

  const climateCoeff = activeClimateZone?.climate_coefficient || 1.0;

  // Détection culture pérenne ou verger
  const isPerennial = crop?.type === "perennial" || crop?.name?.toLowerCase().includes("mangu") || crop?.name?.toLowerCase().includes("anacard");

  // Calcul du verger
  const orchardPlan = useMemo(() => {
    return calculateOrchardPlan({
      areaHa: area,
      rowSpacingM,
      plantSpacingM,
      pattern: orchardPattern,
      manurePerHoleKg,
      npkPerHoleG,
      avgYieldPerTreeKg: 70,
      pricePerKg: crop?.avg_price_per_kg || 200,
      climateCoefficient: climateCoeff,
    });
  }, [area, rowSpacingM, plantSpacingM, orchardPattern, manurePerHoleKg, npkPerHoleG, crop, climateCoeff]);

  // Suggestions dérivées de la culture et de la surface avec prix par défaut burkinabè
  const suggestedInputs: InputRow[] = useMemo(() => {
    if (!crop) return [];
    let reqs = crop.input_requirements;
    if (!reqs || Object.keys(reqs).length === 0) {
      reqs = {
        "NPK (15-15-15)": { qty_per_ha: 200, unit: "kg" },
        "Urée 46%": { qty_per_ha: 100, unit: "kg" },
        "Fumure organique": { qty_per_ha: 2000, unit: "kg" },
        "Semences certifiées": { qty_per_ha: 20, unit: "kg" },
      };
    }
    return Object.entries(reqs).map(([name, v]: [string, any]) => {
      const qtyPerHa = v.qty_per_ha || v.quantity_per_ha || 0;
      return {
        name,
        totalQty: Math.round(qtyPerHa * area * 100) / 100,
        unit: v.unit || "kg",
        unitPrice: getInputDefaultPrice(name),
      };
    });
  }, [crop, area]);

  const suggestedPhases: PhaseRow[] = useMemo(() => {
    const labourData = crop ? (labourCoefficients[crop.name] || defaultLabour) : defaultLabour;
    return labourData.phases.map(p => ({
      name: p.name,
      totalDays: Math.round(p.days_per_ha * area * 10) / 10,
      workers: 1,
      dailyRate: labourData.daily_rate || 2000,
    }));
  }, [crop, area]);

  const resetToSuggestions = () => {
    setInputRows(suggestedInputs);
    setPhaseRows(suggestedPhases);
    setYieldOverride("");
    setPriceOverride("");
    toast.success("Valeurs par défaut restaurées");
  };

  // Chargement automatique lors du changement de culture ou superficie
  useEffect(() => {
    if (crop && area > 0) {
      setInputRows(suggestedInputs);
      setPhaseRows(suggestedPhases);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCrop, area]);

  // Calculs sur les lignes modifiables
  const totalInputCost = inputRows.reduce((s, i) => s + i.totalQty * i.unitPrice, 0);
  const totalLabourDays = phaseRows.reduce((s, p) => s + p.totalDays * p.workers, 0);
  const totalLabourCost = phaseRows.reduce((s, p) => s + p.totalDays * p.workers * p.dailyRate, 0);

  // Rendement et Chiffre d'affaires estimé
  const baseYieldPerHa = crop?.avg_yield_per_ha && crop.avg_yield_per_ha > 0 ? crop.avg_yield_per_ha : 3000;
  const effYieldPerHa = yieldOverride ? numv(yieldOverride) : Math.round(baseYieldPerHa * climateCoeff);
  const effPricePerKg = priceOverride ? numv(priceOverride) : (crop?.avg_price_per_kg && crop.avg_price_per_kg > 0 ? crop.avg_price_per_kg : 200);
  const expectedYield = Math.round(effYieldPerHa * area);
  const expectedRevenue = Math.round(expectedYield * effPricePerKg);
  const plantCount = isPerennial && orchardPlan.totalTrees > 0
    ? orchardPlan.totalTrees
    : (crop?.plants_per_ha ? Math.round(crop.plants_per_ha * area) : Math.round(50000 * area));

  const totalBudget = totalInputCost + totalLabourCost;
  const profit = expectedRevenue - totalBudget;
  const roi = totalBudget > 0 ? Math.round(((expectedRevenue - totalBudget) / totalBudget) * 100) : 0;
  const breakEvenKg = effPricePerKg ? Math.round(totalBudget / effPricePerKg) : 0;

  const hasResult = area > 0 && !!crop;

  // Fonctions d'édition
  const updateInput = (i: number, patch: Partial<InputRow>) =>
    setInputRows(rows => rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const addInput = () =>
    setInputRows(rows => [...rows, { name: "Nouvel intrant", totalQty: 0, unit: "kg", unitPrice: 500 }]);
  const removeInput = (i: number) =>
    setInputRows(rows => rows.filter((_, idx) => idx !== i));

  const updatePhase = (i: number, patch: Partial<PhaseRow>) =>
    setPhaseRows(rows => rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const addPhase = () =>
    setPhaseRows(rows => [...rows, { name: "Nouvelle phase", totalDays: 0, workers: 1, dailyRate: 2000 }]);
  const removePhase = (i: number) =>
    setPhaseRows(rows => rows.filter((_, idx) => idx !== i));

  // Injection verger
  const applyOrchardToInputs = () => {
    if (orchardPlan.totalTrees <= 0) return;
    const newInputs: InputRow[] = [
      { name: `Plants greffés (${crop?.name || "Arbres"})`, totalQty: orchardPlan.totalTrees, unit: "plants", unitPrice: 1500 },
      { name: "Fumure organique de fond (compost)", totalQty: orchardPlan.totalManureKg, unit: "kg", unitPrice: 30 },
      { name: "Engrais NPK de fond (trouaison)", totalQty: orchardPlan.totalNpkKg, unit: "kg", unitPrice: 500 },
    ];
    setInputRows(prev => [...prev.filter(r => !r.name.includes("Plants") && !r.name.includes("Fumure")), ...newInputs]);
    toast.success(`Ajouté : ${orchardPlan.totalTrees} plants et fertilisation pour verger !`);
  };

  // Enregistrement résilient (Local + Supabase synchrone)
  const savePlanToDatabase = async () => {
    if (!crop?.id) {
      toast.error("Veuillez sélectionner une culture.");
      return;
    }
    setSaving(true);
    try {
      const currentYear = new Date().getFullYear();
      const seasonName = `Campagne ${currentYear} — ${crop.name} (${area} ha)`;

      const newPlan: SavedCropPlan = {
        id: "plan-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
        seasonName,
        cropId: crop.id,
        cropName: crop.name,
        variety: crop.variety,
        areaHa: area,
        parcelName: parcel?.name || `Superficie directe (${area} ha)`,
        climateZoneName: activeClimateZone?.name || "Zone nationale",
        climateCoeff,
        expectedYieldKg: expectedYield,
        expectedRevenue,
        totalBudget,
        profit,
        roi,
        breakEvenKg,
        plantCount,
        inputRows: [...inputRows],
        phaseRows: [...phaseRows],
        yieldOverride,
        priceOverride,
        notes: `Zone: ${activeClimateZone?.name} (Coeff ${climateCoeff}). Superficie: ${area} ha.`,
      };

      // 1. Sauvegarde locale garantie immédiate
      const updated = [newPlan, ...savedPlans.filter(p => p.id !== newPlan.id)];
      setSavedPlans(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));

      // 2. Synchronisation Supabase en tâche de fond (best-effort)
      if (user) {
        try {
          let targetParcelId = parcel?.id;
          if (!targetParcelId) {
            const { data: existingFarm } = await supabase
              .from("farms")
              .select("id")
              .eq("user_id", user.id)
              .limit(1)
              .maybeSingle();

            let farmId = existingFarm?.id;
            if (!farmId) {
              const { data: newFarm } = await supabase
                .from("farms")
                .insert({ user_id: user.id, name: "Mon Exploitation" })
                .select("id")
                .single();
              farmId = newFarm?.id;
            }

            if (farmId) {
              const { data: newParcel } = await supabase
                .from("parcels")
                .insert({
                  farm_id: farmId,
                  name: `Parcelle ${crop.name} (${area} ha)`,
                  area_ha: area,
                })
                .select("id")
                .single();
              targetParcelId = newParcel?.id;
            }
          }

          if (targetParcelId) {
            const { data: cycleData } = await supabase
              .from("crop_cycles")
              .insert({
                parcel_id: targetParcelId,
                crop_reference_id: crop.id.length > 20 ? crop.id : null,
                season: seasonName,
                start_date: new Date().toISOString().split("T")[0],
                expected_yield_kg: expectedYield,
                expected_revenue: expectedRevenue,
                status: "planning",
                notes: newPlan.notes,
              })
              .select()
              .single();

            if (cycleData?.id) {
              await supabase.from("investment_plans").insert({
                crop_cycle_id: cycleData.id,
                total_input_cost: totalInputCost,
                total_labor_cost: totalLabourCost,
                total_equipment_cost: 0,
                total_transport_cost: 0,
                total_investment: totalBudget,
                expected_revenue: expectedRevenue,
                expected_roi_percent: roi,
                break_even_yield_kg: breakEvenKg,
              });

              if (inputRows.length > 0) {
                const inputInserts = inputRows.map(i => ({
                  crop_cycle_id: cycleData.id,
                  input_name: i.name,
                  quantity_per_ha: area > 0 ? Math.round((i.totalQty / area) * 100) / 100 : i.totalQty,
                  total_quantity: i.totalQty,
                  unit: i.unit,
                  unit_price: i.unitPrice,
                  total_cost: Math.round(i.totalQty * i.unitPrice),
                }));
                await supabase.from("crop_cycle_inputs").insert(inputInserts);
              }
            }
          }
        } catch (syncErr) {
          console.warn("Synchronisation distante (non-bloquante) :", syncErr);
        }
      }

      toast.success(`Campagne « ${seasonName} » enregistrée dans « Mes Campagnes Planifiées » !`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  // Recharger une campagne sauvegardée dans le simulateur
  const handleReloadPlan = (plan: SavedCropPlan) => {
    setSelectedCrop(plan.cropId);
    setManualArea(plan.areaHa.toString());
    setInputRows(plan.inputRows || []);
    setPhaseRows(plan.phaseRows || []);
    setYieldOverride(plan.yieldOverride || "");
    setPriceOverride(plan.priceOverride || "");
    setActiveTab("simulateur");
    toast.success(`Campagne « ${plan.seasonName} » rechargée dans le simulateur !`);
  };

  // Supprimer une campagne sauvegardée
  const handleDeletePlan = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm("Voulez-vous supprimer cette planification ?")) return;
    const next = savedPlans.filter(p => p.id !== id);
    setSavedPlans(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    toast.success("Campagne supprimée.");
  };

  // Générateur PDF universel (pour la simulation courante ou un plan sauvegardé)
  const exportPDFFromData = (p: {
    seasonName: string;
    cropName: string;
    variety?: string;
    parcelName?: string;
    areaHa: number;
    climateZoneName?: string;
    climateCoeff?: number;
    expectedYieldKg: number;
    expectedRevenue: number;
    totalBudget: number;
    profit: number;
    roi: number;
    breakEvenKg: number;
    plantCount?: number;
    inputRows: InputRow[];
    phaseRows: PhaseRow[];
    totalInputCost: number;
    totalLabourCost: number;
  }) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`KoobNaaba — Plan de production & Rentabilité`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Titre : ${p.seasonName} | Parcelle: ${p.parcelName || "Direct"} | Superficie: ${p.areaHa} ha`, 14, 26);
    doc.text(`Culture: ${p.cropName}${p.variety ? ` (${p.variety})` : ""} | Zone: ${p.climateZoneName || "Burkina Faso"} (Coeff ${p.climateCoeff || 1.0}×) | Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 32);

    doc.setFontSize(11);
    doc.text(`Rendement estimé: ${fmt(p.expectedYieldKg)} kg`, 14, 42);
    doc.text(`Revenu estimé: ${fmt(p.expectedRevenue)} FCFA`, 14, 48);
    doc.text(`Budget nécessaire: ${fmt(p.totalBudget)} FCFA`, 14, 54);
    doc.text(`Profit potentiel: ${fmt(p.profit)} FCFA (ROI: ${p.roi}%)`, 14, 60);
    doc.text(`Seuil de rentabilité: ${fmt(p.breakEvenKg)} kg`, 14, 66);
    if (p.plantCount && p.plantCount > 0) doc.text(`Nombre de plants / arbres: ${fmt(p.plantCount)}`, 14, 72);

    autoTable(doc, {
      startY: 78,
      head: [["Intrant", "Quantité", "Unité", "Prix unit.", "Coût total (FCFA)"]],
      body: p.inputRows.map(i => [i.name, i.totalQty, i.unit, fmt(i.unitPrice), fmt(i.totalQty * i.unitPrice)]),
      foot: [["", "", "", "TOTAL INTRANTS", fmt(p.totalInputCost)]],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 120, 74] },
    });

    const y1 = (doc as any).lastAutoTable?.finalY || 140;
    autoTable(doc, {
      startY: y1 + 8,
      head: [["Phase de travail", "Jours", "Ouvriers", "Taux/jour", "Coût (FCFA)"]],
      body: p.phaseRows.map(ph => [ph.name, ph.totalDays, ph.workers, fmt(ph.dailyRate), fmt(ph.totalDays * ph.workers * ph.dailyRate)]),
      foot: [["", "", "", "TOTAL MAIN D'ŒUVRE", fmt(p.totalLabourCost)]],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 120, 74] },
    });

    doc.save(`plan_production_${p.cropName}_${p.areaHa}ha.pdf`);
    toast.success("Fichier PDF exporté avec succès !");
  };

  const exportCurrentPDF = () => {
    if (!hasResult) return;
    exportPDFFromData({
      seasonName: `Campagne ${new Date().getFullYear()} (${crop.name})`,
      cropName: crop.name,
      variety: crop.variety,
      parcelName: parcel?.name || "Mode direct (superficie manuelle)",
      areaHa: area,
      climateZoneName: activeClimateZone?.name,
      climateCoeff,
      expectedYieldKg: expectedYield,
      expectedRevenue,
      totalBudget,
      profit,
      roi,
      breakEvenKg,
      plantCount,
      inputRows,
      phaseRows,
      totalInputCost,
      totalLabourCost,
    });
  };

  if (loading) return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-2.5">
              <Calculator className="h-7 w-7 text-primary" />
              Planification & Calcul Agronomique
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Simulateur de rentabilité, rendements climatiques, besoins en intrants et suivi de vos campagnes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TabsList className="bg-muted p-1">
              <TabsTrigger value="simulateur" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Simulateur & Calcul
              </TabsTrigger>
              <TabsTrigger value="mes-campagnes" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Mes Campagnes
                {savedPlans.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[11px] px-1.5 py-0">
                    {savedPlans.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <Button asChild variant="secondary" className="border shadow-xs">
              <Link to="/dashboard/services">
                <ClipboardList className="h-4 w-4 mr-2 text-primary" />
                Services Experts
              </Link>
            </Button>
          </div>
        </div>

        {/* ONGLET 1 : SIMULATEUR & CALCUL AGRONOMIQUE */}
        <TabsContent value="simulateur" className="space-y-6">
          <div className="flex justify-end gap-2">
            {hasResult && (
              <>
                <Button onClick={savePlanToDatabase} disabled={saving} className="gradient-primary text-primary-foreground font-semibold">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Enregistrement..." : "Enregistrer la campagne"}
                </Button>
                <Button onClick={exportCurrentPDF} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Exporter PDF
                </Button>
              </>
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Paramètres de la parcelle & Agro-climatologie</CardTitle>
              <CardDescription>Configurez la parcelle, la culture et la zone agro-climatique du Burkina Faso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Parcelle {parcels.length === 0 && <span className="text-xs text-muted-foreground font-normal">(Optionnel)</span>}</Label>
                  <Select
                    value={selectedParcel || "manuel"}
                    onValueChange={(val) => setSelectedParcel(val === "manuel" ? "" : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Mode direct (superficie libre)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manuel">
                        Mode direct (superficie libre en ha)
                      </SelectItem>
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
                    min="0.1"
                    value={manualArea || (parcel?.calculated_area_ha || parcel?.area_ha || "1")}
                    onChange={e => setManualArea(e.target.value)}
                    placeholder="Superficie en ha"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <CloudSun className="h-4 w-4 text-amber-500" />
                    Zone agro-climatique
                  </Label>
                  <Select value={selectedClimateZoneId} onValueChange={setSelectedClimateZoneId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Zone climatique" />
                    </SelectTrigger>
                    <SelectContent>
                      {climateZones.map(cz => (
                        <SelectItem key={cz.id} value={cz.id}>
                          {cz.name} (Coeff: {cz.climate_coefficient}×)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Badge informatif climat */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md">
                <Badge variant="secondary" className="font-mono">
                  Coeff climat : {climateCoeff}×
                </Badge>
                <span>
                  {activeClimateZone?.description || "Pluviométrie et climat appliqués au rendement."}
                </span>
              </div>

              {hasResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label className="text-xs">Rendement attendu (kg/ha) [Ajusté climat: {climateCoeff}×]</Label>
                    <Input
                      type="number" step="any"
                      value={yieldOverride}
                      onChange={e => setYieldOverride(e.target.value)}
                      placeholder={`Calculé: ${effYieldPerHa} kg/ha`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Prix de vente unitaire (FCFA/kg)</Label>
                    <Input
                      type="number" step="any"
                      value={priceOverride}
                      onChange={e => setPriceOverride(e.target.value)}
                      placeholder={`Suggéré: ${crop?.avg_price_per_kg || 200}`}
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <Button variant="outline" size="sm" onClick={resetToSuggestions} className="w-full">
                      <RotateCcw className="h-4 w-4 mr-1" /> Restaurer les suggestions
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Module spécifique Arboriculture / Arbres fruitiers */}
          {hasResult && (
            <Card className="border-emerald-500/30 bg-emerald-50/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TreePine className="h-5 w-5 text-emerald-600" />
                      Moteur de Densité Fruitière & Vergers (Arboriculture)
                    </CardTitle>
                    <CardDescription>
                      Espacements, trouaison et fertilisation de fond pour manguiers, anacardiers, agrumes, etc.
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={applyOrchardToInputs} className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                    <Plus className="h-4 w-4 mr-1" />
                    Appliquer aux intrants
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Modèle fruitier</Label>
                    <Select
                      value={orchardPresetId}
                      onValueChange={(val) => {
                        setOrchardPresetId(val);
                        const p = FRUIT_TREE_PRESETS.find(x => x.id === val);
                        if (p) {
                          setOrchardPattern(p.defaultPattern);
                          setRowSpacingM(p.defaultRowSpacingM);
                          setPlantSpacingM(p.defaultPlantSpacingM);
                          setManurePerHoleKg(p.defaultHoleManureKg);
                          setNpkPerHoleG(p.defaultHoleNpkG);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FRUIT_TREE_PRESETS.map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Disposition</Label>
                    <Select value={orchardPattern} onValueChange={(val: any) => setOrchardPattern(val)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carre" className="text-xs">Carré (D × D)</SelectItem>
                        <SelectItem value="rectangle" className="text-xs">Rectangle (D1 × D2)</SelectItem>
                        <SelectItem value="quinconce" className="text-xs">Quinconce (+15% densité)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Interligne (m)</Label>
                    <Input type="number" step="0.5" min="1" value={rowSpacingM} onChange={e => setRowSpacingM(numv(e.target.value))} className="h-8 text-xs" />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Interplant (m)</Label>
                    <Input type="number" step="0.5" min="1" value={plantSpacingM} onChange={e => setPlantSpacingM(numv(e.target.value))} className="h-8 text-xs" />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Fumure / trou (kg)</Label>
                    <Input type="number" step="1" min="0" value={manurePerHoleKg} onChange={e => setManurePerHoleKg(numv(e.target.value))} className="h-8 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-muted/40 rounded-lg text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Densité d'arbres</p>
                    <p className="text-lg font-bold text-emerald-700">{orchardPlan.treeDensityPerHa} / ha</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total arbres à planter</p>
                    <p className="text-lg font-bold text-emerald-700">{fmt(orchardPlan.totalTrees)} plants</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Trous de plantation</p>
                    <p className="text-lg font-bold">{fmt(orchardPlan.totalTrees)} trous</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fumure organique totale</p>
                    <p className="text-lg font-bold text-amber-700">{orchardPlan.totalManureTonnes} t <span className="text-xs font-normal">({fmt(orchardPlan.totalManureKg)} kg)</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Engrais NPK de fond</p>
                    <p className="text-lg font-bold text-blue-700">{fmt(orchardPlan.totalNpkKg)} kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cartes KPI de synthèse */}
          {hasResult && (
            <>
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                <Card className="border-primary/20">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Superficie</CardTitle>
                    <Sprout className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-heading font-bold">{area} <span className="text-sm font-normal">ha</span></p>
                    {parcel?.calculated_area_ha && <p className="text-[10px] text-primary font-medium">📍 Polygone GPS</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Rendement estimé</CardTitle>
                    <Wheat className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-heading font-bold">{fmt(expectedYield)} <span className="text-sm font-normal">kg</span></p>
                    <p className="text-[10px] text-muted-foreground">({fmt(effYieldPerHa)} kg/ha)</p>
                  </CardContent>
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
                    <CardTitle className="text-xs font-medium text-muted-foreground">Profit potentiel & ROI</CardTitle>
                    <TrendingUp className={`h-4 w-4 ${profit >= 0 ? "text-primary" : "text-destructive"}`} />
                  </CardHeader>
                  <CardContent>
                    <p className={`text-xl font-heading font-bold ${profit >= 0 ? "text-primary" : "text-destructive"}`}>
                      {profit >= 0 ? "+" : ""}{fmt(profit)} <span className="text-sm font-normal">FCFA</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">ROI: <strong>{roi}%</strong> · Seuil: {fmt(breakEvenKg)} kg</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tableaux Intrants & Main-d'œuvre */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-primary" />
                        Intrants & Semences
                      </CardTitle>
                      <CardDescription>Ajustez les doses, engrais et prix selon vos achats</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={addInput}>
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {inputRows.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">Aucun intrant — cliquez sur « Ajouter »</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Intrant</TableHead>
                              <TableHead className="text-right">Quantité</TableHead>
                              <TableHead>Unité</TableHead>
                              <TableHead className="text-right">Prix unit.</TableHead>
                              <TableHead className="text-right">Coût</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inputRows.map((i, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <Input value={i.name} onChange={e => updateInput(idx, { name: e.target.value })} className="h-8" />
                                </TableCell>
                                <TableCell>
                                  <Input type="number" step="any" value={i.totalQty}
                                    onChange={e => updateInput(idx, { totalQty: numv(e.target.value) })} className="h-8 w-24 text-right" />
                                </TableCell>
                                <TableCell>
                                  <Input value={i.unit} onChange={e => updateInput(idx, { unit: e.target.value })} className="h-8 w-16" />
                                </TableCell>
                                <TableCell>
                                  <Input type="number" step="any" value={i.unitPrice}
                                    onChange={e => updateInput(idx, { unitPrice: numv(e.target.value) })} className="h-8 w-24 text-right" />
                                </TableCell>
                                <TableCell className="text-right font-bold whitespace-nowrap">{fmt(i.totalQty * i.unitPrice)}</TableCell>
                                <TableCell>
                                  <Button size="icon" variant="ghost" onClick={() => removeInput(idx)} className="h-7 w-7">
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 font-bold">
                              <TableCell colSpan={4}>Total intrants</TableCell>
                              <TableCell className="text-right">{fmt(totalInputCost)} FCFA</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-secondary" />
                        Main d'œuvre & Travaux
                      </CardTitle>
                      <CardDescription>Planification des journées de travail et ouvriers par phase</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={addPhase}>
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Phase</TableHead>
                            <TableHead className="text-right">Jours</TableHead>
                            <TableHead className="text-right">Ouvriers</TableHead>
                            <TableHead className="text-right">Taux/jour</TableHead>
                            <TableHead className="text-right">Coût</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {phaseRows.map((p, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Input value={p.name} onChange={e => updatePhase(idx, { name: e.target.value })} className="h-8" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" step="any" value={p.totalDays}
                                  onChange={e => updatePhase(idx, { totalDays: numv(e.target.value) })} className="h-8 w-20 text-right" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" step="1" min="1" value={p.workers}
                                  onChange={e => updatePhase(idx, { workers: numv(e.target.value) })} className="h-8 w-20 text-right" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" step="any" value={p.dailyRate}
                                  onChange={e => updatePhase(idx, { dailyRate: numv(e.target.value) })} className="h-8 w-24 text-right" />
                              </TableCell>
                              <TableCell className="text-right font-bold whitespace-nowrap">{fmt(p.totalDays * p.workers * p.dailyRate)}</TableCell>
                              <TableCell>
                                <Button size="icon" variant="ghost" onClick={() => removePhase(idx)} className="h-7 w-7">
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-muted/50 font-bold">
                            <TableCell colSpan={2}>Total main d'œuvre</TableCell>
                            <TableCell className="text-right">{fmt(totalLabourDays)} j·h</TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right">{fmt(totalLabourCost)} FCFA</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Récapitulatif Budgétaire */}
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg">Récapitulatif budgétaire & Actions</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={savePlanToDatabase} disabled={saving} className="gradient-primary text-primary-foreground" size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      {saving ? "Enregistrement..." : "Enregistrer la campagne"}
                    </Button>
                    <Button onClick={exportCurrentPDF} size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-1" /> Exporter PDF
                    </Button>
                  </div>
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
                      <p className="text-muted-foreground">Budget total prévisionnel</p>
                      <p className="text-lg font-bold text-destructive">{fmt(totalBudget)} FCFA</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Profit prévisionnel</p>
                      <p className={`text-lg font-bold ${profit >= 0 ? "text-primary" : "text-destructive"}`}>
                        {profit >= 0 ? "+" : ""}{fmt(profit)} FCFA
                      </p>
                    </div>
                  </div>
                  {plantCount > 0 && (
                    <>
                      <Separator className="my-4" />
                      <p className="text-sm text-muted-foreground">
                        <strong>{fmt(plantCount)}</strong> plants/arbres · Durée estimée : <strong>{crop.growth_duration_days || "—"}</strong> jours ·
                        Seuil de rentabilité : <strong>{fmt(breakEvenKg)} kg</strong> · ROI estimé : <strong>{roi}%</strong>
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ONGLET 2 : MES CAMPAGNES PLANIFIÉES */}
        <TabsContent value="mes-campagnes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-heading font-semibold">Campagnes et Cycles enregistrés</h2>
              <p className="text-xs text-muted-foreground">
                Consultez, rechargez dans le simulateur ou téléchargez les fiches PDF de vos campagnes passées et prévisionnelles.
              </p>
            </div>
            <Button size="sm" onClick={() => setActiveTab("simulateur")} className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1.5" />
              Nouvelle planification
            </Button>
          </div>

          {savedPlans.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-3">
                <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                <h3 className="font-semibold text-foreground">Aucune campagne enregistrée pour le moment</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Utilisez le simulateur pour concevoir votre premier itinéraire cultural, estimer vos intrants et sauvegarder votre campagne.
                </p>
                <Button size="sm" onClick={() => setActiveTab("simulateur")}>
                  Ouvrir le simulateur
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedPlans.map((plan) => (
                <Card key={plan.id} className="shadow-xs hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <CardTitle className="text-base font-bold text-foreground">
                            {plan.seasonName}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                            {plan.cropName} {plan.variety ? `(${plan.variety})` : ""}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {plan.areaHa} hectare(s) · {plan.parcelName || "Direct"} · {plan.climateZoneName}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-[11px] shrink-0">
                        {new Date(plan.createdAt).toLocaleDateString("fr-FR")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-muted/40 text-center text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Rendement</span>
                        <span className="font-bold text-foreground">{fmt(plan.expectedYieldKg)} kg</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Budget</span>
                        <span className="font-bold text-destructive">{fmt(plan.totalBudget)} F</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Bénéfice estimé</span>
                        <span className={`font-bold ${plan.profit >= 0 ? "text-primary" : "text-destructive"}`}>
                          {plan.profit >= 0 ? "+" : ""}{fmt(plan.profit)} F
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>ROI prévisionnel : <strong className="text-foreground">{plan.roi}%</strong></span>
                      <span>Seuil rentabilité : <strong className="text-foreground">{fmt(plan.breakEvenKg)} kg</strong></span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between pt-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleReloadPlan(plan)}
                        className="text-xs"
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Recharger dans le simulateur
                      </Button>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportPDFFromData({
                            seasonName: plan.seasonName,
                            cropName: plan.cropName,
                            variety: plan.variety,
                            parcelName: plan.parcelName,
                            areaHa: plan.areaHa,
                            climateZoneName: plan.climateZoneName,
                            climateCoeff: plan.climateCoeff,
                            expectedYieldKg: plan.expectedYieldKg,
                            expectedRevenue: plan.expectedRevenue,
                            totalBudget: plan.totalBudget,
                            profit: plan.profit,
                            roi: plan.roi,
                            breakEvenKg: plan.breakEvenKg,
                            plantCount: plan.plantCount,
                            inputRows: plan.inputRows || [],
                            phaseRows: plan.phaseRows || [],
                            totalInputCost: (plan.inputRows || []).reduce((s, i) => s + i.totalQty * i.unitPrice, 0),
                            totalLabourCost: (plan.phaseRows || []).reduce((s, p) => s + p.totalDays * p.workers * p.dailyRate, 0),
                          })}
                          className="text-xs"
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          PDF
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleDeletePlan(plan.id, e)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Supprimer la planification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CropPlanningPage;
