import { differenceInCalendarDays, format, isPast, isToday, isTomorrow, parseISO } from "date-fns";

export function toDate(isoDate: string): Date {
  return parseISO(isoDate);
}

export function formatPrettyDate(isoDate: string): string {
  if (!isoDate) return "Not set";
  return format(toDate(isoDate), "d MMMM yyyy");
}

export function daysUntil(isoDate: string): number {
  return differenceInCalendarDays(toDate(isoDate), new Date());
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function getCountdown(isoDate: string, isoTime?: string): Countdown {
  const target = isoTime ? parseISO(`${isoDate}T${isoTime}`) : parseISO(isoDate);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const past = diffMs <= 0;
  const abs = Math.abs(diffMs);

  const days = Math.floor(abs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((abs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((abs / (1000 * 60)) % 60);
  const seconds = Math.floor((abs / 1000) % 60);

  return { days, hours, minutes, seconds, isPast: past };
}

export function dueLabel(isoDate: string): "overdue" | "today" | "tomorrow" | "upcoming" {
  const date = toDate(isoDate);
  if (isToday(date)) return "today";
  if (isTomorrow(date)) return "tomorrow";
  if (isPast(date)) return "overdue";
  return "upcoming";
}
