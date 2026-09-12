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

      /*
        Accept different backend response shapes.
      */

      const returnedMessage =
        data?.messageData ||
        data?.chat ||
        data?.data?.message ||
        data?.data ||
        data?.message;

      /*
        If backend returned the actual chat object,
        use it.

        Otherwise create a temporary local message.
      */

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

      /*
        Keep textarea focused after sending.
      */

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
    /*
      Enter = send
      Shift + Enter = new line
    */

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
    <div className="h-full min-h-0 flex flex-col bg-white">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageCircle
            size={18}
            className="text-indigo-600"
          />

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Live Chat
            </h3>

            <p className="text-xs text-gray-500">
              Talk with everyone in the class
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mx-3 mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertCircle
            size={15}
            className="mt-0.5 flex-shrink-0 text-red-500"
          />

          <p className="text-xs text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-xs text-red-500 hover:text-red-700"
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
        className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-3"
      >
        {!Array.isArray(messages) ||
        messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
              <MessageCircle
                size={22}
                className="text-indigo-500"
              />
            </div>

            <p className="mt-3 text-sm font-medium text-gray-700">
              No messages yet
            </p>

            <p className="mt-1 text-xs text-gray-400 leading-5">
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
                  className={`max-w-[85%] ${
                    isTutor
                      ? "items-end"
                      : "items-start"
                  } flex flex-col`}
                >
                  {/* Sender */}
                  <div
                    className={`flex items-center gap-2 mb-1 ${
                      isTutor
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-gray-600">
                      {isTutor
                        ? "You"
                        : senderName}
                    </span>

                    {isTutor && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                        Tutor
                      </span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-5 break-words ${
                      isTutor
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {text}
                  </div>

                  {/* Time */}
                  <span className="mt-1 text-[10px] text-gray-400">
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

      <div className="flex-shrink-0 border-t border-gray-200 p-3">
        <div className="flex items-end gap-2">
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
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={
              sending ||
              !message.trim() ||
              !liveClassId
            }
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            {sending ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Send
                size={18}
                className="ml-0.5"
              />
            )}
          </button>
        </div>

        <p className="mt-1.5 px-1 text-[10px] text-gray-400">
          Press Enter to send • Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}