import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Languages,
  Globe,
  Hash,
} from "lucide-react";
import LanguageMaterialUpload from "./LanguageMaterialUpload";

export default function LanguageForm({
  open,
  editing = false,
  language,

  languageName,
  setLanguageName,

  nativeName,
  setNativeName,

  languageCode,
  setLanguageCode,

  region,
  setRegion,

  description,
  setDescription,

  flagFile,
  setFlagFile,

  coverImage,
  setCoverImage,

  loading = false,

  onClose,
  onSave,
}) {

  return (
    <AnimatePresence>

      {open && (

        <motion.div
          initial={{opacity:0}}
          animate={{opacity:1}}
          exit={{opacity:0}}
          className="
          fixed inset-0 z-[100]
          overflow-y-auto
          bg-black/70
          backdrop-blur-md
          "
        >

          <div className="
          flex min-h-screen
          items-center
          justify-center
          p-4
          ">


            <motion.div

              initial={{
                opacity:0,
                scale:0.95,
                y:20
              }}

              animate={{
                opacity:1,
                scale:1,
                y:0
              }}

              exit={{
                opacity:0,
                scale:0.95,
                y:20
              }}

              className="
              w-full
              max-w-3xl
              max-h-[90vh]
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-[#111827]
              shadow-2xl
              "
            >


              {/* HEADER */}

              <div className="
              flex
              items-center
              justify-between
              border-b
              border-white/10
              px-8
              py-6
              ">


                <div>

                  <h2 className="
                  text-3xl
                  font-black
                  text-white
                  ">

                    {editing
                    ? "Edit Language"
                    : "Add Language"}

                  </h2>


                  <p className="text-gray-400">

                    Manage language information

                  </p>

                </div>


                <button
                onClick={onClose}
                className="
                rounded-xl
                bg-white/10
                p-3
                hover:bg-red-500
                "
                >

                  <X className="text-white"/>

                </button>


              </div>



              {/* BODY */}

              <div className="
              space-y-6
              overflow-y-auto
              p-8
              max-h-[65vh]
              ">



                {/* NAME */}

                <div>

                  <label className="text-gray-300">
                    Language Name
                  </label>


                  <div className="relative mt-2">

                    <Languages
                    className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-indigo-400
                    "
                    />


                    <input

                    value={languageName}

                    onChange={(e)=>
                    setLanguageName(e.target.value)
                    }

                    className="
                    w-full
                    rounded-2xl
                    bg-[#1f2937]
                    py-3
                    pl-12
                    text-white
                    border
                    border-white/10
                    "
                    />

                  </div>

                </div>



                {/* NATIVE NAME */}

                <div>

                <label className="text-gray-300">
                  Native Name
                </label>

                <input

                value={nativeName}

                onChange={(e)=>
                setNativeName(e.target.value)
                }

                className="
                mt-2
                w-full
                rounded-2xl
                bg-[#1f2937]
                px-4
                py-3
                text-white
                border
                border-white/10
                "

                />

                </div>




                <div className="
                grid
                md:grid-cols-2
                gap-6
                ">


                  <div>

                  <label className="text-gray-300">
                  Code
                  </label>


                  <div className="relative mt-2">

                  <Hash
                  className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-cyan-400
                  "
                  />

                  <input

                  value={languageCode}

                  onChange={(e)=>
                  setLanguageCode(e.target.value)
                  }

                  className="
                  w-full
                  rounded-2xl
                  bg-[#1f2937]
                  py-3
                  pl-12
                  text-white
                  border
                  border-white/10
                  "

                  />

                  </div>

                  </div>




                  <div>

                  <label className="text-gray-300">
                  Region
                  </label>


                  <div className="relative mt-2">

                  <Globe
                  className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-green-400
                  "
                  />


                  <input

                  value={region}

                  onChange={(e)=>
                  setRegion(e.target.value)
                  }

                  className="
                  w-full
                  rounded-2xl
                  bg-[#1f2937]
                  py-3
                  pl-12
                  text-white
                  border
                  border-white/10
                  "

                  />

                  </div>

                  </div>


                </div>




                {/* DESCRIPTION */}

                <textarea

                rows="5"

                value={description}

                onChange={(e)=>
                setDescription(e.target.value)
                }

                placeholder="Description"

                className="
                w-full
                rounded-2xl
                bg-[#1f2937]
                px-4
                py-3
                text-white
                border
                border-white/10
                "

                />

{/* LEARNING MATERIALS */}

{editing && language && (
  <div className="mt-10 border-t border-white/10 pt-8">

    <h3 className="
      mb-5
      text-2xl
      font-black
      text-white
    ">
      Learning Materials
    </h3>

    <LanguageMaterialUpload
      language={language}
    />

  </div>
)}


                {/* FILES */}


                <div className="
                grid
                md:grid-cols-2
                gap-6
                ">


                <div>

                <label className="text-gray-300">
                Flag
                </label>


                <input

                type="file"

                accept="image/*"

                onChange={(e)=>
                setFlagFile(
                e.target.files?.[0] || null
                )
                }

                className="mt-2 text-gray-300"

                />

                </div>



                <div>

                <label className="text-gray-300">
                Cover
                </label>


                <input

                type="file"

                accept="image/*"

                onChange={(e)=>
                setCoverImage(
                e.target.files?.[0] || null
                )
                }

                className="mt-2 text-gray-300"

                />

                </div>


                </div>



              </div>




              {/* FOOTER */}

              <div className="
              flex
              justify-end
              gap-4
              border-t
              border-white/10
              px-8
              py-6
              ">


              <button

              onClick={onClose}

              className="
              rounded-2xl
              px-6
              py-3
              text-gray-300
              border
              border-white/10
              "

              >

              Cancel

              </button>



              <button

              onClick={onSave}

              disabled={loading}

              className="
              rounded-2xl
              bg-indigo-600
              px-8
              py-3
              font-bold
              text-white
              "

              >

              {loading
              ? "Saving..."
              : editing
              ? "Update Language"
              : "Create Language"}

              </button>


              </div>


            </motion.div>

          </div>


        </motion.div>

      )}

    </AnimatePresence>
  );
}