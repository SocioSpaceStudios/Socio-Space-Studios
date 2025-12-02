
import React, { useState } from 'react';
import { Plus, Search, Copy, Tag, MoreVertical } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useData } from '../context/DataContext';

interface Template {
  id: string;
  title: string;
  category: 'Outreach' | 'Caption' | 'Workflow' | 'Contract' | 'Script';
  description: string;
  tags: string[];
  content: string;
  lastUpdated: string;
}

const initialTemplates: Template[] = [
  {
    id: '1',
    title: 'Brand Pitch - Cold Email',
    category: 'Outreach',
    description: 'Standard initial outreach email for lifestyle brands.',
    tags: ['pitch', 'email', 'sponsorship'],
    content: "Hi [Brand Name],\n\nI'm [Your Name], a content creator in the [Niche] space...",
    lastUpdated: '2024-05-20'
  },
  {
    id: '2',
    title: 'IG Reel Caption - Educational',
    category: 'Caption',
    description: 'Structure for tips and tricks videos.',
    tags: ['instagram', 'educational', 'engagement'],
    content: "3 Tips for [Topic] 👇\n\n1. [Tip 1]\n2. [Tip 2]\n3. [Tip 3]\n\nSave this for later! 📌",
    lastUpdated: '2024-05-18'
  },
  {
    id: '3',
    title: 'UGC Contract - Simple',
    category: 'Contract',
    description: 'Basic terms for single video deliverables.',
    tags: ['legal', 'ugc', 'agreement'],
    content: "Agreement between [Creator] and [Brand]...",
    lastUpdated: '2024-04-10'
  }
];

const TemplatesLibrary: React.FC = () => {
  const { showToast } = useData();
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Template Form State
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    title: '',
    category: 'Outreach',
    description: '',
    tags: [],
    content: ''
  });
  const [tagInput, setTagInput] = useState('');

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.title || !newTemplate.content) return;

    const template: Template = {
      id: Date.now().toString(),
      title: newTemplate.title,
      category: newTemplate.category as any,
      description: newTemplate.description || '',
      tags: newTemplate.tags || [],
      content: newTemplate.content,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setTemplates(prev => [template, ...prev]);
    setIsModalOpen(false);
    showToast('Template added successfully');
    setNewTemplate({ title: '', category: 'Outreach', description: '', tags: [], content: '' });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setNewTemplate(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input 
            type="text" 
            placeholder="Search templates..." 
            className="w-full pl-10 pr-4 py-2 bg-surfaceLight/50 border border-borderColor rounded-lg focus:ring-2 focus:ring-primary outline-none text-textMain text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-surface border border-borderColor rounded-lg text-sm text-textMain outline-none focus:border-primary"
          >
            <option value="All">All Categories</option>
            <option value="Outreach">Outreach</option>
            <option value="Caption">Caption</option>
            <option value="Workflow">Workflow</option>
            <option value="Contract">Contract</option>
            <option value="Script">Script</option>
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg transition-colors shadow-lg shadow-primary/20 font-medium whitespace-nowrap"
          >
            <Plus size={18} className="mr-2" />
            Add Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-surface border border-borderColor rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-1 rounded text-xs font-medium bg-surfaceLight border border-borderColor text-textMuted`}>
                {template.category}
              </span>
              <button className="text-textMuted hover:text-textMain opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={16} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-textMain mb-2">{template.title}</h3>
            <p className="text-sm text-textMuted mb-4 line-clamp-2 flex-1">{template.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {template.tags.map((tag, i) => (
                <span key={i} className="text-xs text-primary bg-primary/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-borderColor flex justify-between items-center mt-auto">
              <span className="text-xs text-textMuted">Updated: {template.lastUpdated}</span>
              <button 
                onClick={() => copyContent(template.content)}
                className="flex items-center text-xs font-medium text-primary hover:underline"
              >
                <Copy size={14} className="mr-1" /> Copy Content
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Template Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Template">
        <form onSubmit={handleAddTemplate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Title</label>
            <input 
              required
              className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
              value={newTemplate.title}
              onChange={e => setNewTemplate({...newTemplate, title: e.target.value})}
              placeholder="e.g. Viral Hook Structure"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Category</label>
              <select 
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                value={newTemplate.category}
                onChange={e => setNewTemplate({...newTemplate, category: e.target.value as any})}
              >
                <option value="Outreach">Outreach</option>
                <option value="Caption">Caption</option>
                <option value="Workflow">Workflow</option>
                <option value="Contract">Contract</option>
                <option value="Script">Script</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Tags</label>
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag} className="px-3 bg-surfaceLight border border-borderColor rounded-lg hover:bg-surface">+</button>
              </div>
            </div>
          </div>
          
          {newTemplate.tags && newTemplate.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newTemplate.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-surfaceLight border border-borderColor px-2 py-1 rounded flex items-center gap-1">
                  {tag} <button type="button" onClick={() => setNewTemplate(prev => ({...prev, tags: prev.tags?.filter((_, idx) => idx !== i)}))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Description</label>
            <input 
              className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
              value={newTemplate.description}
              onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
              placeholder="Short description of when to use this..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Content</label>
            <textarea 
              required
              rows={5}
              className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
              value={newTemplate.content}
              onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
              placeholder="Type your template content here..."
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-semibold rounded-lg transition-colors"
          >
            Save Template
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TemplatesLibrary;
