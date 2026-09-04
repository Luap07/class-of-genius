import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY = "scholiqen_auth_token";
const AUTH_USER_KEY = "scholiqen_current_user";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Get saved token
   */
  const getToken = useCallback(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }, []);

  /**
   * Save authentication session
   */
  const saveAuthSession = useCallback((token, currentUser) => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }

    if (currentUser) {
      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(currentUser)
      );
    }

    setUser(currentUser || null);
    setProfile(currentUser || null);
  }, []);

  /**
   * Clear authentication session
   */
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    setUser(null);
    setProfile(null);
  }, []);

  /**
   * Restore user from /api/auth/me
   */
  const fetchCurrentUser = useCallback(async () => {
    const token = getToken();

    // No token means no authenticated session
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
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

      const data = await response.json().catch(() => null);

      console.log("Auth /me response:", {
        status: response.status,
        data,
      });

      if (!response.ok || !data?.success || !data?.user) {
        console.error(
          "Authentication session could not be restored.",
          data
        );

        /*
         * Only clear the token when the server explicitly
         * rejects the authentication token.
         */
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);

          setUser(null);
          setProfile(null);
        } else {
          /*
           * Backend/network problem:
           * preserve cached user instead of instantly
           * logging the user out.
           */
          const cachedUser =
            localStorage.getItem(AUTH_USER_KEY);

          if (cachedUser) {
            try {
              const parsedUser = JSON.parse(cachedUser);

              setUser(parsedUser);
              setProfile(parsedUser);
            } catch (error) {
              console.error(
                "Could not parse cached user:",
                error
              );
            }
          }
        }

        return;
      }

      const currentUser = data.user;

      // Normalize role
      currentUser.role = String(
        currentUser.role || ""
      )
        .trim()
        .toLowerCase();

      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(currentUser)
      );

      setUser(currentUser);
      setProfile(currentUser);
    } catch (error) {
      console.error(
        "Auth /me network error:",
        error
      );

      /*
       * Do NOT immediately delete the token when
       * the backend is temporarily unreachable.
       */
      const cachedUser =
        localStorage.getItem(AUTH_USER_KEY);

      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);

          setUser(parsedUser);
          setProfile(parsedUser);
        } catch (parseError) {
          console.error(
            "Could not restore cached user:",
            parseError
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * Login
   */
  const login = useCallback(
    async (email, password) => {
      const cleanEmail = String(email || "")
        .trim()
        .toLowerCase();

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to log in."
        );
      }

      const loggedInUser = {
        ...data.user,
        role: String(data.user?.role || "")
          .trim()
          .toLowerCase(),
      };

      saveAuthSession(
        data.token,
        loggedInUser
      );

      return {
        ...data,
        user: loggedInUser,
      };
    },
    [saveAuthSession]
  );

  /**
   * Restore authentication on application startup
   */
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const value = {
    user,
    profile,
    loading,
    login,
    logout,
    getToken,
    fetchCurrentUser,
    saveAuthSession,
    isAuthenticated: Boolean(user),
    isAdmin:
      String(
        profile?.role ||
          user?.role ||
          ""
      )
        .trim()
        .toLowerCase() === "admin",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;