import React, { useState } from "react";

export default function ReactionCanvas() {
  const [items, setItems] = useState([]); // Store dropped items

  // 1. Allow dropping
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // 2. Handle the drop event
  const handleDrop = (e) => {
    e.preventDefault();
    const itemType = e.dataTransfer.getData("itemType");
    if (itemType) {
      setItems([...items, { id: Date.now(), type: itemType }]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="w-full">
          {/* Added onDragOver and onDrop handlers here */}
          <div 
            className="relative h-[500px] w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }}
            />
            
            {/* Render dropped items */}
            {items.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none">
                <div className="text-6xl mb-4">🧪</div>
                <p className="text-lg font-medium">Laboratory Ready</p>
                <p className="text-sm">Drop reagents here to start...</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="absolute p-4 bg-blue-500/20 border border-blue-400 rounded-lg text-white">
                  {item.type}
                </div>
              ))
            )}
            
            <div className="absolute bottom-0 w-full h-20 bg-slate-800 border-t border-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}