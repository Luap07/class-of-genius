import React, {
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  FileText,
  Video,
  ExternalLink,
  Loader2,
  File,
} from "lucide-react";

import {
  supabase,
} from "../../../lib/supabaseClient";

const CoursesAdmin = () => {

  const [resources, setResources] = useState([]);

  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {

    try {

      setLoading(true);

      const [

        resourcesResponse,

        documentsResponse,

      ] = await Promise.all([

        supabase

          .from("resources")

          .select(`
            id,
            title,
            description,
            resource_type,
            file_url,
            created_at
          `)

          .order(
            "created_at",
            {
              ascending:false
            }
          ),

        supabase

          .from("documents")

          .select(`
            id,
            title,
            description,
            category,
            file_url,
            created_at
          `)

          .order(
            "created_at",
            {
              ascending:false
            }
          )

      ]);

      if(resourcesResponse.error)
        throw resourcesResponse.error;

      if(documentsResponse.error)
        throw documentsResponse.error;

      setResources(
        resourcesResponse.data || []
      );

      setDocuments(
        documentsResponse.data || []
      );

    }

    catch(error){

      console.error(
        "FETCH ERROR:",
        error
      );

    }

    finally{

      setLoading(false);

    }

  };

  const getIcon = (type)=>{

    switch(type){

      case "video":

        return (
          <Video
            className="text-purple-400"
          />
        );

      case "pdf":

        return (
          <FileText
            className="text-red-400"
          />
        );

      default:

        return (
          <File
            className="text-cyan-400"
          />
        );

    }

  };

  if(loading){

    return(

      <div
        className="
          flex
          h-screen
          items-center
          justify-center
        "
      >

        <Loader2

          size={45}

          className="
            animate-spin
            text-cyan-400
          "

        />

      </div>

    );

  }

  return(

    <div
      className="
        space-y-10
        p-6
      "
    >

      <div>

        <h1
          className="
            text-3xl
            font-black
            text-white
          "
        >
          LMS Resources
        </h1>

        <p
          className="
            mt-2
            text-slate-400
          "
        >
          Documents and Resources uploaded from the Admin panel.
        </p>

      </div>
            {/* =========================================
          RESOURCES
      ========================================= */}

      <div>

        <div className="flex items-center gap-3 mb-6">

          <BookOpen
            className="text-cyan-400"
            size={28}
          />

          <h2 className="text-2xl font-bold text-white">
            Course Resources
          </h2>

          <span
            className="
              ml-auto
              rounded-full
              bg-cyan-500/10
              px-4
              py-1
              text-sm
              text-cyan-400
            "
          >
            {resources.length} Files
          </span>

        </div>

        {

          resources.length === 0 ? (

            <div
              className="
                rounded-3xl
                border
                border-slate-800
                bg-slate-900
                p-10
                text-center
              "
            >

              <BookOpen
                size={55}
                className="
                  mx-auto
                  text-slate-600
                "
              />

              <h3
                className="
                  mt-5
                  text-xl
                  font-bold
                  text-white
                "
              >
                No Resources
              </h3>

              <p
                className="
                  mt-2
                  text-slate-400
                "
              >
                No learning resources uploaded yet.
              </p>

            </div>

          ) : (

            <div
              className="
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {

                resources.map((resource)=>(

                  <div

                    key={resource.id}

                    className="
                      rounded-3xl
                      border
                      border-slate-800
                      bg-slate-900
                      p-6
                    "

                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >

                      {
                        getIcon(
                          resource.resource_type
                        )
                      }

                    </div>

                    <h3
                      className="
                        mt-5
                        text-lg
                        font-bold
                        text-white
                      "
                    >

                      {resource.title}

                    </h3>

                    <p
                      className="
                        mt-3
                        text-sm
                        text-slate-400
                      "
                    >

                      {
                        resource.description ||
                        "Learning Resource"
                      }

                    </p>

                    <div
                      className="
                        mt-5
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <span
                        className="
                          rounded-full
                          bg-cyan-500/10
                          px-3
                          py-1
                          text-xs
                          text-cyan-400
                        "
                      >

                        {
                          resource.resource_type
                        }

                      </span>

                      {

                        resource.file_url && (

                          <a

                            href={
                              resource.file_url
                            }

                            target="_blank"

                            rel="noreferrer"

                            className="
                              flex
                              items-center
                              gap-2
                              text-cyan-400
                              hover:text-cyan-300
                            "

                          >

                            Open

                            <ExternalLink
                              size={16}
                            />

                          </a>

                        )

                      }

                    </div>

                  </div>

                ))

              }

            </div>

          )

        }

      </div>
            {/* =========================================
          DOCUMENTS
      ========================================= */}

      <div>

        <div className="flex items-center gap-3 mb-6">

          <FileText
            className="text-blue-400"
            size={28}
          />

          <h2 className="text-2xl font-bold text-white">
            Uploaded Documents
          </h2>

          <span
            className="
              ml-auto
              rounded-full
              bg-blue-500/10
              px-4
              py-1
              text-sm
              text-blue-400
            "
          >
            {documents.length} Files
          </span>

        </div>


        {
          documents.length === 0 ? (

            <div
              className="
                rounded-3xl
                border
                border-slate-800
                bg-slate-900
                p-10
                text-center
              "
            >

              <FileText
                size={55}
                className="
                  mx-auto
                  text-slate-600
                "
              />


              <h3
                className="
                  mt-5
                  text-xl
                  font-bold
                  text-white
                "
              >
                No Documents
              </h3>


              <p
                className="
                  mt-2
                  text-slate-400
                "
              >
                No documents uploaded yet.
              </p>


            </div>


          ) : (

            <div
              className="
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {
                documents.map((doc)=>(

                  <div

                    key={doc.id}

                    className="
                      rounded-3xl
                      border
                      border-slate-800
                      bg-slate-900
                      p-6
                    "

                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <FileText
                        size={32}
                        className="
                          text-blue-400
                        "
                      />


                    </div>


                    <h3
                      className="
                        mt-5
                        text-lg
                        font-bold
                        text-white
                      "
                    >

                      {doc.title}

                    </h3>


                    <p
                      className="
                        mt-3
                        text-sm
                        text-slate-400
                      "
                    >

                      {
                        doc.description ||
                        "Document file"
                      }

                    </p>


                    {
                      doc.category && (

                        <span
                          className="
                            mt-4
                            inline-block
                            rounded-full
                            bg-blue-500/10
                            px-3
                            py-1
                            text-xs
                            text-blue-400
                          "
                        >

                          {doc.category}

                        </span>

                      )
                    }


                    {
                      doc.file_url && (

                        <a

                          href={
                            doc.file_url
                          }

                          target="_blank"

                          rel="noreferrer"

                          className="
                            mt-5
                            flex
                            items-center
                            gap-2
                            text-cyan-400
                            hover:text-cyan-300
                          "

                        >

                          Open Document

                          <ExternalLink
                            size={16}
                          />

                        </a>

                      )
                    }


                  </div>

                ))
              }


            </div>

          )

        }


      </div>
            {/* =========================================
          REFRESH AREA
      ========================================= */}

      <div
        className="
          flex
          justify-end
        "
      >

        <button

          onClick={fetchData}

          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-700
            bg-slate-900
            px-5
            py-3
            text-sm
            text-white
            transition
            hover:bg-slate-800
          "

        >

          Refresh Data

        </button>


      </div>
            {/* =========================================
          END CONTENT
      ========================================= */}

    </div>

  );
  };

export default CoursesAdmin;