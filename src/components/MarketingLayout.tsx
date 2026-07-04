import { useState, type ReactNode } from 'react';
import { ArrowRight, Building2, Library, Menu, X } from 'lucide-react';

export type MarketingPage =
  | 'home'
  | 'features'
  | 'pricing'
  | 'register'
  | 'demo'
  | 'about'
  | 'contact'
  | 'login'
  | 'privacy'
  | 'terms';

type Props = {
  activePage: MarketingPage;
  onNavigate: (page: MarketingPage) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  children: ReactNode;
};

const navItems: Array<{ id: MarketingPage; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export function MarketingLayout({ activePage, onNavigate, onOpenLogin, onOpenRegister, children }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (pageId: MarketingPage) => {
    setIsMenuOpen(false);

    if (pageId === 'home') {
      onNavigate('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Scroll dynamically to targeted sections if we are clicking a home-section nav item
    if (['features', 'pricing', 'about', 'contact'].includes(pageId)) {
      if (activePage !== 'home' && activePage !== pageId) {
        onNavigate('home');
        setTimeout(() => {
          const el = document.getElementById(pageId);
          if (el) {
            const offset = 100; // Account for sticky header height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 120);
      } else {
        const el = document.getElementById(pageId);
        if (el) {
          const offset = 100; // Account for sticky header height
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
      onNavigate(pageId);
      return;
    }

    onNavigate(pageId);
  };

  return (
    <div className="w-full max-w-7xl space-y-8">
      <header className="sticky top-4 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/15 bg-slate-950/70 px-4 py-3 shadow-[0_20px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl sm:px-6 lg:px-8">
          <button type="button" onClick={() => handleNavigation('home')} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300">
              <Library size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-white">CampusLibrary AI</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Multi-tenant SaaS</p>
            </div>
          </button>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                  activePage === item.id
                    ? 'bg-sky-400/15 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenLogin}
              className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition-all hover:bg-white/10 sm:inline-flex cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onOpenRegister}
              className="hidden rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-sky-300 sm:inline-flex cursor-pointer"
            >
              Register College
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 lg:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mx-auto mt-3 max-w-7xl rounded-[24px] border border-white/10 bg-slate-950/90 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigation(item.id)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                    activePage === item.id ? 'bg-sky-400/15 text-sky-300' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenLogin();
                }}
                className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-slate-100 cursor-pointer"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenRegister();
                }}
                className="rounded-2xl bg-sky-400 px-4 py-3 text-left text-sm font-semibold text-slate-950 cursor-pointer"
              >
                Register College
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="space-y-8">{children}</main>

      <footer className="rounded-[32px] border border-white/10 bg-slate-950/50 px-6 py-8 text-sm text-slate-400 shadow-[0_20px_60px_rgba(15,23,42,0.2)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-black text-white">CampusLibrary AI</p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">Secure • Scalable • AI-ready</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.25em]">
            <button type="button" onClick={() => handleNavigation('features')} className="transition-colors hover:text-sky-300 cursor-pointer">Features</button>
            <button type="button" onClick={() => handleNavigation('pricing')} className="transition-colors hover:text-sky-300 cursor-pointer">Pricing</button>
            <button type="button" onClick={() => handleNavigation('about')} className="transition-colors hover:text-sky-300 cursor-pointer">About</button>
            <button type="button" onClick={() => handleNavigation('contact')} className="transition-colors hover:text-sky-300 cursor-pointer">Contact</button>
            <button type="button" onClick={() => handleNavigation('privacy')} className="transition-colors hover:text-sky-300 cursor-pointer">Privacy</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function MarketingShellHero({ eyebrow, title, description, primaryAction, secondaryAction }: { eyebrow: string; title: string; description: string; primaryAction: ReactNode; secondaryAction: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:p-10 lg:p-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_45%)]" />
      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
            <Building2 size={14} />
            {eyebrow}
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">{title}</h2>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-300">{description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {primaryAction}
            {secondaryAction}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20">
          <div className="rounded-[28px] border border-sky-400/20 bg-gradient-to-br from-sky-400/15 to-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Operations snapshot</p>
                <p className="mt-2 text-2xl font-black text-white">Multi-college control center</p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                Live
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Colleges onboarded</p>
                <p className="mt-2 text-3xl font-black text-white">120+</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">AI requests/day</p>
                <p className="mt-2 text-3xl font-black text-white">8.4k</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-sky-400/10 bg-sky-400/10 p-4">
              <p className="text-sm font-semibold text-sky-200">Private tenant data, role-based access, zero cross-college visibility.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
