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
  Clock,
  DollarSign,
  Activity,
  MoreHorizontal
} from "lucide-react";
import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from "react";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";

// --- Mock Data & LocalStorage Logic ---

const STORAGE_KEYS = {
  USER: "crm_user",
  USERS: "crm_users",
  LEADS: "crm_leads",
  DEALS: "crm_deals",
  TASKS: "crm_tasks"
};

const INITIAL_USERS = [
  { id: "1", email: "admin@example.com", password: "admin123", name: "Super Admin", role: "admin" },
  { id: "2", email: "sales@example.com", password: "sales123", name: "Sales Rep", role: "sales" },
];

const INITIAL_LEADS = [
// ... (rest of initial data remains same)
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
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        const userData = await res.json();
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        setUser(userData);
        return true;
      }
    } catch (e) {
      console.error("Login error:", e);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  return { user, loading, login, logout };
};

// --- Data Context ---
const CRMContext = createContext<any>(null);

export const CRMProvider = ({ children }: { children: React.ReactNode }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ leads: 0, pipelineValue: 0, pendingTasks: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [leadsRes, dealsRes, tasksRes, usersRes, statsRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/deals"),
        fetch("/api/tasks"),
        fetch("/api/users"),
        fetch("/api/stats")
      ]);

      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (dealsRes.ok) setDeals(await dealsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addUser = async (newUser: any) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (res.ok) await fetchData();
  };

  const addLead = async (newLead: any) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLead),
    });
    if (res.ok) await fetchData();
  };

  const convertToDeal = async (leadId: string, title: string, value: number, stage: string) => {
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId, title, value, stage }),
    });
    if (res.ok) await fetchData();
  };

  const updateDealStatus = async (dealId: string, stage: 'won' | 'lost') => {
    const res = await fetch("/api/deals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: dealId, stage }),
    });
    if (res.ok) await fetchData();
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status }),
    });
    if (res.ok) await fetchData();
  };

  const addTask = async (newTask: any) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    if (res.ok) await fetchData();
  };

  const value = {
    leads, deals, tasks, users, stats, loading,
    addUser, addLead, convertToDeal, updateDealStatus, updateTaskStatus, addTask,
    refresh: fetchData
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
};

const useCRMData = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error("useCRMData must be used within a CRMProvider");
  return context;
};

// --- Components ---

const UserManagement = () => {
  const { users, addUser } = useCRMData();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "sales" });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    addUser(formData);
    setShowAdd(false);
    setFormData({ name: "", email: "", password: "", role: "sales" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage access and roles for your team.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Full Name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="px-4 py-2 border rounded-lg outline-none focus:border-black" required 
            />
            <input 
              placeholder="Email" 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="px-4 py-2 border rounded-lg outline-none focus:border-black" required 
            />
            <input 
              placeholder="Password" 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              className="px-4 py-2 border rounded-lg outline-none focus:border-black" required 
            />
            <select 
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})} 
              className="px-4 py-2 border rounded-lg outline-none focus:border-black"
            >
              <option value="sales">Sales</option>
              <option value="admin">Admin</option>
            </select>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium">Create Account</button>
              <button type="button" onClick={() => setShowAdd(false)} className="bg-zinc-100 px-4 py-2 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Name</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Email</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Role</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Password</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-600"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400 font-mono">••••••••</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Customers", value: stats.leads, trend: "+12%", icon: Users },
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
            {leads.slice(0, 5).map((lead) => {
              const displayName = lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unnamed';
              const initial = displayName[0]?.toUpperCase() || '?';
              return (
                <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                      {initial}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{displayName}</p>
                      <p className="text-xs text-zinc-500">{lead.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium px-2 py-1 bg-zinc-100 rounded-md capitalize">{lead.status}</span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600">{lead.score || 0}</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Score</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/leads" className="p-4 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-all text-left space-y-2">
              <Users className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-bold">New Customer</p>
              <p className="text-xs text-zinc-500">Add a new lead to your list</p>
            </Link>
            <Link to="/tasks" className="p-4 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-all text-left space-y-2">
              <CheckSquare className="w-5 h-5 text-purple-500" />
              <p className="text-sm font-bold">View Tasks</p>
              <p className="text-xs text-zinc-500">Check your daily to-do list</p>
            </Link>
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

const CustomersPage = () => {
  const { leads, addLead, convertToDeal } = useCRMData();
  const [showAdd, setShowAdd] = useState(false);
  const [convertingLead, setConvertingLead] = useState<any>(null);
  const [convertData, setConvertData] = useState({ title: "", value: "1000", stage: "discovery" });
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", company: "", status: "lead", score: 50 });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    addLead(formData);
    setShowAdd(false);
    setFormData({ first_name: "", last_name: "", email: "", company: "", status: "lead", score: 50 });
  };

  const handleConvertSubmit = (e: any) => {
    e.preventDefault();
    if (convertingLead) {
      convertToDeal(convertingLead.id, convertData.title, parseFloat(convertData.value), convertData.stage);
      setConvertingLead(null);
      setConvertData({ title: "", value: "1000", stage: "discovery" });
    }
  };

  const startConvert = (lead: any) => {
    setConvertingLead(lead);
    setConvertData({ 
      title: `Deal for ${lead.company}`, 
      value: "1000", 
      stage: "discovery" 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your leads and customer relationships.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="First Name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="px-4 py-2 border rounded-lg" required />
            <input placeholder="Last Name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="px-4 py-2 border rounded-lg" required />
            <input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="px-4 py-2 border rounded-lg" required />
            <input placeholder="Company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="px-4 py-2 border rounded-lg" required />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium">Save Customer</button>
              <button type="button" onClick={() => setShowAdd(false)} className="bg-zinc-100 px-4 py-2 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {convertingLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Convert to Deal</h3>
            <form onSubmit={handleConvertSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Deal Title</label>
                <input 
                  required
                  value={convertData.title}
                  onChange={e => setConvertData({...convertData, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Value ($)</label>
                <input 
                  required
                  type="number"
                  value={convertData.value}
                  onChange={e => setConvertData({...convertData, value: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Initial Stage</label>
                <select 
                  value={convertData.stage}
                  onChange={e => setConvertData({...convertData, stage: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="discovery">Discovery</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Closed Won</option>
                  <option value="lost">Closed Lost</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-black text-white px-4 py-2 rounded-lg font-medium">Convert</button>
                <button type="button" onClick={() => setConvertingLead(null)} className="flex-1 bg-zinc-100 px-4 py-2 rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Name</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Company</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {leads.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium">{lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unnamed'}</p>
                  <p className="text-xs text-zinc-400">{lead.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">{lead.company}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-zinc-100 rounded-md text-[10px] font-bold uppercase">{lead.status}</span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => startConvert(lead)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" /> Convert to Deal
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DealsPage = () => {
  const { deals, updateDealStatus } = useCRMData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground">Track your active deals and revenue.</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Deal Title</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Customer</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Value</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Stage</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {deals.map((deal: any) => (
              <tr key={deal.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{deal.title}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">{deal.customer_name || deal.lead_id || 'N/A'}</td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-600">${deal.value?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                    deal.stage === 'won' ? "bg-emerald-100 text-emerald-700" : 
                    deal.stage === 'lost' ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {deal.stage}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {deal.stage !== 'won' && deal.stage !== 'lost' && (
                    <>
                      <button onClick={() => updateDealStatus(deal.id, 'won')} className="text-[10px] font-bold text-emerald-600 hover:underline">WON</button>
                      <button onClick={() => updateDealStatus(deal.id, 'lost')} className="text-[10px] font-bold text-rose-600 hover:underline">LOST</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const { tasks, updateTaskStatus, addTask } = useCRMData();
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("due_date");
  const [sortOrder, setSortOrder] = useState("asc");

  const [formData, setFormData] = useState({
    title: "",
    priority: "medium",
    due_date: new Date().toISOString().split('T')[0]
  });

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter
    if (filterStatus !== "all") {
      result = result.filter(t => t.status === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "due_date") {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (sortBy === "priority") {
        const priorityMap: any = { high: 3, medium: 2, low: 1 };
        comparison = priorityMap[b.priority] - priorityMap[a.priority];
      } else if (sortBy === "status") {
        const statusMap: any = { todo: 1, in_progress: 2, done: 3 };
        comparison = statusMap[a.status] - statusMap[b.status];
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tasks, filterStatus, sortBy, sortOrder]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    addTask(formData);
    setShowAdd(false);
    setFormData({
      title: "",
      priority: "medium",
      due_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Stay on top of your to-do list.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Create New Task</h3>
            <button onClick={() => setShowAdd(false)} className="text-zinc-400 hover:text-black">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Task Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="What needs to be done?"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Priority</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Due Date</label>
              <input 
                type="date" 
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-black"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Sort Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 border border-zinc-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-zinc-400">Filter:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black/5"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-zinc-400">Sort By:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black/5"
          >
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
          <button 
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            <Activity className={cn("w-4 h-4 transition-transform", sortOrder === "desc" && "rotate-180")} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-zinc-100">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedTasks.length > 0 ? filteredAndSortedTasks.map((task: any) => (
              <motion.div 
                key={task.id} 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    layout
                    className={cn(
                      "w-2 h-2 rounded-full",
                      task.priority === 'high' ? "bg-rose-500" : 
                      task.priority === 'medium' ? "bg-amber-500" : "bg-blue-500"
                    )} 
                  />
                  <motion.p 
                    layout
                    className={cn("text-sm font-medium transition-all duration-500", task.status === 'done' && "line-through text-zinc-400")}
                  >
                    {task.title}
                  </motion.p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Clock className="w-3 h-3" />
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                  </div>
                  <motion.span 
                    layout
                    className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-colors duration-300",
                      task.status === 'done' ? "bg-emerald-100 text-emerald-700" : 
                      task.status === 'in_progress' ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-600"
                    )}
                  >
                    {task.status.replace('_', ' ')}
                  </motion.span>
                  {task.status !== 'done' && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateTaskStatus(task.id, 'done')}
                      className="p-1 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                      title="Mark as Done"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center text-zinc-400"
              >
                <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No tasks found matching your filters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Login onLogin={login} />;

  const isAdmin = user.role === "admin";

  return (
    <CRMProvider>
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
            {isAdmin && (
              <SidebarItem to="/admin/users" icon={Shield} label="Team" active={location.pathname === "/admin/users"} />
            )}
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
            <Route path="/leads" element={<CustomersPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/settings" element={<div className="text-3xl font-bold">Settings Page</div>} />
            {isAdmin && <Route path="/admin/users" element={<UserManagement />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
    </CRMProvider>
  );
}
