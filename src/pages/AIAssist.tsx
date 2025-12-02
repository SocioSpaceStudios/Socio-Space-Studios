
import React, { useState } from 'react';
import { Sparkles, PenTool, Mail, Lightbulb, ArrowRight, Copy, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';

const tools = [
  {
    id: 'hook',
    title: 'Hook Generator',
    icon: <Sparkles size={24} className="text-yellow-500" />,
    description: 'Create scroll-stopping hooks for your short-form videos.',
    placeholderInput: 'Topic: Skincare for beginners...',
    placeholderOutput: '1. Stop making these 3 skincare mistakes!\n2. The secret to glowing skin isn\'t what you think...\n3. Why your moisturizer isn\'t working.'
  },
  {
    id: 'script',
    title: 'Script Writer',
    icon: <PenTool size={24} className="text-blue-500" />,
    description: 'Generate full scripts based on a topic and tone.',
    placeholderInput: 'Topic: iPhone 15 Review, Tone: Tech Enthusiast...',
    placeholderOutput: '[Intro]\n"Is the iPhone 15 actually worth the upgrade? Let\'s dive in."\n\n[Body]\n"First off, the camera..."'
  },
  {
    id: 'pitch',
    title: 'Pitch Email Writer',
    icon: <Mail size={24} className="text-green-500" />,
    description: 'Draft professional brand partnership pitches.',
    placeholderInput: 'Brand: Nike, Angle: Marathon training...',
    placeholderOutput: 'Subject: Collaboration Idea: Road to Marathon\n\nHi Team Nike,\n\nI\'ve been a huge fan of the Pegasus line...'
  },
  {
    id: 'ideas',
    title: 'Content Ideas',
    icon: <Lightbulb size={24} className="text-purple-500" />,
    description: 'Brainstorm viral video concepts for your niche.',
    placeholderInput: 'Niche: Home Office Setup...',
    placeholderOutput: '1. "Budget Desk Makeover under $50"\n2. "Cable Management ASMR"\n3. "My Productivity Workflow"'
  }
];

const AIAssist: React.FC = () => {
  const { showToast } = useData();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    // Simulate AI delay
    setTimeout(() => {
      const tool = tools.find(t => t.id === activeTool);
      setOutput(tool?.placeholderOutput || 'Generated content...');
      setIsGenerating(false);
      showToast('Content generated!');
    }, 1500);
  };

  const handleToolSelect = (id: string) => {
    setActiveTool(id);
    setInput('');
    setOutput('');
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-textMain mb-2 flex items-center justify-center gap-3">
          <Sparkles className="text-primary" /> AI Assist
        </h2>
        <p className="text-textMuted">
          Supercharge your creative workflow with AI helpers to generate hooks, scripts, pitches, and content ideas.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map(tool => (
          <div 
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className={`bg-surface border rounded-xl p-6 cursor-pointer transition-all hover:shadow-md group
              ${activeTool === tool.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-borderColor hover:border-primary/50'}`}
          >
            <div className="mb-4 p-3 bg-surfaceLight rounded-lg w-fit group-hover:scale-110 transition-transform">
              {tool.icon}
            </div>
            <h3 className="font-bold text-textMain mb-2">{tool.title}</h3>
            <p className="text-sm text-textMuted">{tool.description}</p>
          </div>
        ))}
      </div>

      {/* Active Tool Workspace */}
      {activeTool && (
        <div className="bg-surface border border-borderColor rounded-xl p-6 lg:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-borderColor">
            {tools.find(t => t.id === activeTool)?.icon}
            <h3 className="text-xl font-bold text-textMain">{tools.find(t => t.id === activeTool)?.title}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-textMuted">Your Input</label>
              <textarea 
                className="w-full h-64 bg-surfaceLight border border-borderColor rounded-xl p-4 text-textMain focus:ring-2 focus:ring-primary outline-none resize-none"
                placeholder={tools.find(t => t.id === activeTool)?.placeholderInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !input.trim()}
                className="w-full py-3 bg-primary hover:bg-primaryHover text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {isGenerating ? 'Generating...' : 'Generate Result'}
              </button>
            </div>

            {/* Output */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-textMuted">AI Output</label>
                {output && (
                  <button 
                    onClick={() => { navigator.clipboard.writeText(output); showToast('Copied!'); }}
                    className="text-xs flex items-center text-primary hover:underline"
                  >
                    <Copy size={14} className="mr-1" /> Copy
                  </button>
                )}
              </div>
              <div className="w-full h-64 bg-surface border border-borderColor rounded-xl p-4 text-textMain overflow-y-auto relative">
                {output ? (
                  <p className="whitespace-pre-wrap">{output}</p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-textMuted opacity-50">
                    <ArrowRight size={32} className="mb-2" />
                    <p>Result will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssist;
