
import React, { useState, useMemo } from 'react';
import { Plus, LayoutTemplate, List, ArrowUpDown, ChevronUp, ChevronDown, Box, Video, Instagram, Youtube, DollarSign } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Job, JobStatus, Payment } from '../types';
import { Modal } from '../components/Modal';
import { JobDetailModal } from '../components/JobDetailModal';

const UGCJobs: React.FC = () => {
  const { jobs, addJob, updateJobStatus, addPayment } = useData();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Detail Modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Job; direction: 'asc' | 'desc' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Job>>({
    client: '',
    niche: '',
    rate: 0,
    dueDate: '',
    status: 'Applied'
  });

  const columns: JobStatus[] = ['Applied', 'Accepted', 'Filming', 'Editing'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800';
      case 'Accepted': return 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800';
      case 'Filming': return 'border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800';
      case 'Editing': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800';
      default: return 'bg-surface';
    }
  };

  const getPlatformIcon = (platform?: string) => {
      if (platform === 'TikTok') return <Video size={14} />;
      if (platform === 'YouTube') return <Youtube size={14} />;
      return <Instagram size={14} />;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client || !formData.rate) return;

    const newJob: Job = {
      id: Date.now().toString(),
      client: formData.client,
      niche: formData.niche || 'General',
      rate: Number(formData.rate),
      dueDate: formData.dueDate || 'TBD',
      status: (formData.status as JobStatus) || 'Applied',
      productStatus: 'Not Ordered',
      platform: 'Instagram'
    };

    addJob(newJob);
    setIsModalOpen(false);
    setFormData({ client: '', niche: '', rate: 0, dueDate: '', status: 'Applied' });
  };

  const openJobDetail = (job: Job) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  const handleGenerateInvoice = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    const newPayment: Payment = {
       id: Date.now().toString(),
       brand: job.client,
       amount: job.rate,
       type: 'Income',
       status: 'Unpaid',
       category: 'UGC',
       dueDate: new Date().toISOString().split('T')[0],
       notes: `Generated from UGC Job: ${job.deliverables || 'Project'}`
    };
    addPayment(newPayment);
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData('jobId', jobId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: JobStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (jobId) {
      updateJobStatus(jobId, newStatus);
    }
  };

  const handleSort = (key: keyof Job) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedJobs = useMemo(() => {
    let sortableItems = [...jobs];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

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
  }, [jobs, sortConfig]);

  const SortIcon = ({ columnKey }: { columnKey: keyof Job }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1 text-primary" /> : <ChevronDown size={14} className="ml-1 text-primary" />;
  };

  // Pipeline Stats
  const totalPipeline = jobs.reduce((acc, job) => acc + job.rate, 0);
  const securePipeline = jobs.filter(j => j.status !== 'Applied').reduce((acc, job) => acc + job.rate, 0);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Toggle View */}
        <div className="flex bg-surface border border-borderColor rounded-lg p-1 w-full md:w-auto">
          <button 
            onClick={() => setView('kanban')}
            className={`flex-1 md:flex-none flex items-center justify-center px-3 py-1.5 rounded text-sm font-medium ${view === 'kanban' ? 'bg-surfaceLight shadow-sm text-textMain' : 'text-textMuted'}`}
          >
            <LayoutTemplate size={16} className="mr-2" /> Kanban
          </button>
          <button 
            onClick={() => setView('list')}
            className={`flex-1 md:flex-none flex items-center justify-center px-3 py-1.5 rounded text-sm font-medium ${view === 'list' ? 'bg-surfaceLight shadow-sm text-textMain' : 'text-textMuted'}`}
          >
            <List size={16} className="mr-2" /> List
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-surfaceLight/50 px-4 py-2 rounded-lg border border-borderColor text-sm w-full md:w-auto">
           <span className="text-textMuted whitespace-nowrap">Projected:</span> <span className="font-bold text-textMain">${totalPipeline}</span>
           <span className="hidden md:block w-px h-4 bg-borderColor mx-2"></span>
           <span className="text-textMuted ml-auto md:ml-0 whitespace-nowrap">Secured:</span> <span className="font-bold text-green-600">${securePipeline}</span>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-[#A855F7] hover:bg-[#9333ea] text-white rounded-lg transition-colors font-medium shadow-lg shadow-purple-500/20"
        >
          <Plus size={18} className="mr-2" /> New Job
        </button>
      </div>

      {/* Kanban Board */}
      {view === 'kanban' ? (
        <div className="flex-1 overflow-x-auto pb-4">
          {/* Responsive Grid: Stacks on mobile, Columns on MD+ */}
          <div className="flex flex-col md:flex-row gap-6 md:min-w-[1000px] h-full">
            {columns.map(col => {
              const colJobs = jobs.filter(j => j.status === col);
              return (
                <div 
                  key={col} 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col)}
                  className={`flex-1 min-w-0 md:min-w-[250px] rounded-xl border flex flex-col transition-colors ${getStatusColor(col)}`}
                >
                  <div className="p-4 border-b border-inherit">
                    <h3 className="font-semibold text-textMain flex justify-between items-center">
                      {col} 
                      <span className="text-xs bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">{colJobs.length}</span>
                    </h3>
                  </div>
                  <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px] md:max-h-none">
                    {colJobs.map(job => (
                      <div 
                        key={job.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, job.id)}
                        onClick={() => openJobDetail(job)}
                        className="bg-surface p-4 rounded-lg shadow-sm border border-borderColor relative group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                      >
                         <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-textMain line-clamp-1">{job.client}</h4>
                           <div className="flex gap-1 flex-shrink-0">
                             {getPlatformIcon(job.platform)}
                           </div>
                         </div>
                         <p className="text-xs text-textMuted mb-3">{job.niche}</p>
                         
                         {/* Logistics Pill */}
                         {job.productStatus && job.productStatus !== 'Not Ordered' && (
                           <div className="mb-3">
                             <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center w-fit gap-1
                               ${job.productStatus === 'Received' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                               <Box size={10} /> {job.productStatus}
                             </span>
                           </div>
                         )}

                         <div className="flex justify-between items-center text-sm pt-2 border-t border-borderColor/50">
                           <span className="font-semibold text-green-600">$ {job.rate}</span>
                           <div className="flex items-center gap-2">
                             {(col === 'Accepted' || col === 'Filming' || col === 'Editing') && (
                                <button 
                                  onClick={(e) => handleGenerateInvoice(e, job)}
                                  className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 rounded"
                                  title="Generate Invoice"
                                >
                                   <DollarSign size={14} />
                                </button>
                             )}
                             <span className="text-textMuted text-xs">{job.dueDate}</span>
                           </div>
                         </div>
                      </div>
                    ))}
                    {colJobs.length === 0 && (
                      <div className="text-center py-4 text-textMuted text-xs italic opacity-50">
                        No jobs
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-borderColor rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surfaceLight/50 text-textMuted text-xs uppercase">
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-surfaceLight"
                    onClick={() => handleSort('client')}
                  >
                    <div className="flex items-center whitespace-nowrap">Client <SortIcon columnKey="client" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-surfaceLight"
                    onClick={() => handleSort('niche')}
                  >
                     <div className="flex items-center whitespace-nowrap">Niche <SortIcon columnKey="niche" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-surfaceLight"
                    onClick={() => handleSort('rate')}
                  >
                    <div className="flex items-center whitespace-nowrap">Rate <SortIcon columnKey="rate" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-surfaceLight"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center whitespace-nowrap">Status <SortIcon columnKey="status" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-surfaceLight"
                    onClick={() => handleSort('dueDate')}
                  >
                     <div className="flex items-center whitespace-nowrap">Due Date <SortIcon columnKey="dueDate" /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor">
                {sortedJobs.map(job => (
                  <tr key={job.id} onClick={() => openJobDetail(job)} className="hover:bg-surfaceLight/30 cursor-pointer">
                    <td className="px-6 py-4 font-medium text-textMain">{job.client}</td>
                    <td className="px-6 py-4 text-textMuted">{job.niche}</td>
                    <td className="px-6 py-4 text-green-600">${job.rate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-textMuted">{job.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Job Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Job">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Client Name</label>
            <input 
              required
              name="client"
              type="text" 
              className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
              value={formData.client}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Niche</label>
              <input 
                name="niche"
                type="text" 
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                value={formData.niche}
                onChange={handleInputChange}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Rate ($)</label>
              <input 
                required
                name="rate"
                type="number" 
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                value={formData.rate}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Due Date</label>
              <input 
                name="dueDate"
                type="date" 
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Status</label>
              <select 
                name="status"
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                value={formData.status}
                onChange={handleInputChange}
              >
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-semibold rounded-lg transition-colors mt-2"
          >
            Create Job
          </button>
        </form>
      </Modal>

      {/* Detail Modal */}
      <JobDetailModal 
         isOpen={isDetailOpen} 
         onClose={() => setIsDetailOpen(false)} 
         job={selectedJob} 
      />
    </div>
  );
};

export default UGCJobs;
