// Cultures pratiquées au Burkina Faso (référence hors-ligne)
export interface CropOption { key: string; label: string; group: string }

export const BURKINA_CROPS: CropOption[] = [
  // Céréales
  { key: "mil", label: "Mil", group: "Céréales" },
  { key: "sorgho_blanc", label: "Sorgho blanc", group: "Céréales" },
  { key: "sorgho_rouge", label: "Sorgho rouge", group: "Céréales" },
  { key: "mais", label: "Maïs", group: "Céréales" },
  { key: "riz_pluvial", label: "Riz pluvial", group: "Céréales" },
  { key: "riz_irrigue", label: "Riz irrigué", group: "Céréales" },
  { key: "riz_bas_fond", label: "Riz de bas-fond", group: "Céréales" },
  { key: "fonio", label: "Fonio", group: "Céréales" },
  { key: "ble", label: "Blé", group: "Céréales" },

  // Légumineuses
  { key: "niebe", label: "Niébé (haricot)", group: "Légumineuses" },
  { key: "arachide", label: "Arachide", group: "Légumineuses" },
  { key: "voandzou", label: "Voandzou (pois de terre)", group: "Légumineuses" },
  { key: "soja", label: "Soja", group: "Légumineuses" },
  { key: "pois_sucre", label: "Pois sucré", group: "Légumineuses" },

  // Tubercules et racines
  { key: "igname", label: "Igname", group: "Tubercules & racines" },
  { key: "manioc", label: "Manioc", group: "Tubercules & racines" },
  { key: "patate_douce", label: "Patate douce", group: "Tubercules & racines" },
  { key: "pomme_de_terre", label: "Pomme de terre", group: "Tubercules & racines" },
  { key: "taro", label: "Taro", group: "Tubercules & racines" },
  { key: "souchet", label: "Souchet", group: "Tubercules & racines" },

  // Cultures de rente
  { key: "coton", label: "Coton", group: "Cultures de rente" },
  { key: "sesame", label: "Sésame", group: "Cultures de rente" },
  { key: "anacarde", label: "Anacardier (noix de cajou)", group: "Cultures de rente" },
  { key: "karite", label: "Karité", group: "Cultures de rente" },
  { key: "canne_a_sucre", label: "Canne à sucre", group: "Cultures de rente" },
  { key: "tournesol", label: "Tournesol", group: "Cultures de rente" },
  { key: "hibiscus", label: "Oseille de Guinée (bissap)", group: "Cultures de rente" },
  { key: "tabac", label: "Tabac", group: "Cultures de rente" },

  // Maraîchage
  { key: "tomate", label: "Tomate", group: "Maraîchage" },
  { key: "oignon", label: "Oignon", group: "Maraîchage" },
  { key: "chou", label: "Chou", group: "Maraîchage" },
  { key: "aubergine", label: "Aubergine", group: "Maraîchage" },
  { key: "aubergine_africaine", label: "Aubergine africaine (gombo local)", group: "Maraîchage" },
  { key: "gombo", label: "Gombo", group: "Maraîchage" },
  { key: "piment", label: "Piment", group: "Maraîchage" },
  { key: "poivron", label: "Poivron", group: "Maraîchage" },
  { key: "carotte", label: "Carotte", group: "Maraîchage" },
  { key: "laitue", label: "Laitue", group: "Maraîchage" },
  { key: "concombre", label: "Concombre", group: "Maraîchage" },
  { key: "courgette", label: "Courgette", group: "Maraîchage" },
  { key: "courge", label: "Courge / citrouille", group: "Maraîchage" },
  { key: "haricot_vert", label: "Haricot vert", group: "Maraîchage" },
  { key: "betterave", label: "Betterave", group: "Maraîchage" },
  { key: "navet", label: "Navet", group: "Maraîchage" },
  { key: "ail", label: "Ail", group: "Maraîchage" },
  { key: "echalote", label: "Échalote", group: "Maraîchage" },
  { key: "amarante", label: "Amarante", group: "Maraîchage" },
  { key: "epinard", label: "Épinard", group: "Maraîchage" },
  { key: "celeri", label: "Céleri", group: "Maraîchage" },
  { key: "persil", label: "Persil", group: "Maraîchage" },
  { key: "menthe", label: "Menthe", group: "Maraîchage" },
  { key: "moringa", label: "Moringa", group: "Maraîchage" },
  { key: "oseille_feuille", label: "Oseille feuille", group: "Maraîchage" },

  // Fruits
  { key: "mangue", label: "Manguier", group: "Fruits" },
  { key: "banane", label: "Bananier", group: "Fruits" },
  { key: "papaye", label: "Papayer", group: "Fruits" },
  { key: "agrumes", label: "Agrumes (orange, citron)", group: "Fruits" },
  { key: "goyave", label: "Goyavier", group: "Fruits" },
  { key: "pasteque", label: "Pastèque", group: "Fruits" },
  { key: "melon", label: "Melon", group: "Fruits" },
  { key: "ananas", label: "Ananas", group: "Fruits" },
  { key: "avocat", label: "Avocatier", group: "Fruits" },
  { key: "tamarin", label: "Tamarinier", group: "Fruits" },
  { key: "baobab", label: "Baobab (feuilles/fruits)", group: "Fruits" },
  { key: "jujube", label: "Jujubier", group: "Fruits" },
  { key: "dattier_desert", label: "Balanites (dattier du désert)", group: "Fruits" },
  { key: "neree", label: "Néré", group: "Fruits" },

  // Fourrages
  { key: "niebe_fourrager", label: "Niébé fourrager", group: "Fourrages" },
  { key: "mucuna", label: "Mucuna", group: "Fourrages" },
  { key: "brachiaria", label: "Brachiaria", group: "Fourrages" },
  { key: "sorgho_fourrager", label: "Sorgho fourrager", group: "Fourrages" },
  { key: "dolique", label: "Dolique", group: "Fourrages" },
];

export const CROP_GROUPS = Array.from(new Set(BURKINA_CROPS.map((c) => c.group)));

export const cropLabel = (key?: string | null) =>
  BURKINA_CROPS.find((c) => c.key === key)?.label ?? (key || "Non précisée");
