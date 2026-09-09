// src/context/LMSContext/ProfileContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";

import { AuthContext } from "../AuthContext";

const ProfileContext = createContext(null);

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const AUTH_TOKEN_KEY = "scholiqen_auth_token";

const EMPTY_STATS = {
  courses: 0,
  completedCourses: 0,
  certificates: 0,
  lessonsCompleted: 0,
  submissions: 0,
};

/*
=========================================================
HELPERS
=========================================================
*/

const getSafeUserName = (user) => {
  if (!user) {
    return "Student";
  }

  return (
    user.username ||
    user.name ||
    user.full_name ||
    user.display_name ||
    user.user_metadata?.username ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Student"
  );
};

const getSafeAvatar = (user) => {
  if (!user) {
    return "";
  }

  return (
    user.avatar ||
    user.avatar_url ||
    user.photoURL ||
    user.photo_url ||
    user.image ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.avatar ||
    user.user_metadata?.photoURL ||
    ""
  );
};

const buildFallbackProfile = (user) => {
  if (!user) {
    return null;
  }

  const avatar = getSafeAvatar(user);

  return {
    ...user,

    id:
      user.id ||
      user.userId ||
      user.user_id ||
      "",

    email:
      user.email ||
      "",

    username:
      getSafeUserName(user),

    name:
      user.name ||
      user.full_name ||
      user.display_name ||
      getSafeUserName(user),

    avatar,

    avatar_url:
      avatar,

    role:
      String(user.role || "")
        .trim()
        .toLowerCase(),
  };
};

/*
=========================================================
PROFILE PROVIDER
=========================================================
*/

export const ProfileProvider = ({
  children,
}) => {
  const {
    user,
    getToken,
  } = useContext(AuthContext);

  const [profile, setProfile] =
    useState(null);

  const [stats, setStats] =
    useState(EMPTY_STATS);

  const [activity, setActivity] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /*
  =========================================================
  FETCH PROFILE DATA
  =========================================================

  IMPORTANT:

  This context no longer uses Supabase.

  Authentication is handled by:

      Express
        ↓
      Neon PostgreSQL
        ↓
      AuthContext

  ProfileContext uses the authenticated user already
  supplied by AuthContext.

  =========================================================
  */

  const fetchProfileData =
    useCallback(async () => {
      /*
      -------------------------------------------------------
      NO USER
      -------------------------------------------------------
      */

      if (!user?.id) {
        setProfile(null);
        setStats(EMPTY_STATS);
        setActivity([]);
        setLoading(false);

        return;
      }

      setLoading(true);

      try {
        /*
        =====================================================
        AUTHENTICATED USER
        =====================================================
        */

        const safeProfile =
          buildFallbackProfile(user);

        setProfile(safeProfile);

        /*
        =====================================================
        GET AUTH TOKEN
        =====================================================
        */

        let token = null;

        try {
          if (
            typeof getToken ===
            "function"
          ) {
            token = getToken();
          }
        } catch (error) {
          console.warn(
            "Could not read authentication token:",
            error
          );
        }

        /*
        =====================================================
        CACHE USER
        =====================================================
        */

        try {
          localStorage.setItem(
            "scholiqen_profile_cache",
            JSON.stringify(
              safeProfile
            )
          );
        } catch (error) {
          console.warn(
            "Could not cache profile:",
            error
          );
        }

        /*
        =====================================================
        OPTIONAL SERVER PROFILE REFRESH
        =====================================================

        We intentionally use /api/auth/me because this
        endpoint already exists in your backend.

        We DO NOT call Supabase.

        =====================================================
        */

        if (token) {
          try {
            const response =
              await fetch(
                `${API_URL}/api/auth/me`,
                {
                  method: "GET",

                  headers: {
                    Accept:
                      "application/json",

                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );

            const data =
              await response
                .json()
                .catch(
                  () => null
                );

            /*
            -------------------------------------------------
            SERVER USER AVAILABLE
            -------------------------------------------------
            */

            if (
              response.ok &&
              data?.success &&
              data?.user
            ) {
              const serverUser = {
                ...user,
                ...data.user,
              };

              const refreshedProfile =
                buildFallbackProfile(
                  serverUser
                );

              setProfile(
                refreshedProfile
              );

              try {
                localStorage.setItem(
                  "scholiqen_profile_cache",
                  JSON.stringify(
                    refreshedProfile
                  )
                );
              } catch (error) {
                console.warn(
                  "Could not cache refreshed profile:",
                  error
                );
              }
            }

            /*
            -------------------------------------------------
            IMPORTANT

            A failed /me request must NOT destroy the
            current authenticated session here.

            AuthContext owns authentication.
            -------------------------------------------------
            */

            if (!response.ok) {
              console.warn(
                "Profile /me request failed:",
                {
                  status:
                    response.status,
                  data,
                }
              );
            }
          } catch (error) {
            /*
            Backend temporarily unavailable.

            Keep the authenticated user from AuthContext.
            */

            console.warn(
              "Profile /me network error:",
              error
            );
          }
        }

        /*
        =====================================================
        STATS
        =====================================================

        We intentionally do not query Supabase anymore.

        Until the corresponding Neon/Express dashboard
        endpoints are connected, preserve safe empty stats.
        =====================================================
        */

        setStats(
          EMPTY_STATS
        );

        /*
        =====================================================
        ACTIVITY
        =====================================================

        No Supabase activity request.

        Keep this empty until the Neon activity endpoint
        is connected.
        =====================================================
        */

        setActivity([]);

        /*
        =====================================================
        SUCCESS
        =====================================================
        */

        console.log(
          "✅ Profile context loaded from Express/Neon authentication"
        );

        console.log(
          "Authenticated user:",
          user.email
        );

        console.log(
          "Supabase profile requests: DISABLED"
        );

        console.log(
          "API:",
          API_URL
        );
      } catch (error) {
        /*
        =====================================================
        FALLBACK
        =====================================================
        */

        console.error(
          "Profile Context Error:",
          error
        );

        /*
        Never destroy authentication because of a profile
        or database problem.
        */

        const fallbackProfile =
          buildFallbackProfile(
            user
          );

        setProfile(
          fallbackProfile
        );

        /*
        Keep safe values.
        */

        setStats(
          EMPTY_STATS
        );

        setActivity([]);
      } finally {
        setLoading(false);
      }
    }, [
      user,
      getToken,
    ]);

  /*
  =========================================================
  FETCH WHEN USER CHANGES
  =========================================================
  */

  useEffect(() => {
    fetchProfileData();
  }, [
    fetchProfileData,
  ]);

  /*
  =========================================================
  CONTEXT VALUE
  =========================================================
  */

  const value = {
    profile,

    stats,

    activity,

    loading,

    refreshProfile:
      fetchProfileData,
  };

  return (
    <ProfileContext.Provider
      value={value}
    >
      {children}
    </ProfileContext.Provider>
  );
};

/*
===========================================================
USE PROFILE
===========================================================
*/

export const useProfile = () => {
  const context =
    useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfile must be used inside ProfileProvider"
    );
  }

  return context;
};

export default ProfileContext;