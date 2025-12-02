import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  DollarSign, 
  Briefcase, 
  Calendar as CalendarIcon, 
  ShoppingBag, 
  Plus, 
  Lightbulb, 
  Sparkles, 
  ArrowRight,
  Mail,
  TrendingUp,
  CheckCircle2,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AICampaignModal } from '../components/AICampaignModal';

// Reusable Stat Card Component
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-surface p-6 rounded-xl shadow-sm border border-borderColor flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-surfaceLight rounded-lg text-textMain">
        {icon}
      </div>
      <button className="text-textMuted hover:text-textMain">
        <MoreHorizontal size={16} />
      </button>
    </div>
    <div>
      <p className="text-sm text-textMuted font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-textMain mt-1">{value}</h3>
    </div>
  </div>
);

// Suggestion Item Component
const SuggestionItem: React.FC<{ icon: React.ReactNode; title: string; desc: string; onClick?: () => void }> = ({ icon, title, desc, onClick }) => (
  <div onClick={onClick} className="bg-surface hover:bg-surfaceLight/50 p-4 rounded-xl border border-borderColor shadow-sm flex items-center justify-between cursor-pointer transition-all group">
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-textMain">{title}</h4>
        <p className="text-xs text-textMuted">{desc}</p>
      </div>
    </div>
    <ArrowRight size={18} className="text-textMuted group-hover:text-primary transition-colors" />
  </div>
);

const Dashboard: React.FC = () => {
  const { campaigns, tasks, payments, jobs } = useData();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);

  // Real data calculations
  // Active jobs are those that are accepted or in production (not just applied)
  const activeJobsCount = jobs.filter(j => ['Accepted', 'Filming', 'Editing'].includes(j.status)).length; 
  const postsPlanned = tasks.filter(t => t.status !== 'Completed').length; 
  const brandPitches = campaigns.filter(c => c.status === 'Planned').length; 
  
  const incomeThisMonth = payments
    .filter(p => p.type === 'Income' && p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const openAIWithPrompt = (prompt: string) => {
    setAiPrompt(prompt);
    setIsAIModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 lg:px-0">
      
      {/* Quick Actions Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] p-6 shadow-lg text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Plus size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Quick Actions</h3>
              <p className="text-white/80 text-sm">Navigate to key workflows</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
             <Link 
               to="/content-planner"
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
             >
               <CalendarIcon size={16} /> Plan Content
             </Link>
             <Link 
                to="/brand-outreach"
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
             >
               <ShoppingBag size={16} /> Brand Outreach
             </Link>
             <Link 
                to="/ugc-jobs"
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
             >
               <Briefcase size={16} /> View UGC Jobs
             </Link>
             <Link 
                to="/templates"
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
             >
               <FileText size={16} /> Template Library
             </Link>
          </div>
        </div>
        
        {/* Decorative Background Circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-20 w-24 h-24 bg-black/5 rounded-full blur-xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Posts Planned" 
          value={postsPlanned} 
          icon={<CalendarIcon size={24} className="text-textMuted" />} 
        />
        <StatCard 
          title="Brand Pitches Sent" 
          value={brandPitches} 
          icon={<Briefcase size={24} className="text-textMuted" />} 
        />
        <StatCard 
          title="UGC Jobs Active" 
          value={activeJobsCount} 
          icon={<ShoppingBag size={24} className="text-textMuted" />} 
        />
        <StatCard 
          title="Income This Month" 
          value={`$${incomeThisMonth.toLocaleString()}`} 
          icon={<DollarSign size={24} className="text-textMuted" />} 
        />
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upcoming Tasks */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 mb-2">
             <CalendarIcon size={20} className="text-primary" />
             <h3 className="text-lg font-bold text-textMain">Upcoming Tasks</h3>
          </div>

          <div className="bg-surface rounded-xl border border-borderColor shadow-sm overflow-hidden min-h-[400px]">
            {tasks.filter(t => t.status !== 'Completed').length > 0 ? (
              <div className="divide-y divide-borderColor">
                {tasks
                  .filter(t => t.status !== 'Completed')
                  .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 5)
                  .map(task => {
                    const campaign = campaigns.find(c => c.id === task.campaignId);
                    const isOverdue = new Date(task.dueDate) < new Date();
                    const isToday = new Date(task.dueDate).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

                    return (
                      <div key={task.id} className="p-4 hover:bg-surfaceLight/30 transition-colors flex items-center justify-between group">
                        <div className="flex items-start gap-4">
                           <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${isOverdue ? 'bg-red-500' : isToday ? 'bg-yellow-500' : 'bg-green-500'}`} />
                           <div>
                             <h4 className="font-semibold text-textMain">{task.title}</h4>
                             <p className="text-xs text-textMuted mt-1">{campaign?.name || 'General Task'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className={`text-xs px-2 py-1 rounded bg-surfaceLight border border-borderColor text-textMuted font-medium whitespace-nowrap`}>
                             {isToday ? 'Today' : task.dueDate}
                           </span>
                           <Link to="/content-planner" className="p-2 rounded-lg bg-primary/10 text-primary md:opacity-0 group-hover:opacity-100 transition-opacity">
                             <ArrowRight size={16} />
                           </Link>
                        </div>
                      </div>
                    );
                  })}
                 <div className="p-4 bg-surfaceLight/30 text-center">
                    <Link to="/content-planner" className="text-sm font-medium text-primary hover:underline">View all tasks</Link>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-textMuted">
                 <CheckCircle2 size={48} className="mb-4 text-green-500/50" />
                 <p>All caught up! No upcoming tasks.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Suggestions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2 mb-2">
             <Sparkles size={20} className="text-primary" />
             <h3 className="text-lg font-bold text-textMain">AI Suggestions</h3>
          </div>

          <div className="space-y-4">
            <SuggestionItem 
              onClick={() => openAIWithPrompt("Generate 10 viral content ideas for my niche")}
              icon={<Lightbulb size={24} />}
              title="Generate 10 viral content ideas"
              desc="AI-powered post ideas tailored to your niche"
            />
            <SuggestionItem 
              onClick={() => openAIWithPrompt("Write a polite but persuasive brand pitch email to Nike for a UGC collaboration")}
              icon={<Mail size={24} />}
              title="Craft a pitch for a dream brand"
              desc="Get a personalized outreach email template"
            />
            <SuggestionItem 
              onClick={() => openAIWithPrompt("Analyze content trends for 2024 and suggest a strategy")}
              icon={<TrendingUp size={24} />}
              title="Analyze your income trends"
              desc="Smart insights on your earnings patterns"
            />
            
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mt-6">
               <div className="flex items-start gap-3">
                 <Sparkles size={20} className="text-primary mt-0.5 flex-shrink-0" />
                 <p className="text-xs text-textMuted leading-relaxed">
                   These AI-powered suggestions are personalized based on your account activity and can help you grow your creator business faster.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <AICampaignModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} initialPrompt={aiPrompt} />

    </div>
  );
};

export default Dashboard;
