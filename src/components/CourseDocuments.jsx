import React, { useMemo } from "react";
import {
  FileText,
  Download,
  Loader2,
  FolderOpen,
} from "lucide-react";

import { useDocuments } from "../context/DocumentContext";


export default function CourseDocuments({
  category,
  categoryId,
}) {

  const {
    documents,
    loading,
    openDocument,
  } = useDocuments();



  const filteredDocuments = useMemo(() => {

    if (!category) return documents;


   return documents.filter((doc) => {

  const sameName =
    doc.category?.toLowerCase() ===
    category?.toLowerCase();


  const sameId =
    String(doc.category_id) ===
    String(categoryId);


  return sameName || sameId;

});

  }, [
    documents,
    category,
  ]);



  if (loading) {

    return (

      <div className="
        flex
        items-center
        justify-center
        py-10
        text-slate-400
      ">

        <Loader2
          className="animate-spin mr-2"
          size={20}
        />

        Loading documents...

      </div>

    );

  }



  if (!filteredDocuments.length) {

    return (

      <div className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-8
        text-center
        text-slate-400
      ">

        <FolderOpen
          size={40}
          className="mx-auto mb-3"
        />

        No documents available for this category.

      </div>

    );

  }



  return (

    <div className="space-y-4">


      {
        filteredDocuments.map(
          (doc) => (

            <div
              key={doc.id}
              className="
                rounded-2xl
                bg-slate-900
                border
                border-slate-800
                p-5
                flex
                items-center
                justify-between
                gap-4
              "
            >


              <div className="flex items-center gap-4">


                <div className="
                  w-12
                  h-12
                  rounded-xl
                  bg-blue-600/20
                  flex
                  items-center
                  justify-center
                ">

                  <FileText
                    className="text-blue-400"
                    size={24}
                  />

                </div>



                <div>

                  <h3 className="
                    font-semibold
                    text-white
                  ">
                    {doc.title}
                  </h3>


                  <p className="
                    text-sm
                    text-slate-400
                    mt-1
                  ">
                    {doc.description}
                  </p>


                  <span className="
                    inline-block
                    mt-2
                    px-3
                    py-1
                    rounded-full
                    bg-blue-500/10
                    text-blue-400
                    text-xs
                  ">
                    {doc.category}
                  </span>

                </div>


              </div>



              <button

                onClick={() =>
                  openDocument(
                    doc.file_url
                  )
                }

                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  transition
                "

              >

                <Download size={17}/>

                Open

              </button>



            </div>

          )
        )
      }


    </div>

  );

}