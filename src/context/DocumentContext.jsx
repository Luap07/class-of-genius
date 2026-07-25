// src/context/DocumentContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";


export const DocumentContext =
  createContext();


export const useDocuments = () =>
  useContext(DocumentContext);



export const DocumentProvider = ({
  children,
}) => {


  const [documents, setDocuments] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState(null);



  // ===========================
  // FETCH DOCUMENTS
  // ===========================

  const fetchDocuments = async () => {

    try {

      setLoading(true);

      setError(null);


      const {
        data,
        error,
      } =
        await supabase
          .from("documents")
          .select("*")
          .order(
            "created_at",
            {
              ascending:false,
            }
          );


      if(error)
        throw error;


      setDocuments(
        data || []
      );


    } catch(err){

      console.error(
        "Fetch Documents Error:",
        err
      );

      setError(
        err.message
      );


    } finally {

      setLoading(false);

    }

  };



  useEffect(()=>{

    fetchDocuments();

  },[]);




  // ===========================
  // DELETE DOCUMENT
  // ===========================

  const deleteDocument = async (
    id,
    fileUrl
  ) => {

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



      if(error)
        throw error;



      await fetchDocuments();



    } catch(err){

      console.error(
        "Delete Document Error:",
        err
      );

    }

  };





  // ===========================
  // OPEN DOCUMENT
  // ===========================

  const openDocument = (
    url
  ) => {

    window.open(
      url,
      "_blank"
    );

  };





  return (

    <DocumentContext.Provider

      value={{

        documents,

        loading,

        error,

        fetchDocuments,

        deleteDocument,

        openDocument,

      }}

    >

      {children}

    </DocumentContext.Provider>

  );

};