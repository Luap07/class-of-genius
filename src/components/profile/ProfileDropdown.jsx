import React from "react";
import { User, BarChart3, Settings, LogOut } from "lucide-react";

const ProfileDropdown = ({ onClose, onLogout, onOpenProfile }) => {
  return (
    <div
      className="absolute right-0 mt-3 w-64 bg-[#0b0f1a] border border-white/10 
      rounded-xl shadow-xl overflow-hidden text-white z-50"
    >
      <button
        onClick={() => {
          onOpenProfile?.();
          onClose();
        }}
        className="w-full flex items-center gap-2 p-3 hover:bg-white/10"
      >
        <User size={16} />
        View Profile
      </button>

      <button className="w-full flex items-center gap-2 p-3 hover:bg-white/10">
        <BarChart3 size={16} />
        Learning Stats
      </button>

      <button className="w-full flex items-center gap-2 p-3 hover:bg-white/10">
        <Settings size={16} />
        Settings
      </button>

      <div className="border-t border-white/10" />

      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2 p-3 text-red-400 hover:bg-red-500/10"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
};

export default ProfileDropdown;