/**
 * Counting calendar days written YYYY-MM-DD, with no imports, so the deadline tool (pcn-deadlines.ts) can be published on its
 * own (docs/MCP.md, the public byefine-mcp repository). Used by refusal-terms.ts and notice-points.ts too.
 */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY = 86_400_000;

/** A real calendar date written YYYY-MM-DD, else null. */
export function isoDate(value: string | null | undefined): string | null {
  const match = ISO.exec((value ?? "").trim());
  if (!match) return null;
  const date = new Date(`${match[0]}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== match[0] ? null : match[0];
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The second working day after `day` (Saturdays and Sundays skipped; bank holidays are not, which only ever makes it earlier). */
export function secondWorkingDayAfter(day: string): Date {
  let date = new Date(`${day}T12:00:00Z`);
  let working = 0;
  while (working < 2) {
    date = new Date(date.getTime() + DAY);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) working += 1;
  }
  return date;
}
