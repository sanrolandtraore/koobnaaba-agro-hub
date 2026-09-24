import { describe, it, expect } from "vitest";
import {
  agriculteurNav,
  eleveurNav,
  partenaireNav,
  getNavForRole,
  getNavLabel,
  roleLabelKeys,
  roleIcons,
} from "@/components/RoleSidebar";
import { Calculator, Store, Beef } from "lucide-react";

describe("Architecture & Cloisonnement Métier : Agriculteur vs Éleveur vs Espace Partenaire", () => {
  it("agriculteurNav contains strictly Pôle Végétal features, never livestock", () => {
    const paths = agriculteurNav.map((item) => item.to);

    // Pôle Végétal inclus
    expect(paths).toContain("/dashboard/crop-planning");
    expect(paths).toContain("/dashboard/crops");
    expect(paths).toContain("/dashboard/scouting");
    expect(paths).toContain("/dashboard/genius");
    expect(paths).toContain("/dashboard/crop-library");

    // Zéro bétail / médecine vétérinaire dans le Pôle Végétal
    expect(paths).not.toContain("/dashboard/animals");
    expect(paths).not.toContain("/dashboard/animal-health");
    expect(paths).not.toContain("/dashboard/animal-feeding");
    expect(paths).not.toContain("/dashboard/animal-reproduction");
    expect(paths).not.toContain("/dashboard/livestock-services");
  });

  it("eleveurNav contains strictly Pôle Élevage features, never crops or plant irrigation", () => {
    const paths = eleveurNav.map((item) => item.to);

    // Pôle Élevage inclus
    expect(paths).toContain("/dashboard/animals");
    expect(paths).toContain("/dashboard/animal-health");
    expect(paths).toContain("/dashboard/animal-feeding");
    expect(paths).toContain("/dashboard/animal-reproduction");
    expect(paths).toContain("/dashboard/livestock-services");

    // Zéro culture / fiches végétales dans le Pôle Élevage
    expect(paths).not.toContain("/dashboard/crops");
    expect(paths).not.toContain("/dashboard/crop-planning");
    expect(paths).not.toContain("/dashboard/crop-library");
  });

  it("partenaireNav contains strictly the 11 isolated sections of the dedicated Partner Space", () => {
    const paths = partenaireNav.map((item) => item.to);

    // Les 11 sections réglementaires strictes
    expect(paths).toContain("/dashboard/partner-space?tab=dashboard");
    expect(paths).toContain("/dashboard/partner-space?tab=presentation");
    expect(paths).toContain("/dashboard/partner-space?tab=services");
    expect(paths).toContain("/dashboard/partner-space?tab=produits");
    expect(paths).toContain("/dashboard/partner-space?tab=realisations");
    expect(paths).toContain("/dashboard/partner-space?tab=galerie");
    expect(paths).toContain("/dashboard/partner-space?tab=avis");
    expect(paths).toContain("/dashboard/partner-space?tab=contact");
    expect(paths).toContain("/dashboard/partner-space?tab=devis");
    expect(paths).toContain("/dashboard/partner-space?tab=commandes");
    expect(paths).toContain("/dashboard/partner-space?tab=statistiques");
    expect(paths.length).toBe(11);
  });

  it("getNavForRole routes agriculteur, eleveur and seamlessly maps partner & legacy roles to partenaireNav", () => {
    expect(getNavForRole("agriculteur").main).toBe(agriculteurNav);
    expect(getNavForRole("farmer").main).toBe(agriculteurNav);
    expect(getNavForRole("eleveur").main).toBe(eleveurNav);

    // Consolidated roles all map to the unified Partenaire Hub
    expect(getNavForRole("partenaire").main).toBe(partenaireNav);
    expect(getNavForRole("agent_technique").main).toBe(partenaireNav);
    expect(getNavForRole("expert").main).toBe(partenaireNav);
    expect(getNavForRole("formation").main).toBe(partenaireNav);
  });

  it("roleLabelKeys and icons correctly reflect consolidated roles", () => {
    expect(roleLabelKeys.agriculteur).toBe("roles.agriculteur");
    expect(roleLabelKeys.partenaire).toBe("roles.partenaire");
    expect(roleLabelKeys.agent_technique).toBe("roles.partenaire");
    expect(roleLabelKeys.formation).toBe("roles.partenaire");

    expect(roleIcons.agriculteur).toBe(Calculator);
    expect(roleIcons.partenaire).toBe(Store);
    expect(roleIcons.eleveur).toBe(Beef);
  });

  it("ensures zero 'nav.' prefixes exist in any navigation item and translates all required keys to French", () => {
    const allNavLists = [
      ...agriculteurNav,
      ...eleveurNav,
      ...partenaireNav,
    ];

    allNavLists.forEach((item) => {
      expect(item.labelKey).not.toMatch(/^nav\./);
    });

    // Required replacements test
    const requiredMappings: Record<string, string> = {
      "nav.aiDiagnosis": "Diagnostic IA",
      "nav.prescriptions": "Prescriptions",
      "nav.scouting": "Inspection terrain",
      "nav.calculator": "Calculateur agricole",
      "nav.gpsMapping": "Cartographie GPS",
      "nav.technicalSheets": "Fiches techniques",
      "nav.quoteRequests": "Demandes de devis",
      "Vitrine Publique": "Vitrine publique",
      "nav.providerSubscription": "Abonnement partenaire",
      "nav.settings": "Paramètres",
    };

    Object.entries(requiredMappings).forEach(([key, expectedLabel]) => {
      const resolved = getNavLabel({ to: "/dummy", labelKey: key, icon: Calculator });
      expect(resolved).toBe(expectedLabel);
    });
  });
});
