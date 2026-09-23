/**
 * Moteur de calcul agronomique pour NAFA - AGRITECH: Farm Forward
 * Adapté aux réalités agricoles et climatiques du Burkina Faso et de l'Afrique de l'Ouest.
 */

export type PlantingPattern = 'carre' | 'rectangle' | 'quinconce';

export interface FruitTreePreset {
  id: string;
  name: string;
  scientificName: string;
  category: 'fruitier' | 'anacarde' | 'autre';
  defaultPattern: PlantingPattern;
  defaultRowSpacingM: number;
  defaultPlantSpacingM: number;
  defaultHoleManureKg: number;
  defaultHoleNpkG: number;
  avgYieldPerTreeKg: number;
  avgPricePerKg: number;
  yearsToFirstHarvest: number;
  fullProductionYear: number;
}

export const FRUIT_TREE_PRESETS: FruitTreePreset[] = [
  {
    id: 'manguier_greffe',
    name: 'Manguier greffé (Kent / Amélie / Keitt)',
    scientificName: 'Mangifera indica',
    category: 'fruitier',
    defaultPattern: 'carre',
    defaultRowSpacingM: 10,
    defaultPlantSpacingM: 10,
    defaultHoleManureKg: 20,
    defaultHoleNpkG: 250,
    avgYieldPerTreeKg: 80,
    avgPricePerKg: 150,
    yearsToFirstHarvest: 3,
    fullProductionYear: 7,
  },
  {
    id: 'anacardier',
    name: 'Anacardier (Pomme cajou / Noix brute)',
    scientificName: 'Anacardium occidentale',
    category: 'anacarde',
    defaultPattern: 'carre',
    defaultRowSpacingM: 10,
    defaultPlantSpacingM: 10,
    defaultHoleManureKg: 15,
    defaultHoleNpkG: 200,
    avgYieldPerTreeKg: 15,
    avgPricePerKg: 450,
    yearsToFirstHarvest: 3,
    fullProductionYear: 6,
  },
  {
    id: 'agrumes',
    name: 'Agrumes (Orangers, Citronniers, Mandariniers)',
    scientificName: 'Citrus spp.',
    category: 'fruitier',
    defaultPattern: 'rectangle',
    defaultRowSpacingM: 7,
    defaultPlantSpacingM: 6,
    defaultHoleManureKg: 20,
    defaultHoleNpkG: 300,
    avgYieldPerTreeKg: 60,
    avgPricePerKg: 250,
    yearsToFirstHarvest: 4,
    fullProductionYear: 8,
  },
  {
    id: 'papayer',
    name: 'Papayer (Solo / Red Lady)',
    scientificName: 'Carica papaya',
    category: 'fruitier',
    defaultPattern: 'rectangle',
    defaultRowSpacingM: 2.5,
    defaultPlantSpacingM: 2.5,
    defaultHoleManureKg: 10,
    defaultHoleNpkG: 150,
    avgYieldPerTreeKg: 30,
    avgPricePerKg: 200,
    yearsToFirstHarvest: 1,
    fullProductionYear: 1,
  },
  {
    id: 'goyavier',
    name: 'Goyavier',
    scientificName: 'Psidium guajava',
    category: 'fruitier',
    defaultPattern: 'carre',
    defaultRowSpacingM: 5,
    defaultPlantSpacingM: 5,
    defaultHoleManureKg: 15,
    defaultHoleNpkG: 200,
    avgYieldPerTreeKg: 40,
    avgPricePerKg: 200,
    yearsToFirstHarvest: 2,
    fullProductionYear: 4,
  },
  {
    id: 'bananier',
    name: 'Bananier plantain / Grande Naine',
    scientificName: 'Musa spp.',
    category: 'fruitier',
    defaultPattern: 'rectangle',
    defaultRowSpacingM: 3,
    defaultPlantSpacingM: 2.5,
    defaultHoleManureKg: 20,
    defaultHoleNpkG: 250,
    avgYieldPerTreeKg: 25,
    avgPricePerKg: 200,
    yearsToFirstHarvest: 1,
    fullProductionYear: 1,
  },
];

export interface ClimateZoneDefinition {
  id: string;
  name: string;
  description: string;
  avgRainfallMm: number;
  avgTempCelsius: number;
  climateCoefficient: number;
}

export const CLIMATE_ZONES_BURKINA: ClimateZoneDefinition[] = [
  {
    id: 'sahel',
    name: 'Zone sahélienne',
    description: 'Nord (Dori, Gorom-Gorom, Djibo) — pluviométrie < 600 mm/an',
    avgRainfallMm: 400,
    avgTempCelsius: 30,
    climateCoefficient: 0.6,
  },
  {
    id: 'soudano_sahelien',
    name: 'Zone soudano-sahélienne',
    description: 'Centre / Nord (Ouagadougou, Koudougou, Kaya, Ouahigouya) — 600-900 mm/an',
    avgRainfallMm: 700,
    avgTempCelsius: 28,
    climateCoefficient: 0.8,
  },
  {
    id: 'soudanien',
    name: 'Zone soudanienne',
    description: 'Ouest / Sud (Bobo-Dioulasso, Dédougou, Koupéla) — 900-1100 mm/an',
    avgRainfallMm: 1000,
    avgTempCelsius: 27,
    climateCoefficient: 1.0,
  },
  {
    id: 'soudano_guineen',
    name: 'Zone soudano-guinéenne',
    description: 'Sud-Ouest (Banfora, Gaoua, Cascades) — pluviométrie > 1100 mm/an',
    avgRainfallMm: 1200,
    avgTempCelsius: 26,
    climateCoefficient: 1.1,
  },
];

/**
 * Calcul de la densité des arbres (arbres/ha) selon l'espacement et la disposition
 */
export function calculateTreeDensity(
  rowSpacingM: number,
  plantSpacingM: number,
  pattern: PlantingPattern = 'carre'
): number {
  if (rowSpacingM <= 0 || plantSpacingM <= 0) return 0;

  // Surface unitaire en m² : 1 ha = 10 000 m²
  if (pattern === 'quinconce') {
    // En quinconce (triangle équilatéral ou isocèle), le gain d'occupation est d'environ 15.5% :
    // hauteur entre rangs = rowSpacing * sin(60°) = rowSpacing * 0.866025
    const rowHeight = rowSpacingM * (Math.sqrt(3) / 2);
    return Math.round(10000 / (rowHeight * plantSpacingM));
  }

  // Carré ou rectangle
  return Math.round(10000 / (rowSpacingM * plantSpacingM));
}

export interface TreeOrchardProjection {
  treeDensityPerHa: number;
  totalTrees: number;
  totalManureKg: number;
  totalManureTonnes: number;
  totalNpkKg: number;
  annualYieldKg: number;
  annualRevenueFcfa: number;
}

/**
 * Calcule les besoins complets d'un verger arboricole (arbres, trouaison, fertilisation, rendement)
 */
export function calculateOrchardPlan(params: {
  areaHa: number;
  rowSpacingM: number;
  plantSpacingM: number;
  pattern: PlantingPattern;
  manurePerHoleKg: number;
  npkPerHoleG: number;
  avgYieldPerTreeKg: number;
  pricePerKg: number;
  climateCoefficient?: number;
}): TreeOrchardProjection {
  const {
    areaHa,
    rowSpacingM,
    plantSpacingM,
    pattern,
    manurePerHoleKg,
    npkPerHoleG,
    avgYieldPerTreeKg,
    pricePerKg,
    climateCoefficient = 1.0,
  } = params;

  if (areaHa <= 0) {
    return {
      treeDensityPerHa: 0,
      totalTrees: 0,
      totalManureKg: 0,
      totalManureTonnes: 0,
      totalNpkKg: 0,
      annualYieldKg: 0,
      annualRevenueFcfa: 0,
    };
  }

  const treeDensityPerHa = calculateTreeDensity(rowSpacingM, plantSpacingM, pattern);
  const totalTrees = Math.round(treeDensityPerHa * areaHa);
  const totalManureKg = totalTrees * (manurePerHoleKg || 0);
  const totalManureTonnes = Math.round((totalManureKg / 1000) * 10) / 10;
  const totalNpkKg = Math.round((totalTrees * (npkPerHoleG || 0)) / 1000);

  // Rendement annuel ajusté au coefficient climatique
  const annualYieldKg = Math.round(totalTrees * avgYieldPerTreeKg * climateCoefficient);
  const annualRevenueFcfa = Math.round(annualYieldKg * pricePerKg);

  return {
    treeDensityPerHa,
    totalTrees,
    totalManureKg,
    totalManureTonnes,
    totalNpkKg,
    annualYieldKg,
    annualRevenueFcfa,
  };
}

export interface CropYieldProjection {
  effectiveYieldPerHa: number;
  expectedYieldKg: number;
  expectedRevenueFcfa: number;
  plantCount: number;
}

/**
 * Calcul de la projection de rendement selon la règle métier :
 * Estimation rendement = surface × moyenne culture × coefficient climat
 */
export function calculateCropYield(params: {
  areaHa: number;
  baseYieldPerHa: number;
  pricePerKg: number;
  climateCoefficient?: number;
  plantsPerHa?: number;
}): CropYieldProjection {
  const {
    areaHa,
    baseYieldPerHa,
    pricePerKg,
    climateCoefficient = 1.0,
    plantsPerHa = 0,
  } = params;

  if (areaHa <= 0) {
    return {
      effectiveYieldPerHa: 0,
      expectedYieldKg: 0,
      expectedRevenueFcfa: 0,
      plantCount: 0,
    };
  }

  const effectiveYieldPerHa = Math.round(baseYieldPerHa * climateCoefficient);
  const expectedYieldKg = Math.round(areaHa * effectiveYieldPerHa);
  const expectedRevenueFcfa = Math.round(expectedYieldKg * pricePerKg);
  const plantCount = Math.round(plantsPerHa * areaHa);

  return {
    effectiveYieldPerHa,
    expectedYieldKg,
    expectedRevenueFcfa,
    plantCount,
  };
}

export interface FinancialPlanSummary {
  totalInputCost: number;
  totalLaborCost: number;
  totalEquipmentCost: number;
  totalTransportCost: number;
  totalInvestment: number;
  expectedRevenue: number;
  netProfit: number;
  roiPercent: number;
  breakEvenYieldKg: number;
}

/**
 * Calcul financier complet (Budget, Profit, ROI, Seuil de rentabilité)
 */
export function calculateFinancialPlan(params: {
  totalInputCost: number;
  totalLaborCost: number;
  totalEquipmentCost?: number;
  totalTransportCost?: number;
  expectedRevenue: number;
  pricePerKg: number;
}): FinancialPlanSummary {
  const {
    totalInputCost,
    totalLaborCost,
    totalEquipmentCost = 0,
    totalTransportCost = 0,
    expectedRevenue,
    pricePerKg,
  } = params;

  const totalInvestment = Math.round(
    totalInputCost + totalLaborCost + totalEquipmentCost + totalTransportCost
  );
  const netProfit = Math.round(expectedRevenue - totalInvestment);
  const roiPercent =
    totalInvestment > 0
      ? Math.round(((expectedRevenue - totalInvestment) / totalInvestment) * 10000) / 100
      : 0;

  const breakEvenYieldKg =
    pricePerKg > 0 ? Math.round(totalInvestment / pricePerKg) : 0;

  return {
    totalInputCost,
    totalLaborCost,
    totalEquipmentCost,
    totalTransportCost,
    totalInvestment,
    expectedRevenue,
    netProfit,
    roiPercent,
    breakEvenYieldKg,
  };
}
