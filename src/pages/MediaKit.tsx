
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { FileDown, Plus, Trash2, Upload, Mail, Save } from 'lucide-react';
import type { MediaKit as MediaKitType, SocialStat } from '../types';

const MediaKit: React.FC = () => {
  const { user, mediaKit, updateMediaKit } = useData();
  
  // Local state for editing, initialized from global context
  const [kitData, setKitData] = useState<MediaKitType>({
    ...mediaKit,
    avatarUrl: mediaKit.avatarUrl || user.avatarUrl
  });

  // Sync with context if it changes externally (rare, but good practice)
  useEffect(() => {
    setKitData({
        ...mediaKit,
        avatarUrl: mediaKit.avatarUrl || user.avatarUrl
    });
  }, [mediaKit, user.avatarUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKitData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateMediaKit(kitData);
  };

  const handleExport = () => {
    window.print();
  };

  const handleImageUpload = () => {
    // Simulate upload
    const mockImages = [
       'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
       'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80',
       'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80'
    ];
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    setKitData(prev => ({ ...prev, avatarUrl: randomImage }));
  };

  // --- Dynamic Social Stats Logic ---
  const handleAddStat = () => {
    const newStat: SocialStat = {
      id: Date.now().toString(),
      platform: 'Instagram',
      handle: '',
      value: '',
      label: 'Followers'
    };
    setKitData(prev => ({ ...prev, socialStats: [...prev.socialStats, newStat] }));
  };

  const handleRemoveStat = (id: string) => {
    setKitData(prev => ({ ...prev, socialStats: prev.socialStats.filter(s => s.id !== id) }));
  };

  const handleStatChange = (id: string, field: keyof SocialStat, value: string) => {
    setKitData(prev => ({
      ...prev,
      socialStats: prev.socialStats.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8">
       {/* Editor (Hidden when printing) */}
       <div className="flex-1 overflow-y-auto pr-2 print:hidden flex flex-col">
         <div className="mb-6 flex justify-end items-center">
           <button 
             onClick={handleSave} 
             className="px-6 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-2 bg-primary text-white hover:bg-primaryHover"
           >
             <Save size={18} />
             Save Changes
           </button>
         </div>

         <div className="bg-surface border border-borderColor rounded-xl p-6 space-y-8 shadow-sm">
            {/* Visual Identity */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">Visual Identity</h3>
               <div className="flex items-center gap-6">
                 <div 
                   onClick={handleImageUpload}
                   className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-borderColor hover:border-primary transition-colors"
                 >
                    <img src={kitData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Upload size={20} className="text-white" />
                    </div>
                 </div>
                 <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-textMuted mb-1">Primary Color</label>
                        <input type="color" name="primaryColor" value={kitData.primaryColor} onChange={handleChange} className="w-full h-10 rounded cursor-pointer border border-borderColor p-1 bg-surface" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-textMuted mb-1">Secondary Color</label>
                        <input type="color" name="secondaryColor" value={kitData.secondaryColor} onChange={handleChange} className="w-full h-10 rounded cursor-pointer border border-borderColor p-1 bg-surface" />
                    </div>
                 </div>
               </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">Profile Info</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Display Name</label>
                    <input name="displayName" value={kitData.displayName} onChange={handleChange} className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Handle</label>
                    <input name="handle" value={kitData.handle} onChange={handleChange} className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Niche</label>
                    <input name="niche" value={kitData.niche} onChange={handleChange} className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Contact Email</label>
                    <input name="email" value={kitData.email} onChange={handleChange} className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain" />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Bio</label>
                  <textarea name="bio" value={kitData.bio} rows={3} onChange={handleChange} className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain" />
               </div>
            </div>
            
            {/* Social Stats */}
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">Key Metrics</h3>
                 <button onClick={handleAddStat} className="text-xs flex items-center text-primary font-bold hover:underline">
                    <Plus size={14} className="mr-1" /> Add Metric
                 </button>
               </div>
               
               <div className="space-y-3">
                  {kitData.socialStats.map((stat) => (
                    <div key={stat.id} className="flex items-center gap-2 bg-surfaceLight/30 p-2 rounded-lg border border-borderColor">
                       <select 
                         value={stat.platform}
                         onChange={(e) => handleStatChange(stat.id, 'platform', e.target.value)}
                         className="bg-surface border border-borderColor rounded p-1.5 text-xs text-textMain outline-none w-24"
                       >
                         <option value="Instagram">Instagram</option>
                         <option value="TikTok">TikTok</option>
                         <option value="YouTube">YouTube</option>
                         <option value="Twitter">Twitter</option>
                         <option value="LinkedIn">LinkedIn</option>
                         <option value="Website">Website</option>
                         <option value="Other">Other</option>
                       </select>
                       <input 
                         placeholder="Value (e.g. 100K)" 
                         value={stat.value}
                         onChange={(e) => handleStatChange(stat.id, 'value', e.target.value)}
                         className="flex-1 bg-surface border border-borderColor rounded p-1.5 text-xs text-textMain outline-none"
                       />
                       <input 
                         placeholder="Label (e.g. Followers)" 
                         value={stat.label}
                         onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                         className="flex-1 bg-surface border border-borderColor rounded p-1.5 text-xs text-textMain outline-none"
                       />
                       <button onClick={() => handleRemoveStat(stat.id)} className="p-1.5 text-textMuted hover:text-red-500 transition-colors">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
         </div>
       </div>

       {/* Preview (Full screen when printing) */}
       <div className="flex-1 lg:block h-full print:w-full print:h-screen print:fixed print:top-0 print:left-0 print:z-50 print:p-0">
         <div 
           className="w-full h-full rounded-2xl shadow-2xl p-8 text-white flex flex-col items-center text-center relative overflow-hidden print:rounded-none"
           style={{ background: `linear-gradient(135deg, ${kitData.primaryColor}, ${kitData.secondaryColor})`, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
         >
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>

            <div className="relative z-10 w-full flex flex-col items-center h-full max-w-lg mx-auto">
               <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center text-4xl mb-4 shadow-xl border-2 border-white/40 overflow-hidden">
                 {kitData.avatarUrl ? (
                    <img src={kitData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    kitData.displayName.charAt(0)
                 )}
               </div>
               
               <h2 className="text-4xl font-bold mb-1 tracking-tight">{kitData.displayName}</h2>
               <p className="text-lg opacity-90 font-medium mb-3">{kitData.handle}</p>
               
               <span className="bg-white/20 px-4 py-1 rounded-full text-sm backdrop-blur-md border border-white/20 mb-6 font-semibold shadow-sm">
                 {kitData.niche} Creator
               </span>

               <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20 text-center shadow-lg">
                 <p className="opacity-95 leading-relaxed text-base font-medium">
                   {kitData.bio || "Tell brands about yourself and what makes you unique..."}
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-4 w-full mb-auto">
                  {kitData.socialStats.map(stat => (
                     <div key={stat.id} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                        <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                        <div className="flex items-center justify-center gap-1 opacity-80 text-xs uppercase tracking-wide font-medium mt-1">
                           {/* Simple Icon Logic based on string matching */}
                           {stat.platform} {stat.label}
                        </div>
                     </div>
                  ))}
               </div>

               <div className="w-full mt-8 space-y-4 print:hidden">
                 {kitData.email && (
                    <a 
                      href={`mailto:${kitData.email}`}
                      className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-lg"
                    >
                      <Mail size={20} /> Contact Me
                    </a>
                 )}
                 <button 
                  onClick={handleExport}
                  className="w-full bg-black/20 text-white border border-white/30 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/30 transition-colors"
                 >
                   <FileDown size={20} /> Export PDF
                 </button>
               </div>
               
               {/* Print Only Contact Info */}
               <div className="hidden print:block mt-auto pt-8 opacity-80 text-sm">
                  <p>Contact: {kitData.email}</p>
               </div>
            </div>
         </div>
       </div>
    </div>
  );
};

export default MediaKit;
