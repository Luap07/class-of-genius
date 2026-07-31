import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Languages,
  Mic,
  Volume2,
  Copy,
  Sparkles,
} from "lucide-react";

import TranslateInput from "../../components/languages/Translator/TranslateInput";
import TranslateOutput from "../../components/languages/Translator/TranslateOutput";
import LanguagePicker from "../../components/languages/Translator/LanguagePicker";
import VoiceInput from "../../components/languages/Translator/VoiceInput";
import CameraInput from "../../components/languages/Translator/CameraInput";

import useTranslator from "../../hooks/Language/useTranslator";



const Translator = () => {

  const {

    text,

    setText,

    translation,

    sourceLanguage,

    setSourceLanguage,

    targetLanguage,

    setTargetLanguage,

    loading,

    error,

    translate,

    swapLanguages,

    clear,

  } = useTranslator();




  const handleTranslate = () => {

    translate({

      text,

      from:
        sourceLanguage,

      to:
        targetLanguage,

    });

  };




  const copyTranslation = () => {

    if (translation) {

      navigator.clipboard.writeText(
        translation
      );

    }

  };




  return (

    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">


      <div className="mx-auto max-w-6xl">


        {/* Hero */}

        <motion.div
          initial={{
            opacity:0,
            y:20,
          }}
          animate={{
            opacity:1,
            y:0,
          }}
          className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8"
        >

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-cyan-500/20 p-4">

              <Languages
                size={35}
                className="text-cyan-400"
              />

            </div>


            <div>

              <h1 className="text-4xl font-black">

                AI Translator

              </h1>


              <p className="mt-2 text-slate-400">

                Translate text, voice, and images instantly.

              </p>

            </div>


          </div>


        </motion.div>





        {/* Translator Box */}

        <div className="grid gap-6 lg:grid-cols-2">


          {/* Input */}

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">


            <LanguagePicker

              language={
                sourceLanguage
              }

              setLanguage={
                setSourceLanguage
              }

            />


            <TranslateInput
  value={text}
  onChange={(e) => setText(e.target.value)}
  onClear={clear}
/>
            <div className="mt-5 flex gap-3">


              <VoiceInput
                onResult={
                  setText
                }
              />


              <CameraInput
                onResult={
                  setText
                }
              />


            </div>


          </div>






          {/* Output */}

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">


            <LanguagePicker

              language={
                targetLanguage
              }

              setLanguage={
                setTargetLanguage
              }

            />


            <TranslateOutput

              value={
                translation
              }

              loading={
                loading
              }

              error={
                error
              }

            />



            {translation && (

              <button

                onClick={
                  copyTranslation
                }

                className="mt-5 flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-bold hover:bg-white/20"

              >

                <Copy size={18}/>

                Copy

              </button>

            )}



          </div>


        </div>






        {/* Controls */}

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">


          <button

            onClick={
              swapLanguages
            }

            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-8 py-4 font-bold hover:border-cyan-500"

          >

            <ArrowLeftRight size={20}/>

            Swap Languages

          </button>





          <button

            onClick={
              handleTranslate
            }

            disabled={
              loading
            }

            className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-8 py-4 font-black hover:bg-cyan-500 disabled:opacity-50"

          >

            <Sparkles size={20}/>

            {loading
              ? "Translating..."
              : "Translate"
            }

          </button>



        </div>





        {/* Quick Feature */}

        <div className="mt-10 grid gap-5 md:grid-cols-3">


          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">

            <Mic className="text-cyan-400"/>

            <h3 className="mt-3 font-black">

              Voice Translation

            </h3>

            <p className="text-sm text-slate-400">

              Speak naturally and translate instantly.

            </p>

          </div>



          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">

            <Languages className="text-purple-400"/>

            <h3 className="mt-3 font-black">

              Multiple Languages

            </h3>

            <p className="text-sm text-slate-400">

              Practice and translate many languages.

            </p>

          </div>



          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">

            <Volume2 className="text-green-400"/>

            <h3 className="mt-3 font-black">

              Pronunciation

            </h3>

            <p className="text-sm text-slate-400">

              Listen and improve your speaking.

            </p>

          </div>


        </div>


      </div>


    </div>

  );

};


export default Translator;