import React, { useMemo, useState } from "react";
import { Menu } from "lucide-react"; // Import Menu icon for the toggle
import elements from "../data/elements";

import ChemistrySidebar from "../components/chemistry/ChemistrySidebar";
import ChemistryHeader from "../components/chemistry/ChemistryHeader";
import SearchBar from "../components/chemistry/SearchBar";
import PeriodicLegend from "../components/chemistry/PeriodicLegend";
import ElementCard from "../components/chemistry/ElementCard";
import ElementInfoPanel from "../components/chemistry/ElementInfoPanel";

const ChemistryLab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedElement, setSelectedElement] = useState(null);
  const [experiment, setExperiment] = useState("Periodic Table");
  // Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredElements = useMemo(() => {
    return elements.filter(
      (el) =>
        el.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        el.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(el.number).includes(searchTerm)
    );
  }, [searchTerm]);

  const elementMap = useMemo(() => {
    const map = {};
    filteredElements.forEach((el) => {
      map[`${el.row}-${el.col}`] = el;
    });
    return map;
  }, [filteredElements]);

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
      
      {/* Sidebar Wrapper: fixed on mobile, relative on XL screens */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-70 bg-slate-950 border-r border-slate-800 transition-transform duration-300
        xl:relative xl:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <ChemistrySidebar 
          experiment={experiment} 
          setExperiment={setExperiment} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </div>

      {/* Mobile Toggle Button */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-6 left-4 z-40 p-2 bg-slate-900 border border-slate-800 text-white rounded-lg xl:hidden"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-6 transition-all duration-300">
        <ChemistryHeader />

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Interactive Periodic Table
          </h1>
          <p className="text-slate-400 mt-2">Complete set of 118 elements</p>
        </div>

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <PeriodicLegend />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
          <div className={`overflow-x-auto ${selectedElement ? "xl:col-span-3" : "xl:col-span-4"}`}>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(18, minmax(60px, 1fr))", width: "max-content" }}>
              {Array.from({ length: 10 }).map((_, r) =>
                Array.from({ length: 18 }).map((_, c) => {
                  const row = r + 1;
                  const col = c + 1;
                  const element = elementMap[`${row}-${col}`];
                  if ((row === 8 || row === 9) && col < 4) return <div key={`spacer-${row}-${col}`} />;
                  return (
                    <div key={`${row}-${col}`} className="min-h-[72px] w-[60px]">
                      {element ? (
                        <ElementCard
                          element={element}
                          onClick={() => setSelectedElement(prev => (prev?.number === element.number ? null : element))}
                          active={selectedElement?.number === element.number}
                        />
                      ) : <div className="h-full" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {selectedElement && (
            <div className="xl:col-span-1 transition-all duration-300">
              <ElementInfoPanel element={selectedElement} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pb-10">
          <StatCard label="Total Elements" value={elements.length} />
          <StatCard label="Selected" value={selectedElement ? selectedElement.symbol : "--"} />
          <StatCard label="Atomic #" value={selectedElement ? selectedElement.number : "--"} />
          <StatCard label="Category" value={selectedElement ? selectedElement.category : "--"} />
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
    <p className="text-slate-200 text-sm">{label}</p>
    <h2 className="text-xl font-bold text-white capitalize mt-1">{value}</h2>
  </div>
);

export default ChemistryLab;