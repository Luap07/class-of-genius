// src/pages/lms/Progress.jsx

import React from "react";

import {
  TrendingUp,
  BookOpen,
  Clock3,
  Target,
  Flame,
  Award,
} from "lucide-react";

import {
  useProgress
} from "../../context/LMSContext/ProgressContext";

import {
  useCourses
} from "../../context/LMSContext/CourseContext";

import {
  useAchievements
} from "../../context/LMSContext/AchievementContext";

import ProgressCard from "../../components/lms/ProgressCard";





const Progress = () => {


  const {

    progress,
    totalCompletedLessons

  } = useProgress();





  const {

    enrolledCourses,
    totalCourses

  } = useCourses();





  const {

    xp,
    level,
    streak,
    badges

  } = useAchievements();








  // Course progress data from context

  const progressData = enrolledCourses.map(
    (course) => {


      const courseProgress =
        progress[course.id] || {

          completedLessons: [],

          percentage: 0

        };



      return {

        id: course.id,

        title: course.title,

        instructor:
          course.instructor || "ClassOfGenius",


        progress:
          courseProgress.percentage,


        lessonsCompleted:
          courseProgress.completedLessons.length,


        totalLessons:
          course.lessons,


        hoursSpent:
          0,


        certificate:
          courseProgress.percentage === 100,


        color:
          "from-blue-600 to-cyan-500"

      };


    }
  );









  const stats = [

    {
      title: "Courses",

      value: totalCourses,

      icon: BookOpen,

      color: "text-blue-400",
    },


    {
      title: "Lessons Completed",

      value: totalCompletedLessons,

      icon: Clock3,

      color: "text-cyan-400",
    },


    {
      title: "XP Points",

      value: xp,

      icon: Target,

      color: "text-orange-400",
    },


    {
      title: "Study Streak",

      value: `${streak} Days`,

      icon: Flame,

      color: "text-red-400",
    },

  ];









  return (

    <div className="space-y-10">



      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold">

          Learning Progress

        </h1>


        <p className="text-slate-400 mt-2">

          Track your study performance and achievements.

        </p>


      </div>









      {/* Statistics */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">


        {stats.map((item)=>{


          const Icon = item.icon;


          return (

            <div

              key={item.title}

              className="rounded-3xl bg-slate-900 border border-slate-800 p-6"

            >

              <Icon

                size={36}

                className={item.color}

              />


              <h2 className="text-3xl font-bold mt-5">

                {item.value}

              </h2>


              <p className="text-slate-400 mt-2">

                {item.title}

              </p>


            </div>

          );


        })}


      </div>









      {/* Overall Progress */}

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">


        <div className="flex justify-between mb-5">


          <h2 className="text-2xl font-bold">

            Overall Completion

          </h2>



          <span className="text-3xl font-bold">

            {
              enrolledCourses.length > 0

              ?

              Math.round(

                progressData.reduce(

                  (total, course)=>

                    total + course.progress,


                  0

                )
                /
                enrolledCourses.length

              )

              :

              0

            }%

          </span>


        </div>





        <div className="h-5 rounded-full bg-slate-800 overflow-hidden">


          <div

            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"

            style={{

              width:

              `${
                enrolledCourses.length > 0

                ?

                Math.round(

                  progressData.reduce(

                    (total, course)=>

                    total + course.progress,


                    0

                  )
                  /
                  enrolledCourses.length

                )

                :

                0

              }%`

            }}

          />


        </div>


      </div>









      {/* Course Progress */}

      <div>


        <h2 className="text-3xl font-bold mb-6">

          Course Progress

        </h2>




        {progressData.length > 0 ? (


          <div className="grid lg:grid-cols-2 gap-8">


            {progressData.map((course)=>(


              <ProgressCard

                key={course.id}

                {...course}

              />


            ))}


          </div>


        ) : (


          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 text-center">


            <h3 className="text-2xl font-bold">

              No courses yet

            </h3>


            <p className="text-slate-400 mt-3">

              Enroll in a course to start tracking progress.

            </p>


          </div>


        )}



      </div>









      {/* Achievements */}

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">


        <div className="flex items-center gap-3 mb-8">


          <Award className="text-yellow-400"/>


          <h2 className="text-2xl font-bold">

            Achievements

          </h2>


        </div>





        <div className="grid md:grid-cols-2 gap-5">


          {

            badges.length > 0 ?


            badges.map((badge)=>(


              <div

                key={badge.id}

                className="rounded-2xl border border-slate-800 bg-slate-950 p-5 flex items-center gap-3"

              >


                <TrendingUp className="text-green-400"/>


                <div>


                  <h3 className="font-bold">

                    {badge.title}

                  </h3>


                  <p className="text-slate-400 text-sm">

                    {badge.description}

                  </p>


                </div>


              </div>


            ))

            :

            <p className="text-slate-400">

              Complete lessons and courses to unlock achievements.

            </p>

          }


        </div>


      </div>








      {/* Level */}

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">


        <h2 className="text-2xl font-bold">

          Current Level

        </h2>


        <p className="text-4xl font-bold mt-3">

          Level {level}

        </p>


      </div>



    </div>

  );

};



export default Progress;