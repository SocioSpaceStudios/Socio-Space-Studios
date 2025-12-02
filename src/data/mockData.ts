
import type { Campaign, Task, Payment, User, Job, TeamMember, MediaKit, Thread, TeamResource } from '../types';

export const mockUser: User = {
  id: 'u1',
  name: 'Alex Creator',
  email: 'alex@socioflow.com',
  avatarUrl: 'https://picsum.photos/id/64/100/100',
  niche: 'Lifestyle & Tech',
  bio: 'Creating content that inspires and educates.',
  plan: 'Pro',
  connectedAccounts: {
    instagram: true,
    tiktok: false,
    youtube: true,
    twitter: false
  }
};

export const initialCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Summer Vibes 2024',
    brand: 'GlowUp Beauty',
    status: 'Active',
    primaryDueDate: '2024-06-15',
    notes: 'Focus on hydration products.',
    rate: 1500,
    contacts: [
      { id: 'ct1', name: 'Sarah Jenkins', role: 'Marketing Manager', email: 'sarah@glowup.com' }
    ],
    interactions: [
      { id: 'i1', date: '2024-05-10', type: 'Email', summary: 'Sent initial proposal with rate card.' },
      { id: 'i2', date: '2024-05-15', type: 'Meeting', summary: 'Zoom call to discuss deliverables. Agreed on 1 Reel + 3 Stories.' }
    ]
  },
  {
    id: 'c2',
    name: 'Tech Review Series',
    brand: 'NextGen Gadgets',
    status: 'Planned',
    primaryDueDate: '2024-07-01',
    notes: '3 videos required.',
    rate: 3200,
    contacts: [
      { id: 'ct2', name: 'Mike Chen', role: 'PR Lead', email: 'mike@nextgen.tech' }
    ],
    interactions: [
      { id: 'i3', date: '2024-05-20', type: 'Email', summary: 'Product shipped to studio.' }
    ]
  },
  {
    id: 'c3',
    name: 'Fitness Challenge',
    brand: 'FitLife',
    status: 'Completed',
    primaryDueDate: '2024-05-20',
    notes: 'Resounding success.',
    rate: 800,
    contacts: [],
    interactions: []
  },
];

export const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Script Draft',
    dueDate: '2024-06-01',
    campaignId: 'c1',
    status: 'Completed',
    notes: 'Sent for approval',
    platform: 'YouTube'
  },
  {
    id: 't2',
    title: 'Filming Day',
    dueDate: new Date().toISOString().split('T')[0], // Today
    campaignId: 'c1',
    status: 'In Progress',
    notes: 'Studio booked',
    platform: 'Instagram'
  },
  {
    id: 't3',
    title: 'Post-Production',
    dueDate: '2024-06-10',
    campaignId: 'c1',
    status: 'Scheduled',
    notes: 'Need music license',
    platform: 'YouTube'
  },
  {
    id: 't4',
    title: 'Unboxing Video',
    dueDate: '2024-06-25',
    campaignId: 'c2',
    status: 'To Do',
    notes: 'Wait for package',
    platform: 'TikTok'
  },
];

export const initialPayments: Payment[] = [
  {
    id: 'p1',
    brand: 'GlowUp Beauty',
    amount: 1500,
    status: 'Unpaid',
    type: 'Income',
    category: 'Sponsorship',
    dueDate: '2024-06-30',
    notes: 'Invoice #1001 sent',
  },
  {
    id: 'p2',
    brand: 'FitLife',
    amount: 800,
    status: 'Paid',
    type: 'Income',
    category: 'UGC',
    dueDate: '2024-05-25',
    notes: 'Received via PayPal',
  },
  {
    id: 'p3',
    brand: 'Adobe CC Subscription',
    amount: 54,
    status: 'Paid',
    type: 'Expense',
    category: 'Software',
    dueDate: '2024-05-01',
    notes: 'Monthly sub',
  },
  {
    id: 'p4',
    brand: 'Camera Lens',
    amount: 850,
    status: 'Paid',
    type: 'Expense',
    category: 'Equipment',
    dueDate: '2024-04-15',
    notes: 'Sigma 24-70mm',
  },
  {
    id: 'p5',
    brand: 'TechStart',
    amount: 2500,
    status: 'Paid',
    type: 'Income',
    category: 'Sponsorship',
    dueDate: '2024-04-20',
    notes: 'Q2 Campaign',
  }
];

export const initialJobs: Job[] = [
  { 
    id: 'j1', 
    client: 'Evie Lo Co', 
    niche: 'Family', 
    rate: 100, 
    dueDate: '2024-11-25', 
    status: 'Applied',
    platform: 'Instagram',
    productStatus: 'Not Ordered',
    deliverables: '1 Reel, 3 Photos'
  },
  { 
    id: 'j2', 
    client: 'TechStart', 
    niche: 'Tech', 
    rate: 250, 
    dueDate: '2024-12-01', 
    status: 'Accepted',
    platform: 'TikTok',
    productStatus: 'Shipped',
    trackingNumber: 'TRK123456789',
    deliverables: '1 Unboxing Video'
  }
];

export const initialTeam: TeamMember[] = [
  { id: 'tm1', name: 'Chanel', email: 'chanel@example.com', role: 'Editor', status: 'Invited', avatarColor: 'from-pink-400 to-purple-500' }
];

export const initialResources: TeamResource[] = [
  { id: 'r1', name: 'Brand Guidelines 2024', type: 'PDF', url: '#', uploadedBy: 'Alex Creator', uploadDate: '2024-01-10', size: '2.4 MB', parentId: null },
  { id: 'r2', name: 'Contracts', type: 'Folder', uploadedBy: 'Alex Creator', uploadDate: '2024-02-01', isFolder: true, parentId: null },
  { id: 'r3', name: 'Raw Footage - Vlog #45', type: 'Link', url: '#', uploadedBy: 'Chanel', uploadDate: '2024-05-20', parentId: null },
  // Nested File
  { id: 'r4', name: 'Standard Sponsorship Agreement', type: 'Doc', url: '#', uploadedBy: 'Alex Creator', uploadDate: '2024-02-15', size: '150 KB', parentId: 'r2' }
];

export const initialMediaKit: MediaKit = {
  displayName: mockUser.name,
  handle: '@alexcreator',
  niche: mockUser.niche || 'Lifestyle',
  bio: mockUser.bio || 'Creating content that inspires.',
  email: mockUser.email,
  primaryColor: '#8B5CF6',
  secondaryColor: '#EC4899',
  socialStats: [
    { id: 's1', platform: 'TikTok', handle: '@alexcreator', value: '150K', label: 'Followers' },
    { id: 's2', platform: 'Instagram', handle: '@alex.inst', value: '45K', label: 'Followers' },
    { id: 's3', platform: 'YouTube', handle: 'Alex Creator', value: '12K', label: 'Subscribers' },
    { id: 's4', platform: 'Other', handle: 'Engagement', value: '4.5%', label: 'Avg. Rate' },
  ]
};

export const initialThreads: Thread[] = [
  {
    id: 'th1',
    type: 'email',
    participants: ['Sarah Jenkins (GlowUp)'],
    subject: 'Re: Summer Vibes Campaign - Contract',
    preview: 'Hi Alex, attached is the updated contract for the Reel...',
    updatedAt: '10:30 AM',
    unreadCount: 1,
    isArchived: false,
    linkedCampaignId: 'c1',
    messages: [
      { id: 'm1', senderId: 's1', senderName: 'Sarah Jenkins', content: 'Hi Alex, attached is the updated contract for the Reel. Please review when you can.', timestamp: '10:30 AM', isMe: false, avatar: 'S' }
    ]
  },
  {
    id: 'th2',
    type: 'email',
    participants: ['Mike Chen'],
    subject: 'Collaboration Inquiry: Tech Review',
    preview: 'We loved your last video and want to discuss a partnership...',
    updatedAt: 'Yesterday',
    unreadCount: 0,
    isArchived: false,
    linkedCampaignId: 'c2',
    messages: [
      { id: 'm2', senderId: 'm1', senderName: 'Mike Chen', content: 'We loved your last video and want to discuss a partnership for our new headset.', timestamp: 'Yesterday', isMe: false, avatar: 'M' },
      { id: 'm3', senderId: 'u1', senderName: 'Alex Creator', content: 'Hi Mike, thanks for reaching out! I would love to hear more details.', timestamp: 'Yesterday', isMe: true, avatar: 'A' }
    ]
  },
  {
    id: 'th3',
    type: 'chat',
    participants: ['Chanel (Editor)'],
    preview: 'Just finished the rough cut!',
    updatedAt: '5 min ago',
    unreadCount: 2,
    isArchived: false,
    messages: [
      { id: 'm4', senderId: 'tm1', senderName: 'Chanel', content: 'Just finished the rough cut! Let me know what you think.', timestamp: '11:45 AM', isMe: false, avatar: 'C' }
    ]
  }
];
