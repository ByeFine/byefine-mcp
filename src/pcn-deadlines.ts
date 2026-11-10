/**
 * The time limits the law sets for a parking notice in England, counted from the dates printed on it, for the MCP tool
 * calculate_deadlines (src/lib/public-mcp.ts; owner, 10 November 2026). Only limits that are the same everywhere, each with
 * its source (docs/guide-sources.md, docs/MCP.md):
 *
 * - council: SI 2022/71 reg 20 (Notice to Owner after the PCN's 28 days, not after 6 months), SI 2022/576 reg 5 and 6
 *   (28 days for representations, 56 days for the council to decide), 28 days to appeal after a Notice of Rejection, and the
 *   Secretary of State's statutory guidance (reduced amount within 14 days, 21 for a camera parking PCN sent by post);
 * - private: Protection of Freedoms Act 2012 Sch 4 paras 8 and 9, the Private Parking Sector Single Code of Practice 8.4.2(a)
 *   (28 days to appeal to the company) and POPLA and the IAS (28 days after a rejection).
 *
 * Every "last day" errs early: the printed date is counted as day one, although the law counts from when the notice was
 * served, which is the same day or later. Meeting the date shown is therefore always in time. A check that says a notice
 * was late does so only if it was late however its dates are read (the same rule as notice-points.ts).
 */

import { addDays, isoDate, secondWorkingDayAfter } from "./day-count";

export const NOTICE_TYPES = ["council_pcn_on_vehicle", "council_parking_pcn_by_post", "council_bus_lane_or_moving_traffic", "private_no_ticket_on_vehicle", "private_ticket_on_vehicle"] as const;
export type NoticeType = (typeof NOTICE_TYPES)[number];

export type DeadlineInput = {
  notice_type: NoticeType;
  /** The date printed on the first notice: the council PCN, the private Notice to Keeper sent by post, or the ticket left on the car. */
  notice_date: string;
  /** The date of the parking or the contravention. */
  event_date?: string;
  /** A council's Notice to Owner, the date printed on it. */
  notice_to_owner_date?: string;
  /** After a private ticket on the car: the Notice to Keeper that came by post later, the date printed on it. */
  notice_to_keeper_date?: string;
  /** The date of the letter refusing the challenge or representations. */
  rejection_date?: string;
};

export type Deadline = { what: string; date: string; kind: "last_day" | "not_before"; basis: string; source: string };
export type DeadlineCheck = { finding: string; basis: string; source: string };

const SOURCES = {
  guidance: "https://www.gov.uk/government/publications/civil-enforcement-of-parking-contraventions/guidance-for-local-authorities-on-enforcing-parking-restrictions",
  nto: "https://www.legislation.gov.uk/uksi/2022/71/regulation/20",
  reps: "https://www.legislation.gov.uk/uksi/2022/576/regulation/5",
  decide: "https://www.legislation.gov.uk/uksi/2022/576/regulation/6",
  tribunal: "https://www.gov.uk/parking-tickets/challenging-a-ticket",
  pofa8: "https://www.legislation.gov.uk/ukpga/2012/9/schedule/4/paragraph/8",
  pofa9: "https://www.legislation.gov.uk/ukpga/2012/9/schedule/4/paragraph/9",
  code: "https://www.britishparking.co.uk/Private-Parking-Sector-Single-Code-of-Practice",
  popla: "https://www.popla.co.uk/faqs",
  ias: "https://www.theias.org/before-you-appeal",
};

function addMonths(iso: string, months: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date.toISOString().slice(0, 10);
}

const iso = (date: Date) => date.toISOString().slice(0, 10);

export class DeadlineError extends Error {}

function required(value: string | undefined, name: string): string {
  const day = isoDate(value);
  if (!day) throw new DeadlineError(`${name} must be a date written yyyy-mm-dd.`);
  return day;
}

function optional(value: string | undefined, name: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  return required(value, name);
}

export function calculateDeadlines(input: DeadlineInput) {
  if (!NOTICE_TYPES.includes(input.notice_type)) throw new DeadlineError(`notice_type must be one of: ${NOTICE_TYPES.join(", ")}.`);
  const noticeDate = required(input.notice_date, "notice_date");
  const eventDate = optional(input.event_date, "event_date");
  const ntoDate = optional(input.notice_to_owner_date, "notice_to_owner_date");
  const rejectionDate = optional(input.rejection_date, "rejection_date");
  const ntkDate = optional(input.notice_to_keeper_date, "notice_to_keeper_date");
  const dates: Deadline[] = [];
  const checks: DeadlineCheck[] = [];
  const rules: Array<{ rule: string; source: string }> = [];
  const council = input.notice_type.startsWith("council_");

  if (input.notice_type === "council_pcn_on_vehicle") {
    dates.push({ what: "Last day to pay the reduced amount (50% off)", date: addDays(noticeDate, 13), kind: "last_day", basis: "14 days beginning with the day the PCN was served", source: SOURCES.guidance });
    dates.push({ what: "Earliest day the council may send a Notice to Owner if the PCN is unpaid", date: addDays(noticeDate, 28), kind: "not_before", basis: "after the PCN's 28 days to pay have run out", source: SOURCES.nto });
    const latest = addDays(addMonths(noticeDate, 6), -1);
    dates.push({ what: "Last day a Notice to Owner may be served", date: latest, kind: "last_day", basis: "6 months beginning with the day the PCN was served", source: SOURCES.nto });
    if (ntoDate) {
      dates.push({ what: "Last day for formal representations against the Notice to Owner", date: addDays(ntoDate, 27), kind: "last_day", basis: "28 days beginning with the day the Notice to Owner was served", source: SOURCES.reps });
      if (ntoDate > latest) {
        checks.push({ finding: `The Notice to Owner is dated ${ntoDate}, after ${latest}, the last day the law allows for serving it. That is a point for formal representations (procedural impropriety).`, basis: "SI 2022/71 reg 20(2)", source: SOURCES.nto });
      }
    }
  }
  if (input.notice_type === "council_parking_pcn_by_post") {
    dates.push({ what: "Last day to pay the reduced amount (50% off)", date: addDays(noticeDate, 20), kind: "last_day", basis: "21 days for a parking PCN sent by post on camera evidence", source: SOURCES.guidance });
  }
  if (input.notice_type === "council_parking_pcn_by_post" || input.notice_type === "council_bus_lane_or_moving_traffic") {
    dates.push({ what: "Last day for formal representations against the PCN (a PCN sent by post takes the place of a Notice to Owner)", date: addDays(noticeDate, 27), kind: "last_day", basis: "28 days beginning with the day the PCN was served", source: SOURCES.reps });
  }
  if (council) {
    rules.push({ rule: "The council must decide formal representations within 56 days of receiving them. If it does not, it is taken to have accepted them and must cancel the notice.", source: SOURCES.decide });
    if (rejectionDate) {
      dates.push({ what: "Last day to appeal to the independent tribunal (London Tribunals in London, the Traffic Penalty Tribunal elsewhere in England)", date: addDays(rejectionDate, 27), kind: "last_day", basis: "28 days beginning with the day the Notice of Rejection was served", source: SOURCES.tribunal });
    }
  }

  if (input.notice_type === "private_no_ticket_on_vehicle" || input.notice_type === "private_ticket_on_vehicle") {
    dates.push({ what: "Last day to appeal to the parking company", date: addDays(noticeDate, 27), kind: "last_day", basis: "the industry code allows 28 days from the first notice", source: SOURCES.code });
    if (rejectionDate) {
      dates.push({ what: "Last day to appeal to POPLA (British Parking Association members) or the IAS (International Parking Community members)", date: addDays(rejectionDate, 27), kind: "last_day", basis: "28 days from the company's rejection", source: `${SOURCES.popla} and ${SOURCES.ias}` });
    }
  }
  if (input.notice_type === "private_no_ticket_on_vehicle" && eventDate) {
    const given = iso(secondWorkingDayAfter(noticeDate));
    // 14 days beginning with the day after the parking ended; the parking is taken to run on to the next day, so the last
    // day allowed is never earlier than the true one.
    const lastDay = addDays(eventDate, 15);
    if (given > lastDay) {
      checks.push({
        finding: `Even if the Notice to Keeper was posted on the day it is dated, it was given on ${given} at the earliest, after ${lastDay}. So the registered keeper cannot be held liable for it under the Protection of Freedoms Act (only the driver can be). England and Wales only.`,
        basis: "PoFA 2012 Sch 4 para 9(4)-(6): 14 days beginning with the day after the parking ended; a posted notice is taken as given on the second working day after posting",
        source: SOURCES.pofa9,
      });
    }
  }
  if (input.notice_type === "private_ticket_on_vehicle" && ntkDate) {
    const given = iso(secondWorkingDayAfter(ntkDate));
    // The 28 days that follow the 28 days beginning with the day after the ticket was given: days 29 to 56 after it.
    const lastDay = addDays(noticeDate, 56);
    if (given > lastDay) {
      checks.push({
        finding: `Even if the Notice to Keeper was posted on the day it is dated, it was given on ${given} at the earliest, after ${lastDay}, the end of the window that follows a ticket on the car. So the registered keeper cannot be held liable for it under the Protection of Freedoms Act. England and Wales only.`,
        basis: "PoFA 2012 Sch 4 para 8(4)-(6): given in the 28 days that follow the first 28 days after the ticket",
        source: SOURCES.pofa8,
      });
    }
  }

  return {
    applies_to: "England. Wales and Scotland have their own rules.",
    counting: "Each last day counts the date printed on the notice as day one. The law counts from when the notice was served, which is that day or later, so the dates here are never later than the real ones: meeting them is always in time.",
    dates,
    rules,
    checks,
    note: "The notice itself is authoritative: always go by the dates and amounts it prints. A private company's notice also prints its own reduced-amount period.",
  };
}
