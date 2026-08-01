import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Plus,
  RefreshCw,
  Loader2,
  Globe,
  BookOpen,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { supabase } from "../../../lib/supabaseClient";

import LanguageContentManager from "../../../components/admin/languages/LanguageContentManager";

import LanguageStats from "../../../components/admin/languages/LanguageStats";
import LanguageFilters from "../../../components/admin/languages/LanguageFilters";
import LanguagesGrid from "../../../components/admin/languages/LanguagesGrid";
import LanguageForm from "../../../components/admin/languages/LanguageForm";
import LanguageMaterialUpload from "../../../components/admin/languages/LanguageMaterialUpload";
import DeleteLanguageModal from "../../../components/admin/languages/DeleteLanguageModal";
import EmptyLanguages from "../../../components/admin/languages/EmptyLanguages";


export default function LanguagesAdmin() {

  const navigate = useNavigate();


  const goToLanguagesFrontend = () => {
    navigate("/admin/languages/lessons");
  };


  /* ===============================
      LANGUAGES DATA
  =============================== */

  const [languages,setLanguages] = useState([]);
  const [filteredLanguages,setFilteredLanguages] = useState([]);


  /* ===============================
      LOADING
  =============================== */

  const [loading,setLoading] = useState(true);
  const [refreshing,setRefreshing] = useState(false);


  /* ===============================
      SEARCH
  =============================== */

  const [search,setSearch] = useState("");
  const [statusFilter,setStatusFilter] = useState("all");
  const [regionFilter,setRegionFilter] = useState("all");



  /* ===============================
      CONTENT MANAGER
  =============================== */

  const [contentLanguage,setContentLanguage] = useState(null);
  const [showContentManager,setShowContentManager] = useState(false);



  /* ===============================
      SELECTED LANGUAGE
      FOR TOP BUTTON
  =============================== */

  const [selectedLanguage,setSelectedLanguage] = useState(null);



  /* ===============================
      FETCH LANGUAGES
  =============================== */

  const fetchLanguages = useCallback(async()=>{

    try{

      setLoading(true);


      const {
        data,
        error
      } = await supabase
        .from("languages")
        .select("*")
        .order("created_at",{
          ascending:false
        });


      if(error) throw error;


      setLanguages(data || []);


    }catch(error){

      console.error(
        "Fetch Languages:",
        error
      );

    }finally{

      setLoading(false);

    }


  },[]);



  useEffect(()=>{

    fetchLanguages();

  },[fetchLanguages]);



  /* ===============================
      REFRESH
  =============================== */


  const handleRefresh = async()=>{

    try{

      setRefreshing(true);

      await fetchLanguages();


    }finally{

      setRefreshing(false);

    }

  };



  /* ===============================
      OPEN CONTENT MANAGER
  =============================== */


  const handleOpenContent = ()=>{

    if(!selectedLanguage){

      alert(
        "Please select a language first."
      );

      return;

    }


    setContentLanguage(selectedLanguage);

    setShowContentManager(true);

  };



  const closeContentManager = ()=>{

    setShowContentManager(false);

    setContentLanguage(null);

  };
    /* ===============================
      CREATE LANGUAGE
  =============================== */

  const [showCreateModal,setShowCreateModal] = useState(false);

  const [saving,setSaving] = useState(false);

  const [languageName,setLanguageName] = useState("");
  const [languageCode,setLanguageCode] = useState("");
  const [nativeName,setNativeName] = useState("");
  const [region,setRegion] = useState("");
  const [description,setDescription] = useState("");

  const [flagFile,setFlagFile] = useState(null);
  const [coverImage,setCoverImage] = useState(null);



  /* ===============================
      EDIT LANGUAGE
  =============================== */

  const [editingLanguage,setEditingLanguage] = useState(null);
  const [showEditModal,setShowEditModal] = useState(false);
  const [updating,setUpdating] = useState(false);



  /* ===============================
      DELETE LANGUAGE
  =============================== */

  const [
    deletingLanguage,
    setDeletingLanguage
  ] = useState(null);

  const [
    showDeleteModal,
    setShowDeleteModal
  ] = useState(false);

  const [
    deleting,
    setDeleting
  ] = useState(false);



  /* ===============================
      UPLOAD MATERIAL
  =============================== */


  const [
    materialLanguage,
    setMaterialLanguage
  ] = useState(null);


  const [
    showUploadModal,
    setShowUploadModal
  ] = useState(false);



  /* ===============================
      UPLOAD FILE
  =============================== */

  const uploadFile = async(file,bucket)=>{

    if(!file) return null;


    const ext =
      file.name.split(".").pop();


    const filename =
      `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${ext}`;



    const {
      error
    } = await supabase.storage
      .from(bucket)
      .upload(filename,file);



    if(error)
      throw error;



    const {
      data
    } =
      supabase.storage
      .from(bucket)
      .getPublicUrl(filename);



    return data.publicUrl;

  };



  /* ===============================
      RESET FORM
  =============================== */


  const resetForm = ()=>{

    setLanguageName("");
    setLanguageCode("");
    setNativeName("");
    setRegion("");
    setDescription("");

    setFlagFile(null);
    setCoverImage(null);

    setEditingLanguage(null);

    setShowCreateModal(false);
    setShowEditModal(false);

  };



  /* ===============================
      CREATE LANGUAGE
  =============================== */


  const handleCreateLanguage = async()=>{


    try{

      setSaving(true);


      let flagUrl="";
      let coverUrl="";



      if(flagFile){

        flagUrl =
        await uploadFile(
          flagFile,
          "language-flags"
        );

      }



      if(coverImage){

        coverUrl =
        await uploadFile(
          coverImage,
          "language-covers"
        );

      }



      const {
        error
      } =
      await supabase
      .from("languages")
      .insert([

        {

          name:languageName,

          code:
          languageCode.toLowerCase(),

          native_name:nativeName,

          region,

          description,

          flag_url:flagUrl,

          cover_url:coverUrl,

          active:true

        }

      ]);



      if(error)
        throw error;



      resetForm();

      fetchLanguages();



    }catch(error){

      console.error(
        "Create Language:",
        error
      );

    }finally{

      setSaving(false);

    }

  };
    /* ===============================
      EDIT LANGUAGE
  =============================== */

  const handleEdit = (language)=>{

    setEditingLanguage(language);

    setLanguageName(language.name || "");
    setLanguageCode(language.code || "");
    setNativeName(language.native_name || "");
    setRegion(language.region || "");
    setDescription(language.description || "");

    setShowEditModal(true);

  };



  const handleSaveEdit = async()=>{

    if(!editingLanguage)
      return;


    try{

      setUpdating(true);


      let flagUrl =
      editingLanguage.flag_url;


      let coverUrl =
      editingLanguage.cover_url;



      if(flagFile){

        flagUrl =
        await uploadFile(
          flagFile,
          "language-flags"
        );

      }



      if(coverImage){

        coverUrl =
        await uploadFile(
          coverImage,
          "language-covers"
        );

      }



      const {
        error
      } =
      await supabase
      .from("languages")
      .update({

        name:languageName,

        code:
        languageCode.toLowerCase(),

        native_name:nativeName,

        region,

        description,

        flag_url:flagUrl,

        cover_url:coverUrl,

        updated_at:
        new Date().toISOString()

      })
      .eq(
        "id",
        editingLanguage.id
      );



      if(error)
        throw error;



      resetForm();

      fetchLanguages();



    }catch(error){

      console.error(
        "Update Language:",
        error
      );


    }finally{

      setUpdating(false);

    }

  };




  /* ===============================
      DELETE LANGUAGE
  =============================== */


  const handleDelete=(language)=>{

    setDeletingLanguage(language);

    setShowDeleteModal(true);

  };



  const confirmDelete = async()=>{

    if(!deletingLanguage)
      return;



    try{

      setDeleting(true);



      const {
        error
      } =
      await supabase
      .from("languages")
      .delete()
      .eq(
        "id",
        deletingLanguage.id
      );



      if(error)
        throw error;



      setDeletingLanguage(null);

      setShowDeleteModal(false);


      fetchLanguages();



    }catch(error){

      console.error(
        "Delete Language:",
        error
      );


    }finally{

      setDeleting(false);

    }

  };




  /* ===============================
      OPEN UPLOAD
  =============================== */


  const handleOpenUpload=(language)=>{

    setMaterialLanguage(language);

    setShowUploadModal(true);

  };



  const closeUploadModal=()=>{

    setMaterialLanguage(null);

    setShowUploadModal(false);

  };



  const closeDeleteModal=()=>{

    setDeletingLanguage(null);

    setShowDeleteModal(false);

  };




  /* ===============================
      FILTER DATA
  =============================== */


  const filteredData = useMemo(()=>{


    let data=[...languages];



    if(search.trim()){


      const keyword =
      search.toLowerCase();



      data =
      data.filter(language=>{


        return (

          language.name
          ?.toLowerCase()
          .includes(keyword)

          ||

          language.native_name
          ?.toLowerCase()
          .includes(keyword)

          ||

          language.code
          ?.toLowerCase()
          .includes(keyword)

        );


      });


    }



    if(statusFilter !== "all"){


      data =
      data.filter(language=>{


        if(statusFilter==="active")

          return language.active===true;



        if(statusFilter==="inactive")

          return language.active===false;



        return true;


      });


    }



    if(regionFilter !== "all"){


      data =
      data.filter(
        language =>
        language.region === regionFilter
      );


    }



    return data;



  },[
    languages,
    search,
    statusFilter,
    regionFilter
  ]);



  useEffect(()=>{

    setFilteredLanguages(filteredData);

  },[filteredData]);



  const regions =
  useMemo(()=>{


    return [

      "all",

      ...new Set(
        languages
        .map(
          item=>item.region
        )
        .filter(Boolean)
      )

    ];


  },[languages]);



  const totalLanguages =
  languages.length;


  const activeLanguages =
  languages.filter(
    item=>item.active
  ).length;


  const inactiveLanguages =
  languages.filter(
    item=>!item.active
  ).length;


  const totalRegions =
  new Set(
    languages
    .map(item=>item.region)
    .filter(Boolean)
  ).size;
    return (
    <>
      <div className="
        min-h-screen
        bg-[#030712]
        p-6
        text-white
      ">


        {/* ===============================
            HEADER
        =============================== */}

        <div className="
          mb-10
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        ">


          <div>

            <h1 className="
              text-5xl
              font-black
            ">
              Languages
            </h1>


            <p className="
              mt-3
              text-lg
              text-gray-400
            ">
              Manage all languages available in your LMS.
            </p>

          </div>




          <div className="
            flex
            flex-wrap
            items-center
            gap-4
          ">


            {/* MANAGE CONTENT BUTTON */}

            <button
              onClick={handleOpenContent}
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                bg-purple-600
                px-6
                py-3
                font-bold
                transition
                hover:bg-purple-500
                cursor-pointer
              "
            >

              <BookOpen size={20}/>

              Manage Content

            </button>




            <button
              onClick={goToLanguagesFrontend}
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                bg-white/10
                px-5
                py-3
                font-bold
                hover:bg-white/20
                cursor-pointer
              "
            >

              <Globe size={18}/>

              Languages Frontend

            </button>





            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                bg-white/10
                px-5
                py-3
                font-bold
                hover:bg-white/20
                disabled:opacity-50
                cursor-pointer
              "
            >

              <RefreshCw
                size={18}
                className={
                  refreshing
                  ? "animate-spin"
                  : ""
                }
              />

              Refresh

            </button>





            <button
              onClick={()=>setShowCreateModal(true)}
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                bg-indigo-600
                px-6
                py-3
                font-bold
                hover:bg-indigo-500
                cursor-pointer
              "
            >

              <Plus size={20}/>

              Add Language

            </button>


          </div>


        </div>




        {/* ===============================
            STATS
        =============================== */}

        <LanguageStats

          totalLanguages={totalLanguages}

          activeLanguages={activeLanguages}

          inactiveLanguages={inactiveLanguages}

          totalRegions={totalRegions}

        />




        {/* ===============================
            FILTERS
        =============================== */}

        <LanguageFilters

          search={search}

          setSearch={setSearch}

          statusFilter={statusFilter}

          setStatusFilter={setStatusFilter}

          regionFilter={regionFilter}

          setRegionFilter={setRegionFilter}

          regions={regions}

          onReset={()=>{
            setSearch("");
            setStatusFilter("all");
            setRegionFilter("all");
          }}

        />
                {/* ===============================
            CONTENT GRID
        =============================== */}


        {
          loading ? (

            <div className="
              flex
              justify-center
              py-24
            ">

              <Loader2
                className="
                  h-12
                  w-12
                  animate-spin
                  text-indigo-500
                "
              />

            </div>


          ) : filteredLanguages.length === 0 ? (


            <EmptyLanguages

              searching={
                search !== "" ||
                statusFilter !== "all" ||
                regionFilter !== "all"
              }

              onCreate={()=>setShowCreateModal(true)}

            />


          ) : (


            <LanguagesGrid

              languages={filteredLanguages}

              loading={loading}

              onEdit={handleEdit}

              onDelete={handleDelete}

              onUpload={handleOpenUpload}


              /*
                IMPORTANT:
                This selects the language
                for the top Manage Content button
              */

              onSelectLanguage={(language)=>{

                setSelectedLanguage(language);

              }}


            />


          )

        }





        {/* ===============================
            CREATE LANGUAGE
        =============================== */}


        <LanguageForm

          open={showCreateModal}

          languageName={languageName}

          setLanguageName={setLanguageName}

          nativeName={nativeName}

          setNativeName={setNativeName}

          languageCode={languageCode}

          setLanguageCode={setLanguageCode}

          region={region}

          setRegion={setRegion}

          description={description}

          setDescription={setDescription}

          flagFile={flagFile}

          setFlagFile={setFlagFile}

          coverImage={coverImage}

          setCoverImage={setCoverImage}

          loading={saving}

          onClose={resetForm}

          onSave={handleCreateLanguage}

        />






        {/* ===============================
            EDIT LANGUAGE
        =============================== */}


        <LanguageForm

          open={showEditModal}

          editing

          language={editingLanguage}


          languageName={languageName}

          setLanguageName={setLanguageName}


          nativeName={nativeName}

          setNativeName={setNativeName}


          languageCode={languageCode}

          setLanguageCode={setLanguageCode}


          region={region}

          setRegion={setRegion}


          description={description}

          setDescription={setDescription}


          flagFile={flagFile}

          setFlagFile={setFlagFile}


          coverImage={coverImage}

          setCoverImage={setCoverImage}


          loading={updating}


          onClose={resetForm}

          onSave={handleSaveEdit}

        />






        {/* ===============================
            UPLOAD MATERIAL
        =============================== */}


        <LanguageMaterialUpload

          open={showUploadModal}

          language={materialLanguage}

          onClose={closeUploadModal}

          onUploaded={fetchLanguages}

        />







        {/* ===============================
            LANGUAGE CONTENT MANAGER
        =============================== */}


        <LanguageContentManager

          open={showContentManager}

          language={contentLanguage}

          onClose={closeContentManager}

        />







        {/* ===============================
            DELETE LANGUAGE
        =============================== */}


        <DeleteLanguageModal

          open={showDeleteModal}

          language={deletingLanguage}

          deleting={deleting}

          onClose={closeDeleteModal}

          onConfirm={confirmDelete}

        />



      </div>

    </>

  );

}