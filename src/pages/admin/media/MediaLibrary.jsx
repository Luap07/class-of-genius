import React from "react";
import {
  Image,
  Video,
  FileText,
  HardDrive,
  Upload,
  FolderOpen,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const stats = [
  {
    title:"Total Files",
    value:"18,540",
    icon:FolderOpen,
  },
  {
    title:"Images",
    value:"12,800",
    icon:Image,
  },
  {
    title:"Videos",
    value:"3,450",
    icon:Video,
  },
  {
    title:"PDF Documents",
    value:"2,290",
    icon:FileText,
  },
];



const uploads = [
  {
    name:"Physics Motion Lab.png",
    type:"Image",
    size:"2.4 MB",
    date:"Today",
  },
  {
    name:"Chemistry Course Video.mp4",
    type:"Video",
    size:"145 MB",
    date:"Yesterday",
  },
  {
    name:"Mathematics Notes.pdf",
    type:"PDF",
    size:"8 MB",
    date:"2 days ago",
  },
];



const links = [
  {
    title:"Manage Images",
    path:"/admin/media/images",
    icon:Image,
  },
  {
    title:"Manage Videos",
    path:"/admin/media/videos",
    icon:Video,
  },
  {
    title:"Manage PDFs",
    path:"/admin/media/pdfs",
    icon:FileText,
  },
];



const MediaLibrary = ()=>{


  const navigate = useNavigate();



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
          ">

            Media Library

          </h1>


          <p className="
          text-gray-400
          mt-2
          ">

            Manage images, videos and documents

          </p>


        </div>



        <button className="
        flex
        items-center
        gap-2
        bg-blue-600
        hover:bg-blue-700
        px-5
        py-3
        rounded-xl
        ">


          <Upload size={18}/>

          Upload Media


        </button>



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
              p-3
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







        {/* Recent Uploads */}



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

              Recent Uploads

            </h2>


            <Clock/>


          </div>





          <div className="space-y-4">


          {
            uploads.map((file,index)=>(


              <div

              key={index}

              className="
              bg-slate-800/50
              rounded-xl
              p-4
              flex
              justify-between
              items-center
              ">


                <div>


                  <h3 className="font-semibold">

                    {file.name}

                  </h3>


                  <p className="
                  text-sm
                  text-gray-400
                  ">

                    {file.type} • {file.size}

                  </p>


                </div>




                <span className="
                text-gray-400
                text-sm
                ">

                  {file.date}

                </span>



              </div>


            ))
          }


          </div>



        </div>








        {/* Quick Access */}



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

            Media Management

          </h2>





          <div className="space-y-3">


          {
            links.map(item=>{


              const Icon=item.icon;


              return (

                <button

                key={item.title}

                onClick={()=>navigate(item.path)}

                className="
                w-full
                flex
                justify-between
                items-center
                bg-slate-800
                hover:bg-slate-700
                rounded-xl
                p-4
                ">


                  <div className="
                  flex
                  items-center
                  gap-3
                  ">


                    <Icon size={20}/>


                    <span>
                      {item.title}
                    </span>


                  </div>


                  <ArrowRight size={18}/>


                </button>

              );


            })
          }


          </div>



        </div>





      </div>









      {/* Storage */}



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
        gap-3
        items-center
        mb-5
        ">


          <HardDrive/>

          <h2 className="
          text-xl
          font-bold
          ">

            Storage Usage

          </h2>


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
          w-[65%]
          "
          />


        </div>


        <p className="
        text-gray-400
        mt-3
        ">

          65GB of 100GB used

        </p>



      </div>




    </div>

  );

};


export default MediaLibrary;