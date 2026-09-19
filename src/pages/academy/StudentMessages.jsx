import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  MessageCircle,
  Search,
  Send,
  UserRound,
} from "lucide-react";

import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const MESSAGES_ENDPOINT =
  `${API_URL}/api/academy/student/messages`;

const DEMO_CONVERSATIONS = [
  {
    id: "conversation-001",
    participantName: "Mr. Adewale",
    participantRole: "Mathematics Tutor",
    lastMessage:
      "Remember to complete the quadratic equations assignment.",
    updatedAt: "2026-09-18T18:30:00",
    messages: [
      {
        id: "message-001",
        sender: "tutor",
        message:
          "Remember to complete the quadratic equations assignment.",
        createdAt:
          "2026-09-18T18:30:00",
      },
    ],
  },
  {
    id: "conversation-002",
    participantName: "Mrs. Johnson",
    participantRole: "English Tutor",
    lastMessage:
      "Your comprehension submission has been received.",
    updatedAt: "2026-09-17T15:20:00",
    messages: [
      {
        id: "message-002",
        sender: "tutor",
        message:
          "Your comprehension submission has been received.",
        createdAt:
          "2026-09-17T15:20:00",
      },
    ],
  },
];

const getStudentId = (student) => {
  if (!student) return "";

  return (
    student.id ||
    student.studentId ||
    student.student_id ||
    student.enrollmentId ||
    student.enrollment_id ||
    ""
  );
};

const normalizeConversation = (
  item,
  index
) => ({
  id:
    item?.id ||
    item?.conversationId ||
    item?.conversation_id ||
    `conversation-${index}`,

  participantName:
    item?.participantName ||
    item?.participant_name ||
    item?.tutorName ||
    item?.tutor_name ||
    item?.teacherName ||
    "Tutor",

  participantRole:
    item?.participantRole ||
    item?.participant_role ||
    item?.role ||
    "Tutor",

  lastMessage:
    item?.lastMessage ||
    item?.last_message ||
    item?.message ||
    "",

  updatedAt:
    item?.updatedAt ||
    item?.updated_at ||
    item?.createdAt ||
    item?.created_at ||
    "",

  messages:
    Array.isArray(item?.messages)
      ? item.messages.map(
          normalizeMessage
        )
      : [],
});

const normalizeMessage = (
  item,
  index
) => ({
  id:
    item?.id ||
    item?.messageId ||
    item?.message_id ||
    `message-${index}`,

  sender:
    item?.sender ||
    item?.senderType ||
    item?.sender_type ||
    "tutor",

  message:
    item?.message ||
    item?.content ||
    item?.body ||
    "",

  createdAt:
    item?.createdAt ||
    item?.created_at ||
    item?.timestamp ||
    "",
});

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-NG",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

export default function StudentMessages() {
  const { student } = useOutletContext() || {};

  const [conversations, setConversations] =
    useState([]);

  const [selectedId, setSelectedId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const studentId =
    getStudentId(student);

  const loadMessages = async () => {
    setLoading(true);
    setError("");

    try {
      const url = new URL(
        MESSAGES_ENDPOINT
      );

      if (studentId) {
        url.searchParams.set(
          "studentId",
          studentId
        );
      }

      const response = await fetch(
        url.toString()
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load messages."
        );
      }

      const data =
        await response.json();

      const rawItems =
        Array.isArray(data)
          ? data
          : data.conversations ||
            data.messages ||
            data.data ||
            [];

      if (!Array.isArray(rawItems)) {
        throw new Error(
          "Invalid messages response."
        );
      }

      const normalized =
        rawItems.map(
          normalizeConversation
        );

      setConversations(normalized);

      if (
        normalized.length > 0 &&
        !selectedId
      ) {
        setSelectedId(
          normalized[0].id
        );
      }
    } catch (err) {
      console.error(
        "STUDENT MESSAGES ERROR:",
        err
      );

      const demo =
        DEMO_CONVERSATIONS.map(
          normalizeConversation
        );

      setConversations(demo);

      if (!selectedId) {
        setSelectedId(demo[0]?.id);
      }

      setError(
        "Messages could not be loaded from the server. Showing sample conversations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [studentId]);

  const filteredConversations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return conversations;
      }

      return conversations.filter(
        (conversation) =>
          conversation.participantName
            .toLowerCase()
            .includes(query) ||
          conversation.participantRole
            .toLowerCase()
            .includes(query) ||
          conversation.lastMessage
            .toLowerCase()
            .includes(query)
      );
    }, [
      conversations,
      search,
    ]);

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id === selectedId
    ) || null;

  const sendMessage = async () => {
    const trimmed =
      message.trim();

    if (
      !trimmed ||
      !selectedConversation ||
      sending
    ) {
      return;
    }

    setSending(true);

    const optimisticMessage = {
      id: `local-${Date.now()}`,
      sender: "student",
      message: trimmed,
      createdAt:
        new Date().toISOString(),
    };

    setConversations((current) =>
      current.map(
        (conversation) =>
          conversation.id ===
          selectedConversation.id
            ? {
                ...conversation,
                lastMessage: trimmed,
                updatedAt:
                  optimisticMessage.createdAt,
                messages: [
                  ...conversation.messages,
                  optimisticMessage,
                ],
              }
            : conversation
      )
    );

    setMessage("");

    try {
      const response = await fetch(
        MESSAGES_ENDPOINT,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            studentId,
            conversationId:
              selectedConversation.id,
            message: trimmed,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Message could not be sent."
        );
      }
    } catch (err) {
      console.error(
        "SEND STUDENT MESSAGE ERROR:",
        err
      );

      setError(
        "The message was displayed locally, but the server did not confirm delivery."
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-full bg-[#020617] text-white">
      <div className="mx-auto flex h-[calc(100vh-80px)] max-w-7xl flex-col p-3 sm:p-5 lg:p-6">

        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <MessageCircle
                size={22}
                className="text-cyan-300"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Messages
              </h1>

              <p className="text-sm text-slate-400">
                Communicate with your tutors.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-200">
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <div className="flex min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-[#071426]">

          <aside
            className={`w-full shrink-0 border-r border-white/10 md:w-[320px] ${
              selectedConversation
                ? "hidden md:block"
                : "block"
            }`}
          >
            <div className="border-b border-white/10 p-4">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search messages..."
                  className="w-full rounded-xl border border-white/10 bg-[#020617] py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400/40"
                />
              </div>
            </div>

            <div className="h-full overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8 text-slate-500">
                  <Loader2
                    size={20}
                    className="mr-2 animate-spin"
                  />
                  Loading...
                </div>
              ) : filteredConversations.length ===
                0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No conversations found.
                </div>
              ) : (
                filteredConversations.map(
                  (conversation) => (
                    <button
                      key={
                        conversation.id
                      }
                      type="button"
                      onClick={() =>
                        setSelectedId(
                          conversation.id
                        )
                      }
                      className={`w-full border-b border-white/5 p-4 text-left transition ${
                        selectedId ===
                        conversation.id
                          ? "bg-cyan-400/10"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                          <UserRound
                            size={18}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-sm font-semibold text-white">
                              {
                                conversation.participantName
                              }
                            </h3>

                            <span className="shrink-0 text-[10px] text-slate-600">
                              {formatTime(
                                conversation.updatedAt
                              )}
                            </span>
                          </div>

                          <p className="mt-0.5 text-xs text-cyan-300">
                            {
                              conversation.participantRole
                            }
                          </p>

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                            {
                              conversation.lastMessage
                            }
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                )
              )}
            </div>
          </aside>

          <section
            className={`flex min-w-0 flex-1 flex-col ${
              selectedConversation
                ? "flex"
                : "hidden md:flex"
            }`}
          >
            {!selectedConversation ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300">
                  <MessageCircle
                    size={30}
                  />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  Select a conversation
                </h2>

                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Choose a tutor from the list to view
                  your conversation.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-white/10 p-4">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedId(null)
                    }
                    className="rounded-xl p-2 text-slate-400 hover:bg-white/10 md:hidden"
                  >
                    <ArrowLeft
                      size={19}
                    />
                  </button>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                    <UserRound
                      size={18}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold">
                      {
                        selectedConversation.participantName
                      }
                    </h2>

                    <p className="text-xs text-cyan-300">
                      {
                        selectedConversation.participantRole
                      }
                    </p>
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                  {selectedConversation.messages.length ===
                  0 ? (
                    <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                      No messages yet. Start the
                      conversation.
                    </div>
                  ) : (
                    selectedConversation.messages.map(
                      (item, index) => {
                        const isStudent =
                          String(
                            item.sender
                          ).toLowerCase() ===
                            "student" ||
                          String(
                            item.sender
                          ).toLowerCase() ===
                            "user";

                        return (
                          <motion.div
                            key={
                              item.id ||
                              index
                            }
                            initial={{
                              opacity: 0,
                              y: 8,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            className={`flex ${
                              isStudent
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                isStudent
                                  ? "rounded-br-md bg-cyan-400 text-slate-950"
                                  : "rounded-bl-md bg-[#020617] text-slate-200"
                              }`}
                            >
                              <p className="whitespace-pre-wrap text-sm leading-6">
                                {
                                  item.message
                                }
                              </p>

                              <div
                                className={`mt-1 text-[10px] ${
                                  isStudent
                                    ? "text-slate-700"
                                    : "text-slate-600"
                                }`}
                              >
                                {formatTime(
                                  item.createdAt
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      }
                    )
                  )}
                </div>

                <div className="border-t border-white/10 p-3 sm:p-4">
                  <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#020617] p-2">
                    <textarea
                      value={message}
                      onChange={(event) =>
                        setMessage(
                          event.target.value
                        )
                      }
                      onKeyDown={
                        handleKeyDown
                      }
                      rows={1}
                      placeholder="Write a message..."
                      className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                    />

                    <button
                      type="button"
                      onClick={
                        sendMessage
                      }
                      disabled={
                        !message.trim() ||
                        sending
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {sending ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Send
                          size={17}
                        />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 px-2 text-[10px] text-slate-600">
                    Press Enter to send. Use Shift +
                    Enter for a new line.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
