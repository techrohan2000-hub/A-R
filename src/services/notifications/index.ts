import { differenceInCalendarDays, parseISO } from "date-fns";
import type { NotificationState, WeddingWorkspace } from "../../types/wedding";

export type ReminderKind = "event" | "task" | "milestone" | "vendor" | "rsvp";
export type ReminderUrgency = "info" | "warning" | "urgent";

export interface ReminderNotification {
  id: string;
  kind: ReminderKind;
  title: string;
  body: string;
  date: string;
  urgency: ReminderUrgency;
  path: string;
}

function daysUntil(date: string, now: Date) {
  return differenceInCalendarDays(parseISO(date), now);
}

function dueCopy(days: number) {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

function urgency(days: number): ReminderUrgency {
  if (days < 0) return "urgent";
  if (days <= 2) return "warning";
  return "info";
}

export function deriveNotifications(workspace: WeddingWorkspace, now = new Date()): ReminderNotification[] {
  if (!workspace.reminderPreferences.enabled) return [];
  const preferences = workspace.reminderPreferences;
  const notices: ReminderNotification[] = [];

  for (const event of workspace.wedding.events) {
    if (!event.enabled || !event.date) continue;
    const days = daysUntil(event.date, now);
    if (days >= 0 && days <= preferences.eventLeadDays) {
      notices.push({
        id: `event:${event.id}:${event.date}`,
        kind: "event",
        title: `${event.name} is coming up`,
        body: dueCopy(days),
        date: event.date,
        urgency: urgency(days),
        path: "/events-rituals",
      });
    }
  }

  for (const task of workspace.tasks) {
    if (!task.dueDate || ["completed", "cancelled"].includes(task.status)) continue;
    const days = daysUntil(task.dueDate, now);
    if (days <= preferences.taskLeadDays) {
      notices.push({
        id: `task:${task.id}:${task.dueDate}`,
        kind: "task",
        title: task.title,
        body: dueCopy(days),
        date: task.dueDate,
        urgency: urgency(days),
        path: "/tasks",
      });
    }
  }

  for (const milestone of workspace.milestones) {
    if (!milestone.date || milestone.completed) continue;
    const days = daysUntil(milestone.date, now);
    if (days <= preferences.milestoneLeadDays) {
      notices.push({
        id: `milestone:${milestone.id}:${milestone.date}`,
        kind: "milestone",
        title: milestone.title,
        body: dueCopy(days),
        date: milestone.date,
        urgency: urgency(days),
        path: "/timeline",
      });
    }
  }

  for (const vendor of workspace.vendors) {
    if (!vendor.dueDate || vendor.paidAmount >= vendor.totalAmount || vendor.status === "cancelled") continue;
    const days = daysUntil(vendor.dueDate, now);
    if (days <= preferences.vendorLeadDays) {
      notices.push({
        id: `vendor:${vendor.id}:${vendor.dueDate}`,
        kind: "vendor",
        title: `Payment due: ${vendor.name}`,
        body: `${dueCopy(days)} · ₹${(vendor.totalAmount - vendor.paidAmount).toLocaleString("en-IN")} remaining`,
        date: vendor.dueDate,
        urgency: urgency(days),
        path: "/vendors",
      });
    }
  }

  for (const guest of workspace.guests) {
    if (!["invited", "maybe"].includes(guest.rsvp)) continue;
    const sent = workspace.invitations
      .filter((invitation) => invitation.guestId === guest.id && invitation.sentAt)
      .sort((a, b) => (b.sentAt || "").localeCompare(a.sentAt || ""))[0];
    if (!sent?.sentAt) continue;
    const followUpDate = new Date(sent.sentAt);
    followUpDate.setDate(followUpDate.getDate() + preferences.rsvpFollowUpDays);
    const date = followUpDate.toISOString().slice(0, 10);
    const days = daysUntil(date, now);
    if (days <= 0) {
      notices.push({
        id: `rsvp:${guest.id}:${date}`,
        kind: "rsvp",
        title: `Follow up with ${guest.name}`,
        body: guest.rsvp === "maybe" ? "RSVP is still marked maybe" : "RSVP response is pending",
        date,
        urgency: days < 0 ? "urgent" : "warning",
        path: "/guests",
      });
    }
  }

  return notices.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function visibleNotifications(
  notifications: ReminderNotification[],
  states: NotificationState[],
  now = new Date()
) {
  const stateMap = new Map(states.map((state) => [state.id, state]));
  return notifications.filter((notification) => {
    const state = stateMap.get(notification.id);
    if (state?.dismissedAt) return false;
    return !state?.snoozedUntil || new Date(state.snoozedUntil) <= now;
  });
}
