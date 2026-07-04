// src/components/ui/Toolbar.jsx

import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Droplets,
  Maximize2,
} from "lucide-react";

const Toolbar = ({
  isRunning = false,
  autoMode = false,

  onStart = () => {},
  onPause = () => {},
  onReset = () => {},
  onToggleAuto = () => {},
 
}) => {
  const Button = ({
    icon: Icon,
    label,
    onClick,
    color = "bg-slate-800 hover:bg-slate-700",
    active = false,
  }) => (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2
        px-4 py-2.5
        rounded-xl
        transition-all
        duration-200
        whitespace-nowrap
        ${
          active
            ? "bg-cyan-500 text-black"
            : `${color} text-white`
        }
      `}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">
        {label}
      </span>
    </button>
  );

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg">

      <div className="flex flex-wrap gap-3 justify-between items-center">

        {/* Left */}
        <div className="flex flex-wrap gap-2">

          {isRunning ? (
            <Button
              icon={Pause}
              label="Pause"
              onClick={onPause}
              color="bg-yellow-600 hover:bg-yellow-500"
            />
          ) : (
            <Button
              icon={Play}
              label="Start"
              onClick={onStart}
              color="bg-green-600 hover:bg-green-500"
            />
          )}

          <Button
            icon={RotateCcw}
            label="Reset"
            onClick={onReset}
            color="bg-red-600 hover:bg-red-500"
          />

          <Button
            icon={Droplets}
            label="Auto Drops"
            onClick={onToggleAuto}
            active={autoMode}
          />

        </div>

      </div>

    </div>
  );
};

export default Toolbar;