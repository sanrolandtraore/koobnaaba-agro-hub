import { describe, it, expect } from "vitest";
import {
  calculateTreeDensity,
  calculateOrchardPlan,
  calculateCropYield,
  calculateFinancialPlan,
  FRUIT_TREE_PRESETS,
  CLIMATE_ZONES_BURKINA,
} from "../lib/agronomicEngine";

describe("Agronomic Calculation Engine", () => {
  describe("Tree Density Calculations", () => {
    it("calculates square pattern tree density correctly (10x10m = 100 trees/ha)", () => {
      const density = calculateTreeDensity(10, 10, "carre");
      expect(density).toBe(100);
    });

    it("calculates rectangle pattern tree density correctly (7x6m = 238 trees/ha)", () => {
      const density = calculateTreeDensity(7, 6, "rectangle");
      expect(density).toBe(238);
    });

    it("calculates quinconce (quincunx) pattern with higher density (~15% more)", () => {
      const squareDensity = calculateTreeDensity(10, 10, "carre");
      const quinconceDensity = calculateTreeDensity(10, 10, "quinconce");
      expect(quinconceDensity).toBeGreaterThan(squareDensity);
      expect(quinconceDensity).toBe(115); // 10000 / (10 * sin(60°) * 10) = 115.47 -> 115
    });
  });

  describe("Tree Orchard Planning", () => {
    it("calculates full requirements for 2 ha of manguiers", () => {
      const manguier = FRUIT_TREE_PRESETS.find((p) => p.id === "manguier_greffe")!;
      const plan = calculateOrchardPlan({
        areaHa: 2,
        rowSpacingM: manguier.defaultRowSpacingM,
        plantSpacingM: manguier.defaultPlantSpacingM,
        pattern: manguier.defaultPattern,
        manurePerHoleKg: manguier.defaultHoleManureKg,
        npkPerHoleG: manguier.defaultHoleNpkG,
        avgYieldPerTreeKg: manguier.avgYieldPerTreeKg,
        pricePerKg: manguier.avgPricePerKg,
        climateCoefficient: 1.0,
      });

      expect(plan.treeDensityPerHa).toBe(100);
      expect(plan.totalTrees).toBe(200);
      expect(plan.totalManureKg).toBe(4000); // 200 * 20 kg
      expect(plan.totalManureTonnes).toBe(4.0);
      expect(plan.totalNpkKg).toBe(50); // (200 * 250g) / 1000 = 50 kg
      expect(plan.annualYieldKg).toBe(16000); // 200 * 80 kg
      expect(plan.annualRevenueFcfa).toBe(2400000); // 16000 * 150 FCFA
    });

    it("applies climate zone coefficient to orchard yield", () => {
      const sahelCoeff = CLIMATE_ZONES_BURKINA.find((z) => z.id === "sahel")!.climateCoefficient;
      const plan = calculateOrchardPlan({
        areaHa: 1,
        rowSpacingM: 10,
        plantSpacingM: 10,
        pattern: "carre",
        manurePerHoleKg: 20,
        npkPerHoleG: 200,
        avgYieldPerTreeKg: 100,
        pricePerKg: 100,
        climateCoefficient: sahelCoeff, // 0.6
      });

      expect(plan.totalTrees).toBe(100);
      expect(plan.annualYieldKg).toBe(6000); // 100 * 100 * 0.6
      expect(plan.annualRevenueFcfa).toBe(600000);
    });
  });

  describe("Crop Yield and Climate Projections", () => {
    it("calculates yield with rule: surface * moyenne * coefficient climat", () => {
      // Ex: 3 ha de maïs (base: 2500 kg/ha) en zone soudanienne (coeff: 1.0)
      const res = calculateCropYield({
        areaHa: 3,
        baseYieldPerHa: 2500,
        pricePerKg: 150,
        climateCoefficient: 1.0,
        plantsPerHa: 53333,
      });

      expect(res.expectedYieldKg).toBe(7500); // 3 * 2500
      expect(res.expectedRevenueFcfa).toBe(1125000); // 7500 * 150
      expect(res.plantCount).toBe(159999);
    });

    it("reduces yield when in Sahel climate zone (coeff: 0.6)", () => {
      const res = calculateCropYield({
        areaHa: 2,
        baseYieldPerHa: 2000,
        pricePerKg: 150,
        climateCoefficient: 0.6,
      });

      expect(res.effectiveYieldPerHa).toBe(1200);
      expect(res.expectedYieldKg).toBe(2400); // 2 * 1200
    });
  });

  describe("Financial and ROI Projections", () => {
    it("computes total investment, net profit, ROI, and break-even point", () => {
      const fin = calculateFinancialPlan({
        totalInputCost: 150000,
        totalLaborCost: 100000,
        totalEquipmentCost: 50000,
        totalTransportCost: 20000,
        expectedRevenue: 500000,
        pricePerKg: 200,
      });

      expect(fin.totalInvestment).toBe(320000);
      expect(fin.netProfit).toBe(180000);
      expect(fin.roiPercent).toBe(56.25); // (180000 / 320000) * 100 = 56.25%
      expect(fin.breakEvenYieldKg).toBe(1600); // 320000 / 200 = 1600 kg
    });
  });
});
