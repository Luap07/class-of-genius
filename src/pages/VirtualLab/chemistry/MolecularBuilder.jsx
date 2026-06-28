import { useState, useRef } from "react";

import Toolbar from "../../../components/chemistry/Toolbar";
import AtomPalette from "../../../components/chemistry/AtomPalette";
import BondTool from "../../../components/chemistry/BondTool";
import MoleculeCanvas from "../../../components/chemistry/MoleculeCanvas";
import MoleculeStats from "../../../components/chemistry/MoleculeStats";

export default function MolecularBuilder() {
  const [atoms, setAtoms] = useState([]);
  const [bonds, setBonds] = useState([]);

  const [selectedAtom, setSelectedAtom] = useState(null);
  const [selectedBond, setSelectedBond] = useState(null);

  const [moleculeName, setMoleculeName] = useState("Untitled Molecule");

  const [bondType, setBondType] = useState("single");
  const [bondMode, setBondMode] = useState(false);

  // ✅ FIX: always keep latest bondType in ref (prevents stale state bug)
  const bondTypeRef = useRef(bondType);

  const setBondTypeSafe = (type) => {
    bondTypeRef.current = type;
    setBondType(type);
  };

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).slice(2);

  /* ================= ADD ATOM ================= */
  const addAtom = (element) => {
    const newAtom = {
      id: generateId(),
      symbol: element.symbol,
      name: element.name,
      color: element.color || "#06b6d4",
      atomicNumber: element.number,
      x: 300 + Math.random() * 120,
      y: 200 + Math.random() * 120,
    };

    setAtoms((prev) => [...prev, newAtom]);
  };

  /* ================= MOVE ATOM ================= */
  const moveAtom = (id, x, y) => {
    setAtoms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, x, y } : a))
    );
  };

  /* ================= REMOVE ================= */
  const removeAtom = (id) => {
    setAtoms((prev) => prev.filter((a) => a.id !== id));
    setBonds((prev) =>
      prev.filter((b) => b.from !== id && b.to !== id)
    );
  };

  const removeBond = (id) => {
    setBonds((prev) => prev.filter((b) => b.id !== id));
  };

  /* ================= CLICK ATOM / CREATE BOND ================= */
  const handleAtomClick = (atom) => {
    if (!bondMode) {
      setSelectedAtom(atom);
      return;
    }

    if (!selectedAtom) {
      setSelectedAtom(atom);
      return;
    }

    if (selectedAtom.id === atom.id) return;

    const exists = bonds.find(
      (b) =>
        (b.from === selectedAtom.id && b.to === atom.id) ||
        (b.from === atom.id && b.to === selectedAtom.id)
    );

    if (!exists) {
      setBonds((prev) => [
        ...prev,
        {
          id: generateId(),
          from: selectedAtom.id,
          to: atom.id,
          type: bondTypeRef.current, // ✅ ALWAYS latest value
        },
      ]);
    }

    setSelectedAtom(null);
  };

  /* ================= CLEAR ================= */
  const clearCanvas = () => {
    setAtoms([]);
    setBonds([]);
    setSelectedAtom(null);
    setSelectedBond(null);
  };

  const clearBonds = () => setBonds([]);

  /* ================= SAVE ================= */
  const saveProject = () => {
    localStorage.setItem(
      "molecule-builder",
      JSON.stringify({ atoms, bonds, moleculeName })
    );
  };

  /* ================= LOAD ================= */
  const loadProject = () => {
    const saved = localStorage.getItem("molecule-builder");
    if (!saved) return;

    const parsed = JSON.parse(saved);

    setAtoms(parsed.atoms || []);
    setBonds(parsed.bonds || []);
    setMoleculeName(parsed.moleculeName || "Untitled Molecule");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-cyan-400">
            Molecular Builder
          </h1>
          <p className="text-slate-400">
            Build molecules visually with atoms & bonds
          </p>
        </div>

        {/* TOOLBAR */}
        <Toolbar
          moleculeName={moleculeName}
          setMoleculeName={setMoleculeName}
          clearCanvas={clearCanvas}
          saveProject={saveProject}
          loadProject={loadProject}
        />

        {/* PALETTE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 mt-6">
          <h2 className="text-sm text-slate-400 mb-3">
            Atom Palette
          </h2>
          <AtomPalette onAddAtom={addAtom} />
        </div>

        {/* CANVAS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 mt-6">
          <h2 className="text-sm text-slate-400 mb-3">
            Molecule Canvas
          </h2>

          <MoleculeCanvas
            atoms={atoms}
            bonds={bonds}
            selectedAtom={selectedAtom}
            selectedBond={selectedBond}
            onAtomClick={handleAtomClick}
            onMoveAtom={moveAtom}
            removeAtom={removeAtom}
            removeBond={removeBond}
            setSelectedBond={setSelectedBond}
            bondMode={bondMode}
          />
        </div>

        {/* BOND TOOL */}
        <div className="mt-6">
          <BondTool
            bondType={bondType}
            setBondType={setBondTypeSafe}   // ✅ FIX HERE
            bondMode={bondMode}
            setBondMode={setBondMode}
            clearBonds={clearBonds}
          />
        </div>

        {/* STATS */}
        <div className="mt-6">
          <MoleculeStats
            atoms={atoms}
            bonds={bonds}
            moleculeName={moleculeName}
            selectedAtom={selectedAtom}
          />
        </div>

      </div>
    </div>
  );
}