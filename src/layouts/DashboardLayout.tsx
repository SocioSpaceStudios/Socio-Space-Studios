// src/layouts/DashboardLayout.tsx
import React, { useState } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ShoppingBag,
  Sparkles,
  Briefcase,
  TrendingUp,
  Image,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  FileText,
  Bot,
} from "lucide-react";
import { useData } from "../context/DataContext";

const DashboardLayout: React.FC = () => {
  const data = useData();

  const {
    user,
    theme,
    toggleTheme,
    toasts,
    removeToast,
  } = data || ({} as any);

  const safeUser = user || {
    name: "Creator",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Creator&background=8B5CF6&color=ffffff",
  };

  const safeTheme: "light" | "dark" = theme || "light";
  const safeToasts = toasts || [];
  const safeRemoveToast = removeToast || (() => {});

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const navGroups = [
    {
      label: "HOME / OVERVIEW",
      items: [{ to: "/", icon: LayoutDashboard, label: "Dashboard" }],
    },
    {
      label: "PLAN & CREATE",
      items: [
        { to: "/content-planner", icon: CalendarDays, label: "Content Planner" },
        { to: "/scripts", icon: Sparkles, label: "Scripts & Hooks" },
        { to: "/templates", icon: FileText, label: "Templates Library" },
        { to: "/media-kit", icon: Image, label: "Media Kit" },
      ],
    },
    {
      label: "PIPELINE & CLIENT WORK",
      items: [
        { to: "/brand-outreach", icon: ShoppingBag, label: "Brand Outreach" },
        { to: "/ugc-jobs", icon: Briefcase, label: "UGC Jobs" },
        { to: "/communications", icon: MessageSquare, label: "Communications" },
        { to: "/ai-assist", icon: Bot, label: "AI Assist" },
      ],
    },
    {
      label: "OPERATIONS",
      items: [
        { to: "/finance", icon: TrendingUp, label: "Finance" },
        { to: "/team", icon: Users, label: "Team" },
      ],
    },
    {
      label: "SYSTEM",
      items: [{ to: "/settings", icon: Settings, label: "Settings" }],
    },
  ];

  const getPageTitle = () => {
    if (location.pathname === "/") return "Welcome back, Creator!";
    if (location.pathname === "/profile") return "My Profile";

    const allItems = navGroups.flatMap((g) => g.items);
    const current = allItems.find((item) => item.to === location.pathname);
    return current ? current.label : "Socio Space";
  };

  const getPageSubtitle = () => {
    switch (location.pathname) {
      case "/":
        return "Here's your creator dashboard overview";
      case "/profile":
        return "Your professional summary and activity log";
      case "/content-planner":
        return "Plan and organize your content calendar";
      case "/brand-outreach":
        return "Track your brand partnerships and pitches";
      case "/scripts":
        return "AI-powered content ideas tailored to your niche";
      case "/ugc-jobs":
        return "Manage your user-generated content projects";
      case "/finance":
        return "Advanced financial analytics and management";
      case "/media-kit":
        return "Create your professional media kit for brand pitches";
      case "/communications":
        return "Manage team and brand messages";
      case "/team":
        return "Invite collaborators and manage permissions";
      case "/settings":
        return "Manage your account preferences";
      case "/templates":
        return "Store and reuse outreach, caption, and workflow templates";
      case "/ai-assist":
        return "Use AI helpers to generate hooks, scripts, pitches, and content ideas";
      default:
        return "";
    }
  };

  return (
    <div className="flex h-screen bg-background text-textMain overflow-hidden font-sans transition-colors duration-300 relative">
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-2rem)]">
        {safeToasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-lg shadow-xl border animate-in slide-in-from-right-10 fade-in duration-300 min-w-[280px] md:min-w-[300px]
              ${
                toast.type === "success"
                  ? "bg-surface border-green-500 text-textMain"
                  : toast.type === "error"
                  ? "bg-surface border-red-500 text-textMain"
                  : "bg-surface border-blue-500 text-textMain"
              }`}
          >
            {toast.type === "success" && (
              <CheckCircle2
                className="text-green-500 flex-shrink-0"
                size={20}
              />
            )}
            {toast.type === "error" && (
              <AlertCircle
                className="text-red-500 flex-shrink-0"
                size={20}
              />
            )}
            {toast.type === "info" && (
              <Info className="text-blue-500 flex-shrink-0" size={20} />
            )}

            <p className="text-sm font-medium flex-1">{toast.message}</p>

            <button
              onClick={() => safeRemoveToast(toast.id)}
              className="text-textMuted hover:text-textMain"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 
        bg-gradient-to-b from-[#8B5CF6] to-[#EC4899] 
        text-white
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        flex flex-col shadow-2xl lg:shadow-none
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-6 flex justify-between items-center lg:block">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Socio Space</h1>
            <p className="text-white/70 text-sm">Creator Command Center</p>
          </div>
          <button
            onClick={toggleMenu}
            className="lg:hidden text-white/80 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar pb-4">
          {navGroups.map((group, index) => (
            <div key={index}>
              {group.label && (
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 px-4">
                  {group.label}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                        isActive
                          ? "bg-white text-primary shadow-md"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <item.icon
                      className={`w-4 h-4 mr-3 ${
                        location.pathname === item.to
                          ? "text-primary"
                          : "text-white"
                      }`}
                    />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 w-full rounded-lg transition-colors text-sm font-medium">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="flex items-center justify-between h-16 md:h-auto md:min-h-[5rem] py-2 md:py-4 px-4 md:px-10 bg-background print:hidden border-b border-borderColor lg:border-none">
          <div className="flex items-center lg:hidden">
            <button
              onClick={toggleMenu}
              className="text-textMuted hover:text-textMain mr-3 p-1"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg text-textMain truncate">
              Socio Space
            </span>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-3xl font-bold text-textMain">
              {getPageTitle()}
            </h2>
            <p className="text-textMuted mt-1">{getPageSubtitle()}</p>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-textMuted hover:bg-surfaceLight hover:text-textMain transition-colors border border-transparent hover:border-borderColor"
            >
              {safeTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link
              to="/profile"
              className="flex items-center space-x-3 pl-2 md:pl-4 border-l border-borderColor hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-textMain">
                  {safeUser.name}
                </p>
                <p className="text-xs text-textMuted">Pro Plan</p>
              </div>
              <img
                src={safeUser.avatarUrl}
                alt="User"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-surface shadow-sm object-cover"
              />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-10 pb-10 scroll-smooth bg-background">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
