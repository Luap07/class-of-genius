// src/context/LMSContext/ProfileContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";

import { supabase } from "../../lib/supabaseClient";
import { AuthContext } from "../AuthContext";

const ProfileContext = createContext(null);

const EMPTY_STATS = {
  courses: 0,
  completedCourses: 0,
  certificates: 0,
  lessonsCompleted: 0,
  submissions: 0,
};

export const ProfileProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);

  const [stats, setStats] = useState(EMPTY_STATS);

  const [activity, setActivity] = useState([]);

  const [loading, setLoading] = useState(true);

  /*
  =========================================================
  FETCH PROFILE DATA
  =========================================================
  */

  const fetchProfileData = useCallback(async () => {
    /*
    ---------------------------------------------------------
    NO USER
    ---------------------------------------------------------
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
      =======================================================
      PROFILE
      =======================================================
      */

      let profileData = null;

      const {
        data,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        /*
        IMPORTANT:

        Do NOT throw here.

        A database outage should NOT destroy the user's
        authentication session or cause the dashboard to
        redirect back to /login.
        */

        console.error(
          "Profile Fetch Error:",
          profileError
        );
      } else {
        profileData = data;
      }

      /*
      =======================================================
      FALLBACK PROFILE
      =======================================================

      Even if the profiles table cannot be reached, we create
      a temporary profile from the authenticated user.

      This means:

      LOGIN
        ↓
      AuthContext has user
        ↓
      ProfileContext cannot reach database
        ↓
      User remains authenticated
        ↓
      Dashboard can continue
      */

      const fallbackUsername =
        user?.user_metadata?.username ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "Student";

      const safeProfile = {
        ...(profileData || {}),

        id: user.id,

        email:
          profileData?.email ||
          user.email ||
          "",

        username:
          profileData?.username ||
          fallbackUsername,

        avatar:
          profileData?.avatar ||
          profileData?.avatar_url ||
          user?.user_metadata?.avatar_url ||
          "",

        avatar_url:
          profileData?.avatar_url ||
          profileData?.avatar ||
          user?.user_metadata?.avatar_url ||
          "",
      };

      setProfile(safeProfile);

      /*
      =======================================================
      COURSE ENROLLMENTS
      =======================================================
      */

      let enrollments = [];

      try {
        const {
          data,
          error,
        } = await supabase
          .from("course_enrollments")
          .select("*")
          .eq("student_id", user.id);

        if (error) {
          console.error(
            "Course Enrollments Error:",
            error
          );
        } else {
          enrollments = data || [];
        }
      } catch (error) {
        console.error(
          "Course Enrollments Exception:",
          error
        );
      }

      /*
      =======================================================
      CERTIFICATES
      =======================================================
      */

      let certificates = [];

      try {
        const {
          data,
          error,
        } = await supabase
          .from("certificates")
          .select("*")
          .eq("student_id", user.id);

        if (error) {
          console.error(
            "Certificates Error:",
            error
          );
        } else {
          certificates = data || [];
        }
      } catch (error) {
        console.error(
          "Certificates Exception:",
          error
        );
      }

      /*
      =======================================================
      LESSON PROGRESS
      =======================================================
      */

      let lessons = [];

      try {
        const {
          data,
          error,
        } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("student_id", user.id)
          .eq("completed", true);

        if (error) {
          console.error(
            "Lesson Progress Error:",
            error
          );
        } else {
          lessons = data || [];
        }
      } catch (error) {
        console.error(
          "Lesson Progress Exception:",
          error
        );
      }

      /*
      =======================================================
      WEEKLY TASK SUBMISSIONS
      =======================================================
      */

      let submissions = [];

      try {
        const {
          data,
          error,
        } = await supabase
          .from("weekly_task_submissions")
          .select("*")
          .eq("student_id", user.id);

        if (error) {
          console.error(
            "Task Submissions Error:",
            error
          );
        } else {
          submissions = data || [];
        }
      } catch (error) {
        console.error(
          "Task Submissions Exception:",
          error
        );
      }

      /*
      =======================================================
      STATS
      =======================================================
      */

      setStats({
        courses: enrollments.length,

        completedCourses:
          enrollments.filter(
            (item) =>
              item?.completed === true
          ).length,

        certificates:
          certificates.length,

        lessonsCompleted:
          lessons.length,

        submissions:
          submissions.length,
      });

      /*
      =======================================================
      RECENT ACTIVITY
      =======================================================
      */

      const activities = [];

      /*
      COMPLETED LESSONS
      */

      lessons
        .slice(0, 10)
        .forEach((item) => {
          activities.push({
            id:
              item.id ||
              `lesson-${Math.random()}`,

            title:
              "Completed Lesson",

            description:
              "Lesson completed",

            date:
              item.completed_at ||
              item.updated_at ||
              item.created_at ||
              new Date().toISOString(),
          });
        });

      /*
      WEEKLY TASKS
      */

      submissions
        .slice(0, 10)
        .forEach((item) => {
          activities.push({
            id:
              item.id ||
              `submission-${Math.random()}`,

            title:
              "Submitted Weekly Task",

            description:
              item.feedback ||
              "Task submission received",

            date:
              item.submitted_at ||
              item.updated_at ||
              item.created_at ||
              new Date().toISOString(),
          });
        });

      /*
      SORT ACTIVITY
      */

      activities.sort((a, b) => {
        const dateA =
          new Date(a.date).getTime() || 0;

        const dateB =
          new Date(b.date).getTime() || 0;

        return dateB - dateA;
      });

      setActivity(
        activities.slice(0, 10)
      );

      /*
      =======================================================
      SUCCESS
      =======================================================
      */

      console.log(
        "✅ Profile context loaded"
      );

      console.log(
        "Authenticated user:",
        user.email
      );

      console.log(
        "Profile available:",
        Boolean(profileData)
      );
    } catch (error) {
      /*
      =======================================================
      IMPORTANT

      NEVER CLEAR AUTHENTICATION HERE.

      A database failure is NOT the same thing as an
      authentication failure.
      =======================================================
      */

      console.error(
        "Profile Context Error:",
        error
      );

      /*
      Keep the authenticated user usable even when the
      database is temporarily unavailable.
      */

      setProfile({
        id: user.id,

        email:
          user.email || "",

        username:
          user?.user_metadata?.username ||
          user?.email?.split("@")[0] ||
          "Student",

        avatar:
          user?.user_metadata?.avatar_url ||
          "",

        avatar_url:
          user?.user_metadata?.avatar_url ||
          "",
      });

      /*
      Do not wipe stats/activity because of a temporary
      database failure.
      */
    } finally {
      setLoading(false);
    }
  }, [user]);

  /*
  =========================================================
  FETCH WHEN USER CHANGES
  =========================================================
  */

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  /*
  =========================================================
  CONTEXT
  =========================================================
  */

  return (
    <ProfileContext.Provider
      value={{
        profile,

        stats,

        activity,

        loading,

        refreshProfile:
          fetchProfileData,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

/*
=========================================================
USE PROFILE
=========================================================
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