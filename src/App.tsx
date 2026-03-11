import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Settings, 
  Menu,
  Bell,
  Search,
  LogOut,
  UserPlus,
  Shield,
  Plus,
  TrendingUp,
  Clock
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "./lib/utils";

// --- Mock Data & LocalStorage Logic ---

const STORAGE_KEYS = {
  USER: "crm_user",
  LEADS: "crm_leads",
  DEALS: "crm_deals",
  TASKS: "crm_tasks"
};

const INITIAL_LEADS = [
  { id: "1", first_name: "Alex", last_name: "Rivera", email: "alex@stellar.com", company: "Stellar Tech", status: "lead", score: 85, created_at: new Date().toISOString() },
  { id: "2", first_name: "Sarah", last_name: "Chen", email: "sarah@nexus.com", company: "Nexus Labs", status: "contacted", score: 92, created_at: new Date().toISOString() },
  { id: "3", first_name: "Marcus", last_name: "Thorne", email: "marcus@vanguard.com", company: "Vanguard", status: "qualified", score: 78, created_at: new Date().toISOString() },
];

const INITIAL_DEALS = [
  { id: "1", customer_id: "1", title: "Enterprise License", value: 12000, stage: "discovery", probability: 20, updated_at: new Date().toISOString() },
  { id: "2", customer_id: "2", title: "Cloud Migration", value: 45000, stage: "proposal", probability: 60, updated_at: new Date().toISOString() },
];

const INITIAL_TASKS = [
  { id: "1", title: "Follow up with Alex", status: "todo", priority: "high", due_date: new Date().toISOString() },
  { id: "2", title: "Send proposal to Sarah", status: "in_progress", priority: "medium", due_date: new Date().toISOString() },
];

// --- Auth Context / State ---
const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simplest Login: Any email with password "admin123"
    if (password === "admin123") {
      const userData = { 
        id: "admin-1", 
        email, 
        name: email.split('@')[0], 
        role: "admin" 
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  return { user, loading, login, logout };
};

// --- Data Hook ---
const useCRMData = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const savedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
    const savedDeals = localStorage.getItem(STORAGE_KEYS.DEALS);
    const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);

    if (!savedLeads) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
      setLeads(INITIAL_LEADS);
    } else {
      setLeads(JSON.parse(savedLeads));
    }

    if (!savedDeals) {
      localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(INITIAL_DEALS));
      setDeals(INITIAL_DEALS);
    } else {
      setDeals(JSON.parse(savedDeals));
    }

    if (!savedTasks) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      setTasks(INITIAL_TASKS);
    } else {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  const stats = useMemo(() => {
    const pipelineValue = deals.reduce((acc, d) => acc + d.value, 0);
    const pendingTasks = tasks.filter(t => t.status !== "done").length;
    return {
      leads: leads.length,
      pipelineValue,
      pendingTasks
    };
  }, [leads, deals, tasks]);

  return { leads, deals, tasks, stats };
};

// --- Components ---

const Login = ({ onLogin }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const success = await onLogin(email, password);
    if (!success) setError("Invalid credentials (Hint: use password 'admin123')");
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl shadow-xl p-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white rounded-sm rotate-45" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">EdgeCRM Lite</h1>
          <p className="text-zinc-500 text-sm">Simplest Cloudflare-Ready CRM</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
              placeholder="admin123"
            />
          </div>
          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          <button 
            type="submit"
            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10"
          >
            Sign In
          </button>
        </form>
        
        <p className="text-center text-xs text-zinc-400">
          Pure Frontend Mode. Data stored in your browser.
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { leads, stats } = useCRMData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Leads", value: stats.leads, trend: "+12%", icon: Users },
          { label: "Pipeline Value", value: `$${stats.pipelineValue.toLocaleString()}`, trend: "+5.4%", icon: Briefcase },
          { label: "Tasks Due", value: stats.pendingTasks, trend: "-2", icon: CheckSquare },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <stat.icon className="w-5 h-5 text-zinc-500" />
              <span className={cn("text-xs font-medium px-2 py-1 rounded-full", 
                stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-700")}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
            <h3 className="font-semibold">Recent Leads</h3>
            <Link to="/leads" className="text-sm text-zinc-500 hover:text-black">View all</Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                    {lead.first_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{lead.first_name} {lead.last_name}</p>
                    <p className="text-xs text-zinc-500">{lead.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium px-2 py-1 bg-zinc-100 rounded-md capitalize">{lead.status}</span>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">{lead.score}</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-all text-left space-y-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-bold">New Deal</p>
              <p className="text-xs text-zinc-500">Create a new sales opportunity</p>
            </button>
            <button className="p-4 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-all text-left space-y-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <p className="text-sm font-bold">Log Activity</p>
              <p className="text-xs text-zinc-500">Record a call or meeting</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
      active 
        ? "bg-black text-white shadow-lg shadow-black/10" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    )}
  >
    <Icon className="w-4 h-4" />
    {label}
  </Link>
);

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Login onLogin={login} />;

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transition-transform duration-300 transform lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
            </div>
            <span className="font-bold text-xl tracking-tight">EdgeCRM</span>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === "/"} />
            <SidebarItem to="/leads" icon={Users} label="Leads" active={location.pathname === "/leads"} />
            <SidebarItem to="/deals" icon={Briefcase} label="Deals" active={location.pathname === "/deals"} />
            <SidebarItem to="/tasks" icon={CheckSquare} label="Tasks" active={location.pathname === "/tasks"} />
          </nav>

          <div className="pt-6 border-t border-zinc-100 space-y-1">
            <SidebarItem to="/settings" icon={Settings} label="Settings" active={location.pathname === "/settings"} />
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search leads, deals..." 
                className="w-full pl-10 pr-4 py-2 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-200 rounded-xl text-sm transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-zinc-900">{user.name}</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{user.role}</p>
            </div>
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300" />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<div className="text-3xl font-bold">Leads Page</div>} />
            <Route path="/deals" element={<div className="text-3xl font-bold">Deals Page</div>} />
            <Route path="/tasks" element={<div className="text-3xl font-bold">Tasks Page</div>} />
            <Route path="/settings" element={<div className="text-3xl font-bold">Settings Page</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
