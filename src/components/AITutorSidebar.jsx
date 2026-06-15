import React, { useState, useEffect } from "react";
import {
  Menu,
  Plus,
  Search,
  Settings,
  HelpCircle,
  MessageSquare,
  Trash2,
} from "lucide-react";

const AITutorSidebar = ({
  chats = [],
  activeChat,
  setActiveChat,
  createNewChat,
  deleteChat,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= FILTER ================= */
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= AUTO SELECT FIRST CHAT ================= */
  useEffect(() => {
    if (!activeChat && chats.length > 0) {
      setActiveChat(chats[0].id);
    }
  }, [chats]);

  return (
    <aside
      className={`h-screen border-r border-white/10 bg-[#04070f] flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-80"
      }`}
    >

      {/* ================= TOP ================= */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">

        {!collapsed && (
          <div>
            <h1 className="text-white font-bold text-lg">
              Scholiqen AI
            </h1>
            <p className="text-xs text-gray-500">
              AI Tutor Chat System
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/5"
        >
          <Menu size={20} className="text-white" />
        </button>
      </div>

      {/* ================= NEW CHAT ================= */}
      <div className="p-4">
        <button
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 transition rounded-xl py-3 text-white font-semibold"
        >
          <Plus size={18} />
          {!collapsed && "New Chat"}
        </button>
      </div>

      {/* ================= SEARCH ================= */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Search size={16} className="text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="bg-transparent outline-none text-white flex-1 text-sm"
            />
          </div>
        </div>
      )}

      {/* ================= CHAT LIST ================= */}
      <div className="flex-1 overflow-y-auto px-2">

        {!collapsed && (
          <p className="text-xs text-gray-500 px-2 mb-2 uppercase">
            Recent Chats
          </p>
        )}

        {filteredChats.length === 0 ? (
          !collapsed && (
            <div className="text-gray-500 text-sm px-2">
              No chats yet. Start a new one 🚀
            </div>
          )
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-3 rounded-xl mb-2 transition group ${
                activeChat === chat.id
                  ? "bg-blue-600/20 border border-blue-500/30"
                  : "hover:bg-white/5"
              }`}
            >

              {/* CHAT BUTTON */}
              <button
                onClick={() => setActiveChat(chat.id)}
                className="flex items-center gap-3 flex-1"
              >
                <MessageSquare
                  size={18}
                  className="text-blue-400 flex-shrink-0"
                />

                {!collapsed && (
                  <div className="text-left overflow-hidden">
                    <p className="text-sm text-white truncate">
                      {chat.title}
                    </p>

                    <p className="text-xs text-gray-500 truncate">
                      {chat.updatedAt || "Just now"}
                    </p>
                  </div>
                )}
              </button>

              {/* DELETE CHAT */}
              {!collapsed && deleteChat && (
                <button
                  onClick={() => deleteChat(chat.id)}
                  className="opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="border-t border-white/10 p-4 space-y-2">

        <button className="flex items-center gap-3 w-full hover:bg-white/5 p-2 rounded-lg transition">
          <Settings size={18} className="text-gray-400" />
          {!collapsed && (
            <span className="text-gray-300 text-sm">Settings</span>
          )}
        </button>

        <button className="flex items-center gap-3 w-full hover:bg-white/5 p-2 rounded-lg transition">
          <HelpCircle size={18} className="text-gray-400" />
          {!collapsed && (
            <span className="text-gray-300 text-sm">Help</span>
          )}
        </button>

        {/* PROFILE */}
        <div className="border-t border-white/10 pt-3 mt-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
            D
          </div>

          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-white">
                Damilare
              </p>
              <p className="text-xs text-gray-500">
                Scholiqen Member
              </p>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};

export default AITutorSidebar;