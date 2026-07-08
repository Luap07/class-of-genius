import React from "react";
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
} from "lucide-react";


const courseStats = [
  {
    title:"Total Courses",
    value:"320",
    icon:BookOpen,
  },
  {
    title:"Total Enrollments",
    value:"85,420",
    icon:Users,
  },
  {
    title:"Completion Rate",
    value:"78%",
    icon:Award,
  },
  {
    title:"Average Study Time",
    value:"4.2 hrs",
    icon:Clock,
  },
];



const popularCourses = [
  {
    name:"Advanced Mathematics",
    students:"12,540",
    completion:"92%",
    rating:"4.9",
  },
  {
    name:"Physics Masterclass",
    students:"10,230",
    completion:"85%",
    rating:"4.8",
  },
  {
    name:"Chemistry Fundamentals",
    students:"8,750",
    completion:"80%",
    rating:"4.7",
  },
  {
    name:"Biology Complete Guide",
    students:"7,920",
    completion:"76%",
    rating:"4.6",
  },
];



const CourseAnalytics = ()=>{


  return (

    <div className="p-6 text-white">


      {/* Header */}


      <div className="mb-8">

        <h1 className="
        text-3xl
        font-bold
        ">

          Course Analytics

        </h1>


        <p className="
        text-gray-400
        mt-2
        ">

          Track course performance and student engagement

        </p>


      </div>







      {/* Stats */}



      <div className="
      grid
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-4
      gap-6
      mb-10
      ">


        {
          courseStats.map(item=>{


            const Icon=item.icon;


            return (

              <div

              key={item.title}

              className="
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              p-6
              ">


                <div className="
                bg-slate-800
                w-fit
                p-3
                rounded-xl
                ">

                  <Icon size={24}/>

                </div>


                <p className="
                text-gray-400
                mt-5
                ">

                  {item.title}

                </p>


                <h2 className="
                text-3xl
                font-bold
                mt-2
                ">

                  {item.value}

                </h2>


              </div>


            );


          })
        }


      </div>









      <div className="
      grid
      lg:grid-cols-3
      gap-6
      ">





        {/* Course Performance */}



        <div className="
        lg:col-span-2
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        ">


          <div className="
          flex
          justify-between
          mb-6
          ">


            <h2 className="
            text-xl
            font-bold
            ">

              Top Performing Courses

            </h2>


            <BarChart3/>

          </div>





          <div className="space-y-4">


            {
              popularCourses.map((course,index)=>(


                <div

                key={index}

                className="
                bg-slate-800/50
                rounded-xl
                p-4
                "

                >


                  <div className="
                  flex
                  justify-between
                  mb-3
                  ">


                    <h3 className="font-semibold">

                      {course.name}

                    </h3>


                    <span className="
                    text-green-400
                    ">

                      {course.rating} ★

                    </span>


                  </div>





                  <div className="
                  grid
                  grid-cols-2
                  md:grid-cols-3
                  gap-4
                  text-sm
                  text-gray-400
                  ">


                    <p>

                      Students:

                      <span className="text-white ml-2">

                        {course.students}

                      </span>

                    </p>



                    <p>

                      Completion:

                      <span className="text-white ml-2">

                        {course.completion}

                      </span>

                    </p>



                  </div>


                </div>


              ))
            }



          </div>



        </div>








        {/* Engagement */}



        <div className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        ">


          <h2 className="
          text-xl
          font-bold
          mb-6
          ">

            Engagement

          </h2>




          <div className="space-y-6">



            <div>

              <div className="
              flex
              justify-between
              mb-2
              ">

                <span>
                  Daily Active Learners
                </span>

                <span className="text-green-400">
                  72%
                </span>

              </div>


              <div className="
              h-3
              bg-slate-800
              rounded-full
              ">

                <div
                className="
                h-full
                bg-blue-500
                rounded-full
                w-[72%]
                "
                />


              </div>


            </div>






            <div>

              <div className="
              flex
              justify-between
              mb-2
              ">

                <span>
                  Course Completion
                </span>

                <span className="text-green-400">
                  78%
                </span>

              </div>


              <div className="
              h-3
              bg-slate-800
              rounded-full
              ">

                <div
                className="
                h-full
                bg-green-500
                rounded-full
                w-[78%]
                "
                />


              </div>


            </div>






            <div>

              <div className="
              flex
              justify-between
              mb-2
              ">

                <span>
                  Student Retention
                </span>

                <span className="text-green-400">
                  85%
                </span>

              </div>


              <div className="
              h-3
              bg-slate-800
              rounded-full
              ">

                <div
                className="
                h-full
                bg-purple-500
                rounded-full
                w-[85%]
                "
                />


              </div>


            </div>



          </div>


        </div>




      </div>



      {/* Future Chart */}


      <div className="
      mt-6
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-6
      ">


        <h2 className="
        text-xl
        font-bold
        mb-4
        ">

          Enrollment Growth

        </h2>


        <div className="
        h-56
        bg-slate-800/50
        rounded-xl
        flex
        items-center
        justify-center
        text-gray-400
        ">


          Recharts Enrollment Graph


        </div>


      </div>




    </div>

  );

};


export default CourseAnalytics;