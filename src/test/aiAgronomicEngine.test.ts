import { describe, it, expect } from "vitest";
import {
  findLocalAgronomicAdvice,
  OFFLINE_AGRONOMIC_KNOWLEDGE,
} from "@/lib/offlineAgronomicKnowledge";

describe("IA Agronomique Opérationnelle : Moteur Scientifique INERA Burkina & CSP-CILSS", () => {
  it("contient une base de connaissances agronomiques riche (>25 affections sahéliennes)", () => {
    expect(OFFLINE_AGRONOMIC_KNOWLEDGE.length).toBeGreaterThanOrEqual(25);

    // Vérification de la présence des protocoles complets et références INERA
    OFFLINE_AGRONOMIC_KNOWLEDGE.forEach((item) => {
      expect(item.key).toBeTruthy();
      expect(item.cropGroups.length).toBeGreaterThan(0);
      expect(item.keywords.length).toBeGreaterThan(0);
      expect(item.cause_name).toBeTruthy();
      expect(item.diagnosis_summary).toBeTruthy();
      expect(item.treatment_bio).toBeTruthy();
      expect(item.treatment_chemical).toBeTruthy();
      expect(item.preventive_actions.length).toBeGreaterThan(0);
      expect(item.inera_reference).toContain("INERA");
    });
  });

  it("identifie avec précision la Chenille légionnaire (Spodoptera) sur céréales", () => {
    const diag = findLocalAgronomicAdvice("mais", "trous et feuilles dévorées au fond du cornet foliaire avec sciure");
    expect(diag).not.toBeNull();
    expect(diag?.key).toBe("chenille_legionnaire");
    expect(diag?.cause_type).toBe("ravageur");
    expect(diag?.treatment_bio).toContain("neem");
    expect(diag?.treatment_chemical).toContain("Emamectine");
  });

  it("identifie la Foreuse des gousses (Maruca) et Thrips sur Niébé", () => {
    const diag = findLocalAgronomicAdvice("niebe", "trous dans les jeunes gousses et chute massive des fleurs");
    expect(diag).not.toBeNull();
    expect(diag?.key).toBe("maruca_thrips_niebe");
    expect(diag?.inera_reference).toContain("INERA");
    expect(diag?.preventive_actions.some((a) => a.includes("KVx") || a.includes("KOMCALLE"))).toBe(true);
  });

  it("identifie la Pyriculariose du riz (Magnaporthe oryzae)", () => {
    const diag = findLocalAgronomicAdvice("riz_pluvial", "taches en losange à centre grisâtre sur les feuilles de riz");
    expect(diag).not.toBeNull();
    expect(diag?.key).toBe("pyriculariose_riz");
    expect(diag?.cause_type).toBe("maladie");
    expect(diag?.treatment_chemical).toContain("Tricyclazole");
    expect(diag?.preventive_actions.some((a) => a.includes("FKR 19") || a.includes("NERICA"))).toBe(true);
  });

  it("identifie la Rosette de l'arachide transmise par pucerons", () => {
    const diag = findLocalAgronomicAdvice("arachide", "touffe dense rabougrie avec feuilles jaunes recroquevillées");
    expect(diag).not.toBeNull();
    expect(diag?.key).toBe("rosette_arachide");
    expect(diag?.preventive_actions.some((a) => a.includes("RMP 12") || a.includes("Fleur 11"))).toBe(true);
  });

  it("identifie le virus TYLCV de la tomate", () => {
    const diag = findLocalAgronomicAdvice("tomate", "feuilles jaunes recroquevillées en forme de cuillère et nanisme");
    expect(diag).not.toBeNull();
    expect(diag?.key).toBe("tylcv_tomate");
    expect(diag?.preventive_actions.some((a) => a.includes("Mongal F1") || a.includes("Nadira"))).toBe(true);
  });

  it("identifie les Thrips de l'oignon", () => {
    const diag = findLocalAgronomicAdvice("oignon", "feuilles argentées avec mouchetures et bouts desséchés");
    expect(diag).not.toBeNull();
    expect(diag?.key).toBe("thrips_oignon");
    expect(diag?.treatment_bio).toContain("neem");
  });

  it("identifie la Carence en Azote (N) par le jaunissement en V inversé", () => {
    const diag = findLocalAgronomicAdvice("mais", "jaunissement des vieilles feuilles du bas en forme de V inversé");
    expect(diag).not.toBeNull();
    expect(diag?.key).toBe("carence_azote");
    expect(diag?.cause_type).toBe("carence");
    expect(diag?.treatment_chemical).toContain("Urée");
  });

  it("identifie la Carence en Phosphore (P) avec feuillage pourpre et phosphate de Kodjari", () => {
    const diag = findLocalAgronomicAdvice("mais", "feuilles violacées et tiges rougeâtres avec sol pauvre");
    expect(diag).not.toBeNull();
    expect(diag?.key).toBe("carence_phosphore");
    expect(diag?.treatment_bio).toContain("Kodjari");
  });

  it("fournit une recommandation agronomique pertinente même sans description détaillée si la culture est sélectionnée", () => {
    const diagCoton = findLocalAgronomicAdvice("coton", "");
    expect(diagCoton).not.toBeNull();
    expect(diagCoton?.cropGroups).toContain("coton");

    const diagManioc = findLocalAgronomicAdvice("manioc", "");
    expect(diagManioc).not.toBeNull();
    expect(diagManioc?.cropGroups).toContain("manioc");
  });
});
