// src/pages/admin/lms/MonthlyQuizAdmin.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  ClipboardCheck,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  supabase,
} from "../../../lib/supabaseClient";

import AdminButton from "../../../components/admin/ui/AdminButton";


const MonthlyQuizAdmin = () => {

  const navigate = useNavigate();

  const { topicId } = useParams();


  /* ================= STATE ================= */

  const [quizzes, setQuizzes] = useState([]);

  const [topic, setTopic] = useState(null);

  const [loading, setLoading] = useState(true);



  /* ================= FETCH DATA ================= */

  const fetchData = async () => {

    if (!topicId) return;


    try {

      setLoading(true);



      // GET TOPIC

      const {
        data: topicData,
        error: topicError,
      } = await supabase

        .from("course_topics")

        .select(`
          id,
          title,
          course_id,
          courses(
            title
          )
        `)

        .eq("id", topicId)

        .single();



      if (topicError) throw topicError;


      setTopic(topicData);



      // GET QUIZZES FOR THIS TOPIC

      const {
        data,
        error,
      } = await supabase

        .from("monthly_quizzes")

        .select("*")

        .eq("topic_id", topicId)

        .order("created_at", {
          ascending:false,
        });



      if (error) throw error;


      setQuizzes(data || []);



    } catch(error) {


      console.error(
        "QUIZ FETCH ERROR:",
        error
      );


      alert(
        "Failed to load quizzes."
      );


    } finally {


      setLoading(false);


    }

  };



  useEffect(() => {

    fetchData();

  }, [topicId]);



  /* ================= DELETE ================= */


  const deleteQuiz = async(id)=>{


    if(
      !window.confirm(
        "Delete this quiz?"
      )
    ) return;



    const {
      error,
    } = await supabase

      .from("monthly_quizzes")

      .delete()

      .eq("id",id);



    if(error){

      alert(error.message);

      return;

    }



    setQuizzes(prev=>

      prev.filter(
        quiz=>quiz.id !== id
      )

    );


  };



  if(loading){

    return (

      <div className="flex min-h-[450px] items-center justify-center">

        <Loader2
          size={42}
          className="animate-spin text-blue-500"
        />

      </div>

    );

  }
    return (

    <div className="space-y-8 p-6 text-white">


      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">


        <div>

          <div className="flex items-center gap-3">

            <ClipboardCheck
              size={30}
              className="text-blue-400"
            />


            <h1 className="text-3xl font-bold">

              Monthly Quizzes

            </h1>


          </div>


          <p className="mt-3 text-slate-400">

            {topic?.courses?.title} • {topic?.title}

          </p>


        </div>



        <AdminButton

          icon={<Plus size={18}/>}

          onClick={() =>
            navigate(
              `/admin/lms/topic/${topicId}/quizzes/create`
            )
          }

        >

          Create Quiz

        </AdminButton>


      </div>





      {/* ================= TABLE ================= */}


      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">


        <table className="w-full text-left">


          <thead className="bg-slate-800 text-slate-300">

            <tr>

              <th className="px-6 py-4">
                Quiz
              </th>


              <th className="px-6 py-4">
                Month
              </th>


              <th className="px-6 py-4">
                Quiz Number
              </th>


              <th className="px-6 py-4">
                Duration
              </th>


              <th className="px-6 py-4">
                Passing Score
              </th>


              <th className="px-6 py-4 text-center">
                Actions
              </th>


            </tr>

          </thead>



          <tbody>


          {
            quizzes.length > 0 ? (

              quizzes.map((quiz)=>(


                <tr

                  key={quiz.id}

                  className="
                    border-t
                    border-slate-800
                    hover:bg-slate-800/40
                  "

                >


                  <td className="px-6 py-5">


                    <h3 className="font-semibold">

                      {quiz.title}

                    </h3>


                  </td>




                  <td className="px-6 py-5 text-slate-300">


                    {quiz.month || "-"}


                  </td>




                  <td className="px-6 py-5 text-slate-300">


                    Quiz {quiz.quiz_number || "-"}


                  </td>




                  <td className="px-6 py-5 text-slate-300">


                    {quiz.duration
                      ?
                      `${quiz.duration} mins`
                      :
                      "-"
                    }


                  </td>




                  <td className="px-6 py-5 text-green-400">


                    {quiz.passing_score || 0}%


                  </td>




                  <td className="px-6 py-5">


                    <div className="flex justify-center gap-3">


                      <button

                        onClick={() =>
                          navigate(
                            `/admin/lms/topic/${topicId}/quizzes/view/${quiz.id}`
                          )
                        }

                        className="text-blue-400 hover:text-blue-300"

                      >

                        <Eye size={18}/>

                      </button>




                      <button

                        onClick={() =>
                          navigate(
                            `/admin/lms/topic/${topicId}/quizzes/edit/${quiz.id}`
                          )
                        }

                        className="text-green-400 hover:text-green-300"

                      >

                        <Edit size={18}/>

                      </button>





                      <button

                        onClick={() =>
                          deleteQuiz(quiz.id)
                        }

                        className="text-red-400 hover:text-red-300"

                      >

                        <Trash2 size={18}/>

                      </button>



                    </div>


                  </td>



                </tr>


              ))


            ) : (


              <tr>

                <td
                  colSpan="6"
                  className="px-6 py-20 text-center"
                >

                  <ClipboardCheck
                    size={48}
                    className="mx-auto mb-4 text-slate-600"
                  />


                  <h3 className="text-xl font-semibold">

                    No Monthly Quiz Yet

                  </h3>


                  <p className="mt-2 text-slate-400">

                    Create the first quiz for this topic.

                  </p>



                  <div className="mt-6">


                    <AdminButton

                      icon={<Plus size={18}/>}

                      onClick={() =>
                        navigate(
                          `/admin/lms/topic/${topicId}/quizzes/create`
                        )
                      }

                    >

                      Create Quiz

                    </AdminButton>


                  </div>


                </td>

              </tr>


            )

          }


          </tbody>


        </table>


      </div>


    </div>

  );


};


export default MonthlyQuizAdmin;