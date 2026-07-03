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
  BellOff
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
  Area
} from 'recharts';
import { User, IssueRecord, Book, ChatMessage } from './types';
import { formatDisplayDate, calculateDueDate } from './data';
import { ALL_BOOKS } from './data/books';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'dashboard'>('login');
  const [records, setRecords] = useState<IssueRecord[]>(() => {
    const saved = localStorage.getItem('durvesh_records');
    return saved ? JSON.parse(saved) : [];
  });
  const [isBooting, setIsBooting] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('durvesh_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('durvesh_theme') as 'dark' | 'light') || 'dark';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('durvesh_notify_enabled') !== 'false';
  });
  const [registryFilter, setRegistryFilter] = useState<'all' | 'pending' | 'return_pending'>('all');
  const [notifications, setNotifications] = useState<{id: string, text: string, time: string}[]>(() => {
    const saved = localStorage.getItem('durvesh_alerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSettings, setShowSettings] = useState(false);

  // Page-level state
  const [activeTab, setActiveTab] = useState<'catalog' | 'registry' | 'chat' | 'terminal' | 'stats' | 'return_center' | 'ai_assistant'>('catalog');

  useEffect(() => {
    document.body.className = theme;
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
    localStorage.setItem('durvesh_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('durvesh_chats', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('durvesh_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('durvesh_notify_enabled', String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('durvesh_alerts', JSON.stringify(notifications));
  }, [notifications]);

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
    const msg = {
      id: Math.random().toString(),
      text: `Alert: ${lastRecord.bookTitle} is now ${lastRecord.status.toUpperCase()}`,
      time: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [msg, ...prev].slice(0, 5));
  }, [records, notificationsEnabled]);

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  const handleIssueBook = (book: Book) => {
    if (!user) return;
    
    // Wallet restriction
    if (user.role === 'student' && (user.walletBalance || 100) < 40) {
      alert("System Block: Wallet balance must be at least ₹40 to issue new books.");
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
    return true;
  };

  const handleAcceptRequest = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
  };

  const handleRejectRequest = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  const handleReturnBook = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'return_pending', returnRequestedDate: new Date().toISOString() } : r));
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
    
    // Deduct from student wallet
    if (fine > 0) {
       // Note: We'd need to find the student in a users list. 
       // For this demo, we update current user if it's the student
       if (user?.role === 'student' && user.prn === record.studentPrn) {
          setUser({ ...user, walletBalance: (user.walletBalance || 100) - fine });
       }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans animated-bg">
      {/* Background Decor - Floating Orbs */}
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-16 px-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
              <Library className="text-library-gold" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-serif italic text-white font-bold tracking-tight">Durvesh</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white font-bold opacity-80">Library Management System</p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 glass-panel py-2 px-6 rounded-2xl border-white/5">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-white tracking-tight">{user.username}</p>
                  <p className="text-[9px] text-library-gold font-bold uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400"
                    title="Toggle Theme"
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
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
          )}
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
                     <Moon size={18} className="text-library-gold" />
                     <span className="text-xs font-bold text-white uppercase tracking-wider">Force Dark Mode</span>
                   </div>
                   <button 
                    onClick={() => setTheme('dark')}
                    className={`w-10 h-5 rounded-full transition-all relative ${theme === 'dark' ? 'bg-library-gold' : 'bg-white/10'}`}
                   >
                     <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`}></div>
                   </button>
                </div>

                {notificationsEnabled && notifications.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Recent Activity</p>
                    {notifications.map(n => (
                      <div key={n.id} className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-white font-bold leading-tight">{n.text}</p>
                        <p className="text-[8px] text-library-gold mt-1">{n.time}</p>
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
    return {
      issuedToday: records.filter(r => new Date(r.issueDate).toDateString() === today && (r.status === 'accepted' || r.status === 'returned')).length,
      returnedToday: records.filter(r => r.status === 'returned' && new Date().toDateString() === today).length,
      pendingIssues: records.filter(r => r.status === 'pending').length,
      pendingReturns: records.filter(r => r.status === 'return_pending').length,
      activeUsers: new Set(records.filter(r => r.status === 'accepted' || r.status === 'return_pending').map(r => r.studentPrn)).size
    };
  }, [records]);

  const chartData = [
    { name: 'Mon', issues: 14, returns: 10 },
    { name: 'Tue', issues: 21, returns: 15 },
    { name: 'Wed', issues: 18, returns: 20 },
    { name: 'Thu', issues: 25, returns: 18 },
    { name: 'Fri', issues: 32, returns: 24 },
    { name: 'Sat', issues: 12, returns: 8 },
    { name: 'Sun', issues: 10, returns: 5 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {[
          { label: 'Books Issued', value: stats.issuedToday, icon: BookIcon, color: 'text-blue-500', filter: 'all' as const },
          { label: 'Returns Today', value: stats.returnedToday, icon: CheckCircle2, color: 'text-green-500', filter: 'all' as const },
          { label: 'Active Learners', value: stats.activeUsers, icon: UserIcon, color: 'text-purple-500', filter: 'all' as const },
          { label: 'Issue Requests', value: stats.pendingIssues, icon: Clock, color: 'text-amber-500', filter: 'pending' as const },
          { label: 'Return Waitlist', value: stats.pendingReturns, icon: Library, color: 'text-rose-500', filter: 'return_pending' as const },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            onClick={() => onNavigate('registry', stat.filter)}
            className="glass-panel p-6 rounded-[32px] border-white/5 cursor-pointer hover:border-library-gold transition-all"
          >
            <div className={`p-3 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-serif italic text-white font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-[40px] border-white/5">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold text-white">Issue Velocity</h3>
             <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Weekly Metrics</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a101f', borderRadius: '16px', border: '1px solid #ffffff10', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="issues" stroke="#D4AF37" fillOpacity={1} fill="url(#colorIssues)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[40px] border-white/5">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold text-white">Return Volume</h3>
             <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Weekly Distribution</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#0a101f', borderRadius: '16px', border: '1px solid #ffffff10' }}
                />
                <Bar dataKey="returns" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
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
      <div className="glass-panel p-12 rounded-[40px] relative">
        <div className="mb-12">
          <h2 className="text-5xl font-serif italic mb-4 text-white">Durvesh Library</h2>
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Username"
                  className="glass-input w-full pr-16 text-lg font-bold"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full pr-16 text-lg font-bold"
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
  activeTab: 'catalog' | 'registry' | 'chat' | 'terminal' | 'stats' | 'return_center' | 'ai_assistant',
  setActiveTab: (t: 'catalog' | 'registry' | 'chat' | 'terminal' | 'stats' | 'return_center' | 'ai_assistant') => void,
  onApproveReturn: (id: string) => void,
  setRegistryFilter: (f: 'all' | 'pending' | 'return_pending') => void,
  registryFilter: 'all' | 'pending' | 'return_pending'
}) {
  const [search, setSearch] = useState('');
  const [directCode, setDirectCode] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [displayCount, setDisplayCount] = useState(40);
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
    let list = ALL_BOOKS;
    if (deptFilter !== 'All') {
      list = list.filter(b => b.department === deptFilter);
    }
    if (categoryFilter !== 'All') {
      list = list.filter(b => b.category === categoryFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(b => 
        b.title.toLowerCase().includes(s) || 
        b.id.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s)
      );
    }
    return list;
  }, [search, categoryFilter, deptFilter]);

  const displayedBooks = useMemo(() => {
    return filteredBooks.slice(0, displayCount);
  }, [filteredBooks, displayCount]);

  useEffect(() => {
    setDisplayCount(40);
  }, [search, categoryFilter, deptFilter]);

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
                   <Filter size={14} /> Search Database
                </h4>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search titles, authors..." 
                    className="glass-input w-full pl-12 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
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
                <div className="flex justify-between items-end mb-10 px-2">
                  <div>
                    <h2 className="font-serif italic text-4xl text-white font-bold">Library Shell</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                      Browsing {filteredBooks.length.toLocaleString()} Active Manuscripts • {deptFilter} / {categoryFilter}
                    </p>
                  </div>
                  <div className="bg-library-gold/10 px-4 py-2 rounded-full border border-library-gold/20">
                     <span className="text-[10px] text-library-gold font-black uppercase tracking-widest text-center">System Secure</span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedBooks.map((book) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={book.id} 
                      className="group p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-library-gold/20 transition-all cursor-pointer relative overflow-hidden"
                      onClick={() => setSelectedBook(book)}
                    >
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-black bg-library-gold text-black px-2 py-0.5 rounded uppercase tracking-tighter">{book.id}</span>
                          <span className="text-[9px] text-gray-600 font-mono scale-90">{book.section}</span>
                        </div>
                        <h3 className="text-white font-bold group-hover:text-library-gold transition-colors line-clamp-1 mb-1">{book.title}</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{book.author}</p>
                        
                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-60">Status: In Stock</span>
                          </div>
                          <span className="text-[10px] text-library-gold font-black uppercase tracking-wider underline underline-offset-4 opacity-0 group-hover:opacity-100 transition-opacity">Full Specs</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredBooks.length > displayCount && (
                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={() => setDisplayCount(prev => prev + 40)}
                      className="secondary-btn !rounded-full !px-12"
                    >
                       Load More Records
                    </button>
                  </div>
                )}

                {filteredBooks.length === 0 && (
                  <div className="h-64 flex flex-col items-center justify-center opacity-30">
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
