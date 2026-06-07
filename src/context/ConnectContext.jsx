import { createContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export const ConnectContext = createContext();

export const ConnectProvider = ({ children }) => {
  /* ================= STATE ================= */

  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH USERS ================= */

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("user") // your current table name
      .select("*");

    if (error) {
      console.error("Fetch Users Error:", error);
      return;
    }

    setUsers(data || []);
  };

  /* ================= FETCH CONNECTIONS ================= */

  const fetchConnections = async () => {
    const { data, error } = await supabase
      .from("connections")
      .select("*");

    if (error) {
      console.error("Fetch Connections Error:", error);
      return;
    }

    const pending =
      data?.filter((item) => item.status === "pending") || [];

    const accepted =
      data?.filter((item) => item.status === "accepted") || [];

    setPendingRequests(pending);
    setConnections(accepted);
  };

  /* ================= SEND REQUEST ================= */

  const sendRequest = async (senderId, receiverId) => {
    if (senderId === receiverId) return;

    setLoading(true);

    const { data: existing, error: existingError } = await supabase
      .from("connections")
      .select("*")
      .eq("sender_id", senderId)
      .eq("receiver_id", receiverId)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
    }

    if (existing) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("connections")
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          status: "pending",
        },
      ]);

    if (error) {
      console.error("Send Request Error:", error);
    }

    await fetchConnections();
    setLoading(false);
  };

  /* ================= ACCEPT REQUEST ================= */

  const acceptRequest = async (id) => {
    setLoading(true);

    const { error } = await supabase
      .from("connections")
      .update({
        status: "accepted",
      })
      .eq("id", id);

    if (error) {
      console.error("Accept Error:", error);
    }

    await fetchConnections();
    setLoading(false);
  };

  /* ================= DECLINE REQUEST ================= */

  const declineRequest = async (id) => {
    setLoading(true);

    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Decline Error:", error);
    }

    await fetchConnections();
    setLoading(false);
  };

  /* ================= REMOVE CONNECTION ================= */

  const removeConnection = async (id) => {
    setLoading(true);

    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Remove Connection Error:", error);
    }

    await fetchConnections();
    setLoading(false);
  };

  /* ================= INIT ================= */

  useEffect(() => {
    fetchUsers();
    fetchConnections();
  }, []);

  /* ================= CONTEXT ================= */

  return (
    <ConnectContext.Provider
      value={{
        users,
        connections,
        pendingRequests,
       search,
        setSearch,
        loading,
        sendRequest,
        acceptRequest,
        declineRequest,
        removeConnection,
        fetchUsers,
        fetchConnections,
      }}
    >
      {children}
    </ConnectContext.Provider>
  );
};

export default ConnectProvider;