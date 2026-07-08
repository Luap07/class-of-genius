import React, { useMemo, useState } from "react";
import {
  Search,
  Upload,
  Trash2,
  Play,
  Video,
  Filter,
  Eye,
} from "lucide-react";


const videoData = [
  {
    id:1,
    title:"Introduction To Physics",
    category:"Courses",
    duration:"24:35",
    views:"12,450",
    size:"250 MB",
    date:"July 7, 2026",
    thumbnail:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
  },
  {
    id:2,
    title:"Virtual Chemistry Experiment",
    category:"Virtual Lab",
    duration:"18:20",
    views:"9,850",
    size:"180 MB",
    date:"July 5, 2026",
    thumbnail:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
  },
  {
    id:3,
    title:"Mathematics Problem Solving",
    category:"Lessons",
    duration:"35:10",
    views:"18,300",
    size:"420 MB",
    date:"July 2, 2026",
    thumbnail:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904",
  },
];


const categories = [
  "All",
  "Courses",
  "Lessons",
  "Virtual Lab",
  "CBT",
];



const Videos = ()=>{


  const [videos,setVideos] = useState(videoData);

  const [search,setSearch] = useState("");

  const [category,setCategory] = useState("All");





  const deleteVideo=(id)=>{


    setVideos(prev=>

      prev.filter(
        video=>video.id!==id
      )

    );


  };





  const filteredVideos = useMemo(()=>{


    return videos.filter(video=>{


      const searchMatch =

      video.title
      .toLowerCase()
      .includes(search.toLowerCase());



      const categoryMatch =

      category==="All"

      ||

      video.category===category;



      return searchMatch && categoryMatch;


    });


  },[
    videos,
    search,
    category
  ]);





  return (

    <div className="p-6 text-white">



      {/* Header */}


      <div className="
      flex
      flex-col
      md:flex-row
      justify-between
      gap-4
      mb-8
      ">


        <div>

          <h1 className="
          text-3xl
          font-bold
          flex
          items-center
          gap-3
          ">

            <Video/>

            Videos

          </h1>


          <p className="
          text-gray-400
          mt-2
          ">

            Manage educational videos and lessons

          </p>


        </div>





        <button className="
        bg-blue-600
        hover:bg-blue-700
        px-5
        py-3
        rounded-xl
        flex
        items-center
        gap-2
        ">

          <Upload size={18}/>

          Upload Video


        </button>



      </div>







      {/* Search + Filter */}



      <div className="
      flex
      flex-col
      md:flex-row
      gap-4
      mb-8
      ">



        <div className="
        flex
        items-center
        flex-1
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        px-4
        ">


          <Search
          size={18}
          className="text-gray-400"
          />


          <input

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          placeholder="Search videos..."

          className="
          bg-transparent
          outline-none
          px-3
          py-3
          w-full
          "

          />

        </div>





        <div className="
        flex
        items-center
        gap-2
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        px-4
        ">


          <Filter size={16}/>



          <select

          value={category}

          onChange={(e)=>setCategory(e.target.value)}

          className="
          bg-transparent
          outline-none
          "

          >

            {
              categories.map(item=>(

                <option
                key={item}
                className="bg-slate-900"
                >

                  {item}

                </option>

              ))
            }


          </select>


        </div>



      </div>









      {/* Video Grid */}



      <div className="
      grid
      sm:grid-cols-2
      lg:grid-cols-3
      gap-6
      ">


      {
        filteredVideos.map(video=>(


          <div

          key={video.id}

          className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          overflow-hidden
          "

          >



            <div className="
            relative
            ">


              <img

              src={video.thumbnail}

              alt={video.title}

              className="
              h-48
              w-full
              object-cover
              "

              />




              <button className="
              absolute
              inset-0
              m-auto
              w-12
              h-12
              rounded-full
              bg-black/60
              flex
              items-center
              justify-center
              ">


                <Play size={22}/>


              </button>



            </div>






            <div className="p-4">


              <h3 className="
              font-semibold
              truncate
              ">

                {video.title}

              </h3>




              <p className="
              text-sm
              text-gray-400
              mt-1
              ">

                {video.category}

              </p>




              <div className="
              grid
              grid-cols-2
              gap-2
              text-xs
              text-gray-400
              mt-3
              ">


                <span>
                  Duration: {video.duration}
                </span>


                <span>
                  Views: {video.views}
                </span>


                <span>
                  Size: {video.size}
                </span>


                <span>
                  {video.date}
                </span>


              </div>






              <div className="
              flex
              gap-2
              mt-4
              ">



                <button className="
                flex-1
                bg-slate-800
                rounded-lg
                py-2
                flex
                justify-center
                ">

                  <Eye size={16}/>

                </button>





                <button

                onClick={()=>deleteVideo(video.id)}

                className="
                flex-1
                bg-red-500/20
                text-red-400
                rounded-lg
                py-2
                flex
                justify-center
                "

                >

                  <Trash2 size={16}/>

                </button>


              </div>



            </div>



          </div>


        ))
      }



      </div>





      {
        filteredVideos.length===0 && (

          <div className="
          mt-10
          text-center
          text-gray-400
          ">

            No videos found

          </div>

        )
      }



    </div>

  );

};


export default Videos;