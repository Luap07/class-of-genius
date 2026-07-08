import React from "react";
import {
  Users,
  BookOpen,
  FlaskConical,
  Brain,
  TrendingUp,
  Activity,
  Clock,
  Award,
} from "lucide-react";


const stats = [
  {
    title:"Total Users",
    value:"24,850",
    growth:"+12%",
    icon:Users,
  },
  {
    title:"Active Courses",
    value:"320",
    growth:"+8%",
    icon:BookOpen,
  },
  {
    title:"Lab Experiments",
    value:"145",
    growth:"+15%",
    icon:FlaskConical,
  },
  {
    title:"CBT Attempts",
    value:"52,430",
    growth:"+20%",
    icon:Brain,
  },
];



const activities = [
  {
    title:"500 students completed Mathematics CBT",
    time:"10 minutes ago",
  },
  {
    title:"New Chemistry experiment added",
    time:"1 hour ago",
  },
  {
    title:"120 students enrolled in Physics course",
    time:"3 hours ago",
  },
  {
    title:"New novel chapter published",
    time:"Yesterday",
  },
];




const DashboardAnalytics = ()=>{


  return (

    <div className="p-6 text-white">



      {/* Header */}


      <div className="mb-8">


        <h1 className="
        text-3xl
        font-bold
        ">

          Platform Analytics

        </h1>


        <p className="
        text-gray-400
        mt-2
        ">

          Monitor growth and learning activity

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
          stats.map(item=>{


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
              "

              >



                <div className="
                flex
                justify-between
                ">



                  <div className="
                  p-3
                  rounded-xl
                  bg-slate-800
                  ">

                    <Icon size={24}/>

                  </div>




                  <div className="
                  flex
                  items-center
                  gap-1
                  text-green-400
                  text-sm
                  ">

                    <TrendingUp size={16}/>

                    {item.growth}

                  </div>



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








      {/* Analytics Grid */}



      <div className="
      grid
      lg:grid-cols-3
      gap-6
      ">





        {/* Growth Chart Placeholder */}


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

              Platform Growth

            </h2>


            <Activity/>

          </div>





          <div className="
          h-64
          flex
          items-center
          justify-center
          rounded-xl
          bg-slate-800/50
          text-gray-400
          ">


            Growth Chart

            <br/>

            (Connect Recharts / API Data)


          </div>



        </div>







        {/* Learning Summary */}



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
          mb-5
          ">

            Learning Summary

          </h2>




          <div className="space-y-5">



            <div className="
            flex
            items-center
            gap-4
            ">

              <BookOpen/>

              <div>

                <p>
                  Courses Completed
                </p>

                <span className="text-gray-400">
                  18,430
                </span>

              </div>


            </div>





            <div className="
            flex
            items-center
            gap-4
            ">

              <Award/>

              <div>

                <p>
                  Certificates Issued
                </p>

                <span className="text-gray-400">
                  9,240
                </span>

              </div>


            </div>





            <div className="
            flex
            items-center
            gap-4
            ">

              <Clock/>

              <div>

                <p>
                  Average Study Time
                </p>

                <span className="text-gray-400">
                  2.8 hrs/day
                </span>

              </div>


            </div>



          </div>


        </div>




      </div>









      {/* Recent Activity */}



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
        mb-5
        ">

          Recent Activity

        </h2>




        <div className="space-y-4">


          {
            activities.map((item,index)=>(


              <div

              key={index}

              className="
              flex
              justify-between
              bg-slate-800/50
              rounded-xl
              p-4
              ">


                <p>
                  {item.title}
                </p>


                <span className="
                text-gray-400
                text-sm
                ">

                  {item.time}

                </span>


              </div>


            ))
          }


        </div>



      </div>




    </div>

  );

};


export default DashboardAnalytics;