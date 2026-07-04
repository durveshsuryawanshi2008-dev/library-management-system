import { useState, useEffect, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book as BookIcon, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Library,
  ChevronRight,
  ChevronLeft,
  Search,
  PlusCircle,
  FileText,
  Download,
  Filter,
  Layers,
  MapPin,
  Trash2,
  XCircle,
  X,
  MessageSquare,
  Send,
  Hash,
  Moon,
  Sun,
  Settings,
  Bot,
  Bell,
  BellOff,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  MonitorPlay,
  Users,
  Zap,
  BadgeCheck,
  Star,
  Quote,
  Mail,
  Phone,
  Menu
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { User, IssueRecord, Book, ChatMessage } from './types';
import { formatDisplayDate, calculateDueDate } from './data';
import { ALL_BOOKS } from './data/books';
import { ToastViewport, type AppNotification, type ToastType } from './components/ToastViewport';
import { MarketingLayout, MarketingShellHero, type MarketingPage } from './components/MarketingLayout';
import { readStoredValue, writeStoredValue } from './lib/storage';

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('durvesh_theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [marketingPage, setMarketingPage] = useState<MarketingPage>('home');
  const [isHydrated, setIsHydrated] = useState(false);
  const [records, setRecords] = useState<IssueRecord[]>(() => readStoredValue<IssueRecord[]>('durvesh_records', []));
  const [isBooting, setIsBooting] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(() => readStoredValue<ChatMessage[]>('durvesh_chats', []));
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return readStoredValue<'false' | 'true' | null>('durvesh_notify_enabled', 'true') !== 'false';
  });
  const [registryFilter, setRegistryFilter] = useState<'all' | 'pending' | 'return_pending'>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = readStoredValue<unknown>('durvesh_alerts', []);
    if (!Array.isArray(saved)) return [];

    return saved.map((item: any) => ({
      id: item.id || Math.random().toString(36).slice(2),
      title: item.title || 'System Update',
      message: item.message || item.text || '',
      time: item.time || new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      type: item.type || 'info'
    }));
  });
  const [showSettings, setShowSettings] = useState(false);

  // Page-level state
  const [activeTab, setActiveTab] = useState<'catalog' | 'registry' | 'chat' | 'terminal' | 'stats' | 'return_center' | 'ai_assistant' | 'students'>('catalog');

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (user?.role === 'admin') {
      setActiveTab('stats');
    } else {
      setActiveTab('catalog');
    }
  }, [user]);

  // ... rest of state

  // Boot sequence logic
  useEffect(() => {
    if (isBooting) {
      const messages = [
        '>>> INITIALIZING PYTHON_CORE v2.5.0...',
        '>>> LOCATING DISTRIBUTED DATABASE NODES...',
        '>>> HANDSHAKE: NEURAL LINK ESTABLISHED.',
        '>>> INDEXING 20,000+ MANUSCRIPTS...',
        '>>> SECURITY PROTOCOL: VERIFIED.',
        '>>> ACCESS GRANTED: WELCOME TO DURVESH_OS.'
      ];
      let i = 0;
      setBootLogs([]);
      const interval = setInterval(() => {
        if (i < messages.length) {
          setBootLogs(prev => [...prev, messages[i]]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsBooting(false);
            setView('dashboard');
          }, 1000);
        }
      }, 350);
      return () => clearInterval(interval);
    }
  }, [isBooting]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsHydrated(true), 180);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    writeStoredValue('durvesh_records', records);
  }, [records]);

  useEffect(() => {
    writeStoredValue('durvesh_chats', messages);
  }, [messages]);

  useEffect(() => {
    writeStoredValue('durvesh_theme', theme);
  }, [theme]);

  useEffect(() => {
    writeStoredValue('durvesh_notify_enabled', String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    writeStoredValue('durvesh_alerts', notifications);
  }, [notifications]);

  const pushNotification = (title: string, message: string, type: ToastType = 'info') => {
    if (!notificationsEnabled) return;

    const toast: AppNotification = {
      id: Math.random().toString(36).slice(2),
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      type
    };

    setNotifications(prev => [toast, ...prev].slice(0, 6));
    window.setTimeout(() => {
      setNotifications(prev => prev.filter(item => item.id !== toast.id));
    }, 3600);
  };

  const handleSendMessage = (text: string) => {
    if (!user) return;
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderPrn: user.prn,
      senderName: user.username,
      text,
      timestamp: new Date().toISOString(),
      isAdmin: user.role === 'admin'
    };
    setMessages([...messages, newMessage]);
  };

  const handleLogin = (username: string, pass: string) => {
    const loginUsername = username.trim().toLowerCase();
    const loginPass = pass.trim();

    if (loginUsername === 'admin' && loginPass === 'admin') {
      setUser({ id: 'admin', username: 'Admin Alpha', prn: 'SYS-ADMIN', role: 'admin' });
      setIsBooting(true);
      return true;
    } 
    
    const prnNum = parseInt(loginUsername);
    if (!isNaN(prnNum) && prnNum >= 12501 && prnNum <= 12600 && loginUsername === loginPass) {
      setUser({ 
        id: loginUsername, 
        username: `Student ${loginUsername}`, 
        prn: loginUsername, 
        role: 'student',
        walletBalance: 100
      });
      setIsBooting(true);
      return true;
    }

    return false;
  };

  // Notification engine
  useEffect(() => {
    if (!notificationsEnabled || records.length === 0) return;
    
    const lastRecord = records[0];
    const msg: AppNotification = {
      id: Math.random().toString(),
      title: 'System Update',
      message: `${lastRecord.bookTitle} is now ${lastRecord.status.toUpperCase()}`,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      type: lastRecord.status === 'returned' || lastRecord.status === 'accepted' ? 'success' : 'info'
    };
    setNotifications(prev => [msg, ...prev].slice(0, 6));
  }, [records, notificationsEnabled]);

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  const handleIssueBook = (book: Book) => {
    if (!user) return;
    
    // Wallet restriction
    if (user.role === 'student' && (user.walletBalance || 100) < 40) {
      pushNotification('Warning', 'Wallet balance must be at least ₹40 to issue new books.', 'warning');
      return false;
    }

    const newRecord: IssueRecord = {
      id: Math.random().toString(36).substr(2, 9),
      bookId: book.id,
      bookCode: book.code,
      bookTitle: book.title,
      author: book.author,
      studentName: user.username,
      studentPrn: user.prn,
      issueDate: new Date().toISOString(),
      dueDate: calculateDueDate(new Date().toISOString()),
      status: 'pending'
    };

    setRecords([newRecord, ...records]);
    pushNotification('Issue Successful', `${book.title} has been issued successfully.`, 'success');
    return true;
  };

  const handleAcceptRequest = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
    pushNotification('Issue Successful', 'The issue request was approved.', 'success');
  };

  const handleRejectRequest = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    pushNotification('Warning', 'The issue request was rejected.', 'warning');
  };

  const handleReturnBook = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'return_pending', returnRequestedDate: new Date().toISOString() } : r));
    pushNotification('Return Pending', 'Your return request has been submitted.', 'info');
  };

  const handleApproveReturn = (id: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    // Calculate fine if any
    const dueDate = new Date(record.dueDate);
    const returnDate = new Date();
    let fine = 0;
    if (returnDate > dueDate) {
      const diffDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
      fine = diffDays * 5;
    }

    setRecords(records.map(r => r.id === id ? { ...r, status: 'returned', fineAmount: fine } : r));
    pushNotification('Return Successful', `The book return was completed${fine > 0 ? ` with a fine of ₹${fine}` : ''}.`, 'success');
    
    // Deduct from student wallet
    if (fine > 0) {
       // Note: We'd need to find the student in a users list. 
       // For this demo, we update current user if it's the student
       if (user?.role === 'student' && user.prn === record.studentPrn) {
          setUser({ ...user, walletBalance: (user.walletBalance || 100) - fine });
       }
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto mb-6 h-14 w-14 animate-pulse rounded-2xl border border-library-gold/20 bg-library-gold/10" />
          <h2 className="text-2xl font-semibold">Preparing your library workspace</h2>
          <p className="mt-3 text-sm text-slate-300">Loading the dashboard, records, and preferences…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-sans animated-bg">
      {/* Background Decor - Floating Orbs */}
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <ToastViewport notifications={notifications} theme={theme} />
        {/* Header */}
        <header className="mb-16 flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
              <Library className="text-library-gold" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-serif italic font-bold tracking-tight text-white">Durvesh</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white opacity-80">Library Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 ${theme === 'dark' ? 'bg-white/10 text-gray-100 hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 glass-panel py-2 px-6 rounded-2xl border-white/5">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white tracking-tight">{user.username}</p>
                  <p className="text-[9px] text-library-gold font-bold uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 relative"
                      title="System Settings"
                    >
                      <Settings size={18} />
                      {notificationsEnabled && notifications.length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </button>
                  </div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all active:scale-90 border border-red-500/20"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setView('login')}
                className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Settings Overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed right-6 top-32 w-80 glass-panel p-8 rounded-[32px] z-[60] border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-white">Console Settings</h3>
                <button onClick={() => setShowSettings(false)}><X size={18} className="text-gray-500" /></button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <Bell size={18} className="text-library-gold" />
                     <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                   </div>
                   <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-10 h-5 rounded-full transition-all relative ${notificationsEnabled ? 'bg-library-gold' : 'bg-white/10'}`}
                   >
                     <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
                   </button>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     {theme === 'dark' ? <Moon size={18} className="text-library-gold" /> : <Sun size={18} className="text-library-gold" />}
                     <span className="text-xs font-bold text-white uppercase tracking-wider">Theme</span>
                   </div>
                   <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`w-10 h-5 rounded-full transition-all relative ${theme === 'dark' ? 'bg-library-gold' : 'bg-white/10'}`}
                   >
                     <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`}></div>
                   </button>
                </div>

                {notificationsEnabled && notifications.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Recent Activity</p>
                    {notifications.map(n => (
                      <div key={n.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-library-gold">{n.title}</p>
                          <span className="text-[8px] text-gray-500">{n.time}</span>
                        </div>
                        <p className="mt-2 text-[10px] leading-relaxed text-white">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-white/5">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">Version 2.5.0-Deployment</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isBooting ? (
              <BootScreen logs={bootLogs} />
            ) : view === 'landing' ? (
              <LandingPage
                marketingPage={marketingPage}
                onNavigate={setMarketingPage}
                onOpenLogin={() => setMarketingPage('login')}
                onOpenRegister={() => setMarketingPage('register')}
                onOpenDemo={() => setMarketingPage('demo')}
                onAuthenticate={handleLogin}
                onEnter={() => setView('login')}
              />
            ) : view === 'login' ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Dashboard 
                user={user!} 
                records={records} 
                messages={messages}
                onSendMessage={handleSendMessage}
                onIssue={handleIssueBook}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onReturn={handleReturnBook}
                onApproveReturn={handleApproveReturn}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setRegistryFilter={setRegistryFilter}
                registryFilter={registryFilter}
              />
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-16 text-center py-6 border-t border-gray-100">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
            Professional Python Showcase • © 2026 Durvesh Suryawanshi
          </p>
        </footer>
      </div>
    </div>
  );
}

function LandingPage({
  marketingPage,
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onOpenDemo,
  onAuthenticate,
  onEnter,
}: {
  marketingPage: MarketingPage;
  onNavigate: (page: MarketingPage) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenDemo: () => void;
  onAuthenticate: (u: string, p: string) => boolean;
  onEnter: () => void;
}) {
  const [registrationForm, setRegistrationForm] = useState({
    collegeName: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    principalName: '',
    adminName: '',
    adminEmail: '',
    phone: '',
    capacity: '',
    plan: 'Starter',
    termsAccepted: false,
  });
  const [registrationStatus, setRegistrationStatus] = useState(false);
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    college: '',
    plan: 'Standard',
    message: '',
  });
  const [demoStatus, setDemoStatus] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState(false);

  const features = [
    {
      icon: BookIcon,
      title: 'Private multi-tenant library workspaces',
      text: 'Each college gets a secure, isolated environment with role-aware controls and dedicated permissions.',
    },
    {
      icon: ShieldCheck,
      title: 'AI-powered campus operations',
      text: 'Deploy smart recommendations, automated approvals, and predictive insights without exposing data across tenants.',
    },
    {
      icon: Bot,
      title: 'Professional admin experience',
      text: 'Modern dashboards, notices, and student workflows are designed for fast onboarding and daily campus operations.',
    },
  ];

  const pricingPlans = [
    { name: 'Starter', students: '200 Students', duration: '2 Years', price: '₹2,000', features: ['AI Disabled', 'Basic catalog tools', 'Email support'], popular: false },
    { name: 'Standard', students: '500 Students', duration: '2 Years', price: '₹5,000', features: ['AI Enabled', 'Analytics dashboard', 'Priority onboarding'], popular: true },
    { name: 'Professional', students: '1000 Students', duration: '2 Years', price: '₹10,000', features: ['AI Enabled', 'Advanced analytics', 'Priority support'], popular: false },
    { name: 'Enterprise', students: 'Unlimited', duration: 'Custom', price: 'Custom Pricing', features: ['Dedicated onboarding', 'Custom integrations', 'SLA support'], popular: false },
  ];

  const steps = [
    { title: 'Onboard your college', text: 'Register your institution and configure the library experience for your campus.' },
    { title: 'Launch operations', text: 'Invite admins, approve workflows, and activate AI-assisted recommendations instantly.' },
    { title: 'Scale with confidence', text: 'Monitor usage, optimize support, and expand to more departments without data overlap.' },
  ];

  const testimonials = [
    { name: 'Aisha Rao', role: 'Principal, Green Valley College', quote: 'The experience feels enterprise-grade and immediately trustworthy for our campus team.' },
    { name: 'Rohit Verma', role: 'Library Admin, Omkar Institute', quote: 'Our staff can manage queues, returns, and alerts from one elegant platform without confusion.' },
    { name: 'Meera Kulkarni', role: 'Operations Head, Nirma University', quote: 'It is the first library platform that feels modern, secure, and ready for growth.' },
  ];

  const faqs = [
    { question: 'Is data isolated per college?', answer: 'Yes. Every tenant is separated so no college can access the private data of another institution.' },
    { question: 'Can we add AI later?', answer: 'Absolutely. The platform is designed to progressively enable AI features once your campus is ready.' },
    { question: 'Is the registration form fully frontend ready?', answer: 'Yes. This phase focuses on professional UI and flow design without backend dependencies.' },
  ];

  const aboutPoints = [
    'Built for modern colleges that need a secure and scalable library operating layer.',
    'Supports multi-tenant onboarding, private data boundaries, and professional admin workflows.',
    'Prepared for later API integrations, analytics, and SaaS billing expansion.',
  ];

  const handleRegistrationSubmit = (e: FormEvent) => {
    e.preventDefault();
    setRegistrationStatus(true);
  };

  const handleDemoSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDemoStatus(true);
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    setContactStatus(true);
  };

  const renderPageContent = () => {
    if (marketingPage === 'login') {
      return (
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-[36px] border border-white/10 bg-slate-950/65 p-8 shadow-[0_20px_70px_rgba(2,6,23,0.35)]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Secure access</p>
            <h2 className="mt-4 text-3xl font-black text-white">Login to your campus library workspace.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">Choose the appropriate portal for your college admin or student account and continue into the dashboard experience.</p>
            <div className="mt-6 space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p><span className="font-semibold text-white">Demo admin:</span> admin / admin</p>
              <p><span className="font-semibold text-white">Demo student:</span> PRN from 12501–12600 / same as PRN</p>
            </div>
          </div>
          <LoginPage onLogin={onAuthenticate} />
        </div>
      );
    }

    if (marketingPage === 'register') {
      return (
        <div className="space-y-8">
          <section className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-8 shadow-[0_18px_70px_rgba(2,6,23,0.3)] sm:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Register college</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Launch your campus library platform with a professional onboarding flow.</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">The form below is prepared for future backend integration while presenting a polished, SaaS-ready registration path.</p>
          </section>

          <section className="rounded-[40px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.2)] sm:p-8">
            {!registrationStatus ? (
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleRegistrationSubmit}>
                <input className="glass-input" placeholder="College Name" value={registrationForm.collegeName} onChange={(e) => setRegistrationForm({ ...registrationForm, collegeName: e.target.value })} required />
                <input className="glass-input" placeholder="Address" value={registrationForm.address} onChange={(e) => setRegistrationForm({ ...registrationForm, address: e.target.value })} required />
                <input className="glass-input" placeholder="City" value={registrationForm.city} onChange={(e) => setRegistrationForm({ ...registrationForm, city: e.target.value })} required />
                <input className="glass-input" placeholder="State" value={registrationForm.state} onChange={(e) => setRegistrationForm({ ...registrationForm, state: e.target.value })} required />
                <input className="glass-input" placeholder="PIN Code" value={registrationForm.pinCode} onChange={(e) => setRegistrationForm({ ...registrationForm, pinCode: e.target.value })} required />
                <input className="glass-input" placeholder="Principal Name" value={registrationForm.principalName} onChange={(e) => setRegistrationForm({ ...registrationForm, principalName: e.target.value })} required />
                <input className="glass-input" placeholder="Library Admin Name" value={registrationForm.adminName} onChange={(e) => setRegistrationForm({ ...registrationForm, adminName: e.target.value })} required />
                <input className="glass-input" placeholder="Library Admin Email" type="email" value={registrationForm.adminEmail} onChange={(e) => setRegistrationForm({ ...registrationForm, adminEmail: e.target.value })} required />
                <input className="glass-input" placeholder="Phone Number" value={registrationForm.phone} onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })} required />
                <input className="glass-input" placeholder="Student Capacity" value={registrationForm.capacity} onChange={(e) => setRegistrationForm({ ...registrationForm, capacity: e.target.value })} required />
                <select className="glass-input" value={registrationForm.plan} onChange={(e) => setRegistrationForm({ ...registrationForm, plan: e.target.value })}>
                  <option value="Starter">Starter</option>
                  <option value="Standard">Standard</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
                <label className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <input type="checkbox" checked={registrationForm.termsAccepted} onChange={(e) => setRegistrationForm({ ...registrationForm, termsAccepted: e.target.checked })} required />
                  I agree to the platform terms.
                </label>
                <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
                  <button type="submit" className="metallic-btn w-full sm:w-auto">Submit Registration</button>
                  <button type="button" onClick={onOpenDemo} className="secondary-btn w-full sm:w-auto">Request Demo</button>
                </div>
              </form>
            ) : (
              <div className="rounded-[32px] border border-emerald-400/20 bg-emerald-400/10 p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">Registration submitted successfully</p>
                <h3 className="mt-3 text-2xl font-black text-white">Waiting for super admin approval.</h3>
                <p className="mt-3 text-sm text-slate-300">Your college request has been captured and is ready for verification by the platform team.</p>
              </div>
            )}
          </section>
        </div>
      );
    }

    if (marketingPage === 'demo') {
      return (
        <div className="space-y-8">
          <section className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-8 shadow-[0_18px_70px_rgba(2,6,23,0.3)] sm:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Request demo</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Book a guided walkthrough for your campus team.</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">We will tailor the demo around your college size, library workflows, and growth goals.</p>
          </section>

          <section className="rounded-[40px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.2)] sm:p-8">
            {!demoStatus ? (
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleDemoSubmit}>
                <input className="glass-input" placeholder="Your Name" value={demoForm.name} onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })} required />
                <input className="glass-input" placeholder="Work Email" type="email" value={demoForm.email} onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })} required />
                <input className="glass-input" placeholder="College Name" value={demoForm.college} onChange={(e) => setDemoForm({ ...demoForm, college: e.target.value })} required />
                <select className="glass-input" value={demoForm.plan} onChange={(e) => setDemoForm({ ...demoForm, plan: e.target.value })}>
                  <option value="Starter">Starter</option>
                  <option value="Standard">Standard</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
                <textarea className="glass-input md:col-span-2 min-h-32" placeholder="Tell us about your library goals." value={demoForm.message} onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })} required />
                <div className="md:col-span-2">
                  <button type="submit" className="metallic-btn w-full sm:w-auto">Book Demo</button>
                </div>
              </form>
            ) : (
              <div className="rounded-[32px] border border-sky-400/20 bg-sky-400/10 p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Demo request submitted</p>
                <h3 className="mt-3 text-2xl font-black text-white">Our team will contact you shortly.</h3>
              </div>
            )}
          </section>
        </div>
      );
    }

    if (marketingPage === 'about') {
      return (
        <div className="space-y-8">
          <section className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-8 shadow-[0_18px_70px_rgba(2,6,23,0.3)] sm:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">About CampusLibrary AI</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">A clean SaaS platform for colleges that need secure, private, and modern library operations.</h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">The product is intentionally built as a multi-tenant foundation so each campus can operate independently while staying ready for future AI, analytics, and billing integrations.</p>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {aboutPoints.map((point, index) => (
              <div key={point} className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_15px_50px_rgba(2,6,23,0.18)]">
                <div className="mb-4 inline-flex rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-300">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-lg font-black text-white">Pillar {index + 1}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{point}</p>
              </div>
            ))}
          </section>
        </div>
      );
    }

    if (marketingPage === 'contact') {
      return (
        <div className="space-y-8">
          <section className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-8 shadow-[0_18px_70px_rgba(2,6,23,0.3)] sm:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Contact us</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Discuss your campus requirements with our team.</h2>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-8">
              <div className="space-y-4">
                <a href="mailto:hello@campuslibrary.ai" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 hover:border-sky-400/30">
                  <Mail size={18} className="text-sky-300" />
                  hello@campuslibrary.ai
                </a>
                <a href="tel:+919999999999" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 hover:border-sky-400/30">
                  <Phone size={18} className="text-sky-300" />
                  +91 99999 99999
                </a>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Pune, Maharashtra, India</div>
              </div>
            </div>
            <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-8">
              {!contactStatus ? (
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <input className="glass-input w-full" placeholder="Your Name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
                  <input className="glass-input w-full" placeholder="Work Email" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required />
                  <textarea className="glass-input min-h-32 w-full" placeholder="How can we help?" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required />
                  <button type="submit" className="metallic-btn w-full sm:w-auto">Send Message</button>
                </form>
              ) : (
                <div className="rounded-[32px] border border-sky-400/20 bg-sky-400/10 p-8 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Thanks for reaching out</p>
                  <h3 className="mt-3 text-2xl font-black text-white">We will get back to you soon.</h3>
                </div>
              )}
            </div>
          </section>
        </div>
      );
    }

    if (marketingPage === 'privacy') {
      return (
        <div className="rounded-[40px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_18px_70px_rgba(2,6,23,0.2)] sm:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Privacy policy</p>
          <h2 className="mt-3 text-3xl font-black text-white">CampusLibrary AI is built with tenant privacy at the core.</h2>
          <p className="mt-4 text-slate-300">Each college operates in a private workspace, and the platform is designed to keep institutional data separate and secure. This frontend is currently a polished prototype and is prepared for later backend privacy enforcement.</p>
        </div>
      );
    }

    if (marketingPage === 'terms') {
      return (
        <div className="rounded-[40px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_18px_70px_rgba(2,6,23,0.2)] sm:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Terms of service</p>
          <h2 className="mt-3 text-3xl font-black text-white">Use of the platform is subject to institution-level approval and secure access policies.</h2>
          <p className="mt-4 text-slate-300">By requesting access you agree to maintain proper authorization for your college and to use the platform in alignment with institutional policies and applicable data handling requirements.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <MarketingShellHero
          eyebrow="Multi-tenant SaaS for modern campuses"
          title="Turn your college library into a premium, AI-ready digital platform."
          description="CampusLibrary AI gives every college a private library workspace with secure operations, intelligent workflows, and a polished experience for admins, faculty, and students."
          primaryAction={<button type="button" onClick={onOpenRegister} className="metallic-btn w-full sm:w-auto">Register College</button>}
          secondaryAction={<button type="button" onClick={onOpenDemo} className="secondary-btn w-full sm:w-auto">Request Demo</button>}
        />

        <section className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4, delay: index * 0.08 }} className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_12px_45px_rgba(2,6,23,0.16)]">
                <div className="mb-4 inline-flex rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-300">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-black text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{feature.text}</p>
              </motion.div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_15px_50px_rgba(2,6,23,0.18)]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">How it works</p>
            <h3 className="mt-4 text-3xl font-black text-white">A guided path from registration to daily campus operations.</h3>
            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-400/10 text-sm font-black text-sky-300">0{index + 1}</div>
                  <div>
                    <p className="font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-300">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_15px_50px_rgba(2,6,23,0.18)]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Pricing</p>
            <h3 className="mt-4 text-3xl font-black text-white">Flexible plans that grow with each institution.</h3>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {pricingPlans.map((plan) => (
                <div key={plan.name} className={`rounded-[28px] border p-5 ${plan.popular ? 'border-sky-400/30 bg-sky-400/10' : 'border-white/10 bg-white/5'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-lg font-black text-white">{plan.name}</h4>
                    {plan.popular && <span className="rounded-full bg-sky-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-sky-300">Popular</span>}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{plan.students}</p>
                  <p className="mt-2 text-sm text-slate-300">{plan.duration}</p>
                  <p className="mt-4 text-3xl font-black text-white">{plan.price}</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {plan.features.map((feature) => <li key={feature} className="flex items-center gap-2"><BadgeCheck size={14} className="text-sky-300" />{feature}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[40px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_15px_50px_rgba(2,6,23,0.18)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Testimonials</p>
              <h3 className="mt-3 text-3xl font-black text-white">Trusted by campus leaders who want a more mature library experience.</h3>
            </div>
            <button type="button" onClick={onOpenRegister} className="metallic-btn w-full sm:w-auto">Get Started</button>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex gap-1 text-sky-300">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}</div>
                <p className="text-sm leading-relaxed text-slate-300">“{testimonial.quote}”</p>
                <div className="mt-5">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">FAQs</p>
            <div className="mt-6 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <summary className="cursor-pointer font-semibold text-white">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Contact</p>
            <h3 className="mt-4 text-3xl font-black text-white">Ready to modernize your campus library experience?</h3>
            <p className="mt-4 text-slate-300">Speak with our team to discuss onboarding, pricing, or a live product walkthrough.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onOpenRegister} className="metallic-btn w-full sm:w-auto">Register College</button>
              <button type="button" onClick={onOpenDemo} className="secondary-btn w-full sm:w-auto">Book Demo</button>
            </div>
          </div>
        </section>
      </div>
    );
  };

  return <MarketingLayout activePage={marketingPage} onNavigate={onNavigate} onOpenLogin={onOpenLogin} onOpenRegister={onOpenRegister} children={renderPageContent()} />;
}

function LibraryAI({ books }: { books: Book[] }) {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Greetings, Scholar. I am your Neural Librarian. How may I assist your research today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setIsTyping(true);

    // Simulate AI logic
    setTimeout(() => {
      const q = userMsg.toLowerCase();
      let response = "I've scanned the archives. Try searching for specific genres like 'Python' or 'Mathematics'.";
      
      const foundBooks = books.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.category.toLowerCase().includes(q) ||
        b.department.toLowerCase().includes(q)
      ).slice(0, 2);

      if (foundBooks.length > 0) {
        response = `Based on your request, I recommend: ${foundBooks.map(b => b.title).join(' or ')}. You can find them in the ${foundBooks[0].section}.`;
      } else if (q.includes('hello') || q.includes('hi')) {
        response = "System online. Ready to cross-reference the collection for you.";
      }

      setChat(prev => [...prev, { role: 'bot', text: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="glass-panel p-8 rounded-[40px] h-[600px] flex flex-col relative overflow-hidden">
      <div className="scanline"></div>
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="p-3 bg-library-gold/10 rounded-2xl border border-library-gold/20">
          <Bot className="text-library-gold" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-serif italic text-white font-bold">AI Librarian</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Neural Recommendation Engine v2.0</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 relative z-10 custom-scrollbar">
        {chat.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold leading-relaxed border ${
              msg.role === 'user' 
                ? 'bg-white/5 border-white/10 text-white rounded-tr-none' 
                : 'bg-library-gold/5 border-library-gold/20 text-library-gold rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-library-gold/5 border border-library-gold/10 p-3 rounded-2xl flex gap-1">
               <div className="w-1.5 h-1.5 bg-library-gold rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-library-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
               <div className="w-1.5 h-1.5 bg-library-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
             </div>
           </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="relative z-10">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI Librarian for a book recommendation..."
          className="glass-input w-full pr-16 py-5"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-library-gold hover:scale-110 transition-all">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

function AdminStatsDashboard({ 
  records, 
  onNavigate 
}: { 
  records: IssueRecord[], 
  onNavigate: (tab: any, filter: 'all' | 'pending' | 'return_pending') => void 
}) {
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const issued = records.filter(r => r.status === 'accepted' || r.status === 'returned');
    const returned = records.filter(r => r.status === 'returned');
    const activeUsers = new Set(records.filter(r => r.status === 'accepted' || r.status === 'return_pending').map(r => r.studentPrn)).size;
    const students = new Set(records.map(r => r.studentPrn)).size;
    const overdue = records.filter(r => {
      if (r.status !== 'accepted' && r.status !== 'return_pending') return false;
      const dueDate = new Date(r.dueDate);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return dueDate < todayStart;
    }).length;

    return {
      totalBooks: ALL_BOOKS.length,
      issuedBooks: issued.length,
      returnedBooks: returned.length,
      students,
      activeUsers,
      overdueBooks: overdue,
      pendingIssues: records.filter(r => r.status === 'pending').length,
      pendingReturns: records.filter(r => r.status === 'return_pending').length,
      issuedToday: records.filter(r => new Date(r.issueDate).toDateString() === today && (r.status === 'accepted' || r.status === 'returned')).length,
      returnedToday: records.filter(r => r.status === 'returned' && new Date().toDateString() === today).length,
    };
  }, [records]);

  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = monthNames.map((name) => ({ name, issued: 0 }));

    records.forEach((record) => {
      const issueDate = new Date(record.issueDate);
      const monthIndex = issueDate.getMonth();
      if (record.status === 'accepted' || record.status === 'returned') {
        counts[monthIndex].issued += 1;
      }
    });

    return counts.slice(0, 6);
  }, [records]);

  const activityData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (5 - index));
      const label = day.toLocaleDateString('en', { weekday: 'short' });
      const count = records.filter((record) => new Date(record.issueDate).toDateString() === day.toDateString()).length;
      return { name: label, activity: count };
    });
  }, [records]);

  const bookBorrowData = useMemo(() => {
    const counts = ALL_BOOKS.map((book) => {
      const borrowCount = records.filter((record) => record.bookId === book.id && (record.status === 'accepted' || record.status === 'returned')).length;
      return { id: book.id, title: book.title, category: book.category, count: borrowCount };
    });
    return counts.sort((a, b) => b.count - a.count);
  }, [records]);

  const mostBorrowedBooks = useMemo(() => bookBorrowData.filter((item) => item.count > 0).slice(0, 5), [bookBorrowData]);
  const leastBorrowedBooks = useMemo(() => [...bookBorrowData].filter((item) => item.count === 0).slice(0, 5), [bookBorrowData]);

  const categoryData = useMemo(() => {
    const counts = records.reduce((acc, record) => {
      if (record.status !== 'accepted' && record.status !== 'returned') return acc;
      const book = ALL_BOOKS.find((item) => item.id === record.bookId);
      if (!book) return acc;
      const key = book.category || 'General';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [records]);

  const fineCollection = useMemo(() => {
    const total = records.reduce((sum, record) => sum + (record.fineAmount || 0), 0);
    return total;
  }, [records]);

  const fineTrendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const label = date.toLocaleDateString('en', { weekday: 'short' });
      const amount = records
        .filter((record) => record.status === 'returned' && new Date(record.issueDate).toDateString() === date.toDateString())
        .reduce((sum, record) => sum + (record.fineAmount || 0), 0);
      return { name: label, fine: amount };
    });
    return last7Days;
  }, [records]);

  const studentBorrowData = useMemo(() => {
    const counts = records.reduce((acc, record) => {
      if (record.status !== 'accepted' && record.status !== 'returned') return acc;
      acc[record.studentPrn] = (acc[record.studentPrn] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([prn, count]) => ({ prn, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [records]);

  const statCards = [
    { label: 'Total Books', value: stats.totalBooks, icon: Library, color: 'text-library-gold', filter: 'all' as const },
    { label: 'Issued Books', value: stats.issuedBooks, icon: BookIcon, color: 'text-blue-500', filter: 'all' as const },
    { label: 'Returned Books', value: stats.returnedBooks, icon: CheckCircle2, color: 'text-green-500', filter: 'all' as const },
    { label: 'Students', value: stats.students, icon: UserIcon, color: 'text-purple-500', filter: 'all' as const },
    { label: 'Active Members', value: stats.activeUsers, icon: ShieldCheck, color: 'text-cyan-500', filter: 'all' as const },
    { label: 'Overdue Books', value: stats.overdueBooks, icon: Clock, color: 'text-rose-500', filter: 'all' as const },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-8 shadow-2xl shadow-black/20"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-library-gold">Operations command center</p>
            <h2 className="text-3xl font-serif italic text-white font-bold">A cleaner, smarter view of your library performance.</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Monitor circulation trends, student engagement, and return health from one polished workspace designed for modern SaaS-style administration.
            </p>
          </div>
          <div className="rounded-full border border-library-gold/20 bg-library-gold/10 px-4 py-2 text-sm font-semibold text-library-gold">
            {stats.issuedToday} issues today • {stats.returnedToday} returns today
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            onClick={() => onNavigate('registry', stat.filter)}
            className="group glass-panel cursor-pointer rounded-[32px] border-white/5 p-6 transition-all hover:-translate-y-1 hover:border-library-gold/30"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div className="rounded-full bg-library-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-library-gold">
                Live
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-serif italic font-bold text-white">{stat.value}</p>
            <p className="mt-3 text-sm text-gray-500">Tap to review related records in the registry.</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-panel rounded-[40px] border-white/5 p-8"
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Monthly books issued</h3>
              <p className="mt-1 text-sm text-gray-500">A clear view of issue momentum over the last half-year.</p>
            </div>
            <div className="rounded-full bg-library-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-library-gold">
              Trend
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7c8aa2', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7c8aa2', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a101f', borderRadius: '16px', border: '1px solid #ffffff10', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="issued" stroke="#D4AF37" fillOpacity={1} fill="url(#colorIssued)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="glass-panel rounded-[40px] border-white/5 p-8"
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Category distribution</h3>
              <p className="mt-1 text-sm text-gray-500">Understand the spread of the catalog at a glance.</p>
            </div>
            <div className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">
              Catalog
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={['#D4AF37', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a101f', borderRadius: '16px', border: '1px solid #ffffff10', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ['#D4AF37', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 6] }} />
                  {item.name}
                </div>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="glass-panel rounded-[40px] border-white/5 p-8"
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Daily activity & analytics insights</h3>
            <p className="mt-1 text-sm text-gray-500">A rolling view of circulation activity paired with borrowing behavior and fee collection.</p>
          </div>
          <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
            Activity
          </div>
        </div>
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7c8aa2', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7c8aa2', fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0a101f', borderRadius: '16px', border: '1px solid #ffffff10', color: '#fff' }}
                />
                <Bar dataKey="activity" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="rounded-[28px] border border-library-gold/20 bg-library-gold/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-library-gold">Fine collection</p>
              <p className="mt-2 text-3xl font-semibold text-white">₹{fineCollection}</p>
              <p className="mt-2 text-sm text-gray-400">Collected from late returns and overdue activity.</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Students with maximum borrowings</p>
              <div className="space-y-2">
                {studentBorrowData.map((student, index) => (
                  <div key={student.prn} className="flex items-center justify-between rounded-2xl bg-slate-950/60 px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold text-white">{student.prn}</p>
                      <p className="text-xs text-gray-500">#{index + 1} active borrower</p>
                    </div>
                    <div className="rounded-full bg-library-gold/10 px-2.5 py-1 text-[10px] font-semibold text-library-gold">
                      {student.count} books
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="glass-panel rounded-[40px] border-white/5 p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Most borrowed books</h3>
              <p className="mt-1 text-sm text-gray-500">Quickly spot the most requested titles.</p>
            </div>
            <div className="rounded-full bg-library-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-library-gold">
              Popular
            </div>
          </div>
          <div className="space-y-3">
            {mostBorrowedBooks.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-400">
                  {item.count} borrows
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="glass-panel rounded-[40px] border-white/5 p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Least borrowed books</h3>
              <p className="mt-1 text-sm text-gray-500">Surface underused titles and revisit inventory pacing.</p>
            </div>
            <div className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
              Inventory
            </div>
          </div>
          <div className="space-y-3">
            {leastBorrowedBooks.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <div className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-semibold text-amber-400">
                  {item.count} borrows
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36 }}
        className="glass-panel rounded-[40px] border-white/5 p-8"
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Fine collection trend</h3>
            <p className="mt-1 text-sm text-gray-500">Monitor overdue penalties over the last seven days.</p>
          </div>
          <div className="rounded-full bg-rose-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-rose-400">
            Revenue
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fineTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7c8aa2', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7c8aa2', fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: '#ffffff05' }}
                contentStyle={{ backgroundColor: '#0a101f', borderRadius: '16px', border: '1px solid #ffffff10', color: '#fff' }}
              />
              <Bar dataKey="fine" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

function BootScreen({ logs }: { logs: string[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-2xl glass-panel p-10 rounded-[40px] border-library-gold/20 relative overflow-hidden"
    >
      <div className="scanline"></div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-library-gold/10 rounded-xl flex items-center justify-center border border-library-gold/20">
          <ShieldCheck className="text-library-gold animate-pulse" size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">System Initialization</h2>
          <p className="text-[10px] text-library-gold font-bold tracking-[0.3em] uppercase">Security Level: Class-5</p>
        </div>
      </div>

      <div className="bg-black/60 rounded-2xl p-6 font-mono text-[11px] h-64 overflow-hidden border border-white/5 relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/40"></div>
        <div className="space-y-2">
          {logs.map((log, i) => (
            <motion.p 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              key={i} 
              className="text-library-gold/80"
            >
              <span className="text-white/40 mr-3">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </motion.p>
          ))}
          <p className="text-library-gold cursor-blink">_</p>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between items-center px-2">
        <div className="flex gap-1">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="w-10 h-1.5 bg-library-gold/10 rounded-full overflow-hidden">
              {logs.length >= i && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-library-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                />
              )}
            </div>
          ))}
        </div>
        <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">Python_Core v2.5</span>
      </div>
    </motion.div>
  );
}

function SystemConsole() {
  const [logs, setLogs] = useState<string[]>(['>>> KERNEL LOADED', '>>> PYTHON BRIDGE HANDSHAKE READY']);
  
  useEffect(() => {
    const messages = [
      'Database sync: OK',
      'Optimizing query pathways...',
      'Python background PID: 4052',
      'Neural cache: 100% indexed',
      'Manuscript 1204 Accession ID: VRFD',
      'Memory allocation: Valid',
      'Establishing API tunnel...'
    ];
    
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [...prev.slice(-5), msg]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-6 rounded-[28px] border-white/5 overflow-hidden relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 bg-library-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-library-gold/60">Live Python Console</h4>
      </div>
      <div className="space-y-1.5 h-32 overflow-hidden">
        {logs.map((log, i) => (
          <p key={i} className="font-mono text-[9px] text-library-gold/40 truncate uppercase tracking-tighter">
            <span className="text-white/5 mr-2">{i}:</span>
            {log}
          </p>
        ))}
        <p className="font-mono text-[9px] text-library-gold cursor-blink">_</p>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
         <ShieldCheck size={60} />
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: (u: string, p: string) => boolean }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 20 }}
      className="w-full max-w-lg"
    >
      <div className="glass-panel relative rounded-[40px] p-8 sm:p-12">
        <div className="mb-10 sm:mb-12">
          <h2 className="mb-4 text-3xl font-serif italic text-white sm:text-5xl">Durvesh Library</h2>
          <p className="text-library-gold font-bold text-lg uppercase tracking-widest">
            Library Authentication Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Username / PRN
              </label>
              <div className="relative group">
                <input 
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Username"
                  className="glass-input w-full pr-16 text-lg font-bold"
                  autoComplete="username"
                  required
                />
                <UserIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-library-gold z-10" size={20} />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <input 
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pr-16 text-lg font-bold"
                  autoComplete="current-password"
                  required
                />
                <ShieldCheck className="absolute right-5 top-1/2 -translate-y-1/2 text-library-gold z-10" size={20} />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-xs font-bold uppercase tracking-widest text-center"
              >
                Invalid Credentials or PRN Out of Range
              </motion.p>
            )}
          </AnimatePresence>

          <button type="submit" className="metallic-btn w-full py-5 text-xl mt-4 group">
            Access Library
            <ChevronRight size={26} className="group-hover:translate-x-1.5 transition-transform" />
          </button>

          <div className="pt-6 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
              Student Range: 12501 to 12600 (Pass = PRN)<br/>
              Python Full-Stack Core v2.5.0 Deployment
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

function StudentManagementModule({ records }: { records: IssueRecord[] }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Clear'>('All');

  const students = useMemo(() => {
    const departments = ['Computer Science', 'Mechanical', 'Electronics', 'Civil', 'Information Technology'];
    const years = ['FY', 'SY', 'TY'];
    const uniquePrns = Array.from(new Set(records.map((record) => record.studentPrn)));

    return uniquePrns.map((prn, index) => {
      const studentRecords = records.filter((record) => record.studentPrn === prn);
      const latest = studentRecords[0];
      const department = departments[index % departments.length];
      const year = years[index % years.length];
      const rollNumber = 1000 + index + 1;
      const phone = `+91 98${(100000000 + index * 12345).toString().slice(1, 9)}`;
      const email = `${(latest?.studentName || `student${index + 1}`).toLowerCase().replace(/\s+/g, '.')}@college.edu`;
      const currentBooks = studentRecords.filter((record) => record.status === 'accepted' || record.status === 'return_pending');
      const borrowHistory = studentRecords.length;
      const fineAmount = studentRecords.reduce((sum, record) => sum + (record.fineAmount || 0), 0);
      const status = currentBooks.length > 0 ? 'Active' : 'Clear';

      return {
        id: prn,
        name: latest?.studentName || `Student ${index + 1}`,
        prn,
        department,
        year,
        rollNumber,
        phone,
        email,
        currentBooks,
        borrowHistory,
        fineAmount,
        status,
      };
    });
  }, [records]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = [student.name, student.prn, student.department, student.year, student.rollNumber.toString()].some((value) =>
        value.toString().toLowerCase().includes(search.toLowerCase())
      );
      const matchesDept = deptFilter === 'All' || student.department === deptFilter;
      const matchesYear = yearFilter === 'All' || student.year === yearFilter;
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
      return matchesSearch && matchesDept && matchesYear && matchesStatus;
    });
  }, [students, search, deptFilter, yearFilter, statusFilter]);

  const getAvatar = (name: string, color: string) => {
    const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
        <rect width="160" height="160" rx="32" fill="${color}" />
        <circle cx="80" cy="64" r="28" fill="rgba(255,255,255,0.25)" />
        <path d="M40 128c8-24 24-34 40-34s32 10 40 34" fill="rgba(255,255,255,0.2)" />
        <text x="80" y="148" text-anchor="middle" font-family="Inter, Arial" font-size="26" font-weight="700" fill="white">${initials}</text>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-library-gold">Student management</p>
            <h2 className="text-3xl font-serif italic text-white font-bold">A focused view of scholar profiles, activity, and dues.</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Keep student records organized with profile details, current holds, borrow history, and fine visibility in a responsive workspace.
            </p>
          </div>
          <div className="rounded-full border border-library-gold/20 bg-library-gold/10 px-4 py-2 text-sm font-semibold text-library-gold">
            {students.length} active student profiles
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[36px] border-white/5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, PRN, roll number..."
              className="glass-input w-full pl-12 text-sm"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="glass-input text-sm">
              <option value="All">All departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electronics">Electronics</option>
              <option value="Civil">Civil</option>
              <option value="Information Technology">Information Technology</option>
            </select>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="glass-input text-sm">
              <option value="All">All years</option>
              <option value="FY">FY</option>
              <option value="SY">SY</option>
              <option value="TY">TY</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Clear')} className="glass-input text-sm">
              <option value="All">All status</option>
              <option value="Active">Active</option>
              <option value="Clear">Clear</option>
            </select>
          </div>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="glass-panel rounded-[36px] border-white/5 p-12 text-center text-gray-500">
          <UserIcon size={48} className="mx-auto mb-4 text-library-gold" />
          <p className="text-lg font-semibold text-white">No student profiles matched this query.</p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel rounded-[36px] border-white/5 p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <img src={getAvatar(student.name, ['#D4AF37', '#3b82f6', '#8b5cf6', '#10b981'][index % 4])} alt={`${student.name} avatar`} className="h-24 w-24 rounded-[28px] border border-white/10 object-cover shadow-lg" />
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{student.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">PRN {student.prn}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] ${student.status === 'Active' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-gray-500/20 bg-gray-500/10 text-gray-400'}`}>
                      {student.status}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Department</p>
                      <p className="mt-1 text-sm font-semibold text-white">{student.department}</p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Year</p>
                      <p className="mt-1 text-sm font-semibold text-white">{student.year}</p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Roll number</p>
                      <p className="mt-1 text-sm font-semibold text-white">{student.rollNumber}</p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Fine amount</p>
                      <p className="mt-1 text-sm font-semibold text-rose-400">₹{student.fineAmount}</p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Phone size={14} className="text-library-gold" />
                      {student.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail size={14} className="text-library-gold" />
                      {student.email}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-library-gold">
                        <BookIcon size={16} />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em]">Borrow history</p>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-white">{student.borrowHistory}</p>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-library-gold">
                        <ShieldCheck size={16} />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em]">Current books</p>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-white">{student.currentBooks.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard({ 
  user, 
  records, 
  messages,
  onSendMessage,
  onIssue, 
  onAccept, 
  onReject,
  onReturn,
  onApproveReturn,
  activeTab,
  setActiveTab,
  setRegistryFilter,
  registryFilter
}: { 
  user: User, 
  records: IssueRecord[], 
  messages: ChatMessage[],
  onSendMessage: (text: string) => void,
  onIssue: (book: Book) => boolean,
  onAccept: (id: string) => void,
  onReject: (id: string) => void,
  onReturn: (id: string) => void,
  activeTab: 'catalog' | 'registry' | 'chat' | 'terminal' | 'stats' | 'return_center' | 'ai_assistant' | 'students',
  setActiveTab: (t: 'catalog' | 'registry' | 'chat' | 'terminal' | 'stats' | 'return_center' | 'ai_assistant' | 'students') => void,
  onApproveReturn: (id: string) => void,
  setRegistryFilter: (f: 'all' | 'pending' | 'return_pending') => void,
  registryFilter: 'all' | 'pending' | 'return_pending'
}) {
  const [search, setSearch] = useState('');
  const [directCode, setDirectCode] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'low' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'department' | 'category' | 'copies'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [catalogBooks, setCatalogBooks] = useState<Book[]>(ALL_BOOKS);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<IssueRecord | null>(null);
  const [success, setSuccess] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // AI Recommendation Engine (Mock logic based on categories)
  const recommendations = useMemo(() => {
    if (user.role === 'admin') return [];
    const issuedCategories = Array.from(new Set(records.filter(r => r.studentPrn === user.prn).map(r => {
      const book = ALL_BOOKS.find(b => b.id === r.bookId);
      return book?.category;
    }))).filter(Boolean);
    
    if (issuedCategories.length === 0) {
      // Default recommendations for new users
      return ALL_BOOKS.filter(b => b.department === 'General').slice(0, 4);
    }

    return ALL_BOOKS.filter(b => issuedCategories.includes(b.category)).slice(0, 4);
  }, [user, records]);

  const subCategories: Record<string, string[]> = {
    'FY': ['Basic Electronics', 'Mathematics I', 'Communication Skills', 'Physics'],
    'SY': ['Data Structures', 'Microprocessors', 'Database Systems', 'Mathematics II'],
    'TY': ['Artificial Intelligence', 'Cloud Computing', 'Cyber Security', 'Project Management'],
    'General': ['UPSC Essentials', 'MPSC Guide', 'Indian History', 'Programming (C/C++)', 'Python Advanced']
  };

  const filteredBooks = useMemo(() => {
    let list = catalogBooks;
    if (deptFilter !== 'All') {
      list = list.filter(b => b.department === deptFilter);
    }
    if (categoryFilter !== 'All') {
      list = list.filter(b => b.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((book) => {
        if (statusFilter === 'available') return book.copies > 2;
        if (statusFilter === 'low') return book.copies > 0 && book.copies <= 2;
        return book.copies === 0;
      });
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(b => 
        b.title.toLowerCase().includes(s) ||
        b.id.toLowerCase().includes(s) ||
        b.code.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s) ||
        b.department.toLowerCase().includes(s) ||
        b.category.toLowerCase().includes(s) ||
        b.section.toLowerCase().includes(s)
      );
    }
    return list;
  }, [catalogBooks, search, categoryFilter, deptFilter, statusFilter]);

  const sortedBooks = useMemo(() => {
    const next = [...filteredBooks];
    next.sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      const left = a[sortBy];
      const right = b[sortBy];
      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * modifier;
      }
      return String(left).localeCompare(String(right)) * modifier;
    });
    return next;
  }, [filteredBooks, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedBooks.length / pageSize));
  const paginatedBooks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedBooks.slice(start, start + pageSize);
  }, [sortedBooks, page, pageSize]);

  useEffect(() => {
    setPage(1);
    setSelectedBookIds([]);
  }, [search, categoryFilter, deptFilter, statusFilter, pageSize, sortBy, sortOrder]);

  const getBookCover = (book: Book) => {
    const palette = ['#D4AF37', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    const color = palette[book.id.length % palette.length];
    const initials = book.title.split(' ').slice(0, 2).map(word => word[0] || '').join('').toUpperCase();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="320" viewBox="0 0 240 320">
        <rect width="240" height="320" rx="28" fill="#0f172a"/>
        <rect x="18" y="18" width="204" height="284" rx="22" fill="${color}" opacity="0.18"/>
        <rect x="32" y="42" width="176" height="110" rx="18" fill="${color}" opacity="0.28"/>
        <rect x="42" y="166" width="156" height="14" rx="7" fill="#ffffff" opacity="0.16"/>
        <rect x="42" y="192" width="120" height="10" rx="5" fill="#ffffff" opacity="0.14"/>
        <circle cx="180" cy="242" r="36" fill="#ffffff" opacity="0.12"/>
        <text x="120" y="255" text-anchor="middle" font-family="Inter, Arial" font-size="50" font-weight="700" fill="#ffffff">${initials}</text>
        <text x="120" y="286" text-anchor="middle" font-family="Inter, Arial" font-size="14" fill="#d1d5db">${book.department}</text>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const getBookStatus = (book: Book) => {
    if (book.copies === 0) {
      return { label: 'Out of stock', badge: 'border-red-500/20 bg-red-500/10 text-red-400', dot: 'bg-red-500' };
    }
    if (book.copies <= 2) {
      return { label: 'Low stock', badge: 'border-amber-500/20 bg-amber-500/10 text-amber-400', dot: 'bg-amber-500' };
    }
    return { label: 'Available', badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-500' };
  };

  const toggleBookSelection = (id: string) => {
    setSelectedBookIds((prev) => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (selectedBookIds.length === 0) return;
    setCatalogBooks((prev) => prev.filter((book) => !selectedBookIds.includes(book.id)));
    setSelectedBookIds([]);
  };

  const handleBulkExport = () => {
    const exportBooks = selectedBookIds.length > 0 ? catalogBooks.filter((book) => selectedBookIds.includes(book.id)) : filteredBooks;
    const rows = exportBooks.map((book) => [book.id, book.code, book.title, book.author, book.department, book.category, book.section, book.copies, getBookStatus(book).label].join(','));
    const csv = ['id,code,title,author,department,category,section,copies,status', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'library-books.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDirectIssue = (e: FormEvent) => {
    e.preventDefault();
    const book = ALL_BOOKS.find(b => b.id.toLowerCase() === directCode.toLowerCase() || b.code.toLowerCase() === directCode.toLowerCase());
    if (book) {
      setSelectedBook(book);
      setDirectCode('');
    } else {
      alert("Python_Core: Book ID not found in current Registry.");
    }
  };

  const studentRecords = records.filter(r => r.studentPrn === user.prn);

  const displayRecords = useMemo(() => {
    if (user.role !== 'admin') return studentRecords;
    if (registryFilter === 'all') return records;
    return records.filter(r => r.status === registryFilter);
  }, [user, records, studentRecords, registryFilter]);

  const handleIssueRequest = () => {
    if (selectedBook && onIssue(selectedBook)) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedBook(null);
      }, 2000);
    }
  };

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  const filteredMessages = useMemo(() => {
    if (user.role === 'admin') return messages; // Admin sees all? Or do they need to filter by PRN?
    return messages.filter(m => m.senderPrn === user.prn || (m.isAdmin && m.text.includes(`@${user.prn}`)));
    // Simplified: show all admin messages or messages from this student. 
    // In a real app we'd have conversation IDs.
  }, [messages, user]);

  // Admin view needs to filter chats by student
  const [adminChatPRN, setAdminChatPRN] = useState<string | null>(null);
  const studentsWithMessages = useMemo(() => Array.from(new Set(messages.filter(m => !m.isAdmin).map(m => m.senderPrn))), [messages]);

  const displayedMessagesForAdmin = useMemo(() => {
     if (!adminChatPRN) return [];
     return messages.filter(m => m.senderPrn === adminChatPRN || (m.isAdmin && m.text.includes(`@${adminChatPRN}`)));
  }, [messages, adminChatPRN]);

  const generateReceipt = (record: IssueRecord) => {
    const doc = new jsPDF();
    
    // Receipt Header
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55); // Gold
    doc.text('DURVESH LIBRARY RECEIPT', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Python-Powered Management System Core 2.5', 105, 38, { align: 'center' });
    
    // Horizontal Line
    doc.setDrawColor(212, 175, 55);
    doc.line(20, 45, 190, 45);
    
    // Content Table
    autoTable(doc, {
      startY: 55,
      head: [['Field', 'Description']],
      body: [
        ['Student PRN', record.studentPrn],
        ['Student Name', record.studentName],
        ['Book ID', record.bookId],
        ['Accession Code', record.bookCode],
        ['Title', record.bookTitle],
        ['Author', record.author],
        ['Issue Date', formatDisplayDate(record.issueDate)],
        ['Due Date', formatDisplayDate(record.dueDate)],
        ['Late Fee Rate', 'Rs. 5 / day'],
        ['Status', record.status.toUpperCase()]
      ],
      theme: 'striped',
      headStyles: { fillColor: [40, 40, 40] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });
    
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 150);
    doc.text('Authorized Digital Signature: Durvesh Library Authority', 20, 158);
    
    doc.save(`Receipt_${record.bookCode}_${record.studentPrn}.pdf`);
  };

  return (
    <div className="w-full max-w-7xl">
      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-2 px-1">
        {[
          { id: 'stats', label: 'Admin Hub', icon: ShieldCheck, show: user.role === 'admin' },
          { id: 'students', label: 'Student Mgmt', icon: UserIcon, show: user.role === 'admin' },
          { id: 'ai_assistant', label: 'AI Librarian', icon: Bot, show: user.role === 'student' },
          { id: 'catalog', label: 'Book Catalog', icon: BookIcon, show: true },
          { id: 'terminal', label: 'Issue Books', icon: Library, show: user.role === 'student' },
          { id: 'return_center', label: 'Return Center', icon: LogOut, show: user.role === 'student' },
          { id: 'registry', label: user.role === 'admin' ? 'Managed Registry' : 'My Bookshelf', icon: Layers, show: true },
          { id: 'chat', label: 'Support Chat', icon: MessageSquare, show: true }
        ].filter(t => t.show).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 border whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-library-gold text-black border-library-gold shadow-lg shadow-library-gold/20' 
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 space-y-8">
          {activeTab === 'catalog' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-6 rounded-[32px] space-y-6"
            >
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-library-gold flex items-center gap-2 px-1">
                  <Filter size={14} /> Category Selector
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'FY', 'SY', 'TY', 'General'].map(dept => (
                    <button
                      key={dept}
                      onClick={() => { setDeptFilter(dept); setCategoryFilter('All'); }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                        deptFilter === dept 
                          ? 'bg-library-gold text-black border-library-gold' 
                          : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>

                {deptFilter !== 'All' && (
                   <div className="pt-2 space-y-2">
                     <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest px-1">Sub-Categories</p>
                     <div className="flex flex-col gap-1">
                       {['All', ...subCategories[deptFilter]].map(sub => (
                         <button
                           key={sub}
                           onClick={() => setCategoryFilter(sub)}
                           className={`text-left px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${
                             categoryFilter === sub ? 'text-library-gold bg-library-gold/10' : 'text-gray-500 hover:text-white'
                           }`}
                         >
                           {sub}
                         </button>
                       ))}
                     </div>
                   </div>
                )}
              </div>

              <div className="w-full h-px bg-white/5"></div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-library-gold flex items-center gap-2 px-1">
                   <Filter size={14} /> Advanced Search
                </h4>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search title, code, author, section..." 
                    className="glass-input w-full pl-12 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.25em] text-gray-500">Availability</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'low' | 'out')}
                    className="glass-input w-full text-sm"
                  >
                    <option value="all">All books</option>
                    <option value="available">Available</option>
                    <option value="low">Low stock</option>
                    <option value="out">Out of stock</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.25em] text-gray-500">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'title' | 'author' | 'department' | 'category' | 'copies')}
                    className="glass-input w-full text-sm"
                  >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="department">Department</option>
                    <option value="category">Category</option>
                    <option value="copies">Copies</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.25em] text-gray-500">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="glass-input w-full text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'terminal' && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-panel p-6 rounded-[32px] space-y-6"
             >
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-library-gold flex items-center gap-2 px-1">
                    <Hash size={14} /> ID Access Terminal
                  </h4>
                  <form onSubmit={handleDirectIssue} className="relative">
                    <input 
                      type="text" 
                      placeholder="Enter Book ID (e.g. BK-100001)..." 
                      value={directCode}
                      onChange={(e) => setDirectCode(e.target.value)}
                      className="glass-input w-full pr-12 text-sm border-library-gold/20"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-library-gold hover:scale-110 transition-transform">
                      <Send size={18} />
                    </button>
                  </form>
                  <p className="text-[9px] text-gray-500 italic px-1">Note: Find the Book ID in the Library Shell catalog first.</p>
                </div>
             </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-[32px] border-white/5"
          >
            <div className="flex flex-col items-center">
              {user.role === 'student' && (
                <div className="w-full mb-8 bg-library-gold/5 p-4 rounded-2xl border border-library-gold/10 text-center">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Available Credit</p>
                   <p className="text-3xl font-serif text-library-gold font-bold">₹{user.walletBalance}</p>
                   {user.walletBalance! < 40 && (
                     <p className="text-[8px] text-red-500 font-black uppercase mt-2 animate-pulse">Low Balance: Issuing Restricted</p>
                   )}
                </div>
              )}
              
              <div className="w-24 h-24 bg-white/5 rounded-3xl mb-6 flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden group">
                <div className="w-full h-full bg-gradient-to-br from-library-gold/20 to-transparent flex items-center justify-center transition-transform group-hover:scale-110">
                  <UserIcon size={48} className="text-library-gold" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">{user.username}</h3>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[10px] text-library-gold font-bold uppercase tracking-[0.2em] bg-library-gold/10 px-3 py-1 rounded-full">{user.role}</p>
                  <p className="text-[9px] text-gray-400 font-mono tracking-widest">{user.prn}</p>
                </div>
              </div>
              
              <div className="w-full h-px bg-white/5 my-8"></div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center transition-colors hover:border-library-gold/20">
                  <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Total Items</p>
                  <p className="text-xl font-serif text-white font-bold">
                    {user.role === 'admin' ? records.length : studentRecords.length}
                  </p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center transition-colors hover:border-library-gold/20">
                  <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Active Now</p>
                  <p className="text-xl font-serif text-library-gold font-bold">
                    {user.role === 'admin' 
                      ? records.filter(r => r.status === 'accepted').length 
                      : studentRecords.filter(r => r.status === 'accepted').length}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <SystemConsole />
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'catalog' ? (
              <motion.div 
                key="catalog-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-8 rounded-[40px] relative min-h-[600px]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-10 px-2">
                  <div>
                    <h2 className="font-serif italic text-4xl text-white font-bold">Library Shell</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                      Browsing {filteredBooks.length.toLocaleString()} Active Manuscripts • {deptFilter} / {categoryFilter}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                      {sortedBooks.length} results
                    </div>
                    <div className="bg-library-gold/10 px-4 py-2 rounded-full border border-library-gold/20">
                      <span className="text-[10px] text-library-gold font-black uppercase tracking-widest text-center">System Secure</span>
                    </div>
                  </div>
                </div>

                {user.role === 'student' && recommendations.length > 0 && (
                  <div className="mb-12">
                    <p className="text-[11px] font-black text-library-gold uppercase tracking-[0.3em] mb-6 px-1 flex items-center gap-3">
                       <PlusCircle size={14} /> Recommended For You
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {recommendations.map(book => (
                        <div 
                          key={book.id}
                          onClick={() => setSelectedBook(book)}
                          className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-library-gold/20 transition-all cursor-pointer group"
                        >
                           <p className="text-[9px] text-gray-600 font-mono mb-2">{book.id}</p>
                           <h4 className="text-xs font-bold text-white group-hover:text-library-gold truncate">{book.title}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6 flex flex-col gap-3 rounded-[30px] border border-white/10 bg-slate-950/50 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedBookIds(paginatedBooks.map((book) => book.id))}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-300"
                    >
                      Select visible
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={selectedBookIds.length === 0}
                      className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2"><Trash2 size={12} /> Bulk delete</span>
                    </button>
                    <button
                      onClick={handleBulkExport}
                      className="rounded-full border border-library-gold/20 bg-library-gold/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-library-gold"
                    >
                      <span className="flex items-center gap-2"><Download size={12} /> Bulk export</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'title' | 'author' | 'department' | 'category' | 'copies')}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 outline-none"
                    >
                      <option value="title">Sort: Title</option>
                      <option value="author">Sort: Author</option>
                      <option value="department">Sort: Department</option>
                      <option value="category">Sort: Category</option>
                      <option value="copies">Sort: Copies</option>
                    </select>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 outline-none"
                    >
                      <option value={6}>6 per page</option>
                      <option value={8}>8 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={12}>12 per page</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/40">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-white/5 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                        <tr>
                          <th className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={paginatedBooks.length > 0 && paginatedBooks.every((book) => selectedBookIds.includes(book.id))}
                              onChange={() => {
                                const ids = paginatedBooks.map((book) => book.id);
                                setSelectedBookIds((prev) => prev.length === ids.length && ids.every((id) => prev.includes(id)) ? [] : ids);
                              }}
                              className="h-4 w-4 rounded border-white/10 bg-transparent"
                            />
                          </th>
                          <th className="px-4 py-4">Cover</th>
                          <th className="px-4 py-4">Title</th>
                          <th className="px-4 py-4">Category</th>
                          <th className="px-4 py-4">Department</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-4 py-4">Copies</th>
                          <th className="px-4 py-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBooks.map((book) => {
                          const status = getBookStatus(book);
                          const selected = selectedBookIds.includes(book.id);
                          return (
                            <tr key={book.id} className="border-t border-white/10 bg-white/[0.01] hover:bg-white/[0.05]">
                              <td className="px-4 py-4">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleBookSelection(book.id)}
                                  className="h-4 w-4 rounded border-white/10 bg-transparent"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <img
                                  src={getBookCover(book)}
                                  alt={`${book.title} cover`}
                                  className="h-16 w-12 rounded-xl object-cover shadow-lg"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <button onClick={() => setSelectedBook(book)} className="text-left">
                                  <p className="font-semibold text-white hover:text-library-gold">{book.title}</p>
                                  <p className="mt-1 text-xs text-gray-500">{book.author}</p>
                                  <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-gray-600">{book.code}</p>
                                </button>
                              </td>
                              <td className="px-4 py-4">
                                <span className="rounded-full border border-library-gold/20 bg-library-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-library-gold">
                                  {book.category}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-400">{book.department}</td>
                              <td className="px-4 py-4">
                                <div className="flex flex-col gap-2">
                                  <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] ${status.badge}`}>
                                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                                    {status.label}
                                  </span>
                                  <span className="text-xs text-gray-500">{book.section}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm font-semibold text-white">{book.copies}</td>
                              <td className="px-4 py-4">
                                <button
                                  onClick={() => setSelectedBook(book)}
                                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-300 transition-all hover:border-library-gold/20 hover:text-library-gold"
                                >
                                  Issue
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.02] px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {Math.min((page - 1) * pageSize + 1, sortedBooks.length)}-{Math.min(page * pageSize, sortedBooks.length)} of {sortedBooks.length} books
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">
                      Page {page} / {totalPages}
                    </div>
                    <button
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {filteredBooks.length === 0 && (
                  <div className="mt-8 h-64 flex flex-col items-center justify-center opacity-30">
                    <BookIcon size={48} className="mb-4" />
                    <p className="text-sm uppercase tracking-widest font-black">No manuscripts found</p>
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'stats' ? (
              <motion.div
                key="stats-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AdminStatsDashboard records={records} onNavigate={(tab, filter) => {
                  setRegistryFilter(filter);
                  setActiveTab(tab);
                }} />
              </motion.div>
            ) : activeTab === 'ai_assistant' ? (
              <motion.div
                key="ai-assistant-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <LibraryAI books={ALL_BOOKS} />
              </motion.div>
            ) : activeTab === 'terminal' ? (
              <motion.div 
                key="terminal-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-10 rounded-[40px] min-h-[600px] flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                <div className="scanline"></div>
                <div className="max-w-lg space-y-8 relative z-10">
                   <div className="w-20 h-20 bg-library-gold/10 rounded-[28px] border border-library-gold/20 flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck size={40} className="text-library-gold animate-pulse" />
                   </div>
                   <h2 className="text-4xl font-serif italic text-white font-bold">Issue Terminal</h2>
                   <p className="text-gray-400 text-sm leading-relaxed">
                     Enter the unique <strong className="text-library-gold">Book ID</strong> found in the Library Catalog to begin the issuance protocol. 
                     The system will verify your PRN and book availability instantly.
                   </p>
                   
                   <form onSubmit={handleDirectIssue} className="relative mt-10 w-full">
                     <input 
                       type="text" 
                       placeholder="Enter BK-100000 ID..." 
                       className="glass-input w-full !text-lg !py-6 !rounded-[32px] text-center mb-4"
                       value={directCode}
                       onChange={(e) => setDirectCode(e.target.value)}
                     />
                     <button type="submit" className="metallic-btn w-full">
                        Initialize Issue Protocol
                     </button>
                   </form>
                   <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-10">Authorized PRN Logged: {user.prn}</p>

                   {/* Policy Section */}
                   <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 text-left space-y-6">
                      <div className="flex items-center gap-3 text-library-gold">
                        <ShieldCheck size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Library Policy & Protocol</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center text-library-gold font-bold">01</div>
                            <p className="text-gray-400 leading-relaxed"><strong className="text-white">Initial Credit:</strong> Every student starts with a wallet balance of <span className="text-library-gold">₹100</span> provided by the college.</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center text-library-gold font-bold">02</div>
                            <p className="text-gray-400 leading-relaxed"><strong className="text-white">Late Return:</strong> A fine of <span className="text-red-400">₹5 per day</span> will be automatically deducted from your wallet after the due date.</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center text-library-gold font-bold">03</div>
                            <p className="text-gray-400 leading-relaxed"><strong className="text-white">Minimum Balance:</strong> Your wallet must maintain a <span className="text-amber-400">minimum balance of ₹40</span> to issue new manuscripts.</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center text-library-gold font-bold">04</div>
                            <p className="text-gray-400 leading-relaxed"><strong className="text-white">Return Flow:</strong> Returning a book sends a request to the admin. The process is finalized only after <span className="text-green-400">admin approval</span>.</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                         <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Digital Agreement v2.5</p>
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-[9px] text-green-500 font-bold uppercase">I Accept Policies</span>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            ) : activeTab === 'return_center' ? (
              <motion.div
                key="return-center-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-10 rounded-[40px] min-h-[600px] relative overflow-hidden"
              >
                <div className="scanline"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <h2 className="font-serif italic text-4xl text-white font-bold">Return Center</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                        Select an active manuscript to initiate return protocol
                      </p>
                    </div>
                    <LogOut size={40} className="text-library-gold opacity-40 rotate-180" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {records.filter(r => r.studentPrn === user.prn && r.status === 'accepted').length === 0 ? (
                      <div className="col-span-full py-20 text-center opacity-30">
                        <Layers size={48} className="mx-auto mb-4" />
                        <p className="text-sm uppercase tracking-widest font-black">No active manuscripts to return</p>
                      </div>
                    ) : (
                      records.filter(r => r.studentPrn === user.prn && r.status === 'accepted').map((record) => {
                        const book = ALL_BOOKS.find(b => b.id === record.bookId);
                        if (!book) return null;
                        return (
                          <motion.div
                            key={record.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-library-gold/30 transition-all cursor-pointer group"
                            onClick={() => {
                              setSelectedBook(book);
                              // We can reuse the detailed modal but we need to know we are in "Return" mode
                            }}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[9px] font-black bg-library-gold text-black px-2 py-0.5 rounded uppercase">{book.id}</span>
                              <span className="text-[9px] text-gray-500 font-mono">Due: {formatDisplayDate(record.dueDate)}</span>
                            </div>
                            <h3 className="text-white font-bold group-hover:text-library-gold transition-colors truncate">{book.title}</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Held since {formatDisplayDate(record.issueDate)}</p>
                            
                            <div className="mt-6 flex justify-end">
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   onReturn(record.id);
                                 }}
                                 className="px-6 py-2 bg-library-gold text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-library-gold/20"
                               >
                                 Request Return
                               </button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'students' ? (
              <motion.div
                key="students-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <StudentManagementModule records={records} />
              </motion.div>
            ) : activeTab === 'registry' ? (
              <motion.div 
                key="registry-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel rounded-[40px] overflow-hidden min-h-[600px] flex flex-col"
              >
                <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <div>
                    <h2 className="font-serif italic text-3xl text-white font-bold">
                      {user.role === 'admin' ? 'Master Registry' : 'My Bookshelf'}
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                      Tracking active library transactions • Vol. 2.5
                    </p>
                  </div>
                  <div className="bg-library-gold/5 px-4 py-2 rounded-xl flex items-center gap-3 border border-library-gold/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[11px] font-black text-library-gold tracking-tight">PYTHON BRIDGE: ACTIVE</span>
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-black border-b border-white/5">
                        <th className="px-8 py-6">Identity / Resource</th>
                        {user.role === 'admin' && <th className="px-8 py-6">Student</th>}
                        <th className="px-8 py-6">Valid Range</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6 text-right">Process</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/2">
                      {displayRecords.map((record) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={record.id} 
                          className={`group transition-all ${user.role === 'admin' ? 'hover:bg-library-gold/5 cursor-pointer border-l-4 border-l-transparent hover:border-l-library-gold' : 'hover:bg-white/5'}`}
                          onClick={() => user.role === 'admin' && setSelectedRecord(record)}
                        >
                          <td className="px-8 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 text-library-gold group-hover:scale-110 transition-transform">
                                <BookIcon size={20} />
                              </div>
                              <div>
                                <p className="font-mono text-[10px] text-library-gold font-bold mb-0.5 uppercase">{record.bookId}</p>
                                <p className="text-base font-black text-white tracking-tight truncate max-w-[200px]">{record.bookTitle}</p>
                              </div>
                            </div>
                          </td>
                          {user.role === 'admin' && (
                            <td className="px-8 py-8">
                              <p className="text-sm font-black text-white">{record.studentName}</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{record.studentPrn}</p>
                            </td>
                          )}
                          <td className="px-8 py-8">
                            <div className="flex flex-col gap-1 items-start">
                              <div className="flex items-center gap-2 text-xs font-black text-gray-300">
                                 <Clock size={12} className="text-gray-500" />
                                 {formatDisplayDate(record.issueDate)}
                              </div>
                              <div className="group/due flex items-center gap-2 px-2 py-0.5 bg-red-400/5 rounded-md border border-red-500/10">
                                <span className="text-[10px] text-red-400 font-black uppercase">Due: {formatDisplayDate(record.dueDate)}</span>
                                <span className="hidden group-hover/due:block text-[8px] text-red-500 font-bold ml-1">Fine: Rs 5/day</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest border-2 ${
                              record.status === 'pending' ? 'bg-orange-400/5 text-orange-400 border-orange-400/10' :
                              record.status === 'accepted' ? 'bg-green-400/5 text-green-400 border-green-400/10' :
                              record.status === 'rejected' ? 'bg-red-400/5 text-red-500 border-red-500/10' :
                              record.status === 'return_pending' ? 'bg-blue-400/5 text-blue-400 border-blue-400/10' :
                              'bg-white/5 text-gray-400 border-white/5'
                            }`}>
                              {record.status === 'return_pending' ? 'RET_PENDING' : record.status}
                            </span>
                            {record.status === 'returned' && record.fineAmount! > 0 && (
                              <p className="text-[8px] text-red-500 font-black mt-1">FINE: ₹{record.fineAmount}</p>
                            )}
                          </td>
                          <td className="px-8 py-8 text-right">
                            {user.role === 'admin' ? (
                              <div className="flex justify-end gap-2">
                                 {record.status === 'pending' && (
                                   <>
                                    <button onClick={() => onAccept(record.id)} className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-90" title="Accept">
                                      <ShieldCheck size={18} />
                                    </button>
                                    <button onClick={() => onReject(record.id)} className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-90" title="Reject">
                                      <XCircle size={18} />
                                    </button>
                                   </>
                                 )}
                                 {record.status === 'return_pending' && (
                                    <button onClick={() => onApproveReturn(record.id)} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-90" title="Approve Return">
                                       <CheckCircle2 size={18} />
                                    </button>
                                 )}
                                 {record.status === 'accepted' && (
                                  <button onClick={() => onReturn(record.id)} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all shadow-lg active:scale-90" title="System Return">
                                    <LogOut size={18} className="rotate-180" />
                                  </button>
                                 )}
                                 <button onClick={() => generateReceipt(record)} className="p-3 bg-library-gold/10 hover:bg-library-gold hover:text-black text-library-gold rounded-xl transition-all active:scale-90" title="Download PDF Receipt">
                                    <Download size={18} />
                                 </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                {record.status === 'accepted' && (
                                  <button onClick={() => onReturn(record.id)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500 hover:text-white text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5">
                                    <LogOut size={14} className="rotate-180" /> Return Book
                                  </button>
                                )}
                                <button onClick={() => generateReceipt(record)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-library-gold hover:text-black text-library-gold text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5">
                                  <Download size={14} /> Receipt
                                </button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                      {(user.role === 'admin' ? records : studentRecords).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-32 text-center text-gray-700">
                            <FileText className="mx-auto mb-6 opacity-5" size={80} />
                            <p className="text-xl font-serif italic text-gray-700">No active library records found in this vault...</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel rounded-[40px] overflow-hidden min-h-[600px] flex flex-col"
              >
                <div className="px-10 py-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <div>
                    <h2 className="font-serif italic text-3xl text-white font-bold">Encrypted Channel</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                      Direct {user.role === 'admin' ? 'Student' : 'Admin'} Uplink • Python_Secure v1.0
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {user.role === 'admin' && (
                    <div className="w-64 border-r border-white/5 overflow-y-auto bg-black/20 p-4 space-y-2">
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest p-2">Active PRNs</p>
                       {studentsWithMessages.map(prn => (
                         <button
                           key={prn}
                           onClick={() => setAdminChatPRN(prn)}
                           className={`w-full text-left p-4 rounded-2xl transition-all border ${
                             adminChatPRN === prn ? 'bg-library-gold text-black border-library-gold' : 'bg-white/5 text-white border-transparent hover:border-white/10'
                           }`}
                         >
                           <p className="text-xs font-black">Student {prn}</p>
                           <p className="text-[8px] opacity-60 uppercase tracking-wider">PRN: {prn}</p>
                         </button>
                       ))}
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 p-8 overflow-y-auto space-y-6">
                      {(user.role === 'admin' ? displayedMessagesForAdmin : filteredMessages).map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[70%] p-5 rounded-[28px] border ${
                            msg.isAdmin 
                              ? 'bg-library-gold/10 border-library-gold/20 text-library-gold rounded-tr-none' 
                              : 'bg-white/5 border-white/10 text-white rounded-tl-none'
                          }`}>
                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                            <p className="text-[8px] mt-2 opacity-40 uppercase font-black">
                              {new Date(msg.timestamp).toLocaleTimeString()} • {msg.senderName}
                            </p>
                          </div>
                        </div>
                      ))}
                      {user.role === 'admin' && !adminChatPRN && (
                        <div className="h-full flex flex-center items-center justify-center opacity-20 flex-col gap-4">
                           <MessageSquare size={48} />
                           <p className="text-xs uppercase tracking-[0.4em] font-black">Select a secure channel</p>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleChatSubmit} className="p-6 bg-black/40 border-t border-white/5">
                      <div className="relative group">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={user.role === 'admin' ? `Reply to ${adminChatPRN ? '@'+adminChatPRN : 'student'}...` : "Message administrator..."}
                          disabled={user.role === 'admin' && !adminChatPRN}
                          className="glass-input w-full pr-16 py-5 rounded-2xl border-white/10 focus:border-library-gold/40 transition-all text-sm disabled:opacity-30"
                        />
                        <button 
                          type="submit"
                          disabled={!chatInput.trim() || (user.role === 'admin' && !adminChatPRN)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-library-gold text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-0"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Record Detail Modal (Admin Approval) */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 rounded-[40px] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="scanline"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-[10px] font-black text-library-gold uppercase tracking-[0.3em] mb-2">Request Identification: {selectedRecord.id}</p>
                    <h3 className="text-3xl font-serif italic text-white font-bold">Protocol Review</h3>
                  </div>
                  <button onClick={() => setSelectedRecord(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-gray-400">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Target Resource</p>
                      <p className="text-lg font-bold text-white leading-tight">{selectedRecord.bookTitle}</p>
                      <p className="text-[11px] text-library-gold font-mono tracking-wider mt-1">{selectedRecord.bookCode}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Requesting Agent</p>
                      <p className="text-lg font-bold text-white">{selectedRecord.studentName}</p>
                      <p className="text-[11px] text-gray-400 font-bold uppercase mt-1 tracking-widest">PRN: {selectedRecord.studentPrn}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Status Phase</p>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        selectedRecord.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        selectedRecord.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        selectedRecord.status === 'return_pending' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {selectedRecord.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Temporal Data</p>
                      <div className="space-y-1">
                        <p className="text-xs text-white flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-gray-500" /> Issued: {formatDisplayDate(selectedRecord.issueDate)}
                        </p>
                        <p className="text-xs text-red-400 flex items-center gap-2">
                          <Clock size={12} className="text-red-500 opacity-50" /> Deadline: {formatDisplayDate(selectedRecord.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 mb-10">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-library-gold" /> System Validation
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 text-[10px] text-green-400 font-bold">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> AUTHENTIC PRN
                     </div>
                     <div className="flex items-center gap-3 text-[10px] text-green-400 font-bold">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> RESOURCE READY
                     </div>
                     {selectedRecord.status === 'return_pending' && (
                       <div className="flex items-center gap-3 text-[10px] text-blue-400 font-bold col-span-2">
                         <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> RETURN FLOW INITIATED BY USER
                       </div>
                     )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setSelectedRecord(null)} className="secondary-btn flex-1 py-5">
                    Close Protocol
                  </button>
                  
                  {selectedRecord.status === 'pending' && (
                    <>
                      <button onClick={() => { onReject(selectedRecord.id); setSelectedRecord(null); }} className="px-8 py-5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-500/20 active:scale-95">
                        Reject
                      </button>
                      <button onClick={() => { onAccept(selectedRecord.id); setSelectedRecord(null); }} className="metallic-btn flex-1 py-5">
                        Authorize Issue
                      </button>
                    </>
                  )}

                  {selectedRecord.status === 'return_pending' && (
                    <button onClick={() => { onApproveReturn(selectedRecord.id); setSelectedRecord(null); }} className="metallic-btn flex-1 py-5">
                      Authorize Return
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !success && setSelectedBook(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="glass-panel w-full max-w-lg p-10 rounded-[48px] relative z-10 border border-white/20"
            >
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-library-gold/10 rounded-[32px] mx-auto flex items-center justify-center mb-6">
                  <BookIcon className="text-library-gold" size={48} />
                </div>
                <h3 className="text-3xl font-serif italic mb-3 text-white">Manual Issue Request</h3>
                <p className="text-gray-400 font-medium tracking-tight">Authenticating manuscript ownership</p>
              </div>

              {success ? (
                <div className="py-8 text-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border-4 border-green-500/20">
                      <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white uppercase tracking-tight">Request Logged</p>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">Relayed to Admin Presence</p>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-8">
                  {user.role === 'student' && user.walletBalance! < 40 && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4">
                      <XCircle className="text-red-500 flex-shrink-0" size={24} />
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest leading-relaxed">
                        Security Alert: Your wallet balance (₹{user.walletBalance}) is below the required threshold (₹40). Protocol blocked.
                      </p>
                    </div>
                  )}

                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-library-gold uppercase tracking-[0.2em] mb-1">{selectedBook.id} / {selectedBook.code}</p>
                        <h4 className="text-xl font-bold text-white tracking-tight">{selectedBook.title}</h4>
                      </div>
                      <span className="px-3 py-1 bg-library-gold/20 text-library-gold text-[9px] font-black rounded-lg uppercase">{selectedBook.department}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[9px] text-gray-500 font-black uppercase">Shelf Location</p>
                        <p className="text-sm text-white font-bold">{selectedBook.section}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 font-black uppercase">Category</p>
                        <p className="text-sm text-white font-bold">{selectedBook.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setSelectedBook(null)} className="secondary-btn flex-1 py-5">
                      {activeTab === 'terminal' ? 'Abort' : 'Close Details'}
                    </button>
                    {activeTab === 'terminal' ? (
                      <button onClick={handleIssueRequest} className="metallic-btn flex-1 py-5">
                        Confirm Issue
                      </button>
                    ) : (
                      user.role !== 'admin' && (
                        <button 
                          onClick={() => {
                            setActiveTab('terminal');
                            setDirectCode(selectedBook.id);
                            setSelectedBook(null);
                          }} 
                          className="metallic-btn flex-1 py-5"
                        >
                          Request this Item
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
