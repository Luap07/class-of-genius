import axios from "axios";


const TRANSLATE_API =
  "https://libretranslate.com";





/**
 * Translate text
 */
export const translateText = async ({
  text,
  from = "auto",
  to = "English",
}) => {

  try {

    const response =
      await axios.post(
        `${TRANSLATE_API}/translate`,
        {
          q: text,

          source:
            normalizeLanguage(from),

          target:
            normalizeLanguage(to),

          format: "text",
        },
        {
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );



    return response.data.translatedText;


  } catch (error) {

    throw new Error(
      "Translation service unavailable"
    );

  }

};








/**
 * Detect language automatically
 */
export const detectLanguage = async (
  text
) => {

  try {

    const response =
      await axios.post(
        `${TRANSLATE_API}/detect`,
        {
          q: text,
        },
        {
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );



    return (
      response.data?.[0]?.language ||
      "en"
    );


  } catch (error) {

    return "en";

  }

};








/**
 * Get supported languages
 */
export const getLanguages = async () => {

  try {

    const response =
      await axios.get(
        `${TRANSLATE_API}/languages`
      );


    return response.data;


  } catch (error) {

    return [];

  }

};








/**
 * Normalize language names
 */
const normalizeLanguage = (
  language
) => {

  const languages = {

    English: "en",

    Spanish: "es",

    French: "fr",

    German: "de",

    Italian: "it",

    Portuguese: "pt",

    Chinese: "zh",

    Japanese: "ja",

    Korean: "ko",

    Arabic: "ar",

    Russian: "ru",

    Hindi: "hi",

  };



  return (
    languages[language] ||
    language?.toLowerCase() ||
    "en"
  );

};