
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Campaign, Task, Payment, User, Job, TeamMember, JobStatus, ScriptHistoryItem, MediaKit, Thread, Attachment, TeamResource, Toast } from '../types';
import { initialCampaigns, initialTasks, initialPayments, mockUser, initialJobs, initialTeam, initialMediaKit, initialThreads, initialResources } from '../data/mockData';

type Theme = 'light' | 'dark';

interface DataContextType {
  user: User;
  campaigns: Campaign[];
  tasks: Task[];
  payments: Payment[];
  jobs: Job[];
  team: TeamMember[];
  teamResources: TeamResource[];
  scriptsHistory: ScriptHistoryItem[];
  mediaKit: MediaKit;
  threads: Thread[];
  theme: Theme;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  toggleTheme: () => void;
  updateUser: (user: Partial<User>) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (campaign: Campaign) => void;
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  deleteJob: (id: string) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (member: TeamMember) => void;
  removeTeamMember: (id: string) => void;
  addTeamResource: (resource: TeamResource) => void;
  removeTeamResource: (id: string) => void;
  addScriptToHistory: (script: ScriptHistoryItem) => void;
  updateMediaKit: (kit: MediaKit) => void;
  sendMessage: (threadId: string, content: string, attachments?: Attachment[]) => void;
  createThread: (participants: string[], type: 'email' | 'chat', subject?: string) => void;
  archiveThread: (threadId: string) => void;
  unarchiveThread: (threadId: string) => void;
  markThreadRead: (threadId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(mockUser);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [teamResources, setTeamResources] = useState<TeamResource[]>(initialResources);
  const [scriptsHistory, setScriptsHistory] = useState<ScriptHistoryItem[]>([]);
  const [mediaKit, setMediaKit] = useState<MediaKit>(initialMediaKit);
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Theme State - Default to LIGHT
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('socioflow-theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('socioflow-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const addCampaign = (campaign: Campaign) => {
    setCampaigns((prev) => [...prev, campaign]);
    showToast(`Campaign "${campaign.name}" created!`);
  };

  const updateCampaign = (updatedCampaign: Campaign) => {
    setCampaigns((prev) => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
    showToast('Campaign updated successfully');
  };

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
    showToast('Task added to calendar');
  };

  const addTasks = (newTasks: Task[]) => {
    setTasks((prev) => [...prev, ...newTasks]);
    showToast(`${newTasks.length} tasks added`);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    showToast('Task updated');
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter(t => t.id !== taskId));
    showToast('Task deleted', 'info');
  };

  const addPayment = (payment: Payment) => {
    setPayments((prev) => [...prev, payment]);
    showToast('Transaction recorded');
  };

  const updatePayment = (updatedPayment: Payment) => {
    setPayments((prev) => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
    showToast('Transaction updated');
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter(p => p.id !== id));
    showToast('Transaction deleted', 'info');
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const addJob = (job: Job) => {
    setJobs(prev => [...prev, job]);
    showToast('Job created successfully');
  };

  const updateJob = (updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    showToast('Job updated');
  }

  const updateJobStatus = (id: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    showToast('Job deleted', 'info');
  };

  const addTeamMember = (member: TeamMember) => {
    setTeam(prev => [...prev, member]);
    showToast(`Invite sent to ${member.email}`);
  };

  const updateTeamMember = (member: TeamMember) => {
    setTeam(prev => prev.map(m => m.id === member.id ? member : m));
    showToast('Team member permissions updated');
  };

  const removeTeamMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    showToast('Team member removed', 'info');
  };

  const addTeamResource = (resource: TeamResource) => {
    setTeamResources(prev => [resource, ...prev]);
    showToast(`${resource.isFolder ? 'Folder' : 'File'} added successfully`);
  };

  const removeTeamResource = (id: string) => {
    setTeamResources(prev => prev.filter(r => r.id !== id));
    showToast('Item deleted', 'info');
  };

  const addScriptToHistory = (script: ScriptHistoryItem) => {
    setScriptsHistory(prev => [script, ...prev]);
  };

  const updateMediaKit = (kit: MediaKit) => {
    setMediaKit(kit);
    showToast('Media Kit saved successfully');
  };

  const sendMessage = (threadId: string, content: string, attachments?: Attachment[]) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          preview: content || (attachments ? `Sent an attachment` : ''),
          updatedAt: 'Just now',
          messages: [...t.messages, {
            id: Date.now().toString(),
            senderId: user.id,
            senderName: user.name,
            content: content,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            isMe: true,
            avatar: user.avatarUrl,
            attachments: attachments
          }]
        };
      }
      return t;
    }));
  };

  const createThread = (participants: string[], type: 'email' | 'chat', subject?: string) => {
    const newThread: Thread = {
      id: Date.now().toString(),
      type,
      participants,
      subject,
      preview: 'New conversation started',
      updatedAt: 'Just now',
      unreadCount: 0,
      isArchived: false,
      messages: []
    };
    setThreads(prev => [newThread, ...prev]);
    showToast('New conversation started');
  };

  const archiveThread = (threadId: string) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isArchived: true } : t));
    showToast('Thread archived');
  };

  const unarchiveThread = (threadId: string) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isArchived: false } : t));
    showToast('Thread unarchived');
  };

  const markThreadRead = (threadId: string) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t));
  };

  return (
    <DataContext.Provider value={{ 
      user, 
      campaigns, 
      tasks, 
      payments, 
      jobs,
      team,
      teamResources,
      scriptsHistory,
      mediaKit,
      threads,
      theme,
      toasts,
      showToast,
      removeToast,
      toggleTheme,
      updateUser,
      addCampaign, 
      updateCampaign,
      addTask, 
      addTasks, 
      updateTask,
      deleteTask,
      addPayment, 
      updatePayment,
      deletePayment,
      updateTaskStatus,
      addJob,
      updateJob,
      updateJobStatus,
      deleteJob,
      addTeamMember,
      updateTeamMember,
      removeTeamMember,
      addTeamResource,
      removeTeamResource,
      addScriptToHistory,
      updateMediaKit,
      sendMessage,
      createThread,
      archiveThread,
      unarchiveThread,
      markThreadRead
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
