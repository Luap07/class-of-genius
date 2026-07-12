import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";

const SupportContext = createContext();

export const useSupport = () => useContext(SupportContext);

export const SupportProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [conversations, setConversations] = useState([]);

  const [messages, setMessages] = useState([]);

  const [activeConversation, setActiveConversation] = useState(null);

  const [loading, setLoading] = useState(false);

  /* ================= CURRENT USER ================= */

  useEffect(() => {
    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  };

  /* ================= LOAD CONVERSATIONS ================= */

  const loadConversations = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("support_conversations")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (!error) {
      setConversations(data);
    }

    setLoading(false);
  };

  /* ================= LOAD MESSAGES ================= */

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", {
        ascending: true,
      });

    if (!error) {
      setMessages(data);
    }
  };

  /* ================= CREATE CONVERSATION ================= */

  const createConversation = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("support_conversations")
      .insert({
        user_id: user.id,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.log(error);
      return null;
    }

    await loadConversations();

    return data;
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async (conversationId, text) => {
    if (!conversationId || !text.trim()) return;

    await supabase.from("support_messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      sender: "user",
      message: text,
    });
  };

  /* ================= REALTIME ================= */

  useEffect(() => {
    const channel = supabase
      .channel("support-chat")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_messages",
        },
        (payload) => {
          if (
            payload.new?.conversation_id === activeConversation
          ) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

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
      }}
    >
      {children}
    </SupportContext.Provider>
  );
};