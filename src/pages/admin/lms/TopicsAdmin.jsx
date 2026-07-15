import React, { useEffect, useState } from "react";
import {
  Plus,
  BookOpen,
  Edit,
  Trash2,
  FileText,
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



  const fetchCourse = async () => {

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();


    if (error) {
      console.error("Course fetch error:", error);
      return;
    }


    setCourse(data);

  };



  const fetchTopics = async () => {

    setLoading(true);


    const { data, error } = await supabase
      .from("course_topics")
      .select("*")
      .eq("course_id", courseId)
      .order("position", {
        ascending: true,
      });


    if (error) {
      console.error("Topics fetch error:", error);
      setLoading(false);
      return;
    }


    setTopics(data || []);

    setLoading(false);

  };



  useEffect(() => {

    if (!courseId) {
      console.error("Missing courseId");
      return;
    }


    fetchCourse();
    fetchTopics();


  }, [courseId]);




  const deleteTopic = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this learning unit?"
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

      <div className="
      flex flex-col gap-5
      lg:flex-row
      lg:items-center
      lg:justify-between
      ">


        <div>

          <h1 className="text-3xl font-bold text-white">

            {course?.title || "Course"} Topics

          </h1>


          <p className="mt-2 text-slate-400">

            Manage learning units and resources.

          </p>


        </div>



        <AdminButton

          onClick={() =>
            navigate(
              `/admin/lms/course/${courseId}/topics/create`
            )
          }

        >

          <Plus size={18} className="mr-2"/>

          Add Topic

        </AdminButton>


      </div>





      {/* CONTENT */}


      {loading ? (

        <div className="py-20 text-center text-slate-400">

          Loading topics...

        </div>


      ) : topics.length === 0 ? (


        <div className="
        rounded-3xl
        border border-slate-800
        bg-slate-900
        p-12
        text-center
        ">


          <BookOpen
            size={50}
            className="mx-auto text-slate-600"
          />


          <h2 className="
          mt-5
          text-xl
          font-bold
          text-white
          ">

            No Topics Yet

          </h2>


          <p className="mt-2 text-slate-400">

            Create your first learning unit.

          </p>


        </div>


      ) : (


        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">


          {topics.map((topic)=>(


            <div

              key={topic.id}

              className="
              rounded-3xl
              border border-slate-800
              bg-slate-900
              p-6
              "

            >


              <div className="flex items-center gap-4">


                <div className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-blue-500/20
                ">

                  <FileText
                    className="text-blue-400"
                  />

                </div>



                <div>

                  <h3 className="font-bold text-white">

                    {topic.title}

                  </h3>


                  <p className="text-sm text-slate-400">

                    Unit {topic.position}

                  </p>


                </div>


              </div>




              <p className="
              mt-4
              line-clamp-2
              text-sm
              text-slate-400
              ">

                {topic.description || "No description"}

              </p>





              <div className="mt-6 flex gap-3">


                {/* RESOURCES */}

                <button

                  onClick={() =>
                    navigate(
                      `/admin/lms/topic/${topic.id}/resources`
                    )
                  }

                  className="
                  rounded-xl
                  bg-blue-500/10
                  px-4 py-2
                  text-blue-400
                  "

                >

                  Resources

                </button>




                {/* EDIT */}

                <button

                  onClick={() => {
  console.log("TOPIC CLICKED:", topic.id);
  navigate(`/admin/lms/topic/${topic.id}/resources`);
}
                  }

                  className="
                  rounded-xl
                  bg-yellow-500/10
                  p-2
                  text-yellow-400
                  "

                >

                  <Edit size={17}/>

                </button>





                {/* DELETE */}

                <button

                  onClick={() =>
                    deleteTopic(topic.id)
                  }

                  className="
                  rounded-xl
                  bg-red-500/10
                  p-2
                  text-red-400
                  "

                >

                  <Trash2 size={17}/>

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