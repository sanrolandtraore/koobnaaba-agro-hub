// Connaissances agronomiques locales stockées en local pour le DiagnosticIA sans réseau
export interface OfflineAgronomicAdvice {
  key: string;
  cropGroups: string[];
  keywords: string[];
  diagnosis_summary: string;
  cause_type: "maladie" | "ravageur" | "carence" | "stress_hydrique" | "stress_thermique";
  cause_name: string;
  confidence: number;
  severity: "faible" | "moyen" | "forte";
  treatment_bio: string;
  treatment_chemical: string;
  preventive_actions: string[];
}

export const OFFLINE_AGRONOMIC_KNOWLEDGE: OfflineAgronomicAdvice[] = [
  {
    key: "chenille_legionnaire",
    cropGroups: ["mais", "sorgho_blanc", "sorgho_rouge", "mil"],
    keywords: ["chenille", "trou", "feuille", "vert", "dévoré", "sciure", "cornet"],
    diagnosis_summary: "Attaque probable de la chenille légionnaire d'automne (Spodoptera frugiperda) au niveau du cornet foliaire.",
    cause_type: "ravageur",
    cause_name: "Chenille légionnaire d'automne (Spodoptera frugiperda)",
    confidence: 0.88,
    severity: "forte",
    treatment_bio: "Application d'extrait aqueux de graines de neem (Azadirachta indica) à 50g/L ou saupoudrage de cendre de bois tamisée mélangée à du sable fin au cœur des cornets.",
    treatment_chemical: "Traitement ciblé aux pyréthrinoïdes homologués (ex: Emamectine benzoate ou Lambda-cyhalothrine) à appliquer tôt le matin ou au crépuscule.",
    preventive_actions: [
      "Semis précoce et synchronisé au début de la saison des pluies",
      "Élimination des repousses et adventices hôtes aux abords des parcelles",
      "Surveillance bimensuelle des parcelles dès la levée",
    ],
  },
  {
    key: "carence_azote",
    cropGroups: ["mais", "riz_pluvial", "riz_irrigue", "riz_bas_fond", "sorgho_blanc", "mil"],
    keywords: ["jaune", "jaunissement", "bas", "feuille jaune", "v inversé", "croissance lente", "pâle"],
    diagnosis_summary: "Symptôme typique de carence en azote (N) : jaunissement en 'V' inversé partant de la pointe des vieilles feuilles du bas.",
    cause_type: "carence",
    cause_name: "Carence minérale en Azote (N)",
    confidence: 0.85,
    severity: "moyen",
    treatment_bio: "Apport de compost mûr, fumier de parc bien décomposé ou purin d'ortie/tithonia diversifolia dilué à 10%.",
    treatment_chemical: "Épandage d'Urée (46% N) au pied des poquets en enfouissement léger, suivi d'un arrosage ou après une pluie (fractionné en 2 apports).",
    preventive_actions: [
      "Rotation culturale avec des légumineuses fixatrices d'azote (niébé, arachide, soja)",
      "Enrichissement du sol par apport organique de fond avant labour (5 à 10 t/ha)",
    ],
  },
  {
    key: "striga",
    cropGroups: ["sorgho_blanc", "sorgho_rouge", "mil", "mais", "niebe"],
    keywords: ["striga", "plante parasite", "fleur rose", "fleur violette", "rabougrissement", "dessèchement"],
    diagnosis_summary: "Infestation par le Striga (plante parasite racinaire), causant jaunissement, nanisme et pertes drastiques de rendement.",
    cause_type: "ravageur",
    cause_name: "Striga hermonthica / Striga gesnerioides",
    confidence: 0.92,
    severity: "forte",
    treatment_bio: "Arrachage manuel impératif avant la floraison du Striga et brûlage des plants hors de la parcelle pour empêcher l'ensemencement du sol.",
    treatment_chemical: "Pulvérisation localisée d'herbicide sélectif post-émergence ou utilisation de semences enrobées répulsives si homologuées.",
    preventive_actions: [
      "Association culturale céréale-niébé ou céréale-desmodium (technique push-pull)",
      "Augmentation massive de la fumure organique qui étouffe le développement du striga",
      "Utilisation de variétés certifiées tolérantes recommandées par l'INERA",
    ],
  },
  {
    key: "charbon_mildiou",
    cropGroups: ["mil", "sorgho_blanc", "sorgho_rouge", "mais"],
    keywords: ["charbon", "poudre noire", "épi", "panicule", "champignon", "noire", "brûlure"],
    diagnosis_summary: "Attaque fongique de type Charbon ou Mildiou de la panicule, transformant les grains en masses de spores pulvérulentes noirâtres.",
    cause_type: "maladie",
    cause_name: "Charbon de la panicule (Sphacelotheca / Tolyposporium)",
    confidence: 0.87,
    severity: "forte",
    treatment_bio: "Arrachage et destruction par le feu des épis ou panicules touchés enfermés préalablement dans un sac pour éviter la dispersion des spores.",
    treatment_chemical: "Traitement préventif des semences avant semis avec un fongicide à base de Thirame ou Métalaxyl.",
    preventive_actions: [
      "Utiliser exclusivement des semences saines et triées",
      "Éviter de ressemer sur une parcelle contaminée l'année précédente (rotation sur 3 ans)",
    ],
  },
  {
    key: "mildiou_tomate",
    cropGroups: ["tomate", "pomme_de_terre", "aubergine"],
    keywords: ["tache brune", "feuille flétrie", "moisissure", "pourriture", "tomate noire", "flétrissement"],
    diagnosis_summary: "Mildiou de la tomate (Phytophthora infestans) favorisé par une humidité stagnante et des températures tièdes.",
    cause_type: "maladie",
    cause_name: "Mildiou (Phytophthora infestans)",
    confidence: 0.86,
    severity: "forte",
    treatment_bio: "Suppression immédiate des feuilles basses contaminées, aération des rangs et pulvérisation de bouillie bordelaise (sulfate de cuivre dosé à 1%).",
    treatment_chemical: "Fongicide systémique homologué (Mancozèbe + Métalaxyl) en respectant strictement le délai avant récolte (DAR).",
    preventive_actions: [
      "Arrosage au pied sans mouiller le feuillage (goutte-à-goutte)",
      "Paillage du sol pour éviter les éclaboussures de terre sur les feuilles",
      "Tuteurage rigoureux pour aérer les plants",
    ],
  },
  {
    key: "pucerons_mouches_blanches",
    cropGroups: ["tomate", "gombo", "piment", "aubergine", "coton", "niebe"],
    keywords: ["puceron", "mouche blanche", "feuille recroquevillée", "miellat", "fourmi", "fumagine", "jaunisse"],
    diagnosis_summary: "Présence de colonies de pucerons ou mouches blanches (Aleurodes), vecteurs majeurs de virus agronomiques (enroulement, mosaïque).",
    cause_type: "ravageur",
    cause_name: "Pucerons (Aphis gossypii) / Aleurodes (Bemisia tabaci)",
    confidence: 0.84,
    severity: "moyen",
    treatment_bio: "Savon noir liquide dilué (20ml/L) ou extrait d'huile de neem avec quelques gouttes de savon comme émulsifiant en pulvérisation sous les feuilles.",
    treatment_chemical: "Insecticide à base d'Acétamipride ou Deltaméthrine si le seuil d'infestation dépasse 20% des plants.",
    preventive_actions: [
      "Installation de pièges chromatiques jaunes englués dans la parcelle",
      "Désherbage méticuleux des bordures hôtes",
    ],
  },
  {
    key: "stress_hydrique",
    cropGroups: ["mais", "sorgho_blanc", "mil", "riz_pluvial", "tomate", "niebe"],
    keywords: ["sec", "flétrissement", "enroulement", "soif", "terre sèche", "desséché", "sécheresse"],
    diagnosis_summary: "Stress hydrique sévère : enroulement des feuilles en aiguilles pour limiter l'évapotranspiration et flétrissement des apex.",
    cause_type: "stress_hydrique",
    cause_name: "Déficit hydrique / Sécheresse prolongée",
    confidence: 0.90,
    severity: "forte",
    treatment_bio: "Paillage abondant avec pailles de céréales pour conserver l'humidité résiduelle et binage superficiel pour casser la croûte de battance.",
    treatment_chemical: "Non applicable (ajuster le tour d'arrosage ou aménager des cordons pierreux et demi-lunes pour retenir les eaux de pluie).",
    preventive_actions: [
      "Aménagement de zaï ou demi-lunes avec apport de compost",
      "Adoption de variétés à cycle court adaptées aux poches de sécheresse",
    ],
  },
];

export function findLocalAgronomicAdvice(cropKey: string, symptomsText: string): OfflineAgronomicAdvice | null {
  const normalized = (symptomsText || "").toLowerCase();
  
  // 1. Match by crop group and symptom keywords
  let bestMatch: { advice: OfflineAgronomicAdvice; score: number } | null = null;

  for (const advice of OFFLINE_AGRONOMIC_KNOWLEDGE) {
    let score = 0;
    const cropMatch = !cropKey || advice.cropGroups.includes(cropKey);
    if (cropMatch) score += 2;

    for (const kw of advice.keywords) {
      if (normalized.includes(kw)) {
        score += 3;
      }
    }

    if (score >= 3 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { advice, score };
    }
  }

  return bestMatch ? bestMatch.advice : null;
}
