import { describe, expect, it } from "vitest";
import { calculateDeadlines, DeadlineError } from "./pcn-deadlines";

const find = (result: ReturnType<typeof calculateDeadlines>, words: string) => result.dates.find((entry) => entry.what.includes(words))?.date;

describe("calculateDeadlines", () => {
  it("counts a council PCN on the car with its printed date as day one", () => {
    const result = calculateDeadlines({ notice_type: "council_pcn_on_vehicle", notice_date: "2026-11-02", notice_to_owner_date: "2026-12-03", rejection_date: "2027-01-10" });
    expect(find(result, "reduced amount")).toBe("2026-11-15");
    expect(find(result, "Earliest day")).toBe("2026-11-30");
    expect(find(result, "Last day a Notice to Owner")).toBe("2027-05-01");
    expect(find(result, "formal representations against the Notice to Owner")).toBe("2026-12-30");
    expect(find(result, "tribunal")).toBe("2027-02-06");
    expect(result.checks).toEqual([]);
    expect(result.rules[0]?.rule).toContain("56 days");
  });

  it("flags a Notice to Owner dated after the six months", () => {
    const result = calculateDeadlines({ notice_type: "council_pcn_on_vehicle", notice_date: "2026-01-31", notice_to_owner_date: "2026-08-01" });
    expect(result.checks[0]?.finding).toContain("after 2026-07-30");
  });

  it("gives a camera parking PCN 21 days for the reduced amount and 28 for representations", () => {
    const result = calculateDeadlines({ notice_type: "council_parking_pcn_by_post", notice_date: "2026-11-02" });
    expect(find(result, "reduced amount")).toBe("2026-11-22");
    expect(find(result, "formal representations")).toBe("2026-11-29");
    expect(find(calculateDeadlines({ notice_type: "council_bus_lane_or_moving_traffic", notice_date: "2026-11-02" }), "reduced amount")).toBeUndefined();
  });

  it("finds a private Notice to Keeper that came too late, only when it is late however read", () => {
    const late = calculateDeadlines({ notice_type: "private_no_ticket_on_vehicle", notice_date: "2026-10-20", event_date: "2026-10-01" });
    expect(late.checks).toHaveLength(1);
    const inTime = calculateDeadlines({ notice_type: "private_no_ticket_on_vehicle", notice_date: "2026-10-12", event_date: "2026-10-01" });
    expect(inTime.checks).toEqual([]);
    expect(find(inTime, "parking company")).toBe("2026-11-08");
  });

  it("checks the window after a ticket on the car", () => {
    const late = calculateDeadlines({ notice_type: "private_ticket_on_vehicle", notice_date: "2026-09-01", notice_to_keeper_date: "2026-10-26" });
    expect(late.checks).toHaveLength(1);
    expect(calculateDeadlines({ notice_type: "private_ticket_on_vehicle", notice_date: "2026-09-01", notice_to_keeper_date: "2026-10-10" }).checks).toEqual([]);
  });

  it("refuses dates that are not dates", () => {
    expect(() => calculateDeadlines({ notice_type: "council_pcn_on_vehicle", notice_date: "2 Nov" })).toThrow(DeadlineError);
  });
});
