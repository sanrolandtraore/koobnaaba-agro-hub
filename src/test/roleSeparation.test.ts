import { describe, it, expect } from "vitest";
import {
  agriculteurNav,
  eleveurNav,
  partenaireNav,
  getNavForRole,
  roleLabelKeys,
  roleIcons,
} from "@/components/RoleSidebar";
import { Handshake, Wheat, Beef } from "lucide-react";

describe("Architecture & Module Consolidation: Agriculteur vs Partenaire Hub", () => {
  it("agriculteurNav contains ONLY planning and expert services, all other features stripped", () => {
    const paths = agriculteurNav.map((item) => item.to);

    // Must strictly include ONLY Planning and Service Expert
    expect(paths).toEqual(["/dashboard/crop-planning", "/dashboard/services"]);

    // Must NOT include deleted features
    expect(paths).not.toContain("/dashboard/farms");
    expect(paths).not.toContain("/dashboard/parcels");
    expect(paths).not.toContain("/dashboard/crop-cycles");
    expect(paths).not.toContain("/dashboard/harvests");
    expect(paths).not.toContain("/dashboard/equipment");
    expect(paths).not.toContain("/dashboard/activities");
    expect(paths).not.toContain("/dashboard/investment");
    expect(paths).not.toContain("/dashboard/calendar");
    expect(paths).not.toContain("/dashboard/workers");
    expect(paths).not.toContain("/dashboard/costs");
    expect(paths).not.toContain("/dashboard/analytics");

    // Must NOT include expert consulting or commercial tools
    expect(paths).not.toContain("/dashboard/expert-diagnosis");
    expect(paths).not.toContain("/dashboard/expert-prescriptions");
    expect(paths).not.toContain("/dashboard/scouting");
    expect(paths).not.toContain("/dashboard/partenaire-mes-offres");
  });

  it("partenaireNav consolidates Expert Agronome tools, Éleveur tools and Commercial tools", () => {
    const paths = partenaireNav.map((item) => item.to);

    // Pôle 1: Expert Agronome
    expect(paths).toContain("/dashboard/expert-diagnosis");
    expect(paths).toContain("/dashboard/expert-prescriptions");
    expect(paths).toContain("/dashboard/scouting");
    expect(paths).toContain("/dashboard/expert-calculator");
    expect(paths).toContain("/dashboard/expert-cartography");
    expect(paths).toContain("/dashboard/crop-library");

    // Pôle 2: Élevage & Zootechnie
    expect(paths).toContain("/dashboard/animals");
    expect(paths).toContain("/dashboard/animal-health");
    expect(paths).toContain("/dashboard/animal-feeding");
    expect(paths).toContain("/dashboard/animal-reproduction");
    expect(paths).toContain("/dashboard/livestock-services");

    // Pôle 3: Commerce & Chantiers
    expect(paths).toContain("/dashboard/partenaire-mes-offres");
    expect(paths).toContain("/dashboard/quote-requests");
    expect(paths).toContain("/dashboard/missions");
    expect(paths).toContain("/dashboard/interventions");
    expect(paths).toContain("/dashboard/equipment");
    expect(paths).toContain("/dashboard/provider-clients");
    expect(paths).toContain("/dashboard/revenus");

    // Pôle 4: Réseau Écosystème & Partenariats
    expect(paths).toContain("/dashboard/partenaire-fournisseurs");
    expect(paths).toContain("/dashboard/partenaire-assurance");
    expect(paths).toContain("/dashboard/partenaire-banques");
    expect(paths).toContain("/dashboard/partenaire-programmes");
    expect(paths).toContain("/dashboard/partners-directory");

    // Pôle 5: Gestion & Administration
    expect(paths).toContain("/dashboard/partenaire-abonnement");
    expect(paths).toContain("/dashboard/export");
    expect(paths).toContain("/dashboard/settings");
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

    expect(roleIcons.agriculteur).toBe(Wheat);
    expect(roleIcons.partenaire).toBe(Handshake);
    expect(roleIcons.eleveur).toBe(Beef);
  });
});
