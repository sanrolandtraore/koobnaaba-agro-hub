/**
 * NAFA GENIUS IA - Moteur d'Apprentissage Continu Supervisé & Corpus de Connaissances
 * 
 * Architecture sécurisée :
 * 1. Corpus de connaissances de base versionné (INERA / CIRAD / FAO-56).
 * 2. Enregistrement des corrections et ajustements de terrain apportés par les ingénieurs.
 * 3. Enrichissement contextuel par few-shot learning sans dérive aléatoire des modèles de calcul.
 * 4. Stockage local Offline-First et réconciliation Supabase.
 */

import { supabase } from "@/integrations/supabase/client";

export const AGRONOMIC_KNOWLEDGE_VERSION = "2.1.0-sahel-inera";

export interface LearningExemplar {
  id: string;
  category: "irrigation_friction" | "crop_kc" | "poultry_density" | "pricing_mercuriale" | "diagnosis_protocol";
  context: {
    region: string;
    cropOrAnimal: string;
    initialRecommendation: any;
  };
  correctedValue: any;
  expertJustification: string;
  expertUserId?: string;
  timestamp: number;
  synced: boolean;
}

export interface RegionalCalibration {
  regionCode: string;
  regionName: string;
  etoMultiplier: number;
  waterTableAverageDepthM: number;
  maxRecommendedBroilerDensity: number;
  localSpecificities: string[];
}

/**
 * Calibrations régionales réelles du Burkina Faso (données INERA / DGM)
 */
export const REGIONAL_CALIBRATIONS: Record<string, RegionalCalibration> = {
  hauts_bassins: {
    regionCode: "HB",
    regionName: "Hauts-Bassins (Bobo-Dioulasso, Bama, Orodara)",
    etoMultiplier: 0.95,
    waterTableAverageDepthM: 25,
    maxRecommendedBroilerDensity: 9.5,
    localSpecificities: [
      "Zone soudano-sahélienne humide avec bonne recharge phréatique.",
      "Sols ferrallitiques et alluviaux propices aux vergers et maraîchage intensif.",
      "Pression fongique accrue pendant l'hivernage : surveillance cercosporiose.",
    ],
  },
  centre: {
    regionCode: "CTR",
    regionName: "Centre (Ouagadougou, Koubri, Loumbila)",
    etoMultiplier: 1.05,
    waterTableAverageDepthM: 45,
    maxRecommendedBroilerDensity: 8.5,
    localSpecificities: [
      "Forte évapotranspiration en saison sèche chaude (mars-mai).",
      "Niveau de nappe plus profond sur socle cristallin granitique.",
      "Nécessité impérative d'un débord de toiture avicole >= 1.10m.",
    ],
  },
  boucle_mouhoun: {
    regionCode: "BM",
    regionName: "Boucle du Mouhoun (Dédougou, Sourou, Boromo)",
    etoMultiplier: 1.0,
    waterTableAverageDepthM: 30,
    maxRecommendedBroilerDensity: 9.0,
    localSpecificities: [
      "Grenier céréalier et grands périmètres irrigués de la plaine du Sourou.",
      "Sols vertiques lourds nécessitant un espacement réduit des goutteurs.",
      "Vents d'Harmattan desséchants de décembre à février.",
    ],
  },
  nord_sahel: {
    regionCode: "SAH",
    regionName: "Nord & Sahel (Dori, Ouahigouya)",
    etoMultiplier: 1.15,
    waterTableAverageDepthM: 55,
    maxRecommendedBroilerDensity: 7.5,
    localSpecificities: [
      "Chaleur extrême (> 42°C en avril) : surdimensionnement des lanterneaux avicoles.",
      "Poussière abrasive : surdimensionnement de la filtration à 120 mesh doublée.",
      "Paillage agro-écologique obligatoire pour freiner l'évaporation du sol.",
    ],
  },
};

const STORAGE_KEY = "nafa_genius_learning_exemplars";

/**
 * Enregistre un ajustement d'ingénieur pour enrichir le corpus supervisé
 */
export async function recordExpertCorrection(exemplar: Omit<LearningExemplar, "id" | "timestamp" | "synced">): Promise<LearningExemplar> {
  const id = `exp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const record: LearningExemplar = {
    ...exemplar,
    id,
    timestamp: Date.now(),
    synced: false,
  };

  // 1. Sauvegarde locale Offline-First
  try {
    const existing: LearningExemplar[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    existing.unshift(record);
    // Limite historique à 100 entrées les plus récentes en local
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch (err) {
    console.warn("Échec d'écriture locale de l'exemplaire d'apprentissage :", err);
  }

  // 2. Tenter la synchronisation Supabase si en ligne
  if (navigator.onLine) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("engineering_corrections" as any).insert({
        correction_id: id,
        category: record.category,
        region: record.context.region,
        crop_or_animal: record.context.cropOrAnimal,
        initial_value: record.context.initialRecommendation,
        corrected_value: record.correctedValue,
        justification: record.expertJustification,
        expert_id: user?.id || null,
        knowledge_version: AGRONOMIC_KNOWLEDGE_VERSION,
      });

      if (!error) {
        record.synced = true;
      }
    } catch {
      // Ignorer si la table n'est pas encore migrée ou en cas de coupure
    }
  }

  return record;
}

/**
 * Récupère les ajustements enregistrés pour calibration du modèle
 */
export function getLocalLearningExemplars(): LearningExemplar[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Applique une calibration régionale sur le besoin en eau calculé
 */
export function applyRegionalCalibration(baseEtcMm: number, regionKey: string = "hauts_bassins"): number {
  const calibration = REGIONAL_CALIBRATIONS[regionKey] || REGIONAL_CALIBRATIONS.hauts_bassins;
  return Math.round(baseEtcMm * calibration.etoMultiplier * 100) / 100;
}
