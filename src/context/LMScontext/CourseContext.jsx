// src/context/LMSContext/CourseContext.jsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/*
|--------------------------------------------------------------------------
| API CONFIG
|--------------------------------------------------------------------------
*/

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const getAuthHeaders = () => {
  const token = localStorage.getItem("scholiqen_auth_token");

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| CONTEXT
|--------------------------------------------------------------------------
*/

const CourseContext = createContext(null);

/*
|--------------------------------------------------------------------------
| PROVIDER
|--------------------------------------------------------------------------
*/

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [stats, setStats] = useState({
    courses: 0,
    categories: 0,
    students: 0,
    certificates: 0,
  });

  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH COURSES
  |--------------------------------------------------------------------------
  */

  const fetchCourses = useCallback(async () => {
    try {
      const data = await apiRequest(
        "/api/courses?status=Published"
      );

      /*
       * Support different possible API response shapes:
       *
       * [
       *   {...}
       * ]
       *
       * OR
       *
       * {
       *   courses: [...]
       * }
       *
       * OR
       *
       * {
       *   data: [...]
       * }
       */

      const rawCourses = Array.isArray(data)
        ? data
        : Array.isArray(data?.courses)
        ? data.courses
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const formatted = rawCourses.map((course) => ({
        ...course,

        thumbnail:
          course.thumbnail_url ||
          course.thumbnail ||
          "",

        rating: Number(course.rating) || 0,

        students: Number(course.students) || 0,

        featured:
          course.featured === true ||
          course.featured === 1 ||
          course.featured === "true",

        price: Number(course.price) || 0,
      }));

      setCourses(formatted);

      setFeaturedCourses(
        formatted.filter((course) => course.featured)
      );

      setRecentCourses(formatted.slice(0, 12));

      return formatted;
    } catch (err) {
      console.error("COURSES ERROR:", err);

      setCourses([]);
      setFeaturedCourses([]);
      setRecentCourses([]);

      throw err;
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FETCH CATEGORIES
  |--------------------------------------------------------------------------
  */

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiRequest(
        "/api/course-categories"
      );

      const rawCategories = Array.isArray(data)
        ? data
        : Array.isArray(data?.categories)
        ? data.categories
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const sortedCategories = [...rawCategories].sort(
        (a, b) =>
          String(a?.name || "").localeCompare(
            String(b?.name || "")
          )
      );

      setCategories(sortedCategories);

      console.log(
        "CATEGORIES FROM NEON:",
        sortedCategories
      );

      return sortedCategories;
    } catch (err) {
      console.error("CATEGORY ERROR:", err);

      setCategories([]);

      throw err;
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FETCH DOCUMENTS
  |--------------------------------------------------------------------------
  */

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await apiRequest(
        "/api/documents"
      );

      const rawDocuments = Array.isArray(data)
        ? data
        : Array.isArray(data?.documents)
        ? data.documents
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const sortedDocuments = [...rawDocuments].sort(
        (a, b) => {
          const dateA = new Date(
            a?.created_at || 0
          ).getTime();

          const dateB = new Date(
            b?.created_at || 0
          ).getTime();

          return dateB - dateA;
        }
      );

      setDocuments(sortedDocuments);

      console.log(
        "DOCUMENTS FROM NEON:",
        sortedDocuments
      );

      return sortedDocuments;
    } catch (err) {
      console.error("DOCUMENT ERROR:", err);

      setDocuments([]);

      throw err;
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FETCH DASHBOARD STATS
  |--------------------------------------------------------------------------
  */

  const fetchStats = useCallback(async () => {
    try {
      /*
       * Preferred endpoint:
       *
       * GET /api/courses/stats
       *
       * Expected response:
       *
       * {
       *   courses: 10,
       *   categories: 20,
       *   students: 100,
       *   certificates: 50
       * }
       */

      const data = await apiRequest(
        "/api/courses/stats"
      );

      const statsData =
        data?.stats || data?.data || data || {};

      const nextStats = {
        courses:
          Number(statsData.courses) || 0,

        categories:
          Number(statsData.categories) || 0,

        students:
          Number(statsData.students) || 0,

        certificates:
          Number(statsData.certificates) || 0,
      };

      setStats(nextStats);

      return nextStats;
    } catch (err) {
      /*
       * If the dedicated stats endpoint does not exist
       * yet, calculate what we safely can from the data
       * already loaded.
       */

      console.error(
        "STATS API ERROR:",
        err
      );

      setStats((previous) => ({
        courses:
          courses.length ||
          previous.courses ||
          0,

        categories:
          categories.length ||
          previous.categories ||
          0,

        students:
          previous.students || 0,

        certificates:
          previous.certificates || 0,
      }));

      /*
       * Do not throw here.
       *
       * Stats should not prevent the LMS itself from
       * loading.
       */

      return null;
    }
  }, [courses.length, categories.length]);

  /*
  |--------------------------------------------------------------------------
  | DOCUMENT CATEGORY COUNTS
  |--------------------------------------------------------------------------
  */

  const documentCategories = useMemo(() => {
    const map = {};

    documents.forEach((doc) => {
      const category = categories.find(
        (cat) =>
          String(cat.id) ===
          String(doc.category_id)
      );

      if (!category) return;

      if (!map[category.id]) {
        map[category.id] = {
          id: category.id,
          name: category.name,
          count: 0,
        };
      }

      map[category.id].count += 1;
    });

    return Object.values(map);
  }, [documents, categories]);

  /*
  |--------------------------------------------------------------------------
  | GET COURSE
  |--------------------------------------------------------------------------
  */

  const getCourse = useCallback(
    (id) => {
      if (!id) return undefined;

      return courses.find(
        (course) =>
          String(course.id) === String(id)
      );
    },
    [courses]
  );

  /*
  |--------------------------------------------------------------------------
  | GET DOCUMENTS BY CATEGORY
  |--------------------------------------------------------------------------
  */

  const getDocumentsByCategory = useCallback(
    (categoryId) => {
      if (!categoryId) return [];

      return documents.filter(
        (document) =>
          String(document.category_id) ===
          String(categoryId)
      );
    },
    [documents]
  );

  /*
  |--------------------------------------------------------------------------
  | SEARCH DOCUMENTS
  |--------------------------------------------------------------------------
  */

  const searchDocuments = useCallback(
    (keyword = "") => {
      const text = String(keyword)
        .toLowerCase()
        .trim();

      if (!text) {
        return documents;
      }

      return documents.filter((document) => {
        const title = String(
          document.title || ""
        ).toLowerCase();

        const description = String(
          document.description || ""
        ).toLowerCase();

        return (
          title.includes(text) ||
          description.includes(text)
        );
      });
    },
    [documents]
  );

  /*
  |--------------------------------------------------------------------------
  | SEARCH COURSES
  |--------------------------------------------------------------------------
  */

  const searchCourses = useCallback(
    (keyword = "") => {
      const text = String(keyword)
        .toLowerCase()
        .trim();

      if (!text) {
        return courses;
      }

      return courses.filter((course) => {
        const title = String(
          course.title || ""
        ).toLowerCase();

        const description = String(
          course.description || ""
        ).toLowerCase();

        const instructor = String(
          course.instructor || ""
        ).toLowerCase();

        const category = String(
          course.category || ""
        ).toLowerCase();

        const subject = String(
          course.subject || ""
        ).toLowerCase();

        return (
          title.includes(text) ||
          description.includes(text) ||
          instructor.includes(text) ||
          category.includes(text) ||
          subject.includes(text)
        );
      });
    },
    [courses]
  );

  /*
  |--------------------------------------------------------------------------
  | REFRESH ALL LMS DATA
  |--------------------------------------------------------------------------
  */

  const refreshCourses = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const results = await Promise.allSettled([
        fetchCourses(),
        fetchCategories(),
        fetchDocuments(),
        fetchStats(),
      ]);

      const failed = results.filter(
        (result) =>
          result.status === "rejected"
      );

      if (failed.length > 0) {
        console.warn(
          `${failed.length} LMS request(s) failed during refresh.`
        );
      }
    } catch (err) {
      console.error(
        "LMS REFRESH ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to refresh LMS data."
      );
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchCourses,
    fetchCategories,
    fetchDocuments,
    fetchStats,
  ]);

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const results =
          await Promise.allSettled([
            fetchCourses(),
            fetchCategories(),
            fetchDocuments(),
          ]);

        if (!mounted) return;

        const failed = results.filter(
          (result) =>
            result.status === "rejected"
        );

        if (failed.length > 0) {
          console.warn(
            `${failed.length} LMS data request(s) failed.`
          );
        }
      } catch (err) {
        if (!mounted) return;

        console.error(
          "LMS LOAD ERROR:",
          err
        );

        setError(
          err?.message ||
            "Failed to load LMS data."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [
    fetchCourses,
    fetchCategories,
    fetchDocuments,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LOAD STATS AFTER MAIN DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (loading) return;

    fetchStats().catch((err) => {
      console.warn(
        "Unable to load LMS statistics:",
        err
      );
    });
  }, [loading, fetchStats]);

  /*
  |--------------------------------------------------------------------------
  | CATEGORIES WITH DOCUMENT COUNTS
  |--------------------------------------------------------------------------
  */

  const categoriesWithCounts = useMemo(() => {
    return categories.map((category) => {
      const documentCategory =
        documentCategories.find(
          (item) =>
            String(item.id) ===
            String(category.id)
        );

      return {
        ...category,
        count:
          documentCategory?.count || 0,
      };
    });
  }, [
    categories,
    documentCategories,
  ]);

  /*
  |--------------------------------------------------------------------------
  | TOTALS
  |--------------------------------------------------------------------------
  */

  const totalCourses =
    stats.courses || courses.length;

  const totalCategories =
    stats.categories ||
    categories.length;

  const totalDocuments =
    documents.length;

  /*
  |--------------------------------------------------------------------------
  | PROVIDER VALUE
  |--------------------------------------------------------------------------
  */

  const contextValue = useMemo(
    () => ({
      courses,

      categories:
        categoriesWithCounts,

      documents,

      stats,

      featuredCourses,

      recentCourses,

      loading,

      refreshing,

      error,

      totalCourses,

      totalDocuments,

      totalCategories,

      fetchCourses,

      fetchCategories,

      fetchDocuments,

      fetchStats,

      refreshCourses,

      getCourse,

      getDocumentsByCategory,

      searchCourses,

      searchDocuments,
    }),
    [
      courses,
      categoriesWithCounts,
      documents,
      stats,
      featuredCourses,
      recentCourses,
      loading,
      refreshing,
      error,
      totalCourses,
      totalDocuments,
      totalCategories,
      fetchCourses,
      fetchCategories,
      fetchDocuments,
      fetchStats,
      refreshCourses,
      getCourse,
      getDocumentsByCategory,
      searchCourses,
      searchDocuments,
    ]
  );

  return (
    <CourseContext.Provider
      value={contextValue}
    >
      {children}
    </CourseContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| HOOK
|--------------------------------------------------------------------------
*/

export const useCourses = () => {
  const context =
    useContext(CourseContext);

  if (!context) {
    throw new Error(
      "useCourses must be used inside CourseProvider"
    );
  }

  return context;
};

export default CourseContext;
