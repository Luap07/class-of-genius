// src/admin/pages/DocumentsAdmin.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Upload,
  FileText,
  FolderOpen,
  Search,
  RefreshCw,
  Loader2,
  Tag,
  AlignLeft,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";


export default function DocumentsAdmin() {

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [file, setFile] =
    useState(null);


  const [categories, setCategories] =
    useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("");


  const [documents, setDocuments] =
    useState([]);

  const [search, setSearch] =
    useState("");


  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);



  // ==========================
  // FETCH CATEGORIES
  // ==========================

  const fetchCategories = async () => {

    try {

      setLoadingCategories(true);

      const { data, error } =
        await supabase
          .from("course_categories")
          .select("*")
          .eq("active", true)
          .order("display_order", {
            ascending: true,
          });


      if (error)
        throw error;


      setCategories(data || []);


      if (data?.length) {
        setSelectedCategory(
          data[0].name
        );
      }


    } catch (error) {

      console.error(
        "Category Error:",
        error
      );

    } finally {

      setLoadingCategories(false);

    }

  };



  // ==========================
  // FETCH DOCUMENTS
  // ==========================

  const fetchDocuments = async () => {

    try {

      setLoadingDocuments(true);


      const { data, error } =
        await supabase
          .from("documents")
          .select("*")
          .order("created_at", {
            ascending: false,
          });


      if (error)
        throw error;


      setDocuments(data || []);


    } catch(error){

      console.error(
        "Documents Error:",
        error
      );

    } finally {

      setLoadingDocuments(false);

    }

  };



  useEffect(() => {

    fetchCategories();

    fetchDocuments();

  }, []);



  // ==========================
  // SEARCH FILTER
  // ==========================

  const filteredDocuments =
    useMemo(() => {

      return documents.filter((doc)=>{

        const value =
          search.toLowerCase();


        return (

          doc.title
            ?.toLowerCase()
            .includes(value)

          ||

          doc.category
            ?.toLowerCase()
            .includes(value)

        );

      });


    },[
      documents,
      search
    ]);



  // ==========================
  // UPLOAD DOCUMENT
  // ==========================

  const handleUpload = async (e) => {

    e.preventDefault();


    if (!title.trim()) {
      alert("Enter document title");
      return;
    }


    if (!selectedCategory) {
      alert("Select a category");
      return;
    }


    if (!file) {
      alert("Choose a file");
      return;
    }



    try {

      setUploading(true);



      // ==========================
      // CREATE UNIQUE FILE NAME
      // ==========================

      const extension =
        file.name
          .split(".")
          .pop();



      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${extension}`;



      // ==========================
      // UPLOAD TO SUPABASE STORAGE
      // ==========================

      const {
        error: uploadError
      } =
        await supabase.storage
            .from("course-documents")          .upload(
            fileName,
            file
          );



      if (uploadError)
        throw uploadError;



      // ==========================
      // GET FILE URL
      // ==========================

      const {
        data
      } =
        supabase.storage
            .from("course-documents")          .getPublicUrl(
            fileName
          );



      const publicUrl =
        data.publicUrl;



      // ==========================
      // SAVE DATABASE RECORD
      // ==========================

      const {
        error: databaseError
      } =
        await supabase
          .from("documents")
          .insert([
            {
              title: title.trim(),

              description:
                description.trim(),

              category:
                selectedCategory,

              file_url:
                publicUrl,

              file_name:
                file.name,

              file_type:
                file.type,

              file_size:
                file.size,
            },
          ]);



      if (databaseError)
        throw databaseError;



      // refresh list

      await fetchDocuments();



      // clear form

      setTitle("");

      setDescription("");

      setFile(null);



      alert(
        "Document uploaded successfully"
      );



    } catch(error) {


      console.error(
        "Upload Error:",
        error
      );


      alert(
        error.message
      );



    } finally {


      setUploading(false);


    }

  };





  // ==========================
  // DELETE DOCUMENT
  // ==========================

  const handleDelete = async (
    id,
    fileUrl
  ) => {


    const confirmDelete =
      window.confirm(
        "Delete this document?"
      );



    if (!confirmDelete)
      return;



    try {


      const fileName =
        decodeURIComponent(
          fileUrl.split("/").pop()
        );



      await supabase.storage
        .from("course-documents")        .remove([
          fileName
        ]);



      const {
        error
      } =
        await supabase
          .from("documents")
          .delete()
          .eq(
            "id",
            id
          );



      if (error)
        throw error;



      fetchDocuments();



    } catch(error){


      console.error(
        "Delete Error:",
        error
      );


      alert(
        error.message
      );

    }

  };





  // ==========================
  // OPEN DOCUMENT
  // ==========================

  const openDocument = (url) => {

    window.open(
      url,
      "_blank"
    );

  };



  return (

    <div className="min-h-screen bg-[#020617] text-white p-8">


      <div className="max-w-7xl mx-auto">

        {/* ==========================
            HEADER
        ========================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-10"
        >

          <h1 className="text-4xl font-bold">
            Document Manager
          </h1>


          <p className="text-slate-400 mt-2">
            Upload and manage course documents.
          </p>

        </motion.div>




        <div className="grid lg:grid-cols-[420px_1fr] gap-8">



          {/* ==========================
              UPLOAD FORM
          ========================== */}


          <motion.form

            onSubmit={handleUpload}

            initial={{
              opacity: 0,
              x: -20,
            }}

            animate={{
              opacity: 1,
              x: 0,
            }}

            className="
              rounded-3xl
              bg-slate-900
              border
              border-slate-800
              p-6
              space-y-6
            "

          >




            {/* TITLE */}

            <div>


              <label className="flex items-center gap-2 mb-2 font-medium">

                <FileText size={18}/>

                Document Title

              </label>



              <input

                value={title}

                onChange={(e)=>
                  setTitle(
                    e.target.value
                  )
                }

                placeholder="Enter document title"

                className="
                  w-full
                  h-12
                  rounded-xl
                  bg-slate-800
                  border
                  border-slate-700
                  px-4
                  outline-none
                  focus:border-blue-500
                "

              />


            </div>






            {/* DESCRIPTION */}

            <div>


              <label className="flex items-center gap-2 mb-2 font-medium">

                <AlignLeft size={18}/>

                Description

              </label>



              <textarea

                rows="4"

                value={description}

                onChange={(e)=>
                  setDescription(
                    e.target.value
                  )
                }

                placeholder="Short description"

                className="
                  w-full
                  rounded-xl
                  bg-slate-800
                  border
                  border-slate-700
                  p-4
                  resize-none
                  outline-none
                  focus:border-blue-500
                "

              />


            </div>







            {/* CATEGORY */}


            <div>


              <label className="flex items-center gap-2 mb-2 font-medium">

                <Tag size={18}/>

                Category

              </label>



              <select

                value={selectedCategory}

                onChange={(e)=>
                  setSelectedCategory(
                    e.target.value
                  )
                }


                className="
                  w-full
                  h-12
                  rounded-xl
                  bg-slate-800
                  border
                  border-slate-700
                  px-4
                  outline-none
                "

              >


                {
                  loadingCategories ?

                  (

                    <option>
                      Loading categories...
                    </option>

                  )

                  :

                  (

                    categories.map(
                      (cat)=>(

                        <option

                          key={cat.id}

                          value={cat.name}

                        >

                          {cat.name}

                        </option>

                      )
                    )

                  )

                }


              </select>


            </div>
                
                
            {/* FILE UPLOAD */}

            <div>

              <label className="flex items-center gap-2 mb-3 font-medium">

                <FolderOpen size={18}/>

                Upload File

              </label>



              <label
                className="
                  border-2
                  border-dashed
                  border-slate-700
                  rounded-2xl
                  p-8
                  flex
                  flex-col
                  items-center
                  justify-center
                  cursor-pointer
                  hover:border-blue-500
                  transition
                "
              >

                <Upload
                  size={42}
                  className="text-blue-500 mb-3"
                />


                <p className="font-semibold">
                  Click to select file
                </p>


                <p className="text-sm text-slate-400 mt-2">
                  PDF • DOC • DOCX • PPT • XLS • ZIP
                </p>



                <input

                  hidden

                  type="file"

                  accept="
                    .pdf,
                    .doc,
                    .docx,
                    .ppt,
                    .pptx,
                    .xls,
                    .xlsx,
                    .zip
                  "

                  onChange={(e)=>
                    setFile(
                      e.target.files[0]
                    )
                  }

                />

              </label>




              {
                file && (

                  <div
                    className="
                      mt-4
                      bg-slate-800
                      border
                      border-slate-700
                      rounded-xl
                      p-4
                    "
                  >

                    <p className="font-medium">
                      {file.name}
                    </p>


                    <p className="text-sm text-slate-400">
                      {
                        (
                          file.size /
                          1024 /
                          1024
                        ).toFixed(2)
                      } MB
                    </p>

                  </div>

                )
              }


            </div>






            {/* BUTTON */}


            <button

              type="submit"

              disabled={uploading}

              className="
                w-full
                h-12
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                transition
                flex
                items-center
                justify-center
                gap-3
                disabled:opacity-50
              "

            >

              {
                uploading ?

                (

                  <>

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Uploading...

                  </>

                )

                :

                (

                  <>

                    <Upload size={18}/>

                    Upload Document

                  </>

                )
              }


            </button>


          </motion.form>








          {/* ==========================
              DOCUMENT LIST
          ========================== */}


          <motion.div

            initial={{
              opacity:0
            }}

            animate={{
              opacity:1
            }}

            className="
              rounded-3xl
              bg-slate-900
              border
              border-slate-800
              p-6
            "

          >



            <div
              className="
                flex
                items-center
                justify-between
                mb-6
              "
            >


              <div className="relative flex-1">


                <Search

                  size={18}

                  className="
                    absolute
                    left-4
                    top-3.5
                    text-slate-500
                  "

                />


                <input

                  value={search}

                  onChange={(e)=>
                    setSearch(
                      e.target.value
                    )
                  }

                  placeholder="Search documents..."

                  className="
                    w-full
                    h-12
                    rounded-xl
                    bg-slate-800
                    border
                    border-slate-700
                    pl-11
                    pr-4
                    outline-none
                  "

                />


              </div>




              <button

                onClick={fetchDocuments}

                className="
                  ml-4
                  w-12
                  h-12
                  rounded-xl
                  bg-slate-800
                  flex
                  items-center
                  justify-center
                "

              >

                <RefreshCw size={18}/>

              </button>



            </div>
                
                
            {
              loadingDocuments ?

              (

                <div
                  className="
                    h-60
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Loader2
                    className="animate-spin"
                  />

                </div>

              )

              :

              filteredDocuments.length === 0 ?

              (

                <div
                  className="text-center text-slate-400 py-20" >

                  No documents found.

                </div>

              ) : (

                <div className="space-y-4">

                  {
                    filteredDocuments.map(
                      (doc)=>(

                        <div
                          key={doc.id}
                          className="rounded-2xl bg-slate-800/50 border border-slate-700
                            p-5
                          "

                        >


                          <div
                            className="
                              flex
                              justify-between
                              gap-4
                            "
                          >
                            <div>

                              <h3 className="font-semibold text-lg">
                                {doc.title}
                              </h3>


                              <p className="text-sm text-slate-400 mt-2">
                                {doc.description}
                              </p>

                              <span
                                className="
                                  inline-block
                                  mt-3
                                  px-3
                                  py-1
                                  rounded-full
                                  bg-blue-600/20
                                  text-blue-400
                                  text-xs
                                "
                              >

                                {doc.category}

                              </span>
                            </div>

                            <div
                              className="
                                flex
                                gap-2
                              "
                            >

                              <button

                                onClick={() =>
                                  openDocument(
                                    doc.file_url
                                  )
                                }

                                className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center"

                              >

                                <ExternalLink size={18}/>

                              </button>

                              <button

                                onClick={() =>
                                  handleDelete(
                                    doc.id,
                                    doc.file_url
                                  )
                                }

                                className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center"

                              >

                                <Trash2 size={18}/>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )
                  }
                </div>

              )
            }
          </motion.div>

        </div>

      </div>
    </div>

  );

}