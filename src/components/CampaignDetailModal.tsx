
import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, User, Mail, History, FileText, Edit2, Save, Trash2, Plus, MessageSquare, Sparkles, Send, Loader2 } from 'lucide-react';
import type { Campaign, Contact } from '../types';
import { useData } from '../context/DataContext';
import { GoogleGenAI } from '@google/genai';

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({ isOpen, onClose, campaign }) => {
  const { updateCampaign, showToast } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState<Campaign | null>(null);
  
  // Messaging State
  const [messagingContact, setMessagingContact] = useState<Contact | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (campaign) {
      setEditedCampaign({ ...campaign });
    }
    setIsEditing(false);
    setMessagingContact(null);
    setMessageDraft('');
  }, [campaign, isOpen]);

  if (!isOpen || !campaign || !editedCampaign) return null;

  // --- Handlers for Editing ---
  const handleSave = () => {
    if (editedCampaign) {
      updateCampaign(editedCampaign);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedCampaign({ ...campaign });
    setIsEditing(false);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedCampaign(prev => prev ? { ...prev, [name]: name === 'rate' ? Number(value) : value } : null);
  };

  // --- Handlers for Contacts ---
  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const updatedContacts = [...(editedCampaign.contacts || [])];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setEditedCampaign(prev => prev ? { ...prev, contacts: updatedContacts } : null);
  };

  const removeContact = (index: number) => {
    const updatedContacts = [...(editedCampaign.contacts || [])];
    updatedContacts.splice(index, 1);
    setEditedCampaign(prev => prev ? { ...prev, contacts: updatedContacts } : null);
  };

  const addContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: '',
      email: '',
      role: ''
    };
    setEditedCampaign(prev => prev ? { ...prev, contacts: [...(prev.contacts || []), newContact] } : null);
  };

  // --- Handlers for Messaging ---
  const openMessageComposer = (contact: Contact) => {
    setMessagingContact(contact);
    setMessageDraft(`Hi ${contact.name.split(' ')[0]},\n\nHope you're having a great week! I'm reaching out regarding the ${campaign.name} campaign...\n\nBest,\nYour Name`);
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
       const prompt = `Write a professional yet friendly creator outreach email to ${messagingContact?.name} at brand ${campaign.brand}. 
       Context: Campaign "${campaign.name}", Status: ${campaign.status}. 
       Notes: ${campaign.notes}. 
       Keep it concise and actionable.`;

       const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: prompt
       });
       
       if (response.text) {
         setMessageDraft(response.text);
       }
    } catch (e) {
      console.error("Failed to generate draft", e);
      showToast('Failed to generate AI draft', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSendMessage = () => {
    showToast(`Message sent to ${messagingContact?.email}!`, 'success');
    setMessagingContact(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-borderColor w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-borderColor bg-surfaceLight/30">
          <div className="flex-1">
             {isEditing ? (
                <div className="space-y-2">
                   <input 
                     name="brand" 
                     value={editedCampaign.brand} 
                     onChange={handleFieldChange}
                     className="text-2xl font-bold text-textMain bg-surface border border-borderColor rounded px-2 py-1 w-full"
                     placeholder="Brand Name"
                   />
                   <input 
                     name="name" 
                     value={editedCampaign.name} 
                     onChange={handleFieldChange}
                     className="text-sm text-textMuted bg-surface border border-borderColor rounded px-2 py-1 w-full"
                     placeholder="Campaign Name"
                   />
                </div>
             ) : (
                <>
                  <h2 className="text-2xl font-bold text-textMain">{campaign.brand}</h2>
                  <p className="text-textMuted">{campaign.name}</p>
                </>
             )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="p-2 text-textMuted hover:text-primary transition-colors bg-surface rounded-lg border border-borderColor" title="Edit Campaign">
                <Edit2 size={18} />
              </button>
            ) : (
               <div className="flex gap-2">
                 <button onClick={handleSave} className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors shadow-sm" title="Save Changes">
                   <Save size={18} />
                 </button>
                  <button onClick={handleCancelEdit} className="p-2 text-textMuted bg-surface hover:bg-surfaceLight rounded-lg border border-borderColor transition-colors" title="Cancel">
                   <X size={18} />
                 </button>
               </div>
            )}
            <button onClick={onClose} className="p-2 text-textMuted hover:text-textMain transition-colors bg-surface rounded-lg border border-borderColor">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          
          {/* Key Stats / Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surfaceLight/50 p-4 rounded-xl border border-borderColor">
               <div className="flex items-center gap-2 text-textMuted mb-2 text-sm font-medium">
                  <DollarSign size={16} /> Rate ($)
               </div>
               {isEditing ? (
                 <input 
                    type="number" 
                    name="rate" 
                    value={editedCampaign.rate || 0} 
                    onChange={handleFieldChange}
                    className="w-full bg-surface border border-borderColor rounded px-2 py-1 text-textMain font-bold"
                 />
               ) : (
                 <p className="text-xl font-bold text-green-600 dark:text-green-400">
                   ${campaign.rate ? campaign.rate.toLocaleString() : '0'}
                 </p>
               )}
            </div>
            
            <div className="bg-surfaceLight/50 p-4 rounded-xl border border-borderColor">
               <div className="flex items-center gap-2 text-textMuted mb-2 text-sm font-medium">
                  <Calendar size={16} /> Due Date
               </div>
               {isEditing ? (
                 <input 
                    type="date" 
                    name="primaryDueDate" 
                    value={editedCampaign.primaryDueDate} 
                    onChange={handleFieldChange}
                    className="w-full bg-surface border border-borderColor rounded px-2 py-1 text-textMain font-bold text-sm"
                 />
               ) : (
                 <p className="text-xl font-bold text-textMain">
                   {campaign.primaryDueDate}
                 </p>
               )}
            </div>
            
             <div className="bg-surfaceLight/50 p-4 rounded-xl border border-borderColor">
               <div className="flex items-center gap-2 text-textMuted mb-2 text-sm font-medium">
                  <FileText size={16} /> Status
               </div>
               {isEditing ? (
                 <select 
                    name="status" 
                    value={editedCampaign.status} 
                    onChange={handleFieldChange}
                    className="w-full bg-surface border border-borderColor rounded px-2 py-1 text-textMain font-bold text-sm"
                 >
                    <option value="Planned">Planned</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                 </select>
               ) : (
                 <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold 
                    ${campaign.status === 'Active' ? 'bg-blue-100 text-blue-700' : 
                      campaign.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      'bg-gray-100 text-gray-700'}`}>
                   {campaign.status}
                 </span>
               )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-3">Strategy & Notes</h3>
             {isEditing ? (
               <textarea 
                  name="notes"
                  value={editedCampaign.notes}
                  onChange={handleFieldChange}
                  rows={4}
                  className="w-full bg-surface border border-borderColor rounded-xl p-3 text-textMain text-sm leading-relaxed"
               />
             ) : (
              <div className="bg-surface p-4 rounded-xl border border-borderColor text-textMain text-sm leading-relaxed">
                {campaign.notes || "No notes provided."}
              </div>
             )}
          </div>

          {/* Contacts Section */}
          <div>
             <div className="flex items-center justify-between mb-3">
               <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
                 <User size={16} /> Key Contacts
               </h3>
               {isEditing && (
                 <button onClick={addContact} className="text-xs flex items-center text-primary font-medium hover:underline">
                   <Plus size={14} className="mr-1" /> Add Contact
                 </button>
               )}
             </div>

             <div className="grid grid-cols-1 gap-4">
               {editedCampaign.contacts && editedCampaign.contacts.length > 0 ? (
                 editedCampaign.contacts.map((contact, idx) => (
                   <div key={idx} className="bg-surface p-4 rounded-xl border border-borderColor shadow-sm">
                      {isEditing ? (
                         <div className="space-y-3">
                            <div className="flex gap-2">
                               <input 
                                 placeholder="Name" 
                                 value={contact.name} 
                                 onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                                 className="flex-1 bg-surfaceLight border border-borderColor rounded px-2 py-1 text-sm text-textMain"
                               />
                               <input 
                                 placeholder="Role" 
                                 value={contact.role} 
                                 onChange={(e) => handleContactChange(idx, 'role', e.target.value)}
                                 className="flex-1 bg-surfaceLight border border-borderColor rounded px-2 py-1 text-sm text-textMain"
                               />
                               <button onClick={() => removeContact(idx)} className="text-red-500 hover:text-red-700 p-1">
                                 <Trash2 size={16} />
                               </button>
                            </div>
                             <input 
                                 placeholder="Email" 
                                 value={contact.email} 
                                 onChange={(e) => handleContactChange(idx, 'email', e.target.value)}
                                 className="w-full bg-surfaceLight border border-borderColor rounded px-2 py-1 text-sm text-textMain"
                               />
                         </div>
                      ) : (
                         <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {contact.name ? contact.name.charAt(0) : '?'}
                              </div>
                              <div>
                                <p className="font-bold text-textMain text-sm">{contact.name}</p>
                                <p className="text-xs text-textMuted">{contact.role}</p>
                                <a href={`mailto:${contact.email}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                  <Mail size={12} /> {contact.email}
                                </a>
                              </div>
                            </div>
                            <button 
                              onClick={() => openMessageComposer(contact)}
                              className="px-3 py-1.5 bg-surfaceLight hover:bg-primary hover:text-white text-textMuted rounded-lg transition-colors border border-borderColor text-xs font-medium flex items-center gap-2"
                            >
                               <MessageSquare size={14} /> Message
                            </button>
                         </div>
                      )}
                   </div>
                 ))
               ) : (
                 <p className="text-sm text-textMuted italic">No contacts listed.</p>
               )}
             </div>
          </div>

          {/* Activity History (Read Only) */}
          <div>
            <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
               <History size={16} /> Activity History
             </h3>
             <div className="space-y-4 relative pl-4 border-l-2 border-borderColor ml-2">
               {campaign.interactions && campaign.interactions.length > 0 ? (
                 campaign.interactions.map(interaction => (
                   <div key={interaction.id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-accent border-2 border-surface"></div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-textMain">{interaction.date}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surfaceLight border border-borderColor text-textMuted uppercase">{interaction.type}</span>
                      </div>
                      <p className="text-sm text-textMuted">{interaction.summary}</p>
                   </div>
                 ))
               ) : (
                 <p className="text-sm text-textMuted italic pl-2">No interaction history.</p>
               )}
             </div>
          </div>
        </div>

        {/* Message Composer Overlay */}
        {messagingContact && (
          <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-surface w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-borderColor animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-borderColor flex justify-between items-center bg-surfaceLight">
                   <h3 className="font-bold text-textMain flex items-center gap-2">
                     <Mail size={16} className="text-primary"/> Message to {messagingContact.name}
                   </h3>
                   <button onClick={() => setMessagingContact(null)} className="text-textMuted hover:text-textMain">
                     <X size={18} />
                   </button>
                </div>
                <div className="p-4 space-y-4">
                   <div className="relative">
                      <textarea 
                        className="w-full h-40 bg-surface border border-borderColor rounded-lg p-3 text-sm text-textMain resize-none focus:ring-2 focus:ring-primary outline-none"
                        value={messageDraft}
                        onChange={e => setMessageDraft(e.target.value)}
                        placeholder="Type your message here..."
                      />
                      <button 
                        onClick={handleGenerateAI}
                        disabled={isGeneratingAI}
                        className="absolute bottom-3 right-3 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-1 rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                         {isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                         AI Draft
                      </button>
                   </div>
                   <div className="flex justify-end gap-2">
                      <button onClick={() => setMessagingContact(null)} className="px-4 py-2 text-sm text-textMuted hover:text-textMain">Cancel</button>
                      <button onClick={handleSendMessage} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primaryHover flex items-center gap-2">
                        <Send size={14} /> Send Email
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
