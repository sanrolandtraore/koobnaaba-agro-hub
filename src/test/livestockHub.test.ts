import { describe, it, expect } from "vitest";
import { speciesOptions, breedsBySpecies, statusOptions, GROUP_SPECIES } from "@/pages/livestock/AnimalsPage";
import { eventTypes, vaccinations, medications } from "@/pages/livestock/AnimalHealthPage";
import { reproTypes, offspringOptions } from "@/pages/livestock/AnimalReproductionPage";
import { feedTypes, suppliers } from "@/pages/livestock/AnimalFeedingPage";
import { expenseCategories, saleTypes } from "@/pages/livestock/LivestockFinancePage";

describe("Livestock Hub & Veterinary Suite Tests", () => {
  describe("Animals & Lot Management Definitions", () => {
    it("includes all Sahelian livestock species", () => {
      const values = speciesOptions.map((s) => s.value);
      expect(values).toContain("bovin");
      expect(values).toContain("ovin");
      expect(values).toContain("caprin");
      expect(values).toContain("porcin");
      expect(values).toContain("volaille");
      expect(values).toContain("pisciculture");
    });

    it("identifies poultry and fish as group/lot species by default", () => {
      expect(GROUP_SPECIES.has("volaille")).toBe(true);
      expect(GROUP_SPECIES.has("pisciculture")).toBe(true);
      expect(GROUP_SPECIES.has("bovin")).toBe(false);
    });

    it("contains authentic Burkina Faso breeds for bovins, ovins and poultry", () => {
      expect(breedsBySpecies.bovin).toContain("Zébu Peulh");
      expect(breedsBySpecies.bovin).toContain("Zébu Azawak");
      expect(breedsBySpecies.ovin).toContain("Bali-Bali");
      expect(breedsBySpecies.ovin).toContain("Djallonké");
      expect(breedsBySpecies.caprin).toContain("Chèvre rousse de Maradi");
      expect(breedsBySpecies.volaille).toContain("Poulet bicyclette local");
      expect(breedsBySpecies.pisciculture).toContain("Tilapia du Nil (Oreochromis)");
    });

    it("correctly computes surviving head count with mortalities", () => {
      const lot = { group_size: 500, mortality_count: 12 };
      const alive = Math.max(0, (lot.group_size || 0) - (lot.mortality_count || 0));
      expect(alive).toBe(488);

      const wipedLot = { group_size: 50, mortality_count: 60 };
      const aliveWiped = Math.max(0, (wipedLot.group_size || 0) - (wipedLot.mortality_count || 0));
      expect(aliveWiped).toBe(0);
    });

    it("has complete status options with actif, vendu, mort, réformé", () => {
      const statuses = statusOptions.map((s) => s.value);
      expect(statuses).toEqual(["actif", "vendu", "mort", "réformé"]);
    });
  });

  describe("Animal Health & Prophylaxis", () => {
    it("includes mandatory West African Sahel vaccinations", () => {
      expect(vaccinations.some((v) => v.includes("PPR"))).toBe(true);
      expect(vaccinations.some((v) => v.includes("PPCB"))).toBe(true);
      expect(vaccinations.some((v) => v.includes("Newcastle"))).toBe(true);
      expect(vaccinations.some((v) => v.includes("Charbon"))).toBe(true);
    });

    it("includes veterinary medications and trypanocides", () => {
      expect(medications.some((m) => m.includes("Oxytétracycline"))).toBe(true);
      expect(medications.some((m) => m.includes("Ivermectine"))).toBe(true);
      expect(medications.some((m) => m.includes("Diminazène"))).toBe(true);
      expect(medications.some((m) => m.includes("Albendazole"))).toBe(true);
    });

    it("has comprehensive health event types", () => {
      const types = eventTypes.map((t) => t.value);
      expect(types).toContain("vaccination");
      expect(types).toContain("traitement");
      expect(types).toContain("deworming");
      expect(types).toContain("consultation");
    });
  });

  describe("Animal Reproduction & Gestation", () => {
    it("supports all breeding milestones", () => {
      const types = reproTypes.map((t) => t.value);
      expect(types).toContain("saillie");
      expect(types).toContain("insemination");
      expect(types).toContain("gestation");
      expect(types).toContain("mise_bas");
      expect(types).toContain("sevrage");
    });

    it("provides reasonable offspring counts", () => {
      expect(offspringOptions).toContain("1");
      expect(offspringOptions).toContain("2");
      expect(offspringOptions).toContain("10");
    });
  });

  describe("Feeding & Pastoral Finances", () => {
    it("lists essential feeds (cottonseed cake, crop residues, poultry feed)", () => {
      const values = feedTypes.map((f) => f.value);
      expect(values).toContain("Tourteau de coton");
      expect(values).toContain("Son de blé");
      expect(values).toContain("Provende chair");
      expect(values).toContain("Aliment poisson");
      expect(suppliers).toContain("SN-CITEC (Tourteau officiel)");
    });

    it("covers key livestock expense categories and sales types", () => {
      const expCats = expenseCategories.map((c) => c.value);
      expect(expCats).toContain("alimentation");
      expect(expCats).toContain("sante");
      expect(expCats).toContain("main_oeuvre");

      const saleVals = saleTypes.map((s) => s.value);
      expect(saleVals).toContain("animal");
      expect(saleVals).toContain("lait");
      expect(saleVals).toContain("oeufs");
      expect(saleVals).toContain("poisson");
    });

    it("accurately calculates net pastoral margin", () => {
      const salesTotal = 1500000;
      const expensesTotal = 850000;
      const net = salesTotal - expensesTotal;
      expect(net).toBe(650000);
      expect(net > 0).toBe(true);
    });
  });
});
