// src/components/live-class/LiveChat.jsx

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Send,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function LiveChat({
  liveClassId,
  tutorReference,
  tutorName = "Tutor",
  messages = [],
  onNewMessage,
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  /* ============================================================
     AUTO SCROLL
  ============================================================ */

  useEffect(() => {
    const container =
      messagesContainerRef.current;

    if (!container) return;

    container.scrollTop =
      container.scrollHeight;
  }, [messages]);

  /* ============================================================
     GET MESSAGE ID
  ============================================================ */

  const getMessageId = (item, index) => {
    return (
      item?.id ||
      item?.message_id ||
      `${item?.created_at || Date.now()}-${index}`
    );
  };

  /* ============================================================
     GET SENDER NAME
  ============================================================ */

  const getSenderName = (item) => {
    return (
      item?.sender_name ||
      item?.senderName ||
      item?.name ||
      "User"
    );
  };

  /* ============================================================
     GET SENDER ROLE
  ============================================================ */

  const getSenderRole = (item) => {
    return String(
      item?.sender_role ||
        item?.senderRole ||
        item?.role ||
        "student"
    ).toLowerCase();
  };

  /* ============================================================
     GET MESSAGE TEXT
  ============================================================ */

  const getMessageText = (item) => {
    return (
      item?.message ||
      item?.text ||
      item?.content ||
      ""
    );
  };

  /* ============================================================
     FORMAT TIME
  ============================================================ */

  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ============================================================
     SEND MESSAGE
  ============================================================ */

  const sendMessage = async () => {
    const text = message.trim();

    if (!text) return;

    if (!liveClassId) {
      setError("Live class ID is missing.");
      return;
    }

    if (sending) return;

    try {
      setSending(true);
      setError("");

      const payload = {
        liveClassId,
        live_class_id: liveClassId,

        senderId: tutorReference,
        sender_id: tutorReference,

        senderName: tutorName,
        sender_name: tutorName,

        senderRole: "tutor",
        sender_role: "tutor",

        message: text,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/academy/tutor/live-classes/${encodeURIComponent(
          liveClassId
        )}/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to send message."
        );
      }

      const returnedMessage =
        data?.messageData ||
        data?.chat ||
        data?.data?.message ||
        data?.data ||
        data?.message;

      const newMessage =
        returnedMessage &&
        typeof returnedMessage === "object"
          ? returnedMessage
          : {
              id: `local-${Date.now()}`,
              live_class_id: liveClassId,
              sender_id: tutorReference,
              sender_name: tutorName,
              sender_role: "tutor",
              message: text,
              created_at:
                new Date().toISOString(),
            };

      if (onNewMessage) {
        onNewMessage(newMessage);
      }

      setMessage("");

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    } catch (err) {
      console.error(
        "LIVE CHAT SEND ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  /* ============================================================
     KEYBOARD HANDLER
  ============================================================ */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#0a0d14] text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="relative flex-shrink-0 px-4 py-4 border-b border-white/[0.07] bg-white/[0.025] backdrop-blur-xl">

        {/* Top glow */}
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/15 shadow-[0_0_25px_rgba(99,102,241,0.08)]">
              <MessageCircle
                size={19}
                className="text-indigo-300"
              />

              {/* Online indicator */}
              <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0d14] shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Live Chat
              </h3>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Talk with everyone in the class
              </p>
            </div>
          </div>

          {/* Message count */}
          <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <span className="text-[10px] font-semibold text-slate-400">
              {Array.isArray(messages)
                ? messages.length
                : 0}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mx-3 mt-3 flex items-start gap-2 rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2.5 shadow-[0_5px_20px_rgba(239,68,68,0.05)]">

          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-500/10 flex-shrink-0">
            <AlertCircle
              size={14}
              className="text-red-400"
            />
          </div>

          <p className="text-xs text-red-300 leading-5">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto w-6 h-6 rounded-md text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            ×
          </button>
        </div>
      )}

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      <div
        ref={messagesContainerRef}
        className="
          flex-1
          min-h-0
          overflow-y-auto
          px-3
          py-4
          space-y-4
          scrollbar-thin
          scrollbar-thumb-white/10
          scrollbar-track-transparent
        "
      >

        {!Array.isArray(messages) ||
        messages.length === 0 ? (

          <div className="h-full flex flex-col items-center justify-center text-center px-6">

            <div className="relative">

              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-xl" />

              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 border border-indigo-400/15 flex items-center justify-center">
                <MessageCircle
                  size={27}
                  className="text-indigo-300"
                />
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-200">
              No messages yet
            </p>

            <p className="mt-1.5 text-xs text-slate-500 leading-5 max-w-[220px]">
              Messages from you and your students
              will appear here.
            </p>
          </div>

        ) : (

          messages.map((item, index) => {

            const senderName =
              getSenderName(item);

            const senderRole =
              getSenderRole(item);

            const text =
              getMessageText(item);

            const isTutor =
              senderRole === "tutor" ||
              senderRole === "teacher";

            return (
              <div
                key={getMessageId(item, index)}
                className={`flex ${
                  isTutor
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[86%] ${
                    isTutor
                      ? "items-end"
                      : "items-start"
                  } flex flex-col`}
                >

                  {/* Sender */}
                  <div
                    className={`flex items-center gap-2 mb-1.5 ${
                      isTutor
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >

                    {/* Avatar */}
                    <div
                      className={`
                        w-6 h-6
                        rounded-lg
                        flex items-center justify-center
                        text-[9px]
                        font-bold
                        border
                        ${
                          isTutor
                            ? `
                              bg-indigo-500/15
                              border-indigo-400/15
                              text-indigo-300
                            `
                            : `
                              bg-white/[0.06]
                              border-white/[0.07]
                              text-slate-400
                            `
                        }
                      `}
                    >
                      {String(
                        isTutor
                          ? tutorName
                          : senderName
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400">
                      {isTutor
                        ? "You"
                        : senderName}
                    </span>

                    {isTutor && (
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-400/10 text-[8px] font-bold uppercase tracking-wider text-indigo-300">
                        Tutor
                      </span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`
                      relative
                      px-3.5
                      py-2.5
                      rounded-2xl
                      text-sm
                      leading-5
                      break-words
                      border
                      shadow-[0_5px_20px_rgba(0,0,0,0.12)]
                      ${
                        isTutor
                          ? `
                            bg-gradient-to-br
                            from-indigo-500
                            to-violet-600
                            text-white
                            border-indigo-400/20
                            rounded-br-md
                            shadow-[0_8px_25px_rgba(79,70,229,0.16)]
                          `
                          : `
                            bg-white/[0.055]
                            text-slate-200
                            border-white/[0.07]
                            rounded-bl-md
                          `
                      }
                    `}
                  >
                    {text}
                  </div>

                  {/* Time */}
                  <span className="mt-1.5 text-[9px] text-slate-600">
                    {formatTime(
                      item?.created_at ||
                        item?.createdAt
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================
          INPUT
      ====================================================== */}

      <div className="relative flex-shrink-0 border-t border-white/[0.07] p-3 bg-white/[0.018]">

        {/* Input glow */}
        <div className="pointer-events-none absolute left-1/2 -top-px -translate-x-1/2 w-32 h-px bg-indigo-400/30 blur-sm" />

        <div className="flex items-end gap-2">

          <div className="relative flex-1">

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);

                if (error) {
                  setError("");
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={sending}
              rows={1}
              placeholder="Type a message..."
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-white/[0.08]
                bg-black/20
                px-3.5
                py-3
                text-sm
                text-white
                placeholder:text-slate-600
                outline-none
                transition-all
                focus:border-indigo-400/30
                focus:bg-white/[0.035]
                focus:ring-2
                focus:ring-indigo-500/10
                disabled:opacity-50
              "
            />
          </div>

          <button
            type="button"
            onClick={sendMessage}
            disabled={
              sending ||
              !message.trim() ||
              !liveClassId
            }
            className="
              group
              relative
              flex-shrink-0
              w-11
              h-11
              rounded-xl
              bg-gradient-to-br
              from-indigo-500
              to-violet-600
              text-white
              flex
              items-center
              justify-center
              border
              border-indigo-400/20
              shadow-[0_8px_25px_rgba(79,70,229,0.2)]
              transition-all
              hover:from-indigo-400
              hover:to-violet-500
              hover:shadow-[0_8px_30px_rgba(79,70,229,0.32)]
              active:scale-95
              disabled:opacity-30
              disabled:cursor-not-allowed
              disabled:shadow-none
            "
            title="Send message"
          >

            <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

            {sending ? (
              <Loader2
                size={18}
                className="relative animate-spin"
              />
            ) : (
              <Send
                size={18}
                className="relative ml-0.5"
              />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1">

          <p className="text-[9px] text-slate-600">
            Enter to send
            <span className="mx-1 text-slate-700">•</span>
            Shift + Enter for new line
          </p>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.6)]" />
            <span className="text-[9px] text-slate-600">
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
