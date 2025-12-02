
export type Status = 'Planned' | 'Active' | 'Completed';
export type TaskStatus = 'To Do' | 'In Progress' | 'Scheduled' | 'Completed';
export type PaymentStatus = 'Paid' | 'Unpaid';
export type PaymentType = 'Income' | 'Expense';
export type JobStatus = 'Applied' | 'Accepted' | 'Filming' | 'Editing';
export type ProductStatus = 'Not Ordered' | 'Ordered' | 'Shipped' | 'Received';
export type TeamRole = 'Editor' | 'Viewer' | 'Admin' | 'Manager' | 'Agent';
export type SocialPlatform = 'Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'Twitter' | 'Website' | 'Other';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface Interaction {
  id: string;
  date: string;
  type: 'Email' | 'Call' | 'Meeting' | 'Note';
  summary: string;
}

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  status: Status;
  primaryDueDate: string;
  notes: string;
  rate?: number; // Deal value
  contacts?: Contact[];
  interactions?: Interaction[];
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  campaignId: string;
  status: TaskStatus;
  notes: string;
  // New Social Media Fields
  platform?: SocialPlatform;
  caption?: string;
  hashtags?: string;
  image?: string; // URL
}

export interface Payment {
  id: string;
  brand: string;
  amount: number;
  status: PaymentStatus;
  type: PaymentType;
  category: string; // e.g. 'Sponsorship', 'AdSense', 'Software', 'Equipment'
  dueDate: string;
  notes: string;
}

export interface Job {
  id: string;
  client: string;
  niche: string;
  rate: number;
  dueDate: string;
  status: JobStatus;
  platform?: SocialPlatform;
  deliverables?: string;
  productStatus?: ProductStatus;
  trackingNumber?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: 'Invited' | 'Active' | 'Suspended';
  avatarColor: string;
}

export interface TeamResource {
  id: string;
  name: string;
  type: 'PDF' | 'Link' | 'Image' | 'Doc' | 'Folder';
  url?: string;
  uploadedBy: string;
  uploadDate: string;
  size?: string;
  parentId?: string | null; // For nesting
  isFolder?: boolean;
}

export interface ConnectedAccounts {
  instagram: boolean;
  tiktok: boolean;
  youtube: boolean;
  twitter: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  niche?: string;
  bio?: string;
  plan?: 'Free' | 'Pro' | 'Business';
  connectedAccounts?: ConnectedAccounts;
}

export interface ScriptHistoryItem {
  id: string;
  date: string;
  topic: string;
  niche: string;
  tone: string;
  content: string;
  mode: 'Standard' | 'Profile' | 'Random';
}

export interface SocialStat {
  id: string;
  platform: SocialPlatform;
  handle: string;
  value: string; // e.g. "1.2M"
  label: string; // e.g. "Followers"
}

export interface MediaKit {
  displayName: string;
  handle: string;
  niche: string;
  bio: string;
  email: string;
  avatarUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  socialStats: SocialStat[];
}

// Communications Types
export interface Attachment {
  name: string;
  type: 'image' | 'file';
  url?: string;
}

export interface ThreadMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  avatar?: string;
  attachments?: Attachment[];
}

export interface Thread {
  id: string;
  type: 'email' | 'chat';
  participants: string[]; // Names or Emails
  subject?: string; // For emails
  preview: string;
  updatedAt: string;
  unreadCount: number;
  isArchived: boolean;
  messages: ThreadMessage[];
  linkedCampaignId?: string; // Connects to Campaign for context
}
