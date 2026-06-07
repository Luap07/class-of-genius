import React, { useContext } from "react";
import { ConnectContext } from "../context/ConnectContext";
import { AuthContext } from "../context/AuthContext";

const Connects = () => {
  const {
    users,
    connections,
    pendingRequests,
    sendRequest,
    acceptRequest,
    declineRequest,
  } = useContext(ConnectContext);

  const { user } = useContext(AuthContext); // ✅ REAL LOGGED IN USER

  /* ================= HELPERS ================= */

  const isPending = (userId) =>
    pendingRequests.some((r) => r.receiver_id === userId);

  const isConnected = (userId) =>
    connections.some(
      (c) =>
        c.sender_id === userId || c.receiver_id === userId
    );

  /* ================= FILTER OUT SELF ================= */

  const filteredUsers = users.filter(
    (u) => u.id !== user?.id
  );

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        👥 Connect With People
      </h1>

      {/* USERS LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((currentUser) => (
          <div
            key={currentUser.id}
            className="border rounded-xl p-4 bg-white shadow-sm"
          >
            {/* USER INFO */}
            <h2 className="font-semibold text-lg">
              {currentUser.name}
            </h2>

            <p className="text-sm text-gray-500 mb-3">
              @{currentUser.username}
            </p>

            <p className="text-xs mb-3">
              Status: {currentUser.status}
            </p>

            {/* ACTION BUTTON */}
            {isConnected(currentUser.id) ? (
              <button className="px-3 py-1 bg-green-100 text-green-700 rounded">
                Connected ✓
              </button>
            ) : isPending(currentUser.id) ? (
              <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded">
                Pending...
              </button>
            ) : (
              <button
                onClick={() =>
                  sendRequest(user.id, currentUser.id)
                }
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Connect
              </button>
            )}
          </div>
        ))}
      </div>

      {/* PENDING REQUESTS */}
      {pendingRequests.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-3">
            📩 Pending Requests
          </h2>

          <div className="grid md:grid-cols-2 gap-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="border p-3 rounded bg-yellow-50 flex justify-between items-center"
              >
                <span>
                  {req.sender_id} → {req.receiver_id}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(req.id)}
                    className="text-green-600"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => declineRequest(req.id)}
                    className="text-red-500"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONNECTIONS */}
      {connections.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-3">
            🤝 Your Connections
          </h2>

          <div className="grid md:grid-cols-2 gap-3">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="border p-3 rounded bg-green-50"
              >
                <p>
                  {conn.sender_id} ↔ {conn.receiver_id}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {conn.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Connects;