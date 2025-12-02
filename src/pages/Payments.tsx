
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { Payment, PaymentType } from '../types';
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet, Search, ArrowUpRight, Edit2 } from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';
import { useNavigate } from 'react-router-dom';

const Payments: React.FC = () => {
  const { payments, updatePayment } = useData();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense' | 'Unpaid'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<PaymentType>('Income');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // --- Handlers ---
  const handleAdd = (type: PaymentType) => {
    setModalType(type);
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const toggleStatus = (e: React.MouseEvent, payment: Payment) => {
    e.stopPropagation();
    updatePayment({
      ...payment,
      status: payment.status === 'Paid' ? 'Unpaid' : 'Paid'
    });
  };

  // --- Analytics & Derived Data ---
  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => {
        if (filterType === 'All') return true;
        if (filterType === 'Unpaid') return p.status === 'Unpaid';
        return p.type === filterType;
      })
      .filter(p => p.brand.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()); // Newest first
  }, [payments, filterType, searchTerm]);

  const totalIncome = payments.filter(p => p.type === 'Income' && p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = payments.filter(p => p.type === 'Expense' && p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const pendingIncome = payments.filter(p => p.type === 'Income' && p.status === 'Unpaid').reduce((acc, p) => acc + p.amount, 0);

  // Mock Bar Chart Data (Simple CSS Implementation)
  const maxBarValue = 5000; // Arbitrary scale for demo
  const monthlyData = [
    { label: 'Jan', income: 1200, expense: 400 },
    { label: 'Feb', income: 2500, expense: 800 },
    { label: 'Mar', income: 1800, expense: 300 },
    { label: 'Apr', income: 3200, expense: 1200 },
    { label: 'May', income: totalIncome, expense: totalExpenses }, // Current Month
  ];

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    payments.forEach(p => {
      if (p.type === 'Expense') {
        counts[p.category] = (counts[p.category] || 0) + p.amount;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [payments]);

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex justify-end gap-3">
           <button 
             onClick={() => handleAdd('Expense')}
             className="px-4 py-2 bg-surface border border-borderColor text-textMain font-medium rounded-lg hover:bg-surfaceLight transition-colors flex items-center shadow-sm"
           >
             <TrendingDown size={18} className="mr-2 text-red-500" /> Record Expense
           </button>
           <button 
             onClick={() => handleAdd('Income')}
             className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center shadow-lg shadow-green-900/20"
           >
             <Plus size={18} className="mr-2" /> Add Income
           </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-borderColor shadow-sm">
           <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-textMuted">Net Profit</span>
              <Wallet size={18} className="text-blue-500" />
           </div>
           <h3 className="text-2xl font-bold text-textMain">${netProfit.toLocaleString()}</h3>
           <p className="text-xs text-green-500 flex items-center mt-1"><TrendingUp size={12} className="mr-1"/> +12% vs last month</p>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-borderColor shadow-sm">
           <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-textMuted">Total Income</span>
              <ArrowUpRight size={18} className="text-green-500" />
           </div>
           <h3 className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</h3>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-borderColor shadow-sm">
           <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-textMuted">Expenses</span>
              <TrendingDown size={18} className="text-red-500" />
           </div>
           <h3 className="text-2xl font-bold text-red-500">${totalExpenses.toLocaleString()}</h3>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-borderColor shadow-sm bg-orange-50 dark:bg-orange-900/10">
           <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Pending Invoices</span>
              <DollarSign size={18} className="text-orange-500" />
           </div>
           <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">${pendingIncome.toLocaleString()}</h3>
           <span className="text-xs text-orange-700/70 dark:text-orange-300/60">Across {payments.filter(p => p.type === 'Income' && p.status === 'Unpaid').length} deals</span>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Monthly Trends Chart (CSS Only) */}
         <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-borderColor shadow-sm">
            <h3 className="font-bold text-textMain mb-6">Cash Flow Trend</h3>
            <div className="flex items-end justify-between h-48 gap-4">
              {monthlyData.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                   {/* Tooltip */}
                   <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-textMain text-surface text-xs p-2 rounded pointer-events-none whitespace-nowrap z-10">
                     Inc: ${m.income} | Exp: ${m.expense}
                   </div>
                   
                   <div className="w-full flex justify-center items-end h-full gap-1">
                      {/* Income Bar */}
                      <div 
                        style={{ height: `${Math.min((m.income / maxBarValue) * 100, 100)}%` }} 
                        className="w-3 md:w-6 bg-green-500 rounded-t-sm transition-all hover:bg-green-400"
                      ></div>
                      {/* Expense Bar */}
                      <div 
                        style={{ height: `${Math.min((m.expense / maxBarValue) * 100, 100)}%` }} 
                        className="w-3 md:w-6 bg-red-400 rounded-t-sm transition-all hover:bg-red-300"
                      ></div>
                   </div>
                   <span className="text-xs text-textMuted font-medium">{m.label}</span>
                </div>
              ))}
            </div>
         </div>

         {/* Expense Breakdown */}
         <div className="bg-surface p-6 rounded-xl border border-borderColor shadow-sm">
            <h3 className="font-bold text-textMain mb-4">Expense Breakdown</h3>
            <div className="space-y-4">
               {categories.length > 0 ? categories.slice(0, 5).map(([cat, amount], i) => (
                 <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                       <span className="text-textMain font-medium">{cat}</span>
                       <span className="text-textMuted">${amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-surfaceLight rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-red-500 rounded-full" 
                         style={{ width: `${(amount / totalExpenses) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               )) : (
                 <p className="text-sm text-textMuted italic">No expenses recorded yet.</p>
               )}
            </div>
         </div>
      </div>

      {/* Transaction List */}
      <div className="bg-surface border border-borderColor rounded-xl overflow-hidden shadow-sm">
        {/* Table Controls */}
        <div className="p-4 border-b border-borderColor flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2 bg-surfaceLight p-1 rounded-lg border border-borderColor">
              {['All', 'Income', 'Expense', 'Unpaid'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f as any)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === f ? 'bg-white dark:bg-gray-700 shadow text-textMain' : 'text-textMuted hover:text-textMain'}`}
                >
                  {f}
                </button>
              ))}
           </div>
           <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
              <input 
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-surfaceLight border border-borderColor rounded-lg outline-none focus:ring-2 focus:ring-primary w-full"
              />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className="bg-surfaceLight/50 text-textMuted text-xs uppercase font-semibold">
               <tr>
                 <th className="px-6 py-4">Entity</th>
                 <th className="px-6 py-4">Category</th>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4">Amount</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-borderColor">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-surfaceLight/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div 
                        onClick={() => navigate(`/brand-outreach?search=${encodeURIComponent(payment.brand)}`)}
                        className="font-bold text-textMain hover:text-primary cursor-pointer hover:underline transition-colors"
                      >
                        {payment.brand}
                      </div>
                      <div className="text-xs text-textMuted line-clamp-1">{payment.notes}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-surfaceLight border border-borderColor rounded text-xs font-medium text-textMuted">
                        {payment.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-textMuted font-mono">
                      {payment.dueDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold flex items-center ${payment.type === 'Income' ? 'text-green-600' : 'text-textMain'}`}>
                        {payment.type === 'Income' ? '+' : '-'} ${payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={(e) => toggleStatus(e, payment)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          payment.status === 'Paid' 
                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-800 hover:bg-yellow-100'
                        }`}
                      >
                        {payment.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleEdit(payment)}
                         className="p-2 text-textMuted hover:text-primary transition-colors"
                       >
                         <Edit2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-textMuted">
                       No transactions found matching your filters.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
      
      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingPayment={selectedPayment}
        initialType={modalType}
      />
    </div>
  );
};

export default Payments;
