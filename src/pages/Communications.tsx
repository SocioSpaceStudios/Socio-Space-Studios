
import React, { useState, useEffect } from 'react';
import { Plus, Search, Hash, Send, Mail, Inbox, Archive, MoreVertical, Paperclip, Smile, ArrowRight, FileText, Check, Trash2, Undo2, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Attachment, Campaign } from '../types';
import { Modal } from '../components/Modal';
import { CampaignDetailModal } from '../components/CampaignDetailModal';

const Communications: React.FC = () => {
  const { threads, sendMessage, markThreadRead, campaigns, team, archiveThread, unarchiveThread, createThread } = useData();
  const [activeTab, setActiveTab] = useState<'email' | 'chat'>('email');
  const [viewFolder, setViewFolder] = useState<'inbox' | 'archive'>('inbox');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  const [isCampaignDetailOpen, setIsCampaignDetailOpen] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | undefined>(undefined);

  // Composer Features
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showThreadMenu, setShowThreadMenu] = useState(false);

  // New Thread State
  const [newThreadParticipants, setNewThreadParticipants] = useState<string[]>([]);
  const [newThreadSubject, setNewThreadSubject] = useState('');

  // Derived state
  const filteredThreads = threads.filter(t => 
    t.type === activeTab && 
    (viewFolder === 'archive' ? t.isArchived : !t.isArchived) &&
    (t.participants.join(', ').toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.preview.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeThread = threads.find(t => t.id === selectedThreadId);

  // Auto-select first thread if none selected (Desktop only)
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop && !selectedThreadId && filteredThreads.length > 0 && viewFolder === 'inbox') {
       // Optional: setSelectedThreadId(filteredThreads[0].id);
    }
    if (!filteredThreads.find(t => t.id === selectedThreadId)) {
        setSelectedThreadId(null);
    }
  }, [activeTab, viewFolder, filteredThreads.length]);

  // Mark as read when opening
  useEffect(() => {
    if (selectedThreadId) {
      markThreadRead(selectedThreadId);
    }
  }, [selectedThreadId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && attachments.length === 0) || !selectedThreadId) return;
    
    sendMessage(selectedThreadId, messageInput, attachments);
    setMessageInput('');
    setAttachments([]);
    setShowEmojiPicker(false);
  };

  const getLinkedCampaign = (campaignId?: string) => {
    return campaigns.find(c => c.id === campaignId);
  };

  const linkedCampaign = activeThread?.linkedCampaignId ? getLinkedCampaign(activeThread.linkedCampaignId) : null;

  // Actions
  const handleArchive = () => {
    if (selectedThreadId) {
       archiveThread(selectedThreadId);
       setSelectedThreadId(null);
    }
  };

  const handleUnarchive = () => {
    if (selectedThreadId) {
       unarchiveThread(selectedThreadId);
       setSelectedThreadId(null);
    }
  };

  const handleCreateThread = () => {
    if (newThreadParticipants.length === 0) return;
    createThread(newThreadParticipants, activeTab, activeTab === 'email' ? newThreadSubject : undefined);
    setIsNewThreadModalOpen(false);
    setNewThreadParticipants([]);
    setNewThreadSubject('');
    setActiveTab(activeTab);
  };

  const addEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const addAttachment = () => {
    const newFile: Attachment = {
        name: `Document_${Math.floor(Math.random() * 100)}.pdf`,
        type: 'file',
        url: '#'
    };
    setAttachments(prev => [...prev, newFile]);
  };

  const openCampaignDetails = () => {
      if (linkedCampaign) {
          setViewingCampaign(linkedCampaign);
          setIsCampaignDetailOpen(true);
      }
  };

  const toggleParticipant = (name: string) => {
      if (newThreadParticipants.includes(name)) {
          setNewThreadParticipants(prev => prev.filter(p => p !== name));
      } else {
          setNewThreadParticipants(prev => [...prev, name]);
      }
  };

  const availableContacts = activeTab === 'chat' 
    ? team.map(m => ({ name: m.name, role: m.role, type: 'Team' }))
    : campaigns.flatMap(c => (c.contacts || []).map(ct => ({ name: ct.name, role: `${ct.role} at ${c.brand}`, type: 'Brand' })));


  return (
    <div className="h-[calc(100vh-8rem)] flex bg-surface border border-borderColor rounded-xl overflow-hidden shadow-sm relative">
      
      {/* 1. Left Sidebar: Thread List - Hidden on mobile if thread is selected */}
      <div className={`w-full md:w-80 flex-col border-r border-borderColor bg-surfaceLight/30 ${selectedThreadId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header & Tabs */}
        <div className="p-4 border-b border-borderColor space-y-3">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <h3 className="font-bold text-textMain text-lg">
                    {viewFolder === 'inbox' ? 'Inbox' : 'Archive'}
                </h3>
                {viewFolder === 'archive' && <span className="text-xs bg-surface border border-borderColor px-1.5 rounded text-textMuted">Archived</span>}
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => setViewFolder(viewFolder === 'inbox' ? 'archive' : 'inbox')}
                  className={`p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-borderColor transition-colors ${viewFolder === 'archive' ? 'text-primary' : 'text-textMuted'}`}
                  title={viewFolder === 'inbox' ? "View Archive" : "View Inbox"}
                >
                    {viewFolder === 'inbox' ? <Archive size={18} /> : <Inbox size={18} />}
                </button>
                <button 
                  onClick={() => setIsNewThreadModalOpen(true)}
                  className="p-1.5 bg-primary text-white rounded-lg hover:bg-primaryHover shadow-sm"
                  title="New Message"
                >
                    <Plus size={18} />
                </button>
             </div>
           </div>
           
           <div className="flex p-1 bg-surfaceLight rounded-lg border border-borderColor">
              <button 
                onClick={() => { setActiveTab('email'); setSelectedThreadId(null); }}
                className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'email' ? 'bg-surface shadow text-primary' : 'text-textMuted hover:text-textMain'}`}
              >
                <Mail size={16} className="mr-2" /> Email
              </button>
              <button 
                onClick={() => { setActiveTab('chat'); setSelectedThreadId(null); }}
                className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-surface shadow text-primary' : 'text-textMuted hover:text-textMain'}`}
              >
                <Hash size={16} className="mr-2" /> Team
              </button>
           </div>

           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
             <input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-surface border border-borderColor rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary text-textMain placeholder:text-textMuted" 
               placeholder="Search..." 
             />
           </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
           {filteredThreads.length > 0 ? filteredThreads.map(thread => (
             <div 
               key={thread.id}
               onClick={() => setSelectedThreadId(thread.id)}
               className={`p-4 border-b border-borderColor cursor-pointer hover:bg-surfaceLight transition-colors ${selectedThreadId === thread.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
             >
                <div className="flex justify-between items-start mb-1">
                   <h4 className={`text-sm font-medium truncate flex-1 ${thread.unreadCount > 0 ? 'text-textMain font-bold' : 'text-textMain'}`}>
                     {thread.participants.join(', ')}
                   </h4>
                   <span className="text-xs text-textMuted whitespace-nowrap ml-2">{thread.updatedAt}</span>
                </div>
                {thread.subject && (
                  <p className={`text-xs truncate mb-1 ${thread.unreadCount > 0 ? 'text-textMain font-semibold' : 'text-textMuted'}`}>
                    {thread.subject}
                  </p>
                )}
                <p className="text-xs text-textMuted line-clamp-2 opacity-80">
                  {thread.messages[thread.messages.length - 1]?.content || thread.preview}
                </p>
             </div>
           )) : (
             <div className="p-8 text-center text-textMuted text-sm">
               No {activeTab} threads in {viewFolder}.
             </div>
           )}
        </div>
      </div>

      {/* 2. Middle: Conversation View - Hidden on mobile if no thread is selected */}
      <div className={`flex-1 flex-col bg-surface min-w-0 ${!selectedThreadId ? 'hidden md:flex' : 'flex w-full absolute inset-0 z-10 md:static'}`}>
         {activeThread ? (
           <>
             {/* Chat Header */}
             <div className="p-3 md:p-4 border-b border-borderColor flex justify-between items-center bg-surfaceLight/20">
                <div className="flex items-center gap-3 min-w-0">
                   {/* Back Button for Mobile */}
                   <button onClick={() => setSelectedThreadId(null)} className="md:hidden text-textMuted hover:text-textMain">
                      <ArrowLeft size={20} />
                   </button>
                   <div className="truncate">
                      <h3 className="font-bold text-textMain text-base md:text-lg truncate">{activeThread.subject || activeThread.participants.join(', ')}</h3>
                      <div className="flex items-center gap-2 text-xs text-textMuted mt-1">
                          {activeThread.type === 'email' ? <Mail size={12}/> : <Hash size={12}/>}
                          <span>{activeThread.participants.length} participants</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-textMuted relative flex-shrink-0">
                   {activeThread.isArchived ? (
                      <button onClick={handleUnarchive} className="p-2 hover:bg-surfaceLight rounded-lg text-primary" title="Unarchive"><Undo2 size={18} /></button>
                   ) : (
                      <button onClick={handleArchive} className="p-2 hover:bg-surfaceLight rounded-lg hover:text-red-500" title="Archive"><Archive size={18} /></button>
                   )}
                   
                   <div className="relative">
                      <button 
                        onClick={() => setShowThreadMenu(!showThreadMenu)}
                        className="p-2 hover:bg-surfaceLight rounded-lg"
                      >
                          <MoreVertical size={18} />
                      </button>
                      {showThreadMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-surface border border-borderColor rounded-lg shadow-lg py-1 z-20">
                              <button onClick={() => { setShowThreadMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-surfaceLight">Mark Unread</button>
                              <button onClick={() => { setShowThreadMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-surfaceLight">Add Participant</button>
                          </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Messages Area */}
             <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-background/50">
                {activeThread.messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 md:gap-4 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.isMe ? 'bg-primary text-white' : 'bg-surfaceLight border border-borderColor text-textMuted'}`}>
                        {msg.senderName.charAt(0)}
                     </div>
                     <div className={`max-w-[85%] md:max-w-[80%] space-y-1`}>
                        <div className={`flex items-baseline gap-2 ${msg.isMe ? 'justify-end' : ''}`}>
                           <span className="text-xs font-bold text-textMain">{msg.senderName}</span>
                           <span className="text-[10px] text-textMuted">{msg.timestamp}</span>
                        </div>
                        <div className={`p-3 md:p-4 rounded-xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap break-words ${msg.isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-surfaceLight text-textMain rounded-tl-none border border-borderColor'}`}>
                           {msg.content}
                           {/* Attachments Display */}
                           {msg.attachments && msg.attachments.length > 0 && (
                               <div className="mt-3 space-y-2">
                                   {msg.attachments.map((att, i) => (
                                       <div key={i} className={`flex items-center gap-2 p-2 rounded bg-black/10 border border-white/10 ${msg.isMe ? 'text-white' : 'text-textMain'}`}>
                                           <FileText size={16} />
                                           <span className="text-xs truncate max-w-[150px]">{att.name}</span>
                                       </div>
                                   ))}
                               </div>
                           )}
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             {/* Composer */}
             <div className="p-3 md:p-4 border-t border-borderColor bg-surface relative">
                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                    <div className="absolute bottom-full left-4 mb-2 bg-surface border border-borderColor shadow-xl rounded-lg p-2 grid grid-cols-6 gap-2 z-20">
                        {['👍','❤️','😂','😮','😢','😡','🔥','🎉','✅','👀','👋','🙏'].map(em => (
                            <button key={em} onClick={() => addEmoji(em)} className="text-xl hover:bg-surfaceLight rounded p-1">{em}</button>
                        ))}
                    </div>
                )}

                {/* Attachments Preview */}
                {attachments.length > 0 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto">
                        {attachments.map((att, i) => (
                            <div key={i} className="flex items-center gap-2 bg-surfaceLight border border-borderColor px-3 py-1 rounded-full text-xs text-textMain flex-shrink-0">
                                <FileText size={14} /> {att.name}
                                <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500"><Trash2 size={12} /></button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="bg-surfaceLight/30 border border-borderColor rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                   <textarea 
                     value={messageInput}
                     onChange={(e) => setMessageInput(e.target.value)}
                     className="w-full bg-transparent outline-none text-textMain text-sm p-2 max-h-32 resize-none"
                     placeholder={`Reply...`}
                     rows={1}
                     style={{ minHeight: '40px' }}
                   />
                   <div className="flex justify-between items-center px-1 pb-1 pt-2">
                      <div className="flex gap-2 text-textMuted">
                         <button type="button" onClick={addAttachment} className="hover:text-primary p-1"><Paperclip size={18} /></button>
                         <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="hover:text-primary p-1"><Smile size={18} /></button>
                      </div>
                      <button 
                        type="submit" 
                        disabled={(!messageInput.trim() && attachments.length === 0)}
                        className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                         Send <Send size={14} />
                      </button>
                   </div>
                </form>
             </div>
           </>
         ) : (
           <div className="flex-1 hidden md:flex flex-col items-center justify-center text-textMuted">
              <div className="w-16 h-16 bg-surfaceLight rounded-full flex items-center justify-center mb-4">
                 <Inbox size={32} />
              </div>
              <p>Select a conversation to start messaging</p>
           </div>
         )}
      </div>

      {/* 3. Right: Context Panel (Only if Email/Linked) - Hidden on Mobile/Tablet */}
      {activeThread?.linkedCampaignId && linkedCampaign && (
        <div className="w-72 border-l border-borderColor bg-surfaceLight/30 p-6 hidden xl:block overflow-y-auto">
           <h4 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-6">Context</h4>
           
           <div className="space-y-6">
              {/* Campaign Card */}
              <div className="bg-surface border border-borderColor rounded-xl p-4 shadow-sm">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-primary">
                       <Hash size={18} />
                    </div>
                    <div>
                       <p className="text-xs text-textMuted">Campaign</p>
                       <h4 className="font-bold text-textMain text-sm">{linkedCampaign.name}</h4>
                    </div>
                 </div>
                 <div className="space-y-2 mt-4 pt-4 border-t border-borderColor">
                    <div className="flex justify-between text-sm">
                       <span className="text-textMuted">Status</span>
                       <span className={`px-2 py-0.5 rounded text-xs font-medium ${linkedCampaign.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                          {linkedCampaign.status}
                       </span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-textMuted">Value</span>
                       <span className="font-bold text-green-600">${linkedCampaign.rate?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-textMuted">Due Date</span>
                       <span className="text-textMain">{linkedCampaign.primaryDueDate}</span>
                    </div>
                 </div>
                 <button 
                   onClick={openCampaignDetails}
                   className="w-full mt-4 py-2 border border-borderColor rounded-lg text-xs font-medium hover:bg-surfaceLight transition-colors flex items-center justify-center gap-1"
                 >
                    View Details <ArrowRight size={12} />
                 </button>
              </div>

              {/* Brand Info */}
              <div>
                 <h4 className="text-xs font-bold text-textMain mb-3">About {linkedCampaign.brand}</h4>
                 <p className="text-xs text-textMuted leading-relaxed">
                    {linkedCampaign.notes || "No notes available for this campaign."}
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* New Thread Modal */}
      <Modal isOpen={isNewThreadModalOpen} onClose={() => setIsNewThreadModalOpen(false)} title={`New ${activeTab === 'email' ? 'Email' : 'Chat'}`}>
         <div className="space-y-4">
             {activeTab === 'email' && (
                 <div>
                     <label className="block text-sm font-medium text-textMuted mb-1">Subject</label>
                     <input 
                        value={newThreadSubject}
                        onChange={e => setNewThreadSubject(e.target.value)}
                        className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 text-textMain outline-none"
                        placeholder="Subject line..."
                     />
                 </div>
             )}
             
             <div>
                 <label className="block text-sm font-medium text-textMuted mb-2">Recipients</label>
                 <div className="max-h-60 overflow-y-auto border border-borderColor rounded-lg divide-y divide-borderColor">
                     {availableContacts.map((contact, idx) => (
                         <div 
                             key={idx} 
                             onClick={() => toggleParticipant(contact.name)}
                             className={`p-3 cursor-pointer flex justify-between items-center hover:bg-surfaceLight transition-colors ${newThreadParticipants.includes(contact.name) ? 'bg-primary/10' : ''}`}
                         >
                             <div>
                                 <p className="text-sm font-medium text-textMain">{contact.name}</p>
                                 <p className="text-xs text-textMuted">{contact.role}</p>
                             </div>
                             {newThreadParticipants.includes(contact.name) && <Check size={16} className="text-primary" />}
                         </div>
                     ))}
                     {availableContacts.length === 0 && <p className="p-4 text-center text-sm text-textMuted">No contacts found.</p>}
                 </div>
             </div>

             <button 
                onClick={handleCreateThread}
                disabled={newThreadParticipants.length === 0 || (activeTab === 'email' && !newThreadSubject)}
                className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primaryHover disabled:opacity-50 transition-colors"
             >
                 Start Conversation
             </button>
         </div>
      </Modal>

      {/* Campaign Details Modal (Context Link) */}
      <CampaignDetailModal 
         isOpen={isCampaignDetailOpen} 
         onClose={() => setIsCampaignDetailOpen(false)}
         campaign={viewingCampaign}
      />

    </div>
  );
};

export default Communications;
