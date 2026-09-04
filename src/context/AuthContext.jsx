import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY = "scholiqen_auth_token";
const AUTH_USER_KEY = "scholiqen_current_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH CURRENT USER FROM NEON
  // =========================================================

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      setUser(null);
      setProfile(null);
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Session expired or invalid.");
      }

      const data = await response.json();

      if (!data?.user) {
        throw new Error("User information was not returned.");
      }

      const currentUser = data.user;

      setUser(currentUser);

      // Keep profile compatible with ProtectedAdminRoute
      setProfile(currentUser);

      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(currentUser)
      );

      return currentUser;
    } catch (error) {
      console.error("Auth session error:", error);

      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);

      setUser(null);
      setProfile(null);

      return null;
    }
  };

  // =========================================================
  // INITIAL AUTH CHECK
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setLoading(true);

      try {
        const currentUser = await fetchCurrentUser();

        if (!mounted) return;

        if (currentUser) {
          setUser(currentUser);
          setProfile(currentUser);
        }
      } catch (error) {
        console.error("Initial auth error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = async () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    setUser(null);
    setProfile(null);

    // Send user back to login if logout is called manually
    window.location.href = "/login";
  };

  // =========================================================
  // LOGIN HELPER
  // =========================================================

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Unable to login."
      );
    }

    if (!data?.token || !data?.user) {
      throw new Error(
        "Login response is missing authentication data."
      );
    }

    localStorage.setItem(
      AUTH_TOKEN_KEY,
      data.token
    );

    localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify(data.user)
    );

    setUser(data.user);
    setProfile(data.user);

    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};