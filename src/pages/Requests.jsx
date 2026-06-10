import { useContext } from "react";
import { ConnectContext } from "../context/ConnectContext";
import { AuthContext } from "../context/AuthContext";

const Requests = () => {
  const {
    pendingRequests,
    acceptRequest,
    declineRequest,
    users,
  } = useContext(ConnectContext);

  const { user } = useContext(AuthContext);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Incoming Requests
      </h1>

      {/* EMPTY STATE */}
      {!pendingRequests || pendingRequests.length === 0 ? (
        <p className="text-gray-500">No requests yet</p>
      ) : (
        pendingRequests
          // only show requests for this logged-in user
          .filter((req) => req.receiver_id === user?.id)
          .map((req) => {
            const sender = users.find(
              (u) => u.id === req.sender_id
            );

            return (
              <div
                key={req.id}
                className="border p-4 rounded mb-3 flex justify-between items-center"
              >
                {/* USER INFO */}
                <div>
                  <p className="font-semibold">
                    {sender?.username ||
                      sender?.name ||
                      sender?.email ||
                      "Unknown User"}
                  </p>

                  <p className="text-xs text-gray-500">
                    {req.sender_id}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(req.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => declineRequest(req.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })
      )}
    </div>
  );
};

export default Requests;