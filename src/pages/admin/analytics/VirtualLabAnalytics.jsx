import React from "react";
import {
  FlaskConical,
  Users,
  CheckCircle,
  Activity,
  BarChart3,
  Atom,
  Dna,
  Calculator,
  TrendingUp,
} from "lucide-react";


const stats = [
  {
    title:"Total Experiments",
    value:"145",
    icon:FlaskConical,
  },
  {
    title:"Lab Sessions",
    value:"86,420",
    icon:Users,
  },
  {
    title:"Completed Labs",
    value:"72,850",
    icon:CheckCircle,
  },
  {
    title:"Completion Rate",
    value:"84%",
    icon:Activity,
  },
];



const popularLabs = [
  {
    name:"Force & Motion Simulation",
    subject:"Physics",
    students:"18,450",
    completion:"91%",
  },
  {
    name:"Chemical Reaction Lab",
    subject:"Chemistry",
    students:"15,320",
    completion:"86%",
  },
  {
    name:"Cell Structure Explorer",
    subject:"Biology",
    students:"12,800",
    completion:"82%",
  },
  {
    name:"Graph Plotting Lab",
    subject:"Mathematics",
    students:"10,600",
    completion:"78%",
  },
];



const subjects = [
  {
    name:"Physics",
    icon:Atom,
    usage:"42%",
  },
  {
    name:"Chemistry",
    icon:FlaskConical,
    usage:"30%",
  },
  {
    name:"Biology",
    icon:Dna,
    usage:"18%",
  },
  {
    name:"Mathematics",
    icon:Calculator,
    usage:"10%",
  },
];



const VirtualLabAnalytics = ()=>{


  return (

    <div className="p-6 text-white">



      {/* Header */}

      <div className="mb-8">


        <h1 className="
        text-3xl
        font-bold
        ">

          Virtual Lab Analytics

        </h1>


        <p className="
        text-gray-400
        mt-2
        ">

          Monitor practical learning activities and experiments

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
                bg-slate-800
                rounded-xl
                p-3
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







        {/* Popular Experiments */}



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

              Most Used Experiments

            </h2>


            <BarChart3/>


          </div>





          <div className="space-y-4">


          {
            popularLabs.map((lab,index)=>(


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

                    {lab.name}

                  </h3>


                  <span className="
                  text-green-400
                  ">

                    {lab.completion}

                  </span>


                </div>





                <div className="
                grid
                grid-cols-2
                text-sm
                text-gray-400
                mt-3
                ">


                  <p>

                    Subject:

                    <span className="text-white ml-2">

                      {lab.subject}

                    </span>

                  </p>




                  <p>

                    Learners:

                    <span className="text-white ml-2">

                      {lab.students}

                    </span>

                  </p>


                </div>


              </div>


            ))
          }


          </div>



        </div>








        {/* Subject Usage */}



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

            Subject Usage

          </h2>




          <div className="space-y-5">


          {
            subjects.map((item,index)=>{


              const Icon=item.icon;


              return (

                <div key={index}>


                  <div className="
                  flex
                  justify-between
                  mb-2
                  ">


                    <div className="
                    flex
                    gap-3
                    items-center
                    ">


                      <Icon size={20}/>


                      <span>
                        {item.name}
                      </span>


                    </div>


                    <span className="text-blue-400">
                      {item.usage}
                    </span>


                  </div>



                  <div className="
                  h-2
                  bg-slate-800
                  rounded-full
                  ">


                    <div

                    className="
                    h-full
                    bg-blue-500
                    rounded-full
                    "

                    style={{
                      width:item.usage
                    }}

                    />


                  </div>



                </div>


              );


            })
          }


          </div>



        </div>




      </div>









      {/* Activity Trend */}



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

            Lab Activity Growth

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


          Recharts Lab Usage Graph


        </div>



      </div>




    </div>

  );

};


export default VirtualLabAnalytics;