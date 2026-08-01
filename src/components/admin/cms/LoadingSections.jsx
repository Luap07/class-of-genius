import React from "react";

import { Loader2 } from "lucide-react";

export default function LoadingSections() {
  return (
    <div
      className="
        flex
        min-h-[450px]
        flex-col
        items-center
        justify-center
        rounded-3xl
        border
        border-slate-800
        bg-[#0f172a]
      "
    >
      <div
        className="
          flex
          h-24
          w-24
          items-center
          justify-center
          rounded-full
          bg-indigo-500/10
        "
      >
        <Loader2
          size={42}
          className="
            animate-spin
            text-indigo-400
          "
        />
      </div>

      <h2
        className="
          mt-8
          text-2xl
          font-black
          text-white
        "
      >
        Loading Sections...
      </h2>

      <p
        className="
          mt-3
          max-w-md
          text-center
          text-slate-400
        "
      >
        Please wait while your language content is being loaded.
      </p>

      <div
        className="
          mt-10
          h-2
          w-72
          overflow-hidden
          rounded-full
          bg-slate-800
        "
      >
        <div
          className="
            h-full
            w-1/2
            animate-pulse
            rounded-full
            bg-indigo-500
          "
        />
      </div>
    </div>
  );
}