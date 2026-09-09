import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   API CONFIG
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

/* =========================================================
   STORAGE KEYS
========================================================= */

const AUTH_TOKEN_KEY = "scholiqen_auth_token";
const AUTH_USER_KEY = "scholiqen_current_user";

/*
  OLD authentication/storage keys.

  These belong to the previous authentication system.

  We DO NOT touch:
  - Google
  - Gmail
  - Chrome accounts
  - browser passwords
  - unrelated websites
  - Neon data
  - current Scholiqen JWT
*/

const LEGACY_STORAGE_KEYS = [
  "supabase.auth.token",
  "supabase-auth-token",
  "sb-auth-token",
  "sb-access-token",
  "sb-refresh-token",

  "supabase_session",
  "supabase_session_data",

  "auth_token",
  "authToken",
  "access_token",
  "accessToken",
  "refresh_token",
  "refreshToken",

  "scholiqen_token",
  "scholiqen_access_token",
  "scholiqen_refresh_token",
  "scholiqen_session",
  "scholiqen_auth",
];

/* =========================================================
   CONTEXT
========================================================= */

export const AuthContext = createContext(null);

/* =========================================================
   HELPERS
========================================================= */

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    role: normalizeRole(user.role),
  };
};

/* =========================================================
   LEGACY AUTH CLEANUP
========================================================= */

const cleanupLegacyAuthStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    /*
      IMPORTANT FIX

      The old code accidentally called:

        cleanupLegacyAuthStorage().forEach(...)

      That caused the cleanup function to call itself.

      We must iterate over LEGACY_STORAGE_KEYS instead.
    */

    LEGACY_STORAGE_KEYS.forEach((key) => {
      /*
        Never remove the new authentication keys.
      */

      if (
        key === AUTH_TOKEN_KEY ||
        key === AUTH_USER_KEY
      ) {
        return;
      }

      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(
          `Could not remove legacy localStorage key "${key}":`,
          error
        );
      }
    });

    /*
      Remove project-specific Supabase auth keys.

      We only remove keys that clearly look like
      old Supabase authentication storage.
    */

    const keysToRemove = [];

    for (
      let index = 0;
      index < localStorage.length;
      index += 1
    ) {
      const key = localStorage.key(index);

      if (!key) {
        continue;
      }

      const normalizedKey =
        key.toLowerCase();

      const looksLikeSupabaseAuth =
        normalizedKey.startsWith("sb-") &&
        normalizedKey.includes("auth-token");

      const looksLikeOldSupabase =
        normalizedKey.includes("supabase") &&
        (
          normalizedKey.includes("auth") ||
          normalizedKey.includes("token") ||
          normalizedKey.includes("session")
        );

      if (
        looksLikeSupabaseAuth ||
        looksLikeOldSupabase
      ) {
        /*
          NEVER remove the current Scholiqen JWT.
        */

        if (
          key !== AUTH_TOKEN_KEY &&
          key !== AUTH_USER_KEY
        ) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(
          `Could not remove old authentication key "${key}":`,
          error
        );
      }
    });

    /*
      IndexedDB cleanup.

      This is completely non-blocking.

      It must NEVER prevent authentication
      from working.
    */

    if (
      typeof window.indexedDB !== "undefined" &&
      typeof window.indexedDB.databases === "function"
    ) {
      window.indexedDB
        .databases()
        .then((databases) => {
          if (!Array.isArray(databases)) {
            return;
          }

          databases.forEach((database) => {
            const name = database?.name;

            if (!name) {
              return;
            }

            const normalizedName =
              String(name).toLowerCase();

            const isSupabaseDatabase =
              normalizedName.includes("supabase") ||
              normalizedName.includes("sb-");

            if (!isSupabaseDatabase) {
              return;
            }

            try {
              window.indexedDB.deleteDatabase(name);

              console.log(
                `🧹 Removed legacy authentication database: ${name}`
              );
            } catch (error) {
              console.warn(
                `Could not remove old IndexedDB database "${name}":`,
                error
              );
            }
          });
        })
        .catch((error) => {
          console.warn(
            "Legacy IndexedDB cleanup skipped:",
            error
          );
        });
    }

    console.log(
      "🧹 Legacy authentication storage cleanup completed."
    );
  } catch (error) {
    /*
      Cleanup should NEVER prevent
      the application from starting.
    */

    console.warn(
      "Legacy authentication cleanup failed:",
      error
    );
  }
};

/* =========================================================
   AUTH PROVIDER
========================================================= */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     GET TOKEN
  ======================================================= */

  const getToken = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(
      AUTH_TOKEN_KEY
    );
  }, []);

  /* =======================================================
     SAVE AUTH SESSION
  ======================================================= */

  const saveAuthSession = useCallback(
    (token, authUser) => {
      if (typeof window === "undefined") {
        return;
      }

      if (!token) {
        throw new Error(
          "Authentication token was not provided."
        );
      }

      const normalizedUser =
        normalizeUser(authUser);

      if (!normalizedUser) {
        throw new Error(
          "Authenticated user information was not provided."
        );
      }

      /*
        Save the NEW Neon/JWT session.
      */

      localStorage.setItem(
        AUTH_TOKEN_KEY,
        token
      );

      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(normalizedUser)
      );

      /*
        Update React state immediately.

        This is important because ProtectedRoute
        can then see the authenticated user without
        waiting for another API request.
      */

      setUser(normalizedUser);
      setProfile(normalizedUser);
      setLoading(false);
    },
    []
  );

  /* =======================================================
     CLEAR AUTH SESSION
  ======================================================= */

  const clearAuthSession = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(
        AUTH_TOKEN_KEY
      );

      localStorage.removeItem(
        AUTH_USER_KEY
      );
    }

    setUser(null);
    setProfile(null);
  }, []);

  /* =======================================================
     FETCH CURRENT USER
========================================================= */

  const fetchCurrentUser = useCallback(async () => {
    const token = getToken();

    /*
      No JWT = genuinely logged out.
    */

    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);

      return null;
    }

    /*
      First try the cached user.

      This prevents a page refresh from briefly
      looking unauthenticated while /me is loading.
    */

    const cachedUser =
      localStorage.getItem(
        AUTH_USER_KEY
      );

    if (cachedUser) {
      try {
        const parsedUser =
          normalizeUser(
            JSON.parse(cachedUser)
          );

        if (parsedUser) {
          setUser(parsedUser);
          setProfile(parsedUser);

          console.log(
            "✅ Cached authentication restored:",
            parsedUser.email
          );
        }
      } catch (error) {
        console.warn(
          "Could not parse cached authentication user:",
          error
        );
      }
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      console.log(
        "Auth /me response:",
        {
          status: response.status,
          data,
        }
      );

      /*
        AUTHENTICATED
      */

      if (
        response.ok &&
        data?.success &&
        data?.user
      ) {
        const currentUser =
          normalizeUser(data.user);

        localStorage.setItem(
          AUTH_USER_KEY,
          JSON.stringify(currentUser)
        );

        setUser(currentUser);
        setProfile(currentUser);

        console.log(
          "✅ Authentication confirmed:",
          currentUser.email
        );

        return currentUser;
      }

      /*
        ONLY 401/403 destroys the session.

        These statuses mean the server explicitly
        rejected the JWT.
      */

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        console.warn(
          "⚠️ Server rejected authentication session."
        );

        clearAuthSession();

        return null;
      }

      /*
        Any other response is treated as a
        temporary backend problem.

        DO NOT log the user out.
      */

      console.warn(
        `⚠️ Authentication check returned ${response.status}. Keeping existing session.`
      );

      /*
        If cached user exists, keep it.
      */

      if (cachedUser) {
        try {
          const parsedUser =
            normalizeUser(
              JSON.parse(cachedUser)
            );

          if (parsedUser) {
            setUser(parsedUser);
            setProfile(parsedUser);

            return parsedUser;
          }
        } catch {
          // Ignore invalid cache.
        }
      }

      return null;
    } catch (error) {
      /*
        Network failure.

        NEVER automatically log the user out
        just because the backend cannot be reached.
      */

      console.error(
        "Auth /me network error:",
        error
      );

      /*
        Keep cached authentication if available.
      */

      if (cachedUser) {
        try {
          const parsedUser =
            normalizeUser(
              JSON.parse(cachedUser)
            );

          if (parsedUser) {
            setUser(parsedUser);
            setProfile(parsedUser);

            console.log(
              "✅ Existing session preserved after network error."
            );

            return parsedUser;
          }
        } catch {
          // Ignore invalid cache.
        }
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [
    clearAuthSession,
    getToken,
  ]);

  /* =======================================================
     LOGIN
  ======================================================= */

  const login = useCallback(
    async (email, password) => {
      const cleanEmail = String(
        email || ""
      )
        .trim()
        .toLowerCase();

      if (!cleanEmail) {
        throw new Error(
          "Email is required."
        );
      }

      if (!password) {
        throw new Error(
          "Password is required."
        );
      }

      /*
        Clean ONLY old authentication storage.

        The current Scholiqen JWT is protected.
      */

      cleanupLegacyAuthStorage();

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      console.log(
        "Login response:",
        {
          status: response.status,
          data,
        }
      );

      /*
        Login failed.
      */

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to log in."
        );
      }

      /*
        Backend must return JWT.
      */

      if (!data?.token) {
        throw new Error(
          "Login succeeded but no authentication token was returned."
        );
      }

      /*
        Backend must return user.
      */

      if (!data?.user) {
        throw new Error(
          "Login succeeded but no user information was returned."
        );
      }

      const loggedInUser =
        normalizeUser(data.user);

      /*
        Save JWT + user immediately.
      */

      saveAuthSession(
        data.token,
        loggedInUser
      );

      /*
        Mark authentication as ready.
      */

      setLoading(false);

      console.log(
        `✅ Neon login successful: ${loggedInUser.email} (${loggedInUser.role})`
      );

      return {
        ...data,
        user: loggedInUser,
      };
    },
    [saveAuthSession]
  );

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = useCallback(async () => {
    /*
      Stateless JWT authentication.

      Removing the JWT ends the session.
    */

    clearAuthSession();

    /*
      Remove old authentication storage.
    */

    cleanupLegacyAuthStorage();

    console.log(
      "👋 User logged out successfully."
    );
  }, [clearAuthSession]);

  /* =======================================================
     INITIAL AUTH CHECK
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      /*
        Remove OLD authentication data only.

        The current Scholiqen JWT remains untouched.
      */

      cleanupLegacyAuthStorage();

      if (cancelled) {
        return;
      }

      /*
        Restore current authentication.
      */

      await fetchCurrentUser();
    };

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [fetchCurrentUser]);

  /* =======================================================
     AUTH STATE
  ======================================================= */

  const isAuthenticated =
    Boolean(user);

  /* =======================================================
     ADMIN CHECK
  ======================================================= */

  const isAdmin = useMemo(() => {
    if (!user) {
      return false;
    }

    const role =
      normalizeRole(user.role);

    return [
      "admin",
      "super_admin",
      "superadmin",
      "content_admin",
      "analytics_admin",
      "moderator",
    ].includes(role);
  }, [user]);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,

      login,
      logout,

      getToken,
      fetchCurrentUser,
      saveAuthSession,

      isAuthenticated,
      isAdmin,
    }),
    [
      user,
      profile,
      loading,

      login,
      logout,

      getToken,
      fetchCurrentUser,
      saveAuthSession,

      isAuthenticated,
      isAdmin,
    ]
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* =========================================================
   HOOK
========================================================= */

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
};

export default AuthContext;