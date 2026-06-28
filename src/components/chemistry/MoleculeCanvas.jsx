import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Trash2,
} from "lucide-react";

export default function MoleculeCanvas({
  atoms,
  bonds,
  selectedAtom,
  selectedBond,
  onAtomClick,
  onMoveAtom,
  removeAtom,
  removeBond,
  setSelectedBond,
  bondMode,
}) {
  const canvasRef = useRef(null);

  const [dragging, setDragging] = useState(null);
  const [hoverAtom, setHoverAtom] = useState(null);

  const width = 900;
  const height = 650;

  /* ================= BOND LOOKUP ================= */
  const bondLines = useMemo(() => {
    return bonds
      .map((bond) => {
        const from = atoms.find((a) => a.id === bond.from);
        const to = atoms.find((a) => a.id === bond.to);

        if (!from || !to) return null;

        return { ...bond, from, to };
      })
      .filter(Boolean);
  }, [atoms, bonds]);

  /* ================= MOUSE POSITION ================= */
  const getMousePosition = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  /* ================= DRAG ================= */
  const handleMouseDown = (atom, event) => {
    event.stopPropagation();
    onAtomClick(atom);
    setDragging(atom.id);
  };

  useEffect(() => {
    const move = (event) => {
      if (!dragging) return;

      const pos = getMousePosition(event);

      onMoveAtom(
        dragging,
        Math.max(35, Math.min(width - 35, pos.x)),
        Math.max(35, Math.min(height - 35, pos.y))
      );
    };

    const up = () => setDragging(null);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging, onMoveAtom]);

  /* ================= CLEAR SELECTION ================= */
  const handleCanvasClick = () => {
    setSelectedBond(null);
  };

  /* ================= BOND STYLE (FIXED CORE BUG) ================= */
  const getBondColor = (type) => {
    switch (type) {
      case "double":
        return "#facc15";
      case "triple":
        return "#ef4444";
      default:
        return "#22d3ee";
    }
  };

  const getBondWidth = (type) => {
    switch (type) {
      case "double":
        return 5;
      case "triple":
        return 7;
      default:
        return 3;
    }
  };

  /* ================= SINGLE ================= */
  const drawSingleBond = (bond) => (
    <line
      key={bond.id}
      x1={bond.from.x}
      y1={bond.from.y}
      x2={bond.to.x}
      y2={bond.to.y}
      stroke={getBondColor(bond.type)}   // ✅ FIX
      strokeWidth={getBondWidth(bond.type)} // ✅ FIX
      strokeLinecap="round"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedBond(bond);
      }}
    />
  );

  /* ================= DOUBLE ================= */
  const drawDoubleBond = (bond) => {
    const dx = bond.to.x - bond.from.x;
    const dy = bond.to.y - bond.from.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    const offsetX = (-dy / length) * 5;
    const offsetY = (dx / length) * 5;

    return (
      <g key={bond.id} onClick={(e) => e.stopPropagation()}>
        <line
          x1={bond.from.x + offsetX}
          y1={bond.from.y + offsetY}
          x2={bond.to.x + offsetX}
          y2={bond.to.y + offsetY}
          stroke={getBondColor("double")}
          strokeWidth={3}
        />
        <line
          x1={bond.from.x - offsetX}
          y1={bond.from.y - offsetY}
          x2={bond.to.x - offsetX}
          y2={bond.to.y - offsetY}
          stroke={getBondColor("double")}
          strokeWidth={3}
        />
      </g>
    );
  };

  /* ================= TRIPLE ================= */
  const drawTripleBond = (bond) => {
    const dx = bond.to.x - bond.from.x;
    const dy = bond.to.y - bond.from.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    const offsetX = (-dy / length) * 7;
    const offsetY = (dx / length) * 7;

    return (
      <g key={bond.id} onClick={(e) => e.stopPropagation()}>
        <line
          x1={bond.from.x}
          y1={bond.from.y}
          x2={bond.to.x}
          y2={bond.to.y}
          stroke={getBondColor("triple")}
          strokeWidth={3}
        />
        <line
          x1={bond.from.x + offsetX}
          y1={bond.from.y + offsetY}
          x2={bond.to.x + offsetX}
          y2={bond.to.y + offsetY}
          stroke={getBondColor("triple")}
          strokeWidth={2}
        />
        <line
          x1={bond.from.x - offsetX}
          y1={bond.from.y - offsetY}
          x2={bond.to.x - offsetX}
          y2={bond.to.y - offsetY}
          stroke={getBondColor("triple")}
          strokeWidth={2}
        />
      </g>
    );
  };

  /* ================= RENDER ================= */
  const renderBond = (bond) => {
    switch (bond.type) {
      case "double":
        return drawDoubleBond(bond);
      case "triple":
        return drawTripleBond(bond);
      default:
        return drawSingleBond(bond);
    }
  };

  return (
    <div
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="relative bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden"
      style={{ width, height }}
    >
      {/* GRID (UNCHANGED) */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.12 }}>
        {Array.from({ length: 45 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 20}
            y1="0"
            x2={i * 20}
            y2={height}
            stroke="#38bdf8"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 20}
            x2={width}
            y2={i * 20}
            stroke="#38bdf8"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* BONDS */}
      <svg className="absolute inset-0 w-full h-full">
        {bondLines.map(renderBond)}
      </svg>

      {/* ATOMS (UNCHANGED UI) */}
      {atoms.map((atom) => {
        const selected = selectedAtom?.id === atom.id;
        const hovered = hoverAtom === atom.id;

        return (
          <div
            key={atom.id}
            className="absolute"
            style={{
              left: atom.x,
              top: atom.y,
              transform: "translate(-50%, -50%)",
              zIndex: selected ? 100 : 20,
            }}
          >
            <div
              className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${
                selected
                  ? "bg-cyan-400 opacity-60 scale-150"
                  : hovered
                  ? "bg-cyan-500 opacity-30 scale-125"
                  : "opacity-0"
              }`}
            />

            <button
              onMouseDown={(e) => handleMouseDown(atom, e)}
              onMouseEnter={() => setHoverAtom(atom.id)}
              onMouseLeave={() => setHoverAtom(null)}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-white border-2 shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing ${
                selected
                  ? "border-cyan-300 scale-110"
                  : "border-slate-600 hover:scale-105"
              }`}
              style={{ background: atom.color || "#06b6d4" }}
            >
              {atom.symbol}
            </button>

            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-950 border border-cyan-500 flex items-center justify-center text-[10px] font-bold">
              {atom.atomicNumber}
            </div>

            {selected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAtom(atom.id);
                }}
                className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center"
              >
                <Trash2 size={14} />
              </button>
            )}

            <div className="absolute top-16 left-1/2 -translate-x-1/2 text-xs text-slate-300">
              {atom.name}
            </div>
          </div>
        );
      })}

      {/* FOOTER (UNCHANGED) */}
      <div className="absolute bottom-0 w-full border-t border-slate-800 p-4 bg-slate-950 flex justify-between text-sm">
        <div>Atoms: {atoms.length}</div>
        <div>Bonds: {bonds.length}</div>
        <div>
          Selected: {selectedAtom ? selectedAtom.symbol : "None"}
        </div>
      </div>
    </div>
  );
}