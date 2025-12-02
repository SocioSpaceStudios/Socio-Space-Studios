
import React, { useState } from 'react';
import { Sparkles, Copy, RefreshCw, Check, Zap, User as UserIcon, History, Clock, CalendarPlus } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useData } from '../context/DataContext';
import type { ScriptHistoryItem, Task } from '../types';

const ScriptsGenerator: React.FC = () => {
  const { user, scriptsHistory, addScriptToHistory, showToast, addTask, campaigns } = useData();
  
  const [niche, setNiche] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Fun');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');

  const handleGenerate = async (mode: 'Standard' | 'Profile' | 'Random') => {
    setIsLoading(true);
    setActiveTab('generator'); // Switch to generator view to see result
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = '';
      let generatedNiche = niche;

      if (mode === 'Standard') {
         if (!niche || !topic) {
           showToast("Please enter a niche and topic, or use one of the magic buttons!", "error");
           setIsLoading(false);
           return;
         }
         prompt = `Generate 3 catchy social media hooks and a short script outline for a video about "${topic}" in the "${niche}" niche. Tone: ${tone}. Format with clear headings.`;
      } 
      else if (mode === 'Profile') {
         generatedNiche = user.niche || 'General Lifestyle';
         prompt = `Generate 3 catchy social media hooks and a short script outline for a video. The creator's niche is "${generatedNiche}" and their bio is "${user.bio}". Tone: ${tone}. Pick a trending topic relevant to this profile and mention what topic you chose at the top.`;
      } 
      else if (mode === 'Random') {
         generatedNiche = 'Randomly Selected';
         prompt = `Generate 3 catchy social media hooks and a short script outline for a viral video on a randomly selected trending topic (e.g. Life Hacks, Tech, Travel, Comedy). Tone: ${tone}. Clearly state the chosen topic at the top.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      const content = response.text || 'No content generated.';
      setOutput(content);
      showToast('New script generated successfully!');

      // Save to history
      const historyItem: ScriptHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        topic: mode === 'Standard' ? topic : (mode === 'Profile' ? 'Profile Based' : 'Surprise Me'),
        niche: mode === 'Standard' ? niche : (mode === 'Profile' ? user.niche || 'User Profile' : 'Random'),
        tone,
        content,
        mode
      };
      addScriptToHistory(historyItem);

    } catch (error) {
      console.error(error);
      setOutput('Error generating content. Please try again.');
      showToast('Failed to generate script', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const restoreFromHistory = (item: ScriptHistoryItem) => {
    setOutput(item.content);
    setNiche(item.niche);
    setTopic(item.topic);
    setTone(item.tone);
    setActiveTab('generator');
    showToast('Script restored from history', 'info');
  };

  const handleAddToCalendar = () => {
    if (!output) return;

    // Extract a title roughly
    const title = topic || output.split('\n')[0].substring(0, 30) + '...';

    const newTask: Task = {
        id: Date.now().toString(),
        title: `Record: ${title}`,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'To Do',
        campaignId: campaigns[0]?.id || 'general',
        notes: output, // Save the full script in notes
        platform: 'TikTok'
    };

    addTask(newTask);
    // Note: addTask already shows a toast, but maybe we want a specific one here.
    // The addTask in Context handles the toast, so we rely on that.
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-8rem)] flex flex-col pt-2">
      <div className="flex gap-6 h-full overflow-hidden flex-col lg:flex-row">
        {/* Left Panel: Controls & Input */}
        <div className="w-full lg:w-1/3 bg-surface border border-borderColor rounded-xl p-6 shadow-sm flex flex-col overflow-y-auto">
           
           {/* Mobile Tabs */}
           <div className="flex lg:hidden mb-6 bg-surfaceLight p-1 rounded-lg">
             <button 
               onClick={() => setActiveTab('generator')}
               className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'generator' ? 'bg-surface shadow text-primary' : 'text-textMuted'}`}
             >
               Generator
             </button>
             <button 
               onClick={() => setActiveTab('history')}
               className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'history' ? 'bg-surface shadow text-primary' : 'text-textMuted'}`}
             >
               History
             </button>
           </div>

           <div className={`${activeTab === 'generator' ? 'block' : 'hidden'} lg:block space-y-6`}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Your Niche</label>
                  <input 
                    type="text" 
                    placeholder="e.g., beauty, fitness, tech"
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none focus:ring-2 focus:ring-accent"
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Topic</label>
                  <input 
                    type="text" 
                    placeholder="e.g., morning routines"
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none focus:ring-2 focus:ring-accent"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Tone</label>
                  <select 
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-3 text-textMain outline-none focus:ring-2 focus:ring-accent"
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                  >
                    <option>Fun</option>
                    <option>Professional</option>
                    <option>Educational</option>
                    <option>Inspirational</option>
                    <option>Controversial</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-borderColor">
                <button 
                  onClick={() => handleGenerate('Standard')}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {isLoading ? 'Generating...' : 'Generate Script'}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleGenerate('Profile')}
                    disabled={isLoading}
                    className="py-3 bg-surfaceLight border border-borderColor hover:bg-surface text-textMain font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <UserIcon size={16} className="text-blue-500" />
                    Use My Profile
                  </button>
                  <button 
                    onClick={() => handleGenerate('Random')}
                    disabled={isLoading}
                    className="py-3 bg-surfaceLight border border-borderColor hover:bg-surface text-textMain font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Zap size={16} className="text-yellow-500" />
                    Surprise Me
                  </button>
                </div>
              </div>
           </div>

           {/* Desktop History Sidebar (Integrated below inputs if screen allows, but keeping separate for now or utilizing scroll) */}
           <div className={`${activeTab === 'history' ? 'block' : 'hidden'} lg:block lg:mt-8 pt-6 lg:border-t border-borderColor flex-1 overflow-hidden flex flex-col`}>
              <h3 className="font-bold text-textMuted uppercase text-xs mb-3 flex items-center gap-2">
                <History size={14} /> Recent Generations
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                 {scriptsHistory.length === 0 ? (
                   <div className="text-center p-4 text-textMuted text-sm italic">
                     No history yet. Generate something!
                   </div>
                 ) : (
                   scriptsHistory.map((item) => (
                     <div 
                       key={item.id}
                       onClick={() => restoreFromHistory(item)}
                       className="p-3 rounded-lg border border-borderColor bg-surfaceLight/30 hover:bg-surfaceLight cursor-pointer transition-colors group"
                     >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase
                            ${item.mode === 'Random' ? 'bg-yellow-100 text-yellow-700' : 
                              item.mode === 'Profile' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {item.mode}
                          </span>
                          <span className="text-[10px] text-textMuted">{new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm font-medium text-textMain line-clamp-1">{item.topic}</p>
                        <p className="text-xs text-textMuted mt-1 line-clamp-2 opacity-70">{item.content.substring(0, 100)}...</p>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>

        {/* Right Panel: Output */}
        <div className={`w-full lg:w-2/3 bg-surface border border-borderColor rounded-xl p-8 shadow-sm overflow-y-auto ${activeTab === 'generator' ? 'block' : 'hidden'} lg:block`}>
          {output ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-borderColor">
                <div>
                   <h3 className="text-xl font-bold text-textMain">Generated Result</h3>
                   <p className="text-xs text-textMuted flex items-center mt-1">
                     <Clock size={12} className="mr-1"/> Generated just now
                   </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleAddToCalendar}
                    className="px-4 py-2 bg-accent/10 hover:bg-accent hover:text-white text-accent rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-accent/20"
                    title="Add as Task"
                  >
                    <CalendarPlus size={16} /> Schedule Idea
                  </button>
                  <button 
                    onClick={() => copyToClipboard(output)}
                    className="px-4 py-2 bg-surfaceLight hover:bg-primary hover:text-white rounded-lg text-textMuted transition-colors flex items-center gap-2 text-sm font-medium border border-borderColor" 
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy Text'}
                  </button>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none text-textMain whitespace-pre-wrap leading-relaxed overflow-y-auto flex-1 custom-scrollbar">
                {output}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-textMuted p-8">
               <div className="w-20 h-20 bg-surfaceLight rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Sparkles size={40} className="text-borderColor" />
               </div>
               <h3 className="text-xl font-bold text-textMain mb-2">Ready to Create?</h3>
               <p className="max-w-md">
                 Use the panel on the left to generate viral hooks, scripts, and ideas tailored to your brand.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptsGenerator;
