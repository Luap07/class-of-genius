import axios from "axios";


const DICTIONARY_API =
  "https://api.dictionaryapi.dev/api/v2/entries/en";



/**
 * Search a word
 */
export const searchWord = async (
  word
) => {

  try {

    const response =
      await axios.get(
        `${DICTIONARY_API}/${word}`
      );


    const data =
      response.data[0];


    return {

      id: data.word,

      word: data.word,


      phonetic:
        data.phonetic ||
        "",


      meanings:
        data.meanings || [],


      audio:
        data.phonetics?.find(
          (item) =>
            item.audio
        )?.audio || null,

    };


  } catch (error) {

    throw new Error(
      "Word not found"
    );

  }

};







/**
 * Get detailed word information
 */
export const getWordDetails = async (
  word
) => {

  try {

    const response =
      await axios.get(
        `${DICTIONARY_API}/${word}`
      );


    return response.data;


  } catch (error) {

    throw new Error(
      "Unable to load word details"
    );

  }

};







/**
 * Extract definitions
 */
export const getDefinitions = (
  meanings = []
) => {

  return meanings.flatMap(
    (meaning) =>
      meaning.definitions.map(
        (definition) => ({
          partOfSpeech:
            meaning.partOfSpeech,

          definition:
            definition.definition,

          example:
            definition.example ||
            null,

        })
      )
  );

};







/**
 * Extract synonyms
 */
export const getSynonyms = (
  meanings = []
) => {

  return [
    ...new Set(
      meanings.flatMap(
        (meaning) =>
          meaning.definitions.flatMap(
            (item) =>
              item.synonyms || []
          )
      )
    ),
  ];

};







/**
 * Extract antonyms
 */
export const getAntonyms = (
  meanings = []
) => {

  return [
    ...new Set(
      meanings.flatMap(
        (meaning) =>
          meaning.definitions.flatMap(
            (item) =>
              item.antonyms || []
          )
      )
    ),
  ];

};







/**
 * Play pronunciation audio
 */
export const playPronunciation =
  (audioUrl) => {

    if (!audioUrl)
      return;


    const audio =
      new Audio(audioUrl);


    audio.play();

  };