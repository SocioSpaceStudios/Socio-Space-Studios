
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Status, Campaign } from '../types';
import { Plus, Search, BarChart3, Target, DollarSign, ArrowUpRight, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { CreateCampaignModal } from '../components/CreateCampaignModal';
import { CampaignDetailModal } from '../components/CampaignDetailModal';
import { useSearchParams } from 'react-router-dom';

// Stat Card Component
const StatCard: React.FC<{ title: string; value: string; sub?: string; icon: React.ReactNode; color: string }> = ({ title, value, sub, icon, color }) => (
  <div className="bg-surface p-5 rounded-xl border border-borderColor shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <p className="text-sm text-textMuted font-medium">{title}</p>
      <div className={`p-2 rounded-lg ${color} text-white`}>
        {icon}
      </div>
    </div>
    <h3 className="text-2xl font-bold text-textMain">{value}</h3>
    {sub && <p className="text-xs text-textMuted mt-1">{sub}</p>}
  </div>
);

const Campaigns: React.FC = () => {
  const { campaigns } = useData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Detail Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | undefined>(undefined);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Campaign; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof Campaign) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const openDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailModalOpen(true);
  };

  // Filter Logic
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sorting Logic
  const sortedCampaigns = React.useMemo(() => {
    let sortableItems = [...filteredCampaigns];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || bValue === undefined) return 0;

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
  }, [filteredCampaigns, sortConfig]);

  const getStatusBadge = (status: Status) => {
    switch(status) {
      case 'Active': 
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">In Progress</span>;
      case 'Completed': 
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Won</span>;
      case 'Planned': 
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Not Started</span>;
    }
  };

  // Stats Logic
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  const successRate = totalCampaigns > 0 ? Math.round((campaigns.filter(c => c.status === 'Completed').length / totalCampaigns) * 100) : 0;
  const totalValue = campaigns.reduce((acc, c) => acc + (c.rate || 0), 0);
  const wonValue = campaigns.filter(c => c.status === 'Completed').reduce((acc, c) => acc + (c.rate || 0), 0);
  
  // Sort Icon Helper
  const SortIcon = ({ columnKey }: { columnKey: keyof Campaign }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1 text-primary" /> : <ChevronDown size={14} className="ml-1 text-primary" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex justify-end">
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg transition-colors shadow-lg shadow-primary/20 font-medium"
        >
          <Plus size={18} className="mr-2" />
          New Outreach
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Success Rate" 
          value={`${successRate}%`} 
          sub={`${campaigns.filter(c => c.status === 'Completed').length} won / ${totalCampaigns} total`}
          icon={<Target size={20} />}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Active Pitches" 
          value={activeCampaigns.toString()} 
          sub="In progress"
          icon={<ArrowUpRight size={20} />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Pipeline Value" 
          value={`$${totalValue.toLocaleString()}`} 
          sub={`$${wonValue.toLocaleString()} won`}
          icon={<DollarSign size={20} />}
          color="bg-purple-500"
        />
        <StatCard 
          title="Avg Deal Size" 
          value={`$${totalCampaigns > 0 ? Math.round(totalValue / totalCampaigns).toLocaleString() : 0}`} 
          sub="Per deal"
          icon={<BarChart3 size={20} />}
          color="bg-orange-500"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-borderColor flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input 
            type="text" 
            placeholder="Search brand or campaign..." 
            className="w-full pl-10 pr-4 py-2 bg-surfaceLight/50 border border-borderColor rounded-lg focus:ring-2 focus:ring-primary outline-none text-textMain text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-surface border border-borderColor rounded-lg text-sm text-textMain outline-none focus:border-primary"
          >
            <option>All Statuses</option>
            <option value="Planned">Not Started</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaign Table */}
      <div className="bg-surface border border-borderColor rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-borderColor bg-surfaceLight/30">
                <th 
                  className="px-6 py-4 text-xs font-semibold text-textMuted uppercase tracking-wider cursor-pointer hover:bg-surfaceLight transition-colors"
                  onClick={() => handleSort('brand')}
                >
                  <div className="flex items-center">Brand Name <SortIcon columnKey="brand" /></div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-semibold text-textMuted uppercase tracking-wider cursor-pointer hover:bg-surfaceLight transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">Campaign <SortIcon columnKey="name" /></div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-semibold text-textMuted uppercase tracking-wider cursor-pointer hover:bg-surfaceLight transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">Status <SortIcon columnKey="status" /></div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-semibold text-textMuted uppercase tracking-wider cursor-pointer hover:bg-surfaceLight transition-colors"
                  onClick={() => handleSort('rate')}
                >
                  <div className="flex items-center">Rate <SortIcon columnKey="rate" /></div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-semibold text-textMuted uppercase tracking-wider cursor-pointer hover:bg-surfaceLight transition-colors"
                  onClick={() => handleSort('primaryDueDate')}
                >
                  <div className="flex items-center">Due Date <SortIcon columnKey="primaryDueDate" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor">
              {sortedCampaigns.map(campaign => (
                <tr key={campaign.id} className="hover:bg-surfaceLight/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-semibold text-textMain">
                    <button 
                      onClick={() => openDetail(campaign)}
                      className="hover:text-primary hover:underline focus:outline-none text-left"
                    >
                      {campaign.brand}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-textMuted">{campaign.name}</td>
                  <td className="px-6 py-4">{getStatusBadge(campaign.status)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                    ${campaign.rate ? campaign.rate.toLocaleString() : '0'}
                  </td>
                  <td className="px-6 py-4 text-sm text-textMuted font-mono">{campaign.primaryDueDate}</td>
                </tr>
              ))}
              {sortedCampaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-textMuted">
                    No campaigns found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateCampaignModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <CampaignDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        campaign={selectedCampaign}
      />
    </div>
  );
};

export default Campaigns;
