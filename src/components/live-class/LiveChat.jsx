
import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function LiveChat({
  liveClassId,
  tutorReference,
  tutorName = "Tutor",
  isTutor = false,
  socket,
  messages: initialMessages = [],
  onNewMessage,
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Keep messages received from the parent.
  useEffect(() => {
    setMessages(Array.isArray(initialMessages) ? initialMessages : []);
  }, [initialMessages]);

  // Add messages without duplicating them.
  const addMessage = (newMessage) => {
    if (!newMessage) return;

    setMessages((previous) => {
      const exists = previous.some(
        (item) =>
          String(item.id) === String(newMessage.id)
      );

      if (exists) return previous;

      return [...previous, newMessage];
    });

    onNewMessage?.(newMessage);
  };

  // Listen for messages broadcast by the server.
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (incoming) => {
      if (
        String(incoming?.live_class_id || incoming?.liveClassId) !==
        String(liveClassId)
      ) {
        return;
      }

      addMessage(incoming);
    };

    socket.on("live:chat-message", handleIncomingMessage);

    return () => {
      socket.off("live:chat-message", handleIncomingMessage);
    };
  }, [socket, liveClassId]);

  // Automatically scroll to the latest message.
  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const getMessageId = (item, index) =>
    item?.id ||
    item?.message_id ||
    `${item?.created_at || ""}-${index}`;

  const getSenderName = (item) =>
    item?.sender_name ||
    item?.senderName ||
    "User";

  const getSenderRole = (item) =>
    String(
      item?.sender_role ||
      item?.senderRole ||
      item?.role ||
      "student"
    ).toLowerCase();

  const getMessageText = (item) =>
    item?.message ||
    item?.text ||
    item?.content ||
    "";

  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Send through the authenticated classroom socket.
  const sendMessage = () => {
    const text = message.trim();

    if (!text || sending) return;

    if (!liveClassId) {
      setError("Live class ID is missing.");
      return;
    }

    if (!socket || !socket.connected) {
      setError("You are disconnected from the live classroom.");
      return;
    }

    setSending(true);
    setError("");

    socket.emit(
      "live:chat-send",
      {
        classId: String(liveClassId),
        message: text,
      },
      (response) => {
        setSending(false);

        if (!response?.success) {
          setError(
            response?.message || "Unable to send your message."
          );
          return;
        }

        if (response.messageData) {
          addMessage(response.messageData);
        }

        setMessage("");

        requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      }
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#0a0d14] text-white">

      {/* Header */}
      <div className="relative flex-shrink-0 px-4 py-4 border-b border-white/[0.07] bg-white/[0.025]">
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/15">
              <MessageCircle
                size={19}
                className="text-indigo-300"
              />

              <span
                className={`absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full border-2 border-[#0a0d14] ${
                  socket?.connected
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Live Chat
              </h3>

              <p className="text-[11px] text-slate-500 mt-0.5">
                {isTutor
                  ? "Questions and messages from your students"
                  : "Ask your tutor a question"}
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <span className="text-[10px] font-semibold text-slate-400">
              {messages.length}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-3 mt-3 flex items-start gap-2 rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2.5">
          <AlertCircle
            size={14}
            className="text-red-400 mt-0.5"
          />

          <p className="text-xs text-red-300 leading-5">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-red-400"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-400/15 flex items-center justify-center">
              <MessageCircle
                size={27}
                className="text-indigo-300"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-200">
              No messages yet
            </p>

            <p className="mt-1.5 text-xs text-slate-500 leading-5 max-w-[220px]">
              {isTutor
                ? "Student questions will appear here."
                : "Send your tutor a question when you need help."}
            </p>
          </div>
        ) : (
          messages.map((item, index) => {
            const senderRole = getSenderRole(item);

            const fromTutor =
              senderRole === "tutor" ||
              senderRole === "teacher";

            const ownMessage = isTutor
              ? fromTutor
              : !fromTutor;

            const senderName = getSenderName(item);

            return (
              <div
                key={getMessageId(item, index)}
                className={`flex ${
                  ownMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[86%] flex flex-col ${
                    ownMessage ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 mb-1.5 ${
                      ownMessage ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold border ${
                        fromTutor
                          ? "bg-indigo-500/15 border-indigo-400/15 text-indigo-300"
                          : "bg-white/[0.06] border-white/[0.07] text-slate-400"
                      }`}
                    >
                      {String(
                        fromTutor ? tutorName : senderName
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400">
                      {ownMessage ? "You" : senderName}
                    </span>

                    {fromTutor && (
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-400/10 text-[8px] font-bold uppercase tracking-wider text-indigo-300">
                        Tutor
                      </span>
                    )}
                  </div>

                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-5 break-words border ${
                      fromTutor
                        ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-indigo-400/20 rounded-br-md"
                        : "bg-white/[0.055] text-slate-200 border-white/[0.07] rounded-bl-md"
                    }`}
                  >
                    {getMessageText(item)}
                  </div>

                  <span className="mt-1.5 text-[9px] text-slate-600">
                    {formatTime(
                      item?.created_at || item?.createdAt
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="relative flex-shrink-0 border-t border-white/[0.07] p-3 bg-white/[0.018]">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              disabled={sending || !socket?.connected}
              rows={1}
              maxLength={2000}
              placeholder={
                isTutor
                  ? "Reply to your students..."
                  : "Ask your tutor a question..."
              }
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-400/30 focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            onClick={sendMessage}
            disabled={
              sending ||
              !message.trim() ||
              !liveClassId ||
              !socket?.connected
            }
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center border border-indigo-400/20 shadow-lg transition-all hover:from-indigo-400 hover:to-violet-500 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Send message"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[9px] text-slate-600">
            Enter to send · Shift + Enter for new line
          </p>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                socket?.connected
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            />

            <span className="text-[9px] text-slate-600">
              {socket?.connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
