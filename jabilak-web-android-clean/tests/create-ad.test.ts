import { describe, expect, it } from "vitest";

import { calculateCampaignTotal, normalizeBudget, validateCampaignSubmission } from "../lib/ad-campaign";

describe("create ad campaign rules", () => {
  it("normalizes budget input and calculates the full campaign amount", () => {
    expect(normalizeBudget("35,000 د.ع")).toBe(35000);
    expect(calculateCampaignTotal(35000, 7)).toBe(245000);
  });

  it("requires consent and successful payment before submission", () => {
    expect(validateCampaignSubmission({ consent: false, paymentConfirmed: true, paymentMethod: "بطاقة إلكترونية" })).toBe("consent");
    expect(validateCampaignSubmission({ consent: true, paymentConfirmed: false, paymentMethod: "بطاقة إلكترونية" })).toBe("payment");
    expect(validateCampaignSubmission({ consent: true, paymentConfirmed: true, paymentMethod: "بطاقة إلكترونية" })).toBeNull();
  });
});
