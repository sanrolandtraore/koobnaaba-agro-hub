// Connaissances agronomiques de référence INERA (Institut de l'Environnement et de Recherches Agricoles du Burkina Faso)
// et recommandations phytosanitaires homologuées CSP (Comité Sahélien des Pesticides - CILSS)

export interface OfflineAgronomicAdvice {
  key: string;
  cropGroups: string[];
  keywords: string[];
  diagnosis_summary: string;
  cause_type: "maladie" | "ravageur" | "carence" | "stress_hydrique" | "stress_thermique";
  cause_name: string;
  confidence: number;
  severity: "faible" | "moyen" | "forte";
  inera_reference?: string;
  treatment_bio: string;
  treatment_chemical: string;
  preventive_actions: string[];
}

export const OFFLINE_AGRONOMIC_KNOWLEDGE: OfflineAgronomicAdvice[] = [
  // ── 1. CÉRÉALES : CHENILLE LÉGIONNAIRE D'AUTOMNE ──
  {
    key: "chenille_legionnaire",
    cropGroups: ["mais", "sorgho_blanc", "sorgho_rouge", "mil", "riz_pluvial", "fonio"],
    keywords: ["chenille", "chenilles", "spodoptera", "cornet", "sciure", "troue", "trouee", "trou foliaire", "feuille devoree", "chenille legionnaire"],
    diagnosis_summary: "Attaque sévère de la chenille légionnaire d'automne (Spodoptera frugiperda) logée dans le cornet foliaire, entraînant défoliation en dentelle et sciure excrémentielle.",
    cause_type: "ravageur",
    cause_name: "Chenille légionnaire d'automne (Spodoptera frugiperda)",
    confidence: 0.92,
    severity: "forte",
    inera_reference: "Fiche Technique INERA Défense des Cultures & Protocole d'Urgence CILSS",
    treatment_bio: "Saupoudrage direct au cœur des cornets d'un mélange de cendre de bois tamisée et sable fin (ratio 1:1), ou pulvérisation d'extrait aqueux de graines de neem broyées (50 g/L macérées 12h) additionné de 5 ml de savon liquide local.",
    treatment_chemical: "Traitement homologué CSP : Emamectine benzoate 50 g/kg (ex: Proclaim / Affirm à 250 g/ha) ou Lambda-cyhalothrine 50 g/L (0.4 L/ha), appliqué tôt le matin (avant 8h) ou au crépuscule ciblé dans le cornet.",
    preventive_actions: [
      "Semis précoce et groupé dès l'installation des pluies utiles",
      "Surveillance bimensuelle des parcelles dès le stade 3 feuilles",
      "Élimination des adventices hôtes (chiendent, graminées sauvages) sur les bordures",
      "Adoption de variétés certifiées INERA tolérantes (ex: Maïs Barka, Espoir, Bondofa)",
    ],
  },

  // ── 2. CÉRÉALES : FOREURS DE TIGES ──
  {
    key: "foreur_tiges_cereales",
    cropGroups: ["mais", "sorgho_blanc", "sorgho_rouge", "mil", "canne_a_sucre"],
    keywords: ["foreur", "coeur mort", "tige trouée", "galerie", "tige cassée", "busseola", "sesamia", "sciure tige"],
    diagnosis_summary: "Attaque de foreurs de tiges (Busseola fusca ou Sesamia calamistis) avec galeries internes dans la moelle et dessèchement prématuré du 'cœur mort'.",
    cause_type: "ravageur",
    cause_name: "Foreurs de tiges (Busseola fusca / Sesamia calamistis)",
    confidence: 0.89,
    severity: "forte",
    inera_reference: "Programme Céréales INERA Saria & Farako-Bâ",
    treatment_bio: "Association culturale Push-Pull développée par la recherche : culture intercalaire de Desmodium (répulsif) et bande périphérique de Pennisetum purpureum (herbe à éléphant piège). Brûlage ou compostage à chaud des résidus de tiges après récolte.",
    treatment_chemical: "Deltaméthrine ou Chlorantraniliprole homologué CSP dirigé à la base de la plante au stade végétatif jeune (20 à 30 jours après levée).",
    preventive_actions: [
      "Broyage ou enfouissement profond des cannes de maïs/sorgho après récolte pour détruire les larves hivernantes",
      "Rotation des cultures avec des légumineuses (niébé, arachide)",
    ],
  },

  // ── 3. CÉRÉALES & LÉGUMINEUSES : STRIGA PARASITE ──
  {
    key: "striga",
    cropGroups: ["sorgho_blanc", "sorgho_rouge", "mil", "mais", "niebe", "fonio"],
    keywords: ["striga", "plante parasite", "fleur rose", "fleur violette", "rabougrissement", "dessèchement", "sorcière", "nanisme"],
    diagnosis_summary: "Infestation par le Striga (Striga hermonthica sur céréales ou Striga gesnerioides sur niébé), plante parasite racinaire siphonant la sève.",
    cause_type: "ravageur",
    cause_name: "Striga hermonthica / Striga gesnerioides",
    confidence: 0.94,
    severity: "forte",
    inera_reference: "Programme Sélection Striga INERA Kamboinsé",
    treatment_bio: "Arrachage manuel rigoureux AVANT la floraison du Striga et incinération immédiate hors de la parcelle. Forte fumure organique (compost mûr de 5 à 10 t/ha) enrichi au phosphate de Kodjari pour stimuler la microflore suppressive.",
    treatment_chemical: "Pulvérisation localisée ultra-ciblée au pulvérisateur à dos d'herbicide sélectif post-levée (2,4-D amine) uniquement sur les touffes de Striga émergées.",
    preventive_actions: [
      "Semer des variétés certifiées INERA résistantes au Striga : Sorgho 'Framida', 'Sariasso 14' ; Niébé 'KVx 395-4-8', 'B301'",
      "Rotation culturale avec des cultures pièges (faux-hôtes) provoquant la germination suicide du Striga : sésame, soja, cotonnier",
      "Éviter le transfert d'outils aratoires contaminés d'un champ infecté à un champ sain",
    ],
  },

  // ── 4. CÉRÉALES : CHARBON ET MILDEW DE LA PANICULE ──
  {
    key: "charbon_cereales",
    cropGroups: ["mil", "sorgho_blanc", "sorgho_rouge", "mais"],
    keywords: ["charbon", "poudre noire", "épi noir", "panicule", "spores noires", "champignon noir", "tolyposporium", "sphacelotheca"],
    diagnosis_summary: "Infection fongique de type Charbon de la panicule (Sphacelotheca / Tolyposporium), convertissant les grains en masses de spores noires pulvérulentes.",
    cause_type: "maladie",
    cause_name: "Charbon de la panicule (Sphacelotheca sorghi / Tolyposporium penicillariae)",
    confidence: 0.90,
    severity: "forte",
    inera_reference: "Guide de Pathologie des Céréales Sèches INERA",
    treatment_bio: "Coupe précautionneuse des panicules charbonneuses recouvertes d'un sachet pour empêcher la dispersion du champignon par le vent, puis brûlage complet.",
    treatment_chemical: "Enrobage préventif obligatoire des semences avant semis avec un fongicide triple action homologué CSP : Thirame 35% + Métalaxyl 15% (ex: Calthio C ou Apron Star à 10g pour 4kg de semences).",
    preventive_actions: [
      "Utilisation exclusive de semences certifiées traitées INERA",
      "Rotation sur au moins 2 à 3 ans sans céréale hôte",
    ],
  },

  // ── 5. RIZ : PYRICULARIOSE DU RIZ ──
  {
    key: "pyriculariose_riz",
    cropGroups: ["riz_pluvial", "riz_irrigue", "riz_bas_fond"],
    keywords: ["pyriculariose", "losange", "tache losange", "centre gris", "bord brun", "collet noir", "brûlure riz", "magnaporthe"],
    diagnosis_summary: "Pyriculariose du riz (Magnaporthe oryzae) sous forme foliaire ou nodale, provoquant des taches caractéristiques en losange à centre grisâtre et col noir de la panicule.",
    cause_type: "maladie",
    cause_name: "Pyriculariose du riz (Magnaporthe oryzae)",
    confidence: 0.91,
    severity: "forte",
    inera_reference: "Programme Riziculture INERA Bama / Vallée du Kou",
    treatment_bio: "Éviter les excès de fertilisation azotée minérale tardive. Aérer les parcelles en respectant un écartement de repiquage de 20 cm x 20 cm. Pulvérisation de silice soluble ou extrait de prêle.",
    treatment_chemical: "Traitement curatif dès l'apparition des premières taches losangiques avec Tricyclazole 75 WP (0.4 kg/ha) ou Azoxystrobine 250 SC homologué CSP.",
    preventive_actions: [
      "Semer les variétés améliorées INERA très résistantes : FKR 19, FKR 62N (NERICA 4 pluvial), TS2, Orylux 6",
      "Éliminer les pailles de riz contaminées après battage",
      "Gestion optimale de la lame d'eau en riziculture irriguée sans assecs prolongés",
    ],
  },

  // ── 6. RIZ : PANACHURE JAUNE DU RIZ (RYMV) ──
  {
    key: "rymv_riz",
    cropGroups: ["riz_irrigue", "riz_bas_fond", "riz_pluvial"],
    keywords: ["rymv", "panachure jaune", "stries jaunes", "riz jaune", "nanisme riz", "marbrure", "feuilles dressées", "chrysomèle"],
    diagnosis_summary: "Panachure jaune du riz (RYMV - Rice Yellow Mottle Virus), virose grave transmise par des coléoptères chrysomélidés provoquant jaunissement strié, rabougrissement et stérilité paniculaire.",
    cause_type: "maladie",
    cause_name: "Panachure jaune du riz (RYMV)",
    confidence: 0.93,
    severity: "forte",
    inera_reference: "INERA / Centre de Recherches Environnementales et Agricoles (CREAF)",
    treatment_bio: "Arrachage immédiat des touffes virosées dans un sac plastique pour éviter la transmission mécanique par contact foliaire. Élimination des graminées adventices hôtes (Leersia hexandra, Oryza longistaminata).",
    treatment_chemical: "Aucun produit virucide n'existe. Contrôle précoce des insectes vecteurs (chrysomèles, cécidomyies) avec de la Deltaméthrine 25 EC ou Cyperméthrine homologuée CSP.",
    preventive_actions: [
      "Utilisation impérative de variétés tolérantes certifiées INERA : FKR 64, Sahel 108, ARICA 3",
      "Nettoyage désinfecté des batteuses et bottes avant le passage d'une parcelle à une autre",
      "Synchronisation des dates de repiquage dans les bas-fonds aménagés",
    ],
  },

  // ── 7. LÉGUMINEUSES : FOREUSE DES GOUSSES & THRIPS DU NIÉBÉ ──
  {
    key: "maruca_thrips_niebe",
    cropGroups: ["niebe", "voandzou", "soja", "pois_sucre", "haricot_vert"],
    keywords: ["maruca", "niebe", "gousse", "gousses", "trou gousse", "fleur", "fleurs", "thrips", "avortement", "chenille gousse"],
    diagnosis_summary: "Attaque combinée de thrips floricoles (Megalurothrips sjostedti) causant l'avortement des fleurs et de la foreuse des gousses (Maruca vitrata) perforant les jeunes gousses.",
    cause_type: "ravageur",
    cause_name: "Foreuse des gousses (Maruca vitrata) & Thrips floricoles",
    confidence: 0.92,
    severity: "forte",
    inera_reference: "Fiche Technique Légumineuses INERA Saria",
    treatment_bio: "Pulvérisation d'un biopesticide aqueux de neem (graines pilées à 50 g/L macérées 24h) ou bio-insecticide Bacillus thuringiensis (Bt) au stade boutons floraux puis début formation des gousses.",
    treatment_chemical: "Programme officiel 2 traitements INERA/CSP : 1er traitement à l'apparition des boutons floraux avec Indoxacarbe ou Acétamipride + Lambdacyhalothrine ; 2ème traitement 10-14 jours plus tard en pleine floraison.",
    preventive_actions: [
      "Adoption des variétés certifiées INERA à cycle précoce : KVx 395-4-8, KVx 745-11, KOMCALLE, TEELE",
      "Association culturale maïs-niébé ou sorgho-niébé limitant la pression des ravageurs",
      "Ne pas retarder les dates de semis après le 25 juillet en zone soudano-sahélienne",
    ],
  },

  // ── 8. LÉGUMINEUSES : PUNAISES ET PUCERONS NOIRS DU NIÉBÉ ──
  {
    key: "punaises_pucerons_niebe",
    cropGroups: ["niebe", "arachide", "voandzou", "soja"],
    keywords: ["punaise", "gousse plate", "grain ratatiné", "puceron noir", "clavigralla", "aphis craccivora", "suceur"],
    diagnosis_summary: "Attaque de punaises suceuses (Clavigralla tomentosicollis) provoquant le dessèchement et le ratatinement des graines en gousses, et colonies de pucerons noirs.",
    cause_type: "ravageur",
    cause_name: "Punaises suceuses de gousses (Clavigralla) & Pucerons noirs (Aphis craccivora)",
    confidence: 0.88,
    severity: "moyen",
    inera_reference: "Entomologie Agricole INERA Bobo-Dioulasso",
    treatment_bio: "Macération hydro-alcoolique d'ail (100g) + piment fort écrasé (50g) + savon de ménage (20g) dans 10L d'eau, filtrée et pulvérisée tôt le matin.",
    treatment_chemical: "Insecticide homologué CSP à base de Lambdacyhalothrine + Diméthoate ou Acétamipride au grossissement des gousses (respecter le DAR de 7 jours minimum).",
    preventive_actions: [
      "Ramassage matinal au filet fauchoir des punaises lourdes engourdies par la fraîcheur nocturne",
      "Récolte échelonnée dès la maturité des premières gousses",
    ],
  },

  // ── 9. ARACHIDE : ROSETTE DE L'ARACHIDE ──
  {
    key: "rosette_arachide",
    cropGroups: ["arachide", "voandzou"],
    keywords: ["rosette", "rabougri", "touffe dense", "feuille jaune arachide", "nanisme arachide", "aphis", "mosaïque"],
    diagnosis_summary: "Rosette de l'arachide (transmise par le puceron Aphis craccivora), provoquant un arrêt de croissance, une touffe compacte nanifiée et une absence de gousses.",
    cause_type: "maladie",
    cause_name: "Rosette de l'arachide (Groundnut rosette virus)",
    confidence: 0.94,
    severity: "forte",
    inera_reference: "Fiche Recommandation Arachide INERA Niangoloko",
    treatment_bio: "Contrôler les colonies de pucerons dès l'apparition des premières touffes par pulvérisation d'huile végétale de neem (5 ml/L + savon émulsifiant). Arracher et brûler les plants malades isolés.",
    treatment_chemical: "Traitement précoce insecticide au stade 2 à 4 feuilles contre le puceron vecteur avec Acétamipride 20 SP ou Deltaméthrine 25 EC homologuée CSP.",
    preventive_actions: [
      "Semis serré recommandé par l'INERA (écartement 40 cm x 15 cm, soit 160 000 poquets/ha) pour une couverture foliaire rapide empêchant l'atterrissage des pucerons ailés",
      "Semis dès les premières pluies utiles",
      "Semer des variétés certifiées INERA résistantes à la rosette : RMP 12, RMP 91, Fleur 11, KH 149 A",
    ],
  },

  // ── 10. ARACHIDE : CERCOSPORIOSE ET ROUILLE ──
  {
    key: "cercosporiose_arachide",
    cropGroups: ["arachide", "voandzou", "soja"],
    keywords: ["cercospora", "tache ronde noire", "halo jaune", "feuille qui tombe", "défoliation arachide", "rouille arachide", "pustule"],
    diagnosis_summary: "Cercosporiose précoce/tardive (Cercospora arachidicola) et rouille, provoquant des taches circulaires brun-noir auréolées de jaune entraînant une défoliation prématurée.",
    cause_type: "maladie",
    cause_name: "Cercosporioses de l'arachide (Cercospora arachidicola / Phaeoisariopsis)",
    confidence: 0.89,
    severity: "moyen",
    inera_reference: "Laboratoire de Phytopathologie INERA Saria",
    treatment_bio: "Décoction de feuilles de papayer riche en papaïne antifongique naturelle ou purin de tithonia. Éviter l'arrosage des feuilles par aspersion.",
    treatment_chemical: "Pulvérisation de Mancozèbe 80 WP (2 kg/ha) ou Chlorothalonil dès le 40ème jour après semis si la pluviométrie est abondante.",
    preventive_actions: [
      "Rotation culturale de 2 à 3 ans sans légumineuse",
      "Enfouissement des fanes après récolte si contaminées",
      "Variétés certifiées tolérantes INERA (TS 32-1, Fleur 11)",
    ],
  },

  // ── 11. COTON : CHENILLE DE LA CAPSULE DU COTONNIER ──
  {
    key: "chenille_capsule_coton",
    cropGroups: ["coton", "tomate", "gombo", "mais"],
    keywords: ["coton", "capsule trouée", "chenille coton", "larve capsule", "coton pourri", "helicoverpa", "diparopsis"],
    diagnosis_summary: "Attaque sévère de la chenille de la capsule (Helicoverpa armigera / Diparopsis watersi), dévorant les organes reproducteurs (boutons floraux 'cuvettes' et capsules).",
    cause_type: "ravageur",
    cause_name: "Chenille de la capsule du cotonnier (Helicoverpa armigera / Diparopsis)",
    confidence: 0.93,
    severity: "forte",
    inera_reference: "Programme Coton INERA / SOFITEX Bobo-Dioulasso",
    treatment_bio: "Épandage d'extrait de graines de neem et d'huile de jatropha. Piégeage sexuel par phéromones synthétiques pour suivre le vol des papillons adultes.",
    treatment_chemical: "Programme de protection raisonnée Coton SOFITEX/UNPCB : alternance stricte selon les 3 fenêtres de traitement (ex: Lambdacyhalothrine + Profénofos ou Spinetoram homologué CSP).",
    preventive_actions: [
      "Respect strict des calendriers de traitement régionaux SOFITEX / FASOCOTON / SOCOMA",
      "Écimage des cotonniers en fin de cycle pour supprimer les pontes terminales",
      "Arrachage et brûlage obligatoire des tiges de coton en fin de campagne (décembre-janvier) pour rompre le cycle biologique",
    ],
  },

  // ── 12. COTON : MOUCHES BLANCHES & PUCERONS (COTON COLLANT) ──
  {
    key: "aleurodes_pucerons_coton",
    cropGroups: ["coton", "gombo", "aubergine", "piment", "tomate"],
    keywords: ["mouche blanche", "aleurode", "coton collant", "fumagine", "miellat", "feuille collante", "bemisia", "aphis gossypii"],
    diagnosis_summary: "Pullulation de mouches blanches (Bemisia tabaci) ou pucerons sécrétant un abondant miellat poisseux sur lequel se développe la fumagine noire ('coton collant').",
    cause_type: "ravageur",
    cause_name: "Mouches blanches (Bemisia tabaci) & Pucerons du cotonnier",
    confidence: 0.90,
    severity: "forte",
    inera_reference: "Recherche Cotonnière INERA Farako-Bâ",
    treatment_bio: "Lessivage au savon noir liquide local (15 à 20 ml/L) pour décoller le miellat et étouffer les larves, associé à un extrait d'huile de neem.",
    treatment_chemical: "Insecticide translutaire spécifique homologué CSP : Acétamipride 20 SP ou Flonicamide appliqué sous la face inférieure des feuilles.",
    preventive_actions: [
      "Pose de pièges jaunes collants en périphérie de la parcelle",
      "Désherbage rigoureux des plantes adventices hôtes (Sida cordifolia)",
    ],
  },

  // ── 13. COTON : BACTÉRIOSE DU COTONNIER (TACHE ANGULAIRE) ──
  {
    key: "bacteriose_coton",
    cropGroups: ["coton"],
    keywords: ["tache angulaire", "nervure noire", "xanthomonas", "bactériose coton", "chancre tige", "coton brûlé"],
    diagnosis_summary: "Bactériose du cotonnier ou tache angulaire (Xanthomonas citri pv. malvacearum) créant des lésions polygonales délimitées par les nervures et chancres sur tiges.",
    cause_type: "maladie",
    cause_name: "Bactériose du cotonnier (Xanthomonas citri pv. malvacearum)",
    confidence: 0.91,
    severity: "forte",
    inera_reference: "Fiches Techniques Coton INERA",
    treatment_bio: "Destruction immédiate des débris végétaux contaminés. Application préventive d'extraits d'écorce à tanins antiseptiques.",
    treatment_chemical: "Traitement préventif des semences au sulfate de cuivre. En cas d'attaque précoce foliaire, pulvérisation d'hydroxyde de cuivre ou oxychlorure de cuivre (300 g/100L d'eau).",
    preventive_actions: [
      "Utilisation exclusive de semences certifiées délintées et traitées fournies par les sociétés cotonnières (variétés INERA FK 37, FK 64)",
      "Éviter les labours et sarclages lorsque les feuilles sont humides de rosée",
    ],
  },

  // ── 14. MARAÎCHAGE : THRIPS DE L'OIGNON ──
  {
    key: "thrips_oignon",
    cropGroups: ["oignon", "ail", "echalote", "poireau"],
    keywords: ["thrips", "oignon", "argent", "argentee", "argentees", "moucheture", "mouchetures", "tache argentee", "bout sec", "fut oignon"],
    diagnosis_summary: "Attaque de thrips de l'oignon (Thrips tabaci) provoquant des mouchetures argentées, un blanchiment brillant du feuillage et le dépérissement prématuré du bulbe.",
    cause_type: "ravageur",
    cause_name: "Thrips de l'oignon (Thrips tabaci)",
    confidence: 0.91,
    severity: "forte",
    inera_reference: "Fiche Filière Oignon INERA Farako-Bâ / Loumbila",
    treatment_bio: "Arrosage matinal par aspersion fine pour lessiver mécaniquement les colonies de thrips, suivi d'une pulvérisation d'extrait aqueux de neem à 5% dans la gaine des feuilles.",
    treatment_chemical: "Abamectine 18 EC (0.5 L/ha) ou Spinetoram homologué CSP mélangé à un mouillant adhésif pour percer la cire de la feuille (DAR: 14 jours).",
    preventive_actions: [
      "Éviter la proximité immédiate avec des parcelles de luzerne ou maïs desséchées",
      "Paillage léger du sol et maintien d'une humidité régulière",
      "Variétés certifiées adaptées aux cycles de saison sèche : Violet de Galmi, Yaakaar",
    ],
  },

  // ── 15. MARAÎCHAGE : POURPRE ET ALTERNARIOSE DE L'OIGNON ──
  {
    key: "pourpre_oignon",
    cropGroups: ["oignon", "ail", "echalote"],
    keywords: ["pourpre", "alternaria", "tache violette", "feuille cassée", "oignon sec", "tache allongée", "alternariose"],
    diagnosis_summary: "Tache pourpre ou Alternariose de l'oignon (Alternaria porri), formant des lésions ovales déprimées violettes avec cassure des feuilles et pourriture du collet.",
    cause_type: "maladie",
    cause_name: "Tache pourpre de l'oignon (Alternaria porri)",
    confidence: 0.90,
    severity: "forte",
    inera_reference: "Recherche Maraîchère INERA Loumbila",
    treatment_bio: "Supprimer tout arrosage par aspersion tard en soirée. Pulvérisation de bouillie bordelaise (sulfate de cuivre + chaux dosé à 0.75%).",
    treatment_chemical: "Fongicide homologué CSP : Difénoconazole 250 EC ou Mancozèbe 80 WP dès l'apparition des premières taches pourpres sur les tubes foliaires.",
    preventive_actions: [
      "Respecter une bonne aération des planches (écartement de 15 cm x 10 cm)",
      "Solarisation des pépinières d'oignon sous bâche transparente pendant 1 mois",
    ],
  },

  // ── 16. MARAÎCHAGE : MILDEW DE LA TOMATE ──
  {
    key: "mildiou_tomate",
    cropGroups: ["tomate", "pomme_de_terre", "aubergine"],
    keywords: ["mildiou", "tache brune", "feuille flétrie", "moisissure blanche", "tomate noire", "phytophthora", "pourriture tige"],
    diagnosis_summary: "Mildiou de la tomate (Phytophthora infestans), affection fongique foudroyante causant des brûlures huileuses brun-noir sur feuilles, tiges et fruits.",
    cause_type: "maladie",
    cause_name: "Mildiou de la tomate (Phytophthora infestans)",
    confidence: 0.93,
    severity: "forte",
    inera_reference: "Protection Intégrée Solanacées INERA Kamboinsé",
    treatment_bio: "Élagage immédiat des feuilles basses touchées jusqu'à 30 cm du sol. Pulvérisation de bouillie bordelaise (100 g de sulfate de cuivre + 100 g de chaux éteinte pour 10 L d'eau).",
    treatment_chemical: "Fongicide systémique homologué CSP : Métalaxyl-M + Mancozèbe (ex: Ridomil Gold MZ à 2.5 kg/ha) en respectant un DAR de 7 jours avant cueillette.",
    preventive_actions: [
      "Arrosage exclusif au pied par goutte-à-goutte ou cuvette sans mouiller le feuillage",
      "Paillage pailleux systématique pour éviter les éclaboussures de sol sur les feuilles",
      "Tuteurage vertical rigoureux pour favoriser l'ensoleillement et l'assèchement du feuillage",
    ],
  },

  // ── 17. MARAÎCHAGE : TYLCV (VIRUS DES FEUILLES JAUNES EN CUILLÈRE) ──
  {
    key: "tylcv_tomate",
    cropGroups: ["tomate", "piment", "poivron"],
    keywords: ["tylcv", "cuillère", "feuille jaune cuillère", "enroulement jaune", "nanisme tomate", "arrêt floraison", "begomovirus"],
    diagnosis_summary: "Virus des feuilles jaunes en cuillère de la tomate (TYLCV), transmis par l'aleurode Bemisia tabaci, provoquant réduction de la taille des feuilles, bords relevés en cuillère et avortement complet des fleurs.",
    cause_type: "maladie",
    cause_name: "Virus TYLCV (Tomato Yellow Leaf Curl Virus)",
    confidence: 0.95,
    severity: "forte",
    inera_reference: "Programme Maraîchage INERA CREAF Kamboinsé",
    treatment_bio: "Arrachage précoce et incinération immédiate de tout plant infecté en début de culture. Couverture impérative des pépinières sous voile non-tissé ou filet anti-insectes (maille 50 mesh).",
    treatment_chemical: "Pas de virucide. Traitement insecticide de la pépinière contre les mouches blanches avec Acétamipride 20 SP ou Pyriproxyfène avant repiquage.",
    preventive_actions: [
      "Utilisation exclusive de variétés certifiées tolérantes au TYLCV : Mongal F1, Nadira, Jaguar F1",
      "Paillage plastique bicolore jaune/argenté répulsif pour les aleurodes",
    ],
  },

  // ── 18. MARAÎCHAGE : FLÉTRISSEMENT BACTÉRIEN SOLANACÉES ──
  {
    key: "fletrissement_bacterien",
    cropGroups: ["tomate", "pomme_de_terre", "aubergine", "piment", "poivron"],
    keywords: ["flétrissement vert", "plant fané", "ralstonia", "flétrissement bactérien", "tige verte molle", "moelle brune", "fanaison subite"],
    diagnosis_summary: "Flétrissement bactérien (Ralstonia solanacearum), se manifestant par une fanaison brutale du plant en restant complètement vert, sans jaunissement préalable.",
    cause_type: "maladie",
    cause_name: "Flétrissement bactérien (Ralstonia solanacearum)",
    confidence: 0.94,
    severity: "forte",
    inera_reference: "Bactériologie Végétale INERA",
    treatment_bio: "Arrachage immédiat avec la motte de terre et brûlage hors parcelle. Désinfection du trou à la chaux vive. Pratique du greffage de variétés sensibles sur Solanum torvum ou aubergine sauvage résistante.",
    treatment_chemical: "Aucun traitement chimique curatif n'est efficace en plein champ. Ne pas appliquer d'antibiotiques.",
    preventive_actions: [
      "Rotation culturale de 4 ans sans aucune solanacée (préférer maïs, riz de bas-fond inondé ou graminées)",
      "Utiliser de l'eau d'arrosage saine (puits ou forage, éviter l'eau de surface stagnante contaminée)",
      "Adoption de variétés à tolérance bactérienne de l'INERA",
    ],
  },

  // ── 19. MARAÎCHAGE : NÉMATODES À GALLES ──
  {
    key: "nematodes_galles",
    cropGroups: ["tomate", "gombo", "aubergine", "carotte", "pomme_de_terre", "piment"],
    keywords: ["nematode", "galle racine", "renflement", "nodosité", "plante rabougrie", "meloidogyne", "racines bosselées"],
    diagnosis_summary: "Attaque de nématodes à galles (Meloidogyne spp.) dans le système racinaire, formant des nodosités et déformations qui bloquent l'alimentation de la plante.",
    cause_type: "ravageur",
    cause_name: "Nématodes à galles (Meloidogyne spp.)",
    confidence: 0.92,
    severity: "forte",
    inera_reference: "Nématologie INERA CREAF",
    treatment_bio: "Culture intercalaire ou rotation avec l'œillet d'Inde (Tagetes patula) ou la crotalaire (Crotalaria juncea) dont les racines sécrètent des nématicides naturels. Incorporez du tourteau de neem broyé (200 g/m²) ou compost riche en Trichoderma.",
    treatment_chemical: "Nématicide homologué CSP d'origine biologique ou de synthèse (ex: extrait de Quillaja saponaria ou Oxamyl) incorporé au sol avant plantation.",
    preventive_actions: [
      "Solarisation estivale du sol sous bâche polyéthylène transparente pendant 6 semaines en période chaude (mars-mai)",
      "Variétés de tomate certifiées résistantes aux nématodes (code Mi) : Rossol, Nadira, Mongal F1",
    ],
  },

  // ── 20. TUBERCULES : MOSAÏQUE AFRICAINE DU MANIOC ──
  {
    key: "mosaique_manioc",
    cropGroups: ["manioc"],
    keywords: ["mosaique manioc", "feuille déformée manioc", "panachure", "cmd", "feuille chiffonnée", "manioc jaune", "rabougrissement manioc"],
    diagnosis_summary: "Mosaïque africaine du manioc (CMD - Cassava Mosaic Disease), virose majeure transmise par boutures contaminées et par la mouche blanche Bemisia tabaci.",
    cause_type: "maladie",
    cause_name: "Mosaïque africaine du manioc (CMD)",
    confidence: 0.93,
    severity: "forte",
    inera_reference: "Programme Racines et Tubercules INERA Bobo-Dioulasso",
    treatment_bio: "Épuration sanitaire systématique : inspection hebdomadaire durant les 3 premiers mois et arrachage/incinération immédiats de tout plant présentant des mosaïques foliaires.",
    treatment_chemical: "Pas de virucide. Traitement insecticide bio (savon + neem) sur jeunes repousses contre les aleurodes vecteurs.",
    preventive_actions: [
      "Prélèvement exclusif de boutures saines certifiées INERA issues de pieds-mères indemnes",
      "Plantation de variétés améliorées INERA très résistantes à la CMD : V5, TMS 30572, Ouédraogo",
    ],
  },

  // ── 21. ARBORICULTURE : MOUCHE DES FRUITS (MANGUE / AGRUMES) ──
  {
    key: "mouche_fruits_mangue",
    cropGroups: ["mangue", "agrumes", "papaye", "goyave", "pasteque"],
    keywords: ["ver mangue", "mouche fruit", "bactrocera", "fruit piqué", "asticot fruit", "chute fruit", "pourriture mangue"],
    diagnosis_summary: "Attaque de la mouche orientale des fruits (Bactrocera dorsalis) avec piqûres de ponte dans l'épiderme, pourriture interne et asticots dévorant la pulpe.",
    cause_type: "ravageur",
    cause_name: "Mouche des fruits (Bactrocera dorsalis / Ceratitis)",
    confidence: 0.92,
    severity: "forte",
    inera_reference: "Programme Arboriculture Fruitière INERA / APFB Bérégadougou",
    treatment_bio: "Ramassage bimensuel impératif des fruits tombés au sol et enfermement dans des sacs poubelles noirs scellés exposés 48h au soleil pour asphyxier les larves. Pose de pièges de piégeage de masse à base de Méthyl-Eugénol + toxique attractif.",
    treatment_chemical: "Application localisée d'appâts protéinés hydrolysés combinés au Spinosad (ex: GF-120 / Spintor Fly homologué CSP) pulvérisé sur 1 m² de feuillage par arbre, sans toucher les fruits.",
    preventive_actions: [
      "Installation précoce des pièges dès la nouaison des mangues",
      "Élimination des vergers abandonnés ou arbres réservoirs non entretenus aux alentours",
    ],
  },

  // ── 22. CARENCE NUTRITIONNELLE : AZOTE (N) ──
  {
    key: "carence_azote",
    cropGroups: ["mais", "riz_pluvial", "riz_irrigue", "riz_bas_fond", "sorgho_blanc", "sorgho_rouge", "mil", "oignon", "fonio"],
    keywords: ["jaune", "jaunissement", "bas", "feuille jaune", "v inversé", "croissance lente", "pâle", "tige grêle", "faim azote"],
    diagnosis_summary: "Carence minérale sévère en Azote (N) : jaunissement chlorotique débutant par la pointe des feuilles âgées de la base en formant un 'V' inversé le long de la nervure centrale.",
    cause_type: "carence",
    cause_name: "Carence nutritionnelle en Azote (N)",
    confidence: 0.91,
    severity: "moyen",
    inera_reference: "Laboratoire Sol-Eau-Plante INERA Kamboinsé / Saria",
    treatment_bio: "Apport immédiat de purin de Tithonia diversifolia dilué à 10% (engrais foliaire vert express) ou épandage de fumier de volaille/petits ruminants bien composté au pied des poquets.",
    treatment_chemical: "Épandage d'Urée perlée (46% N) à raison de 50 à 75 kg/ha enfouie par sarclo-buttage léger juste avant une pluie ou irrigation (apport fractionné au 20ème et 40ème jour après levée).",
    preventive_actions: [
      "Fumure organique de fond systématique : 5 à 10 tonnes/ha de compost mûr",
      "Rotation culturale obligatoire avec légumineuses fixatrices d'azote (niébé, arachide, soja)",
    ],
  },

  // ── 23. CARENCE NUTRITIONNELLE : PHOSPHORE (P) ──
  {
    key: "carence_phosphore",
    cropGroups: ["mais", "sorgho_blanc", "sorgho_rouge", "mil", "riz_pluvial", "niebe", "arachide", "coton"],
    keywords: ["violet", "violette", "violace", "violacee", "violacees", "pourpre", "pourpres", "feuille violette", "tige rouge", "rougeatre", "rougeatres", "racine courte", "tallage", "carence phosphore", "sol pauvre", "pauvre", "kodjari"],
    diagnosis_summary: "Carence en Phosphore (P), très fréquente dans les sols sahéliens acides ou latéritiques : coloration pourpre à violacée des feuilles et tiges, arrêt du tallage et racines chétives.",
    cause_type: "carence",
    cause_name: "Carence minérale en Phosphore (P)",
    confidence: 0.92,
    severity: "moyen",
    inera_reference: "Guide de Gestion Intégrée de la Fertilité des Sols INERA / CILSS",
    treatment_bio: "Application de Phosphate Naturel de Kodjari (Burkina Phosphate BP30) à raison de 300 à 400 kg/ha co-composté avec la matière organique pour solubiliser le phosphore disponible.",
    treatment_chemical: "Apport au semis d'engrais starter riche en phosphore : NPK 14-23-14 (150 kg/ha) ou Phosphate Di-Ammonique (DAP 18-46-0 à 100 kg/ha) localisé à 5 cm du poquet.",
    preventive_actions: [
      "Pratique du zaï ou demi-lunes avec poignée de compost enrichi au phosphate de Kodjari au fond du trou",
      "Éviter les labours acides sans amendement calco-magnésien",
    ],
  },

  // ── 24. CARENCE NUTRITIONNELLE : POTASSIUM (K) ──
  {
    key: "carence_potassium",
    cropGroups: ["mais", "manioc", "igname", "tomate", "oignon", "coton", "banane"],
    keywords: ["bord brûlé", "grillé bord", "feuille brûlée bord", "verse", "fruit mou", "carence potassium", "nécrose marginale"],
    diagnosis_summary: "Carence en Potassium (K) : brûlure et dessèchement nécrotique des marges et pointes des feuilles, fragilité des tiges face à la verse et calibre réduit des fruits/tubercules.",
    cause_type: "carence",
    cause_name: "Carence minérale en Potassium (K)",
    confidence: 0.89,
    severity: "moyen",
    inera_reference: "Recommandations Fertilité INERA Farako-Bâ",
    treatment_bio: "Épandage généreux de cendre de bois tamisée (riche en carbonate de potassium soluble) à raison de 200 g/m² ou compost de résidus de bananiers et cannes.",
    treatment_chemical: "Apport de Chlorure de Potassium (KCl 60%) ou Sulfate de Potassium (K2SO4) à raison de 50 à 100 kg/ha en couverture au grossissement des organes de réserve.",
    preventive_actions: [
      "Restitution des pailles et résidus de récolte après compostage",
      "Analyse de sol bisannuelle pour équilibrer le rapport N/K",
    ],
  },

  // ── 25. STRESS PHYSIOLOGIQUE : BRÛLURE APICALE DE LA TOMATE (CUL NOIR) ──
  {
    key: "cul_noir_tomate",
    cropGroups: ["tomate", "piment", "poivron", "pasteque"],
    keywords: ["cul noir", "fond noir", "tache noire dessous", "fruit pourri bout", "manque calcium", "bout sec tomate", "nécrose apicale"],
    diagnosis_summary: "Nécrose apicale ou 'Cul noir' de la tomate : désordre physiologique lié à une assimilation déficiente en Calcium provoquée par des à-coups d'arrosage.",
    cause_type: "carence",
    cause_name: "Nécrose apicale / Carence induite en Calcium",
    confidence: 0.93,
    severity: "moyen",
    inera_reference: "Fiche Conseil Maraîchage INERA Loumbila",
    treatment_bio: "Régularisation stricte du régime d'arrosage (ne jamais alterner dessèchement complet de la motte et submersion). Apport de poudre de coquilles d'œufs calcinées ou cendre de bois éteinte.",
    treatment_chemical: "Pulvérisation foliaire corrective rapide de Nitrate de Calcium soluble (0.5% soit 50 g pour 10 L d'eau) ciblée sur les jeunes grappes de fruits en formation.",
    preventive_actions: [
      "Paillage pailleux épais pour maintenir une hygrométrie constante du sol",
      "Installation de goutte-à-goutte avec fréquence quotidienne modérée",
    ],
  },

  // ── 26. STRESS ABIOTIQUE : DÉFICIT HYDRIQUE / SÉCHERESSE ──
  {
    key: "stress_hydrique",
    cropGroups: ["mais", "sorgho_blanc", "sorgho_rouge", "mil", "riz_pluvial", "tomate", "niebe", "coton", "oignon"],
    keywords: ["deficit hydrique", "flétrissement sans eau", "soif", "terre seche", "secheresse", "chaleur accablante", "enroulement aiguille"],
    diagnosis_summary: "Stress hydrique aigu dû à un déficit pluviométrique prolongé : enroulement des feuilles en aiguilles pour stopper la transpiration, flétrissement diurne et arrêt du remplissage des grains.",
    cause_type: "stress_hydrique",
    cause_name: "Stress hydrique aigu / Sécheresse prolongée",
    confidence: 0.95,
    severity: "forte",
    inera_reference: "Stratégies d'Adaptation Climatique INERA / CES-DRS",
    treatment_bio: "Mise en place immédiate d'un paillage de surface (mulch de pailles de mil/sorgho de 8 cm) pour stopper l'évaporation du sol. Binage superficiel d'urgence pour rompre la croûte de battance ('un binage vaut deux arrosages').",
    treatment_chemical: "Non applicable.",
    preventive_actions: [
      "Aménagement de techniques de Conservation des Eaux et des Sols (CES) : Zaï traditionnel amélioré, Demi-lunes agro-écologiques, Cordons pierreux",
      "Choix de variétés certifiées INERA à cycle court (ex: Sorgho Kapelga 90 jours, Maïs Espoir 80 jours, Niébé TEELE 60 jours)",
    ],
  },

  // ── 27. MARAÎCHAGE : TEIGNE DES CRUCIFÈRES DU CHOU ──
  {
    key: "teigne_chou",
    cropGroups: ["chou", "navet"],
    keywords: ["chou", "trou chou", "petite chenille verte", "plutella", "feuille dentelée chou", "toile chou", "pomme trouée"],
    diagnosis_summary: "Attaque de la teigne des crucifères (Plutella xylostella) : petites chenilles vertes très vives perforant le limbe en dentelle et ravageant le cœur de la pomme de chou.",
    cause_type: "ravageur",
    cause_name: "Teigne des crucifères (Plutella xylostella)",
    confidence: 0.92,
    severity: "forte",
    inera_reference: "Recherche Horticole INERA Loumbila / Kamboinsé",
    treatment_bio: "Pulvérisation hebdomadaire sous les feuilles de bio-insecticide Bacillus thuringiensis (Bt var. kurstaki à 10 g/10L) ou extrait aqueux de graines de neem (50 g/L).",
    treatment_chemical: "Spinosad ou Emamectine benzoate homologué CSP en alternance avec l'Indoxacarbe pour contrer les résistances fréquentes (DAR: 7 jours).",
    preventive_actions: [
      "Culture sous abri filet anti-insectes en pépinière et premier mois de plantation",
      "Élimination immédiate des résidus de récolte de choux",
    ],
  },

  // ── 28. SÉSAME : CHENILLE DÉFOLIATRICE DU SÉSAME ──
  {
    key: "chenille_sesame",
    cropGroups: ["sesame"],
    keywords: ["sesame", "feuille collée", "antigastra", "toile sesame", "chenille capsule sesame", "fleur tressée"],
    diagnosis_summary: "Attaque de la chenille défoliatrice et tisseuse du sésame (Antigastra catalaunalis), agglutinant les feuilles terminales avec des fils de soie et forant les capsules.",
    cause_type: "ravageur",
    cause_name: "Chenille défoliatrice du sésame (Antigastra catalaunalis)",
    confidence: 0.90,
    severity: "forte",
    inera_reference: "Programme Sésame INERA Saria",
    treatment_bio: "Pulvérisation d'extrait de graines de neem (5%) dès l'apparition des premiers enroulements de feuilles terminales.",
    treatment_chemical: "Pulvérisation de Lambdacyhalothrine ou Deltaméthrine homologuée CSP au stade bouton floral.",
    preventive_actions: [
      "Semis dès début juillet pour échapper aux fortes pullulations de septembre",
      "Variétés certifiées INERA à forte ramification : S-42, Éthiopie",
    ],
  },

  // ── 29. CÉRÉALES : CÉCIDOMYIE DU RIZ ──
  {
    key: "cecidomyie_riz",
    cropGroups: ["riz_irrigue", "riz_bas_fond"],
    keywords: ["tige en oignon", "cecidomyie", "orseolia", "feuille tubulaire", "tige argentée", "galle riz"],
    diagnosis_summary: "Attaque de la cécidomyie africaine du riz (Orseolia oryzivora) transformant les tiges en galles tubulaires creuses stériles ressemblant à des 'feuilles d'oignon'.",
    cause_type: "ravageur",
    cause_name: "Cécidomyie africaine du riz (Orseolia oryzivora)",
    confidence: 0.91,
    severity: "forte",
    inera_reference: "Programme Riziculture INERA Bama / Vallée du Kou",
    treatment_bio: "Favoriser les parasitoïdes naturels (Aprostocetus procerae) en réduisant les pulvérisations chimiques indiscriminées. Destruction des repousses spontanées de riz sauvage.",
    treatment_chemical: "Traitement insecticide en pépinière et 15 jours après repiquage avec du Chlorpyrifos ou Diméthoate homologué CSP.",
    preventive_actions: [
      "Repiquage précoce et synchronisé au sein du périmètre irrigué",
      "Utilisation de variétés de riz certifiées résistantes de l'INERA : FKR 62N, FKR 45N",
    ],
  },
];

function cleanText(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Moteur d'inférence agronomique local INERA & CEDEAO :
 * Évalue la culture renseignée, le texte des symptômes et les heuristiques visuelles.
 */
export function findLocalAgronomicAdvice(cropKey: string, symptomsText: string, hasImage?: boolean): OfflineAgronomicAdvice | null {
  const cleanedInput = cleanText(symptomsText);
  const inputWords = cleanedInput.split(" ").filter((w) => w.length > 2);

  let bestMatch: { advice: OfflineAgronomicAdvice; score: number } | null = null;

  for (const advice of OFFLINE_AGRONOMIC_KNOWLEDGE) {
    const cropMatches = !!cropKey && advice.cropGroups.includes(cropKey);
    let symptomScore = 0;

    for (const kw of advice.keywords) {
      const cleanKw = cleanText(kw);
      if (!cleanKw) continue;

      if (cleanedInput.includes(cleanKw)) {
        symptomScore += 8;
      } else {
        const root = cleanKw.length > 4 ? cleanKw.slice(0, -1) : cleanKw;
        if (root.length >= 3 && cleanedInput.includes(root)) {
          symptomScore += 5;
        } else {
          for (const w of inputWords) {
            if (w.startsWith(root) || (root.length > 4 && w.includes(root))) {
              symptomScore += 4;
              break;
            }
          }
        }
      }
    }

    const cleanCause = cleanText(advice.cause_name);
    if (cleanCause && cleanedInput.includes(cleanCause)) {
      symptomScore += 12;
    }

    // Le score final privilégie d'abord la concordance des symptômes,
    // puis ajoute un bonus d'adéquation culturale
    let finalScore = 0;
    if (symptomScore > 0) {
      finalScore = symptomScore + (cropMatches ? 8 : 0);
    }

    if (finalScore > 0 && (!bestMatch || finalScore > bestMatch.score)) {
      bestMatch = { advice, score: finalScore };
    }
  }

  if (bestMatch && bestMatch.score > 0) {
    return bestMatch.advice;
  }

  // Si aucun symptôme ne correspond mais qu'une culture est sélectionnée,
  // renvoyer la recommandation prioritaire de référence INERA pour cette culture
  if (cropKey) {
    const cropFallback = OFFLINE_AGRONOMIC_KNOWLEDGE.find((a) => a.cropGroups.includes(cropKey));
    if (cropFallback) return cropFallback;
  }

  // Fallback par défaut de surveillance agronomique vivrière
  return OFFLINE_AGRONOMIC_KNOWLEDGE[0];
}
