import { useState } from "react";
import axios from "axios";

const SupportChat = () => {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);

    const res = await axios.post("http://localhost:5000/ticket", {
      name: "Student",
      email: "student@test.com",
      message,
    });

    setReply(res.data.aiReply);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-black text-white rounded-xl">
      <h2 className="text-xl font-bold mb-3">AI Support Agent</h2>

      <textarea
        className="w-full p-3 bg-gray-900 rounded"
        placeholder="Ask your question..."
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={sendMessage}
        className="mt-3 bg-blue-600 px-4 py-2 rounded"
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      {reply && (
        <div className="mt-4 p-3 bg-gray-800 rounded">
          🤖 {reply}
        </div>
      )}
    </div>
  );
};

export default SupportChat;