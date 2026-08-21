// src/pages/courses/CategoryCourses.jsx

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  Search,
  Sparkles,
  BookOpen,
  TrendingUp,
  Clock3,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useCourses } from "../../context/LMSContext/CourseContext";

import CourseCard from "../../components/courses/CourseCard";

import { supabase } from "../../lib/supabaseClient";

const CategoryCourses = () => {
  const navigate = useNavigate();

  const { categoryId } = useParams();

  const {
    courses,
    categories,
    loading,
  } = useCourses();

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("newest");

  const [visible, setVisible] = useState(12);

  const [openingCourseId, setOpeningCourseId] = useState(null);

  const [openError, setOpenError] = useState("");

  // ==========================================
  // CATEGORY
  // ==========================================

  const category = useMemo(() => {
    return categories.find(
      (c) =>
        String(c.id) ===
        String(categoryId)
    );
  }, [categories, categoryId]);

  // ==========================================
  // CATEGORY COURSES
  // ==========================================

  const categoryCourses = useMemo(() => {
    let list = courses.filter(
      (course) =>
        String(course.category_id) ===
        String(categoryId)
    );

    console.log(
      "========== CATEGORY DEBUG =========="
    );

    console.log(
      "URL categoryId:",
      categoryId
    );

    console.log(
      "Matched Courses:",
      list.length
    );

    console.table(list);

    console.log(
      "==================================="
    );

    // SEARCH
    if (search.trim()) {
      const keyword =
        search.toLowerCase();

      list = list.filter(
        (course) =>
          course.title
            ?.toLowerCase()
            .includes(keyword) ||
          course.description
            ?.toLowerCase()
            .includes(keyword) ||
          course.instructor
            ?.toLowerCase()
            .includes(keyword)
      );
    }

    // SORT
    switch (sortBy) {
      case "oldest":
        list.sort(
          (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
        );
        break;

      case "rating":
        list.sort(
          (a, b) =>
            (b.rating || 0) -
            (a.rating || 0)
        );
        break;

      case "az":
        list.sort((a, b) =>
          (a.title || "").localeCompare(
            b.title || ""
          )
        );
        break;

      default:
        list.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );
    }

    return list;
  }, [
    courses,
    categoryId,
    search,
    sortBy,
  ]);

  // ==========================================
  // FEATURED COURSE
  // ==========================================

  const featuredCourse = useMemo(() => {
    return (
      categoryCourses.find(
        (c) => c.featured
      ) ||
      categoryCourses[0]
    );
  }, [categoryCourses]);

  // ==========================================
  // RECENT COURSES
  // ==========================================

  const recentCourses = useMemo(() => {
    return categoryCourses.slice(0, 6);
  }, [categoryCourses]);

  // ==========================================
  // DISPLAYED COURSES
  // ==========================================

  const displayedCourses =
    categoryCourses.slice(
      0,
      visible
    );

  // ==========================================
  // RESET SCROLL
  // ==========================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setVisible(12);
  }, [categoryId]);

  // ==========================================
  // OPEN PDF READER
  // ==========================================
  //
  // IMPORTANT:
  //
  // PDFReader.jsx does:
  //
  //   .from("documents")
  //   .eq("id", id)
  //
  // Therefore we MUST send the
  // documents.id, NOT course.id.
  //
  // This function looks for a document
  // belonging to the selected course.
  //
  // ==========================================

  const openCoursePDF = useCallback(
    async (course) => {
      if (!course?.id) {
        setOpenError(
          "This course does not have a valid ID."
        );

        return;
      }

      try {
        setOpeningCourseId(course.id);

        setOpenError("");

        console.log(
          "================================"
        );

        console.log(
          "OPENING COURSE:"
        );

        console.log(
          "Course ID:",
          course.id
        );

        console.log(
          "Course Title:",
          course.title
        );

        console.log(
          "Looking for PDF in documents..."
        );

        console.log(
          "================================"
        );

        // ======================================
        // FIND DOCUMENT BELONGING TO COURSE
        // ======================================

        const {
          data: documents,
          error: documentError,
        } = await supabase
          .from("documents")
          .select("*")
          .eq("course_id", course.id);

        if (documentError) {
          console.error(
            "DOCUMENT FETCH ERROR:",
            documentError
          );

          throw documentError;
        }

        console.log(
          "Documents found:",
          documents
        );

        // ======================================
        // NO DOCUMENT
        // ======================================

        if (
          !documents ||
          documents.length === 0
        ) {
          console.error(
            "NO DOCUMENT FOUND FOR COURSE:",
            course.id
          );

          setOpenError(
            `No PDF has been attached to "${course.title}" yet.`
          );

          return;
        }

        // ======================================
        // USE FIRST DOCUMENT
        // ======================================

        const documentData =
          documents[0];

        console.log(
          "Opening document:",
          documentData
        );

        console.log(
          "Document ID:",
          documentData.id
        );

        console.log(
          "PDF URL:",
          documentData.file_url
        );

        // ======================================
        // OPEN PDF READER
        // ======================================

        navigate(
          `/pdf-reader/${documentData.id}`
        );
      } catch (error) {
        console.error(
          "OPEN PDF ERROR:",
          error
        );

        setOpenError(
          error?.message ||
            "Unable to open this PDF."
        );
      } finally {
        setOpeningCourseId(null);
      }
    },
    [navigate]
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-[#050B14]">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />

          <p className="mt-5 text-slate-400">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <div className="min-h-screen bg-[#050B14] text-white">

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {openError && (
        <div className="fixed left-1/2 top-6 z-[100] w-[90%] max-w-xl -translate-x-1/2">
          <div className="flex items-start gap-4 rounded-2xl border border-red-500/30 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl">

            <AlertCircle
              className="mt-0.5 shrink-0 text-red-400"
              size={24}
            />

            <div className="flex-1">
              <p className="font-bold">
                Unable to open PDF
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {openError}
              </p>
            </div>

            <button
              onClick={() =>
                setOpenError("")
              }
              className="text-slate-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ======================================
          HERO
      ====================================== */}

      <section className="relative overflow-hidden border-b border-slate-800">

        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent" />

        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="mx-auto max-w-7xl px-6 py-20">

          <button
            onClick={() =>
              navigate("/courses")
            }
            className="mb-10 inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-3 transition hover:border-cyan-500"
          >
            <ArrowLeft size={18} />

            Back to Courses
          </button>

          <div className="grid gap-12 lg:grid-cols-2">

            {/* LEFT */}

            <div>

              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-5 py-2 text-cyan-400">

                <Sparkles size={16} />

                Learning Category

              </span>

              <h1 className="mt-6 text-5xl font-black leading-tight">

                {category?.name}

              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">

                {category?.description ||
                  "Master practical skills through premium courses, projects and assessments."}

              </p>

              <div className="mt-10 flex flex-wrap gap-5">

                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">

                  <BookOpen
                    className="mb-3 text-cyan-400"
                    size={24}
                  />

                  <p className="text-3xl font-black">
                    {categoryCourses.length}
                  </p>

                  <span className="text-slate-500">
                    Courses
                  </span>

                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">

                  <TrendingUp
                    className="mb-3 text-emerald-400"
                    size={24}
                  />

                  <p className="text-3xl font-black">

                    {
                      categoryCourses.filter(
                        (c) => c.featured
                      ).length
                    }

                  </p>

                  <span className="text-slate-500">
                    Featured
                  </span>

                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">

                  <Clock3
                    className="mb-3 text-orange-400"
                    size={24}
                  />

                  <p className="text-3xl font-black">

                    {recentCourses.length}

                  </p>

                  <span className="text-slate-500">
                    Recently Added
                  </span>

                </div>

              </div>

            </div>

            {/* FEATURED */}

            {featuredCourse && (
              <motion.div
                whileHover={{
                  scale: 1.02,
                }}
                className="overflow-hidden rounded-[34px] border border-cyan-500/20 bg-slate-900"
              >

                <div className="relative h-72">

                  {featuredCourse.thumbnail ? (
                    <img
                      src={
                        featuredCourse.thumbnail
                      }
                      alt={
                        featuredCourse.title
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-700 via-blue-700 to-slate-900">

                      <BookOpen
                        size={80}
                        className="text-white/60"
                      />

                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute left-6 top-6 rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900">
                    ⭐ Featured Course
                  </div>

                </div>

                <div className="space-y-5 p-8">

                  <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
                    {featuredCourse.category}
                  </span>

                  <h2 className="text-3xl font-black">
                    {featuredCourse.title}
                  </h2>

                  <p className="line-clamp-3 leading-8 text-slate-400">
                    {featuredCourse.description}
                  </p>

                  <button
                    disabled={
                      openingCourseId ===
                      featuredCourse.id
                    }
                    onClick={() =>
                      openCoursePDF(
                        featuredCourse
                      )
                    }
                    className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-bold transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {openingCourseId ===
                    featuredCourse.id ? (
                      <>
                        <Loader2
                          size={20}
                          className="animate-spin"
                        />

                        Opening PDF...
                      </>
                    ) : (
                      <>
                        <BookOpen size={20} />

                        Start Learning
                      </>
                    )}

                  </button>

                </div>

              </motion.div>
            )}

          </div>
        </div>
      </section>

      {/* ======================================
          SEARCH + SORT
      ====================================== */}

      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-lg">

            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder={`Search ${
                category?.name || ""
              } courses...`}
              className="
                w-full
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                py-4
                pl-14
                pr-5
                outline-none
                transition
                focus:border-cyan-500
              "
            />

          </div>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">

              <Filter
                size={18}
                className="text-cyan-400"
              />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="
                  bg-transparent
                  text-white
                  outline-none
                "
              >

                <option
                  value="newest"
                  className="bg-slate-900"
                >
                  Newest
                </option>

                <option
                  value="oldest"
                  className="bg-slate-900"
                >
                  Oldest
                </option>

                <option
                  value="rating"
                  className="bg-slate-900"
                >
                  Highest Rated
                </option>

                <option
                  value="az"
                  className="bg-slate-900"
                >
                  A - Z
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* ======================================
            RECENTLY ADDED
        ====================================== */}

        {recentCourses.length > 0 && (

          <section className="mb-16">

            <div className="mb-8 flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-black">
                  Recently Added
                </h2>

                <p className="mt-2 text-slate-400">
                  The latest courses added to this
                  category.
                </p>

              </div>

            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {recentCourses.map(
                (course) => (

                  <CourseCard
                    key={course.id}
                    course={course}
                    onOpen={() =>
                      openCoursePDF(course)
                    }
                  />

                )
              )}

            </div>

          </section>

        )}

        {/* ======================================
            ALL COURSES
        ====================================== */}

        <section>

          <div className="mb-8 flex items-center justify-between">

            <div>

              <h2 className="text-3xl font-black">
                All{" "}
                {category?.name || ""}{" "}
                Courses
              </h2>

              <p className="mt-2 text-slate-400">
                {categoryCourses.length}{" "}
                courses available.
              </p>

            </div>

          </div>

          {displayedCourses.length ===
          0 ? (

            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-20 text-center">

              <BookOpen
                size={70}
                className="mx-auto text-slate-600"
              />

              <h2 className="mt-6 text-3xl font-black">
                No Courses Found
              </h2>

              <p className="mt-4 text-slate-400">
                Try another search.
              </p>

            </div>

          ) : (

            <>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                {displayedCourses.map(
                  (course) => (

                    <CourseCard
                      key={course.id}
                      course={course}
                      onOpen={() =>
                        openCoursePDF(
                          course
                        )
                      }
                    />

                  )
                )}

              </div>

              {/* LOAD MORE */}

              {visible <
                categoryCourses.length && (

                <div className="mt-14 flex justify-center">

                  <button
                    onClick={() =>
                      setVisible(
                        (prev) =>
                          prev + 12
                      )
                    }
                    className="
                      rounded-2xl
                      bg-gradient-to-r
                      from-cyan-500
                      to-blue-600
                      px-10
                      py-4
                      font-bold
                      text-white
                      transition
                      hover:scale-105
                    "
                  >
                    Load More Courses
                  </button>

                </div>

              )}

            </>

          )}

        </section>

      </div>

    </div>
  );
};

export default CategoryCourses;