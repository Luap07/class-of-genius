import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Edit,
  Eye,
  BookOpen,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Layers,
  ClipboardList,
  ClipboardCheck,
  Grid2X2,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../../../lib/supabaseClient";

import StatCard from "../../../components/admin/cards/StatCard";
import CourseTable from "../../../components/admin/tables/CourseTable";
import AdminSearch from "../../../components/admin/ui/AdminSearch";
import AdminFilter from "../../../components/admin/ui/AdminFilter";

const CoursesAdmin = () => {

  const navigate = useNavigate();

  /* ================= STATE ================= */

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [status, setStatus] = useState("All");

  const [selectedCourses, setSelectedCourses] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const coursesPerPage = 10;



  /* ================= FETCH COURSES ================= */

  const fetchCourses = async () => {

    setLoading(true);

    const { data, error } = await supabase

      .from("courses")

      .select("*")

      .order("created_at", {

        ascending: false,

      });

    if (error) {

      console.error(error);

    } else {

      setCourses(data || []);

    }

    setLoading(false);

  };



  useEffect(() => {

    fetchCourses();

  }, []);




  /* ================= STATISTICS ================= */

  const stats = useMemo(() => ({

    totalCourses: courses.length,

    published: courses.filter(

      (course) => course.status === "Published"

    ).length,

    drafts: courses.filter(

      (course) => course.status === "Draft"

    ).length,

    students: 0,

  }), [courses]);




  /* ================= FILTER ================= */

  const filteredCourses = useMemo(() => {

    return courses.filter((course) => {

      const keyword = search.toLowerCase();

      const matchesSearch =

        course.title?.toLowerCase().includes(keyword) ||

        course.instructor?.toLowerCase().includes(keyword);

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




  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(

    filteredCourses.length /

    coursesPerPage

  );



  const paginatedCourses = filteredCourses.slice(

    (currentPage - 1) *

      coursesPerPage,

    currentPage *

      coursesPerPage

  );




  /* ================= ACTIONS ================= */

  const handleView = (course) => {

    navigate(

      `/admin/lms/view/${course.id}`

    );

  };



  const handleEdit = (course) => {

    navigate(

      `/admin/lms/edit/${course.id}`

    );

  };



  const handleDelete = async (course) => {

    const confirmDelete = window.confirm(

      `Delete "${course.title}"?`

    );

    if (!confirmDelete) return;

    const { error } = await supabase

      .from("courses")

      .delete()

      .eq("id", course.id);

    if (!error) {

      fetchCourses();

    }

  };



  const toggleSelect = (id) => {

    setSelectedCourses((prev) =>

      prev.includes(id)

        ? prev.filter(

            (item) => item !== id

          )

        : [...prev, id]

    );

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

          (course) => course.id

        )

      );

    }

  };



  if (loading) {

    return (

      <div className="flex min-h-[400px] items-center justify-center text-white">

        <Loader2

          size={40}

          className="animate-spin text-blue-500"

        />

      </div>

    );

  }



  return (

    <div className="space-y-6 p-6 text-white">
            {/* ================= STATISTICS ================= */}

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
          value={stats.students}
          icon={Users}
          color="purple"
        />

      </div>



      {/* ================= QUICK ACTIONS ================= */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Grid2X2
              size={24}
              className="text-blue-400"
            />

            <h2 className="text-2xl font-bold">

              LMS Quick Actions

            </h2>

          </div>

        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* Create Course */}

          <button

            onClick={() => navigate("/admin/lms/create")}

            className="
              rounded-2xl
              border
              border-slate-700
              bg-slate-950
              p-5
              text-left
              transition
              hover:border-blue-500
              hover:bg-slate-800
            "

          >

            <Plus
              size={32}
              className="mb-4 text-blue-400"
            />

            <h3 className="font-semibold">

              Create Course

            </h3>

            <p className="mt-2 text-sm text-slate-400">

              Add a new course.

            </p>

          </button>



          {/* Create Topic */}

          <button

            onClick={() => navigate("/admin/lms/topics/create")}

            className="
              rounded-2xl
              border
              border-slate-700
              bg-slate-950
              p-5
              text-left
              transition
              hover:border-green-500
              hover:bg-slate-800
            "

          >

            <Layers
              size={32}
              className="mb-4 text-green-400"
            />

            <h3 className="font-semibold">

              Create Topic

            </h3>

            <p className="mt-2 text-sm text-slate-400">

              Add topics to your courses.

            </p>

          </button>



          {/* Resources */}

          <button

            onClick={() => navigate("/admin/lms/topic/TOPIC_ID/resources")}

            className="
              rounded-2xl
              border
              border-slate-700
              bg-slate-950
              p-5
              text-left
              transition
              hover:border-yellow-500
              hover:bg-slate-800
            "

          >

            <FolderOpen
              size={32}
              className="mb-4 text-yellow-400"
            />

            <h3 className="font-semibold">

              Resources

            </h3>

            <p className="mt-2 text-sm text-slate-400">

              PDFs, Videos & Documents.

            </p>

          </button>



          {/* Weekly Tasks */}

          <button

            onClick={() => navigate("/admin/lms/tasks")}

            className="
              rounded-2xl
              border
              border-slate-700
              bg-slate-950
              p-5
              text-left
              transition
              hover:border-purple-500
              hover:bg-slate-800
            "

          >

            <ClipboardList
              size={32}
              className="mb-4 text-purple-400"
            />

            <h3 className="font-semibold">

              Weekly Tasks

            </h3>

            <p className="mt-2 text-sm text-slate-400">

              Manage assignments.

            </p>

          </button>



          {/* Monthly Quiz */}

          <button

            onClick={() => navigate("/admin/lms/monthly-quizzes")}

            className="
              rounded-2xl
              border
              border-slate-700
              bg-slate-950
              p-5
              text-left
              transition
              hover:border-pink-500
              hover:bg-slate-800
            "

          >

            <ClipboardCheck
              size={32}
              className="mb-4 text-pink-400"
            />

            <h3 className="font-semibold">

              Monthly Quiz

            </h3>

            <p className="mt-2 text-sm text-slate-400">

              Create monthly assessments.

            </p>

          </button>



          {/* Categories */}

          <button

            onClick={() => navigate("/admin/lms/categories")}

            className="
              rounded-2xl
              border
              border-slate-700
              bg-slate-950
              p-5
              text-left
              transition
              hover:border-cyan-500
              hover:bg-slate-800
            "

          >

            <BookOpen
              size={32}
              className="mb-4 text-cyan-400"
            />

            <h3 className="font-semibold">

              Categories

            </h3>

            <p className="mt-2 text-sm text-slate-400">

              Organize course categories.

            </p>

          </button>

        </div>

      </div>



      {/* ================= FILTERS ================= */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

        <div className="grid gap-5 lg:grid-cols-4">

          <div className="lg:col-span-2">

            <AdminSearch

              value={search}

              onChange={(e) => setSearch(e.target.value)}

              placeholder="Search courses..."

            />

          </div>

          <AdminFilter

            value={category}

            onChange={(e) => setCategory(e.target.value)}

            options={[
              "All",
              "Programming",
              "Science",
              "Mathematics",
              "AI",
              "Business",
              "Design",
              "Medicine",
            ]}

          />

          <AdminFilter

            value={status}

            onChange={(e) => setStatus(e.target.value)}

            options={[
              "All",
              "Published",
              "Draft",
            ]}

          />

        </div>

      </div>
            {/* ================= COURSE TABLE ================= */}

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



      {/* ================= PAGINATION ================= */}

      {filteredCourses.length > 0 && (

        <div className="flex items-center justify-between border-t border-slate-800 pt-6">

          <p className="text-sm text-slate-400">

            Showing page

            <span className="mx-2 font-bold text-white">

              {currentPage}

            </span>

            of

            <span className="mx-2 font-bold text-white">

              {totalPages}

            </span>

          </p>



          <div className="flex gap-3">

            <button

              disabled={currentPage === 1}

              onClick={() =>
                setCurrentPage((page) => page - 1)
              }

              className="
                rounded-xl
                border
                border-slate-700
                p-3
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "

            >

              <ChevronLeft size={18} />

            </button>



            <button

              disabled={currentPage === totalPages}

              onClick={() =>
                setCurrentPage((page) => page + 1)
              }

              className="
                rounded-xl
                border
                border-slate-700
                p-3
                transition
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "

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