import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const SupportContext = createContext(null);

export const useSupport = () => useContext(SupportContext);

/* =========================================================
   API CONFIG
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

/* =========================================================
   STORAGE
========================================================= */

const AUTH_TOKEN_KEY = "scholiqen_auth_token";

/* =========================================================
   API HELPER
========================================================= */

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      (typeof data === "string" ? data : null) ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
};

/* =========================================================
   DATA NORMALIZERS
========================================================= */

const normalizeArray = (data, possibleKeys = []) => {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of possibleKeys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
};

/* =========================================================
   PROVIDER
========================================================= */

export const SupportProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [conversations, setConversations] = useState([]);

  const [messages, setMessages] = useState([]);

  const [activeConversation, setActiveConversation] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const mountedRef = useRef(true);

  /* =======================================================
     CURRENT USER
  ======================================================= */

  const getCurrentUser = useCallback(async () => {
    const token =
      localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      if (mountedRef.current) {
        setUser(null);
      }

      return null;
    }

    try {
      const data = await apiRequest("/api/auth/me");

      const currentUser =
        data?.user ||
        data?.data ||
        data ||
        null;

      if (mountedRef.current) {
        setUser(currentUser);
      }

      return currentUser;
    } catch (error) {
      console.error(
        "❌ Support Current User Error:",
        error
      );

      if (mountedRef.current) {
        setUser(null);
      }

      return null;
    }
  }, []);

  /* =======================================================
     INITIAL AUTH
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    getCurrentUser();

    return () => {
      mountedRef.current = false;
    };
  }, [getCurrentUser]);

  /* =======================================================
     LOAD CONVERSATIONS
  ======================================================= */

  const loadConversations = useCallback(async () => {
    const token =
      localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      setConversations([]);
      return [];
    }

    setLoading(true);

    try {
      const data = await apiRequest(
        "/api/support/conversations"
      );

      const conversationList = normalizeArray(data, [
        "conversations",
        "data",
        "rows",
      ]);

      if (mountedRef.current) {
        setConversations(conversationList);
      }

      return conversationList;
    } catch (error) {
      console.error(
        "❌ Load Support Conversations Error:",
        error
      );

      if (mountedRef.current) {
        setConversations([]);
      }

      return [];
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /* =======================================================
     LOAD MESSAGES
  ======================================================= */

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) {
        setMessages([]);
        return [];
      }

      try {
        const data = await apiRequest(
          `/api/support/conversations/${encodeURIComponent(
            String(conversationId)
          )}/messages`
        );

        const messageList = normalizeArray(data, [
          "messages",
          "data",
          "rows",
        ]);

        if (mountedRef.current) {
          setMessages(messageList);
        }

        return messageList;
      } catch (error) {
        console.error(
          "❌ Load Support Messages Error:",
          error
        );

        if (mountedRef.current) {
          setMessages([]);
        }

        return [];
      }
    },
    []
  );

  /* =======================================================
     CREATE CONVERSATION
  ======================================================= */

  const createConversation = useCallback(async () => {
    if (!user?.id) {
      console.warn(
        "⚠️ Cannot create conversation: user not logged in."
      );

      return null;
    }

    try {
      const data = await apiRequest(
        "/api/support/conversations",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: user.id,
            status: "open",
          }),
        }
      );

      const conversation =
        data?.conversation ||
        data?.data ||
        data;

      await loadConversations();

      if (conversation?.id) {
        setActiveConversation(conversation.id);
        await loadMessages(conversation.id);
      }

      return conversation;
    } catch (error) {
      console.error(
        "❌ Create Support Conversation Error:",
        error
      );

      return null;
    }
  }, [
    user,
    loadConversations,
    loadMessages,
  ]);

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendMessage = useCallback(
    async (conversationId, text) => {
      if (!conversationId) {
        return null;
      }

      const messageText =
        typeof text === "string"
          ? text.trim()
          : "";

      if (!messageText) {
        return null;
      }

      if (!user?.id) {
        console.warn(
          "⚠️ Cannot send message: user not logged in."
        );

        return null;
      }

      try {
        const data = await apiRequest(
          `/api/support/conversations/${encodeURIComponent(
            String(conversationId)
          )}/messages`,
          {
            method: "POST",
            body: JSON.stringify({
              user_id: user.id,
              sender: "user",
              message: messageText,
            }),
          }
        );

        const newMessage =
          data?.message ||
          data?.data ||
          data;

        /*
         * Add the returned message immediately.
         * This replaces the need for Supabase Realtime
         * for the sender.
         */
        if (
          mountedRef.current &&
          newMessage &&
          typeof newMessage === "object"
        ) {
          setMessages((prev) => {
            const exists = prev.some(
              (item) =>
                String(item.id) ===
                String(newMessage.id)
            );

            if (exists) {
              return prev;
            }

            return [...prev, newMessage];
          });
        }

        /*
         * Refresh conversations because the backend
         * may update timestamps/status.
         */
        await loadConversations();

        return newMessage;
      } catch (error) {
        console.error(
          "❌ Send Support Message Error:",
          error
        );

        return null;
      }
    },
    [
      user,
      loadConversations,
    ]
  );

  /* =======================================================
     ACTIVE CONVERSATION
  ======================================================= */

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    loadMessages(activeConversation);
  }, [
    activeConversation,
    loadMessages,
  ]);

  /* =======================================================
     POLLING
     
     Replaces Supabase Realtime WebSocket.
     
     Every 3 seconds:
     - refresh conversations
     - refresh messages for active conversation
  ======================================================= */

  useEffect(() => {
    const token =
      localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      return undefined;
    }

    const interval = setInterval(() => {
      if (document.visibilityState === "hidden") {
        return;
      }

      loadConversations();

      if (activeConversation) {
        loadMessages(activeConversation);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [
    activeConversation,
    loadConversations,
    loadMessages,
  ]);

  /* =======================================================
     LOAD INITIAL CONVERSATIONS
  ======================================================= */

  useEffect(() => {
    const token =
      localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      return;
    }

    loadConversations();
  }, [loadConversations]);

  /* =======================================================
     CONTEXT
  ======================================================= */

  return (
    <SupportContext.Provider
      value={{
        user,

        loading,

        conversations,

        activeConversation,

        setActiveConversation,

        messages,

        loadConversations,

        loadMessages,

        createConversation,

        sendMessage,

        getCurrentUser,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
};

export default SupportContext;