import { createContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export const ConnectContext = createContext();

export const ConnectProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Computed state for active users
  const activeUsers = users.filter((user) => user.is_online === true);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    const { data, error } = await supabase.from("user").select("*");
    if (error) {
      console.error("Fetch Users Error:", error);
      return;
    }
    setUsers(data || []);
  };

  /* ================= FETCH CONNECTIONS ================= */
  const fetchConnections = async () => {
    const { data, error } = await supabase.from("connections").select("*");
    if (error) {
      console.error("Fetch Connections Error:", error);
      return;
    }
    const pending = data?.filter((item) => item.status === "pending") || [];
    const accepted = data?.filter((item) => item.status === "accepted") || [];
    setPendingRequests(pending);
    setConnections(accepted);
  };

  /* ================= REALTIME SUBSCRIPTION ================= */
  useEffect(() => {
    const channel = supabase
      .channel('realtime_user_status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user' },
        () => fetchUsers()
      )
      .subscribe();

    fetchUsers();
    fetchConnections();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= ACTIONS ================= */
  const sendRequest = async (senderId, receiverId) => {
    if (senderId === receiverId) return;
    setLoading(true);
    const { error } = await supabase
      .from("connections")
      .insert([{ sender_id: senderId, receiver_id: receiverId, status: "pending" }]);
    if (error) console.error("Send Error:", error);
    await fetchConnections();
    setLoading(false);
  };

  // NEW: Disconnect/Cancel function
  const disconnect = async (senderId, receiverId) => {
    setLoading(true);
    const { error } = await supabase
      .from("connections")
      .delete()
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`);
    
    if (error) console.error("Disconnect Error:", error);
    await fetchConnections();
    setLoading(false);
  };

  const acceptRequest = async (id) => {
    setLoading(true);
    await supabase.from("connections").update({ status: "accepted" }).eq("id", id);
    await fetchConnections();
    setLoading(false);
  };

  const declineRequest = async (id) => {
    setLoading(true);
    await supabase.from("connections").delete().eq("id", id);
    await fetchConnections();
    setLoading(false);
  };

  return (
    <ConnectContext.Provider
      value={{
        users,
        activeUsers,
        connections,
        pendingRequests,
        search,
        setSearch,
        loading,
        sendRequest,
        disconnect, // Added to provider
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