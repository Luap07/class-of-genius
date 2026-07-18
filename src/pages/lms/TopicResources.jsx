import React, { useEffect, useState } from "react";
import {
  FileText,
  Video,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";


const TopicResources = ({ topicId }) => {

  const [resources,setResources] = useState([]);
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    if(topicId){
      fetchResources();
    }

  },[topicId]);



  const fetchResources = async()=>{

    try{

      setLoading(true);


      const {data,error}=await supabase
        .from("resources")
        .select("*")
        .eq("topic_id",topicId)
        .order("created_at",{ascending:false});



      if(error)
        throw error;


      setResources(data || []);



    }catch(error){

      console.log(error.message);

    }finally{

      setLoading(false);

    }

  };



  const icon=(type)=>{

    if(type==="video")
      return <Video className="text-purple-400"/>;


    if(type==="youtube")
      return <ExternalLink className="text-red-400"/>;


    return <FileText className="text-cyan-400"/>;

  };



  if(loading)
  return (
    <div className="flex justify-center p-10">
      <Loader2 className="animate-spin text-cyan-400"/>
    </div>
  );



  return (

    <div className="space-y-5">


      <h2 className="text-2xl font-bold text-white">
        Learning Resources
      </h2>



      {
        resources.length===0 ?

        <div className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-6
        text-slate-400
        ">
          No resources added yet.
        </div>


        :

        resources.map(resource=>(

          <div
          key={resource.id}
          className="
          flex
          items-center
          justify-between
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-5
          "
          >


            <div className="flex items-center gap-4">


              <div className="
              rounded-xl
              bg-slate-950
              p-3
              ">
                {icon(resource.resource_type)}
              </div>



              <div>

                <h3 className="font-bold text-white">
                  {resource.title}
                </h3>


                <p className="text-sm text-slate-400">
                  {resource.description}
                </p>

              </div>


            </div>




            {
              resource.resource_type==="youtube"
              ?

              <a
              href={resource.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="
              rounded-xl
              bg-red-500/10
              px-4
              py-2
              text-red-400
              "
              >
                Watch
              </a>


              :

              <a
              href={resource.file_url}
              target="_blank"
              rel="noreferrer"
              className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-cyan-500/10
              px-4
              py-2
              text-cyan-400
              "
              >
                <Download size={16}/>
                Open
              </a>

            }



          </div>

        ))

      }


    </div>

  );

};


export default TopicResources;