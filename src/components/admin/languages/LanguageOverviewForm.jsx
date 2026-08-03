// src/components/admin/languages/LanguageOverviewForm.jsx

import React, { useState } from "react";

import {
  Loader2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";


export default function LanguageOverviewForm({
  language,
  overview,
  onClose,
  refresh,
}) {


  const [loading,setLoading] = useState(false);



  const [title,setTitle] = useState(
    overview?.title || ""
  );


  const [description,setDescription] = useState(
    overview?.description || ""
  );


  const [objectives,setObjectives] = useState(
    overview?.objectives || ""
  );



  // NEW FIELDS

  const [difficulty,setDifficulty] = useState(
    overview?.difficulty || ""
  );


  const [primaryRegion,setPrimaryRegion] = useState(
    overview?.primary_region || ""
  );


  const speakers = "Worldwide";

  const [heroFile,setHeroFile] = useState(null);

  const [coverFile,setCoverFile] = useState(null);





  const uploadImage = async(file,folder)=>{


    if(!file)
      return null;



    const fileName =
      `${folder}/${Date.now()}-${file.name}`;



    const {
      error
    } = await supabase.storage
      .from("language-images")
      .upload(fileName,file);



    if(error)
      throw error;



    const {
      data
    } =
    supabase.storage
    .from("language-images")
    .getPublicUrl(fileName);



    return data.publicUrl;

  };




  const handleSave = async()=>{


    if(!language?.id)
      return;



    try{


      setLoading(true);



      let heroImage =
        overview?.hero_image || null;



      let coverImage =
        overview?.cover_image || null;



      if(heroFile){

        heroImage =
          await uploadImage(
            heroFile,
            "hero"
          );

      }



      if(coverFile){

        coverImage =
          await uploadImage(
            coverFile,
            "cover"
          );

      }



      const payload = {


        language_id:
          language.id,


        title,


        description,


        objectives,


        difficulty,


        primary_region:
          primaryRegion,


        speakers,


        hero_image:
          heroImage,


        cover_image:
          coverImage,


        updated_at:
          new Date().toISOString(),

      };
        let error;
let savedData;


if (overview?.id) {


  const result =
    await supabase

    .from("language_overviews")

    .update(payload)

    .eq(
      "id",
      overview.id
    )

    .select()
    
    .single();



  error =
    result.error;


  savedData =
    result.data;



} else {


  const result =
    await supabase

    .from("language_overviews")

    .insert({

      ...payload,

      created_at:
        new Date().toISOString(),

    })

    .select()

    .single();



  error =
    result.error;


  savedData =
    result.data;


}
      console.log(
        "SAVED OVERVIEW:",
        savedData
      );



      if(error)
        throw error;



      alert(
        "Overview saved successfully"
      );



      if(refresh)
        await refresh();



      if(onClose)
        onClose();



    }catch(err){


      console.error(
        "Save Overview:",
        err
      );


      alert(
        "Failed to save overview"
      );



    }finally{


      setLoading(false);


    }


  };





  return (

    <div
      className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/70
      p-6
      backdrop-blur-sm
      "
    >


      <div
        className="
        max-h-[90vh]
        w-full
        max-w-3xl
        overflow-y-auto
        rounded-3xl
        border
        border-white/10
        bg-[#07111f]
        p-8
        text-white
        "
      >


        <div
          className="
          mb-8
          flex
          items-center
          justify-between
          "
        >


          <h2
            className="
            text-3xl
            font-black
            "
          >

            {overview
              ? "Edit Overview"
              : "Create Overview"
            }

          </h2>



          <button

            onClick={onClose}

            className="
            rounded-xl
            bg-white/10
            p-2
            hover:bg-white/20
            "
          >

            <X size={20}/>

          </button>


        </div>





        <div className="space-y-6">



          <div>

            <label className="
              mb-2
              block
              text-xs
              font-bold
              uppercase
              text-slate-400
            ">

              Overview Title

            </label>



            <input

              value={title}

              onChange={(e)=>
                setTitle(e.target.value)
              }

              placeholder="Overview title"

              className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-black/20
              px-5
              py-4
              text-white
              outline-none
              focus:border-cyan-500
              "

            />

          </div>





          <div>

            <label className="
            mb-2
            block
            text-xs
            font-bold
            uppercase
            text-slate-400
            ">

              Difficulty Level

            </label>



            <select

              value={difficulty}

              onChange={(e)=>
                setDifficulty(e.target.value)
              }


              className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-black/20
              px-5
              py-4
              text-white
              outline-none
              "

            >

              <option>
                Beginner
              </option>


              <option>
                Intermediate
              </option>


              <option>
                Advanced
              </option>


            </select>


          </div>




          <div className="
          grid
          gap-5
          md:grid-cols-2
          ">


            <div>


              <label className="
              mb-2
              block
              text-xs
              font-bold
              uppercase
              text-slate-400
              ">

                Primary Region

              </label>



              <input

                value={primaryRegion}

                onChange={(e)=>
                  setPrimaryRegion(
                    e.target.value
                  )
                }


                placeholder="Example: Europe"

                className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-black/20
                px-5
                py-4
                text-white
                "

              />


            </div>



            <div>


              <label className="
              mb-2
              block
              text-xs
              font-bold
              uppercase
              text-slate-400
              ">

                Speakers

              </label>


              <input

                value={speakers}

                disabled


                className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-black/20
                px-5
                py-4
                text-slate-400
                "

              />


            </div>



          </div>
                    <div>

            <label
              className="
              mb-2
              block
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-slate-400
              "
            >
              Language Description
            </label>


            <textarea

              value={description}

              onChange={(e)=>
                setDescription(
                  e.target.value
                )
              }


              placeholder="Language description"

              rows={6}


              className="
              w-full
              resize-none
              rounded-2xl
              border
              border-white/10
              bg-black/20
              p-5
              text-white
              outline-none
              focus:border-cyan-500
              "

            />

          </div>





          <div>

            <label
              className="
              mb-2
              block
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-slate-400
              "
            >
              Learning Objectives
            </label>



            <textarea

              value={objectives}

              onChange={(e)=>
                setObjectives(
                  e.target.value
                )
              }


              placeholder="Learning objectives"


              rows={5}


              className="
              w-full
              resize-none
              rounded-2xl
              border
              border-white/10
              bg-black/20
              p-5
              text-white
              outline-none
              focus:border-cyan-500
              "

            />


          </div>





          <div
            className="
            grid
            gap-5
            md:grid-cols-2
            "
          >


            <label
              className="
              cursor-pointer
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-5
              hover:border-cyan-500/40
              "
            >


              <div
                className="
                flex
                items-center
                gap-3
                text-slate-300
                "
              >

                <Upload
                  size={20}
                  className="text-cyan-400"
                />


                Hero Image


              </div>



              <p
                className="
                mt-4
                truncate
                text-xs
                text-slate-400
                "
              >

                {
                  heroFile
                  ? heroFile.name
                  :
                  overview?.hero_image
                  ? "Existing image"
                  :
                  "No file selected"
                }


              </p>



              <input

                type="file"

                accept="image/*"

                hidden

                onChange={(e)=>
                  setHeroFile(
                    e.target.files[0]
                  )
                }

              />


            </label>





            <label
              className="
              cursor-pointer
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-5
              hover:border-cyan-500/40
              "
            >


              <div
                className="
                flex
                items-center
                gap-3
                text-slate-300
                "
              >

                <Upload
                  size={20}
                  className="text-cyan-400"
                />

                Cover Image


              </div>



              <p
                className="
                mt-4
                truncate
                text-xs
                text-slate-400
                "
              >

                {
                  coverFile
                  ? coverFile.name
                  :
                  overview?.cover_image
                  ? "Existing image"
                  :
                  "No file selected"
                }


              </p>




              <input

                type="file"

                accept="image/*"

                hidden


                onChange={(e)=>
                  setCoverFile(
                    e.target.files[0]
                  )
                }

              />


            </label>



          </div>





          <button

            onClick={handleSave}

            disabled={loading}


            className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-2xl
            bg-cyan-500
            py-4
            font-black
            text-black
            transition
            hover:bg-cyan-400
            disabled:opacity-50
            "

          >

            {
              loading
              ?
              <Loader2
                className="
                h-5
                w-5
                animate-spin
                "
              />
              :
              <Save size={20}/>
            }


            Save Overview


          </button>



        </div>


      </div>


    </div>

  );


}