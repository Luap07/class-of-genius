// src/pages/lms/Resources.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Filter,
  Video,
  PlayCircle,
  Loader2,
  FolderOpen,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import ResourceCard from "../../components/lms/ResourceCard";


const filters = [
  "All",
  "video",
  "youtube",
];


const Resources = () => {


  const [resources,setResources] = useState([]);

  const [loading,setLoading] = useState(true);

  const [error,setError] = useState("");

  const [search,setSearch] = useState("");

  const [filter,setFilter] = useState("All");



  // =========================
  // FETCH VIDEO RESOURCES ONLY
  // =========================

  useEffect(()=>{

    fetchResources();

  },[]);



  const fetchResources = async()=>{


    try{


      setLoading(true);
const {
  data,
  error,
} = await supabase
  .from("resources")
  .select(`
    id,
    title,
    description,
    resource_type,
    file_url,
    youtube_url,
    created_at,

    course_topics(
      id,
      title,

      courses(
        id,
        title
      )
    )
  `)
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
      ascending:false
    }
  );
      if(error)
        throw error;

      setResources(
        data || []
      );

    }

    catch(err){

      console.error(
        "VIDEO RESOURCE ERROR",
        err
      );


      setError(
        err.message
      );

    }

    finally{

      setLoading(false);

    }


  };





  // =========================
  // SEARCH + FILTER
  // =========================


  const filteredResources = useMemo(()=>{


    return resources.filter((resource)=>{


      const text =
      search.toLowerCase();



      const matchesSearch =

      resource.title
      ?.toLowerCase()
      .includes(text)

      ||

      resource.description
      ?.toLowerCase()
      .includes(text)

      ||

      resource.course_topics?.title
      ?.toLowerCase()
      .includes(text);



      const matchesFilter =

      filter === "All"

      ?

      true

      :

      resource.resource_type === filter;



      return (
        matchesSearch &&
        matchesFilter
      );


    });


  },[
    resources,
    search,
    filter
  ]);





  // =========================
  // STATS
  // =========================


  const stats = useMemo(()=>{


    return {

      video:
      resources.filter(
        item =>
        item.resource_type === "video"
      ).length,


      youtube:
      resources.filter(
        item =>
        item.resource_type === "youtube"
      ).length,


    };


  },[
    resources
  ]);






  // =========================
  // OPEN VIDEO
  // =========================


  const openResource=(resource)=>{


    const url =

    resource.resource_type === "youtube"

    ?

    resource.youtube_url

    :

    resource.file_url;



    if(url){

      window.open(
        url,
        "_blank"
      );

    }


  };







  if(loading){


    return (

      <div className="
        flex
        justify-center
        py-32
      ">

        <Loader2
          size={45}
          className="
          animate-spin
          text-blue-500
          "
        />

      </div>

    );


  }






  if(error){


    return (

      <div className="
        rounded-3xl
        border
        border-red-500/30
        bg-red-500/10
        p-8
      ">


        <h2 className="
          text-2xl
          font-bold
          text-red-400
        ">

          Failed loading videos

        </h2>


        <p className="
          mt-3
          text-slate-300
        ">

          {error}

        </p>


      </div>

    );


  }







return (

<div className="space-y-8">


{/* HEADER */}

<div>

<h1 className="
text-4xl
font-black
text-white
">

Video Resources

</h1>


<p className="
mt-2
text-slate-400
">

Watch uploaded lessons and YouTube classes from your courses.

</p>


</div>





{/* SEARCH */}


<div className="
flex
flex-col
gap-5
lg:flex-row
">


<div className="
flex
items-center
gap-3
rounded-2xl
border
border-slate-800
bg-slate-900
px-5
py-4
lg:w-[450px]
">


<Search
size={20}
className="text-slate-500"
/>


<input

placeholder="
Search videos...
"

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

className="
w-full
bg-transparent
outline-none
"

/>


</div>



<button className="
flex
items-center
gap-2
rounded-2xl
border
border-slate-800
bg-slate-900
px-6
">

<Filter size={18}/>

Filters

</button>


</div>






{/* FILTER */}


<div className="
flex
gap-3
">


{
filters.map(item=>(


<button

key={item}

onClick={()=>
setFilter(item)
}

className={`
rounded-xl
px-5
py-3
font-medium

${
filter===item

?

"bg-blue-600 text-white"

:

"bg-slate-900 border border-slate-800 text-slate-300"

}

`}

>

{item.toUpperCase()}


</button>


))

}


</div>







{/* STATS */}


<div className="
grid
gap-6
md:grid-cols-2
">


<div className="
rounded-3xl
border
border-slate-800
bg-slate-900
p-6
">


<div className="flex justify-between">


<div>

<p className="text-slate-400">

Uploaded Videos

</p>


<h2 className="
text-4xl
font-bold
text-white
">

{stats.video}

</h2>


</div>


<Video
className="text-purple-400"
size={35}
/>


</div>


</div>




<div className="
rounded-3xl
border
border-slate-800
bg-slate-900
p-6
">


<div className="flex justify-between">


<div>

<p className="text-slate-400">

YouTube Lessons

</p>


<h2 className="
text-4xl
font-bold
text-white
">

{stats.youtube}

</h2>


</div>


<PlayCircle
className="text-red-400"
size={35}
/>


</div>


</div>



</div>







{/* GRID */}



{
filteredResources.length > 0

?

<div className="
grid
gap-8
md:grid-cols-2
xl:grid-cols-3
">


{
filteredResources.map(resource=>(


<ResourceCard

key={resource.id}

resource={resource}

onOpen={openResource}


/>


))

}


</div>


:


<div className="
rounded-3xl
border
border-dashed
border-slate-700
bg-slate-900
py-24
text-center
">


<FolderOpen
size={60}
className="mx-auto text-slate-600"
/>


<h2 className="
mt-5
text-2xl
font-bold
text-white
">

No Videos Found

</h2>


<p className="
mt-3
text-slate-400
">

No video lessons available.

</p>


</div>


}



</div>

);


};


export default Resources;