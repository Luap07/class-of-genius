import { createContext, useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export const ConnectContext = createContext();

export const ConnectProvider = ({ children }) => {
  // =========================
  // STATES
  // =========================
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const channelRef = useRef(null);

  // =========================
  // GET AUTH USER
  // =========================
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data?.user || null);
    };

    getUser();
  }, []);

  // =========================
  // ACTIVE USERS
  // =========================
  const activeUsers = users.filter((user) => user.is_online === true);

  // =========================
  // SEARCH FILTER
  // =========================
  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    return (user.username || "").toLowerCase().includes(search.toLowerCase());
  });

  // =========================
  // FETCH USERS
  // =========================
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Fetch Users Error:", err.message);
    }
  };

  // =========================
  // FETCH CONNECTIONS
  // =========================
  const fetchConnections = async () => {
  if (!currentUser?.id) return;

  const { data, error } = await supabase
    .from("connections")
    .select("*");

  if (error) {
    console.log("Fetch error:", error.message);
    return;
  }

  const all = data || [];

  setPendingRequests(
    all.filter(
      (c) =>
        c.status === "pending" &&
        c.receiver_id === currentUser.id
    )
  );

  setConnections(
    all.filter((c) => c.status === "accepted")
  );
};
  
  // REALTIME
  // =========================
  useEffect(() => {
    if (!currentUser) return;

    fetchUsers();
    fetchConnections();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`realtime_sync_${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchUsers()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "connections" },
        () => fetchConnections()
      );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [currentUser]);

  // =========================
  // SEND REQUEST
  // =========================
 const sendRequest = async (senderId, receiverId) => {
  console.log("CLICKED:", senderId, receiverId);

  if (!senderId || !receiverId) return;

  try {
    setLoading(true);

    const { data, error } = await supabase
      .from("connections")
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          status: "pending",
        },
      ])
      .select();

    if (error) {
      console.log("❌ ERROR:", error.message);
      return;
    }

    console.log("✅ SUCCESS:", data);

    await fetchConnections();
  } catch (err) {
    console.log("❌ CATCH:", err.message);
  } finally {
    setLoading(false);
  }
};
  // =========================
  // DISCONNECT
  // =========================
  const disconnect = async (senderId, receiverId) => {
    try {
      setLoading(true);
      await supabase
        .from("connections")
        .delete()
        .or(
          `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
        );
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ACCEPT REQUEST
  // =========================
  const acceptRequest = async (id) => {
    try {
      setLoading(true);
      await supabase.from("connections").update({ status: "accepted" }).eq("id", id);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DECLINE REQUEST
  // =========================
  const declineRequest = async (id) => {
    try {
      setLoading(true);
      await supabase.from("connections").delete().eq("id", id);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConnectContext.Provider
      value={{
        users,
        filteredUsers,
        activeUsers,
        connections,
        pendingRequests,
        search,
        setSearch,
        loading,
        currentUser,
        sendRequest,
        disconnect,
        acceptRequest,
        declineRequest,
        fetchUsers,
        fetchConnections,
      }}
    >
      {children}
    </ConnectContext.Provider>
  );
};