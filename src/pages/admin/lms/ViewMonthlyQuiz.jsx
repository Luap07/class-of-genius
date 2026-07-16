import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Loader2,
  ClipboardCheck,
  Clock,
  Target,
  CalendarDays,
  Hash,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  supabase,
} from "../../../lib/supabaseClient";


const ViewMonthlyQuiz = () => {

  const navigate = useNavigate();

  const {
    topicId,
    id,
  } = useParams();


  const [quiz, setQuiz] = useState(null);

  const [loading, setLoading] = useState(true);



  /* ================= FETCH QUIZ ================= */

  const fetchQuiz = async () => {

    try {

      setLoading(true);


      const {
        data,
        error,
      } = await supabase

        .from("monthly_quizzes")

        .select(`
          *,
          courses(
            title
          ),
          course_topics(
            title
          )
        `)

        .eq("id", id)

        .single();



      if (error) throw error;


      setQuiz(data);



    } catch (error) {


      console.error(
        "VIEW MONTHLY QUIZ ERROR:",
        error
      );


      alert(
        error.message
      );


    } finally {


      setLoading(false);


    }

  };



  useEffect(() => {

    fetchQuiz();

  }, [id]);




  /* ================= LOADING ================= */


  if (loading) {

    return (

      <div className="
        flex
        min-h-[450px]
        items-center
        justify-center
      ">

        <Loader2

          size={42}

          className="
            animate-spin
            text-blue-500
          "

        />

      </div>

    );

  }



  if (!quiz) {

    return (

      <div className="
        p-6
        text-white
      ">

        Quiz not found.

      </div>

    );

  }





  return (

    <div className="
      space-y-8
      p-6
      text-white
    ">



      {/* HEADER */}

      <div className="
        flex
        flex-col
        gap-5
        lg:flex-row
        lg:items-center
        lg:justify-between
      ">


        <div>


          <div className="
            flex
            items-center
            gap-3
          ">


            <ClipboardCheck

              size={32}

              className="
                text-blue-400
              "

            />


            <h1 className="
              text-3xl
              font-bold
            ">

              {quiz.title}

            </h1>


          </div>



          <p className="
            mt-3
            text-slate-400
          ">

            {quiz.courses?.title || "No Course"}

            {" • "}

            {quiz.course_topics?.title || "No Topic"}

          </p>


        </div>




        <button

          onClick={() =>
            navigate(
              `/admin/lms/topic/${topicId}/quizzes`
            )
          }

          className="
            flex
            items-center
            rounded-xl
            border
            border-slate-700
            bg-slate-900
            px-5
            py-3
            text-slate-300
            hover:bg-slate-800
          "

        >

          <ArrowLeft

            size={18}

            className="mr-2"

          />

          Back

        </button>


      </div>





      {/* QUIZ INFO CARDS */}


      <div className="
        grid
        gap-6
        md:grid-cols-2
        lg:grid-cols-4
      ">


        <InfoCard

          icon={<CalendarDays size={22}/>}

          title="Month"

          value={
            quiz.month || "-"
          }

        />



        <InfoCard

          icon={<Hash size={22}/>}

          title="Quiz Number"

          value={
            `Quiz ${quiz.quiz_number || "-"}`
          }

        />



        <InfoCard

          icon={<Clock size={22}/>}

          title="Duration"

          value={
            quiz.duration
            ?
            `${quiz.duration} minutes`
            :
            "-"
          }

        />



        <InfoCard

          icon={<Target size={22}/>}

          title="Passing Score"

          value={
            `${quiz.passing_score || 0}%`
          }

        />


      </div>






      {/* DETAILS */}


      <div className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-8
      ">


        <h2 className="
          mb-5
          text-xl
          font-bold
        ">

          Quiz Details

        </h2>



        <div className="
          space-y-4
          text-slate-300
        ">


          <div>

            <span className="
              text-slate-500
            ">

              Created:

            </span>


            {" "}

            {
              quiz.created_at
              ?
              new Date(
                quiz.created_at
              ).toLocaleDateString()
              :
              "-"
            }


          </div>




          <div>

            <span className="
              text-slate-500
            ">

              Status:

            </span>


            {" "}

            <span className="
              rounded-full
              bg-green-500/10
              px-3
              py-1
              text-sm
              text-green-400
            ">

              {quiz.status || "Draft"}

            </span>


          </div>



          <div>

            <span className="
              text-slate-500
            ">

              Description:

            </span>


            <p className="
              mt-2
              text-slate-300
            ">

              {quiz.description || "No description added."}

            </p>


          </div>


        </div>


      </div>



    </div>

  );

};




/* ================= CARD COMPONENT ================= */


const InfoCard = ({
  icon,
  title,
  value,
}) => {

  return (

    <div className="
      rounded-3xl
      border
      border-slate-800
      bg-slate-900
      p-6
    ">


      <div className="
        mb-4
        text-blue-400
      ">

        {icon}

      </div>


      <p className="
        text-sm
        text-slate-400
      ">

        {title}

      </p>


      <h3 className="
        mt-2
        text-xl
        font-bold
      ">

        {value}

      </h3>


    </div>

  );

};


export default ViewMonthlyQuiz;