import { describe, it, expect } from "vitest";
import { isValidUuid, isInvalidUuidError } from "@/hooks/useOfflineData";
import { phoneToDeterministicUuid } from "@/contexts/AuthContext";
import { isSubscriptionActive, getSubscriptionDaysRemaining, ProviderSubscription } from "@/lib/providerSubscription";

describe("UUID and Auth Sanitization", () => {
  it("correctly identifies valid and invalid UUIDs", () => {
    expect(isValidUuid("usr-22675774852")).toBe(false);
    expect(isValidUuid("not-a-uuid")).toBe(false);
    expect(isValidUuid("")).toBe(false);
    expect(isValidUuid(null)).toBe(false);
    expect(isValidUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    expect(isValidUuid("c81d4e2e-bcf2-11e6-869b-7df92533d2db")).toBe(true);
  });

  it("converts phone numbers to valid RFC 4122 deterministic UUIDs", () => {
    const uuid1 = phoneToDeterministicUuid("+22675774852");
    expect(isValidUuid(uuid1)).toBe(true);
    expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    // Deterministic: same phone produces same UUID
    const uuid2 = phoneToDeterministicUuid("+226 75 77 48 52");
    expect(uuid1).toBe(uuid2);

    // Does not produce 'usr-' prefix
    expect(uuid1.startsWith("usr-")).toBe(false);
  });

  it("detects PostgreSQL 22P02 invalid UUID syntax errors", () => {
    expect(isInvalidUuidError({ code: "22P02", message: 'invalid input syntax for type uuid: "usr-22675774852"' })).toBe(true);
    expect(isInvalidUuidError('invalid input syntax for type uuid: "usr-22675774852"')).toBe(true);
    expect(isInvalidUuidError({ code: "42P01", message: "relation does not exist" })).toBe(false);
  });
});

describe("Partner Provider Subscription", () => {
  it("determines active and expired states properly", () => {
    const activeSub: ProviderSubscription = {
      tier: "pro_prestataire",
      activityType: "polyvalent",
      companyName: "Faso Agri Tech",
      phone: "+226 70000000",
      email: "contact@faso.bf",
      location: "Bobo-Dioulasso",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      isActive: true,
      paymentMethod: "orange_money",
      toolsUnlocked: ["diagnostic_ia"],
    };
    expect(isSubscriptionActive(activeSub)).toBe(true);
    expect(getSubscriptionDaysRemaining(activeSub)).toBeGreaterThan(0);

    const expiredSub: ProviderSubscription = {
      ...activeSub,
      endDate: "2025-01-01",
    };
    expect(isSubscriptionActive(expiredSub)).toBe(false);
    expect(getSubscriptionDaysRemaining(expiredSub)).toBe(0);

    const inactiveSub: ProviderSubscription = {
      ...activeSub,
      isActive: false,
    };
    expect(isSubscriptionActive(inactiveSub)).toBe(false);
  });
});
