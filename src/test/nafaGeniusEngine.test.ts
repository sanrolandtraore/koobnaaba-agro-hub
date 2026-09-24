import { describe, it, expect } from "vitest";
import {
  calculateGeodesicArea,
  calculateGeodesicPerimeter,
  analyzeGeodesicSurvey,
  calculateHazenWilliamsHeadLoss,
  calculateFaoIrrigation,
  calculatePoultryHousing,
  generateFarmZoning,
  generateEngineeringQuote,
  certifyIrrigationDesign,
  certifyPoultryHousing,
  certifyEngineeringQuote,
  FAO_SAHEL_CROPS,
  GeoPoint,
} from "@/lib/nafaGeniusEngine";

import {
  detectLanguage,
  parseGeniusCommand,
  executeGeniusAction,
} from "@/lib/nafaGeniusNlu";

import {
  AGRONOMIC_KNOWLEDGE_VERSION,
  REGIONAL_CALIBRATIONS,
  applyRegionalCalibration,
} from "@/lib/nafaGeniusLearning";

describe("NAFA Genius IA - Moteur d'Ingénierie Agronomique & Hydraulique", () => {
  // Polygone réel de test (Parcelle Bama ~ 2.4 hectares)
  const bamaPoints: GeoPoint[] = [
    { lat: 11.391245, lng: -4.412154, alt: 312.4, label: "B1" },
    { lat: 11.391320, lng: -4.410310, alt: 312.0, label: "B2" },
    { lat: 11.389950, lng: -4.410220, alt: 310.8, label: "B3" },
    { lat: 11.389880, lng: -4.412080, alt: 311.2, label: "B4" },
  ];

  it("calcule avec exactitude la surface géodésique Gauss et le périmètre WGS84", () => {
    const areaM2 = calculateGeodesicArea(bamaPoints);
    const perimeterM = calculateGeodesicPerimeter(bamaPoints);

    expect(areaM2).toBeGreaterThan(28000); // ~3.08 ha
    expect(areaM2).toBeLessThan(33000);
    expect(perimeterM).toBeGreaterThan(500);
    expect(perimeterM).toBeLessThan(750);
  });

  it("génère l'analyse topographique complète avec dénivelé et centroïde", () => {
    const survey = analyzeGeodesicSurvey(bamaPoints);

    expect(survey.areaHa).toBeCloseTo(3.08, 1);
    expect(survey.elevation.deltaAlt).toBeCloseTo(1.6, 1);
    expect(survey.elevation.averageSlopePct).toBeGreaterThanOrEqual(0);
    expect(survey.centroid.lat).toBeCloseTo(11.39, 2);
    expect(survey.centroid.lng).toBeCloseTo(-4.41, 2);
    expect(survey.isClosed).toBe(true);
  });

  it("calcule les pertes de charge Hazen-Williams selon les normes hydrauliques", () => {
    // Débit de 10 m³/h dans un tuyau PEHD Ø50 mm (diamètre intérieur ~44mm) sur 100m
    const loss = calculateHazenWilliamsHeadLoss(10, 44, 100, 145);

    expect(loss.headLossM).toBeGreaterThan(0.5);
    expect(loss.headLossM).toBeLessThan(10.0);
    expect(loss.velocityMs).toBeGreaterThan(1.0); // Conforme aux normes 1.0 - 1.8 m/s
    expect(loss.velocityMs).toBeLessThan(2.5);
  });

  it("dimensionne un réseau d'irrigation goutte-à-goutte FAO-56 et pompage solaire", () => {
    const design = calculateFaoIrrigation({
      areaHa: 2.0,
      cropKey: "tomate",
      season: "saison_seche_chaude",
      boreholeDepthM: 60,
      waterTableDepthM: 35,
    });

    expect(design.dailyEtoMm).toBe(7.2);
    expect(design.kcUsed).toBe(FAO_SAHEL_CROPS.tomate.kcMid); // 1.15
    expect(design.dailyGrossMm).toBeGreaterThan(9.0);
    expect(design.dailyVolumeM3).toBeGreaterThan(150); // ~180 m³/jour pour 2ha
    expect(design.mainPipeDiameterMm).toBeGreaterThanOrEqual(63);
    expect(design.totalHeadHmtM).toBeGreaterThan(45);
    expect(design.hydraulicPowerKw).toBeGreaterThan(1.5);
    expect(design.recommendedPanelsCount).toBeGreaterThanOrEqual(4);
    expect(design.billOfMaterials.length).toBeGreaterThanOrEqual(5);
    expect(design.totalEquipmentCostFcfa).toBeGreaterThan(2000000);
  });

  it("calcule l'architecture avicole bioclimatique selon les normes sahéliennes", () => {
    const poultry = calculatePoultryHousing({
      birdType: "poulet_chair",
      flockSize: 2000,
    });

    // 2000 sujets à 9 sujets/m² => ~223 m²
    expect(poultry.floorAreaM2).toBeGreaterThanOrEqual(220);
    expect(poultry.floorAreaM2).toBeLessThanOrEqual(230);
    expect(poultry.widthM).toBeLessThanOrEqual(10); // Largeur max pour ventilation naturelle
    expect(poultry.ridgeHeightM).toBe(4.0); // Effet cheminée thermosiphon
    expect(poultry.eaveHeightM).toBe(2.8);
    expect(poultry.overhangM).toBeGreaterThanOrEqual(1.0); // Débord toiture anti-insolation
    expect(poultry.orientationDegrees).toBe(90); // Axe Est-Ouest
    expect(poultry.feedersCount).toBeGreaterThanOrEqual(70);
    expect(poultry.drinkersCount).toBeGreaterThanOrEqual(70);
    expect(poultry.billOfMaterials.length).toBeGreaterThanOrEqual(6);
  });

  it("génère un plan de zonage intelligent et un devis certifié en FCFA", () => {
    const survey = analyzeGeodesicSurvey(bamaPoints);
    const zoning = generateFarmZoning(survey, "Projet Agro-Pastoral Bama", "Issa Ouédraogo", {
      includePoultry: true,
      poultryFlockSize: 2000,
      cropType: "tomate",
    });

    expect(zoning.items.some((i) => i.type === "borehole")).toBe(true);
    expect(zoning.items.some((i) => i.type === "water_tower")).toBe(true);
    expect(zoning.items.some((i) => i.type === "solar_array")).toBe(true);
    expect(zoning.items.some((i) => i.type === "poultry_house")).toBe(true);
    expect(zoning.items.some((i) => i.type === "crop_plot")).toBe(true);

    const quote = generateEngineeringQuote(
      "Issa Ouédraogo",
      "+226 75 77 48 52",
      "Bama, Burkina Faso",
      "Ingénieur Agronome NAFA",
      "Aménagement Global 2.4 ha",
      [
        {
          code: "TEST-01",
          category: "pompage_solaire",
          designation: "Système de pompage solaire",
          specifications: "Pompe inox 3kW",
          unit: "kit",
          quantity: 1,
          unitPriceFcfa: 2500000,
          totalPriceFcfa: 2500000,
        },
      ]
    );

    expect(quote.quoteNumber).toMatch(/^DEV-NAFA-\d{4}-\d+/);
    expect(quote.subtotalEquipmentFcfa).toBe(2500000);
    expect(quote.laborCostFcfa).toBe(350000); // 14%
    expect(quote.logisticsCostFcfa).toBe(125000); // 5%
    expect(quote.contingenciesFcfa).toBe(100000); // 4%
    expect(quote.totalCostFcfa).toBe(3075000);
    expect(quote.paymentTerms.advancePaymentPct).toBe(50);
  });
});

describe("NAFA Genius IA - NLU Multilingue & Actions", () => {
  it("détecte correctement les langues nationales du Burkina Faso", () => {
    expect(detectLanguage("Bonjour, peux-tu m'aider pour ma visite ?")).toBe("fr");
    expect(detectLanguage("I ni ce, n bɛ fɛ ka seneforo jii koo jate")).toBe("dyu");
    expect(detectLanguage("Ne y windiga, mam rata n maana kaogo kambre")).toBe("mos");
    expect(detectLanguage("Jam waali, mi yidi hiisoto ndiyam ngesa")).toBe("ful");
  });

  it("reconnaît l'intention de création de visite et extrait le client", () => {
    const parsed = parseGeniusCommand("Crée une nouvelle visite pour le producteur Issa Ouédraogo");

    expect(parsed.intent).toBe("CREATE_VISIT");
    expect(parsed.entities.clientName).toContain("Issa");
    expect(parsed.actionRequired).toBe(true);
  });

  it("reconnaît l'intention de calcul d'irrigation et extrait la superficie", () => {
    const parsed = parseGeniusCommand("Calcule l'irrigation goutte-à-goutte pour 3.5 hectares de tomate");

    expect(parsed.intent).toBe("CALCULATE_IRRIGATION");
    expect(parsed.entities.areaHa).toBe(3.5);
    expect(parsed.entities.crop).toBe("tomate");
  });

  it("reconnaît les commandes en Dioula et Mooré", () => {
    const dyuParsed = parseGeniusCommand("A ni ce, ka wari jate kɛ sise so koo la");
    expect(dyuParsed.language).toBe("dyu");

    const mosParsed = parseGeniusCommand("Ne y windiga, kooma yelle pugo 2 ha");
    expect(mosParsed.language).toBe("mos");
  });

  it("signale et refuse d'exécuter une instruction non reconnue avec certitude (Règle stricte Zéro Hallucination)", async () => {
    // Instruction non reconnue / ambiguë sans référentiel agronomique certifié
    const unrec = parseGeniusCommand("construis moi un truc bizarre avec 1000 objets");

    expect(unrec.isRecognized).toBe(false);
    expect(unrec.requiresExpertValidation).toBe(true);
    expect(unrec.confidence).toBeLessThan(0.5);
    expect(unrec.explanation).toContain("INSTRUCTION NON RECONNUE AVEC CERTITUDE");
    expect(unrec.actionRequired).toBe(false);

    // Refus d'exécution
    const result = await executeGeniusAction(unrec);
    expect(result.success).toBe(false);
    expect(result.data.isRecognized).toBe(false);
  });
});

describe("NAFA Genius IA - Vérité Réelle & Certification Expert de Terrain", () => {
  it("associe systématiquement les sources de vérité réelles aux calculs", () => {
    const ir = calculateFaoIrrigation({
      areaHa: 1.0,
      cropKey: "tomate",
    });
    expect(ir.groundTruthSource).toContain("INERA");
    expect(ir.groundTruthSource).toContain("FAO-56");

    const poultry = calculatePoultryHousing({
      birdType: "poulet_chair",
      flockSize: 1000,
    });
    expect(poultry.groundTruthSource).toContain("MRAH");
    expect(poultry.groundTruthSource).toContain("CIRAD/INERA");

    const quote = generateEngineeringQuote(
      "Test Client",
      "+226 70 00 00 00",
      "Koudougou",
      "Dr. Sawadogo",
      "Projet Test",
      ir.billOfMaterials
    );
    expect(quote.groundTruthSource).toContain("Mercuriale");
  });

  it("permet à l'expert d'ajuster avec des mesures de terrain et de certifier le calcul d'irrigation", () => {
    const ir = calculateFaoIrrigation({
      areaHa: 2.0,
      cropKey: "tomate",
      waterTableDepthM: 35,
    });
    expect(ir.expertCertified).toBeUndefined();

    // L'expert apporte le débit réel mesuré au pompage d'essai et certifie
    const certified = certifyIrrigationDesign(
      ir,
      "Dr. Oumarou Sawadogo (Ingénieur Rural)",
      "Essai de pompage certifié in-situ avec niveau dynamique stable à 40m",
      {
        measuredBoreholeYieldM3h: 15,
        dynamicWaterLevelM: 40,
      }
    );

    expect(certified.expertCertified).toBe(true);
    expect(certified.certifiedBy).toContain("Oumarou Sawadogo");
    expect(certified.requiresExpertValidation).toBe(false);
    expect(certified.expertOverrides?.dynamicWaterLevelM).toBe(40);
    expect(certified.expertNotes).toContain("Essai de pompage");
  });

  it("permet à l'expert de certifier le bâtiment avicole et le devis", () => {
    const poultry = calculatePoultryHousing({
      birdType: "poule_pondeuse",
      flockSize: 1500,
    });
    const certifiedPoultry = certifyPoultryHousing(
      poultry,
      "Dr. Sawadogo (Zootechnicien)",
      "Vérification théodolite axe E-O et maçonnerie conforme"
    );
    expect(certifiedPoultry.expertCertified).toBe(true);
    expect(certifiedPoultry.certifiedBy).toContain("Dr. Sawadogo");

    const quote = generateEngineeringQuote(
      "Test",
      "+226 00",
      "Ouagadougou",
      "Expert",
      "Projet",
      certifiedPoultry.billOfMaterials
    );
    const certifiedQuote = certifyEngineeringQuote(
      quote,
      "Expert Chiffreur NAFA",
      "Prix conformes à la mercuriale Ouagadougou 2024"
    );
    expect(certifiedQuote.expertCertified).toBe(true);
    expect(certifiedQuote.expertNotes).toContain("Ouagadougou");
  });
});

describe("NAFA Genius IA - Apprentissage Continu & Calibration Régionale", () => {
  it("applique les calibrations agrométéorologiques régionales", () => {
    const baseEtc = 6.0;

    // Région du Sahel plus chaude et sèche (évaporation accrue)
    const sahelEtc = applyRegionalCalibration(baseEtc, "nord_sahel");
    expect(sahelEtc).toBeGreaterThan(baseEtc);

    // Région des Hauts-Bassins plus humide
    const hbEtc = applyRegionalCalibration(baseEtc, "hauts_bassins");
    expect(hbEtc).toBeLessThanOrEqual(baseEtc);

    expect(AGRONOMIC_KNOWLEDGE_VERSION).toContain("sahel-inera");
    expect(REGIONAL_CALIBRATIONS.hauts_bassins.waterTableAverageDepthM).toBe(25);
  });
});
