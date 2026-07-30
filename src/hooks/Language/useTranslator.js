import { useCallback, useState } from "react";
import {
  translateText,
  detectLanguage,
} from "../../services/language/translateService";


const useTranslator = () => {

  const [text, setText] =
    useState("");

  const [translation, setTranslation] =
    useState("");

  const [sourceLanguage, setSourceLanguage] =
    useState("auto");

  const [targetLanguage, setTargetLanguage] =
    useState("English");


  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);



  const translate = useCallback(
    async ({
      text,
      from = sourceLanguage,
      to = targetLanguage,
    }) => {

      if (!text?.trim()) {

        setTranslation("");

        return;

      }


      try {

        setLoading(true);

        setError(null);


        setText(text);


        let detected =
          from;


        if (from === "auto") {

          detected =
            await detectLanguage(text);

          setSourceLanguage(
            detected
          );

        }



        const result =
          await translateText({
            text,
            from: detected,
            to,
          });



        setTranslation(
          result
        );


        return result;



      } catch (err) {

        setError(
          err.message ||
          "Translation failed"
        );


      } finally {

        setLoading(false);

      }

    },
    [
      sourceLanguage,
      targetLanguage,
    ]
  );




  const swapLanguages = () => {

    setSourceLanguage(
      targetLanguage
    );

    setTargetLanguage(
      sourceLanguage
    );


    setText(
      translation
    );

    setTranslation(
      text
    );

  };




  const clear = () => {

    setText("");

    setTranslation("");

    setError(null);

  };




  return {

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

  };

};


export default useTranslator;