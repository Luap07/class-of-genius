import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  GraduationCap,
  Search,
  Loader2,
  BookOpen,
  Clock3,
  FileText,
} from "lucide-react";

const FacultyManager = () => {
  // =========================================================
  // ROUTE PARAMS
  // =========================================================

  const params = useParams();

  const schoolId =
    params.schoolId ||
    params.school_id ||
    params.id ||
    "";

  const schoolType =
    params.type ||
    params.schoolType ||
    params.school_type ||
    "";

  console.log("FacultyManager route params:", {
    params,
    schoolId,
    schoolType,
  });

  // =========================================================
  // FACULTY STATE
  // =========================================================

  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    active: true,
  });

  // =========================================================
  // COURSE STATE
  // =========================================================

  const emptyCourse = {
    id: null,
    name: "",
    duration: "",
    description: "",
  };

  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({
    ...emptyCourse,
  });

  const [editingCourseIndex, setEditingCourseIndex] =
    useState(null);

  // =========================================================
  // FETCH FACULTIES + COURSES
  // =========================================================

  const fetchFaculties = async () => {
    if (!schoolId) {
      console.error(
        "FacultyManager: School ID is missing."
      );

      setFaculties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // =====================================================
      // FETCH FACULTIES
      // =====================================================

      const {
        data: facultyData,
        error: facultyError,
      } = await supabase
        .from("school_faculties")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", {
          ascending: false,
        });

      if (facultyError) {
        console.error(
          "Fetch Faculties Error:",
          facultyError
        );

        setFaculties([]);
        return;
      }

      const facultyList = facultyData || [];

      if (facultyList.length === 0) {
        setFaculties([]);
        return;
      }

      // =====================================================
      // GET FACULTY IDS
      // =====================================================

      const facultyIds = facultyList
        .map((faculty) => faculty.id)
        .filter(Boolean);

      if (facultyIds.length === 0) {
        setFaculties(
          facultyList.map((faculty) => ({
            ...faculty,
            courses: [],
          }))
        );

        return;
      }

      // =====================================================
      // FETCH COURSES
      //
      // IMPORTANT:
      // school_id IS REQUIRED by school_faculty_courses.
      // =====================================================

      const {
        data: courseData,
        error: courseError,
      } = await supabase
        .from("school_faculty_courses")
        .select("*")
        .eq("school_id", schoolId)
        .in("faculty_id", facultyIds)
        .order("created_at", {
          ascending: true,
        });

      if (courseError) {
        console.error(
          "Fetch Faculty Courses Error:",
          courseError
        );

        // Still show faculties even if courses fail.
        setFaculties(
          facultyList.map((faculty) => ({
            ...faculty,
            courses: [],
          }))
        );

        return;
      }

      const allCourses = courseData || [];

      // =====================================================
      // ATTACH COURSES TO THEIR FACULTY
      // =====================================================

      const facultiesWithCourses =
        facultyList.map((faculty) => ({
          ...faculty,

          courses: allCourses.filter(
            (course) =>
              course.faculty_id === faculty.id
          ),
        }));

      setFaculties(facultiesWithCourses);
    } catch (error) {
      console.error(
        "Faculty Fetch Error:",
        error
      );

      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchFaculties();
  }, [schoolId]);

  // =========================================================
  // OPEN CREATE FACULTY
  // =========================================================

  const openCreate = () => {
    setEditingFaculty(null);

    setForm({
      name: "",
      description: "",
      active: true,
    });

    setCourses([]);

    setCourseForm({
      ...emptyCourse,
    });

    setEditingCourseIndex(null);

    setShowForm(true);
  };

  // =========================================================
  // OPEN EDIT FACULTY
  // =========================================================

  const openEdit = (faculty) => {
    if (!faculty) return;

    setEditingFaculty(faculty);

    setForm({
      name: faculty.name || "",
      description: faculty.description || "",
      active: faculty.active ?? true,
    });

    setCourses(
      Array.isArray(faculty.courses)
        ? faculty.courses.map((course) => ({
            id: course.id || null,
            name: course.name || "",
            duration: course.duration || "",
            description: course.description || "",
          }))
        : []
    );

    setCourseForm({
      ...emptyCourse,
    });

    setEditingCourseIndex(null);

    setShowForm(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingFaculty(null);

    setForm({
      name: "",
      description: "",
      active: true,
    });

    setCourses([]);

    setCourseForm({
      ...emptyCourse,
    });

    setEditingCourseIndex(null);
  };

  // =========================================================
  // FACULTY INPUT
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // COURSE INPUT
  // =========================================================

  const handleCourseChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setCourseForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // ADD / UPDATE COURSE LOCALLY
  // =========================================================

  const saveCourseToList = () => {
    const courseName =
      String(courseForm?.name || "").trim();

    const duration =
      String(courseForm?.duration || "").trim();

    const description =
      String(
        courseForm?.description || ""
      ).trim();

    if (!courseName) {
      alert("Course name is required.");
      return;
    }

    if (!duration) {
      alert("Course duration is required.");
      return;
    }

    const course = {
      id:
        courseForm?.id ||
        `temp-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      name: courseName,

      duration,

      description,
    };

    setCourses((previous) => {
      const updated = [...previous];

      if (
        editingCourseIndex !== null &&
        editingCourseIndex >= 0
      ) {
        updated[editingCourseIndex] = course;
      } else {
        updated.push(course);
      }

      return updated;
    });

    setCourseForm({
      ...emptyCourse,
    });

    setEditingCourseIndex(null);
  };

  // =========================================================
  // EDIT COURSE
  // =========================================================

  const editCourse = (index) => {
    const course = courses[index];

    if (!course) return;

    setCourseForm({
      id: course.id || null,

      name: course.name || "",

      duration: course.duration || "",

      description:
        course.description || "",
    });

    setEditingCourseIndex(index);
  };

  // =========================================================
  // DELETE COURSE
  // =========================================================

  const deleteCourse = async (index) => {
    const course = courses[index];

    if (!course) return;

    const confirmed = window.confirm(
      `Remove "${
        course.name || "this course"
      }" from this faculty?`
    );

    if (!confirmed) return;

    const courseId = course.id
      ? String(course.id)
      : "";

    const isDatabaseCourse =
      courseId &&
      !courseId.startsWith("temp-");

    // =====================================================
    // DELETE EXISTING DATABASE COURSE
    // =====================================================

    if (isDatabaseCourse) {
      try {
        setSaving(true);

        const {
          error,
        } = await supabase
          .from("school_faculty_courses")
          .delete()
          .eq("id", course.id)
          .eq("school_id", schoolId)
          .eq(
            "faculty_id",
            editingFaculty?.id
          );

        if (error) {
          console.error(
            "Delete Course Error:",
            error
          );

          alert(
            error.message ||
              "Failed to delete course."
          );

          return;
        }
      } catch (error) {
        console.error(
          "Course Delete Error:",
          error
        );

        alert(
          error?.message ||
            "Failed to delete course."
        );

        return;
      } finally {
        setSaving(false);
      }
    }

    // =====================================================
    // REMOVE FROM LOCAL STATE
    // =====================================================

    setCourses((previous) =>
      previous.filter(
        (_, courseIndex) =>
          courseIndex !== index
      )
    );

    if (
      editingCourseIndex === index
    ) {
      setCourseForm({
        ...emptyCourse,
      });

      setEditingCourseIndex(null);
    }
  };

  // =========================================================
  // CANCEL COURSE EDIT
  // =========================================================

  const cancelCourseEdit = () => {
    setCourseForm({
      ...emptyCourse,
    });

    setEditingCourseIndex(null);
  };

  // =========================================================
  // SAVE FACULTY + COURSES
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const facultyName =
      String(form?.name || "").trim();

    const facultyDescription =
      String(
        form?.description || ""
      ).trim();

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!facultyName) {
      alert("Faculty name is required.");
      return;
    }

    if (!schoolId) {
      console.error(
        "FacultyManager: Missing schoolId.",
        {
          params,
          schoolId,
          schoolType,
        }
      );

      alert(
        "School ID is missing. Please open the faculty manager from a valid school."
      );

      return;
    }

    if (!schoolType) {
      console.error(
        "FacultyManager: Missing schoolType.",
        {
          params,
          schoolId,
          schoolType,
        }
      );

      alert(
        "School type is missing. Please open the faculty manager from a valid school route."
      );

      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // FACULTY PAYLOAD
      // =====================================================

      const facultyPayload = {
        school_id: schoolId,

        school_type: schoolType,

        name: facultyName,

        description:
          facultyDescription || null,

        active:
          form?.active ?? true,
      };

      console.log(
        "Saving faculty:",
        facultyPayload
      );

      let facultyId =
        editingFaculty?.id || null;

      // =====================================================
      // CREATE FACULTY
      // =====================================================

      if (!facultyId) {
        const {
          data,
          error,
        } = await supabase
          .from("school_faculties")
          .insert([
            facultyPayload,
          ])
          .select()
          .single();

        if (error) {
          console.error(
            "Create Faculty Error:",
            error
          );

          alert(
            error.message ||
              "Failed to create faculty."
          );

          return;
        }

        if (!data?.id) {
          console.error(
            "Create Faculty returned no ID:",
            data
          );

          alert(
            "Faculty was created but no faculty ID was returned."
          );

          return;
        }

        facultyId = data.id;
      }

      // =====================================================
      // UPDATE FACULTY
      // =====================================================

      else {
        const {
          data,
          error,
        } = await supabase
          .from("school_faculties")
          .update(
            facultyPayload
          )
          .eq(
            "id",
            facultyId
          )
          .eq(
            "school_id",
            schoolId
          )
          .select()
          .single();

        if (error) {
          console.error(
            "Update Faculty Error:",
            error
          );

          alert(
            error.message ||
              "Failed to update faculty."
          );

          return;
        }

        console.log(
          "Faculty updated:",
          data
        );
      }

      // =====================================================
      // SAVE COURSES
      // =====================================================

      for (const course of courses) {
        const courseName =
          String(
            course?.name || ""
          ).trim();

        const courseDuration =
          String(
            course?.duration || ""
          ).trim();

        const courseDescription =
          String(
            course?.description || ""
          ).trim();

        // Skip invalid local course
        if (!courseName) {
          continue;
        }

        const courseId =
          course?.id
            ? String(course.id)
            : "";

        const isExistingCourse =
          courseId &&
          !courseId.startsWith(
            "temp-"
          );

        // ===================================================
        // UPDATE EXISTING COURSE
        // ===================================================

        if (isExistingCourse) {
          const {
            error,
          } = await supabase
            .from(
              "school_faculty_courses"
            )
            .update({
              school_id:
                schoolId,

              faculty_id:
                facultyId,

              name:
                courseName,

              duration:
                courseDuration ||
                null,

              description:
                courseDescription ||
                null,
            })
            .eq(
              "id",
              course.id
            )
            .eq(
              "school_id",
              schoolId
            )
            .eq(
              "faculty_id",
              facultyId
            );

          if (error) {
            console.error(
              "Update Course Error:",
              error
            );

            throw error;
          }
        }

        // ===================================================
        // INSERT NEW COURSE
        // ===================================================

        else {
          const {
            data: newCourse,
            error,
          } = await supabase
            .from(
              "school_faculty_courses"
            )
            .insert([
              {
                // IMPORTANT:
                // The table requires school_id.
                school_id:
                  schoolId,

                faculty_id:
                  facultyId,

                name:
                  courseName,

                duration:
                  courseDuration ||
                  null,

                description:
                  courseDescription ||
                  null,
              },
            ])
            .select()
            .single();

          if (error) {
            console.error(
              "Create Course Error:",
              error
            );

            throw error;
          }

          console.log(
            "Course created:",
            newCourse
          );
        }
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      console.log(
        "Faculty and courses saved successfully."
      );

      alert(
        editingFaculty
          ? "Faculty and courses updated successfully."
          : "Faculty and courses created successfully."
      );

      closeForm();

      await fetchFaculties();
    } catch (error) {
      console.error(
        "Faculty Save Error:",
        error
      );

      alert(
        error?.message ||
          "Something went wrong while saving the faculty and courses."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE FACULTY
  // =========================================================

  const handleDelete = async (
    faculty
  ) => {
    if (!faculty?.id) {
      alert(
        "Faculty ID is missing."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${
          faculty.name ||
          "this faculty"
        }"?\n\nAll courses under this faculty will also be deleted.`
      );

    if (!confirmed) return;

    try {
      setSaving(true);

      // =====================================================
      // DELETE COURSES FIRST
      // =====================================================

      const {
        error:
          courseDeleteError,
      } = await supabase
        .from(
          "school_faculty_courses"
        )
        .delete()
        .eq(
          "school_id",
          schoolId
        )
        .eq(
          "faculty_id",
          faculty.id
        );

      if (courseDeleteError) {
        console.error(
          "Delete Faculty Courses Error:",
          courseDeleteError
        );

        alert(
          courseDeleteError.message ||
            "Failed to delete faculty courses."
        );

        return;
      }

      // =====================================================
      // DELETE FACULTY
      // =====================================================

      const {
        error,
      } = await supabase
        .from("school_faculties")
        .delete()
        .eq(
          "id",
          faculty.id
        )
        .eq(
          "school_id",
          schoolId
        );

      if (error) {
        console.error(
          "Delete Faculty Error:",
          error
        );

        alert(
          error.message ||
            "Failed to delete faculty."
        );

        return;
      }

      await fetchFaculties();
    } catch (error) {
      console.error(
        "Faculty Delete Error:",
        error
      );

      alert(
        error?.message ||
          "Failed to delete faculty."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FILTER FACULTIES + COURSES
  // =========================================================

  const filteredFaculties =
    faculties.filter((faculty) => {
      const query =
        String(search || "")
          .trim()
          .toLowerCase();

      if (!query) return true;

      const facultyName =
        String(
          faculty?.name || ""
        );

      const facultyDescription =
        String(
          faculty?.description ||
            ""
        );

      const courseSearchText =
        Array.isArray(
          faculty?.courses
        )
          ? faculty.courses
              .flatMap(
                (course) => [
                  course?.name ||
                    "",
                  course?.duration ||
                    "",
                  course?.description ||
                    "",
                ]
              )
              .join(" ")
          : "";

      const searchable = [
        facultyName,
        facultyDescription,
        courseSearchText,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(
        query
      );
    });

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2
            size={20}
            className="animate-spin text-cyan-400"
          />

          <p className="text-sm font-bold text-slate-500">
            Loading faculties...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="w-full">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
            <GraduationCap
              size={24}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              Faculties
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create faculties and list
              all courses under each
              faculty.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={18} />
          Add Faculty
        </button>
      </div>

      {/* =====================================================
          SCHOOL INFORMATION
      ===================================================== */}

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-600">
            School ID
          </p>

          <p className="mt-2 break-all text-sm font-bold text-cyan-400">
            {schoolId ||
              "Not available"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-600">
            School Type
          </p>

          <p className="mt-2 text-sm font-bold text-cyan-400">
            {schoolType ||
              "Not available"}
          </p>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative mb-7">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search faculties or courses..."
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 pl-11 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
        />
      </div>

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {filteredFaculties.length ===
        0 && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-14 text-center">
          <GraduationCap
            size={42}
            className="mx-auto text-slate-700"
          />

          <h3 className="mt-5 text-xl font-black text-white">
            {faculties.length ===
            0
              ? "No faculties yet"
              : "No faculties found"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {faculties.length ===
            0
              ? "Create a faculty and start listing its courses."
              : "Try another search."}
          </p>

          {faculties.length ===
            0 && (
            <button
              type="button"
              onClick={
                openCreate
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus size={18} />
              Add Faculty
            </button>
          )}
        </div>
      )}

      {/* =====================================================
          FACULTIES
      ===================================================== */}

      {filteredFaculties.length >
        0 && (
        <div className="space-y-5">
          {filteredFaculties.map(
            (faculty) => {
              const facultyCourses =
                Array.isArray(
                  faculty?.courses
                )
                  ? faculty.courses
                  : [];

              return (
                <div
                  key={
                    faculty.id
                  }
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-6"
                >
                  {/* ===========================================
                      FACULTY HEADER
                  =========================================== */}

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
                        <GraduationCap
                          size={27}
                          className="text-cyan-400"
                        />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-black text-white">
                            {
                              faculty.name
                            }
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              faculty.active
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-red-400/10 text-red-400"
                            }`}
                          >
                            {faculty.active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        {faculty.school_type && (
                          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-cyan-400/70">
                            {
                              faculty.school_type
                            }
                          </p>
                        )}

                        {faculty.description && (
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                            {
                              faculty.description
                            }
                          </p>
                        )}

                        {faculty.dean && (
                          <p className="mt-3 text-sm font-bold text-slate-400">
                            Dean:{" "}
                            <span className="text-white">
                              {
                                faculty.dean
                              }
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            faculty
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-cyan-400/10 hover:text-cyan-400"
                      >
                        <Pencil
                          size={15}
                        />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={
                          saving
                        }
                        onClick={() =>
                          handleDelete(
                            faculty
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                      >
                        <Trash2
                          size={15}
                        />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* ===========================================
                      COURSES
                  =========================================== */}

                  <div className="mt-7 border-t border-white/10 pt-6">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="flex items-center gap-2 text-lg font-black text-white">
                          <BookOpen
                            size={19}
                            className="text-cyan-400"
                          />
                          Courses
                        </h4>

                        <p className="mt-1 text-xs text-slate-600">
                          {
                            facultyCourses.length
                          }{" "}
                          {facultyCourses.length ===
                          1
                            ? "course"
                            : "courses"}{" "}
                          listed under this
                          faculty
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            faculty
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500/10 px-4 py-2.5 text-xs font-black text-cyan-400 transition hover:bg-cyan-500/20"
                      >
                        <Plus
                          size={15}
                        />
                        Add Course
                      </button>
                    </div>

                    {facultyCourses.length ===
                    0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                        <BookOpen
                          size={30}
                          className="mx-auto text-slate-700"
                        />

                        <p className="mt-3 text-sm font-bold text-slate-500">
                          No courses
                          listed yet
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              faculty
                            )
                          }
                          className="mt-4 text-sm font-bold text-cyan-400 transition hover:text-cyan-300"
                        >
                          + Add the
                          first
                          course
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {facultyCourses.map(
                          (
                            course,
                            index
                          ) => (
                            <div
                              key={
                                course.id ||
                                index
                              }
                              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                                  <BookOpen
                                    size={
                                      18
                                    }
                                    className="text-cyan-400"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <h5 className="font-black text-white">
                                    {
                                      course.name
                                    }
                                  </h5>

                                  {course.duration && (
                                    <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                                      <Clock3
                                        size={
                                          13
                                        }
                                      />

                                      {
                                        course.duration
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>

                              {course.description && (
                                <div className="mt-4 flex gap-2">
                                  <FileText
                                    size={
                                      15
                                    }
                                    className="mt-1 shrink-0 text-slate-600"
                                  />

                                  <p className="text-sm leading-6 text-slate-500">
                                    {
                                      course.description
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* =====================================================
          FACULTY FORM MODAL
      ===================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
            {/* ===============================================
                MODAL HEADER
            =============================================== */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/95 px-6 py-5 backdrop-blur-xl">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                  Faculty Management
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  {editingFaculty
                    ? "Edit Faculty"
                    : "Add Faculty"}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* ===============================================
                FORM
            =============================================== */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-7 p-6"
            >
              {/* =============================================
                  FACULTY INFORMATION
              ============================================= */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                <div className="mb-5">
                  <h3 className="text-lg font-black text-white">
                    Faculty Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-600">
                    Basic information about
                    this faculty.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* FACULTY NAME */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">
                      Faculty Name
                    </label>

                    <input
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Faculty of Science"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                    />
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-300">
                      Faculty Description
                    </label>

                    <textarea
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      rows={4}
                      placeholder="Describe this faculty..."
                      className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                    />
                  </div>

                  {/* SCHOOL TYPE */}

                  <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-600">
                      School Type
                    </p>

                    <p className="mt-2 text-sm font-black text-cyan-400">
                      {schoolType ||
                        "Missing"}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      This value is
                      automatically attached
                      to the faculty.
                    </p>
                  </div>
                </div>
              </div>

              {/* =============================================
                  COURSES
              ============================================= */}

              <div className="rounded-3xl border border-cyan-400/10 bg-cyan-400/[0.02] p-5">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-black text-white">
                      <BookOpen
                        size={21}
                        className="text-cyan-400"
                      />
                      Courses
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      List every course
                      offered under this
                      faculty.
                    </p>
                  </div>

                  <span className="rounded-full bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-400">
                    {courses.length}{" "}
                    {courses.length ===
                    1
                      ? "Course"
                      : "Courses"}
                  </span>
                </div>

                {/* ===========================================
                    COURSE INPUT
                =========================================== */}

                <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                  <div className="mb-5">
                    <p className="text-sm font-black text-white">
                      {editingCourseIndex !==
                      null
                        ? "Edit Course"
                        : "Add Course"}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Add the course name,
                      duration and
                      description.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* COURSE NAME */}

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-400">
                        Course Name
                      </label>

                      <input
                        name="name"
                        value={
                          courseForm.name
                        }
                        onChange={
                          handleCourseChange
                        }
                        placeholder="e.g. Computer Science"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>

                    {/* DURATION */}

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-400">
                        Duration
                      </label>

                      <input
                        name="duration"
                        value={
                          courseForm.duration
                        }
                        onChange={
                          handleCourseChange
                        }
                        placeholder="e.g. 4 Years"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>

                    {/* DESCRIPTION */}

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-400">
                        Course Description
                      </label>

                      <textarea
                        name="description"
                        value={
                          courseForm.description
                        }
                        onChange={
                          handleCourseChange
                        }
                        rows={3}
                        placeholder="Describe the course..."
                        className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>

                    {/* COURSE BUTTONS */}

                    <div className="flex flex-wrap justify-end gap-2">
                      {editingCourseIndex !==
                        null && (
                        <button
                          type="button"
                          onClick={
                            cancelCourseEdit
                          }
                          className="rounded-xl bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={
                          saveCourseToList
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:bg-cyan-400"
                      >
                        <Plus
                          size={15}
                        />

                        {editingCourseIndex !==
                        null
                          ? "Update Course"
                          : "Add Course"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ===========================================
                    COURSE LIST
                =========================================== */}

                <div className="mt-5">
                  {courses.length ===
                  0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-10 text-center">
                      <BookOpen
                        size={32}
                        className="mx-auto text-slate-700"
                      />

                      <p className="mt-3 text-sm font-bold text-slate-500">
                        No courses
                        added yet
                      </p>

                      <p className="mt-1 text-xs text-slate-700">
                        Add your courses
                        using the form
                        above.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {courses.map(
                        (
                          course,
                          index
                        ) => (
                          <div
                            key={
                              course.id ||
                              index
                            }
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                                  <BookOpen
                                    size={
                                      18
                                    }
                                    className="text-cyan-400"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <h4 className="text-base font-black text-white">
                                    {
                                      course.name
                                    }
                                  </h4>

                                  {course.duration && (
                                    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-cyan-400">
                                      <Clock3
                                        size={
                                          14
                                        }
                                      />

                                      {
                                        course.duration
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex shrink-0 gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    editCourse(
                                      index
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-cyan-400/10 hover:text-cyan-400"
                                  title="Edit course"
                                >
                                  <Pencil
                                    size={
                                      15
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteCourse(
                                      index
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                                  title="Delete course"
                                >
                                  <Trash2
                                    size={
                                      15
                                    }
                                  />
                                </button>
                              </div>
                            </div>

                            {course.description && (
                              <div className="mt-4 flex gap-2">
                                <FileText
                                  size={
                                    15
                                  }
                                  className="mt-1 shrink-0 text-slate-600"
                                />

                                <p className="text-sm leading-6 text-slate-500">
                                  {
                                    course.description
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* =============================================
                  ACTIVE FACULTY
              ============================================= */}

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
                <input
                  type="checkbox"
                  name="active"
                  checked={
                    form.active
                  }
                  onChange={
                    handleChange
                  }
                  className="h-4 w-4 accent-cyan-400"
                />

                <div>
                  <p className="text-sm font-bold text-white">
                    Active Faculty
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Make this faculty
                    available to
                    students.
                  </p>
                </div>
              </label>

              {/* =============================================
                  SAVE FACULTY
              ============================================= */}

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    saving
                  }
                  className="rounded-xl bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save
                      size={17}
                    />
                  )}

                  {editingFaculty
                    ? "Save Faculty & Courses"
                    : "Create Faculty & Courses"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManager;
