import React from "react";
import {
  BookOpen,
  Users,
  Star,
  Eye,
  TrendingUp,
  BarChart3,
  Library,
  MessageSquare,
} from "lucide-react";


const stats = [
  {
    title:"Total Novels",
    value:"1,250",
    icon:BookOpen,
  },
  {
    title:"Active Readers",
    value:"86,500",
    icon:Users,
  },
  {
    title:"Chapters Read",
    value:"2.4M",
    icon:Eye,
  },
  {
    title:"Reviews",
    value:"45,800",
    icon:MessageSquare,
  },
];



const popularNovels = [
  {
    title:"The Lost Kingdom",
    genre:"Fantasy",
    readers:"24,500",
    rating:"4.9",
  },
  {
    title:"Future Earth",
    genre:"Sci-Fi",
    readers:"19,800",
    rating:"4.8",
  },
  {
    title:"Shadow World",
    genre:"Mystery",
    readers:"16,300",
    rating:"4.7",
  },
  {
    title:"The Hidden Truth",
    genre:"Adventure",
    readers:"12,900",
    rating:"4.6",
  },
];



const genres = [
  {
    name:"Fantasy",
    percentage:"35%",
  },
  {
    name:"Science Fiction",
    percentage:"25%",
  },
  {
    name:"Adventure",
    percentage:"20%",
  },
  {
    name:"Mystery",
    percentage:"15%",
  },
  {
    name:"Others",
    percentage:"5%",
  },
];



const NovelAnalytics = ()=>{


  return (

    <div className="p-6 text-white">



      {/* Header */}

      <div className="mb-8">


        <h1 className="
        text-3xl
        font-bold
        ">

          Novel Analytics

        </h1>


        <p className="
        text-gray-400
        mt-2
        ">

          Track reading activity and content performance

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








        {/* Popular Novels */}



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

              Most Read Novels

            </h2>


            <BarChart3/>


          </div>





          <div className="space-y-4">


          {
            popularNovels.map((novel,index)=>(


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

                    {novel.title}

                  </h3>


                  <span className="
                  text-yellow-400
                  flex
                  gap-1
                  items-center
                  ">


                    <Star size={15}
                    fill="currentColor"/>


                    {novel.rating}


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

                    Genre:

                    <span className="text-white ml-2">

                      {novel.genre}

                    </span>


                  </p>




                  <p>

                    Readers:

                    <span className="text-white ml-2">

                      {novel.readers}

                    </span>


                  </p>



                </div>




              </div>


            ))
          }


          </div>



        </div>








        {/* Genre Distribution */}



        <div className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        ">


          <div className="
          flex
          items-center
          gap-3
          mb-6
          ">


            <Library/>

            <h2 className="
            text-xl
            font-bold
            ">

              Genres

            </h2>


          </div>






          <div className="space-y-5">


          {
            genres.map((genre,index)=>(


              <div key={index}>


                <div className="
                flex
                justify-between
                mb-2
                ">


                  <span>
                    {genre.name}
                  </span>


                  <span className="
                  text-blue-400
                  ">

                    {genre.percentage}

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
                    width:genre.percentage
                  }}

                  />


                </div>


              </div>


            ))
          }



          </div>



        </div>





      </div>









      {/* Reading Growth */}



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

            Reading Growth

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


          Recharts Reading Analytics Graph


        </div>



      </div>





    </div>

  );

};


export default NovelAnalytics;