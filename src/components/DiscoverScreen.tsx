import React from 'react';
import {
  ArrowLeft,
  Sparkles,
  PenTool,
  Code2,
  Languages,
  FileText,
  Lightbulb,
  Calculator,
  Compass,
  Zap,
} from 'lucide-react';

interface DiscoverScreenProps {
  onBack: () => void;
  onSelectTool: (prompt: string) => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onBack,
  onSelectTool,
}) => {
  const tools = [
    {
      id: 'writing',
      title: 'AI Writing Assistant',
      description: 'Draft articles, executive emails, poetry, and persuasive copy.',
      icon: PenTool,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      prompt: 'Write an executive-level summary and persuasive announcement regarding our new breakthrough platform launch.',
    },
    {
      id: 'translate',
      title: 'Hindi & Hinglish Translator',
      description: 'Convert smoothly between English, Hindi, and colloquial Hinglish.',
      icon: Languages,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      prompt: 'Namaste! Please translate and explain this message into friendly conversational Hinglish: "We are thrilled to welcome you to our next-generation AI assistant ecosystem."',
    },
    {
      id: 'code',
      title: 'Code Architect',
      description: 'Generate clean Kotlin Compose, TypeScript, or Python solutions.',
      icon: Code2,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      prompt: 'Show me an idiomatic Kotlin Jetpack Compose implementation of a ViewModel with StateFlow and Coroutines for an AI chat screen.',
    },
    {
      id: 'summarize',
      title: 'Summarization Engine',
      description: 'Condense documents, books, or lengthy notes into high-signal takeaways.',
      icon: FileText,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      prompt: 'Please provide a 3-bullet executive summary and key actionable takeaways for the following text:',
    },
    {
      id: 'brainstorm',
      title: 'Innovation Ideator',
      description: 'Generate unique startup angles, product features, and creative breakthroughs.',
      icon: Lightbulb,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      prompt: 'Brainstorm 5 innovative AI features that make a mobile voice assistant feel alive and empathetic rather than robotic.',
    },
    {
      id: 'math',
      title: 'Logic & Math Solver',
      description: 'Step-by-step mathematical reasoning and proofs with explanations.',
      icon: Calculator,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      prompt: 'Explain Bayes Theorem with an intuitive medical diagnostic example, breaking down prior, likelihood, and posterior probabilities.',
    },
  ];

  return (
    <div className="flex flex-col min-h-full pb-24 pt-3 px-4 max-w-lg mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide uppercase flex items-center space-x-2">
            <span>Discover</span>
            <Compass className="w-4 h-4 text-red-500" />
          </h1>
          <p className="text-xs text-slate-400">Curated intelligence modules & neural tools</p>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-[#14141e] border border-red-500/30">
        <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Multimodal Intelligence Hub</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Tap any tool below to launch an optimized conversational workflow powered by Google Gemini 3.8 Flash.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.prompt)}
              className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-[#14141e] border border-white/5 hover:border-red-500/40 text-left transition-all active:scale-[0.99] group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${tool.color} group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-2">
                <div className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                  {tool.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 leading-snug">
                  {tool.description}
                </div>
              </div>
              <Zap className="w-4 h-4 text-slate-600 group-hover:text-red-400 shrink-0 self-center transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
