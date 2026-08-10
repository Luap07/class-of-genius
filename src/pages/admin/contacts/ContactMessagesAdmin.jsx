import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  Mail,
  MailOpen,
  MessageSquare,
  Users,
  Clock3,
  Trash2,
  X,
  Check,
  ChevronDown,
  Inbox,
  AlertCircle,
  CalendarDays,
  User,
  AtSign,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

const ContactMessagesAdmin = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedMessage, setSelectedMessage] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     FETCH MESSAGES
  ========================================================= */

  const fetchMessages = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const { data, error: fetchError } = await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

        if (fetchError) {
          throw fetchError;
        }

        setMessages(data || []);
      } catch (err) {
        console.error("Contact messages error:", err);

        setError(
          err?.message ||
            "Unable to load contact messages."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /* =========================================================
     CLEAR NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const total = messages.length;

    const unread = messages.filter(
      (message) =>
        message.is_read === false ||
        message.is_read === null ||
        message.is_read === undefined
    ).length;

    const read = total - unread;

    const today = new Date();

    const todayMessages = messages.filter((message) => {
      if (!message.created_at) return false;

      const date = new Date(message.created_at);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;

    return {
      total,
      unread,
      read,
      today: todayMessages,
    };
  }, [messages]);

  /* =========================================================
     FILTERED MESSAGES
  ========================================================= */

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((message) => {
      const isUnread =
        message.is_read === false ||
        message.is_read === null ||
        message.is_read === undefined;

      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && isUnread) ||
        (filter === "read" && !isUnread);

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        message.name,
        message.email,
        message.message,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [messages, search, filter]);

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (value) => {
    if (!value) {
      return "Unknown date";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  /* =========================================================
     MARK AS READ
  ========================================================= */

  const markAsRead = async (message) => {
    if (!message?.id) return;

    if (message.is_read === true) {
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("contact_messages")
        .update({
          is_read: true,
        })
        .eq("id", message.id);

      if (updateError) {
        throw updateError;
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );

      setSelectedMessage((current) =>
        current?.id === message.id
          ? {
              ...current,
              is_read: true,
            }
          : current
      );
    } catch (err) {
      console.error("Mark as read error:", err);

      setError(
        err?.message ||
          "Unable to mark message as read."
      );
    }
  };

  /* =========================================================
     OPEN MESSAGE
  ========================================================= */

  const openMessage = async (message) => {
    setSelectedMessage(message);

    await markAsRead(message);
  };

  /* =========================================================
     DELETE MESSAGE
  ========================================================= */

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      setError("");

      const { error: deleteError } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", deleteId);

      if (deleteError) {
        throw deleteError;
      }

      setMessages((current) =>
        current.filter(
          (message) => message.id !== deleteId
        )
      );

      if (selectedMessage?.id === deleteId) {
        setSelectedMessage(null);
      }

      setDeleteId(null);

      setSuccess("Message deleted successfully.");
    } catch (err) {
      console.error("Delete message error:", err);

      setError(
        err?.message ||
          "Unable to delete message."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     STAT CARD
  ========================================================= */

  const StatCard = ({
    icon: Icon,
    label,
    value,
    description,
    iconClass,
    iconBg,
  }) => (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="
        rounded-3xl
        border
        border-white/[0.06]
        bg-[#0b1220]
        p-5
        shadow-[0_15px_50px_rgba(0,0,0,0.18)]
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {description}
          </p>
        </div>

        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            ${iconBg}
          `}
        >
          <Icon
            size={20}
            className={iconClass}
          />
        </div>
      </div>
    </motion.div>
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050912] p-6 text-white sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">

          <div className="animate-pulse">
            <div className="h-10 w-72 rounded-xl bg-slate-800" />

            <div className="mt-3 h-5 w-96 max-w-full rounded-lg bg-slate-900" />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="
                    h-32
                    rounded-3xl
                    border
                    border-white/[0.04]
                    bg-[#0b1220]
                  "
                />
              ))}
            </div>

            <div className="mt-6 h-[500px] rounded-3xl bg-[#0b1220]" />
          </div>

        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#050912] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10">

      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-500/20
                bg-cyan-500/10
                px-4
                py-2
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-cyan-400
              "
            >
              <Inbox size={15} />

              Contact Center
            </div>

            <h1
              className="
                mt-5
                text-3xl
                font-black
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              Contact Messages
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-slate-500
                sm:text-base
              "
            >
              Manage messages submitted through
              the Scholiqen contact form.
            </p>

          </div>

          <button
            type="button"
            onClick={() => fetchMessages({ silent: true })}
            disabled={refreshing}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/80
              px-5
              py-3
              text-sm
              font-bold
              text-slate-200
              transition
              hover:border-cyan-500/30
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* ===================================================
            STATUS
        =================================================== */}

        <AnimatePresence>

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="
                mt-6
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10
                p-4
                text-sm
                text-red-300
              "
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto text-red-400 hover:text-white"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="
                mt-6
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-emerald-500/20
                bg-emerald-500/10
                p-4
                text-sm
                text-emerald-300
              "
            >
              <Check size={19} />

              <span>{success}</span>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ===================================================
            STATS
        =================================================== */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={MessageSquare}
            label="Total Messages"
            value={stats.total}
            description="All submitted messages"
            iconClass="text-cyan-400"
            iconBg="bg-cyan-500/10"
          />

          <StatCard
            icon={Mail}
            label="Unread"
            value={stats.unread}
            description="Waiting for review"
            iconClass="text-amber-400"
            iconBg="bg-amber-500/10"
          />

          <StatCard
            icon={MailOpen}
            label="Read"
            value={stats.read}
            description="Already reviewed"
            iconClass="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />

          <StatCard
            icon={Clock3}
            label="Today"
            value={stats.today}
            description="Messages received today"
            iconClass="text-violet-400"
            iconBg="bg-violet-500/10"
          />

        </div>

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <div
          className="
            mt-8
            rounded-3xl
            border
            border-white/[0.06]
            bg-[#0b1220]
            p-4
            shadow-[0_15px_50px_rgba(0,0,0,0.15)]
          "
        >

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">

              <Search
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-600
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by name, email or message..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-950/70
                  py-3.5
                  pl-11
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-500/40
                  focus:ring-2
                  focus:ring-cyan-500/10
                "
              />

            </div>

            {/* FILTER */}

            <div className="relative">

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
                className="
                  w-full
                  appearance-none
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-950/70
                  py-3.5
                  pl-4
                  pr-10
                  text-sm
                  font-semibold
                  text-slate-300
                  outline-none
                  focus:border-cyan-500/40
                  sm:w-44
                "
              >
                <option value="all">
                  All Messages
                </option>

                <option value="unread">
                  Unread
                </option>

                <option value="read">
                  Read
                </option>
              </select>

              <ChevronDown
                size={16}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-600
                "
              />

            </div>

          </div>

        </div>

        {/* ===================================================
            MESSAGE LIST
        =================================================== */}

        <div className="mt-6 space-y-3">

          {filteredMessages.length === 0 ? (

            <div
              className="
                rounded-3xl
                border
                border-white/[0.06]
                bg-[#0b1220]
                px-6
                py-20
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-900
                  text-slate-600
                "
              >
                <Inbox size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-white">
                No messages found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {search
                  ? "Try changing your search."
                  : filter !== "all"
                  ? "There are no messages in this category."
                  : "Messages submitted through the contact form will appear here."}
              </p>
            </div>

          ) : (

            filteredMessages.map((message, index) => {

              const unread =
                message.is_read === false ||
                message.is_read === null ||
                message.is_read === undefined;

              return (
                <motion.div
                  key={message.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: Math.min(
                      index * 0.03,
                      0.3
                    ),
                  }}
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    bg-[#0b1220]
                    transition-all
                    duration-300
                    ${
                      unread
                        ? "border-cyan-500/20"
                        : "border-white/[0.05]"
                    }
                    hover:border-cyan-500/25
                    hover:bg-[#0d1525]
                  `}
                >

                  {unread && (
                    <div
                      className="
                        absolute
                        bottom-0
                        left-0
                        top-0
                        w-1
                        bg-cyan-400
                      "
                    />
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      openMessage(message)
                    }
                    className="
                      w-full
                      p-5
                      text-left
                      sm:p-6
                    "
                  >

                    <div className="flex items-start gap-4">

                      {/* AVATAR */}

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gradient-to-br
                          from-cyan-500/20
                          to-blue-500/10
                          text-cyan-300
                        "
                      >
                        <User size={20} />
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                          <div className="flex min-w-0 items-center gap-2">

                            <h3
                              className={`
                                truncate
                                text-sm
                                ${
                                  unread
                                    ? "font-black text-white"
                                    : "font-bold text-slate-300"
                                }
                              `}
                            >
                              {message.name ||
                                "Unknown sender"}
                            </h3>

                            {unread && (
                              <span
                                className="
                                  shrink-0
                                  rounded-full
                                  bg-cyan-500/10
                                  px-2
                                  py-0.5
                                  text-[10px]
                                  font-black
                                  uppercase
                                  tracking-wider
                                  text-cyan-400
                                "
                              >
                                New
                              </span>
                            )}

                          </div>

                          <div
                            className="
                              flex
                              shrink-0
                              items-center
                              gap-1.5
                              text-xs
                              text-slate-600
                            "
                          >
                            <Clock3 size={13} />

                            {formatDate(
                              message.created_at
                            )}
                          </div>

                        </div>

                        <div
                          className="
                            mt-1
                            flex
                            items-center
                            gap-2
                            text-xs
                            text-slate-600
                          "
                        >
                          <AtSign size={13} />

                          <span className="truncate">
                            {message.email ||
                              "No email provided"}
                          </span>
                        </div>

                        <p
                          className="
                            mt-4
                            line-clamp-2
                            text-sm
                            leading-6
                            text-slate-500
                          "
                        >
                          {message.message ||
                            "No message content."}
                        </p>

                      </div>

                    </div>

                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(message.id);
                    }}
                    className="
                      absolute
                      bottom-5
                      right-5
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-red-500/10
                      bg-red-500/5
                      text-red-400
                      opacity-100
                      transition
                      hover:border-red-500/25
                      hover:bg-red-500/10
                      sm:opacity-0
                      sm:group-hover:opacity-100
                    "
                    title="Delete message"
                  >
                    <Trash2 size={16} />
                  </button>

                </motion.div>
              );
            })

          )}

        </div>

        {/* ===================================================
            RESULT COUNT
        =================================================== */}

        {messages.length > 0 && (
          <div className="mt-5 text-center text-xs text-slate-700">
            Showing {filteredMessages.length} of{" "}
            {messages.length} messages
          </div>
        )}

      </div>

      {/* =====================================================
          MESSAGE DETAIL MODAL
      ===================================================== */}

      <AnimatePresence>

        {selectedMessage && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/70
              p-4
              backdrop-blur-md
            "
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedMessage(null);
              }
            }}
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              transition={{
                duration: 0.2,
              }}
              className="
                max-h-[90vh]
                w-full
                max-w-2xl
                overflow-hidden
                rounded-[30px]
                border
                border-white/[0.08]
                bg-[#0b1220]
                shadow-[0_30px_120px_rgba(0,0,0,0.55)]
              "
            >

              {/* MODAL HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-white/[0.06]
                  bg-gradient-to-r
                  from-cyan-500/[0.08]
                  via-transparent
                  to-blue-500/[0.06]
                  px-6
                  py-5
                  sm:px-7
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      bg-cyan-500/10
                      text-cyan-400
                    "
                  >
                    <MessageSquare size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      Message Details
                    </h2>

                    <p className="text-xs text-slate-600">
                      Contact submission
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedMessage(null)
                  }
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-900
                    text-slate-400
                    transition
                    hover:bg-slate-800
                    hover:text-white
                  "
                >
                  <X size={18} />
                </button>

              </div>

              {/* MODAL BODY */}

              <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-6 sm:p-7">

                {/* SENDER */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-white/[0.05]
                    bg-slate-950/50
                    p-5
                  "
                >

                  <div className="flex items-center gap-4">

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-cyan-500/10
                        text-cyan-400
                      "
                    >
                      <User size={21} />
                    </div>

                    <div className="min-w-0">

                      <h3 className="truncate font-bold text-white">
                        {selectedMessage.name ||
                          "Unknown sender"}
                      </h3>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {selectedMessage.email ||
                          "No email provided"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* META */}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                  <div
                    className="
                      rounded-2xl
                      border
                      border-white/[0.05]
                      bg-slate-950/40
                      p-4
                    "
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <CalendarDays size={14} />

                      Received
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      {formatDate(
                        selectedMessage.created_at
                      )}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-2xl
                      border
                      border-white/[0.05]
                      bg-slate-950/40
                      p-4
                    "
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                      {selectedMessage.is_read ? (
                        <MailOpen size={14} />
                      ) : (
                        <Mail size={14} />
                      )}

                      Status
                    </div>

                    <p
                      className={`
                        mt-2
                        text-sm
                        font-bold
                        ${
                          selectedMessage.is_read
                            ? "text-emerald-400"
                            : "text-cyan-400"
                        }
                      `}
                    >
                      {selectedMessage.is_read
                        ? "Read"
                        : "Unread"}
                    </p>
                  </div>

                </div>

                {/* MESSAGE */}

                <div className="mt-6">

                  <div className="mb-3 flex items-center gap-2">

                    <MessageSquare
                      size={17}
                      className="text-cyan-400"
                    />

                    <h3 className="font-bold text-white">
                      Message
                    </h3>

                  </div>

                  <div
                    className="
                      min-h-[180px]
                      whitespace-pre-wrap
                      rounded-2xl
                      border
                      border-white/[0.05]
                      bg-slate-950/60
                      p-5
                      text-sm
                      leading-7
                      text-slate-300
                    "
                  >
                    {selectedMessage.message ||
                      "No message content."}
                  </div>

                </div>

                {/* ACTIONS */}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteId(
                        selectedMessage.id
                      )
                    }
                    className="
                      flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-red-500/20
                      bg-red-500/10
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-red-300
                      transition
                      hover:bg-red-500/15
                    "
                  >
                    <Trash2 size={17} />

                    Delete Message
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMessage(null)
                    }
                    className="
                      flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-slate-800
                      bg-slate-900
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-slate-300
                      transition
                      hover:bg-slate-800
                      hover:text-white
                    "
                  >
                    Close
                  </button>

                </div>

              </div>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      <AnimatePresence>

        {deleteId && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0
              z-[60]
              flex
              items-center
              justify-center
              bg-black/75
              p-4
              backdrop-blur-md
            "
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="
                w-full
                max-w-md
                rounded-[28px]
                border
                border-white/[0.08]
                bg-[#0b1220]
                p-6
                shadow-[0_30px_100px_rgba(0,0,0,0.55)]
              "
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-500/10
                  text-red-400
                "
              >
                <Trash2 size={21} />
              </div>

              <h2 className="mt-5 text-xl font-black text-white">
                Delete this message?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This action permanently removes
                the message from your contact
                messages. It cannot be undone.
              </p>

              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setDeleteId(null)
                  }
                  disabled={deleting}
                  className="
                    flex-1
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900
                    px-5
                    py-3.5
                    text-sm
                    font-bold
                    text-slate-300
                    transition
                    hover:bg-slate-800
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-red-500
                    px-5
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-red-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Trash2 size={16} />

                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default ContactMessagesAdmin;
