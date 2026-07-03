import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Bell, CheckCircle2, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: ToastType;
};

export function ToastViewport({
  notifications,
  theme,
}: {
  notifications: AppNotification[];
  theme: 'dark' | 'light';
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-24 z-[80] flex w-[min(92vw,24rem)] flex-col gap-3 sm:right-6">
      <AnimatePresence>
        {notifications.map((item) => {
          const toneClasses = {
            success: theme === 'dark'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-50'
              : 'border-emerald-500/20 bg-emerald-50 text-emerald-900',
            warning: theme === 'dark'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-50'
              : 'border-amber-500/20 bg-amber-50 text-amber-900',
            error: theme === 'dark'
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-50'
              : 'border-rose-500/20 bg-rose-50 text-rose-900',
            info: theme === 'dark'
              ? 'border-sky-500/30 bg-sky-500/10 text-sky-50'
              : 'border-sky-500/20 bg-sky-50 text-sky-900',
          }[item.type];

          const iconMap = {
            success: <CheckCircle2 size={18} className="text-emerald-400" />,
            warning: <AlertTriangle size={18} className="text-amber-400" />,
            error: <XCircle size={18} className="text-rose-400" />,
            info: <Bell size={18} className="text-sky-400" />,
          }[item.type];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={`rounded-[24px] border p-4 shadow-2xl backdrop-blur-xl ${toneClasses}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-white/10 p-2">{iconMap}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-current/70">{item.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-current/80">{item.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
