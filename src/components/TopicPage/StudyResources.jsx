import React from "react";
import { motion } from "framer-motion";
import {
  PlayCircle,
  Youtube,
  Video,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const StudyResources = ({
  resources = [],
}) => {

  const navigate = useNavigate();


  // ONLY SHOW VIDEOS
  const videos = resources.filter(
    (resource) =>
      resource.resource_type === "video" ||
      resource.resource_type === "youtube"
  );


  return (

    <section className="mt-12">


      <div className="mb-8">

        <h2 className="
          text-3xl
          font-black
          text-white
        ">
          Video Resources
        </h2>


        <p className="
          mt-2
          text-slate-400
        ">
          Watch lessons and explanations for this topic.
        </p>


      </div>



      {
        videos.length === 0 ?

        (

          <div className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-900
            p-12
            text-center
          ">


            <Video
              size={50}
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
              No Videos Available
            </h3>


            <p className="
              mt-2
              text-slate-400
            ">
              Your instructor has not uploaded videos yet.
            </p>


          </div>

        )

        :

        (

          <div className="
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
          ">


            {
              videos.map((video)=>(


                <motion.div

                  key={video.id}

                  whileHover={{
                    y:-8
                  }}

                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-800
                    bg-slate-900
                  "

                >


                  {/* VIDEO PREVIEW */}

                  <div className="
                    flex
                    h-48
                    items-center
                    justify-center
                    bg-slate-950
                  ">


                    {
                      video.resource_type === "youtube"

                      ?

                      <Youtube
                        size={60}
                        className="
                          text-red-500
                        "
                      />

                      :

                      <PlayCircle
                        size={60}
                        className="
                          text-cyan-400
                        "
                      />

                    }


                  </div>




                  <div className="p-6">


                    <h3 className="
                      text-xl
                      font-bold
                      text-white
                    ">

                      {video.title}

                    </h3>



                    <p className="
                      mt-3
                      text-sm
                      leading-6
                      text-slate-400
                    ">

                      {
                        video.description ||
                        "Video lesson"
                      }

                    </p>




                    <button

                      onClick={()=>{

                        if(video.resource_type==="youtube")
                        {

                          window.open(
                            video.file_url,
                            "_blank"
                          );

                        }
                        else
                        {

                          navigate(
                            `/video/${video.id}`
                          );

                        }

                      }}

                      className="
                        mt-6
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-cyan-500
                        py-3
                        font-bold
                        text-slate-950
                      "

                    >

                      Watch Video

                      <ArrowRight size={18}/>


                    </button>


                  </div>



                </motion.div>


              ))
            }


          </div>

        )

      }


    </section>

  );

};


export default StudyResources;