import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";


/* Hero */
import LanguageOverviewHero from "../../components/languages/LanguageOverviewHero";


/* Tabs */
import LanguageTabs from "../../components/languages/LanguageTabs";


/* Sections */
import LanguageOverview from "../../components/languages/LanguageOverview";
import LanguageAlphabet from "../../components/languages/LanguageAlphabet";
import LanguageVocabulary from "../../components/languages/LanguageVocabulary";
import LanguageGrammar from "../../components/languages/LanguageGrammar";
import LanguageWriting from "../../components/languages/LanguageWriting";
import LanguageLessons from "../../components/languages/LanguageLessons";


export default function LanguageDetails() {

  const { id } = useParams();


  const [activeTab, setActiveTab] = useState(
    "Overview"
  );


  const [language, setLanguage] = useState(null);

  const [loadingLanguage, setLoadingLanguage] =
    useState(true);


  const [lessons, setLessons] = useState([]);

  const [loadingLessons, setLoadingLessons] =
    useState(false);



  useEffect(() => {

    async function fetchLanguage() {

      try {

        setLoadingLanguage(true);


        const {
          data,
          error,
        } = await supabase
          .from("languages")
          .select("*")
          .eq("id", id)
          .single();


        if (error) {
          throw error;
        }


        setLanguage(data);


      } catch (error) {

        console.error(
          "Language Fetch Error:",
          error
        );


      } finally {

        setLoadingLanguage(false);

      }

    }


    if (id) {
      fetchLanguage();
    }


  }, [id]);





  useEffect(() => {

    if (!language?.id) return;


    async function fetchLessons() {

      try {

        setLoadingLessons(true);


        const {
          data,
          error,
        } = await supabase
          .from("language_materials")
          .select("*")
          .eq(
            "language_id",
            language.id
          )
          .order(
            "created_at",
            {
              ascending:false,
            }
          );


        if (error) {
          throw error;
        }


        setLessons(
          data || []
        );


      } catch(error) {

        console.error(
          "Lessons Fetch Error:",
          error
        );


      } finally {

        setLoadingLessons(false);

      }

    }


    fetchLessons();


  }, [language]);





  if (loadingLanguage) {

    return (

      <section
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-[#020617]
          text-white
        "
      >

        <div className="text-center">

          <div
            className="
              mx-auto
              h-14
              w-14
              animate-spin
              rounded-full
              border-4
              border-blue-500
              border-t-transparent
            "
          />


          <p
            className="
              mt-6
              text-slate-400
            "
          >
            Loading language...
          </p>


        </div>

      </section>

    );

  }





  if (!language) {

    return (

      <section
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-[#020617]
          text-white
        "
      >

        <h1
          className="
            text-4xl
            font-black
          "
        >
          Language not found
        </h1>


      </section>

    );

  }





  return (

    <section
      className="
        min-h-screen
        bg-[#020617]
        text-white
      "
    >


      <LanguageOverviewHero
        language={language}
      />



      <LanguageTabs

        activeTab={activeTab}

        setActiveTab={setActiveTab}

      />




      <div
        className="
          mx-auto
          mt-12
          max-w-7xl
          px-6
          pb-20
        "
      >



        {activeTab === "Overview" && (

          <LanguageOverview
            language={language}
          />

        )}





        {activeTab === "Alphabet" && (

          <LanguageAlphabet
            language={language}
          />

        )}





        {activeTab === "Grammar" && (

          <LanguageGrammar
            language={language}
          />

        )}





        {activeTab === "Vocabulary" && (

          <LanguageVocabulary
            language={language}
          />

        )}





        {activeTab === "Writing" && (

          <LanguageWriting
            language={language}
          />

        )}





        {activeTab === "Lessons" && (

          <LanguageLessons

            language={language}

            lessons={lessons}

            loading={loadingLessons}

          />

        )}



      </div>



    </section>

  );

}