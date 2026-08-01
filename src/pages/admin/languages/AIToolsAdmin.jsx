import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Save,
  Loader2,
  Brain,
  Headphones,
  Mic,
  PenTool,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";


export default function AIToolsAdmin({
  languageId,
  mode = "aitutor",
}) {

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  const [prompt, setPrompt] =
    useState("");

  const [instructions, setInstructions] =
    useState("");

  const [level, setLevel] =
    useState("beginner");

  const [voice, setVoice] =
    useState("default");



  const getTitle = () => {

    if(mode === "listening")
      return "Listening AI";

    if(mode === "speaking")
      return "Speaking AI";

    if(mode === "writing")
      return "Writing AI";

    return "AI Tutor";

  };



  const getIcon = () => {

    if(mode === "listening")
      return Headphones;

    if(mode === "speaking")
      return Mic;

    if(mode === "writing")
      return PenTool;

    return Brain;

  };


  const Icon = getIcon();



  /* ==========================
      FETCH SETTINGS
  ========================== */

  const fetchSettings =
    useCallback(async()=>{

      if(!languageId)
        return;


      try{

        setLoading(true);


        const {
          data,
          error
        } =
          await supabase
          .from(
            "language_ai_settings"
          )
          .select("*")
          .eq(
            "language_id",
            languageId
          )
          .eq(
            "type",
            mode
          )
          .single();


        if(error &&
          error.code !== "PGRST116"
        )
          throw error;



        if(data){

          setPrompt(
            data.prompt || ""
          );

          setInstructions(
            data.instructions || ""
          );

          setLevel(
            data.level || "beginner"
          );

          setVoice(
            data.voice || "default"
          );

        }


      }catch(err){

        console.error(err);

      }
      finally{

        setLoading(false);

      }


    },[
      languageId,
      mode
    ]);



  useEffect(()=>{

    fetchSettings();

  },[
    fetchSettings
  ]);



  /* ==========================
      SAVE
  ========================== */

  const handleSave =
    async()=>{


    if(!languageId)
      return;


    try{

      setSaving(true);



      const payload = {

        language_id:
          languageId,

        type:
          mode,

        prompt,

        instructions,

        level,

        voice,

        updated_at:
          new Date()
          .toISOString(),

      };



      const {
        data
      } =
        await supabase
        .from(
          "language_ai_settings"
        )
        .select("id")
        .eq(
          "language_id",
          languageId
        )
        .eq(
          "type",
          mode
        )
        .single();



      if(data){

        await supabase
        .from(
          "language_ai_settings"
        )
        .update(payload)
        .eq(
          "id",
          data.id
        );


      }else{


        await supabase
        .from(
          "language_ai_settings"
        )
        .insert([
          payload
        ]);


      }


      alert(
        "AI settings saved"
      );


    }catch(err){

      console.error(err);

      alert(
        "Failed to save AI settings"
      );

    }
    finally{

      setSaving(false);

    }


  };



  if(loading){

    return (

      <div className="
        flex
        justify-center
        py-20
      ">

        <Loader2
          className="
          animate-spin
          text-indigo-500
          "
          size={40}
        />

      </div>

    );

  }



  return (

    <div className="
      rounded-3xl
      border
      border-white/10
      bg-[#111827]
      p-8
      space-y-8
    ">


      <div className="
        flex
        items-center
        justify-between
      ">

        <div className="
          flex
          items-center
          gap-4
        ">

          <div className="
            rounded-2xl
            bg-indigo-500/20
            p-4
          ">

            <Icon
              className="
              text-indigo-400
              "
              size={28}
            />

          </div>


          <div>

            <h2 className="
              text-2xl
              font-black
            ">

              {getTitle()}

            </h2>

            <p className="
              text-slate-400
            ">

              Configure AI learning support.

            </p>

          </div>

        </div>


        <button
          onClick={handleSave}
          disabled={saving}
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
          disabled:opacity-50
          "
        >

          {
            saving
            ?
            <Loader2
              size={18}
              className="animate-spin"
            />
            :
            <Save size={18}/>
          }


          Save

        </button>


      </div>



      <div className="
        space-y-5
      ">


        <textarea
          value={prompt}
          onChange={(e)=>
            setPrompt(e.target.value)
          }
          placeholder="
          AI Prompt
          "
          className="
          min-h-[120px]
          w-full
          rounded-2xl
          bg-[#020617]
          border
          border-white/10
          p-5
          text-white
          "
        />



        <textarea
          value={instructions}
          onChange={(e)=>
            setInstructions(e.target.value)
          }
          placeholder="
          Instructions
          "
          className="
          min-h-[160px]
          w-full
          rounded-2xl
          bg-[#020617]
          border
          border-white/10
          p-5
          text-white
          "
        />



        <div className="
          grid
          md:grid-cols-2
          gap-5
        ">


          <select
            value={level}
            onChange={(e)=>
              setLevel(e.target.value)
            }
            className="
            rounded-xl
            bg-[#020617]
            border
            border-white/10
            p-4
            "
          >

            <option value="beginner">
              Beginner
            </option>

            <option value="intermediate">
              Intermediate
            </option>

            <option value="advanced">
              Advanced
            </option>

          </select>



          <select
            value={voice}
            onChange={(e)=>
              setVoice(e.target.value)
            }
            className="
            rounded-xl
            bg-[#020617]
            border
            border-white/10
            p-4
            "
          >

            <option value="default">
              Default Voice
            </option>

            <option value="male">
              Male
            </option>

            <option value="female">
              Female
            </option>

          </select>


        </div>


      </div>


    </div>

  );

}