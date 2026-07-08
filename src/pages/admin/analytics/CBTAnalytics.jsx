import React from "react";
import {
  ClipboardCheck,
  Users,
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
  AlertTriangle,
} from "lucide-react";


const stats = [
  {
    title:"Total Exams",
    value:"540",
    icon:ClipboardCheck,
  },
  {
    title:"Exam Attempts",
    value:"120,450",
    icon:Users,
  },
  {
    title:"Average Score",
    value:"76%",
    icon:Target,
  },
  {
    title:"Pass Rate",
    value:"84%",
    icon:Trophy,
  },
];



const subjects = [
  {
    name:"Mathematics",
    attempts:"32,500",
    average:"82%",
    pass:"90%",
  },
  {
    name:"Physics",
    attempts:"28,400",
    average:"75%",
    pass:"82%",
  },
  {
    name:"Chemistry",
    attempts:"24,800",
    average:"78%",
    pass:"85%",
  },
  {
    name:"Biology",
    attempts:"21,600",
    average:"80%",
    pass:"88%",
  },
];



const difficultQuestions = [
  {
    question:"Newton's Laws Application",
    subject:"Physics",
    failure:"68%",
  },
  {
    question:"Organic Chemistry Reactions",
    subject:"Chemistry",
    failure:"62%",
  },
  {
    question:"Quadratic Equations",
    subject:"Mathematics",
    failure:"55%",
  },
];




const CBTAnalytics = ()=>{


  return (

    <div className="p-6 text-white">



      {/* Header */}


      <div className="mb-8">


        <h1 className="
        text-3xl
        font-bold
        ">

          CBT Analytics

        </h1>


        <p className="
        text-gray-400
        mt-2
        ">

          Analyze examinations and student performance

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
              ">


                <div className="
                p-3
                bg-slate-800
                rounded-xl
                w-fit
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






        {/* Subject Performance */}



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

              Subject Performance

            </h2>


            <BarChart3/>


          </div>





          <div className="space-y-4">


          {
            subjects.map((subject,index)=>(


              <div

              key={index}

              className="
              bg-slate-800/50
              rounded-xl
              p-4
              ">


                <div className="
                flex
                justify-between
                ">


                  <h3 className="font-semibold">

                    {subject.name}

                  </h3>


                  <span className="
                  text-green-400
                  ">

                    {subject.pass}

                  </span>


                </div>





                <div className="
                grid
                grid-cols-2
                mt-3
                text-sm
                text-gray-400
                ">


                  <p>

                    Attempts:

                    <span className="text-white ml-2">

                      {subject.attempts}

                    </span>


                  </p>




                  <p>

                    Average:

                    <span className="text-white ml-2">

                      {subject.average}

                    </span>


                  </p>



                </div>



              </div>


            ))
          }



          </div>



        </div>








        {/* Difficult Questions */}



        <div className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        ">



          <div className="
          flex
          gap-2
          items-center
          mb-6
          ">


            <AlertTriangle
            className="text-yellow-400"
            />


            <h2 className="
            text-xl
            font-bold
            ">

              Difficult Questions

            </h2>


          </div>





          <div className="space-y-4">


          {
            difficultQuestions.map((item,index)=>(


              <div

              key={index}

              className="
              bg-slate-800/50
              rounded-xl
              p-4
              ">


                <h3 className="font-semibold">

                  {item.question}

                </h3>


                <p className="
                text-gray-400
                text-sm
                mt-1
                ">

                  {item.subject}

                </p>



                <span className="
                text-red-400
                text-sm
                ">

                  Failure Rate: {item.failure}

                </span>



              </div>


            ))
          }


          </div>


        </div>



      </div>









      {/* Score Trend */}



      <div className="
      mt-6
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-6
      ">


        <div className="
        flex
        justify-between
        mb-5
        ">


          <h2 className="
          text-xl
          font-bold
          ">

            Score Improvement Trend

          </h2>


          <TrendingUp/>


        </div>





        <div className="
        h-56
        bg-slate-800/50
        rounded-xl
        flex
        items-center
        justify-center
        text-gray-400
        ">

          Recharts Score Trend Graph

        </div>



      </div>




    </div>

  );

};


export default CBTAnalytics;