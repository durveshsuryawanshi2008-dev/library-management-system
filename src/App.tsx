import { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react';
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
  Menu,
  Eye,
  EyeOff,
  Upload
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
  const [billingCycle, setBillingCycle] = useState<'biennial' | 'annual'>('biennial');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
    { name: 'Starter', students: '200 Students', duration: billingCycle === 'annual' ? 'Billed Annually' : '2 Years Access', price: billingCycle === 'annual' ? '₹800/yr' : '₹2,000', features: ['AI Disabled', 'Basic catalog tools', 'Email support'], popular: false },
    { name: 'Standard', students: '500 Students', duration: billingCycle === 'annual' ? 'Billed Annually' : '2 Years Access', price: billingCycle === 'annual' ? '₹2,000/yr' : '₹5,000', features: ['AI Enabled', 'Analytics dashboard', 'Priority onboarding'], popular: true },
    { name: 'Professional', students: '1000 Students', duration: billingCycle === 'annual' ? 'Billed Annually' : '2 Years Access', price: billingCycle === 'annual' ? '₹4,000/yr' : '₹10,000', features: ['AI Enabled', 'Advanced analytics', 'Priority support'], popular: false },
    { name: 'Enterprise', students: 'Unlimited Students', duration: 'Custom Billing', price: 'Custom Pricing', features: ['Dedicated onboarding', 'Custom integrations', 'SLA support'], popular: false },
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
      <div className="space-y-16">
        <MarketingShellHero
          eyebrow="Multi-tenant SaaS for modern campuses"
          title="Turn your college library into a premium, AI-ready digital platform."
          description="CampusLibrary AI gives every college a private library workspace with secure operations, intelligent workflows, and a polished experience for admins, faculty, and students."
          primaryAction={<button type="button" onClick={onOpenRegister} className="metallic-btn w-full sm:w-auto">Register College</button>}
          secondaryAction={<button type="button" onClick={onOpenDemo} className="secondary-btn w-full sm:w-auto">Request Demo</button>}
        />

        <section id="features" className="space-y-6 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Core Features</p>
            <h3 className="text-3xl font-black text-white">Powerful tools designed for secure academic operations</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
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
          </div>
        </section>

        <section id="about" className="grid gap-8 lg:grid-cols-[1fr_1fr] items-center scroll-mt-20">
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

          <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_15px_50px_rgba(2,6,23,0.18)] space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Platform Isolation</p>
            <h3 className="text-3xl font-black text-white">Academic data privacy, enforced cryptographically</h3>
            <p className="text-slate-300 text-base leading-relaxed">
              Every college registered on CampusLibrary AI receives an isolated data tenant. Access permissions are verified at every layer, ensuring students and administrators can only interact with records belonging to their own institutions.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-sky-300"></span>
                Strict multi-tenant token assertions
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-sky-300"></span>
                Role-based admin, librarian, and student flows
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-sky-300"></span>
                Isolated AI agent boundaries per college
              </li>
            </ul>
            <div className="pt-4">
              <button type="button" onClick={onOpenRegister} className="secondary-btn w-full sm:w-auto">Read SaaS Whitepaper</button>
            </div>
          </div>
        </section>

        <section id="pricing" className="space-y-8 scroll-mt-20">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Pricing Options</p>
              <h3 className="text-3xl font-black text-white">Flexible plans that grow with each institution</h3>
            </div>
            
            {/* Billing Cycle Toggle */}
            <div className="flex items-center gap-3 bg-white/5 rounded-full p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setBillingCycle('biennial')}
                className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  billingCycle === 'biennial'
                    ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Biennial (2 Years)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Annual
                <span className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`rounded-[28px] border p-5 flex flex-col justify-between ${plan.popular ? 'border-sky-400/30 bg-sky-400/10 shadow-[0_0_30px_rgba(56,189,248,0.05)]' : 'border-white/10 bg-white/5'}`}>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-lg font-black text-white">{plan.name}</h4>
                    {plan.popular && <span className="rounded-full bg-sky-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-sky-300">Popular</span>}
                  </div>
                  <p className="mt-2 text-sm text-slate-300 font-semibold">{plan.students}</p>
                  <p className="mt-1 text-xs text-slate-400">{plan.duration}</p>
                  <p className="mt-4 text-3xl font-black text-white">{plan.price}</p>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-slate-300 border-t border-white/5 pt-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <BadgeCheck size={14} className="text-sky-300 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="testimonials" className="rounded-[40px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_15px_50px_rgba(2,6,23,0.18)] scroll-mt-20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Testimonials</p>
              <h3 className="mt-3 text-3xl font-black text-white">Trusted by campus leaders who want a more mature library experience</h3>
            </div>
            <button type="button" onClick={onOpenRegister} className="metallic-btn w-full sm:w-auto">Get Started</button>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
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

        <section id="contact" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] scroll-mt-20">
          <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">FAQs</p>
            <h3 className="mt-4 text-3xl font-black text-white mb-6">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={faq.question} className="rounded-[24px] border border-white/10 bg-white/5 p-4 transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between text-left font-semibold text-white cursor-pointer group"
                  >
                    <span>{faq.question}</span>
                    <span className="text-sky-300 transition-transform duration-300 shrink-0 ml-3">
                      {openFaqIndex === index ? <X size={16} /> : <ChevronRight size={16} className="group-hover:translate-x-1" />}
                    </span>
                  </button>
                  {openFaqIndex === index && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-300 border-t border-white/5 pt-3 animate-fade-in">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-8 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Contact</p>
              <h3 className="mt-4 text-3xl font-black text-white">Ready to modernize your campus library experience?</h3>
              <p className="mt-4 text-slate-300">Speak with our team to discuss onboarding, custom pricing plans, API tunneling, or book a live product demonstration.</p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row pt-6 border-t border-white/5">
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

function SuperAdminDashboard({
  onApprove,
  onSuspend
}: {
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
}) {
  const [colleges, setColleges] = useState([
    { id: '1', name: 'Green Valley College', code: 'GVC4501', status: 'approved', plan: 'Standard', capacity: 500, aiEnabled: true, date: '2026-06-15' },
    { id: '2', name: 'Omkar Institute', code: 'OMI1284', status: 'pending', plan: 'Starter', capacity: 200, aiEnabled: false, date: '2026-07-02' },
    { id: '3', name: 'Nirma University', code: 'NIR8842', status: 'approved', plan: 'Professional', capacity: 1000, aiEnabled: true, date: '2026-05-10' },
    { id: '4', name: 'IIT Bombay Tech', code: 'IITB9941', status: 'suspended', plan: 'Enterprise', capacity: 10000, aiEnabled: true, date: '2026-04-01' }
  ]);

  const stats = useMemo(() => {
    return {
      totalColleges: colleges.length,
      pendingApprovals: colleges.filter(c => c.status === 'pending').length,
      activePlans: colleges.filter(c => c.status === 'approved').length,
      monthlyRevenue: colleges.reduce((sum, c) => {
        if (c.status !== 'approved') return sum;
        const rate = c.plan === 'Starter' ? 1000 : c.plan === 'Standard' ? 2500 : c.plan === 'Professional' ? 5000 : 15000;
        return sum + rate;
      }, 0)
    };
  }, [colleges]);

  const planData = useMemo(() => {
    return [
      { name: 'Starter', value: colleges.filter(c => c.plan === 'Starter').length },
      { name: 'Standard', value: colleges.filter(c => c.plan === 'Standard').length },
      { name: 'Professional', value: colleges.filter(c => c.plan === 'Professional').length },
      { name: 'Enterprise', value: colleges.filter(c => c.plan === 'Enterprise').length },
    ];
  }, [colleges]);

  const COLORS = ['#38bdf8', '#fbbf24', '#34d399', '#a78bfa'];

  const handleApprove = (id: string) => {
    setColleges(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
    onApprove(id);
  };

  const handleSuspend = (id: string) => {
    setColleges(prev => prev.map(c => c.id === id ? { ...c, status: 'suspended' } : c));
    onSuspend(id);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Hero */}
      <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950 p-8 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-library-gold">Platform Super-Admin Workspace</p>
        <h2 className="text-3xl font-serif italic text-white font-bold mt-2">CampusLibrary AI Global Directory</h2>
        <p className="text-sm text-gray-400 mt-2">Manage multi-tenant colleges, subscription plan allocations, and platform approvals.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tenant Colleges', value: stats.totalColleges, color: 'text-sky-400', icon: Library },
          { label: 'Pending Registrations', value: stats.pendingApprovals, color: 'text-amber-500', icon: Clock },
          { label: 'Active Subscriptions', value: stats.activePlans, color: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Est. Monthly Revenue', value: `₹${stats.monthlyRevenue.toLocaleString()}`, color: 'text-purple-400', icon: Sparkles }
        ].map((card, idx) => (
          <div key={idx} className="glass-panel rounded-[32px] border-white/5 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${card.color}`}>
                <card.icon size={22} />
              </div>
              <span className="text-[8px] font-black tracking-widest bg-white/5 text-gray-400 px-2 py-1 rounded-full">Global</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{card.label}</p>
            <p className="text-2xl font-serif italic font-bold text-white mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Row with List & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
        {/* Colleges directory */}
        <div className="glass-panel rounded-[40px] border-white/5 p-8 overflow-x-auto">
          <h3 className="text-xl font-bold text-white mb-6">Tenant Registrations</h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-2">College Name</th>
                <th className="py-4">Plan</th>
                <th className="py-4">Capacity</th>
                <th className="py-4">Status</th>
                <th className="py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map(c => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-2">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{c.code}</p>
                  </td>
                  <td className="py-4 text-slate-300 font-semibold">{c.plan}</td>
                  <td className="py-4 text-slate-400">{c.capacity} Students</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      c.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400' :
                      c.status === 'pending' ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2 justify-center">
                      {c.status === 'pending' && (
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {c.status === 'approved' && (
                        <button
                          onClick={() => handleSuspend(c.id)}
                          className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20 cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
                      {c.status === 'suspended' && (
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/20 cursor-pointer"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subscription Plan Distribution Chart */}
        <div className="glass-panel rounded-[40px] border-white/5 p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Subscription Share</h3>
            <p className="text-xs text-gray-500 mb-6">Volume of onboarded tenants per pricing tier.</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a101f', borderRadius: '12px', border: '1px solid #ffffff10' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-4">
            {planData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CollegeAdminDashboard({
  user
}: {
  user: User;
}) {
  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'billing'>('staff');
  
  // Dynamic subscription states
  const [currentPlan, setCurrentPlan] = useState<'Starter' | 'Standard' | 'Professional'>('Standard');
  const [billingLimit, setBillingLimit] = useState(500);

  const [librarians, setLibrarians] = useState([
    { id: '1', name: 'Dr. Vivek Joshi', email: 'vivek@college.edu', role: 'Chief Librarian', date: '2026-02-10' },
    { id: '2', name: 'Aparna Sen', email: 'aparna@college.edu', role: 'Catalog Officer', date: '2026-05-18' }
  ]);
  
  const [showAddLibrarian, setShowAddLibrarian] = useState(false);
  const [newLib, setNewLib] = useState({ name: '', email: '', role: 'Librarian' });

  // Invoice Log state
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const invoices = [
    { id: 'INV-2026-081', date: '2026-06-15', plan: 'Standard Plan', cycle: 'Biennial Access', amount: '₹5,000', tax: '₹900', total: '₹5,900', status: 'Paid' },
    { id: 'INV-2024-114', date: '2024-06-15', plan: 'Starter Plan', cycle: 'Biennial Access', amount: '₹2,000', tax: '₹360', total: '₹2,360', status: 'Paid' }
  ];

  const stats = {
    studentsLimit: billingLimit,
    studentsCount: 342,
    booksCount: 1840,
    activeIssues: 56,
    planName: `${currentPlan} Plan`,
  };

  const activityData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 18 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 24 },
    { name: 'Fri', count: 32 },
    { name: 'Sat', count: 8 },
  ];

  const handleAddLibrarian = (e: FormEvent) => {
    e.preventDefault();
    if (!newLib.name || !newLib.email) return;
    setLibrarians(prev => [...prev, { ...newLib, id: Date.now().toString(), date: new Date().toISOString().slice(0, 10) }]);
    setNewLib({ name: '', email: '', role: 'Librarian' });
    setShowAddLibrarian(false);
  };

  const handlePlanChange = (plan: 'Starter' | 'Standard' | 'Professional', limit: number) => {
    setCurrentPlan(plan);
    setBillingLimit(limit);
    alert(`Successfully processed subscription modification! Your college database quota has been updated to the ${plan} Plan (${limit} students max capacity).`);
  };

  const handleContactSales = () => {
    alert("Your Enterprise request has been dispatched to CampusLibrary Sales. A representative will contact you at your registered administrator email shortly.");
  };

  return (
    <div className="space-y-8 text-left">
      {/* Hero */}
      <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950 p-8 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-sky-300">College Administration Hub</p>
        <h2 className="text-3xl font-serif italic text-white font-bold mt-2">Manage library staffing and quota limits</h2>
        <p className="text-sm text-gray-400 mt-2">Monitor student enrollment count, catalog quotas, and configure access roles.</p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 max-w-md">
        <button
          onClick={() => setActiveSubTab('staff')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center ${
            activeSubTab === 'staff' ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-300 hover:text-white'
          }`}
        >
          Staff & Traffic
        </button>
        <button
          onClick={() => setActiveSubTab('billing')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center ${
            activeSubTab === 'billing' ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-300 hover:text-white'
          }`}
        >
          Subscriptions & Invoices
        </button>
      </div>

      {/* RENDER STAFF TAB */}
      {activeSubTab === 'staff' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Student Limit Usage', value: `${stats.studentsCount} / ${stats.studentsLimit}`, color: 'text-amber-400', icon: Users },
              { label: 'Books Scoped', value: stats.booksCount, color: 'text-sky-400', icon: Library },
              { label: 'Active Borrow Records', value: stats.activeIssues, color: 'text-purple-400', icon: Layers },
              { label: 'Subscription Plan', value: stats.planName, color: 'text-emerald-400', icon: BadgeCheck }
            ].map((card, idx) => (
              <div key={idx} className="glass-panel rounded-[32px] border-white/5 p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${card.color}`}>
                    <card.icon size={22} />
                  </div>
                  <span className="text-[8px] font-black tracking-widest bg-white/5 text-gray-400 px-2 py-1 rounded-full">Quota</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{card.label}</p>
                <p className="text-2xl font-serif italic font-bold text-white mt-2">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
            {/* Librarian Roster */}
            <div className="glass-panel rounded-[40px] border-white/5 p-8 overflow-x-auto space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Librarian Staff Roster</h3>
                <button
                  onClick={() => setShowAddLibrarian(!showAddLibrarian)}
                  className="metallic-btn px-4 py-2 text-xs font-black cursor-pointer"
                >
                  Add Librarian
                </button>
              </div>

              {showAddLibrarian && (
                <form onSubmit={handleAddLibrarian} className="grid gap-4 md:grid-cols-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newLib.name}
                    onChange={e => setNewLib({ ...newLib, name: e.target.value })}
                    className="glass-input text-sm p-3 rounded-xl"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Staff Email"
                    value={newLib.email}
                    onChange={e => setNewLib({ ...newLib, email: e.target.value })}
                    className="glass-input text-sm p-3 rounded-xl"
                    required
                  />
                  <button type="submit" className="metallic-btn text-xs py-3 rounded-xl cursor-pointer">
                    Confirm Add
                  </button>
                </form>
              )}

              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-4 px-2">Staff Member</th>
                    <th className="py-4">Role</th>
                    <th className="py-4">Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {librarians.map(l => (
                    <tr key={l.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2">
                        <p className="font-semibold text-white">{l.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{l.email}</p>
                      </td>
                      <td className="py-4 text-slate-300 font-semibold">{l.role}</td>
                      <td className="py-4 text-slate-400">{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Activity Chart */}
            <div className="glass-panel rounded-[40px] border-white/5 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Check-out Activity</h3>
                <p className="text-xs text-gray-500 mb-6">Daily circulation traffic this week.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7c8aa2', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7c8aa2', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a101f', borderRadius: '12px', border: '1px solid #ffffff10' }}
                    />
                    <Bar dataKey="count" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* RENDER BILLING TAB */}
      {activeSubTab === 'billing' && (
        <div className="space-y-8">
          
          {/* Plan Limits Gauge */}
          <div className="glass-panel rounded-[40px] border-white/5 p-8 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Plan Quota Consumption</h3>
                <p className="text-xs text-slate-400 mt-1">Calculated against current subscription boundaries</p>
              </div>
              <span className="px-3 py-1 bg-sky-400/20 text-sky-300 border border-sky-400/30 rounded-full text-xs font-black uppercase tracking-wider">
                {currentPlan} Plan
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-white/5 rounded-full h-3 border border-white/10 overflow-hidden">
                <div 
                  className="bg-sky-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(56,189,248,0.5)]" 
                  style={{ width: `${(stats.studentsCount / stats.studentsLimit) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{stats.studentsCount} scholar slots active</span>
                <span>{stats.studentsLimit} slots limit</span>
              </div>
            </div>
          </div>

          {/* Pricing Upgrade/Downgrade Cards Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Starter', limit: 200, price: '₹2,000 / biennial', details: 'Basic catalog access. Limit 200 students.' },
              { name: 'Standard', limit: 500, price: '₹5,000 / biennial', details: 'Gemini AI enabled. Limit 500 students.' },
              { name: 'Professional', limit: 1000, price: '₹10,000 / biennial', details: 'AI enabled + advanced analytics. Limit 1000 students.' },
            ].map(plan => (
              <div 
                key={plan.name} 
                className={`rounded-[32px] border p-6 flex flex-col justify-between transition-all ${
                  currentPlan === plan.name 
                    ? 'border-sky-400 bg-sky-400/5 shadow-[0_0_20px_rgba(56,189,248,0.1)]' 
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-bold text-white">{plan.name} Tier</h4>
                    {currentPlan === plan.name && <span className="bg-sky-400 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">Active</span>}
                  </div>
                  <p className="text-xl font-black text-library-gold font-serif italic">{plan.price}</p>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">{plan.details}</p>
                </div>
                
                <div className="mt-6">
                  {currentPlan === plan.name ? (
                    <button disabled className="w-full secondary-btn py-3 text-xs opacity-50 cursor-not-allowed">Active Package</button>
                  ) : (
                    <button 
                      onClick={() => handlePlanChange(plan.name as any, plan.limit)} 
                      className="w-full metallic-btn py-3 text-xs cursor-pointer"
                    >
                      {plan.limit > billingLimit ? 'Upgrade Package' : 'Downgrade Package'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise CTA & Sales Pitch */}
          <div className="glass-panel rounded-[40px] border-white/5 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-xl font-bold text-white">Need higher student capacity?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock custom limits, dedicated SLAs, API tunneling support, and priority onboarding assistance with our custom Enterprise package.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto shrink-0">
              <button onClick={handleContactSales} className="metallic-btn px-6 py-3 text-xs font-black cursor-pointer flex-1 md:flex-initial">Contact Sales</button>
              <button onClick={handleContactSales} className="secondary-btn px-6 py-3 text-xs font-bold cursor-pointer flex-1 md:flex-initial">Request custom demo</button>
            </div>
          </div>

          {/* Invoice Logs */}
          <div className="glass-panel rounded-[40px] border-white/5 p-8 space-y-6 overflow-x-auto">
            <h3 className="text-lg font-bold text-white">College Billing History</h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-2">Invoice ID</th>
                  <th className="py-4">Billing Date</th>
                  <th className="py-4">Package details</th>
                  <th className="py-4 text-right">Amount</th>
                  <th className="py-4 text-center">Status</th>
                  <th className="py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-2 font-mono text-xs font-bold text-slate-300">{inv.id}</td>
                    <td className="py-4 text-slate-400">{inv.date}</td>
                    <td className="py-4">
                      <p className="font-semibold text-white">{inv.plan}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase">{inv.cycle}</p>
                    </td>
                    <td className="py-4 text-right font-semibold text-white">{inv.total}</td>
                    <td className="py-4 text-center">
                      <span className="bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1 text-[10px] font-black uppercase text-sky-400 border border-sky-400/10 bg-sky-400/5 hover:bg-sky-400/20 rounded-lg cursor-pointer transition-all"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal Overlay */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="glass-panel w-full max-w-lg p-8 rounded-[48px] relative z-10 border border-white/20 text-left text-sm text-slate-300 space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">CampusLibrary AI</h3>
                  <p className="text-[9px] text-gray-500 font-black uppercase mt-1">Multi-Tenant Library Platform</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-sky-400">{selectedInvoice.id}</p>
                  <p className="text-[10px] text-gray-500 mt-1">Date: {selectedInvoice.date}</p>
                </div>
              </div>

              {/* Billed To / From */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[9px] text-gray-500 font-black uppercase mb-1.5">Billed From</p>
                  <p className="font-semibold text-white">CampusLibrary SaaS Inc.</p>
                  <p className="text-slate-400 mt-0.5">Viman Nagar, Pune, India</p>
                  <p className="text-slate-500">support@campuslibrary.com</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 font-black uppercase mb-1.5">Billed To</p>
                  <p className="font-semibold text-white">{user.username}</p>
                  <p className="text-slate-400 mt-0.5">College ID: {user.id}</p>
                  <p className="text-slate-500">{(user as any).email || 'admin@college.edu'}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-bold uppercase text-[9px] tracking-wider bg-white/5">
                      <th className="py-3 px-4">Item description</th>
                      <th className="py-3 px-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 text-slate-300">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{selectedInvoice.plan}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase">{selectedInvoice.cycle}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">{selectedInvoice.amount}</td>
                    </tr>
                    <tr className="text-slate-400">
                      <td className="py-2 px-4 text-right">CGST / SGST (18%)</td>
                      <td className="py-2 px-4 text-right font-mono">{selectedInvoice.tax}</td>
                    </tr>
                    <tr className="border-t border-white/10 text-white bg-white/5 font-bold">
                      <td className="py-3 px-4 text-right uppercase text-[9px] tracking-wider text-slate-400">Grand Total Paid</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-library-gold text-sm">{selectedInvoice.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="metallic-btn flex-1 py-4 text-xs font-black cursor-pointer"
                >
                  Print / Download Invoice
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="secondary-btn flex-1 py-4 text-xs font-bold cursor-pointer"
                >
                  Close Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
  const [authTab, setAuthTab] = useState<'student' | 'admin'>('student');
  const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'reset'>('login');
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  
  // Reset password fields
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Errors and messages
  const [errorMsg, setErrorMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setErrorMsg('');

    // Client-side validations
    if (authTab === 'student') {
      const prnNum = parseInt(username);
      if (isNaN(prnNum)) {
        setValidationError('Student PRN must be a numeric value.');
        return;
      }
      if (prnNum < 12501 || prnNum > 12600) {
        setValidationError('Student PRN must be between 12501 and 12600.');
        return;
      }
    } else {
      if (!username.includes('@')) {
        setValidationError('Please enter a valid email address.');
        return;
      }
    }

    if (password.length < 4) {
      setValidationError('Password must be at least 4 characters long.');
      return;
    }

    const success = onLogin(username, password);
    if (!success) {
      setErrorMsg('Invalid Credentials. Please check your username and password.');
    }
  };

  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    if (!forgotEmail.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setAuthMode('reset');
    }, 2000);
  };

  const handleResetSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (resetCode !== '123456') {
      setValidationError('Invalid verification code. Use mock code: 123456');
      return;
    }

    if (newPassword.length < 6) {
      setValidationError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setAuthMode('login');
      setUsername('');
      setPassword('');
    }, 2000);
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
        
        {/* Render Forgot Password View */}
        {authMode === 'forgot' && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-serif italic text-white sm:text-4xl">Reset Password</h2>
              <p className="text-slate-400 text-sm">
                Enter your registered institutional email to receive a recovery code.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">Code Sent!</p>
                <p className="mt-2 text-sm text-slate-200">A verification code has been dispatched. Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    College Email Address
                  </label>
                  <div className="relative group">
                    <input 
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@college.edu"
                      className="glass-input w-full pr-16 text-lg font-bold"
                      required
                    />
                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-library-gold z-10" size={20} />
                  </div>
                </div>

                {validationError && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                    {validationError}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="submit" className="metallic-btn flex-1 py-4 text-sm font-black">
                    Send Code
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('login'); setValidationError(''); }}
                    className="secondary-btn flex-1 py-4 text-sm font-bold"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Render Reset Password View */}
        {authMode === 'reset' && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-serif italic text-white sm:text-4xl">Enter Verification</h2>
              <p className="text-slate-400 text-sm">
                Check your inbox and enter the 6-digit verification code.
              </p>
            </div>

            {resetSuccess ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">Success!</p>
                <p className="mt-2 text-sm text-slate-200">Password reset successful. Returning to login...</p>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Verification Code (mock: 123456)
                    </label>
                    <input 
                      type="text"
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      className="glass-input w-full text-center text-lg font-mono font-bold tracking-[0.5em]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      New Password
                    </label>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="glass-input w-full text-lg font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Confirm New Password
                    </label>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="glass-input w-full text-lg font-bold"
                      required
                    />
                  </div>
                </div>

                {validationError && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                    {validationError}
                  </p>
                )}

                <button type="submit" className="metallic-btn w-full py-4 text-sm font-black">
                  Reset Password
                </button>
              </form>
            )}
          </div>
        )}

        {/* Render standard Login View */}
        {authMode === 'login' && (
          <>
            <div className="mb-8">
              <h2 className="mb-3 text-3xl font-serif italic text-white sm:text-5xl">CampusLibrary AI</h2>
              <p className="text-library-gold font-bold text-sm uppercase tracking-widest">
                Authentication Portal
              </p>
            </div>

            {/* Portal Tab Selectors */}
            <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 mb-8">
              <button
                type="button"
                onClick={() => { setAuthTab('student'); setValidationError(''); setErrorMsg(''); }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center ${
                  authTab === 'student' ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-300 hover:text-white'
                }`}
              >
                Student Portal
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('admin'); setValidationError(''); setErrorMsg(''); }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center ${
                  authTab === 'admin' ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-300 hover:text-white'
                }`}
              >
                College Admin
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-5">
                
                {/* Dynamic Username Field */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {authTab === 'student' ? 'Student PRN Number' : 'College Email Address'}
                  </label>
                  <div className="relative group">
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={authTab === 'student' ? 'Enter PRN (e.g., 12505)' : 'admin@college.edu'}
                      className="glass-input w-full pr-16 text-lg font-bold"
                      required
                    />
                    <UserIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-library-gold z-10" size={20} />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="glass-input w-full pr-16 text-lg font-bold"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-library-gold hover:text-white transition-colors z-20 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Utilities */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    className="rounded bg-white/5 border-white/10 text-sky-400 focus:ring-sky-400/20"
                  />
                  <span>Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('forgot'); setValidationError(''); setErrorMsg(''); }} 
                  className="text-sky-300 hover:text-white transition-colors hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error messages */}
              <AnimatePresence>
                {validationError && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs font-bold uppercase tracking-widest text-center"
                  >
                    {validationError}
                  </motion.p>
                )}
                {errorMsg && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs font-bold uppercase tracking-widest text-center"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" className="metallic-btn w-full py-5 text-xl mt-4 group">
                Enter System
                <ChevronRight size={26} className="group-hover:translate-x-1.5 transition-transform" />
              </button>

              <div className="pt-4 text-center border-t border-white/5">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                  {authTab === 'student' ? (
                    <>Student Range: 12501 to 12600 (Password is the same as PRN)</>
                  ) : (
                    <>Admin Demo login: admin / admin</>
                  )}
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}

function StudentManagementModule({ records }: { records: IssueRecord[] }) {
  const [search, setSearch] = useState('');
  
  // Department & Year collections
  const [departments, setDepartments] = useState(['Computer Science', 'Mechanical', 'Electronics', 'Civil', 'Information Technology']);
  const [years, setYears] = useState(['FY', 'SY', 'TY']);
  
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Clear'>('All');

  // Settings block toggle
  const [showSettings, setShowSettings] = useState(false);
  const [newDept, setNewDept] = useState('');
  const [newYear, setNewYear] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Student roster state (seeded from circulation records)
  const [studentDatabase, setStudentDatabase] = useState<any[]>(() => {
    const depts = ['Computer Science', 'Mechanical', 'Electronics', 'Civil', 'Information Technology'];
    const yrs = ['FY', 'SY', 'TY'];
    const uniquePrns = Array.from(new Set(records.map(r => r.studentPrn)));
    return uniquePrns.map((prn, index) => {
      const studentRecords = records.filter(r => r.studentPrn === prn);
      const latest = studentRecords[0];
      return {
        id: prn,
        name: latest?.studentName || `Student ${index + 1}`,
        prn,
        department: depts[index % depts.length],
        year: yrs[index % yrs.length],
        rollNumber: 1000 + index + 1,
        phone: `+91 98${(100000000 + index * 12345).toString().slice(1, 9)}`,
        email: `${(latest?.studentName || `student${index + 1}`).toLowerCase().replace(/\s+/g, '.')}@college.edu`,
        fineAmount: studentRecords.reduce((sum, r) => sum + (r.fineAmount || 0), 0),
        borrowHistory: studentRecords.length,
        currentBooksCount: studentRecords.filter(r => r.status === 'accepted' || r.status === 'return_pending').length,
        status: studentRecords.filter(r => r.status === 'accepted' || r.status === 'return_pending').length > 0 ? 'Active' : 'Clear'
      };
    });
  });

  // Client-side filtering
  const filteredStudents = useMemo(() => {
    return studentDatabase.filter((student) => {
      const matchesSearch = [
        student.name, 
        student.prn, 
        student.email, 
        student.department, 
        student.year, 
        student.rollNumber.toString()
      ].some((value) => value.toString().toLowerCase().includes(search.toLowerCase()));

      const matchesDept = deptFilter === 'All' || student.department === deptFilter;
      const matchesYear = yearFilter === 'All' || student.year === yearFilter;
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
      
      return matchesSearch && matchesDept && matchesYear && matchesStatus;
    });
  }, [studentDatabase, search, deptFilter, yearFilter, statusFilter]);

  // Paginated partition
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  // Reset page when filter triggers
  useEffect(() => {
    setPage(1);
  }, [search, deptFilter, yearFilter, statusFilter]);

  // Bulk Student Upload handler
  const handleBulkUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      
      if (lines.length <= 1) {
        alert("The uploaded CSV file appears to be empty.");
        return;
      }

      const parsedStudents: any[] = [];
      let skippedCount = 0;
      let limitExceeded = false;

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length < 5) continue; 

        const [name, prn, email, dept, year] = parts;

        // Quota Limit Validation (500 limit for Standard Plan)
        if (studentDatabase.length + parsedStudents.length >= 500) {
          limitExceeded = true;
          break;
        }

        // Email structure validation
        if (!email.includes('@') || !email.includes('.')) {
          skippedCount++;
          continue;
        }

        // Automatic Password Generation
        const generatedPassword = `${prn.toLowerCase()}@${Math.floor(100 + Math.random() * 900)}`;

        parsedStudents.push({
          id: prn,
          name,
          prn,
          department: departments.includes(dept) ? dept : departments[0],
          year: years.includes(year) ? year : years[0],
          rollNumber: 2000 + studentDatabase.length + parsedStudents.length + 1,
          phone: `+91 9100${Math.floor(100000 + Math.random() * 900000)}`,
          email,
          fineAmount: 0,
          borrowHistory: 0,
          currentBooksCount: 0,
          status: 'Clear',
          tempPassword: generatedPassword 
        });
      }

      if (parsedStudents.length > 0) {
        setStudentDatabase(prev => [...prev, ...parsedStudents]);
        alert(`Successfully imported ${parsedStudents.length} students! Generated passwords automatically. ${skippedCount > 0 ? `(${skippedCount} skipped due to invalid emails)` : ''}`);
      }

      if (limitExceeded) {
        alert("SaaS Plan Cap warning: Upload blocked. This action would exceed your Standard Plan limit of 500 students. Please upgrade your subscription plan.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // CSV Exporter
  const handleExportStudents = () => {
    const csvContent = [
      ['Name', 'PRN', 'Email', 'Department', 'Year', 'Roll Number', 'Fines', 'Status'].join(','),
      ...filteredStudents.map(s => [
        s.name,
        s.prn,
        s.email,
        s.department,
        s.year,
        s.rollNumber,
        s.fineAmount,
        s.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_roster_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddDept = (e: FormEvent) => {
    e.preventDefault();
    if (!newDept.trim() || departments.includes(newDept.trim())) return;
    setDepartments(prev => [...prev, newDept.trim()]);
    setNewDept('');
  };

  const handleAddYear = (e: FormEvent) => {
    e.preventDefault();
    if (!newYear.trim() || years.includes(newYear.trim())) return;
    setYears(prev => [...prev, newYear.trim()]);
    setNewYear('');
  };

  const handleDeleteStudent = (prn: string) => {
    setStudentDatabase(prev => prev.filter(s => s.prn !== prn));
  };

  const getAvatar = (name: string, color: string) => {
    const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
        <rect width="160" height="160" rx="32" fill="${color}" />
        <circle cx="80" cy="64" r="28" fill="rgba(255,255,255,0.25)" />
        <path d="M40 128c8-24 24-34 40-34s32 10 40 34" fill="rgba(255,255,255,0.2)" />
        <text x="80" y="148" text-anchor="middle" font-family="Inter, Arial" font-size="26" font-weight="700" fill="white">${initials}</text>
      </svg>`)}`;
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner */}
      <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-library-gold">Student Management Suite</p>
            <h2 className="text-3xl font-serif italic text-white font-bold">Scholar roster and quota administration.</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Onboard scholars, perform bulk imports, configure departments, and manage billing limits from one interface.
            </p>
          </div>
          <div className="rounded-full border border-library-gold/20 bg-library-gold/10 px-4 py-2 text-sm font-semibold text-library-gold">
            {studentDatabase.length} / 500 Students Enrolled
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="glass-panel rounded-[36px] border-white/5 p-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, PRN, email..."
              className="glass-input w-full pl-12 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="glass-input text-xs py-2">
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="glass-input text-xs py-2">
              <option value="All">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Clear')} className="glass-input text-xs py-2">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Clear">Clear</option>
            </select>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-white/5">
          <div className="flex flex-wrap gap-2">
            {/* CSV Import */}
            <label className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-sky-300 flex items-center gap-2 cursor-pointer hover:bg-sky-400/20 transition-all select-none">
              <Upload size={12} /> Bulk Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkUpload}
                className="hidden"
              />
            </label>

            {/* CSV Export */}
            <button
              onClick={handleExportStudents}
              className="rounded-full border border-library-gold/20 bg-library-gold/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-library-gold cursor-pointer hover:bg-library-gold/20 transition-all"
            >
              <span className="flex items-center gap-2"><Download size={12} /> Export CSV</span>
            </button>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="secondary-btn rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] cursor-pointer"
          >
            {showSettings ? 'Hide Collections Panel' : 'Manage Depts & Years'}
          </button>
        </div>
      </div>

      {/* Settings configuration block */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid gap-6 md:grid-cols-2 bg-slate-950/40 border border-white/10 rounded-[32px] p-6 text-left"
        >
          {/* Department setup */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Configure Departments</h4>
            <form onSubmit={handleAddDept} className="flex gap-2">
              <input
                type="text"
                placeholder="E.g., Cybersecurity"
                value={newDept}
                onChange={e => setNewDept(e.target.value)}
                className="glass-input text-xs py-2 flex-1"
                required
              />
              <button type="submit" className="metallic-btn text-xs px-4 py-2 cursor-pointer">Add</button>
            </form>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {departments.map(d => (
                <div key={d} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-slate-300">
                  <span>{d}</span>
                  <button
                    type="button"
                    onClick={() => setDepartments(prev => prev.filter(item => item !== d))}
                    className="text-red-400 hover:text-red-200 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Years setup */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Configure Academic Years</h4>
            <form onSubmit={handleAddYear} className="flex gap-2">
              <input
                type="text"
                placeholder="E.g., BTech 4th Year"
                value={newYear}
                onChange={e => setNewYear(e.target.value)}
                className="glass-input text-xs py-2 flex-1"
                required
              />
              <button type="submit" className="metallic-btn text-xs px-4 py-2 cursor-pointer">Add</button>
            </form>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {years.map(y => (
                <div key={y} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-slate-300">
                  <span>{y}</span>
                  <button
                    type="button"
                    onClick={() => setYears(prev => prev.filter(item => item !== y))}
                    className="text-red-400 hover:text-red-200 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Professional Data Table */}
      {filteredStudents.length === 0 ? (
        <div className="glass-panel rounded-[36px] border-white/5 p-12 text-center text-gray-500">
          <UserIcon size={48} className="mx-auto mb-4 text-library-gold" />
          <p className="text-lg font-semibold text-white">No student profiles matched this query.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/40">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-5 px-6">Scholar details</th>
                    <th className="py-5 px-4">PRN / Roll</th>
                    <th className="py-5 px-4">Department</th>
                    <th className="py-5 px-4">Year</th>
                    <th className="py-5 px-4 text-right">Fine dues</th>
                    <th className="py-5 px-4 text-center">Status</th>
                    <th className="py-5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student, index) => (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatar(student.name, ['#D4AF37', '#3b82f6', '#8b5cf6', '#10b981'][index % 4])}
                            alt=""
                            className="h-10 w-10 rounded-xl border border-white/10 shrink-0 object-cover"
                          />
                          <div>
                            <p className="font-semibold text-white">{student.name}</p>
                            <p className="text-[10px] text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-mono text-xs text-slate-300 font-bold">{student.prn}</p>
                        <p className="text-[9px] text-gray-600">Roll: {student.rollNumber}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{student.department}</td>
                      <td className="py-4 px-4 text-slate-400">{student.year}</td>
                      <td className="py-4 px-4 text-right font-semibold text-rose-400">
                        {student.fineAmount > 0 ? `₹${student.fineAmount}` : '—'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          student.status === 'Active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDeleteStudent(student.prn)}
                          className="px-2 py-1 text-[10px] font-black uppercase text-red-400 border border-red-500/10 bg-red-500/5 hover:bg-red-500/20 rounded-lg cursor-pointer transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between px-2 pt-2 text-xs">
            <span className="text-gray-500 font-medium">
              Showing page {page} of {totalPages} ({filteredStudents.length} matches)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="secondary-btn px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="secondary-btn px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditLogsModule({ records }: { records: IssueRecord[] }) {
  const [logs, setLogs] = useState<any[]>([
    { id: 'LOG-9812', event: 'Database catalog entry created for "Machine Learning"', user: 'Librarian Dr. Vivek Joshi', time: '2026-07-04 10:14:02', type: 'Catalog' },
    { id: 'LOG-9813', event: 'Bulk student roster file upload (24 accounts onboarded)', user: 'Admin Console', time: '2026-07-04 11:22:15', type: 'System' },
    { id: 'LOG-9814', event: 'Circulation approved: book check-out finalized for PRN 1001', user: 'Librarian Aparna Sen', time: '2026-07-04 11:55:40', type: 'Circulation' },
    { id: 'LOG-9815', event: 'SaaS Plan modified to Standard Package (500 capacity)', user: 'College Admin', time: '2026-07-04 12:12:00', type: 'Billing' },
    { id: 'LOG-9816', event: 'Book reservation slot queued for "Core Python"', user: 'AI Dispatcher', time: '2026-07-04 12:28:10', type: 'Circulation' }
  ]);

  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'email'>('audit');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const [emails, setEmails] = useState<any[]>([
    { id: 'MSG-001', to: 'aparna@college.edu', subject: 'Librarian Credentials Dispatch', time: '2026-07-04 10:00', status: 'Delivered' },
    { id: 'MSG-002', to: 'student.rahul@college.edu', subject: 'Library Alert: Overdue Item Notice (Fine accrued)', time: '2026-07-04 11:30', status: 'Sent' },
    { id: 'MSG-003', to: 'student.amit@college.edu', subject: 'Reservation Item Available for Pick-up', time: '2026-07-04 12:00', status: 'Delivered' }
  ]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchSearch = l.event.toLowerCase().includes(search.toLowerCase()) || 
                          l.user.toLowerCase().includes(search.toLowerCase()) ||
                          l.id.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || l.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [logs, search, typeFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  const handleSimulateAlert = () => {
    const newAlert = {
      id: `MSG-${Math.floor(100 + Math.random() * 900)}`,
      to: `student.${Math.floor(100 + Math.random() * 899)}@college.edu`,
      subject: 'Dynamic Library Alert: Overdue return fine notice generated',
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'Sent'
    };
    setEmails(prev => [newAlert, ...prev]);
    
    // Simulate real logs creation
    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      event: `Email Notification alert dispatched to: ${newAlert.to}`,
      user: 'AI Alert Manager',
      time: newAlert.time,
      type: 'System'
    };
    setLogs(prev => [newLog, ...prev]);
    alert(`Email Notification simulated successfully! Notification log dispatched to: ${newAlert.to}`);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Log ID', 'Activity Event', 'Responsible User', 'Timestamp', 'Category'].join(','),
      ...filteredLogs.map(l => [l.id, `"${l.event}"`, `"${l.user}"`, l.time, l.type].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_audit_trail.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(212, 175, 55); 
    doc.text('CAMPUSLIBRARY AUDIT REPORT', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleString()} • Multi-Tenant Vault Logs`, 105, 38, { align: 'center' });
    
    autoTable(doc, {
      startY: 48,
      head: [['Log ID', 'Category', 'Activity Description', 'Actor / Origin', 'Timestamp']],
      body: filteredLogs.map(l => [l.id, l.type, l.event, l.user, l.time]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });
    
    doc.save(`audit_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner */}
      <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-library-gold">Audit Trail & Communications</p>
            <h2 className="text-3xl font-serif italic text-white font-bold">System log registry and email alerts.</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Audit staff operations, export compliance databases to PDF reports, and monitor student notification queues.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation tabs */}
      <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 max-w-xs">
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center ${
            activeSubTab === 'audit' ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-300 hover:text-white'
          }`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveSubTab('email')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center ${
            activeSubTab === 'email' ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-300 hover:text-white'
          }`}
        >
          Email Queue
        </button>
      </div>

      {/* AUDIT LOG TAB */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-[36px] border-white/5 p-6 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events, actors, log ID..."
                  className="glass-input w-full pl-12 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="glass-input text-xs py-2">
                  <option value="All">All Categories</option>
                  <option value="Catalog">Catalog</option>
                  <option value="System">System</option>
                  <option value="Circulation">Circulation</option>
                  <option value="Billing">Billing</option>
                </select>

                <button
                  onClick={handleExportPDF}
                  className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-rose-300 hover:bg-rose-400/20 transition-all"
                >
                  <span className="flex items-center gap-2"><FileText size={12} /> Export PDF</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="rounded-xl border border-library-gold/20 bg-library-gold/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-library-gold hover:bg-library-gold/20 transition-all"
                >
                  <span className="flex items-center gap-2"><Download size={12} /> Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/40">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-white/5">
                    <th className="py-5 px-6">Log ID</th>
                    <th className="py-5 px-4">Event description</th>
                    <th className="py-5 px-4">Responsible Actor</th>
                    <th className="py-5 px-4">Category</th>
                    <th className="py-5 px-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map(l => (
                    <tr key={l.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-sky-400">{l.id}</td>
                      <td className="py-4 px-4 text-white font-semibold">{l.event}</td>
                      <td className="py-4 px-4 text-slate-300">{l.user}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          l.type === 'Catalog' ? 'bg-amber-400/10 text-amber-400' :
                          l.type === 'Circulation' ? 'bg-purple-400/10 text-purple-400' :
                          l.type === 'Billing' ? 'bg-emerald-400/10 text-emerald-400' :
                          'bg-sky-400/10 text-sky-400'
                        }`}>
                          {l.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-400 font-mono text-xs">{l.time}</td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">No logs match active filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between px-2 pt-2 text-xs">
            <span className="text-gray-500 font-medium">
              Showing page {page} of {totalPages} ({filteredLogs.length} audit entries)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="secondary-btn px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="secondary-btn px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL QUEUE TAB */}
      {activeSubTab === 'email' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-2xl p-6">
            <div>
              <h3 className="text-base font-bold text-white">Manual Dispatch Center</h3>
              <p className="text-xs text-slate-400 mt-1">Simulate overdue notice dispatches to verify system email alerts.</p>
            </div>
            <button
              onClick={handleSimulateAlert}
              className="metallic-btn px-5 py-3 text-xs font-black cursor-pointer"
            >
              Simulate Email Alert
            </button>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/40">
            <table className="min-w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-white/5">
                  <th className="py-5 px-6">Notification ID</th>
                  <th className="py-5 px-4">Recipient</th>
                  <th className="py-5 px-4">Email Subject</th>
                  <th className="py-5 px-4 text-center">Status</th>
                  <th className="py-5 px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {emails.map(e => (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-300">{e.id}</td>
                    <td className="py-4 px-4 text-white font-mono text-xs font-bold">{e.to}</td>
                    <td className="py-4 px-4 text-slate-300">{e.subject}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        e.status === 'Delivered' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-sky-400/10 text-sky-400'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400 font-mono text-xs">{e.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  activeTab: string,
  setActiveTab: (t: any) => void,
  onApproveReturn: (id: string) => void,
  setRegistryFilter: (f: 'all' | 'pending' | 'return_pending') => void,
  registryFilter: 'all' | 'pending' | 'return_pending'
}) {
  const tabs = useMemo(() => {
    if (user.role === 'super_admin') {
      return [
        { id: 'super_hub', label: 'Platform Hub', icon: ShieldCheck },
      ];
    }
    if (user.role === 'college_admin') {
      return [
        { id: 'college_hub', label: 'College Hub', icon: ShieldCheck },
        { id: 'students', label: 'Student Mgmt', icon: UserIcon },
      ];
    }
    if (user.role === 'librarian' || user.role === 'admin') {
      return [
        { id: 'stats', label: 'Circulation Hub', icon: ShieldCheck },
        { id: 'catalog', label: 'Book Catalog', icon: BookIcon },
        { id: 'registry', label: 'Managed Registry', icon: Layers },
        { id: 'chat', label: 'Support Chat', icon: MessageSquare }
      ];
    }
    return [
      { id: 'catalog', label: 'Book Catalog', icon: BookIcon },
      { id: 'terminal', label: 'Issue Books', icon: Library },
      { id: 'return_center', label: 'Return Center', icon: LogOut },
      { id: 'registry', label: 'My Bookshelf', icon: Layers },
      { id: 'ai_assistant', label: 'AI Librarian', icon: Bot },
      { id: 'chat', label: 'Support Uplink', icon: MessageSquare }
    ];
  }, [user]);

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
  const [showScanner, setShowScanner] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Book CRUD Form states
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookCategory, setBookCategory] = useState('');
  const [bookCopies, setBookCopies] = useState(1);
  const [bookIsbn, setBookIsbn] = useState('');
  const [bookDepartment, setBookDepartment] = useState('General');

  useEffect(() => {
    const permittedIds = tabs.map(t => t.id);
    if (!permittedIds.includes(activeTab)) {
      setActiveTab(permittedIds[0]);
    }
  }, [user, tabs, activeTab, setActiveTab]);

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

  const handleSaveBook = (e: FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      setCatalogBooks(prev => prev.map(b => b.id === editingBook.id ? {
        ...b,
        title: bookTitle,
        author: bookAuthor,
        publisher: bookPublisher,
        category: bookCategory,
        copies: bookCopies,
        isbn: bookIsbn,
        code: bookIsbn || b.code,
        department: bookDepartment
      } : b));
      setEditingBook(null);
    } else {
      const newBook: Book = {
        id: `MNS-${Math.floor(10000 + Math.random() * 90000)}`,
        code: bookIsbn || `ISBN-${Math.floor(1000000 + Math.random() * 9000000)}`,
        title: bookTitle,
        author: bookAuthor,
        publisher: bookPublisher || 'Academic Press',
        category: bookCategory || 'General',
        department: bookDepartment || 'General',
        copies: bookCopies,
        section: 'Stack Area A-3'
      };
      setCatalogBooks(prev => [newBook, ...prev]);
      setShowAddBook(false);
    }
    setBookTitle('');
    setBookAuthor('');
    setBookPublisher('');
    setBookCategory('');
    setBookCopies(1);
    setBookIsbn('');
    setBookDepartment('General');
  };

  const handleDeleteSingleBook = (id: string) => {
    setCatalogBooks(prev => prev.filter(b => b.id !== id));
    setSelectedBook(null);
  };

  const handleReserveBook = (book: Book) => {
    setCatalogBooks(prev => prev.map(b => b.id === book.id ? {
      ...b,
      reservedCount: (b.reservedCount || 0) + 1
    } : b));
    alert(`Book "${book.title}" successfully reserved! You are #1 in the queue.`);
    setSelectedBook(null);
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
        {tabs.map(tab => (
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
                  <button 
                    type="button" 
                    onClick={() => setShowScanner(true)}
                    className="w-full rounded-xl border border-sky-400/20 bg-sky-400/10 py-3 text-[10px] font-black uppercase tracking-widest text-sky-300 hover:bg-sky-400/20 transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                  >
                    <MonitorPlay size={12} /> Scan QR / Barcode
                  </button>
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
            {activeTab === 'super_hub' ? (
              <motion.div
                key="super-hub-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SuperAdminDashboard 
                  onApprove={(id) => console.log('Super-Admin approved college:', id)}
                  onSuspend={(id) => console.log('Super-Admin suspended college:', id)}
                />
              </motion.div>
            ) : activeTab === 'college_hub' ? (
              <motion.div
                key="college-hub-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CollegeAdminDashboard user={user} />
              </motion.div>
            ) : activeTab === 'catalog' ? (
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
                    {(user.role === 'admin' || user.role === 'college_admin' || user.role === 'librarian') && (
                      <button
                        onClick={() => {
                          setEditingBook(null);
                          setBookTitle('');
                          setBookAuthor('');
                          setBookPublisher('');
                          setBookCategory('Programming');
                          setBookCopies(1);
                          setBookIsbn('');
                          setBookDepartment('General');
                          setShowAddBook(true);
                        }}
                        className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-sky-300 hover:bg-sky-400/20 transition-all cursor-pointer"
                      >
                        + Add Book
                      </button>
                    )}
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
            ) : activeTab === 'audit_logs' ? (
              <motion.div
                key="audit-logs-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AuditLogsModule records={records} />
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

      {/* Barcode / QR Code Scanner Simulation Modal */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScanner(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="glass-panel w-full max-w-md p-8 rounded-[48px] relative z-10 border border-white/20 text-center space-y-6"
            >
              <h3 className="text-xl font-bold text-white">Universal Scan Terminal</h3>
              <p className="text-xs text-slate-400">Position the book barcode or student QR code in the camera frame.</p>
              
              {/* Animated viewport */}
              <div className="relative w-full aspect-video rounded-3xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                {/* Scanner Frame corner lines */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-md"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-md"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-md"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-md"></div>
                
                {/* Animated scanning laser line */}
                <div className="absolute left-0 right-0 h-0.5 bg-sky-400/80 animate-bounce shadow-[0_0_15px_rgba(56,189,248,1)]"></div>
                
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 animate-pulse">Camera Link Active</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const target = catalogBooks[Math.floor(Math.random() * catalogBooks.length)];
                    setSelectedBook(target);
                    setShowScanner(false);
                    alert(`Barcode Scanned successfully! Located item: ${target.title} (${target.id})`);
                  }}
                  className="metallic-btn flex-1 py-4 text-xs font-black"
                >
                  Simulate QR Scan Success
                </button>
                <button
                  type="button"
                  onClick={() => setShowScanner(false)}
                  className="secondary-btn flex-1 py-4 text-xs font-bold"
                >
                  Cancel
                </button>
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
                <h3 className="text-3xl font-serif italic mb-3 text-white">Book Information</h3>
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

                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-left space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-library-gold uppercase tracking-[0.2em] mb-1">{selectedBook.id} / {selectedBook.code}</p>
                        <h4 className="text-xl font-bold text-white tracking-tight">{selectedBook.title}</h4>
                        <p className="text-xs text-slate-400">By {selectedBook.author}</p>
                      </div>
                      <span className="px-3 py-1 bg-library-gold/20 text-library-gold text-[9px] font-black rounded-lg uppercase">{selectedBook.department}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[9px] text-gray-500 font-black uppercase">Publisher</p>
                        <p className="text-xs text-white font-semibold">{selectedBook.publisher || 'Academic Press'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 font-black uppercase">Category</p>
                        <p className="text-xs text-white font-semibold">{selectedBook.category}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 text-center">
                      <div className="bg-white/5 p-2 rounded-xl">
                        <p className="text-[8px] text-gray-500 font-black uppercase">Stock</p>
                        <p className="text-sm text-white font-bold">{selectedBook.copies}</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <p className="text-[8px] text-gray-500 font-black uppercase">Reserved</p>
                        <p className="text-sm text-amber-400 font-bold">{selectedBook.reservedCount || 0}</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <p className="text-[8px] text-gray-500 font-black uppercase">Available</p>
                        <p className="text-sm text-emerald-400 font-bold">
                          {Math.max(0, selectedBook.copies - (selectedBook.reservedCount || 0))}
                        </p>
                      </div>
                    </div>

                    {/* QR Code Resource Tagging */}
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] text-gray-500 font-black uppercase">Asset QR Code</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                          Scan with the library terminal scanner to issue or check stock status.
                        </p>
                      </div>
                      <div className="w-16 h-16 shrink-0 bg-white p-1 rounded-xl flex items-center justify-center">
                        <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100">
                          <rect x="5" y="5" width="25" height="25" fill="currentColor" />
                          <rect x="8" y="8" width="19" height="19" fill="white" />
                          <rect x="12" y="12" width="11" height="11" fill="currentColor" />
                          
                          <rect x="70" y="5" width="25" height="25" fill="currentColor" />
                          <rect x="73" y="8" width="19" height="19" fill="white" />
                          <rect x="77" y="12" width="11" height="11" fill="currentColor" />
                          
                          <rect x="5" y="70" width="25" height="25" fill="currentColor" />
                          <rect x="8" y="73" width="19" height="19" fill="white" />
                          <rect x="12" y="77" width="11" height="11" fill="currentColor" />
                          
                          <rect x="35" y="10" width="6" height="15" fill="currentColor" />
                          <rect x="45" y="5" width="10" height="6" fill="currentColor" />
                          <rect x="40" y="25" width="15" height="6" fill="currentColor" />
                          
                          <rect x="10" y="35" width="15" height="6" fill="currentColor" />
                          <rect x="5" y="45" width="6" height="15" fill="currentColor" />
                          
                          <rect x="75" y="35" width="15" height="6" fill="currentColor" />
                          <rect x="85" y="45" width="10" height="10" fill="currentColor" />
                          
                          <rect x="35" y="40" width="20" height="20" fill="currentColor" />
                          <rect x="40" y="45" width="10" height="10" fill="white" />
                          
                          <rect x="65" y="65" width="10" height="25" fill="currentColor" />
                          <rect x="80" y="80" width="15" height="15" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedBook(null)} className="secondary-btn flex-1 py-4 text-xs font-bold">
                        {activeTab === 'terminal' ? 'Abort' : 'Close'}
                      </button>

                      {activeTab === 'terminal' && (
                        <button onClick={handleIssueRequest} className="metallic-btn flex-1 py-4 text-xs font-black">
                          Confirm Issue
                        </button>
                      )}

                      {activeTab !== 'terminal' && user.role === 'student' && (
                        Math.max(0, selectedBook.copies - (selectedBook.reservedCount || 0)) > 0 ? (
                          <button 
                            onClick={() => {
                              setActiveTab('terminal');
                              setDirectCode(selectedBook.id);
                              setSelectedBook(null);
                            }} 
                            className="metallic-btn flex-1 py-4 text-xs font-black"
                          >
                            Request Issue
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleReserveBook(selectedBook)} 
                            className="metallic-btn flex-1 py-4 text-xs font-black bg-amber-500/20 text-amber-300 border-amber-500/30"
                          >
                            Reserve Book
                          </button>
                        )
                      )}
                    </div>

                    {(user.role === 'admin' || user.role === 'college_admin' || user.role === 'librarian') && (
                      <div className="flex gap-2 border-t border-white/5 pt-3">
                        <button
                          onClick={() => {
                            setEditingBook(selectedBook);
                            setBookTitle(selectedBook.title);
                            setBookAuthor(selectedBook.author);
                            setBookPublisher(selectedBook.publisher || 'Academic Press');
                            setBookCategory(selectedBook.category);
                            setBookCopies(selectedBook.copies);
                            setBookIsbn(selectedBook.code);
                            setBookDepartment(selectedBook.department);
                            setSelectedBook(null);
                          }}
                          className="secondary-btn flex-1 py-2 text-[10px] font-black text-sky-400 border-sky-400/20"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSingleBook(selectedBook.id)}
                          className="secondary-btn flex-1 py-2 text-[10px] font-black text-red-400 border-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Book Modal Drawer */}
      <AnimatePresence>
        {(showAddBook || editingBook) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddBook(false); setEditingBook(null); }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="glass-panel w-full max-w-lg p-8 rounded-[48px] relative z-10 border border-white/20"
            >
              <h3 className="text-2xl font-serif italic text-white mb-6 text-left">
                {editingBook ? 'Modify Catalog Entry' : 'New Catalog Accession'}
              </h3>
              
              <form onSubmit={handleSaveBook} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</label>
                  <input 
                    type="text" 
                    value={bookTitle} 
                    onChange={e => setBookTitle(e.target.value)} 
                    className="glass-input w-full p-3 rounded-xl text-sm" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Author</label>
                    <input 
                      type="text" 
                      value={bookAuthor} 
                      onChange={e => setBookAuthor(e.target.value)} 
                      className="glass-input w-full p-3 rounded-xl text-sm" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Publisher</label>
                    <input 
                      type="text" 
                      value={bookPublisher} 
                      onChange={e => setBookPublisher(e.target.value)} 
                      className="glass-input w-full p-3 rounded-xl text-sm" 
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                    <input 
                      type="text" 
                      value={bookCategory} 
                      onChange={e => setBookCategory(e.target.value)} 
                      className="glass-input w-full p-3 rounded-xl text-sm" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ISBN Code</label>
                    <input 
                      type="text" 
                      value={bookIsbn} 
                      onChange={e => setBookIsbn(e.target.value)} 
                      className="glass-input w-full p-3 rounded-xl text-sm" 
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Copies</label>
                    <input 
                      type="number" 
                      min={0}
                      value={bookCopies} 
                      onChange={e => setBookCopies(Number(e.target.value))} 
                      className="glass-input w-full p-3 rounded-xl text-sm" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</label>
                    <input 
                      type="text" 
                      value={bookDepartment} 
                      onChange={e => setBookDepartment(e.target.value)} 
                      className="glass-input w-full p-3 rounded-xl text-sm" 
                      required 
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="metallic-btn flex-1 py-4 text-xs font-black"
                  >
                    Save Entry
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowAddBook(false); setEditingBook(null); }}
                    className="secondary-btn flex-1 py-4 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
