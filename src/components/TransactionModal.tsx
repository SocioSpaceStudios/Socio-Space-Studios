
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, DollarSign } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Payment, PaymentType, PaymentStatus } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPayment?: Payment | null;
  initialType?: PaymentType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, existingPayment, initialType = 'Income' }) => {
  const { addPayment, updatePayment, deletePayment } = useData();
  const [formData, setFormData] = useState<Partial<Payment>>({
    brand: '',
    amount: 0,
    type: initialType,
    category: '',
    status: 'Unpaid',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    if (existingPayment) {
      setFormData({ ...existingPayment });
    } else {
      setFormData({
        brand: '',
        amount: 0,
        type: initialType,
        category: '',
        status: initialType === 'Income' ? 'Unpaid' : 'Paid',
        dueDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [isOpen, existingPayment, initialType]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.amount) return;

    const payment: Payment = {
      id: existingPayment ? existingPayment.id : Date.now().toString(),
      brand: formData.brand || '',
      amount: Number(formData.amount),
      type: (formData.type as PaymentType) || 'Income',
      category: formData.category || 'General',
      status: (formData.status as PaymentStatus) || 'Unpaid',
      dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
      notes: formData.notes || ''
    };

    if (existingPayment) {
      updatePayment(payment);
    } else {
      addPayment(payment);
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingPayment && confirm('Are you sure you want to delete this transaction?')) {
      deletePayment(existingPayment.id);
      onClose();
    }
  };

  const categories = formData.type === 'Income' 
    ? ['Sponsorship', 'AdSense', 'UGC', 'Affiliate', 'Merch', 'Other']
    : ['Software', 'Equipment', 'Travel', 'Props', 'Marketing', 'Contractors', 'Office', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-borderColor w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-5 border-b border-borderColor bg-surfaceLight/30">
          <h3 className="text-xl font-bold text-textMain">
            {existingPayment ? 'Edit Transaction' : `Record ${formData.type}`}
          </h3>
          <div className="flex items-center gap-2">
            {existingPayment && (
              <button onClick={handleDelete} className="p-2 text-textMuted hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-textMuted hover:text-textMain transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">
              {formData.type === 'Income' ? 'Client / Brand' : 'Vendor / Payee'}
            </label>
            <input 
              required
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none focus:ring-2 focus:ring-primary"
              placeholder={formData.type === 'Income' ? 'e.g. Nike' : 'e.g. Adobe'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-textMuted mb-1">Amount ($)</label>
               <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                  <input 
                    required
                    type="number"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={handleChange}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg pl-9 pr-3 py-3 text-textMain outline-none focus:ring-2 focus:ring-primary font-bold"
                  />
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-textMuted mb-1">Date</label>
               <input 
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none focus:ring-2 focus:ring-primary"
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-textMuted mb-1">Category</label>
               <select 
                 name="category" 
                 value={formData.category} 
                 onChange={handleChange}
                 className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none focus:ring-2 focus:ring-primary"
               >
                 <option value="">Select...</option>
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-textMuted mb-1">Status</label>
               <select 
                 name="status" 
                 value={formData.status} 
                 onChange={handleChange}
                 className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none focus:ring-2 focus:ring-primary"
               >
                 <option value="Paid">Paid / Received</option>
                 <option value="Unpaid">Pending / Unpaid</option>
               </select>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-textMuted mb-1">Notes (Optional)</label>
             <textarea 
               name="notes"
               value={formData.notes}
               onChange={handleChange}
               rows={2}
               className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none focus:ring-2 focus:ring-primary"
             />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className={`w-full py-3 text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2
                ${formData.type === 'Income' ? 'bg-green-600 hover:bg-green-700 shadow-green-900/20' : 'bg-red-500 hover:bg-red-600 shadow-red-900/20'}`}
            >
              <Save size={18} /> {existingPayment ? 'Save Changes' : `Add ${formData.type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
