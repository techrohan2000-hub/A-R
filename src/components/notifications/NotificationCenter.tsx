import { useMemo, useState } from "react";
import { Bell, CheckCheck, Clock3, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWedding } from "../../hooks/useWedding";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import { deriveNotifications, visibleNotifications } from "../../services/notifications";

export function NotificationCenter() {
  const { workspace, updateNotificationState } = useWedding();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const notifications = useMemo(
    () => workspace ? visibleNotifications(deriveNotifications(workspace), workspace.notificationStates) : [],
    [workspace]
  );
  useLockBodyScroll(open);
  if (!workspace) return null;

  const stateMap = new Map(workspace.notificationStates.map((state) => [state.id, state]));
  const unread = notifications.filter((notice) => !stateMap.get(notice.id)?.readAt);
  const shown = filter === "unread" ? unread : notifications;
  const hour = new Date().getHours();
  const isQuiet = workspace.reminderPreferences.quietHoursEnabled && (hour >= 22 || hour < 8);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`${unread.length} unread reminders`}
        className="relative rounded-full border border-beige bg-white/80 p-2.5 text-maroon transition hover:bg-peach/40"
      >
        <Bell size={18} />
        {unread.length > 0 && !isQuiet && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-maroon px-1 text-center text-[10px] font-bold leading-5 text-white">
            {unread.length > 99 ? "99+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:block sm:w-[min(24rem,calc(100vw-2rem))]" role="dialog" aria-modal="true" aria-label="Reminders">
          <div className="absolute inset-0 bg-charcoal/40 sm:hidden" onClick={() => setOpen(false)} />
          <div
            className="anim-sheet relative max-h-[80dvh] w-full overflow-hidden rounded-t-3xl border border-beige bg-white shadow-2xl sm:max-h-[28rem] sm:rounded-2xl sm:animate-none"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-beige sm:hidden" />
            <div className="flex items-center justify-between border-b border-beige p-4">
              <div>
                <h2 className="font-semibold text-maroon-deep">Reminders</h2>
                <p className="text-xs text-charcoal-soft">{unread.length} unread</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => Promise.all(unread.map((notice) => updateNotificationState(notice.id, { readAt: new Date().toISOString() })))}
                  aria-label="Mark all reminders read"
                  className="rounded-full p-2 text-charcoal-soft hover:bg-cream-soft hover:text-maroon"
                >
                  <CheckCheck size={17} />
                </button>
                <button onClick={() => setOpen(false)} aria-label="Close reminders" className="rounded-full p-2 text-charcoal-soft hover:bg-cream-soft">
                  <X size={17} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 border-b border-beige px-4 py-2">
              {(["all", "unread"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${filter === value ? "bg-maroon text-white" : "bg-cream-soft text-charcoal-soft"}`}
                >
                  {value === "all" ? "All" : "Unread"}
                </button>
              ))}
            </div>
            <div className="max-h-[min(28rem,60dvh)] overflow-y-auto">
              {shown.length === 0 ? (
                <p className="p-8 text-center text-sm text-charcoal-soft">You are all caught up.</p>
              ) : shown.map((notice) => {
                const isRead = Boolean(stateMap.get(notice.id)?.readAt);
                return (
                  <article key={notice.id} className={`border-b border-beige/70 p-4 last:border-0 ${isRead ? "bg-white" : "bg-peach/15"}`}>
                    <button
                      className="w-full text-left"
                      onClick={async () => {
                        await updateNotificationState(notice.id, { readAt: new Date().toISOString() });
                        setOpen(false);
                        navigate(notice.path);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notice.urgency === "urgent" ? "bg-red-600" : notice.urgency === "warning" ? "bg-gold" : "bg-maroon"}`} />
                        <span>
                          <span className="block text-sm font-medium text-charcoal">{notice.title}</span>
                          <span className="mt-0.5 block text-xs text-charcoal-soft">{notice.body}</span>
                        </span>
                      </div>
                    </button>
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => updateNotificationState(notice.id, { snoozedUntil: new Date(Date.now() + 86_400_000).toISOString() })}
                        className="flex items-center gap-1 text-[11px] font-medium text-charcoal-soft hover:text-maroon"
                      >
                        <Clock3 size={12} /> Snooze 1 day
                      </button>
                      <button
                        onClick={() => updateNotificationState(notice.id, { dismissedAt: new Date().toISOString() })}
                        className="text-[11px] font-medium text-charcoal-soft hover:text-red-700"
                      >
                        Dismiss
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
