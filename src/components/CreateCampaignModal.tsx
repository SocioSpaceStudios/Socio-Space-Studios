
import React, { useState } from 'react';
import { Modal } from './Modal';
import { useData } from '../context/DataContext';
import type { Campaign, Status, Contact } from '../types';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ isOpen, onClose }) => {
  const { addCampaign } = useData();
  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    brand: '',
    status: 'Planned',
    primaryDueDate: '',
    notes: ''
  });

  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    role: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.primaryDueDate) return;

    // Create Contact object if data is provided
    let contacts: Contact[] = [];
    if (contactData.name) {
      contacts.push({
        id: Date.now().toString() + '-c',
        name: contactData.name,
        email: contactData.email,
        role: contactData.role || 'Contact'
      });
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: formData.name || '',
      brand: formData.brand || '',
      status: (formData.status as Status) || 'Planned',
      primaryDueDate: formData.primaryDueDate || '',
      notes: formData.notes || '',
      contacts: contacts,
      interactions: []
    };

    addCampaign(newCampaign);
    onClose();
    // Reset
    setFormData({ name: '', brand: '', status: 'Planned', primaryDueDate: '', notes: '' });
    setContactData({ name: '', email: '', role: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Outreach">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-textMuted mb-1">Campaign Name</label>
          <input 
            required
            name="name"
            type="text" 
            className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-textMuted mb-1">Brand</label>
          <input 
            required
            name="brand"
            type="text" 
            className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
            value={formData.brand}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Status</label>
            <select 
              name="status"
              className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Start Date</label>
            <input 
              required
              name="primaryDueDate"
              type="date" 
              className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none"
              value={formData.primaryDueDate}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        {/* Contact Section */}
        <div className="pt-4 border-t border-borderColor">
          <h4 className="text-sm font-bold text-textMuted uppercase mb-3">Primary Contact (Optional)</h4>
          <div className="space-y-3">
             <div>
                <input 
                  name="name"
                  placeholder="Contact Name"
                  className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none text-sm"
                  value={contactData.name}
                  onChange={handleContactChange}
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <input 
                  name="email"
                  placeholder="Email"
                  className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none text-sm"
                  value={contactData.email}
                  onChange={handleContactChange}
                />
                <input 
                  name="role"
                  placeholder="Role (e.g. PR Manager)"
                  className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain focus:ring-2 focus:ring-primary outline-none text-sm"
                  value={contactData.role}
                  onChange={handleContactChange}
                />
             </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-semibold rounded-lg transition-colors mt-2"
        >
          Create Campaign
        </button>
      </form>
    </Modal>
  );
};
