// src/pages/admin/lms/CoursesAdmin.jsx

import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
  BookOpen,
  Users,
  Star,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatCard from "../../../components/admin/cards/StatCard";
import CourseTable from "../../../components/admin/tables/CourseTable";
import AdminButton from "../../../components/admin/ui/AdminButton";
import AdminSearch from "../../../components/admin/ui/AdminSearch";
import AdminFilter from "../../../components/admin/ui/AdminFilter";

const demoCourses = [
  {
    id: 1,
    thumbnail: "https://picsum.photos/120/80?1",
    title: "Complete React Development",
    instructor: "John Doe",
    category: "Web Development",
    level: "Intermediate",
    students: 2450,
    lessons: 48,
    rating: 4.9,
    price: 49,
    status: "Published",
    featured: true,
    createdAt: "2026-07-01",
  },
  {
    id: 2,
    thumbnail: "https://picsum.photos/120/80?2",
    title: "Python for Beginners",
    instructor: "Sarah Wilson",
    category: "Programming",
    level: "Beginner",
    students: 1932,
    lessons: 60,
    rating: 4.8,
    price: 39,
    status: "Draft",
    featured: false,
    createdAt: "2026-06-20",
  },
  {
    id: 3,
    thumbnail: "https://picsum.photos/120/80?3",
    title: "Artificial Intelligence",
    instructor: "Michael Lee",
    category: "AI",
    level: "Advanced",
    students: 811,
    lessons: 72,
    rating: 5.0,
    price: 120,
    status: "Published",
    featured: true,
    createdAt: "2026-05-18",
  },
];

const CoursesAdmin = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState(demoCourses);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [status, setStatus] = useState("All");

  const [selectedCourses, setSelectedCourses] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const coursesPerPage = 10;

  /* ===========================
      Dashboard Statistics
  =========================== */

  const stats = useMemo(() => {
    return {
      totalCourses: courses.length,

      published: courses.filter(
        (c) => c.status === "Published"
      ).length,

      drafts: courses.filter(
        (c) => c.status === "Draft"
      ).length,

      students: courses.reduce(
        (sum, c) => sum + c.students,
        0
      ),
    };
  }, [courses]);

  /* ===========================
      Categories
  =========================== */

  const categories = [
    "All",
    "Programming",
    "Web Development",
    "AI",
    "Business",
    "Medicine",
    "Design",
  ];

  /* ===========================
      Filter
  =========================== */

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        course.instructor
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        course.category === category;

      const matchesStatus =
        status === "All" ||
        course.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    courses,
    search,
    category,
    status,
  ]);

  /* ===========================
      Pagination
  =========================== */

  const totalPages = Math.ceil(
    filteredCourses.length / coursesPerPage
  );

  const paginatedCourses =
    filteredCourses.slice(
      (currentPage - 1) * coursesPerPage,
      currentPage * coursesPerPage
    );

  /* ===========================
      Actions
  =========================== */

  const handleCreateCourse = () => {
    navigate("/admin/lms/create");
  };

  const handleEdit = (course) => {
    navigate(`/admin/lms/edit/${course.id}`);
  };

  const handleView = (course) => {
    console.log(course);
  };

  const handleDelete = (course) => {
    if (
      window.confirm(
        `Delete "${course.title}"?`
      )
    ) {
      setCourses((prev) =>
        prev.filter(
          (c) => c.id !== course.id
        )
      );
    }
  };

  const toggleSelect = (id) => {
    if (selectedCourses.includes(id)) {
      setSelectedCourses(
        selectedCourses.filter(
          (item) => item !== id
        )
      );
    } else {
      setSelectedCourses([
        ...selectedCourses,
        id,
      ]);
    }
  };

  const toggleSelectAll = () => {
    if (
      selectedCourses.length ===
      paginatedCourses.length
    ) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(
        paginatedCourses.map(
          (c) => c.id
        )
      );
    }
  };

  const bulkDelete = () => {
    if (
      selectedCourses.length === 0
    )
      return;

    if (
      window.confirm(
        `Delete ${selectedCourses.length} selected course(s)?`
      )
    ) {
      setCourses(
        courses.filter(
          (c) =>
            !selectedCourses.includes(c.id)
        )
      );

      setSelectedCourses([]);
    }
  };
    return (
    <div className="space-y-8">

      {/* ==========================================
          Header
      ========================================== */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-white">
            Courses Management
          </h1>

          <p className="mt-2 text-slate-400">
            Create, edit, organize and manage every course on Scholiqen.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <AdminButton
            variant="secondary"
            icon={<Download size={18} />}
            onClick={() => console.log("Export")}
          >
            Export
          </AdminButton>

          <AdminButton
            variant="danger"
            disabled={selectedCourses.length === 0}
            icon={<Trash2 size={18} />}
            onClick={bulkDelete}
          >
            Delete ({selectedCourses.length})
          </AdminButton>

          <AdminButton
            icon={<Plus size={18} />}
            onClick={handleCreateCourse}
          >
            Create Course
          </AdminButton>

        </div>

      </div>

      {/* ==========================================
          Statistics
      ========================================== */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

       <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          color="blue"
      />

        <StatCard
          title="Published"
          value={stats.published}
          icon={Eye}
          color="green"
          />

        <StatCard
          title="Draft Courses"
          value={stats.drafts}
          icon={Edit}
          color="amber"
          />

        <StatCard
        title="Students"
        value={stats.students.toLocaleString()}
        icon={Users}
        color="purple"
        />
      </div>

      {/* ==========================================
          Search & Filters
      ========================================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

        <div className="grid gap-5 lg:grid-cols-4">

          <div className="lg:col-span-2">

            <AdminSearch
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search courses or instructors..."
            />

          </div>

          <AdminFilter
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            options={categories}
          />

          <AdminFilter
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            options={[
              "All",
              "Published",
              "Draft",
            ]}
          />
        </div>
      </div>
      {/* ==========================================Results Header========================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Courses
          </h2>

          <p className="text-sm text-slate-400">

            Showing{" "}
            <span className="font-semibold text-white">
              {paginatedCourses.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {filteredCourses.length}
            </span>{" "}
            courses

          </p>

        </div>

      </div>
            {/* ==========================================
          Course Table
      ========================================== */}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

        <CourseTable
          courses={paginatedCourses}
          selectedCourses={selectedCourses}
          onSelect={toggleSelect}
          onSelectAll={toggleSelectAll}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

      </div>

      {/* ==========================================
          Empty State
      ========================================== */}

      {filteredCourses.length === 0 && (

        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 py-20 text-center">

          <BookOpen
            size={70}
            className="mx-auto text-slate-600"
          />

          <h2 className="mt-6 text-2xl font-bold">

            No Courses Found

          </h2>

          <p className="mt-3 text-slate-400">

            Try changing your search keywords or filters.

          </p>

          <div className="mt-8">

            <AdminButton
              icon={<Plus size={18} />}
              onClick={handleCreateCourse}
            >
              Create First Course
            </AdminButton>

          </div>

        </div>

      )}

      {/* ==========================================
          Pagination
      ========================================== */}

      {filteredCourses.length > 0 && (

        <div className="flex flex-col gap-5 border-t border-slate-800 pt-6 lg:flex-row lg:items-center lg:justify-between">

          <p className="text-sm text-slate-400">

            Page{" "}
            <span className="font-semibold text-white">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {totalPages}
            </span>

          </p>

          <div className="flex items-center gap-3">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => prev - 1)
              }
              className="rounded-xl border border-slate-700 p-3 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >

              <ChevronLeft size={18} />

            </button>

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) => (

                <button
                  key={index}
                  onClick={() =>
                    setCurrentPage(index + 1)
                  }
                  className={`h-11 w-11 rounded-xl font-semibold transition ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "border border-slate-700 hover:bg-slate-800"
                  }`}
                >

                  {index + 1}

                </button>

              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
              className="rounded-xl border border-slate-700 p-3 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >

              <ChevronRight size={18} />

            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default CoursesAdmin;