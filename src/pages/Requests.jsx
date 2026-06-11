import { useContext, useMemo } from "react";
import { ConnectContext } from "../context/ConnectContext";
import { AuthContext } from "../context/AuthContext";

const Requests = () => {
  const {
    pendingRequests = [],
    acceptRequest,
    declineRequest,
    users = [],
  } = useContext(ConnectContext);

  const { user } = useContext(AuthContext);

  // 🔥 filter ONLY requests for logged-in user
  const incomingRequests = useMemo(() => {
    if (!user?.id) return [];

    return pendingRequests.filter(
      (req) => req.receiver_id === user.id
    );
  }, [pendingRequests, user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Incoming Requests
      </h1>

      {/* EMPTY STATE */}
      {incomingRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
          No requests yet
        </div>
      ) : (
        <div className="space-y-4">
          {incomingRequests.map((req) => {
            const sender = users.find(
              (u) => u.id === req.sender_id
            );

            return (
              <div
                key={req.id}
                className="bg-white shadow rounded-xl p-4 flex items-center justify-between"
              >
                {/* USER INFO */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                    {(sender?.username ||
                      sender?.name ||
                      "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      {sender?.name ||
                        sender?.username ||
                        "Unknown User"}
                    </h2>

                    <p className="text-sm text-gray-500">
                      @{sender?.username || "user"}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(req.id)}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => declineRequest(req.id)}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Requests;