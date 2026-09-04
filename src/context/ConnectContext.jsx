import {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export const ConnectContext = createContext();

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

// ============================================================
// AUTH STORAGE
// ============================================================

const AUTH_TOKEN_KEY =
  "scholiqen_auth_token";

const AUTH_USER_KEY =
  "scholiqen_current_user";

// ============================================================
// CONNECT PROVIDER
// ============================================================

export const ConnectProvider = ({
  children,
}) => {
  // ==========================================================
  // STATES
  // ==========================================================

  const [users, setUsers] = useState([]);

  const [connections, setConnections] =
    useState([]);

  const [
    pendingRequests,
    setPendingRequests,
  ] = useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [isAdmin, setIsAdmin] =
    useState(false);

  // ==========================================================
  // GET TOKEN
  // ==========================================================

  const getStoredToken =
    useCallback(() => {
      try {
        return localStorage.getItem(
          AUTH_TOKEN_KEY
        );
      } catch (error) {
        console.error(
          "Get Stored Auth Token Error:",
          error
        );

        return null;
      }
    }, []);

  // ==========================================================
  // GET STORED USER
  // ==========================================================

  const getStoredUser =
    useCallback(() => {
      try {
        const storedUser =
          localStorage.getItem(
            AUTH_USER_KEY
          );

        if (!storedUser) {
          return null;
        }

        return JSON.parse(
          storedUser
        );
      } catch (error) {
        console.error(
          "Get Stored User Error:",
          error
        );

        return null;
      }
    }, []);

  // ==========================================================
  // API REQUEST HELPER
  // ==========================================================

  const apiRequest =
    useCallback(
      async (
        endpoint,
        options = {}
      ) => {
        const token =
          getStoredToken();

        const headers = {
          "Content-Type":
            "application/json",

          ...(options.headers || {}),
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response =
          await fetch(
            `${API_URL}${endpoint}`,
            {
              ...options,
              headers,
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          const error =
            new Error(
              data?.error ||
                data?.message ||
                `Request failed with status ${response.status}`
            );

          error.status =
            response.status;

          error.data = data;

          throw error;
        }

        return data;
      },
      [getStoredToken]
    );

  // ==========================================================
  // CLEAR AUTH SESSION
  // ==========================================================

  const clearAuthSession =
    useCallback(() => {
      try {
        localStorage.removeItem(
          AUTH_TOKEN_KEY
        );

        localStorage.removeItem(
          AUTH_USER_KEY
        );
      } catch (error) {
        console.error(
          "Clear Auth Session Error:",
          error
        );
      }

      setCurrentUser(null);

      setIsAdmin(false);

      setConnections([]);

      setPendingRequests([]);
    }, []);

  // ==========================================================
  // ADMIN STATUS
  // ==========================================================

  const updateAdminStatus =
    useCallback((user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const role =
        typeof user.role ===
        "string"
          ? user.role.toLowerCase()
          : "";

      setIsAdmin(
        role === "admin"
      );
    }, []);

  // ==========================================================
  // CURRENT USER
  // ==========================================================

  const getCurrentUser =
    useCallback(async () => {
      try {
        const token =
          getStoredToken();

        if (!token) {
          setCurrentUser(null);
          setIsAdmin(false);

          return null;
        }

        // ----------------------------------------------------
        // USE CACHED USER IMMEDIATELY
        // ----------------------------------------------------

        const cachedUser =
          getStoredUser();

        if (cachedUser) {
          setCurrentUser(
            cachedUser
          );

          updateAdminStatus(
            cachedUser
          );
        }

        // ----------------------------------------------------
        // VERIFY WITH EXPRESS / NEON
        // ----------------------------------------------------

        const data =
          await apiRequest(
            "/api/auth/me"
          );

        const user =
          data?.user || null;

        if (!user) {
          clearAuthSession();

          return null;
        }

        // ----------------------------------------------------
        // SAVE VERIFIED USER
        // ----------------------------------------------------

        setCurrentUser(user);

        updateAdminStatus(user);

        try {
          localStorage.setItem(
            AUTH_USER_KEY,
            JSON.stringify(user)
          );
        } catch (storageError) {
          console.warn(
            "Unable to cache current user:",
            storageError
          );
        }

        return user;
      } catch (error) {
        console.error(
          "Current User Error:",
          error
        );

        // ----------------------------------------------------
        // DON'T DESTROY CACHE IF SERVER IS TEMPORARILY DOWN
        // ----------------------------------------------------

        if (
          error?.status === 401 ||
          error?.status === 403
        ) {
          clearAuthSession();

          return null;
        }

        const cachedUser =
          getStoredUser();

        if (cachedUser) {
          setCurrentUser(
            cachedUser
          );

          updateAdminStatus(
            cachedUser
          );

          return cachedUser;
        }

        setCurrentUser(null);

        setIsAdmin(false);

        return null;
      }
    }, [
      getStoredToken,
      getStoredUser,
      apiRequest,
      updateAdminStatus,
      clearAuthSession,
    ]);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout =
    useCallback(() => {
      clearAuthSession();

      window.location.href =
        "/login";
    }, [
      clearAuthSession,
    ]);

  // ==========================================================
  // INITIAL AUTH
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const initializeAuth =
      async () => {
        if (!mounted) return;

        await getCurrentUser();
      };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [getCurrentUser]);

  // ==========================================================
  // ACTIVE USERS
  // ==========================================================

  const activeUsers =
    users.filter(
      (user) =>
        user.is_online === true
    );

  // ==========================================================
  // SEARCH FILTER
  // ==========================================================

  const filteredUsers =
    users.filter((user) => {
      const searchValue =
        search.trim().toLowerCase();

      if (!searchValue) {
        return true;
      }

      return (
        user.username ||
        ""
      )
        .toLowerCase()
        .includes(searchValue);
    });

  // ==========================================================
  // FETCH USERS
  // ==========================================================

  const fetchUsers =
    useCallback(async () => {
      try {
        const data =
          await apiRequest(
            "/api/connections/users"
          );

        const fetchedUsers =
          Array.isArray(
            data?.users
          )
            ? data.users
            : Array.isArray(
                data?.data
              )
              ? data.data
              : [];

        setUsers(
          fetchedUsers
        );

        return fetchedUsers;
      } catch (error) {
        console.error(
          "Fetch Users Error:",
          error?.message ||
            error
        );

        setUsers([]);

        return [];
      }
    }, [apiRequest]);

  // ==========================================================
  // FETCH CONNECTIONS
  // ==========================================================

  const fetchConnections =
    useCallback(async () => {
      if (!currentUser?.id) {
        setConnections([]);

        setPendingRequests([]);

        return [];
      }

      try {
        const data =
          await apiRequest(
            "/api/connections"
          );

        const allConnections =
          Array.isArray(
            data?.connections
          )
            ? data.connections
            : Array.isArray(
                data?.data
              )
              ? data.data
              : [];

        // ----------------------------------------------------
        // PENDING REQUESTS
        // ----------------------------------------------------

        const pending =
          allConnections.filter(
            (connection) =>
              connection.status ===
                "pending" &&
              connection.receiver_id ===
                currentUser.id
          );

        setPendingRequests(
          pending
        );

        // ----------------------------------------------------
        // ACCEPTED CONNECTIONS
        // ----------------------------------------------------

        const accepted =
          allConnections.filter(
            (connection) =>
              connection.status ===
              "accepted"
          );

        setConnections(
          accepted
        );

        return allConnections;
      } catch (error) {
        console.error(
          "Fetch Connections Error:",
          error?.message ||
            error
        );

        setConnections([]);

        setPendingRequests([]);

        return [];
      }
    }, [
      currentUser?.id,
      apiRequest,
    ]);

  // ==========================================================
  // INITIAL USER / CONNECTION LOAD
  // ==========================================================

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    fetchUsers();

    fetchConnections();
  }, [
    currentUser?.id,
    fetchUsers,
    fetchConnections,
  ]);

  // ==========================================================
  // SEND REQUEST
  // ==========================================================

  const sendRequest =
    useCallback(
      async (
        senderId,
        receiverId
      ) => {
        if (
          !senderId ||
          !receiverId
        ) {
          return;
        }

        if (
          senderId ===
          receiverId
        ) {
          console.warn(
            "You cannot connect with yourself."
          );

          return;
        }

        try {
          setLoading(true);

          await apiRequest(
            "/api/connections",
            {
              method: "POST",

              body: JSON.stringify({
                sender_id:
                  senderId,

                receiver_id:
                  receiverId,

                status:
                  "pending",
              }),
            }
          );

          await fetchConnections();
        } catch (error) {
          console.error(
            "Send Request Error:",
            error?.message ||
              error
          );
        } finally {
          setLoading(false);
        }
      },
      [
        apiRequest,
        fetchConnections,
      ]
    );

  // ==========================================================
  // ACCEPT REQUEST
  // ==========================================================

  const acceptRequest =
    useCallback(
      async (id) => {
        if (!id) return;

        try {
          setLoading(true);

          await apiRequest(
            `/api/connections/${encodeURIComponent(
              id
            )}`,
            {
              method: "PATCH",

              body: JSON.stringify({
                status:
                  "accepted",
              }),
            }
          );

          await fetchConnections();
        } catch (error) {
          console.error(
            "Accept Request Error:",
            error?.message ||
              error
          );
        } finally {
          setLoading(false);
        }
      },
      [
        apiRequest,
        fetchConnections,
      ]
    );

  // ==========================================================
  // DECLINE REQUEST
  // ==========================================================

  const declineRequest =
    useCallback(
      async (id) => {
        if (!id) return;

        try {
          setLoading(true);

          await apiRequest(
            `/api/connections/${encodeURIComponent(
              id
            )}`,
            {
              method: "DELETE",
            }
          );

          await fetchConnections();
        } catch (error) {
          console.error(
            "Decline Request Error:",
            error?.message ||
              error
          );
        } finally {
          setLoading(false);
        }
      },
      [
        apiRequest,
        fetchConnections,
      ]
    );

  // ==========================================================
  // DISCONNECT
  // ==========================================================

  const disconnect =
    useCallback(
      async (
        senderId,
        receiverId
      ) => {
        if (
          !senderId ||
          !receiverId
        ) {
          return;
        }

        try {
          setLoading(true);

          await apiRequest(
            "/api/connections/disconnect",
            {
              method: "POST",

              body: JSON.stringify({
                sender_id:
                  senderId,

                receiver_id:
                  receiverId,
              }),
            }
          );

          await fetchConnections();
        } catch (error) {
          console.error(
            "Disconnect Error:",
            error?.message ||
              error
          );
        } finally {
          setLoading(false);
        }
      },
      [
        apiRequest,
        fetchConnections,
      ]
    );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <ConnectContext.Provider
      value={{
        // ----------------------------------------------------
        // USERS
        // ----------------------------------------------------

        users,

        filteredUsers,

        activeUsers,

        // ----------------------------------------------------
        // CONNECTIONS
        // ----------------------------------------------------

        connections,

        pendingRequests,

        // ----------------------------------------------------
        // SEARCH
        // ----------------------------------------------------

        search,

        setSearch,

        // ----------------------------------------------------
        // LOADING
        // ----------------------------------------------------

        loading,

        // ----------------------------------------------------
        // AUTH
        // ----------------------------------------------------

        currentUser,

        isAdmin,

        // ----------------------------------------------------
        // LOGOUT
        // ----------------------------------------------------

        logout,

        // ----------------------------------------------------
        // ACTIONS
        // ----------------------------------------------------

        sendRequest,

        disconnect,

        acceptRequest,

        declineRequest,

        // ----------------------------------------------------
        // REFRESH
        // ----------------------------------------------------

        fetchUsers,

        fetchConnections,

        // ----------------------------------------------------
        // AUTH REFRESH
        // ----------------------------------------------------

        getCurrentUser,
      }}
    >
      {children}
    </ConnectContext.Provider>
  );
};