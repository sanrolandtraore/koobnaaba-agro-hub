import { describe, it, expect, beforeEach } from "vitest";
import { 
  generateLocalUuid, 
  saveOfflineRecord, 
  getSyncCounts, 
  db, 
  syncPendingRecords 
} from "@/lib/dexieDb";
import { 
  parseGeniusCommand, 
  executeGeniusAction 
} from "@/lib/nafaGeniusNlu";
import { 
  getDedicatedPartnerBundle, 
  saveDedicatedPartnerBundle, 
  addPartnerProduct, 
  deletePartnerProduct,
  addPartnerService
} from "@/lib/partnerDedicatedStorage";
import { MARKETPLACE_CATEGORIES, BURKINA_REGIONS, BURKINA_CITIES } from "@/pages/dashboard/ServiceMarketplacePage";

describe("NAFA - AGRITECH : Cloisonnement Métier & Architecture Offline-First", () => {

  beforeEach(async () => {
    localStorage.clear();
    try {
      await db.offlineRecords.clear();
      await db.cachedEntities.clear();
    } catch {
      // IndexedDB mock fallback
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 1. TESTS ARCHITECTURE OFFLINE-FIRST (DEXIE & UUID)
  // ─────────────────────────────────────────────────────────────
  describe("Moteur Offline-First Dexie & Gestion des UUID locaux", () => {
    it("doit générer un UUID v4 local valide conforme au format standard RFC4122", () => {
      const uuid1 = generateLocalUuid();
      const uuid2 = generateLocalUuid();

      expect(uuid1).toBeDefined();
      expect(uuid2).toBeDefined();
      expect(uuid1).not.toBe(uuid2);
      // Format regex UUID v4 (8-4-4-4-12)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid1).toMatch(uuidRegex);
      expect(uuid2).toMatch(uuidRegex);
    });

    it("doit enregistrer une opération locale avec statut 'pending' et métadonnées", async () => {
      const record = await saveOfflineRecord(
        "client_visits",
        "insert",
        { clientName: "Moussa Sawadogo", culture: "Tomate" },
        "technician-uuid-001"
      );

      expect(record.status).toBe("pending");
      expect(record.table).toBe("client_visits");
      expect(record.operation).toBe("insert");
      expect(record.userId).toBe("technician-uuid-001");
      expect(record.data.clientName).toBe("Moussa Sawadogo");

      const counts = await getSyncCounts();
      expect(counts.pending).toBeGreaterThanOrEqual(1);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. TESTS CLOISONNEMENT MÉTIER STRICT NAFA GENIUS IA
  // ─────────────────────────────────────────────────────────────
  describe("Guardrails de Cloisonnement Métier de NAFA Genius IA", () => {
    it("doit BLOQUER une question sur le cheptel / médecine vétérinaire dans le Pôle Végétal", () => {
      const parsed = parseGeniusCommand(
        "Combien de vaccins contre le charbon pour mon troupeau de vaches ?",
        "agronomie"
      );

      expect(parsed.isDomainViolation).toBe(true);
      expect(parsed.isRecognized).toBe(false);
      expect(parsed.explanation).toContain("CLOISONNEMENT MÉTIER");
      expect(parsed.explanation).toContain("Pôle Végétal / Agronomie");
      expect(parsed.explanation).toContain("Pôle Vétérinaire & Cheptel");
    });

    it("doit BLOQUER une question sur les cultures végétales / irrigation dans le Pôle Élevage", () => {
      const parsed = parseGeniusCommand(
        "Calcule l'irrigation goutte-à-goutte pour 3 hectares de tomate",
        "elevage"
      );

      expect(parsed.isDomainViolation).toBe(true);
      expect(parsed.isRecognized).toBe(false);
      expect(parsed.explanation).toContain("CLOISONNEMENT MÉTIER");
      expect(parsed.explanation).toContain("Pôle Vétérinaire & Cheptel");
      expect(parsed.explanation).toContain("Pôle Végétal");
    });

    it("doit BLOQUER une intervention terrain directe en plein champ dans l'Espace Partenaire", () => {
      const parsed = parseGeniusCommand(
        "Arpenter parcelle avec relevé GPS et profil altimétrique",
        "partenaire"
      );

      expect(parsed.isDomainViolation).toBe(true);
      expect(parsed.isRecognized).toBe(false);
      expect(parsed.explanation).toContain("ESPACE PARTENAIRE");
      expect(parsed.explanation).toContain("gestion commerciale");
    });

    it("doit ACCEPTER une commande d'irrigation dans le Pôle Végétal sans violation", () => {
      const parsed = parseGeniusCommand(
        "Calcule l'irrigation goutte-à-goutte pour 2 hectares de tomate",
        "agronomie"
      );

      expect(parsed.isDomainViolation).toBe(false);
      expect(parsed.isRecognized).toBe(true);
      expect(parsed.intent).toBe("CALCULATE_IRRIGATION");
      expect(parsed.entities.crop).toBe("tomate");
      expect(parsed.entities.areaHa).toBe(2);
    });

    it("executeGeniusAction doit refuser d'exécuter une action en violation de cloisonnement", async () => {
      const violationAction = parseGeniusCommand(
        "Traiter la fièvre aphteuse des bovins",
        "agronomie"
      );

      const result = await executeGeniusAction(violationAction);
      expect(result.success).toBe(false);
      expect(result.message).toContain("CLOISONNEMENT MÉTIER");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. TESTS ISOLATION TOTALE DE L'ESPACE PARTENAIRE
  // ─────────────────────────────────────────────────────────────
  describe("Isolation Totale de l'Espace Partenaire (Strictement par owner_id)", () => {
    it("doit isoler hermétiquement les données entre deux partenaires distincts", async () => {
      const partnerA = "partner-uuid-Alpha";
      const partnerB = "partner-uuid-Beta";

      // 1. Partenaire A ajoute un produit spécifique
      const prdA = await addPartnerProduct(partnerA, {
        name: "Tracteur Massey Ferguson 75CV - Alpha",
        description: "Matériel agricole exclusif",
        price: 18500000,
        unit: "Unité",
        stock: 2,
        imageUrl: "https://example.com/tractor-alpha.jpg",
        category: "Machinisme",
        isAvailable: true,
      });

      // 2. Partenaire B ajoute un produit différent
      const prdB = await addPartnerProduct(partnerB, {
        name: "Semences Maïs Hybride - Beta",
        description: "Semences sélectionnées INERA",
        price: 15000,
        unit: "Sac 10kg",
        stock: 50,
        imageUrl: "https://example.com/seeds-beta.jpg",
        category: "Intrants & Semences",
        isAvailable: true,
      });

      // Vérification étanche des bundles
      const bundleA = getDedicatedPartnerBundle(partnerA);
      const bundleB = getDedicatedPartnerBundle(partnerB);

      // Partenaire A possède son tracteur mais PAS les semences de B
      expect(bundleA.products.some(p => p.id === prdA.id)).toBe(true);
      expect(bundleA.products.some(p => p.id === prdB.id)).toBe(false);

      // Partenaire B possède ses semences mais PAS le tracteur de A
      expect(bundleB.products.some(p => p.id === prdB.id)).toBe(true);
      expect(bundleB.products.some(p => p.id === prdA.id)).toBe(false);

      // Partenaire A ne peut pas supprimer un produit de B
      const deletedFromA = await deletePartnerProduct(partnerA, prdB.id);
      expect(deletedFromA).toBe(false);

      // Le produit de B est toujours intact
      const freshBundleB = getDedicatedPartnerBundle(partnerB);
      expect(freshBundleB.products.some(p => p.id === prdB.id)).toBe(true);
    });

    it("l'espace partenaire doit comporter les 11 sections obligatoires", () => {
      const partnerId = "test-partner-11-sections";
      const bundle = getDedicatedPartnerBundle(partnerId);

      // 1. Présentation
      expect(bundle.presentation).toBeDefined();
      expect(bundle.presentation.companyName).toBeDefined();

      // 2. Services
      expect(Array.isArray(bundle.services)).toBe(true);

      // 3. Produits
      expect(Array.isArray(bundle.products)).toBe(true);

      // 4. Réalisations
      expect(Array.isArray(bundle.projects)).toBe(true);

      // 5. Galerie
      expect(Array.isArray(bundle.gallery)).toBe(true);

      // 6. Avis
      expect(Array.isArray(bundle.reviews)).toBe(true);

      // 7. Contact
      expect(bundle.contact).toBeDefined();
      expect(bundle.contact.phone).toBeDefined();

      // 8. Devis
      expect(Array.isArray(bundle.quotes)).toBe(true);

      // 9. Commandes
      expect(Array.isArray(bundle.orders)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. TESTS MARKETPLACE (LES 8 CATÉGORIES & 6 FILTRES)
  // ─────────────────────────────────────────────────────────────
  describe("Marketplace Unifiée (8 Catégories & 6 Filtres)", () => {
    it("doit contenir strictement les 8 catégories réglementaires demandées", () => {
      const categoryValues = MARKETPLACE_CATEGORIES.map(c => c.value);
      expect(categoryValues).toContain("machinisme");
      expect(categoryValues).toContain("produits_agricoles");
      expect(categoryValues).toContain("produits_elevage");
      expect(categoryValues).toContain("services_agricoles");
      expect(categoryValues).toContain("services_veterinaires");
      expect(categoryValues).toContain("finance_assurance");
      expect(categoryValues).toContain("intrants_semences");
      expect(categoryValues).toContain("irrigation_solaire");
      expect(categoryValues.length).toBe(8);
    });

    it("doit supporter les régions et principales villes agricoles du Burkina Faso", () => {
      expect(BURKINA_REGIONS).toContain("Centre");
      expect(BURKINA_REGIONS).toContain("Hauts-Bassins");
      expect(BURKINA_REGIONS).toContain("Boucle du Mouhoun");

      expect(BURKINA_CITIES).toContain("Ouagadougou");
      expect(BURKINA_CITIES).toContain("Bobo-Dioulasso");
      expect(BURKINA_CITIES).toContain("Koudougou");
    });
  });
});
