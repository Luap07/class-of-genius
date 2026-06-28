import React, { useMemo, useState } from "react";
import { Menu } from "lucide-react";
import elements from "../data/elements";

import ChemistrySidebar from "../components/chemistry/ChemistrySidebar";
import ChemistryHeader from "../components/chemistry/ChemistryHeader";
import SearchBar from "../components/chemistry/SearchBar";
import PeriodicLegend from "../components/chemistry/PeriodicLegend";
import ElementCard from "../components/chemistry/ElementCard";
import ElementInfoPanel from "../components/chemistry/ElementInfoPanel";

import AtomBuilder from "./VirtualLab/chemistry/AtomBuilder";
import MolecularBuilder from "./VirtualLab/chemistry/MolecularBuilder";

const ChemistryLab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedElement, setSelectedElement] = useState(null);
  const [experiment, setExperiment] = useState("Periodic Table");
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
    <div className="flex h-screen w-full bg-slate-950 text-white overflow-hidden relative">

      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 transition-transform duration-300 xl:relative xl:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ChemistrySidebar
          experiment={experiment}
          setExperiment={setExperiment}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* MOBILE MENU */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-5 left-4 z-40 p-2 rounded-lg bg-slate-900 border border-slate-700 xl:hidden"
        >
          <Menu size={24} />
        </button>
      )}

      {/* MAIN */}
      <main className="flex-1 h-screen overflow-y-auto p-6">
        <ChemistryHeader />

        {/* DEBUG (optional) */}
        <div className="text-cyan-400 mb-3">
          Current: {experiment}
        </div>

        {/* ================= PERIODIC TABLE ================= */}
        {experiment === "Periodic Table" && (
          <div className="animate-in fade-in duration-500 pb-10">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Interactive Periodic Table
              </h1>
              <p className="text-slate-400 mt-2">
                Complete set of 118 Elements
              </p>
            </div>

            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            <PeriodicLegend />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
              <div
                className={`overflow-x-auto ${
                  selectedElement
                    ? "xl:col-span-3"
                    : "xl:col-span-4"
                }`}
              >
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns:
                      "repeat(18, minmax(60px,1fr))",
                    width: "max-content",
                  }}
                >
                  {Array.from({ length: 10 }).map((_, r) =>
                    Array.from({ length: 18 }).map((_, c) => {
                      const element =
                        elementMap[`${r + 1}-${c + 1}`];

                      return (
                        <div
                          key={`${r}-${c}`}
                          className="min-h-[72px] w-[60px]"
                        >
                          {element ? (
                            <ElementCard
                              element={element}
                              active={
                                selectedElement?.number ===
                                element.number
                              }
                              onClick={() =>
                                setSelectedElement((prev) =>
                                  prev?.number === element.number
                                    ? null
                                    : element
                                )
                              }
                            />
                          ) : (
                            <div />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {selectedElement && (
                <div className="xl:col-span-1">
                  <ElementInfoPanel
                    element={selectedElement}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= ATOM BUILDER ================= */}
        {experiment === "Atom Builder" && <AtomBuilder />}

        {/* ================= MOLECULE BUILDER ================= */}
        {experiment === "Molecule Builder" && (
          <MolecularBuilder />
        )}

        {/* ================= FALLBACK ================= */}
        {![
          "Periodic Table",
          "Atom Builder",
          "Molecule Builder",
        ].includes(experiment) && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <h2 className="text-2xl font-bold text-white">
              {experiment}
            </h2>
            <p className="mt-2">
              This laboratory experiment is currently in development.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChemistryLab;