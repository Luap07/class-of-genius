import React from "react";
import { Brain, Sparkles, Atom, FlaskConical, Beaker, TestTube, Droplets, TableProperties, Zap, Microscope, ChevronRight, X } from "lucide-react";

export default function ChemistrySidebar({ experiment, setExperiment, onClose }) {
  const sections = [
    {
      title: "Core Concepts",
      items: [
        { name: "Periodic Table", icon: TableProperties, description: "Explore chemical elements" },
        { name: "Atom Builder", icon: Atom, description: "Build atomic structures" },
        { name: "Molecule Builder", icon: Beaker, description: "Create molecular compounds" },
      ],
    },
    {
      title: "Laboratory Experiments",
      items: [
        { name: "Chemical Reactions", icon: FlaskConical, description: "Observe reaction outcomes" },
        { name: "Acid vs Base", icon: Droplets, description: "Compare pH properties" },
        { name: "Titration Lab", icon: TestTube, description: "Perform neutralization tests" },
      ],
    },
    {
      title: "Advanced Studies",
      items: [
        { name: "Solution Lab", icon: Microscope, description: "Analyze concentrations" },
        { name: "Electrochemistry", icon: Zap, description: "Study electron transfer" },
      ],
    },
  ];

  return (
    <aside className="w-70 bg-slate-950 border-r border-slate-800 flex flex-col h-screen overflow-hidden relative">
      {/* Mobile Close Button */}
      <button onClick={onClose} className="absolute top-6 right-4 p-2 text-slate-400 xl:hidden">
        <X size={20} />
      </button>

      {/* HEADER SECTION */}
      <div className="p-6 border-b border-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20" />
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Brain size={24} className="text-white" />
            </div>
          </div>
          <div>
            {/* Title with Absolute Sparkle Badge */}
            <div className="relative flex items-center">
              <h1 className="text-white font-bold text-lg">Study AI</h1>
              <span className="absolute -top-1 -right-4 text-cyan-400">
                <Sparkles size={12} />
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Interactive Chemistry Laboratory</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION SECTION */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {sections.map((section) => (
          <section key={section.title} className="mb-8">
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-slate-500">{section.title}</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>
            
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = experiment === item.name;
                return (
                  <button 
                    key={item.name} 
                    onClick={() => { 
                      setExperiment(item.name); 
                      if(window.innerWidth < 1280) onClose(); 
                    }} 
                    className={`group relative w-full text-left rounded-2xl transition-all duration-300 border ${
                      active 
                        ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border-cyan-500/30" 
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className={`flex items-center justify-center h-11 w-11 rounded-xl transition-all ${active ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-300">{item.name}</h4>
                      </div>
                      <ChevronRight size={16} className={active ? "text-cyan-400" : "text-slate-600"} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}