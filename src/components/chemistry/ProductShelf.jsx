import React from "react";
import { Sparkles, FlaskConical } from "lucide-react";

const ProductShelf = ({ products = [] }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="text-emerald-400" size={20} />
        </div>
        <div>
          <h2 className="font-bold text-white">Products</h2>
          <p className="text-xs text-slate-400">Reaction results</p>
        </div>
      </div>

      {/* Product List - Added scroll-bar custom styling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
        {products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <FlaskConical className="text-slate-600 mb-3" size={40} />
            <h3 className="text-sm font-semibold text-white">No Products</h3>
            <p className="text-xs text-slate-500 mt-1">Run a reaction to generate products.</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="group rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/5"
                  style={{ background: product.color || "#10b981" }}
                >
                  {product.icon || "🧪"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-slate-400">{product.formula}</p>
                  {product.state && (
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider">
                      {product.state}
                    </span>
                  )}
                </div>
              </div>

              {/* Properties Section - Compacted for better spacing */}
              {(product.description || product.amount || product.molarMass) && (
                <div className="mt-3 pt-3 border-t border-slate-800/50 space-y-1">
                  {product.description && <p className="text-xs text-slate-400 italic">"{product.description}"</p>}
                  <div className="flex gap-4 text-[11px]">
                    {product.amount && <p className="text-slate-500">Amt: <span className="text-slate-300">{product.amount}</span></p>}
                    {product.molarMass && <p className="text-slate-500">Mass: <span className="text-slate-300">{product.molarMass}</span></p>}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3 bg-slate-950 flex justify-between items-center text-xs">
        <span className="text-slate-400">Total Products</span>
        <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{products.length}</span>
      </div>
    </div>
  );
};

export default ProductShelf;