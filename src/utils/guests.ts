import type { FamilySide, GuestSummary } from "../types/wedding";

export function guestHeadcount(guest: Pick<GuestSummary, "partySize">) {
  return Math.max(1, guest.partySize ?? 1);
}

export function guestInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "G";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function sumHeadcount(guests: Pick<GuestSummary, "partySize">[]) {
  return guests.reduce((sum, guest) => sum + guestHeadcount(guest), 0);
}

export const mealLabels: Record<NonNullable<GuestSummary["mealPreference"]>, string> = {
  veg: "Veg",
};

export const sideAccent: Record<FamilySide, string> = {
  bride: "from-[#6d1e2f] to-[#a14a5c]",
  groom: "from-[#8a5a2b] to-[#c4a36a]",
  both: "from-[#6d1e2f] to-[#b08d57]",
};
