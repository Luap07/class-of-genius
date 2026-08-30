import {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { supabase } from "../lib/supabaseClient";

export const ConnectContext = createContext();

export const ConnectProvider = ({ children }) => {
  // =========================================================
  // STATES
  // =========================================================

  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  /*
    IMPORTANT:

    isAdmin is ONLY used internally by the application.

    We do NOT display "Admin" anywhere in the UI.

    When true:
      - Payment requirements are bypassed
      - Locks can be hidden
      - Paid CBT access can be bypassed
      - Paid LMS access can be bypassed
      - Paid novel/genre access can be bypassed

    When false:
      - Normal payment/access rules apply
  */
  const [isAdmin, setIsAdmin] = useState(false);

  // =========================================================
  // GET CURRENT AUTH USER
  // =========================================================

  const getCurrentUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error(
          "Get Auth User Error:",
          error.message
        );

        setCurrentUser(null);
        setIsAdmin(false);

        return;
      }

      setCurrentUser(user || null);

      if (!user?.id) {
        setIsAdmin(false);
        return;
      }

      /*
        =======================================================
        CHECK ADMIN ROLE
        =======================================================

        We first check Supabase Auth metadata.

        Supported values:

        user_metadata.role === "admin"
        app_metadata.role === "admin"

        Then we check the profiles table.

        The profiles table should have:

        role = "admin"

        Normal users should normally have:

        role = "user"
      */

      const authRole =
        user?.app_metadata?.role ||
        user?.user_metadata?.role ||
        "";

      if (
        typeof authRole === "string" &&
        authRole.toLowerCase() === "admin"
      ) {
        setIsAdmin(true);
        return;
      }

      /*
        =======================================================
        CHECK PROFILES TABLE
        =======================================================
      */

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        /*
          If the role column/table causes an error,
          do NOT accidentally give the user admin access.

          Security default = false.
        */
        console.error(
          "Admin Role Check Error:",
          profileError.message
        );

        setIsAdmin(false);
        return;
      }

      const profileRole =
        profile?.role || "";

      setIsAdmin(
        typeof profileRole === "string" &&
          profileRole.toLowerCase() === "admin"
      );
    } catch (error) {
      console.error(
        "Current User Error:",
        error
      );

      setCurrentUser(null);
      setIsAdmin(false);
    }
  }, []);

  // =========================================================
  // AUTH STATE LISTENER
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!mounted) return;

      await getCurrentUser();
    };

    initializeAuth();

    /*
      Listen for:

      - Login
      - Logout
      - Google login
      - Session refresh
      - Auth changes
    */

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        const user = session?.user || null;

        setCurrentUser(user);

        if (!user) {
          setIsAdmin(false);
          return;
        }

        /*
          Auth metadata can be checked immediately.
        */

        const authRole =
          user?.app_metadata?.role ||
          user?.user_metadata?.role ||
          "";

        if (
          typeof authRole === "string" &&
          authRole.toLowerCase() === "admin"
        ) {
          setIsAdmin(true);
          return;
        }

        /*
          Small timeout prevents Supabase auth state
          callbacks from interfering with database
          queries during session initialization.
        */

        setTimeout(async () => {
          if (!mounted) return;

          try {
            const {
              data: profile,
              error,
            } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .maybeSingle();

            if (error) {
              console.error(
                "Auth Profile Role Error:",
                error.message
              );

              setIsAdmin(false);
              return;
            }

            setIsAdmin(
              profile?.role?.toLowerCase() ===
                "admin"
            );
          } catch (error) {
            console.error(
              "Auth Admin Check Error:",
              error
            );

            setIsAdmin(false);
          }
        }, 0);
      }
    );

    return () => {
      mounted = false;

      authListener?.subscription?.unsubscribe();
    };
  }, [getCurrentUser]);

  // =========================================================
  // ACTIVE USERS
  // =========================================================

  const activeUsers = users.filter(
    (user) => user.is_online === true
  );

  // =========================================================
  // SEARCH FILTER
  // =========================================================

  const filteredUsers = users.filter((user) => {
    if (!search) return true;

    return (user.username || "")
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = useCallback(async () => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (err) {
      console.error(
        "Fetch Users Error:",
        err.message
      );
    }
  }, []);

  // =========================================================
  // FETCH CONNECTIONS
  // =========================================================

  const fetchConnections = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      const {
        data,
        error,
      } = await supabase
        .from("connections")
        .select("*");

      if (error) {
        throw error;
      }

      const all = data || [];

      // -------------------------------------------------------
      // PENDING REQUESTS
      // -------------------------------------------------------

      setPendingRequests(
        all.filter(
          (connection) =>
            connection.status === "pending" &&
            connection.receiver_id ===
              currentUser.id
        )
      );

      // -------------------------------------------------------
      // ACCEPTED CONNECTIONS
      // -------------------------------------------------------

      setConnections(
        all.filter(
          (connection) =>
            connection.status === "accepted"
        )
      );
    } catch (err) {
      console.error(
        "Fetch Connections Error:",
        err.message
      );
    }
  }, [currentUser?.id]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!currentUser?.id) return;

    fetchUsers();
    fetchConnections();
  }, [
    currentUser?.id,
    fetchUsers,
    fetchConnections,
  ]);

  // =========================================================
  // SEND REQUEST
  // =========================================================

  const sendRequest = async (
    senderId,
    receiverId
  ) => {
    if (!senderId || !receiverId) {
      return;
    }

    try {
      setLoading(true);

      const {
        error,
      } = await supabase
        .from("connections")
        .insert([
          {
            sender_id: senderId,
            receiver_id: receiverId,
            status: "pending",
          },
        ]);

      if (error) {
        throw error;
      }

      await fetchConnections();
    } catch (err) {
      console.error(
        "Send Request Error:",
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ACCEPT REQUEST
  // =========================================================

  const acceptRequest = async (id) => {
    if (!id) return;

    try {
      setLoading(true);

      const {
        error,
      } = await supabase
        .from("connections")
        .update({
          status: "accepted",
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      await fetchConnections();
    } catch (err) {
      console.error(
        "Accept Request Error:",
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DECLINE REQUEST
  // =========================================================

  const declineRequest = async (id) => {
    if (!id) return;

    try {
      setLoading(true);

      const {
        error,
      } = await supabase
        .from("connections")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      await fetchConnections();
    } catch (err) {
      console.error(
        "Decline Request Error:",
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DISCONNECT
  // =========================================================

  const disconnect = async (
    senderId,
    receiverId
  ) => {
    if (!senderId || !receiverId) {
      return;
    }

    try {
      setLoading(true);

      const {
        error,
      } = await supabase
        .from("connections")
        .delete()
        .or(
          `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
        );

      if (error) {
        throw error;
      }

      await fetchConnections();
    } catch (err) {
      console.error(
        "Disconnect Error:",
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    <ConnectContext.Provider
      value={{
        // -----------------------------------------------------
        // USERS
        // -----------------------------------------------------

        users,
        filteredUsers,
        activeUsers,

        // -----------------------------------------------------
        // CONNECTIONS
        // -----------------------------------------------------

        connections,
        pendingRequests,

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        search,
        setSearch,

        // -----------------------------------------------------
        // GENERAL LOADING
        // -----------------------------------------------------

        loading,

        // -----------------------------------------------------
        // AUTH
        // -----------------------------------------------------

        currentUser,

        /*
          THIS IS THE IMPORTANT ONE.

          Components can now do:

          const { isAdmin } =
            useContext(ConnectContext);

          Then:

          if (isAdmin) {
            // bypass payment
          }
        */

        isAdmin,

        // -----------------------------------------------------
        // CONNECTION ACTIONS
        // -----------------------------------------------------

        sendRequest,
        disconnect,
        acceptRequest,
        declineRequest,

        // -----------------------------------------------------
        // REFRESH
        // -----------------------------------------------------

        fetchUsers,
        fetchConnections,

        // -----------------------------------------------------
        // AUTH REFRESH
        // -----------------------------------------------------

        getCurrentUser,
      }}
    >
      {children}
    </ConnectContext.Provider>
  );
};
