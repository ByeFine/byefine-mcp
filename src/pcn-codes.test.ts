import { describe, expect, it } from "vitest";
import { explainCode, parseCode, PCN_CODES, searchCodes } from "./pcn-codes";

describe("council contravention codes", () => {
  it("reads a code however it is written", () => {
    expect(parseCode("1")).toEqual({ code: "01", suffix: "" });
    expect(parseCode("12r")).toEqual({ code: "12", suffix: "r" });
    expect(parseCode("Code 31J")).toEqual({ code: "31", suffix: "j" });
    expect(parseCode("hello")).toBeNull();
  });

  it("explains a code with its level and suffix, and never an amount", () => {
    const twelve = explainCode("12r")!;
    expect(twelve.level).toBe("higher");
    expect(twelve.suffix_means).toEqual(["residents' bay"]);
    expect(JSON.stringify(twelve)).not.toMatch(/£\s?\d/);
    expect(explainCode("31")?.level).toBe("moving_traffic");
    expect(explainCode("05")?.level).toBe("lower");
    expect(explainCode("13")).toBeNull();
  });

  it("finds codes from plain words", () => {
    expect(searchCodes("disabled bay").map((entry) => entry.code)).toEqual(expect.arrayContaining(["40", "87"]));
    expect(searchCodes("yellow box junction")[0]?.code).toBe("31");
    expect(searchCodes("dropped kerb")[0]?.code).toBe("27");
    expect(searchCodes("bus lane")[0]?.code).toBe("34");
  });

  it("has each code once and states no amounts", () => {
    expect(new Set(PCN_CODES.map((entry) => entry.code)).size).toBe(PCN_CODES.length);
    expect(JSON.stringify(PCN_CODES)).not.toMatch(/£/);
  });
});
