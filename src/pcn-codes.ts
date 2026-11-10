/**
 * Council penalty charge notice contravention codes, for the MCP tools (src/lib/public-mcp.ts; owner, 10 November 2026). The
 * codes, descriptions and charge levels are the standard list London Councils publishes for London, England and Wales
 * ("Standard PCN Codes" v6.6.1, as published by councils such as Ealing), checked against Wandsworth's current page
 * (updated 13 April 2026). Codes reserved for TfL or the DVLA, and those used by one council only, are left out.
 *
 * No amounts, the same rule as the guides: what a higher or lower level charge costs depends on the council's band and
 * changes, and the notice states it. The statutory grounds are SI 2022/576 reg 5(4) (England), in plain words.
 */

export type CodeLevel = "higher" | "lower" | "moving_traffic";
export type CodeWhere = "on_street" | "off_street" | "moving_traffic";

export type PcnCode = { code: string; description: string; level: CodeLevel; where: CodeWhere; words?: string };

const on = (code: string, level: "higher" | "lower", description: string, words?: string): PcnCode => ({ code, description, level, where: "on_street", words });
const off = (code: string, level: "higher" | "lower", description: string, words?: string): PcnCode => ({ code, description, level, where: "off_street", words });
const moving = (code: string, description: string, words?: string): PcnCode => ({ code, description, level: "moving_traffic", where: "moving_traffic", words });

export const PCN_CODES: PcnCode[] = [
  on("01", "higher", "Parked in a restricted street during prescribed hours", "yellow line single double waiting restriction"),
  on("02", "higher", "Parked or loading / unloading in a restricted street where waiting and loading / unloading restrictions are in force", "yellow line kerb marks loading ban"),
  on("04", "lower", "Parked in a meter bay when penalty time is indicated", "meter"),
  on("05", "lower", "Parked after the expiry of paid for time", "expired ticket overstayed pay and display meter app"),
  on("06", "lower", "Parked without clearly displaying a valid pay & display ticket or voucher", "pay and display ticket not displayed"),
  on("07", "lower", "Parked with payment made to extend the stay beyond initial time", "meter feeding extend top up"),
  on("08", "lower", "Parked at an out-of-order meter during controlled hours", "broken meter"),
  on("09", "lower", "Parked displaying multiple pay & display tickets where prohibited", "two tickets"),
  on("10", "lower", "Parked without clearly displaying two valid pay and display tickets when required", "two tickets"),
  on("11", "lower", "Parked without payment of the parking charge", "not paid phone app cashless"),
  on("12", "higher", "Parked in a residents' or shared use parking place or zone without either clearly displaying a valid permit or voucher or pay and display ticket issued for that place, or without payment of the parking charge", "resident permit bay shared use visitor"),
  on("14", "higher", "Parked in an electric vehicles' charging place during restricted hours without charging", "ev electric charging"),
  on("16", "higher", "Parked in a permit space or zone without clearly displaying a valid permit", "permit bay"),
  on("18", "higher", "Using a vehicle in a parking place in connection with the sale or offering or exposing for sale of goods when prohibited", "selling trading"),
  on("19", "lower", "Parked in a residents' or shared use parking place or zone either displaying an invalid permit or voucher or pay and display ticket, or after the expiry of paid for time", "resident permit invalid wrong zone expired"),
  on("20", "higher", "Parked in a part of a parking place marked by a yellow line where waiting is prohibited", "yellow line between bays"),
  on("21", "higher", "Parked wholly or partly in a suspended bay or space", "suspension suspended bay"),
  on("22", "lower", "Re-parked in the same parking place or zone within one hour after leaving", "return no return"),
  on("23", "higher", "Parked in a parking place or area not designated for that class of vehicle", "motorcycle bay wrong class"),
  on("24", "lower", "Not parked correctly within the markings of the bay or space", "outside bay markings wheels over line"),
  on("25", "higher", "Parked in a loading place during restricted hours without loading", "loading bay"),
  on("26", "higher", "Parked in a special enforcement area more than 50 cm from the edge of the carriageway and not within a designated parking place", "double parking away from kerb"),
  on("27", "higher", "Parked in a special enforcement area adjacent to a footway, cycle track or verge lowered to meet the level of the carriageway", "dropped kerb driveway crossover"),
  on("28", "higher", "Parked in a special enforcement area on part of the carriageway raised to meet the level of a footway, cycle track or verge", "raised carriageway"),
  on("30", "lower", "Parked for longer than permitted", "overstayed time limit free bay"),
  on("35", "lower", "Parked in a disc parking place without clearly displaying a valid disc", "parking disc"),
  on("40", "higher", "Parked in a designated disabled person's parking place without displaying a valid disabled person's badge in the prescribed manner", "disabled blue badge bay"),
  on("41", "higher", "Parked in a parking place designated for diplomatic vehicles", "diplomatic"),
  on("42", "higher", "Parked in a parking place designated for police vehicles", "police bay"),
  on("43", "higher", "Stopped on a cycle docking station parking place", "bike hire docking"),
  on("45", "higher", "Parked on a taxi rank", "taxi rank"),
  on("46", "higher", "Stopped where prohibited (on a red route or clearway)", "red route clearway stopping"),
  on("47", "higher", "Stopped on a restricted bus stop or stand", "bus stop stand"),
  on("48", "higher", "Stopped in a restricted area outside a school, a hospital or a fire, police or ambulance station when prohibited", "school keep clear zig zag yellow"),
  on("49", "higher", "Parked wholly or partly on a cycle track or lane", "cycle lane track"),
  on("55", "higher", "A commercial vehicle parked in a restricted street in contravention of the Overnight Waiting Ban", "lorry overnight commercial"),
  on("56", "higher", "Parked in contravention of a commercial vehicle waiting restriction", "lorry commercial"),
  on("57", "higher", "Parked in contravention of a bus ban", "coach bus ban"),
  on("61", "higher", "A heavy commercial vehicle wholly or partly parked on a footway, verge or land between two carriageways", "lorry pavement footway verge"),
  on("62", "higher", "Parked with one or more wheels on or over a footpath or any part of a road other than a carriageway", "pavement footway verge kerb"),
  on("63", "lower", "Parked with engine running where prohibited", "idling engine running coach"),
  on("99", "higher", "Stopped on a pedestrian crossing or crossing area marked by zigzags", "zebra zig zag crossing"),
  off("70", "higher", "Parked in a loading area during restricted hours without reasonable excuse", "car park loading"),
  off("71", "higher", "Parked in an electric vehicles' charging place during restricted hours without charging", "car park ev electric charging"),
  off("73", "lower", "Parked without payment of the parking charge", "car park not paid app"),
  off("74", "higher", "Using a vehicle in a parking place in connection with the sale or offering or exposing for sale of goods when prohibited", "car park selling"),
  off("80", "lower", "Parked for longer than the maximum period permitted", "car park overstayed"),
  off("81", "higher", "Parked in a restricted area in a car park", "car park restricted hatched"),
  off("82", "lower", "Parked after the expiry of paid for time", "car park expired ticket"),
  off("83", "lower", "Parked in a car park without clearly displaying a valid pay & display ticket or voucher or parking clock", "car park ticket not displayed"),
  off("84", "lower", "Parked with payment made to extend the stay beyond initial time", "car park meter feeding"),
  off("85", "higher", "Parked in a permit bay without clearly displaying a valid permit", "car park permit"),
  off("86", "lower", "Not parked correctly within the markings of a bay or space", "car park outside bay markings"),
  off("87", "higher", "Parked in a designated disabled person's parking place without displaying a valid disabled person's badge in the prescribed manner", "car park disabled blue badge bay"),
  off("89", "higher", "Vehicle parked exceeds maximum weight or height or length permitted in the area", "car park height weight length"),
  off("90", "lower", "Re-parked in the same car park within one hour after leaving", "car park return"),
  off("91", "higher", "Parked in a car park or area not designated for that class of vehicle", "car park wrong class motorcycle"),
  off("92", "higher", "Parked causing an obstruction", "car park obstruction"),
  off("93", "lower", "Parked in car park when closed", "car park closed"),
  off("94", "lower", "Parked in a pay & display car park without clearly displaying two valid pay and display tickets when required", "car park two tickets"),
  off("95", "lower", "Parked in a parking place for a purpose other than the designated purpose for the parking place", "car park park and ride wrong purpose"),
  off("96", "lower", "Parked with engine running where prohibited", "car park idling engine"),
  moving("31", "Entering and stopping in a box junction when prohibited", "yellow box junction"),
  moving("32", "Failing to drive in the direction shown by the arrow on a blue sign", "one way wrong direction"),
  moving("33", "Using a route restricted to certain vehicles", "bus gate buses only route"),
  moving("34", "Being in a bus lane", "bus lane camera"),
  moving("37", "Failing to give way to oncoming vehicles", "give way priority"),
  moving("38", "Failing to comply with a sign indicating that vehicular traffic must pass to the specified side of the sign", "keep left right"),
  moving("50", "Performing a prohibited turn", "no left right u turn banned turn"),
  moving("51", "Failing to comply with a no entry sign", "no entry"),
  moving("52", "Failing to comply with a prohibition on certain types of vehicle", "motor vehicles prohibited weight limit"),
  moving("53", "Failing to comply with a restriction on vehicles entering a pedestrian zone", "pedestrian zone school street"),
  moving("54", "Failing to comply with a restriction on vehicles entering and waiting in a pedestrian zone", "pedestrian zone"),
  moving("58", "Using a vehicle on a restricted street during prescribed hours without a valid permit", "london lorry control"),
  moving("59", "Using a vehicle on a restricted street during prescribed hours in breach of permit conditions", "london lorry control"),
];

/** The general suffixes (the letter or digit after the code, "12r"), from the same list. */
export const CODE_SUFFIXES: Record<string, string> = {
  a: "temporary traffic order",
  b: "business bay",
  c: "buses only",
  d: "doctor's bay",
  e: "car club bay",
  f: "free parking bay",
  g: "motor cycle bay",
  h: "hospital bay",
  i: "wrong type of voucher",
  j: "camera enforcement",
  k: "ambulance bay",
  l: "loading place",
  m: "parking meter",
  n: "red route",
  o: "blue badge holder",
  p: "pay & display",
  q: "market traders' bay",
  r: "residents' bay",
  s: "shared use bay",
  t: "voucher or pay & display ticket used in permit bay",
  u: "mobile phone parking",
  v: "voucher",
  w: "wrong parking zone",
  x: "incorrect registration",
  y: "obscured or illegible permit",
  z: "out of date permit",
  "0": "local buses or trams only",
  "1": "electric vehicles bay",
  "2": "goods vehicle loading bay",
  "3": "bicycle bay",
  "4": "virtual permit",
};

/** SI 2022/576 reg 5(4) and 5(2)(b) (England), in plain words: what formal representations to a council may say. */
export const STATUTORY_GROUNDS = [
  "The contravention did not happen.",
  "The person the notice went to was not the owner at the time (never owned it, had sold it before, or bought it after).",
  "The vehicle was being used without the owner's consent (for example, it had been stolen).",
  "The owner is a hire firm and the hirer signed a statement accepting liability.",
  "The penalty is more than the amount that applies.",
  "There was a procedural impropriety by the council (for example, the notice or the process did not follow the regulations).",
  "The traffic order the notice relies on is invalid.",
  "The penalty had already been paid.",
  "Whether or not any ground applies, there are compelling reasons to cancel it.",
];

const LEVEL_WORDS: Record<CodeLevel, string> = {
  higher: "Higher level: the more serious kind of parking contravention, so the higher of the council's two penalty amounts.",
  lower: "Lower level: the less serious kind of parking contravention, so the lower of the council's two penalty amounts.",
  moving_traffic: "A bus lane or moving traffic contravention, usually enforced by camera and sent by post. It has its own penalty amount.",
};

/** "12", "12r", "31J", "code 01" → the code and any suffix. Null when it is not a code at all. */
export function parseCode(input: string): { code: string; suffix: string } | null {
  const match = input.trim().toLowerCase().replace(/^code\s*/, "").match(/^(\d{1,2})\s*([a-z0-9]{0,4})$/);
  if (!match) return null;
  return { code: match[1]!.padStart(2, "0"), suffix: match[2] ?? "" };
}

export function explainCode(input: string) {
  const parsed = parseCode(input);
  if (!parsed) return null;
  const entry = PCN_CODES.find((item) => item.code === parsed.code);
  if (!entry) return null;
  const suffixes = [...parsed.suffix].map((char) => CODE_SUFFIXES[char]).filter((value): value is string => Boolean(value));
  return {
    code: entry.code,
    suffix: parsed.suffix || null,
    suffix_means: entry.where === "moving_traffic" ? null : suffixes.length ? suffixes : null,
    description: entry.description,
    level: entry.level,
    where: entry.where === "on_street" ? "On the street" : entry.where === "off_street" ? "In a council car park" : "Moving traffic or bus lane",
    level_means: LEVEL_WORDS[entry.level],
    amount: "Not given here: it depends on the council's band and changes. The amount, and the reduced amount for paying early, are printed on the notice.",
    grounds: STATUTORY_GROUNDS,
    note: "The grounds are those the law sets for formal representations to a council in England (SI 2022/576, regulation 5). Which apply depends on the facts, the signs and lines on the day, and the notice itself. A private company's parking charge does not use these codes.",
  };
}

const WORD = /[a-z0-9]+/g;

export function searchCodes(query: string, limit = 5) {
  const words = [...new Set(query.toLowerCase().match(WORD) ?? [])].filter((word) => word.length > 1 && !["a", "the", "in", "on", "of", "my", "and", "for", "parked", "parking"].includes(word));
  if (!words.length) return [];
  return PCN_CODES.map((entry) => {
    const hay = `${entry.description} ${entry.words ?? ""}`.toLowerCase();
    const hits = words.filter((word) => hay.includes(word)).length;
    return { entry, hits };
  })
    .filter(({ hits }) => hits > 0)
    .sort((a, b) => b.hits - a.hits || Number(a.entry.code) - Number(b.entry.code))
    .slice(0, Math.min(Math.max(Math.trunc(limit) || 5, 1), 10))
    .map(({ entry }) => ({ code: entry.code, description: entry.description, level: entry.level }));
}
