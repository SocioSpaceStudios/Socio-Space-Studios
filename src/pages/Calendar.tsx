
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, LayoutList, Calendar as CalendarIcon, Sparkles, Plus, Instagram, Youtube, Video, Linkedin, Twitter, Filter, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { AICampaignModal } from '../components/AICampaignModal';
import { PostDetailModal } from '../components/PostDetailModal';
import type { Task, SocialPlatform } from '../types';

const ContentPlanner: React.FC = () => {
  const { tasks } = useData();
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('table');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);
  
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  // Filters
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof Task; direction: 'asc' | 'desc' } | null>({ key: 'dueDate', direction: 'asc' });

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Merge Data
  const allContent = tasks.map(t => ({ ...t, type: 'post', date: t.dueDate }));

  // Apply Filters
  const filteredContent = allContent.filter(item => {
    const matchesPlatform = platformFilter === 'All' || (item.platform || 'Instagram') === platformFilter;
    
    // Status Logic Mapping
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Scheduled' && item.status === 'Scheduled') || 
                          (statusFilter === 'Completed' && item.status === 'Completed') ||
                          (statusFilter === 'Draft' && (item.status === 'To Do' || item.status === 'In Progress'));
    
    return matchesPlatform && matchesStatus;
  });

  // Sorting Logic
  const sortedContent = useMemo(() => {
    let sortableItems = [...filteredContent];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];
        
        // Handle undefined platform safely
        if (sortConfig.key === 'platform') {
            aValue = aValue || 'Instagram';
            bValue = bValue || 'Instagram';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredContent, sortConfig]);

  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handlers
  const handleOpenNewPost = () => {
    setSelectedTask(undefined);
    setSelectedDate(new Date());
    setIsPostModalOpen(true);
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    setSelectedTask(undefined);
    setIsPostModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsPostModalOpen(true);
  };

  const getPlatformIcon = (platform?: SocialPlatform) => {
    switch (platform) {
      case 'Instagram': return <Instagram size={14} className="text-pink-500" />;
      case 'TikTok': return <Video size={14} className="text-black dark:text-white" />;
      case 'YouTube': return <Youtube size={14} className="text-red-500" />;
      case 'LinkedIn': return <Linkedin size={14} className="text-blue-600" />;
      case 'Twitter': return <Twitter size={14} className="text-sky-400" />;
      default: return <Instagram size={14} className="text-textMuted" />;
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      default: return 'bg-surfaceLight text-textMain border border-borderColor';
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof Task }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1 text-primary" /> : <ChevronDown size={14} className="ml-1 text-primary" />;
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-surfaceLight/10 border border-borderColor/50"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayItems = filteredContent.filter(item => item.date === dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <div 
          key={d} 
          onClick={() => handleDayClick(d)}
          className={`h-32 border border-borderColor p-2 relative hover:bg-surfaceLight/20 transition-colors cursor-pointer group ${isToday ? 'bg-primary/5' : 'bg-surface'}`}
        >
          <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-textMuted'}`}>{d}</span>
          
          {/* Add Button on Hover */}
          <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-surfaceLight rounded hover:bg-primary hover:text-white transition-all text-xs">
            <Plus size={12} />
          </button>

          <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-24px)] custom-scrollbar">
            {dayItems.map((item) => (
              <div 
                key={item.id} 
                onClick={(e) => { e.stopPropagation(); handleTaskClick(item); }}
                className={`text-[10px] px-1.5 py-1 rounded truncate flex items-center gap-1 shadow-sm transition-transform hover:scale-105 border
                  ${getStatusBadgeStyles(item.status)}`}
              >
                {getPlatformIcon(item.platform)}
                <span className="truncate">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* View Toggles */}
          <div className="flex items-center space-x-1 bg-surface p-1 rounded-lg border border-borderColor">
            <button 
              onClick={() => setViewMode('table')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-surfaceLight text-textMain shadow-sm' : 'text-textMuted hover:text-textMain'}`}
            >
              <LayoutList size={16} className="mr-2" />
              Table
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-surfaceLight text-textMain shadow-sm' : 'text-textMuted hover:text-textMain'}`}
            >
              <CalendarIcon size={16} className="mr-2" />
              Calendar
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 bg-surface px-3 py-1.5 border border-borderColor rounded-lg overflow-x-auto max-w-full">
             <Filter size={16} className="text-textMuted flex-shrink-0" />
             <select 
               value={platformFilter} 
               onChange={(e) => setPlatformFilter(e.target.value)}
               className="bg-transparent text-sm text-textMain outline-none border-none cursor-pointer"
             >
                <option value="All">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
             </select>
             <div className="w-px h-4 bg-borderColor mx-1"></div>
             <select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value)}
               className="bg-transparent text-sm text-textMain outline-none border-none cursor-pointer"
             >
                <option value="All">All Status</option>
                <option value="Draft">Drafts</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
             </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full xl:w-auto flex-wrap">
          <button 
             onClick={() => { setAiPrompt(undefined); setIsAIModalOpen(true); }}
             className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            <Sparkles size={16} className="mr-2" />
            AI Tools
          </button>
          <button 
            onClick={() => { setAiPrompt("Generate 10 engaging social media post ideas"); setIsAIModalOpen(true); }}
            className="flex-1 md:flex-none px-4 py-2 bg-surface border border-borderColor text-textMain rounded-lg font-medium hover:bg-surfaceLight transition-colors hidden sm:block whitespace-nowrap"
          >
            10 Post Ideas
          </button>
          <button 
            onClick={handleOpenNewPost}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg transition-colors shadow-lg shadow-accent/20 font-medium whitespace-nowrap ml-auto xl:ml-0"
          >
            <Plus size={18} className="mr-2" />
            New Post
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <div className="space-y-4">
           <div className="bg-surface border border-borderColor rounded-xl overflow-hidden min-h-[400px] shadow-sm">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-borderColor bg-surfaceLight/50">
                      <th className="px-6 py-4 text-xs font-semibold text-textMuted uppercase tracking-wider w-10"></th>
                      <th 
                        className="px-6 py-4 text-xs font-semibold text-textMuted uppercase tracking-wider cursor-pointer hover:bg-surfaceLight"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center whitespace-nowrap">Title <SortIcon columnKey="title" /></div>
                      </th>
                      <th 
                        className="px-6 py-4 text-xs font-semibold text-textMuted uppercase tracking-wider cursor-pointer hover:bg-surfaceLight"
                        onClick={() => handleSort('platform')}
                      >
                          <div className="flex items-center whitespace-nowrap">Platform <SortIcon columnKey="platform" /></div>
                      </th>
                      <th 
                        className="px-6 py-4 text-xs font-semibold text-textMuted uppercase tracking-wider cursor-pointer hover:bg-surfaceLight"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center whitespace-nowrap">Status <SortIcon columnKey="status" /></div>
                      </th>
                      <th 
                        className="px-6 py-4 text-xs font-semibold text-textMuted uppercase tracking-wider cursor-pointer hover:bg-surfaceLight"
                        onClick={() => handleSort('dueDate')}
                      >
                        <div className="flex items-center whitespace-nowrap">Scheduled Date <SortIcon columnKey="dueDate" /></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderColor">
                      {sortedContent.length > 0 ? sortedContent.map((item) => (
                        <tr 
                          key={item.id} 
                          onClick={() => handleTaskClick(item)}
                          className="hover:bg-surfaceLight/50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            {item.image && <img src={item.image} className="w-8 h-8 rounded object-cover border border-borderColor" alt="" />}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-textMain block">{item.title}</span>
                            {item.caption && <span className="text-xs text-textMuted truncate max-w-[200px] block">{item.caption}</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(item.platform)}
                              <span className="text-sm text-textMain">{item.platform || 'Instagram'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs border font-medium ${getStatusBadgeStyles(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-textMuted">{item.date}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-textMuted">
                            No posts found matching your filters.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      ) : (
        <div className="space-y-4">
           {/* Calendar Header */}
           <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-borderColor">
              <span className="text-lg font-bold text-textMain">{monthName} {year}</span>
              <div className="flex gap-2">
                 <button onClick={prevMonth} className="p-2 hover:bg-surfaceLight rounded-lg text-textMain border border-borderColor"><ChevronLeft size={20} /></button>
                 <button onClick={nextMonth} className="p-2 hover:bg-surfaceLight rounded-lg text-textMain border border-borderColor"><ChevronRight size={20} /></button>
              </div>
           </div>
           
           {/* Scrollable Calendar Container */}
           <div className="bg-surface rounded-xl shadow-lg overflow-hidden border border-borderColor overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-7 bg-surfaceLight border-b border-borderColor text-center py-3 text-sm text-textMuted font-semibold uppercase tracking-wider">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7">
                  {renderCalendar()}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Modals */}
      <AICampaignModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} initialPrompt={aiPrompt} />
      
      <PostDetailModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        initialDate={selectedDate}
        existingTask={selectedTask}
      />
    </div>
  );
};

export default ContentPlanner;
