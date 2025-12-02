
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Box, Truck, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Job, ProductStatus } from '../types';

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ isOpen, onClose, job }) => {
  const { updateJob, deleteJob } = useData();
  const [formData, setFormData] = useState<Job | null>(null);

  useEffect(() => {
    if (job) {
      setFormData({ ...job });
    }
  }, [job]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = () => {
    if (formData) {
      updateJob({
          ...formData,
          rate: Number(formData.rate)
      });
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteJob(formData.id);
      onClose();
    }
  };

  const getProductStatusIcon = (status?: ProductStatus) => {
    switch (status) {
      case 'Ordered': return <Box size={18} className="text-yellow-500" />;
      case 'Shipped': return <Truck size={18} className="text-blue-500" />;
      case 'Received': return <CheckCircle2 size={18} className="text-green-500" />;
      default: return <Box size={18} className="text-textMuted" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-borderColor w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-borderColor bg-surfaceLight/30">
          <div>
            <h2 className="text-xl font-bold text-textMain">{formData.client}</h2>
            <p className="text-sm text-textMuted">{formData.niche} Project</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="p-2 text-textMuted hover:text-red-500 transition-colors" title="Delete Job">
              <Trash2 size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-textMuted hover:text-textMain transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">Job Details</h3>
               <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Rate ($)</label>
                  <input 
                    type="number" 
                    name="rate" 
                    value={formData.rate} 
                    onChange={handleChange}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain font-bold focus:ring-2 focus:ring-primary outline-none"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Due Date</label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    value={formData.dueDate} 
                    onChange={handleChange}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Filming">Filming</option>
                    <option value="Editing">Editing</option>
                  </select>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">Product Logistics</h3>
               <div className="bg-surfaceLight/20 p-4 rounded-xl border border-borderColor space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-textMuted mb-1">
                      {getProductStatusIcon(formData.productStatus)} Product Status
                    </label>
                    <select 
                      name="productStatus"
                      value={formData.productStatus || 'Not Ordered'}
                      onChange={handleChange}
                      className="w-full bg-surface border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="Not Ordered">Not Ordered</option>
                      <option value="Ordered">Ordered</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Received">Received</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Tracking Number</label>
                    <input 
                      type="text" 
                      name="trackingNumber" 
                      placeholder="e.g. UPS123456789"
                      value={formData.trackingNumber || ''} 
                      onChange={handleChange}
                      className="w-full bg-surface border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">Deliverables</h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Platform</label>
                  <select 
                    name="platform"
                    value={formData.platform || 'Instagram'}
                    onChange={handleChange}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-textMuted mb-1">Requirements</label>
                   <input 
                      type="text" 
                      name="deliverables" 
                      placeholder="e.g. 1 Reel, 3 Stories"
                      value={formData.deliverables || ''} 
                      onChange={handleChange}
                      className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-borderColor bg-surface flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-textMuted font-medium hover:bg-surfaceLight transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primaryHover transition-colors flex items-center shadow-lg shadow-primary/20">
            <Save size={18} className="mr-2" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
