import React, { useContext } from "react";
import { ConnectContext } from "../context/ConnectContext";
import { AuthContext } from "../context/AuthContext";
import { Circle } from "lucide-react";

const Connects = () => {
  const {
    users,
    connections,
    pendingRequests,
    search,
    setSearch,
    sendRequest,
    disconnect,
  } = useContext(ConnectContext);

  const { user } = useContext(AuthContext);

  // Robust filter logic
  const filteredUsers = users.filter((u) => {
    // 1. Exclude the current logged-in user
    const isNotMe = u.id !== user?.id;
    
    // 2. Safe search: Check if username exists before calling toLowerCase
    const username = u.username || "";
    const matchesSearch = username.toLowerCase().includes(search.toLowerCase());
    
    return isNotMe && matchesSearch;
  });

  const isPending = (userId) =>
    pendingRequests.some((r) => r.receiver_id === userId || r.sender_id === userId);

  const isConnected = (userId) =>
    connections.some((c) => c.sender_id === userId || c.receiver_id === userId);

  const handleConnect = (currentUser) => {
    if (!user?.id) {
      alert("You must be logged in to connect!");
      return;
    }
    sendRequest(user.id, currentUser.id);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">👥 Find Geniuses</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {/* Debug: check if search state is updating */}
        <p className="text-xs text-slate-400 mt-2">Current search: {search}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((currentUser) => (
            <div key={currentUser.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {currentUser.username?.charAt(0).toUpperCase() || "U"}
                  {currentUser.is_online && (
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
                      <Circle size={12} className="fill-green-500 text-green-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-800">{currentUser.name || "Genius"}</h2>
                  <p className="text-sm text-slate-400">@{currentUser.username || "user"}</p>
                </div>
              </div>

              {isConnected(currentUser.id) ? (
                <button 
                  onClick={() => disconnect(user.id, currentUser.id)}
                  className="w-full py-2 bg-red-50 text-red-700 font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-all"
                >
                  Disconnect
                </button>
              ) : isPending(currentUser.id) ? (
                <button 
                  onClick={() => disconnect(user.id, currentUser.id)}
                  className="w-full py-2 bg-yellow-50 text-yellow-700 font-semibold rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-all"
                >
                  Cancel Request
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(currentUser)}
                  className="w-full py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                >
                  Connect
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-slate-500">No geniuses found matching "{search}".</p>
        )}
      </div>
    </div>
  );
};

export default Connects;