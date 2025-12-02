
import React, { useState } from 'react';
import { UserPlus, Shield, Trash2, Edit, FileText, Link as LinkIcon, Download, UploadCloud, Users, Sparkles, Loader2, Copy, Check, Eye, ChevronRight, Folder, FolderPlus, ArrowLeft, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import type { TeamMember, TeamRole, TeamResource } from '../types';
import { GoogleGenAI } from '@google/genai';
import { useNavigate } from 'react-router-dom';

const Team: React.FC = () => {
  const { team, addTeamMember, updateTeamMember, removeTeamMember, teamResources, addTeamResource, removeTeamResource, user, showToast, createThread } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'resources'>('members');
  
  // -- Member State --
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isDeleteMemberConfirmOpen, setIsDeleteMemberConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Viewer' });

  // -- Resource State --
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isDeleteResourceConfirmOpen, setIsDeleteResourceConfirmOpen] = useState(false);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<TeamResource | null>(null);
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [newResource, setNewResource] = useState({ name: '', type: 'Link', url: '' });
  const [newFolderName, setNewFolderName] = useState('');

  // -- AI State --
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiTargetRole, setAiTargetRole] = useState('Editor');
  const [aiOutput, setAiOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Handlers: Members ---
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newMember.email || !newMember.name) return;
    
    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role as TeamRole,
      status: 'Invited',
      avatarColor: 'from-pink-400 to-purple-500' 
    };
    
    addTeamMember(member);
    setIsInviteModalOpen(false);
    setNewMember({ name: '', email: '', role: 'Viewer' });
  };

  const handleUpdateMember = () => {
    if (selectedMember) {
      updateTeamMember(selectedMember);
      setIsEditMemberModalOpen(false);
      setSelectedMember(null);
    }
  };

  const handleDeleteMember = () => {
    if (selectedMember) {
      removeTeamMember(selectedMember.id);
      setIsDeleteMemberConfirmOpen(false);
      setSelectedMember(null);
    }
  };

 const handleMessageMember = (member: TeamMember) => {
    createThread([member.name], 'chat', undefined);
    navigate('/communications');
  };

  const openEditMember = (member: TeamMember) => {
    setSelectedMember({...member});
    setIsEditMemberModalOpen(true);
  };

  const openDeleteMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteMemberConfirmOpen(true);
  };

  // --- Handlers: Resources ---
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.name || (!newResource.url && newResource.type !== 'Folder')) return;

    const resource: TeamResource = {
        id: Date.now().toString(),
        name: newResource.name,
        type: newResource.type as any,
        url: newResource.url,
        uploadedBy: user.name,
        uploadDate: new Date().toISOString().split('T')[0],
        size: newResource.type === 'Link' ? undefined : '1.2 MB',
        parentId: currentFolderId,
        isFolder: false
    };
    
    addTeamResource(resource);
    setIsResourceModalOpen(false);
    setNewResource({ name: '', type: 'Link', url: '' });
  };

  const handleCreateFolder = (e: React.FormEvent) => {
     e.preventDefault();
     if (!newFolderName) return;

     const folder: TeamResource = {
         id: Date.now().toString(),
         name: newFolderName,
         type: 'Folder',
         uploadedBy: user.name,
         uploadDate: new Date().toISOString().split('T')[0],
         parentId: currentFolderId,
         isFolder: true
     };

     addTeamResource(folder);
     setIsNewFolderModalOpen(false);
     setNewFolderName('');
  };

  const openDeleteResource = (resource: TeamResource) => {
    setSelectedResource(resource);
    setIsDeleteResourceConfirmOpen(true);
  };

  const handleDeleteResource = () => {
    if (selectedResource) {
      // In a real app we'd recursively delete children if it's a folder
      removeTeamResource(selectedResource.id);
      setIsDeleteResourceConfirmOpen(false);
      setSelectedResource(null);
    }
  };

  const openFilePreview = (resource: TeamResource) => {
      setSelectedResource(resource);
      setIsFilePreviewOpen(true);
  };

  const enterFolder = (folderId: string) => {
      setCurrentFolderId(folderId);
  };

  const exitFolder = () => {
      // Simplification: just go up one level? Or back to root. 
      // For now, let's just go back to root if we are deep, or find parent.
      // Finding parent needs lookup.
      const currentFolder = teamResources.find(r => r.id === currentFolderId);
      setCurrentFolderId(currentFolder?.parentId || null);
  };

  const getBreadcrumbs = () => {
      const path = [{ id: '', name: 'Home' }];
      if (currentFolderId) {
          const folder = teamResources.find(r => r.id === currentFolderId);
          if (folder) path.push({ id: folder.id, name: folder.name });
      }
      return path;
  };

  // Filter resources for current view
  const visibleResources = teamResources.filter(r => r.parentId === (currentFolderId || null) || (r.parentId === undefined && currentFolderId === null));

  // --- AI Onboarding ---
  const generateOnboarding = async () => {
      setIsGenerating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `Create a structured onboarding checklist and welcome message for a new "${aiTargetRole}" joining a content creator team. The creator's niche is "${user.niche}". Include a list of 5 essential first-week tasks. Output in Markdown.`;
          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          if(response.text) setAiOutput(response.text);
      } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    showToast('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Helpers ---
  const getFileIcon = (type: string) => {
      switch(type) {
          case 'Folder': return <Folder size={24} className="text-yellow-500 fill-yellow-500/20" />;
          case 'PDF': return <FileText size={20} className="text-red-500" />;
          case 'Link': return <LinkIcon size={20} className="text-blue-500" />;
          case 'Image': return <ImageIcon size={20} className="text-purple-500" />;
          case 'Doc': return <FileText size={20} className="text-blue-600" />;
          default: return <FileText size={20} className="text-textMuted" />;
      }
  };

  const getPermissions = (role: string) => {
    const base = [
      { module: 'Content Planner', level: 'View' },
      { module: 'Brand Outreach', level: 'View' },
      { module: 'UGC Jobs', level: 'View' },
      { module: 'Income', level: 'None' },
      { module: 'Expenses', level: 'None' },
    ];
    if (role === 'Editor') base[0].level = 'Edit';
    else if (role === 'Manager') return base.map(p => ({ ...p, level: 'Edit' }));
    else if (role === 'Agent') { base[1].level = 'Edit'; base[3].level = 'Edit'; base[4].level = 'Edit'; }
    return base;
  };

  const renderPermissionIcon = (level: string) => {
     if (level === 'Edit') return <div className="flex items-center text-green-600 gap-1"><Edit size={12} /> <span className="text-xs font-medium">Edit</span></div>;
     if (level === 'View') return <div className="flex items-center text-blue-600 gap-1"><Eye size={12} /> <span className="text-xs font-medium">View</span></div>;
     return <div className="flex items-center text-gray-400 gap-1"><div className="w-3 h-3 rounded-full bg-gray-300"></div> <span className="text-xs font-medium">None</span></div>;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div className="flex space-x-1 bg-surface border border-borderColor p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('members')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'members' ? 'bg-surfaceLight text-primary shadow-sm' : 'text-textMuted hover:text-textMain'}`}
            >
                <Users size={18} className="mr-2" /> Team Members
            </button>
            <button 
              onClick={() => setActiveTab('resources')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'resources' ? 'bg-surfaceLight text-primary shadow-sm' : 'text-textMuted hover:text-textMain'}`}
            >
                <FileText size={18} className="mr-2" /> Shared Files
            </button>
         </div>

         <div className="flex gap-3">
            <button 
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-borderColor hover:bg-surfaceLight text-textMain rounded-lg transition-colors font-medium shadow-sm"
            >
                <Sparkles size={18} className="mr-2 text-yellow-500" /> AI Onboarding
            </button>
            <button 
                onClick={() => activeTab === 'members' ? setIsInviteModalOpen(true) : setIsResourceModalOpen(true)}
                className="flex items-center px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg transition-colors font-medium shadow-lg shadow-primary/20"
            >
                {activeTab === 'members' ? <UserPlus size={18} className="mr-2" /> : <UploadCloud size={18} className="mr-2" />}
                {activeTab === 'members' ? 'Invite Member' : 'Upload File'}
            </button>
         </div>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {team.map(member => (
            <div key={member.id} className="bg-surface border border-borderColor rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Header Row */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-inner`}>
                            {member.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-textMain text-lg">{member.name}</h3>
                            <p className="text-textMuted text-sm">{member.email}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${member.status === 'Invited' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {member.status}
                    </span>
                </div>

                {/* Role Section */}
                <div className="mb-6">
                    <p className="text-sm font-bold text-textMain mb-2">Role</p>
                    <button 
                      onClick={() => openEditMember(member)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-borderColor bg-surfaceLight/50 text-sm font-medium text-textMain hover:bg-surfaceLight hover:border-primary transition-colors"
                    >
                        <Shield size={14} className="mr-2 text-textMuted" /> {member.role}
                    </button>
                </div>

                {/* Permissions List */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                         <p className="text-sm font-bold text-textMain">Permissions</p>
                         <button onClick={() => openEditMember(member)} className="text-xs text-primary flex items-center hover:underline">
                           <Edit size={12} className="mr-1"/> Edit
                         </button>
                    </div>
                    <div className="space-y-2">
                        {getPermissions(member.role).map((perm, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-borderColor/50 last:border-0">
                                <span className="text-textMuted">{perm.module}</span>
                                {renderPermissionIcon(perm.level)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center gap-3 pt-4 border-t border-borderColor">
                    <button 
                        onClick={() => handleMessageMember(member)}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-borderColor rounded-lg text-sm font-medium text-textMain hover:bg-surfaceLight transition-colors"
                    >
                        <MessageSquare size={16} className="mr-2" /> Message
                    </button>
                    
                    <div className="relative">
                        <select 
                          className="appearance-none bg-surface border border-borderColor rounded-lg pl-4 pr-8 py-2 text-sm font-medium text-textMain focus:ring-2 focus:ring-primary outline-none cursor-pointer hover:bg-surfaceLight transition-colors"
                          value={member.status}
                          onChange={(e) => {
                             updateTeamMember({ ...member, status: e.target.value as any });
                          }}
                        >
                            <option value="Invited">Invited</option>
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronRight className="w-4 h-4 text-textMuted rotate-90" />
                        </div>
                    </div>

                    <button 
                        onClick={() => openDeleteMember(member)}
                        className="p-2 border border-borderColor rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 transition-colors"
                        title="Remove Member"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                <div className="mt-4 pt-2">
                    <p className="text-xs text-textMuted">Invited Nov 23, 2025</p>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
          <div className="bg-surface border border-borderColor rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Toolbar */}
              <div className="p-4 border-b border-borderColor flex justify-between items-center bg-surfaceLight/30">
                  <div className="flex items-center gap-2 overflow-x-auto">
                      <button 
                        onClick={() => setCurrentFolderId(null)}
                        className={`text-sm font-medium hover:text-primary ${currentFolderId === null ? 'text-textMain' : 'text-textMuted'}`}
                      >
                          Home
                      </button>
                      {getBreadcrumbs().slice(1).map(crumb => (
                          <React.Fragment key={crumb.id}>
                             <ChevronRight size={14} className="text-textMuted" />
                             <button 
                                onClick={() => crumb.id && enterFolder(crumb.id)}
                                className={`text-sm font-medium hover:text-primary whitespace-nowrap ${currentFolderId === crumb.id ? 'text-textMain' : 'text-textMuted'}`}
                             >
                                 {crumb.name}
                             </button>
                          </React.Fragment>
                      ))}
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => setIsNewFolderModalOpen(true)}
                        className="flex items-center px-3 py-1.5 bg-surface border border-borderColor rounded-lg text-sm text-textMain hover:bg-surfaceLight"
                     >
                        <FolderPlus size={16} className="mr-2" /> New Folder
                     </button>
                  </div>
              </div>

              {/* File List */}
              <table className="w-full text-left">
                  <thead className="bg-surfaceLight/50 text-textMuted text-xs uppercase border-b border-borderColor">
                      <tr>
                          <th className="px-6 py-4 font-semibold w-1/2">Name</th>
                          <th className="px-6 py-4 font-semibold">Type</th>
                          <th className="px-6 py-4 font-semibold">Uploaded By</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-borderColor">
                      {currentFolderId && (
                           <tr onClick={exitFolder} className="hover:bg-surfaceLight/20 transition-colors cursor-pointer group">
                               <td className="px-6 py-4" colSpan={4}>
                                   <div className="flex items-center gap-3 text-textMuted group-hover:text-primary">
                                       <ArrowLeft size={18} />
                                       <span className="text-sm font-medium">Back</span>
                                   </div>
                               </td>
                           </tr>
                      )}
                      
                      {visibleResources.map(resource => (
                          <tr 
                            key={resource.id} 
                            onClick={() => resource.isFolder ? enterFolder(resource.id) : openFilePreview(resource)}
                            className="hover:bg-surfaceLight/20 transition-colors cursor-pointer"
                          >
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="p-2 bg-surfaceLight rounded-lg border border-borderColor">
                                          {getFileIcon(resource.type)}
                                      </div>
                                      <div>
                                          <p className="font-medium text-textMain text-sm">{resource.name}</p>
                                          {resource.size && <p className="text-xs text-textMuted">{resource.size}</p>}
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="text-xs font-medium px-2 py-1 bg-surfaceLight border border-borderColor rounded text-textMain">
                                      {resource.type}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-textMuted">{resource.uploadedBy}</td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                      {!resource.isFolder && (
                                        <a 
                                            href={resource.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-2 text-textMuted hover:text-primary transition-colors" 
                                            title="Download"
                                        >
                                            <Download size={18} />
                                        </a>
                                      )}
                                      <button 
                                        onClick={() => openDeleteResource(resource)}
                                        className="p-2 text-textMuted hover:text-red-500 transition-colors"
                                        title="Delete"
                                      >
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {visibleResources.length === 0 && (
                          <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-textMuted">
                                  {currentFolderId ? 'This folder is empty.' : 'No resources shared yet. Upload a file or create a folder.'}
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}

      {/* --- MODALS --- */}

      {/* Invite Member */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-textMuted">Name</label>
            <input 
              required
              className="w-full mt-1 p-2 bg-surfaceLight border border-borderColor rounded outline-none focus:border-primary text-textMain"
              value={newMember.name}
              onChange={e => setNewMember({...newMember, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-textMuted">Email</label>
            <input 
              required
              type="email"
              className="w-full mt-1 p-2 bg-surfaceLight border border-borderColor rounded outline-none focus:border-primary text-textMain"
              value={newMember.email}
              onChange={e => setNewMember({...newMember, email: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-textMuted">Role</label>
            <select 
              className="w-full mt-1 p-2 bg-surfaceLight border border-borderColor rounded outline-none focus:border-primary text-textMain"
              value={newMember.role}
              onChange={e => setNewMember({...newMember, role: e.target.value})}
            >
              <option value="Viewer">Viewer (Read Only)</option>
              <option value="Editor">Editor (Can Upload)</option>
              <option value="Manager">Manager (Full Access)</option>
              <option value="Agent">Agent (Finance/Deals)</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-primary text-white rounded font-medium hover:bg-primaryHover">Send Invite</button>
        </form>
      </Modal>

      {/* Edit Member Role */}
      {selectedMember && (
        <Modal isOpen={isEditMemberModalOpen} onClose={() => setIsEditMemberModalOpen(false)} title={`Edit ${selectedMember.name}`}>
           <div className="space-y-4">
             <div>
                <label className="text-sm font-medium text-textMuted">Change Role</label>
                <select 
                  className="w-full mt-1 p-2 bg-surfaceLight border border-borderColor rounded outline-none focus:border-primary text-textMain"
                  value={selectedMember.role}
                  onChange={e => setSelectedMember({...selectedMember, role: e.target.value as TeamRole})}
                >
                  <option value="Viewer">Viewer (Read Only)</option>
                  <option value="Editor">Editor (Can Upload)</option>
                  <option value="Manager">Manager (Full Access)</option>
                  <option value="Agent">Agent (Finance/Deals)</option>
                </select>
                <p className="text-xs text-textMuted mt-2">
                   Changing the role will automatically update permissions for this user.
                </p>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditMemberModalOpen(false)}
                  className="flex-1 py-2 border border-borderColor text-textMuted rounded font-medium hover:bg-surfaceLight"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateMember}
                  className="flex-1 py-2 bg-primary text-white rounded font-medium hover:bg-primaryHover"
                >
                  Save Changes
                </button>
             </div>
           </div>
        </Modal>
      )}

      {/* Upload Resource */}
      <Modal isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)} title="Upload Resource">
          <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                  <label className="text-sm font-medium text-textMuted">Resource Name</label>
                  <input 
                    required
                    placeholder="e.g. 2024 Brand Kit"
                    className="w-full mt-1 p-2 bg-surfaceLight border border-borderColor rounded outline-none focus:border-primary text-textMain"
                    value={newResource.name}
                    onChange={e => setNewResource({...newResource, name: e.target.value})}
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-textMuted">Type</label>
                    <select 
                        className="w-full mt-1 p-2 bg-surfaceLight border border-borderColor rounded outline-none focus:border-primary text-textMain"
                        value={newResource.type}
                        onChange={e => setNewResource({...newResource, type: e.target.value})}
                    >
                        <option value="Link">Link / URL</option>
                        <option value="PDF">PDF Document</option>
                        <option value="Doc">Word / Doc</option>
                        <option value="Image">Image</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-textMuted">URL / File Link</label>
                    <input 
                        required
                        placeholder="https://..."
                        className="w-full mt-1 p-2 bg-surfaceLight border border-borderColor rounded outline-none focus:border-primary text-textMain"
                        value={newResource.url}
                        onChange={e => setNewResource({...newResource, url: e.target.value})}
                    />
                  </div>
              </div>
              <button type="submit" className="w-full py-2 bg-primary text-white rounded font-medium hover:bg-primaryHover">Add Resource</button>
          </form>
      </Modal>

      {/* New Folder Modal */}
      <Modal isOpen={isNewFolderModalOpen} onClose={() => setIsNewFolderModalOpen(false)} title="Create New Folder">
         <form onSubmit={handleCreateFolder} className="space-y-4">
             <div>
                <label className="text-sm font-medium text-textMuted">Folder Name</label>
                <input 
                  required
                  placeholder="e.g. Invoices"
                  className="w-full mt-1 p-2 bg-surfaceLight border border-borderColor rounded outline-none focus:border-primary text-textMain"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                />
             </div>
             <button type="submit" className="w-full py-2 bg-primary text-white rounded font-medium hover:bg-primaryHover">Create Folder</button>
         </form>
      </Modal>

      {/* File Preview Modal */}
      {selectedResource && (
        <Modal isOpen={isFilePreviewOpen} onClose={() => setIsFilePreviewOpen(false)} title={selectedResource.name}>
           <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="p-4 bg-surfaceLight rounded-xl">
                 {getFileIcon(selectedResource.type)}
              </div>
              <p className="text-center text-textMuted">
                 This is a preview of <strong>{selectedResource.name}</strong>.
                 <br />
                 In a real application, the file content would render here.
              </p>
              <div className="flex gap-2">
                 <a href={selectedResource.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primaryHover">
                    Open/Download
                 </a>
                 <button onClick={() => setIsFilePreviewOpen(false)} className="px-4 py-2 border border-borderColor rounded-lg text-sm text-textMuted hover:bg-surfaceLight">
                    Close
                 </button>
              </div>
           </div>
        </Modal>
      )}

      {/* Confirm Deletes */}
      <ConfirmationModal 
         isOpen={isDeleteMemberConfirmOpen}
         onClose={() => setIsDeleteMemberConfirmOpen(false)}
         onConfirm={handleDeleteMember}
         title="Remove Team Member?"
         message={`Are you sure you want to remove ${selectedMember?.name}? They will lose access immediately.`}
         confirmLabel="Remove"
      />

      <ConfirmationModal 
         isOpen={isDeleteResourceConfirmOpen}
         onClose={() => setIsDeleteResourceConfirmOpen(false)}
         onConfirm={handleDeleteResource}
         title="Delete File?"
         message={`Are you sure you want to delete "${selectedResource?.name}"? This action cannot be undone.`}
         confirmLabel="Delete"
      />

      {/* AI Onboarding Modal */}
      <Modal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} title="AI Onboarding Assistant">
          <div className="space-y-4">
              <div className="p-4 bg-surfaceLight/50 rounded-lg border border-borderColor text-sm text-textMuted">
                  Generate a customized onboarding checklist and welcome email for new hires based on your creative niche.
              </div>
              
              <div className="flex gap-4 items-end">
                  <div className="flex-1">
                      <label className="text-sm font-medium text-textMuted mb-1 block">Role to Onboard</label>
                      <select 
                        className="w-full p-2 bg-surfaceLight border border-borderColor rounded outline-none focus:border-primary text-textMain"
                        value={aiTargetRole}
                        onChange={e => setAiTargetRole(e.target.value)}
                      >
                          <option>Video Editor</option>
                          <option>Social Media Manager</option>
                          <option>Graphic Designer</option>
                          <option>Brand Manager</option>
                          <option>Personal Assistant</option>
                      </select>
                  </div>
                  <button 
                    onClick={generateOnboarding}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center shadow-lg disabled:opacity-50"
                  >
                      {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="mr-2" />}
                      Generate
                  </button>
              </div>

              {aiOutput && (
                  <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-textMain">Generated Guide</h4>
                          <button onClick={copyToClipboard} className="text-xs flex items-center gap-1 text-primary font-medium hover:underline">
                              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                          </button>
                      </div>
                      <div className="bg-surfaceLight p-4 rounded-xl border border-borderColor text-sm text-textMain whitespace-pre-wrap max-h-[300px] overflow-y-auto leading-relaxed shadow-inner">
                          {aiOutput}
                      </div>
                  </div>
              )}
          </div>
      </Modal>
    </div>
  );
};

export default Team;
