import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCheck,
  Loader2,
  MessageCircle,
  Search,
  Send,
  User,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| Tutor reference
|--------------------------------------------------------------------------
*/

function getTutorReference() {
  const keys = [
    "tutorReference",
    "tutor_reference",
    "tutor",
    "academyTutor",
    "scholiqen_user",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);

        const reference =
          parsed?.tutorReference ||
          parsed?.tutor_reference ||
          parsed?.reference ||
          parsed?.applicationReference ||
          parsed?.application_reference ||
          parsed?.tutor?.reference ||
          parsed?.tutor?.tutorReference ||
          parsed?.user?.reference;

        if (reference) {
          return String(reference);
        }
      } catch {
        return String(raw);
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| API helper
|--------------------------------------------------------------------------
*/

async function apiFetch(path, options = {}) {
  const tutorReference = getTutorReference();

  const headers = {
    Accept: "application/json",
    ...(options.body
      ? {
          "Content-Type": "application/json",
        }
      : {}),
    ...(options.headers || {}),
  };

  if (tutorReference) {
    headers["x-tutor-reference"] = tutorReference;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType =
    response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    data = {
      success: response.ok,
      message: text,
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Normalize conversation
|--------------------------------------------------------------------------
*/

function normalizeConversation(item) {
  return {
    id:
      item?.id ||
      item?.conversationId ||
      item?.conversation_id,

    studentId:
      item?.studentId ||
      item?.student_id ||
      item?.studentReference ||
      item?.student_reference ||
      item?.enrollmentId ||
      item?.enrollment_id,

    studentName:
      item?.studentName ||
      item?.student_name ||
      item?.name ||
      "Student",

    studentAvatar:
      item?.studentAvatar ||
      item?.student_avatar ||
      item?.avatar ||
      item?.profileImage ||
      item?.profile_image ||
      "",

    lastMessage:
      item?.lastMessage ||
      item?.last_message ||
      "",

    lastMessageAt:
      item?.lastMessageAt ||
      item?.last_message_at ||
      item?.updatedAt ||
      item?.updated_at ||
      item?.createdAt ||
      item?.created_at ||
      null,

    unreadCount: Number(
      item?.unreadCount ??
        item?.unread_count ??
        item?.unreadCountTutor ??
        item?.unread_count_tutor ??
        0
    ),

    className:
      item?.className ||
      item?.class_name ||
      item?.grade ||
      "",

    subject:
      item?.subject ||
      item?.subject_name ||
      "",
  };
}

/*
|--------------------------------------------------------------------------
| Normalize message
|--------------------------------------------------------------------------
*/

function normalizeMessage(item) {
  return {
    id:
      item?.id ||
      item?.messageId ||
      item?.message_id ||
      `${Date.now()}-${Math.random()}`,

    senderType:
      item?.senderType ||
      item?.sender_type ||
      item?.role ||
      "",

    senderId:
      item?.senderId ||
      item?.sender_id ||
      item?.senderReference ||
      item?.sender_reference ||
      "",

    senderName:
      item?.senderName ||
      item?.sender_name ||
      "",

    message:
      item?.message ||
      item?.content ||
      item?.text ||
      "",

    createdAt:
      item?.createdAt ||
      item?.created_at ||
      item?.sentAt ||
      item?.sent_at ||
      null,

    read:
      item?.read ??
      item?.isRead ??
      item?.is_read ??
      false,
  };
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatConversationTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const sameDay =
    date.toDateString() === now.toDateString();

  if (sameDay) {
    return formatTime(value);
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

/*
|--------------------------------------------------------------------------
| Main component
|--------------------------------------------------------------------------
*/

export default function TutorStudentMessages() {
  const [conversations, setConversations] = useState([]);

  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messages, setMessages] = useState([]);

  const [messageText, setMessageText] = useState("");

  const [search, setSearch] = useState("");

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load conversations
  |--------------------------------------------------------------------------
  */

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    setError("");

    try {
      const response = await apiFetch(
        "/api/academy/tutor/messages"
      );

      const data =
        response?.conversations ||
        response?.threads ||
        response?.data ||
        [];

      const normalized = Array.isArray(data)
        ? data.map(normalizeConversation)
        : [];

      setConversations(normalized);
    } catch (err) {
      console.error(
        "Tutor student messages error:",
        err
      );

      setError(
        err?.message ||
          "Failed to load student messages."
      );

      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /*
  |--------------------------------------------------------------------------
  | Load conversation messages
  |--------------------------------------------------------------------------
  */

  const loadMessages = useCallback(
    async (conversation) => {
      if (!conversation?.id) return;

      setLoadingMessages(true);
      setError("");

      try {
        const response = await apiFetch(
          `/api/academy/tutor/messages/${encodeURIComponent(
            conversation.id
          )}`
        );

        const data =
          response?.messages ||
          response?.data ||
          [];

        const normalized = Array.isArray(data)
          ? data.map(normalizeMessage)
          : [];

        setMessages(normalized);
      } catch (err) {
        console.error(
          "Conversation messages error:",
          err
        );

        setError(
          err?.message ||
            "Failed to load this conversation."
        );

        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Open conversation
  |--------------------------------------------------------------------------
  */

  const openConversation = async (conversation) => {
    setSelectedConversation(conversation);

    setConversations((previous) =>
      previous.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              unreadCount: 0,
            }
          : item
      )
    );

    await loadMessages(conversation);
  };

  /*
  |--------------------------------------------------------------------------
  | SEND REPLY
  |--------------------------------------------------------------------------
  */

  const sendMessage = async () => {
    const text = messageText.trim();

    if (!text || !selectedConversation || sending) {
      return;
    }

    const conversationId =
      selectedConversation.id;

    if (!conversationId) {
      setError(
        "This conversation does not have a valid conversation ID."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await apiFetch(
        `/api/academy/tutor/messages/${encodeURIComponent(
          conversationId
        )}`,
        {
          method: "POST",
          body: JSON.stringify({
            message: text,
            content: text,
          }),
        }
      );

      /*
      |--------------------------------------------------------------------------
      | Backend returns the created message
      |--------------------------------------------------------------------------
      */

      const returnedMessage =
        response?.message ||
        response?.data?.message ||
        response?.data;

      if (returnedMessage) {
        const normalized =
          normalizeMessage(returnedMessage);

        /*
        * Prevent duplicate message if backend
        * happens to return something unexpected.
        */
        setMessages((previous) => {
          const exists = previous.some(
            (item) =>
              String(item.id) ===
              String(normalized.id)
          );

          if (exists) {
            return previous;
          }

          return [...previous, normalized];
        });
      } else {
        /*
        * If backend does not return the created
        * message, reload the conversation.
        */
        await loadMessages(
          selectedConversation
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Clear composer
      |--------------------------------------------------------------------------
      */

      setMessageText("");

      /*
      |--------------------------------------------------------------------------
      | Update conversation preview
      |--------------------------------------------------------------------------
      */

      setConversations((previous) =>
        previous.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                lastMessage: text,
                lastMessageAt:
                  new Date().toISOString(),
                unreadCount: 0,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Send student message error:",
        err
      );

      setError(
        err?.message ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Enter key
  |--------------------------------------------------------------------------
  */

  const handleMessageKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Filter conversations
  |--------------------------------------------------------------------------
  */

  const filteredConversations = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return conversations;
    }

    return conversations.filter(
      (conversation) => {
        return (
          conversation.studentName
            .toLowerCase()
            .includes(value) ||
          conversation.className
            .toLowerCase()
            .includes(value) ||
          conversation.subject
            .toLowerCase()
            .includes(value) ||
          conversation.lastMessage
            .toLowerCase()
            .includes(value)
        );
      }
    );
  }, [conversations, search]);

  /*
  |--------------------------------------------------------------------------
  | Message ownership
  |--------------------------------------------------------------------------
  */

  const isTutorMessage = (message) => {
    const type = String(
      message?.senderType || ""
    ).toLowerCase();

    return (
      type === "tutor" ||
      type === "teacher" ||
      type === "admin_tutor"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">

        {/* PAGE HEADER */}

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <MessageCircle className="h-6 w-6 text-blue-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Student Messages
              </h1>

              <p className="text-sm text-slate-400">
                Private messages from your students.
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* MESSAGES */}

        <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1120] lg:grid-cols-[340px_1fr]">

          {/* CONVERSATION LIST */}

          <div
            className={`border-r border-slate-800 ${
              selectedConversation
                ? "hidden lg:block"
                : "block"
            }`}
          >
            <div className="border-b border-slate-800 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search students..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                    <MessageCircle className="h-5 w-5 text-slate-500" />
                  </div>

                  <p className="text-sm font-medium text-slate-300">
                    No student messages
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Messages from students will appear here.
                  </p>
                </div>
              ) : (
                filteredConversations.map(
                  (conversation) => {
                    const active =
                      selectedConversation?.id ===
                      conversation.id;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() =>
                          openConversation(
                            conversation
                          )
                        }
                        className={`flex w-full gap-3 border-b border-slate-800/70 p-4 text-left transition ${
                          active
                            ? "bg-blue-500/10"
                            : "hover:bg-slate-900"
                        }`}
                      >
                        {/* AVATAR */}

                        <div className="relative shrink-0">
                          {conversation.studentAvatar ? (
                            <img
                              src={
                                conversation.studentAvatar
                              }
                              alt={
                                conversation.studentName
                              }
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800">
                              <User className="h-5 w-5 text-slate-500" />
                            </div>
                          )}

                          {conversation.unreadCount >
                            0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                              {conversation.unreadCount >
                              9
                                ? "9+"
                                : conversation.unreadCount}
                            </span>
                          )}
                        </div>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-slate-100">
                              {conversation.studentName}
                            </p>

                            <span className="shrink-0 text-[10px] text-slate-600">
                              {formatConversationTime(
                                conversation.lastMessageAt
                              )}
                            </span>
                          </div>

                          {(conversation.className ||
                            conversation.subject) && (
                            <p className="mt-0.5 truncate text-[10px] text-blue-400">
                              {conversation.className}

                              {conversation.subject
                                ? ` • ${conversation.subject}`
                                : ""}
                            </p>
                          )}

                          <p
                            className={`mt-1 truncate text-xs ${
                              conversation.unreadCount >
                              0
                                ? "font-medium text-slate-300"
                                : "text-slate-500"
                            }`}
                          >
                            {conversation.lastMessage ||
                              "No messages yet"}
                          </p>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>
          </div>

          {/* CHAT PANEL */}

          <div
            className={`flex min-h-[680px] flex-col ${
              selectedConversation
                ? "flex"
                : "hidden lg:flex"
            }`}
          >
            {!selectedConversation ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <MessageCircle className="h-8 w-8 text-blue-400" />
                </div>

                <h2 className="text-lg font-semibold">
                  Your student messages
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Select a student conversation to view
                  messages and reply privately.
                </p>
              </div>
            ) : (
              <>
                {/* CHAT HEADER */}

                <div className="flex items-center gap-3 border-b border-slate-800 p-4">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedConversation(null)
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  {selectedConversation.studentAvatar ? (
                    <img
                      src={
                        selectedConversation.studentAvatar
                      }
                      alt={
                        selectedConversation.studentName
                      }
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">
                      {selectedConversation.studentName}
                    </h2>

                    <p className="truncate text-xs text-slate-500">
                      {selectedConversation.className ||
                        "Student"}

                      {selectedConversation.subject
                        ? ` • ${selectedConversation.subject}`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* MESSAGES */}

                <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <MessageCircle className="mb-3 h-8 w-8 text-slate-700" />

                      <p className="text-sm text-slate-500">
                        No messages in this conversation yet.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const tutorMessage =
                        isTutorMessage(message);

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            tutorMessage
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: 5,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              tutorMessage
                                ? "rounded-br-md bg-blue-600 text-white"
                                : "rounded-bl-md bg-slate-800 text-slate-200"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {message.message}
                            </p>

                            <div
                              className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                                tutorMessage
                                  ? "text-blue-100/70"
                                  : "text-slate-500"
                              }`}
                            >
                              <span>
                                {formatTime(
                                  message.createdAt
                                )}
                              </span>

                              {tutorMessage && (
                                <CheckCheck className="h-3 w-3" />
                              )}
                            </div>
                          </motion.div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* COMPOSER */}

                <div className="border-t border-slate-800 p-4">
                  <div className="flex items-end gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-2">
                    <textarea
                      value={messageText}
                      onChange={(event) =>
                        setMessageText(
                          event.target.value
                        )
                      }
                      onKeyDown={
                        handleMessageKeyDown
                      }
                      rows={1}
                      disabled={sending}
                      placeholder="Type a reply..."
                      className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
                    />

                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={
                        sending ||
                        !messageText.trim()
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Send reply"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-[10px] text-slate-600">
                    Press Enter to send • Shift + Enter
                    for a new line
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
