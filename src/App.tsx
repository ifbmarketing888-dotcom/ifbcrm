import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Settings, 
  Menu,
  Bell,
  Search
} from "lucide-react";
import { useState } from "react";
import { cn } from "./lib/utils";

// Pages (Placeholder components for now)
const Dashboard = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
      </div>
      <div className="flex gap-2">
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          Add Lead
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: "Active Leads", value: "128", trend: "+12%", icon: Users },
        { label: "Pipeline Value", value: "$45,200", trend: "+5.4%", icon: Briefcase },
        { label: "Tasks Due", value: "8", trend: "-2", icon: CheckSquare },
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

    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-bottom border-zinc-100 flex justify-between items-center">
        <h3 className="font-semibold">Recent Leads</h3>
        <Link to="/leads" className="text-sm text-zinc-500 hover:text-black">View all</Link>
      </div>
      <div className="divide-y divide-zinc-100">
        {[
          { name: "Alex Rivera", company: "Stellar Tech", status: "New", score: 85 },
          { name: "Sarah Chen", company: "Nexus Labs", status: "Contacted", score: 92 },
          { name: "Marcus Thorne", company: "Vanguard", status: "Qualified", score: 78 },
        ].map((lead) => (
          <div key={lead.name} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                {lead.name[0]}
              </div>
              <div>
                <p className="font-medium text-sm">{lead.name}</p>
                <p className="text-xs text-zinc-500">{lead.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium px-2 py-1 bg-zinc-100 rounded-md">{lead.status}</span>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600">{lead.score}</p>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Score</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Leads = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
    <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
      <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium">No leads found</h3>
      <p className="text-zinc-500 max-w-xs mx-auto mt-2">Start by adding your first lead or connecting a webhook source.</p>
    </div>
  </div>
);

const Deals = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold tracking-tight">Sales Funnel</h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {['Discovery', 'Proposal', 'Negotiation', 'Closed'].map(stage => (
        <div key={stage} className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">{stage}</h3>
            <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">0</span>
          </div>
          <div className="bg-zinc-50/50 border border-dashed border-zinc-200 rounded-xl h-64 flex items-center justify-center">
            <p className="text-xs text-zinc-400 italic">Empty</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
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
              <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={window.location.pathname === "/"} />
              <SidebarItem to="/leads" icon={Users} label="Leads" active={window.location.pathname === "/leads"} />
              <SidebarItem to="/deals" icon={Briefcase} label="Deals" active={window.location.pathname === "/deals"} />
              <SidebarItem to="/tasks" icon={CheckSquare} label="Tasks" active={window.location.pathname === "/tasks"} />
            </nav>

            <div className="pt-6 border-t border-zinc-100">
              <SidebarItem to="/settings" icon={Settings} label="Settings" active={window.location.pathname === "/settings"} />
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
              <Route path="/leads" element={<Leads />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/tasks" element={<div className="text-3xl font-bold">Tasks Page</div>} />
              <Route path="/settings" element={<div className="text-3xl font-bold">Settings Page</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
