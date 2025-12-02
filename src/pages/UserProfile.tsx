
import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { 
  FileDown, 
  Edit2, 
  Briefcase, 
  CalendarDays, 
  TrendingUp, 
  CheckCircle2, 
  ExternalLink,
  Instagram,
  Youtube,
  Video
} from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, campaigns, tasks, payments, mediaKit } = useData();
  
  // Calculate activity window
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // --- Filtered Data (Last 30 Days) ---
  const recentCampaigns = useMemo(() => 
    campaigns
      .filter(c => new Date(c.primaryDueDate) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.primaryDueDate).getTime() - new Date(a.primaryDueDate).getTime())
      .slice(0, 5)
  , [campaigns]);

  const recentTasks = useMemo(() => 
    tasks
      .filter(t => t.status === 'Completed' && new Date(t.dueDate) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .slice(0, 5)
  , [tasks]);

  const recentPayments = useMemo(() => 
    payments
      .filter(p => new Date(p.dueDate) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
  , [payments]);

  // --- Stats Calculations ---
  const earningsLast30 = recentPayments
    .filter(p => p.type === 'Income' && p.status === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);
  
  const expensesLast30 = recentPayments
    .filter(p => p.type === 'Expense' && p.status === 'Paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const netProfitLast30 = earningsLast30 - expensesLast30;

  const totalCompletedTasks = recentTasks.length;
  const activeCampaignsCount = campaigns.filter(c => c.status === 'Active').length;

  const handleExport = () => {
    window.print();
  };

  const getPlatformIcon = (platform: string) => {
      switch(platform) {
          case 'Instagram': return <Instagram size={16} className="text-pink-500" />;
          case 'YouTube': return <Youtube size={16} className="text-red-500" />;
          case 'TikTok': return <Video size={16} className="text-black dark:text-white" />;
          default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
      }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Hero Header */}
      <div className="relative bg-surface border border-borderColor rounded-2xl overflow-hidden shadow-sm">
        {/* Background Banner */}
        <div className="h-32 bg-gradient-to-r from-primary to-accent opacity-90"></div>
        
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-center gap-6 -mt-12 relative z-10">
           <div className="w-24 h-24 rounded-full border-4 border-surface bg-white shadow-md overflow-hidden flex-shrink-0">
             <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
           </div>
           
           <div className="flex-1 mb-2">
              <h1 className="text-3xl font-bold text-textMain">{user.name}</h1>
              <p className="text-textMuted flex items-center gap-2">
                 {user.niche} Creator • {user.email}
              </p>
           </div>

           <div className="flex gap-3 mb-2 print:hidden">
              <Link 
                to="/settings?tab=profile" 
                className="px-4 py-2 bg-surfaceLight border border-borderColor rounded-lg text-sm font-medium text-textMain hover:bg-surface hover:border-primary transition-colors flex items-center gap-2"
              >
                <Edit2 size={16} /> Edit Profile
              </Link>
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primaryHover transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <FileDown size={16} /> Export Summary
              </button>
           </div>
        </div>

        <div className="px-8 pb-8 pt-2">
           <p className="text-textMain/80 leading-relaxed max-w-3xl">
              {user.bio || "No bio added yet. Go to settings to add your creator bio."}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Main Column */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Activity */}
            <div className="bg-surface border border-borderColor rounded-xl p-6 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-textMain flex items-center gap-2">
                     <Briefcase size={20} className="text-primary" /> Active & Recent Campaigns
                  </h3>
                  <Link to="/brand-outreach" className="text-xs font-medium text-primary hover:underline print:hidden">View All</Link>
               </div>
               
               <div className="space-y-4">
                  {recentCampaigns.length > 0 ? recentCampaigns.map(c => (
                     <div key={c.id} className="flex items-center justify-between p-4 bg-surfaceLight/30 rounded-lg border border-borderColor">
                        <div>
                           <h4 className="font-bold text-textMain">{c.brand}</h4>
                           <p className="text-sm text-textMuted">{c.name}</p>
                        </div>
                        <div className="text-right">
                           <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${c.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                              {c.status}
                           </span>
                           <p className="text-xs text-textMuted">Due: {c.primaryDueDate}</p>
                        </div>
                     </div>
                  )) : (
                     <p className="text-textMuted italic text-sm">No recent campaigns in the last 30 days.</p>
                  )}
               </div>
            </div>

            {/* Content Output */}
            <div className="bg-surface border border-borderColor rounded-xl p-6 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-textMain flex items-center gap-2">
                     <CalendarDays size={20} className="text-accent" /> Content Delivered (Last 30 Days)
                  </h3>
                  <Link to="/content-planner" className="text-xs font-medium text-primary hover:underline print:hidden">View Calendar</Link>
               </div>
               
               <div className="space-y-3">
                  {recentTasks.length > 0 ? recentTasks.map(t => (
                     <div key={t.id} className="flex items-center gap-3 p-3 hover:bg-surfaceLight rounded-lg transition-colors border border-transparent hover:border-borderColor">
                        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-textMain truncate">{t.title}</p>
                           <p className="text-xs text-textMuted flex items-center gap-1">
                              {t.dueDate} • {t.platform || 'General'}
                           </p>
                        </div>
                        <a href="#" className="text-textMuted hover:text-primary print:hidden"><ExternalLink size={14} /></a>
                     </div>
                  )) : (
                     <p className="text-textMuted italic text-sm">No completed tasks in the last 30 days.</p>
                  )}
               </div>
            </div>

         </div>

         {/* Side Column */}
         <div className="space-y-8">
            
            {/* 30-Day Snapshot */}
            <div className="bg-surface border border-borderColor rounded-xl p-6 shadow-sm">
               <h3 className="font-bold text-textMain mb-6">30-Day Snapshot</h3>
               <div className="space-y-6">
                  <div>
                     <p className="text-sm text-textMuted mb-1">Net Earnings</p>
                     <h2 className="text-3xl font-bold text-textMain flex items-center gap-2">
                        ${netProfitLast30.toLocaleString()}
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">+12%</span>
                     </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-borderColor">
                     <div>
                        <p className="text-xs text-textMuted font-medium uppercase mb-1">Active Deals</p>
                        <p className="text-xl font-bold text-blue-600">{activeCampaignsCount}</p>
                     </div>
                     <div>
                        <p className="text-xs text-textMuted font-medium uppercase mb-1">Posts Done</p>
                        <p className="text-xl font-bold text-green-600">{totalCompletedTasks}</p>
                     </div>
                  </div>
                  
                  <div className="pt-2">
                      <Link to="/finance" className="w-full py-2 flex items-center justify-center gap-2 border border-borderColor rounded-lg text-sm font-medium hover:bg-surfaceLight transition-colors print:hidden">
                         <TrendingUp size={16} /> Financial Report
                      </Link>
                  </div>
               </div>
            </div>

            {/* Social Footprint */}
            <div className="bg-surface border border-borderColor rounded-xl p-6 shadow-sm">
               <h3 className="font-bold text-textMain mb-4">Social Footprint</h3>
               <div className="space-y-4">
                  {mediaKit.socialStats.slice(0, 4).map(stat => (
                     <div key={stat.id} className="flex justify-between items-center p-3 bg-surfaceLight/30 rounded-lg">
                        <div className="flex items-center gap-3">
                           {getPlatformIcon(stat.platform)}
                           <span className="text-sm font-medium text-textMain">{stat.platform}</span>
                        </div>
                        <span className="font-bold text-textMain">{stat.value}</span>
                     </div>
                  ))}
               </div>
               <div className="mt-6 pt-4 border-t border-borderColor text-center print:hidden">
                  <Link to="/media-kit" className="text-sm font-medium text-primary hover:underline">
                     View Media Kit
                  </Link>
               </div>
            </div>

         </div>
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:block text-center mt-12 pt-8 border-t border-borderColor">
         <p className="text-sm text-textMuted">Generated by Socio Space • {new Date().toLocaleDateString()}</p>
      </div>

    </div>
  );
};

export default UserProfile;
