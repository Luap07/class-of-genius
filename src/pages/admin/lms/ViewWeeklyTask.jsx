// src/pages/admin/lms/ViewWeeklyTask.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Loader2,
  ClipboardList,
  CalendarDays,
  Clock,
  Trophy,
  Target,
  CheckCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  supabase,
} from "../../../lib/supabaseClient";


const ViewWeeklyTask = () => {

  const navigate = useNavigate();

  const {
    topicId,
    id,
  } = useParams();


  const [task,setTask] = useState(null);

  const [loading,setLoading] = useState(true);



  /* ================= FETCH TASK ================= */

  const fetchTask = async()=>{

    try{

      setLoading(true);


      const {
        data,
        error,
      } = await supabase

        .from("weekly_tasks")

        .select(`
          *,
          courses(
            title
          ),
          course_topics(
            title
          )
        `)

        .eq("id",id)

        .single();



      if(error) throw error;


      setTask(data);



    }catch(error){

      console.error(
        "VIEW WEEKLY TASK ERROR:",
        error
      );


      alert(
        error.message
      );


    }finally{

      setLoading(false);

    }

  };



  useEffect(()=>{

    fetchTask();

  },[id]);




  if(loading){

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



  if(!task){

    return (

      <div className="p-6 text-white">

        Task not found.

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

            <ClipboardList

              size={32}

              className="
                text-blue-400
              "

            />


            <h1 className="
              text-3xl
              font-bold
            ">

              {task.title}

            </h1>


          </div>



          <p className="
            mt-3
            text-slate-400
          ">

            {task.courses?.title || "No Course"}

            {" • "}

            {task.course_topics?.title || "No Topic"}

          </p>


        </div>




        <button

          onClick={()=>navigate(
            `/admin/lms/topic/${topicId}/tasks`
          )}

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





      {/* STATS */}


      <div className="
        grid
        gap-6
        md:grid-cols-2
        lg:grid-cols-5
      ">


        <InfoCard

          icon={<CalendarDays size={22}/>}

          title="Week"

          value={
            `Week ${task.week || "-"}`
          }

        />



        <InfoCard

          icon={<Clock size={22}/>}

          title="Estimated Time"

          value={
            task.estimated_time
            ?
            `${task.estimated_time} mins`
            :
            "-"
          }

        />



        <InfoCard

          icon={<Trophy size={22}/>}

          title="XP"

          value={
            `${task.xp || 0} XP`
          }

        />



        <InfoCard

          icon={<Target size={22}/>}

          title="Difficulty"

          value={
            task.difficulty || "-"
          }

        />



        <InfoCard

          icon={<CheckCircle size={22}/>}

          title="Completed"

          value={
            task.completed
            ?
            "Yes"
            :
            "No"
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

          Task Details

        </h2>



        <div className="
          space-y-5
          text-slate-300
        ">


          <div>

            <span className="text-slate-500">
              Priority:
            </span>

            {" "}

            {task.priority || "-"}

          </div>




          <div>

            <span className="text-slate-500">
              Due Date:
            </span>

            {" "}

            {
              task.due_date
              ?
              new Date(
                task.due_date
              ).toLocaleDateString()
              :
              "-"
            }

          </div>




          <div>

            <span className="text-slate-500">
              Description:
            </span>


            <p className="
              mt-2
              text-slate-300
            ">

              {
                task.description ||
                "No description added."
              }

            </p>


          </div>



          {
            task.file_url && (

              <a

                href={task.file_url}

                target="_blank"

                rel="noreferrer"

                className="
                  inline-flex
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-3
                  text-white
                  hover:bg-blue-500
                "

              >

                Open Task File

              </a>

            )
          }



        </div>


      </div>


    </div>

  );

};




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



export default ViewWeeklyTask;