
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Trash2, Image as ImageIcon, Save, Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Task, SocialPlatform, TaskStatus } from '../types';
import { GoogleGenAI } from '@google/genai';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  existingTask?: Task;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ isOpen, onClose, initialDate, existingTask }) => {
  const { addTask, updateTask, deleteTask, campaigns, showToast } = useData();
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>('Instagram');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [campaignId, setCampaignId] = useState('');

  // Initialize form when opening
  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        setTitle(existingTask.title);
        setDate(existingTask.dueDate);
        setPlatform(existingTask.platform || 'Instagram');
        setStatus(existingTask.status);
        setCaption(existingTask.caption || '');
        setHashtags(existingTask.hashtags || '');
        setImageUrl(existingTask.image || '');
        setCampaignId(existingTask.campaignId);
      } else {
        // New Post Mode
        setTitle('');
        setDate(initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setPlatform('Instagram');
        setStatus('To Do');
        setCaption('');
        setHashtags('');
        setImageUrl('');
        setCampaignId(campaigns.length > 0 ? campaigns[0].id : '');
      }
    }
  }, [isOpen, existingTask, initialDate, campaigns]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title || !date) return;

    const taskData: Task = {
      id: existingTask ? existingTask.id : Date.now().toString(),
      title,
      dueDate: date,
      campaignId: campaignId || 'general',
      status,
      notes: '', // Legacy field
      platform,
      caption,
      hashtags,
      image: imageUrl
    };

    if (existingTask) {
      updateTask(taskData);
    } else {
      addTask(taskData);
    }
    onClose();
  };

  const handleClone = () => {
    if (!existingTask) return;
    const newTask: Task = {
      ...existingTask,
      id: Date.now().toString(),
      title: `${existingTask.title} (Copy)`,
      status: 'To Do'
    };
    addTask(newTask);
    onClose();
  };

  const handleDelete = () => {
    if (existingTask) {
      if (confirm('Are you sure you want to delete this post?')) {
        deleteTask(existingTask.id);
        onClose();
      }
    }
  };

  // Mock Image Upload
  const handleImageUpload = () => {
    // In a real app, this would use an input[type="file"] and upload to cloud storage
    const mockImages = [
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
      'https://images.unsplash.com/photo-1600096194582-175881035b44?w=800&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'
    ];
    setImageUrl(mockImages[Math.floor(Math.random() * mockImages.length)]);
  };

  const handleAIGenerate = async () => {
    if (!title) return;
    setIsAIProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Write an engaging social media caption and 15 relevant hashtags for a ${platform} post about "${title}". Tone: Professional but fun. Return format: Caption first, then a line break, then Hashtags.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      // Simple splitting logic
      const parts = text.split('#');
      const generatedCaption = parts[0].trim();
      // Reconstruct hashtags
      const generatedHashtags = parts.length > 1 ? '#' + parts.slice(1).join('#') : '';

      setCaption(prev => prev ? prev + '\n\n' + generatedCaption : generatedCaption);
      setHashtags(generatedHashtags);

    } catch (e) {
      console.error(e);
      showToast('AI Generation failed', 'error');
    } finally {
      setIsAIProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-borderColor w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-borderColor bg-surfaceLight/30">
          <h3 className="text-xl font-bold text-textMain">
            {existingTask ? 'Edit Post' : 'Schedule New Post'}
          </h3>
          <div className="flex items-center gap-2">
            {existingTask && (
              <>
                <button onClick={handleClone} className="p-2 text-textMuted hover:text-primary transition-colors" title="Clone Post">
                  <Copy size={20} />
                </button>
                <button onClick={handleDelete} className="p-2 text-textMuted hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 text-textMuted hover:text-textMain transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body - Split View */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left: Form */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-borderColor space-y-5">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Post Title / Idea</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 5 Tips for Skincare"
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Platform</label>
                <select 
                  value={platform} 
                  onChange={e => setPlatform(e.target.value as SocialPlatform)}
                  className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Scheduled Date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value as TaskStatus)}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none"
                  >
                    <option value="To Do">Draft</option>
                    <option value="In Progress">In Review</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed/Published</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Campaign</label>
                  <select 
                    value={campaignId} 
                    onChange={e => setCampaignId(e.target.value)}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none"
                  >
                    <option value="">No Campaign</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
            </div>

            <div className="pt-4 border-t border-borderColor">
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-medium text-textMuted">Caption</label>
                 <button 
                  onClick={handleAIGenerate}
                  disabled={isAIProcessing || !title}
                  className="flex items-center gap-1 text-xs font-bold text-accent hover:underline disabled:opacity-50"
                 >
                   {isAIProcessing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                   AI Generate
                 </button>
              </div>
              <textarea 
                value={caption}
                onChange={e => setCaption(e.target.value)}
                rows={5}
                placeholder="Write your caption here..."
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Hashtags</label>
              <textarea 
                value={hashtags}
                onChange={e => setHashtags(e.target.value)}
                rows={2}
                placeholder="#creator #content..."
                className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain focus:ring-2 focus:ring-primary outline-none text-sm text-blue-500"
              />
            </div>
          </div>

          {/* Right: Preview & Visuals */}
          <div className="w-full md:w-1/3 bg-surfaceLight/20 p-6 flex flex-col gap-6 overflow-y-auto">
             <div className="space-y-2">
                <label className="block text-sm font-medium text-textMuted">Visuals</label>
                <div 
                  onClick={handleImageUpload}
                  className="aspect-square w-full rounded-xl border-2 border-dashed border-borderColor bg-surface hover:bg-surfaceLight transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group"
                >
                   {imageUrl ? (
                     <>
                        <img src={imageUrl} alt="Post preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <p className="text-white font-medium flex items-center"><ImageIcon size={16} className="mr-2"/> Change Image</p>
                        </div>
                     </>
                   ) : (
                     <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-surfaceLight flex items-center justify-center mx-auto mb-2">
                           <ImageIcon className="text-textMuted" />
                        </div>
                        <p className="text-sm font-medium text-textMain">Upload Image</p>
                        <p className="text-xs text-textMuted mt-1">Click to simulate upload</p>
                     </div>
                   )}
                </div>
             </div>

             {/* Phone Preview Mockup */}
             <div className="border border-borderColor rounded-xl bg-surface p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent"></div>
                   <div>
                      <div className="h-2 w-24 bg-surfaceLight rounded"></div>
                      <div className="h-2 w-16 bg-surfaceLight rounded mt-1"></div>
                   </div>
                </div>
                <div className="aspect-square bg-surfaceLight rounded-lg mb-3 overflow-hidden">
                   {imageUrl && <img src={imageUrl} className="w-full h-full object-cover" alt="Preview"/>}
                </div>
                <div className="space-y-2">
                   <p className="text-xs text-textMain line-clamp-3">
                     <span className="font-bold mr-1">you</span>
                     {caption || 'Your caption will appear here...'}
                   </p>
                   <p className="text-xs text-blue-500 line-clamp-2">
                     {hashtags || '#hashtags'}
                   </p>
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
            <Save size={18} className="mr-2" /> Save Post
          </button>
        </div>

      </div>
    </div>
  );
};
