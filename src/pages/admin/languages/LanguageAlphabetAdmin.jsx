import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

import AlphabetStats from "../../../components/admin/languages/alphabet/AlphabetStats";
import AlphabetFilters from "../../../components/admin/languages/alphabet/AlphabetFilters";
import AlphabetGrid from "../../../components/admin/languages/alphabet/AlphabetGrid";
import AlphabetForm from "../../../components/admin/languages/alphabet/AlphabetForm";
import DeleteAlphabetModal from "../../../components/admin/languages/alphabet/DeleteAlphabetModal";
import EmptyAlphabet from "../../../components/admin/languages/alphabet/EmptyAlphabet";


export default function LanguageAlphabetAdmin() {


  /* =========================
      DATA
  ========================= */

  const [letters,setLetters] =
    useState([]);

  const [languages,setLanguages] =
    useState([]);

  const [filteredLetters,setFilteredLetters] =
    useState([]);



  /* =========================
      LOADING
  ========================= */

  const [loading,setLoading] =
    useState(true);

  const [refreshing,setRefreshing] =
    useState(false);



  /* =========================
      FILTERS
  ========================= */

  const [search,setSearch] =
    useState("");

  const [languageFilter,setLanguageFilter] =
    useState("all");



  /* =========================
      FORM
  ========================= */

  const [showForm,setShowForm] =
    useState(false);

  const [editingLetter,setEditingLetter] =
    useState(null);



  /* =========================
      DELETE
  ========================= */

  const [deleteLetter,setDeleteLetter] =
    useState(null);

  const [showDelete,setShowDelete] =
    useState(false);



  /* =========================
      FETCH LANGUAGES
  ========================= */


  const fetchLanguages = useCallback(
    async()=>{

      const {
        data,
        error
      } = await supabase
        .from("languages")
        .select(
          "id,name"
        )
        .order(
          "name"
        );


      if(error){

        console.error(error);

        return;

      }


      setLanguages(
        data || []
      );


    },
    []
  );



  /* =========================
      FETCH ALPHABET
  ========================= */


  const fetchLetters = useCallback(
    async()=>{

      try{

        setLoading(true);


        const {
          data,
          error
        } = await supabase
          .from(
            "language_alphabet"
          )
          .select(`
            *,
            languages(
              id,
              name
            )
          `)
          .order(
            "letter_order",
            {
              ascending:true
            }
          );


        if(error)
          throw error;


        setLetters(
          data || []
        );


      }
      catch(error){

        console.error(
          "Fetch Alphabet:",
          error
        );


      }
      finally{

        setLoading(false);

      }


    },
    []
  );



  useEffect(()=>{

    fetchLanguages();

    fetchLetters();

  },[
    fetchLanguages,
    fetchLetters
  ]);
  useEffect(()=>{

    fetchLanguages();

    fetchLetters();

  },[
    fetchLanguages,
    fetchLetters
  ]);



  /* =========================
      REFRESH
  ========================= */


  const handleRefresh = async()=>{

    try{

      setRefreshing(true);


      await Promise.all([
        fetchLanguages(),
        fetchLetters()
      ]);


    }
    finally{

      setRefreshing(false);

    }

  };




  /* =========================
      FILTER
  ========================= */


  const filteredData = useMemo(()=>{


    let data = [
      ...letters
    ];


    if(search.trim()){

      const keyword =
        search.toLowerCase();


      data = data.filter(
        (letter)=>{


          return (

            letter.letter
              ?.toLowerCase()
              .includes(keyword)

            ||

            letter.character
              ?.toLowerCase()
              .includes(keyword)

            ||

            letter.pronunciation
              ?.toLowerCase()
              .includes(keyword)

            ||

            letter.languages?.name
              ?.toLowerCase()
              .includes(keyword)

          );


        }
      );

    }



    if(languageFilter !== "all"){

      data =
        data.filter(
          (letter)=>
            String(
              letter.language_id
            )
            ===
            String(
              languageFilter
            )
        );

    }



    return data;


  },[
    letters,
    search,
    languageFilter
  ]);



  useEffect(()=>{

    setFilteredLetters(
      filteredData
    );

  },[
    filteredData
  ]);




  /* =========================
      STATS
  ========================= */


  const stats = useMemo(()=>({

    total:
      letters.length,


    languages:
      new Set(
        letters.map(
          item =>
          item.language_id
        )
      ).size,


    withAudio:
      letters.filter(
        item =>
        item.audio_url
      ).length,


    withExamples:
      letters.filter(
        item =>
        item.example_word
      ).length,


  }),[
    letters
  ]);




  /* =========================
      DELETE
  ========================= */


  const handleDelete = (letter)=>{

    setDeleteLetter(
      letter
    );

    setShowDelete(
      true
    );

  };




  const confirmDelete = async()=>{


    if(!deleteLetter)
      return;



    try{


      const {
        error
      } = await supabase
        .from(
          "language_alphabet"
        )
        .delete()
        .eq(
          "id",
          deleteLetter.id
        );



      if(error)
        throw error;



      setShowDelete(false);

      setDeleteLetter(null);


      fetchLetters();



    }
    catch(error){

      console.error(
        "Delete alphabet:",
        error
      );

    }


  };

    /* =========================
      SAVE ALPHABET
  ========================= */


  const handleSaveAlphabet = async(letterData)=>{

    try{


      const payload = {

        language_id:
          letterData.language_id,

        letter:
          letterData.letter,

        character:
          letterData.character,

        pronunciation:
          letterData.pronunciation,

        example_word:
          letterData.example_word,

        example_translation:
          letterData.example_translation,

        audio_url:
          letterData.audio_url,

        image_url:
          letterData.image_url,

        letter_order:
          letterData.letter_order,


      };




      if(editingLetter){


        const {
          error
        } = await supabase
          .from(
            "language_alphabet"
          )
          .update(payload)
          .eq(
            "id",
            editingLetter.id
          );


        if(error)
          throw error;



      }
      else{


        const {
          error
        } = await supabase
          .from(
            "language_alphabet"
          )
          .insert([
            payload
          ]);



        if(error)
          throw error;


      }



      setShowForm(false);

      setEditingLetter(null);


      fetchLetters();



    }
    catch(error){

      console.error(
        "Save alphabet:",
        error
      );

    }

  };





  return (

    <section
      className="
      space-y-8
      "
    >


      {/* HEADER */}


      <div
        className="
        flex
        flex-col
        gap-5
        lg:flex-row
        lg:items-center
        lg:justify-between
        "
      >


        <div>


          <h1
            className="
            text-4xl
            font-black
            text-white
            "
          >
            Language Alphabet
          </h1>


          <p
            className="
            mt-2
            text-slate-400
            "
          >
            Manage letters and characters for every language.
          </p>


        </div>



        <div
          className="
          flex
          gap-3
          "
        >


          <button

            onClick={
              handleRefresh
            }

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
            text-white
            "
          >

            {
              refreshing ?

              <Loader2
                className="animate-spin"
              />

              :

              <RefreshCw />

            }


            Refresh

          </button>




          <button

            onClick={()=>{

              setEditingLetter(null);

              setShowForm(true);

            }}

            className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-indigo-600
            px-6
            py-3
            font-bold
            text-white
            "
          >

            <Plus size={18}/>

            Add Letter

          </button>

        </div>
      </div>
      {/* STATS */}

      <AlphabetStats
        totalLetters={totalLetters}
        languagesCount={totalLanguages}
      />



      {/* FILTERS */}

      <AlphabetFilters

        search={search}

        setSearch={setSearch}

        languageFilter={languageFilter}

        setLanguageFilter={
          setLanguageFilter
        }

        languages={
          languages
        }

      />




      {/* CONTENT */}


      {
        loading ? (

          <div
            className="
            flex
            justify-center
            py-24
            "
          >

            <Loader2
              className="
              h-12
              w-12
              animate-spin
              text-indigo-500
              "
            />

          </div>


        )


        :

        filteredLetters.length === 0 ? (


          <EmptyAlphabet />


        )


        :


        (

          <AlphabetGrid

            letters={
              filteredLetters
            }


            onEdit={
              handleEdit
            }


            onDelete={
              handleDelete
            }


          />

        )

      }





      {/* FORM */}


      <AlphabetForm

        open={
          showForm
        }


        letter={
          editingLetter
        }


        languages={
          languages
        }


        saving={
          saving
        }


        onClose={()=>{

          setShowForm(false);

          setEditingLetter(null);

        }}



        onSave={
          handleSaveAlphabet
        }


      />





      {/* DELETE */}


      <DeleteAlphabetModal

        open={
          showDeleteModal
        }


        letter={
          deletingLetter
        }


        deleting={
          deleting
        }


        onClose={()=>{

          setShowDeleteModal(false);

          setDeletingLetter(null);

        }}



        onConfirm={
          confirmDelete
        }


      />


    </section>

  );

}