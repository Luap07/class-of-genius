import React, { useState } from "react";
import { Check, ChevronRight, ChevronDown, Flame, BookOpen } from "lucide-react";

const AISessionProfile = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  // Dynamic variables for your logic
  const progress = 65; 
  const currentTopic = 4;
  const totalTopics = 8;

  const topics = [
    { name: "Introduction", done: true },
    { name: "Expressions", done: true },
    { name: "Quadratic Eq.", done: false, active: true },
    { name: "Factorization", done: false },
    { name: "Applications", done: false },
  ];

  const Section = ({ children }) => (
    <div className="bg-[#111827] border border-slate-800 p-5 rounded-3xl mb-4">
      {children}
    </div>
  );

  return (
    <div className="w-80 bg-[#0b1120] border border-slate-800 rounded-[32px] p-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
      
      {/* 1. SUBJECT */}
      <Section>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-slate-400 text-[10px] uppercase tracking-widest">Current Subject</h3>
            <p className="text-[#3b82f6] font-bold text-lg mt-1">Mathematics</p>
            <p className="text-slate-300 text-sm">Algebra</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-2xl">
            <BookOpen className="text-emerald-500" size={20} />
          </div>
        </div>
      </Section>

      {/* 2. DYNAMIC PROGRESS (No SVG) */}
      <Section>
        <h3 className="text-slate-400 text-[10px] uppercase tracking-widest mb-6">Lesson Progress</h3>
        <div className="flex items-center gap-6">
          {/* Conic Gradient Progress Ring */}
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center relative"
            style={{ 
              background: `conic-gradient(#10b981 ${progress}%, #3b82f6 ${progress}%, #1e293b 0%)` 
            }}
          >
            <div className="w-[85%] h-[85%] rounded-full bg-[#111827] flex flex-col items-center justify-center">
              <span className="font-bold text-md">{progress}%</span>
            </div>
          </div>
          
          {/* Topics Covered Rating */}
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{currentTopic}/{totalTopics}</span>
            <span className="text-[10px] text-slate-400 uppercase">Topics Covered</span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <p className="text-sm mt-6 mb-2 font-medium">Lesson {currentTopic} of {totalTopics}</p>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#3b82f6] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </Section>

      {/* 3. TOPICS LIST */}
      <Section>
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Topics {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {isOpen && (
          <div className="space-y-1">
            {topics.map((t, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm ${t.active ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" : "text-slate-500"}`}>
                <span>{t.name}</span>
                {t.done ? <Check size={14} className="text-green-500" /> : null}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 4. STREAK */}
      <Section>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={18} />
            <span className="text-sm font-semibold text-slate-300">Streak</span>
          </div>
          <span className="text-lg font-bold text-orange-400">12 Days</span>
        </div>
      </Section>
    </div>
  );
};

export default AISessionProfile;