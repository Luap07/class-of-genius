import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  FileText,
  ListChecks,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const TopicsAdmin = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH COURSE ================= */

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) {
      console.error("Course error:", error);
      return;
    }

    setCourse(data);
  };


  /* ================= FETCH TOPICS ================= */

  const fetchTopics = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("course_topics")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Topics error:", error);
    }

    setTopics(data || []);
    setLoading(false);
  };


  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchTopics();
    }
  }, [courseId]);


  /* ================= SEARCH ================= */

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) =>
      topic.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [topics, search]);


  /* ================= DELETE ================= */

  const deleteTopic = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this topic?"
    );

    if (!confirmDelete) return;


    const { error } = await supabase
      .from("course_topics")
      .delete()
      .eq("id", id);


    if (error) {
      alert(error.message);
      return;
    }


    fetchTopics();
  };


  return (
    <div className="space-y-8 p-6">


      {/* HEADER */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-white">
            {course?.title || "Course"} Topics
          </h1>

          <p className="mt-2 text-slate-400">
            Manage learning units, resources and tasks.
          </p>
        </div>


        <AdminButton
          icon={<Plus size={18}/>}
          onClick={() =>
            navigate(
              `/admin/lms/course/${courseId}/topics/create`
            )
          }
        >
          Add Topic
        </AdminButton>

      </div>



      {/* SEARCH */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

        <div className="relative">

          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Search topics..."
            className="
            w-full rounded-xl 
            border border-slate-700
            bg-slate-950
            py-3 pl-12 pr-4
            text-white
            outline-none
            focus:border-blue-500
            "
          />

        </div>

      </div>




      {/* CONTENT */}

      {loading ? (

        <div className="text-center py-20 text-slate-400">
          Loading topics...
        </div>

      ) : filteredTopics.length === 0 ? (

        <div className="
        rounded-3xl
        border border-slate-800
        bg-slate-900
        p-12
        text-center
        ">

          <BookOpen
            size={50}
            className="mx-auto mb-4 text-slate-600"
          />

          <h3 className="text-xl font-bold text-white">
            No Topics Yet
          </h3>

          <p className="text-slate-400 mt-2">
            Create your first learning topic.
          </p>

        </div>


      ) : (


        <div className="
        grid gap-6
        md:grid-cols-2
        xl:grid-cols-3
        ">


        {filteredTopics.map((topic)=>(

          <div
          key={topic.id}
          className="
          rounded-3xl
          border border-slate-800
          bg-slate-900
          p-6
          hover:border-blue-500/50
          transition
          "
          >


            <div className="flex items-center justify-between">

              <BookOpen
                size={40}
                className="text-blue-400"
              />


            </div>


            <h3 className="
            mt-5
            text-xl
            font-bold
            text-white
            ">
              {topic.title}
            </h3>


            <p className="
            mt-2
            text-sm
            text-slate-400
            line-clamp-3
            ">
              {topic.description || "No description"}
            </p>



            <div className="mt-6 flex flex-wrap gap-3">


              {/* Resources */}

              <button
              onClick={() =>
                navigate(
                  `/admin/lms/topic/${topic.id}/resources`
                )
              }
              className="
              rounded-lg
              bg-blue-500/10
              p-2
              text-blue-400
              "
              title="Resources"
              >

                <FileText size={18}/>

              </button>



              {/* Tasks */}

              <button
              onClick={() =>
                navigate(
                  `/admin/lms/topic/${topic.id}/tasks`
                )
              }
              className="
              rounded-lg
              bg-purple-500/10
              p-2
              text-purple-400
              "
              title="Tasks"
              >

                <ListChecks size={18}/>

              </button>




              {/* Edit */}

              <button
              onClick={() =>
                navigate(
                  `/admin/lms/course/${courseId}/topics/edit/${topic.id}`
                )
              }
              className="
              rounded-lg
              bg-green-500/10
              p-2
              text-green-400
              "
              >

                <Edit size={18}/>

              </button>




              {/* Delete */}

              <button
              onClick={() => deleteTopic(topic.id)}
              className="
              rounded-lg
              bg-red-500/10
              p-2
              text-red-400
              "
              >

                <Trash2 size={18}/>

              </button>


            </div>


          </div>


        ))}


        </div>


      )}


    </div>
  );
};


export default TopicsAdmin;