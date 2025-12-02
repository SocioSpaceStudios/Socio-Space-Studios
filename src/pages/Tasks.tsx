
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { Task, TaskStatus } from '../types';
import { Plus, Filter, Circle, CheckCircle2, Clock, CalendarClock, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Modal } from '../components/Modal';

const Tasks: React.FC = () => {
  const { tasks, campaigns, addTask, updateTaskStatus } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [campaignFilter, setCampaignFilter] = useState<string>('All');
  
  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof Task; direction: 'asc' | 'desc' } | null>({ key: 'dueDate', direction: 'asc' });

  // Form State
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    dueDate: '',
    campaignId: '',
    status: 'To Do',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate || !formData.campaignId) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title,
      dueDate: formData.dueDate,
      campaignId: formData.campaignId,
      status: (formData.status as TaskStatus) || 'To Do',
      notes: formData.notes || '',
    };

    addTask(newTask);
    setIsModalOpen(false);
    setFormData({ title: '', dueDate: '', campaignId: '', status: 'To Do', notes: '' });
  };

  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesCampaign = campaignFilter === 'All' || task.campaignId === campaignFilter;
    return matchesStatus && matchesCampaign;
  });

  const sortedTasks = useMemo(() => {
    let sortableItems = [...filteredTasks];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        // Special handling for campaign ID to sort by name instead
        if (sortConfig.key === 'campaignId') {
           aValue = campaigns.find(c => c.id === a.campaignId)?.name || '';
           bValue = campaigns.find(c => c.id === b.campaignId)?.name || '';
        }

        if (aValue === undefined || bValue === undefined) return 0;
        
        // Date comparison
        if (sortConfig.key === 'dueDate') {
            return sortConfig.direction === 'asc' 
                ? new Date(aValue).getTime() - new Date(bValue).getTime()
                : new Date(bValue).getTime() - new Date(aValue).getTime();
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
  }, [filteredTasks, sortConfig, campaigns]);

  const getStatusIcon = (status: TaskStatus) => {
    switch(status) {
      case 'Completed': return <CheckCircle2 size={18} className="text-green-500" />;
      case 'Scheduled': return <CalendarClock size={18} className="text-blue-500" />;
      case 'In Progress': return <Clock size={18} className="text-yellow-500" />;
      default: return <Circle size={18} className="text-textMuted" />;
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Task }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1 text-primary" /> : <ChevronDown size={14} className="ml-1 text-primary" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-textMain">Tasks</h2>
          <p className="text-textMuted">Track your deliverables.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} className="mr-2" />
          Add Task
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 bg-surface p-4 rounded-xl border border-borderColor">
        <div className="flex items-center gap-2 text-textMuted">
          <Filter size={18} />
          <span className="text-sm font-medium">Filter by:</span>
        </div>
        
        <select 
          className="bg-surfaceLight border border-borderColor text-textMain text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
        </select>

        <select 
          className="bg-surfaceLight border border-borderColor text-textMain text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent outline-none"
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
        >
          <option value="All">All Campaigns</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Tasks Table */}
      <div className="bg-surface border border-borderColor rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surfaceLight/50 text-textMuted text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium w-12"></th>
                <th 
                    className="px-6 py-4 font-medium cursor-pointer hover:bg-surfaceLight"
                    onClick={() => handleSort('title')}
                >
                    <div className="flex items-center">Task <SortIcon columnKey="title" /></div>
                </th>
                <th 
                    className="px-6 py-4 font-medium cursor-pointer hover:bg-surfaceLight"
                    onClick={() => handleSort('campaignId')}
                >
                    <div className="flex items-center">Campaign <SortIcon columnKey="campaignId" /></div>
                </th>
                <th 
                    className="px-6 py-4 font-medium cursor-pointer hover:bg-surfaceLight"
                    onClick={() => handleSort('dueDate')}
                >
                    <div className="flex items-center">Due Date <SortIcon columnKey="dueDate" /></div>
                </th>
                <th 
                    className="px-6 py-4 font-medium cursor-pointer hover:bg-surfaceLight"
                    onClick={() => handleSort('status')}
                >
                    <div className="flex items-center">Status <SortIcon columnKey="status" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor">
              {sortedTasks.map(task => (
                <tr key={task.id} className="hover:bg-surfaceLight/30 transition-colors group">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => updateTaskStatus(task.id, task.status === 'Completed' ? 'To Do' : 'Completed')}
                      className="opacity-50 group-hover:opacity-100 transition-opacity"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                  </td>
                  <td className={`px-6 py-4 font-medium text-textMain ${task.status === 'Completed' ? 'line-through text-textMuted' : ''}`}>
                    {task.title}
                  </td>
                  <td className="px-6 py-4 text-textMuted">
                    <span className="bg-surfaceLight px-2 py-1 rounded text-xs border border-borderColor">
                       {campaigns.find(c => c.id === task.campaignId)?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-textMuted font-mono text-sm">{task.dueDate}</td>
                  <td className="px-6 py-4">
                     <select 
                       value={task.status}
                       onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                       className={`bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer 
                         ${task.status === 'Completed' ? 'text-green-500' : 
                           task.status === 'Scheduled' ? 'text-blue-500' :
                           task.status === 'In Progress' ? 'text-yellow-500' : 'text-textMuted'}`}
                     >
                       <option className="bg-surface text-textMuted" value="To Do">To Do</option>
                       <option className="bg-surface text-yellow-500" value="In Progress">In Progress</option>
                       <option className="bg-surface text-blue-500" value="Scheduled">Scheduled</option>
                       <option className="bg-surface text-green-500" value="Completed">Completed</option>
                     </select>
                  </td>
                </tr>
              ))}
               {sortedTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-textMuted">
                      No tasks found.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Task">
        {/* Same form as before */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Title</label>
            <input 
              required
              name="title"
              type="text" 
              className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-accent outline-none"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Campaign</label>
              <select 
                required
                name="campaignId"
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-accent outline-none"
                value={formData.campaignId}
                onChange={handleInputChange}
              >
                <option value="">Select Campaign</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Due Date</label>
              <input 
                required
                name="dueDate"
                type="date" 
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-accent outline-none [color-scheme:dark] dark:[color-scheme:dark] light:[color-scheme:light]"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
           <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Status</label>
              <select 
                name="status"
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-accent outline-none"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Notes</label>
            <textarea 
              name="notes"
              rows={2}
              className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-accent outline-none"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-accent hover:bg-accentHover text-white font-semibold rounded-lg transition-colors mt-2"
          >
            Add Task
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
