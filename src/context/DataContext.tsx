import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { supabase } from "../supabaseClient";

// ---------- Types ----------

export type Campaign = {
  id: string;
  name: string;
  status: string;
  brand?: string | null;
};

export type Task = {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  campaignId?: string | null;
};

export type Payment = {
  id: string;
  type: string;   // "Income" / "Expense"
  status: string; // "Paid" / "Pending"
  amount: number;
  date: string | null;
};

export type Job = {
  id: string;
  title: string;
  status: string;
  brand?: string | null;
};

export type Toast = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

export type User = {
  name: string;
  avatarUrl: string;
  email?: string;
  niche?: string;
  bio?: string;
  connectedAccounts?: {
    instagram?: boolean;
    tiktok?: boolean;
    youtube?: boolean;
    twitter?: boolean;
  };
};

type DataContextValue = {
  // core data
  campaigns: Campaign[];
  tasks: Task[];
  payments: Payment[];
  jobs: Job[];
  loading: boolean;
  error: string | null;

  // layout / UI state
  user: User;
  updateUser: (patch: Partial<User>) => void;

  theme: "light" | "dark";
  toggleTheme: () => void;

  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  showToast: (message: string, type?: Toast["type"]) => void;

  // extra “app data” the pages expect
  mediaKit: any;
  updateMediaKit: (patch: any) => void;

  scriptsHistory: any[];
  addScriptToHistory: (item: any) => void;

  team: any[];
  teamResources: any[];
  threads: any[];

  // actions used around the app (many are stubs for now)
  addCampaign: (campaign: any) => void;
  addTasks: (tasks: any[]) => void;
  updateCampaign: (id: string, patch: any) => void;

  addJob: (job: any) => void;
  updateJob: (id: string, patch: any) => void;
  deleteJob: (id: string) => void;
  updateJobStatus: (id: string, status: string) => void;

  addTask: (task: any) => void;
  updateTask: (id: string, patch: any) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: string) => void;

  addPayment: (payment: any) => void;
  updatePayment: (id: string, patch: any) => void;
  deletePayment: (id: string) => void;

  // comms + team
  sendMessage: (threadId: any, message: any) => void;
  markThreadRead: (threadId: any) => void;
  archiveThread: (threadId: any) => void;
  unarchiveThread: (threadId: any) => void;
  createThread: (thread: any) => void;

  addTeamMember: (member: any) => void;
  updateTeamMember: (id: any, patch: any) => void;
  removeTeamMember: (id: any) => void;
  addTeamResource: (resource: any) => void;
  removeTeamResource: (id: any) => void;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

// ---------- Provider ----------

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // core data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // user & theme
  const [user, setUser] = useState<User>({
    name: "Creator",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Creator&background=8B5CF6&color=ffffff",
    email: "creator@example.com",
    niche: "Content Creator",
    bio: "",
    connectedAccounts: {
      instagram: false,
      tiktok: false,
      youtube: false,
      twitter: false,
    },
  });

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...patch }));
  };

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (message: string, type: Toast["type"] = "info") => {
    addToast({ type, message });
  };

  // extra app data
  const [mediaKit, setMediaKit] = useState<any | null>(null);
  const [scriptsHistory, setScriptsHistory] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [teamResources, setTeamResources] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);

  const updateMediaKit = (patch: any) => {
    setMediaKit((prev: any) => ({ ...(prev || {}), ...patch }));
  };

  const addScriptToHistory = (item: any) => {
    setScriptsHistory((prev) => [item, ...prev]);
  };

  // ---------- Supabase Loading ----------

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // 1) Brands (for lookups)
        const { data: brandsData, error: brandsError } = await supabase
          .from("brands")
          .select("id, name");

        if (brandsError) throw brandsError;

        const findBrandName = (brandId: string | null | undefined) => {
          if (!brandId || !brandsData) return null;
          const match = (brandsData as any[]).find((b: any) => b.id === brandId);
          return match?.name ?? null;
        };

        // 2) Outreach -> campaigns
        const { data: outreachData, error: outreachError } = await supabase
          .from("outreach")
          .select(
            "id, status, brand_id, deliverables_summary, rate_offered, currency"
          );

        if (outreachError) throw outreachError;

        const mappedCampaigns: Campaign[] =
          (outreachData ?? []).map((o: any) => ({
            id: o.id,
            name:
              findBrandName(o.brand_id) ||
              o.deliverables_summary ||
              "Unnamed Campaign",
            status: o.status ?? "Not Started",
            brand: findBrandName(o.brand_id),
          })) ?? [];

        setCampaigns(mappedCampaigns);

        // 3) Posts -> tasks (content planner)
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("id, title, idea, status, scheduled_date");

        if (postsError) throw postsError;

        const mappedTasks: Task[] =
          (postsData ?? []).map((p: any) => ({
            id: p.id,
            title: p.title || p.idea || "Untitled Content",
            status: p.status ?? "Idea",
            dueDate: p.scheduled_date ?? null,
            campaignId: null,
          })) ?? [];

        setTasks(mappedTasks);

        // 4) Income -> payments
        const { data: incomeData, error: incomeError } = await supabase
          .from("income")
          .select("id, amount, currency, category, source_name, date");

        if (incomeError) throw incomeError;

        const mappedPayments: Payment[] =
          (incomeData ?? []).map((i: any) => ({
            id: i.id,
            type: "Income",
            status: "Paid",
            amount: Number(i.amount ?? 0),
            date: i.date ?? null,
          })) ?? [];

        setPayments(mappedPayments);

        // 5) UGC jobs -> jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from("ugc_jobs")
          .select("id, concept, status, brand_id");

        if (jobsError) throw jobsError;

        const mappedJobs: Job[] =
          (jobsData ?? []).map((j: any) => ({
            id: j.id,
            title: j.concept || "Untitled UGC Job",
            status: j.status ?? "Applied",
            brand: findBrandName(j.brand_id),
          })) ?? [];

        setJobs(mappedJobs);
      } catch (err: any) {
        console.error("Error loading data from Supabase:", err?.message || err);
        setError(err?.message ?? "Failed to load data");
        showToast("Failed to load dashboard data from Supabase.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []); // run once on mount

  // ---------- in-memory actions (basic) ----------

  // these are intentionally simple; later you can wire them to Supabase mutations

  const addCampaign = (campaign: any) => {
    setCampaigns((prev) => [...prev, campaign]);
  };

  const addTasks = (newTasks: any[]) => {
    setTasks((prev) => [...prev, ...newTasks]);
  };

  const updateCampaign = (id: string, patch: any) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const addJob = (job: any) => {
    setJobs((prev) => [...prev, job]);
  };

  const updateJob = (id: string, patch: any) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...patch } : j))
    );
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const updateJobStatus = (id: string, status: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status } : j))
    );
  };

  const addTask = (task: any) => {
    setTasks((prev) => [...prev, task]);
  };

  const updateTask = (id: string, patch: any) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskStatus = (id: string, status: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const addPayment = (payment: any) => {
    setPayments((prev) => [...prev, payment]);
  };

  const updatePayment = (id: string, patch: any) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // team + comms

  const addTeamMember = (member: any) => {
    setTeam((prev) => [...prev, member]);
  };

  const updateTeamMember = (id: any, patch: any) => {
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  const removeTeamMember = (id: any) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  };

  const addTeamResource = (resource: any) => {
    setTeamResources((prev) => [...prev, resource]);
  };

  const removeTeamResource = (id: any) => {
    setTeamResources((prev) => prev.filter((r) => r.id !== id));
  };

  const createThread = (thread: any) => {
    setThreads((prev) => [thread, ...prev]);
  };

  const sendMessage = (threadId: any, message: any) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, messages: [...(t.messages || []), message] }
          : t
      )
    );
  };

  const markThreadRead = (threadId: any) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, unread: false } : t
      )
    );
  };

  const archiveThread = (threadId: any) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, archived: true } : t
      )
    );
  };

  const unarchiveThread = (threadId: any) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, archived: false } : t
      )
    );
  };

  // ---------- value ----------

  const value: DataContextValue = {
    campaigns,
    tasks,
    payments,
    jobs,
    loading,
    error,

    user,
    updateUser,

    theme,
    toggleTheme,

    toasts,
    addToast,
    removeToast,
    showToast,

    mediaKit,
    updateMediaKit,

    scriptsHistory,
    addScriptToHistory,

    team,
    teamResources,
    threads,

    addCampaign,
    addTasks,
    updateCampaign,

    addJob,
    updateJob,
    deleteJob,
    updateJobStatus,

    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,

    addPayment,
    updatePayment,
    deletePayment,

    sendMessage,
    markThreadRead,
    archiveThread,
    unarchiveThread,
    createThread,

    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    addTeamResource,
    removeTeamResource,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// ---------- Hook ----------

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
};
