import React, { useContext, useMemo } from "react";
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

  // ================= SEARCH =================
  const filteredUsers = useMemo(() => {
    const keyword = (search || "").trim().toLowerCase();

    return users.filter((u) => {
      if (!user?.id) return false;

      // hide myself
      if (u.id === user.id) return false;

      // if no search → show all
      if (keyword === "") return true;

      const username = (u.username || "").toLowerCase();
      const name = (u.name || "").toLowerCase();

      return (
        username.includes(keyword) ||
        name.includes(keyword)
      );
    });
  }, [users, search, user]);

  // ================= STATUS =================

  // outgoing request (you sent)
  const isPending = (userId) =>
    pendingRequests.some(
      (r) =>
        r.sender_id === user?.id &&
        r.receiver_id === userId
    );

  // connected users
  const isConnected = (userId) =>
    connections.some(
      (c) =>
        (c.sender_id === user?.id &&
          c.receiver_id === userId) ||
        (c.sender_id === userId &&
          c.receiver_id === user?.id)
    );

  // ================= ACTIONS =================

  const handleConnect = (currentUser) => {
    if (!user?.id) return alert("Login required");
    sendRequest(user.id, currentUser.id);
  };

  const handleCancelRequest = (currentUser) => {
    const request = pendingRequests.find(
      (r) =>
        r.sender_id === user.id &&
        r.receiver_id === currentUser.id
    );

    if (request) {
      disconnect(request.sender_id, request.receiver_id);
    }
  };

  // ================= LOADING GUARD =================
  if (!users) {
    return (
      <div className="p-6 text-gray-500">
        Loading users...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        👥 Find Geniuses
      </h1>

      {/* SEARCH */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-[400px] p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* USERS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((currentUser) => (
            <div
              key={currentUser.id}
              className="bg-white rounded-3xl p-6 shadow border hover:shadow-lg transition"
            >
              {/* USER HEADER */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {(currentUser.username || "U")
                    .charAt(0)
                    .toUpperCase()}

                  {currentUser.is_online && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                      <Circle
                        size={12}
                        className="fill-green-500 text-green-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="font-bold text-lg">
                    {currentUser.name || "Genius"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    @{currentUser.username || "user"}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {isConnected(currentUser.id) ? (
                <button
                  onClick={() =>
                    disconnect(user.id, currentUser.id)
                  }
                  className="w-full py-2 rounded-xl bg-red-100 text-red-700 font-semibold"
                >
                  Disconnect
                </button>
              ) : isPending(currentUser.id) ? (
                <button
                  onClick={() =>
                    handleCancelRequest(currentUser)
                  }
                  className="w-full py-2 rounded-xl bg-yellow-100 text-yellow-700 font-semibold"
                >
                  Cancel Request
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleConnect(currentUser)
                  }
                  className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Connect
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No geniuses found{" "}
            {search ? `matching "${search}"` : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connects;