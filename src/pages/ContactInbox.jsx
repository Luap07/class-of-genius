import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ContactInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // FETCH MESSAGES
  const fetchMessages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    // REALTIME UPDATE
    const channel = supabase
      .channel("contact_messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // DELETE MESSAGE
  const deleteMessage = async (id) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages(messages.filter((m) => m.id !== id));
  };

  // TOGGLE READ STATUS
  const toggleRead = async (id, current) => {
    await supabase
      .from("contact_messages")
      .update({ read: !current })
      .eq("id", id);

    setMessages(
      messages.map((m) =>
        m.id === id ? { ...m, read: !current } : m
      )
    );
  };

  // FILTER SEARCH
  const filtered = messages.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-4">
        📥 Contact Inbox
      </h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search messages..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 p-3 rounded-xl bg-slate-900 border border-slate-700"
      />

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400">Loading messages...</p>
      )}

      {/* EMPTY STATE */}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-400">No messages found.</p>
      )}

      {/* MESSAGES LIST */}
      <div className="space-y-4">
        {filtered.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-xl border ${
              msg.read
                ? "border-slate-700 bg-slate-900/40"
                : "border-blue-500 bg-slate-900"
            }`}
          >
            {/* TOP ROW */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold">{msg.name}</h2>
                <p className="text-sm text-gray-400">
                  {msg.email}
                </p>
              </div>

              <span className="text-xs text-gray-500">
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>

            {/* MESSAGE */}
            <p className="mt-3 text-gray-300">
              {msg.message}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() =>
                  toggleRead(msg.id, msg.read)
                }
                className="px-3 py-1 text-sm bg-blue-600 rounded-lg"
              >
                {msg.read ? "Mark Unread" : "Mark Read"}
              </button>

              <button
                onClick={() => deleteMessage(msg.id)}
                className="px-3 py-1 text-sm bg-red-600 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactInbox;