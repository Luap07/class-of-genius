import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";


import {
  ArrowLeft,
  Loader2,
  BookOpen,
  PlayCircle,
  ClipboardList,
  ClipboardCheck,
} from "lucide-react";


import {
  supabase,
} from "../../lib/supabaseClient";


import StudyResources from "../../components/courses/StudyResources";



const TopicDetails = () => {


  const navigate = useNavigate();


  const {
    courseId,
    topicId,
  } = useParams();



  /*
  ====================================
  STATE
  ====================================
  */


  const [loading,setLoading] = useState(true);


  const [topic,setTopic] = useState(null);


  const [resources,setResources] = useState([]);


  const [weeklyTasks,setWeeklyTasks] = useState([]);


  const [monthlyQuizzes,setMonthlyQuizzes] = useState([]);





  /*
  ====================================
  FETCH TOPIC DATA
  ====================================
  */


  useEffect(()=>{

    if(topicId){

      fetchTopic();

    }

  },[topicId]);





  const fetchTopic = async()=>{


    try{


      setLoading(true);



      /*
      ================================
      TOPIC
      ================================
      */


      const {
        data:topicData,
        error:topicError,

      } = await supabase


      .from("course_topics")


      .select(`

        *,

        courses(
          id,
          title
        )

      `)


      .eq(
        "id",
        topicId
      )


      .single();



      if(topicError)

        throw topicError;



      setTopic(topicData);





      /*
      ================================
      VIDEO RESOURCES ONLY
      ================================
      */


      const {
        data:resourceData,
        error:resourceError,

      } = await supabase


      .from("resources")


      .select("*")


      .eq(
        "topic_id",
        topicId
      )


      .in(
        "resource_type",
        [
          "video",
          "youtube"
        ]
      )


      .order(
        "created_at",
        {
          ascending:true
        }
      );



      if(resourceError)

        throw resourceError;



      setResources(
        resourceData || []
      );





      /*
      ================================
      WEEKLY TASKS
      ================================
      */


      const {
        data:taskData,
        error:taskError,

      } = await supabase


      .from("weekly_tasks")


      .select("*")


      .eq(
        "topic_id",
        topicId
      )


      .order(
        "week",
        {
          ascending:true
        }
      );



      if(taskError)

        throw taskError;



      setWeeklyTasks(
        taskData || []
      );





      /*
      ================================
      MONTHLY QUIZZES
      ================================
      */


      const {
        data:quizData,
        error:quizError,

      } = await supabase


      .from("monthly_quizzes")


      .select("*")


      .eq(
        "topic_id",
        topicId
      )


      .order(
        "quiz_number",
        {
          ascending:true
        }
      );



      if(quizError)

        throw quizError;



      setMonthlyQuizzes(
        quizData || []
      );



    }

    catch(error){


      console.error(
        "TOPIC FETCH ERROR:",
        error
      );


    }

    finally{


      setLoading(false);


    }


  };





  /*
  ====================================
  LOADING
  ====================================
  */


  if(loading){


    return (

      <div className="
        flex
        min-h-screen
        items-center
        justify-center
      ">


        <Loader2

          size={50}

          className="
            animate-spin
            text-cyan-400
          "

        />


      </div>

    );


  }






  /*
  ====================================
  NOT FOUND
  ====================================
  */


  if(!topic){


    return (

      <div className="
        flex
        min-h-screen
        items-center
        justify-center
      ">


        <div className="text-center">


          <BookOpen

            size={70}

            className="
              mx-auto
              text-slate-600
            "

          />



          <h2 className="
            mt-5
            text-3xl
            font-bold
            text-white
          ">

            Topic Not Found

          </h2>



          <button

            onClick={()=>navigate(-1)}

            className="
              mt-6
              rounded-xl
              bg-blue-600
              px-6
              py-3
              text-white
            "

          >

            Go Back

          </button>



        </div>


      </div>

    );


  }
    return (

    <motion.div

      initial={{
        opacity:0,
        y:20,
      }}

      animate={{
        opacity:1,
        y:0,
      }}

      transition={{
        duration:0.4,
      }}

      className="
        mx-auto
        max-w-7xl
        space-y-10
        px-6
        py-10
      "

    >



      {/* ====================================
          HERO SECTION
      ==================================== */}


      <div className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
      ">


        <div className="
          border-b
          border-slate-800
          bg-gradient-to-r
          from-blue-600/20
          to-cyan-500/10
          p-8
        ">


          <button

            onClick={()=>navigate(`/courses/${courseId}`)}

            className="
              mb-8
              flex
              items-center
              gap-2
              text-slate-400
              transition
              hover:text-white
            "

          >

            <ArrowLeft size={18}/>

            Back To Course

          </button>




          <h1 className="
            text-4xl
            font-black
            text-white
          ">

            {topic.title}

          </h1>




          <p className="
            mt-5
            max-w-4xl
            text-slate-400
          ">

            {
              topic.description ||
              "No description available."
            }

          </p>



        </div>





        {/* STATS */}

        <div className="
          grid
          gap-6
          p-8
          md:grid-cols-3
        ">


          <div className="
            rounded-2xl
            border
            border-cyan-500/20
            bg-slate-950
            p-6
          ">


            <PlayCircle

              className="
                mb-4
                text-cyan-400
              "

            />



            <h3 className="
              text-lg
              font-semibold
              text-white
            ">

              Videos

            </h3>




            <p className="
              mt-2
              text-3xl
              font-bold
              text-cyan-400
            ">

              {resources.length}

            </p>


          </div>






          <div className="
            rounded-2xl
            border
            border-green-500/20
            bg-slate-950
            p-6
          ">


            <ClipboardList

              className="
                mb-4
                text-green-400
              "

            />



            <h3 className="
              text-lg
              font-semibold
              text-white
            ">

              Weekly Tasks

            </h3>




            <p className="
              mt-2
              text-3xl
              font-bold
              text-green-400
            ">

              {weeklyTasks.length}

            </p>



          </div>








          <div className="
            rounded-2xl
            border
            border-purple-500/20
            bg-slate-950
            p-6
          ">



            <ClipboardCheck

              className="
                mb-4
                text-purple-400
              "

            />



            <h3 className="
              text-lg
              font-semibold
              text-white
            ">

              Monthly Quizzes

            </h3>




            <p className="
              mt-2
              text-3xl
              font-bold
              text-purple-400
            ">

              {monthlyQuizzes.length}

            </p>



          </div>



        </div>


      </div>







      {/* ====================================
          VIDEO RESOURCES FROM SUPABASE
      ==================================== */}



      <section className="
        space-y-6
      ">


        <div className="
          flex
          items-center
          gap-3
        ">


          <PlayCircle

            size={30}

            className="
              text-cyan-400
            "

          />



          <h2 className="
            text-3xl
            font-bold
            text-white
          ">

            Video Lessons

          </h2>


        </div>






        <StudyResources

          resources={resources}

        />



      </section>









      {/* ====================================
          WEEKLY TASKS
      ==================================== */}



      <section className="
        space-y-6
      ">


        <div className="
          flex
          items-center
          gap-3
        ">


          <ClipboardList

            size={30}

            className="
              text-green-400
            "

          />



          <h2 className="
            text-3xl
            font-bold
            text-white
          ">

            Weekly Tasks

          </h2>


        </div>






        {

          weeklyTasks.length > 0 ? (


            <div className="
              grid
              gap-6
              md:grid-cols-2
            ">


              {

                weeklyTasks.map((task)=>(


                  <motion.div


                    key={task.id}


                    whileHover={{
                      y:-5
                    }}


                    className="
                      rounded-3xl
                      border
                      border-slate-800
                      bg-slate-900
                      p-6
                    "


                  >



                    <h3 className="
                      text-xl
                      font-bold
                      text-white
                    ">

                      {task.title}

                    </h3>




                    <p className="
                      mt-3
                      text-slate-400
                    ">

                      {
                        task.description ||
                        "No description available."
                      }

                    </p>




                    <div className="
                      mt-5
                      rounded-xl
                      bg-slate-950
                      px-4
                      py-3
                      text-green-400
                    ">

                      Week {task.week}

                    </div>




                  </motion.div>


                ))

              }


            </div>


          )

          :


          <div className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-900
            p-12
            text-center
          ">


            <ClipboardList

              size={60}

              className="
                mx-auto
                text-slate-600
              "

            />



            <h3 className="
              mt-5
              text-xl
              font-bold
              text-white
            ">

              No Weekly Tasks

            </h3>



            <p className="
              mt-3
              text-slate-400
            ">

              No assignments have been added yet.

            </p>



          </div>


        }



      </section>
            {/* ====================================
          MONTHLY QUIZZES
      ==================================== */}


      <section className="
        space-y-6
      ">


        <div className="
          flex
          items-center
          gap-3
        ">


          <ClipboardCheck

            size={30}

            className="
              text-purple-400
            "

          />



          <h2 className="
            text-3xl
            font-bold
            text-white
          ">

            Monthly Quizzes

          </h2>


        </div>







        {

          monthlyQuizzes.length > 0 ? (


            <div className="
              grid
              gap-6
              md:grid-cols-2
            ">



              {

                monthlyQuizzes.map((quiz)=>(


                  <motion.div


                    key={quiz.id}


                    whileHover={{
                      y:-5
                    }}


                    className="
                      rounded-3xl
                      border
                      border-slate-800
                      bg-slate-900
                      p-6
                    "


                  >





                    <div className="
                      flex
                      items-start
                      justify-between
                    ">



                      <h3 className="
                        text-xl
                        font-bold
                        text-white
                      ">

                        {quiz.title}

                      </h3>






                      <span className="
                        rounded-xl
                        bg-purple-500/10
                        px-3
                        py-2
                        text-sm
                        text-purple-400
                      ">

                        Quiz {quiz.quiz_number}

                      </span>



                    </div>







                    <p className="
                      mt-4
                      text-slate-400
                    ">

                      {
                        quiz.description ||
                        "No description available."
                      }

                    </p>









                    <div className="
                      mt-6
                      grid
                      grid-cols-2
                      gap-4
                    ">


                      <div className="
                        rounded-xl
                        bg-slate-950
                        p-4
                      ">


                        <p className="
                          text-xs
                          uppercase
                          text-slate-500
                        ">

                          Duration

                        </p>

                        <p className="
                          mt-2
                          font-bold
                          text-white
                        ">

                          {
                            quiz.duration || 0
                          }
                          mins

                        </p>

                      </div>

                      <div className="
                        rounded-xl
                        bg-slate-950
                        p-4
                      ">

                        <p className="
                          text-xs
                          uppercase
                          text-slate-500
                        ">

                          Pass Score

                        </p>





                        <p className="
                          mt-2
                          font-bold
                          text-green-400
                        ">

                          {
                            quiz.passing_score || 0
                          }%

                        </p>
                      </div>

                   </div>
                    <button
                      onClick={()=>navigate(`/quiz/${quiz.id}`)}
                      className="
                        mt-6
                        w-full
                        rounded-xl
                        bg-purple-600
                        py-3
                        font-bold
                        text-white
                        transition
                        hover:bg-purple-500
                      "


                    >

                      Start Quiz

                    </button>
                  </motion.div>
                ))

              }

            </div>
          )
          :

          <div className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-900
            p-12
            text-center
          ">
            <ClipboardCheck

              size={60}

              className="
                mx-auto
                text-slate-600
              "

            />

            <h3 className="
              mt-5
              text-xl
              font-bold
              text-white
            ">

              No Monthly Quizzes

            </h3>
            <p className="
              mt-3
              text-slate-400
            ">

              Instructor quizzes will appear here.

            </p>

          </div>

        }

      </section>

    </motion.div>
  );

};

export default TopicDetails;