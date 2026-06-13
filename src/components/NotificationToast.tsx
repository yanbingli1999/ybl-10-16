import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: "bg-emerald-50 border-emerald-300 text-emerald-800",
  warning: "bg-amber-50 border-amber-300 text-amber-900",
  error: "bg-red-50 border-red-300 text-red-800",
  info: "bg-sky-50 border-sky-300 text-sky-800",
};

const ICON_COLOR = {
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-red-500",
  info: "text-sky-500",
};

export function NotificationToast() {
  const notifications = useGameStore(s => s.notifications);
  const clearNotification = useGameStore(s => s.clearNotification);

  useEffect(() => {
    const timers = notifications.map(n => {
      return window.setTimeout(() => clearNotification(n.id), 6000);
    });
    return () => timers.forEach(clearTimeout);
  }, [notifications, clearNotification]);

  return (
    <div className="fixed top-28 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
      {notifications.slice(0, 5).map(n => {
        const Icon = ICONS[n.type];
        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-2 px-3 py-2 rounded-lg border shadow-md animate-slide-in ${COLORS[n.type]}`}
          >
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${ICON_COLOR[n.type]}`} />
            <div className="flex-1 text-sm leading-snug">{n.message}</div>
            <button
              onClick={() => clearNotification(n.id)}
              className="p-0.5 rounded hover:bg-black/10 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
