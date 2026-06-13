import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Mail,
  Trash2,
  Check,
  Search,
  X,
  Send,
} from "lucide-react";

const ContactInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // Reply modal state
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  /* ================= FETCH ================= */
  const fetchMessages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("contact_messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        () => fetchMessages()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  /* ================= ACTIONS ================= */
  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;

    await supabase.from("contact_messages").delete().eq("id", id);

    setMessages((prev) => prev.filter((m) => m.id !== id));
    setSelected(null);
  };

  const toggleRead = async (msg) => {
    await supabase
      .from("contact_messages")
      .update({ read: !msg.read })
      .eq("id", msg.id);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, read: !msg.read } : m
      )
    );
  };

  /* ================= REAL EMAIL REPLY ================= */
  const sendReply = async () => {
  if (!replyText.trim()) return;

  setSending(true);

  try {
    // 1. SEND EMAIL
    await fetch("http://localhost:5000/send-reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: selected.email,
        message: replyText,
      }),
    });

    // 2. SAVE REPLY TO SUPABASE (IMPORTANT)
    await supabase.from("contact_replies").insert([
      {
        message_id: selected.id,
        email: selected.email,
        message: replyText,
      },
    ]);

    alert("Reply sent & saved 🚀");

    setReplyText("");
    setReplyOpen(false);
  } catch (err) {
    console.error(err);
    alert("Failed to send reply");
  } finally {
    setSending(false);
  }
};


  /* ================= FILTER ================= */
  const filtered = messages.filter((m) =>
    `${m.name} ${m.email} ${m.message}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ================= STATS ================= */
  const total = messages.length;
  const unread = messages.filter((m) => !m.read).length;
  const read = messages.filter((m) => m.read).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📥 Contact Inbox</h1>

        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
          <p className="text-gray-400 text-sm">Total</p>
          <h2 className="text-xl font-bold">{total}</h2>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-blue-500">
          <p className="text-gray-400 text-sm">Unread</p>
          <h2 className="text-xl font-bold text-blue-400">{unread}</h2>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-green-500">
          <p className="text-gray-400 text-sm">Read</p>
          <h2 className="text-xl font-bold text-green-400">{read}</h2>
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* LIST */}
        <div className="space-y-3">
          {loading && <p>Loading...</p>}

          {filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelected(msg)}
              className={`p-3 rounded-xl cursor-pointer border ${
                msg.read
                  ? "border-slate-700 bg-slate-900/40"
                  : "border-blue-500 bg-slate-900"
              }`}
            >
              <p className="font-bold">{msg.name}</p>
              <p className="text-xs text-gray-400">{msg.email}</p>
              <p className="text-sm truncate text-gray-300">
                {msg.message}
              </p>
            </div>
          ))}
        </div>

        {/* DETAIL */}
        <div className="md:col-span-2 bg-slate-900 rounded-xl border border-slate-700 p-5">
          {!selected ? (
            <p className="text-gray-400">Select a message</p>
          ) : (
            <>
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <button onClick={() => setSelected(null)}>
                  <X />
                </button>
              </div>

              <p className="text-gray-400">{selected.email}</p>

              <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                {selected.message}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-5 flex-wrap">

                {/* OPEN REPLY MODAL */}
                <button
                  onClick={() => setReplyOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 px-3 py-2 rounded-lg"
                >
                  <Mail size={16} />
                  Reply
                </button>

                <button
                  onClick={() => toggleRead(selected)}
                  className="flex items-center gap-2 bg-green-600 px-3 py-2 rounded-lg"
                >
                  <Check size={16} />
                  {selected.read ? "Mark Unread" : "Mark Read"}
                </button>

                <button
                  onClick={() => deleteMessage(selected.id)}
                  className="flex items-center gap-2 bg-red-600 px-3 py-2 rounded-lg"
                >
                  <Trash2 size={16} />
                  Delete
                </button>

              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= REPLY MODAL ================= */}
      {replyOpen && selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 w-[400px] p-5 rounded-xl border border-slate-700">

            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold">
                Reply to {selected.name}
              </h2>

              <button onClick={() => setReplyOpen(false)}>
                <X />
              </button>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="w-full h-32 p-3 bg-slate-800 rounded-lg outline-none"
            />

            <button
              onClick={sendReply}
              disabled={sending}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 py-2 rounded-lg"
            >
              <Send size={16} />
              {sending ? "Sending..." : "Send Reply"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default ContactInbox;