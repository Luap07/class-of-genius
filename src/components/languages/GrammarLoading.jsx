import React from "react";

export default function GrammarLoading() {
  return (
    <div className="space-y-8">

      {[1, 2, 3].map((item) => (

        <div
          key={item}
          className="
            overflow-hidden
            rounded-[30px]
            border
            border-white/10
            bg-slate-900
            p-8
            animate-pulse
          "
        >

          <div className="flex items-center gap-5">

            <div className="h-16 w-16 rounded-2xl bg-slate-800" />

            <div className="flex-1 space-y-4">

              <div className="h-6 w-64 rounded bg-slate-800" />

              <div className="h-4 w-32 rounded bg-slate-800" />

            </div>

          </div>

          <div className="mt-8 space-y-4">

            <div className="h-4 rounded bg-slate-800" />

            <div className="h-4 rounded bg-slate-800" />

            <div className="h-4 w-5/6 rounded bg-slate-800" />

          </div>

          <div className="mt-8 h-36 rounded-2xl bg-slate-800" />

        </div>

      ))}

    </div>
  );
}