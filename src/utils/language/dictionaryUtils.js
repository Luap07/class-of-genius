export const cleanWord = (
  word = ""
) => {

  return word
    .trim()
    .toLowerCase();

};







/**
 * Format dictionary definition
 */
export const formatDefinition = (
  definition
) => {

  if (!definition)
    return "";



  return definition
    .charAt(0)
    .toUpperCase()
    +
    definition.slice(1);

};







/**
 * Extract all definitions
 */
export const extractDefinitions = (
  meanings = []
) => {

  return meanings.flatMap(
    (meaning) =>

      meaning.definitions.map(
        (item) => ({

          partOfSpeech:
            meaning.partOfSpeech,

          definition:
            item.definition,

          example:
            item.example ||
            null,

        })

      )

  );

};







/**
 * Extract synonyms
 */
export const extractSynonyms = (
  meanings = []
) => {

  const synonyms =
    meanings.flatMap(
      (meaning) =>
        meaning.definitions.flatMap(
          (item) =>
            item.synonyms || []
        )
    );


  return [
    ...new Set(
      synonyms
    ),
  ];

};







/**
 * Extract antonyms
 */
export const extractAntonyms = (
  meanings = []
) => {

  const antonyms =
    meanings.flatMap(
      (meaning) =>
        meaning.definitions.flatMap(
          (item) =>
            item.antonyms || []
        )
    );


  return [
    ...new Set(
      antonyms
    ),
  ];

};







/**
 * Get phonetic text
 */
export const getPhonetic = (
  phonetics = []
) => {

  const item =
    phonetics.find(
      (item) =>
        item.text
    );


  return item?.text || "";

};







/**
 * Get pronunciation audio
 */
export const getAudioUrl = (
  phonetics = []
) => {

  const item =
    phonetics.find(
      (item) =>
        item.audio
    );


  return item?.audio || null;

};







/**
 * Create dictionary summary
 */
export const createWordSummary = (
  data
) => {

  return {

    word:
      data.word,

    phonetic:
      getPhonetic(
        data.phonetics
      ),

    audio:
      getAudioUrl(
        data.phonetics
      ),

    definitions:
      extractDefinitions(
        data.meanings
      ),

    synonyms:
      extractSynonyms(
        data.meanings
      ),

    antonyms:
      extractAntonyms(
        data.meanings
      ),

  };

};







/**
 * Check if word exists
 */
export const isValidWord = (
  word
) => {

  return (
    typeof word === "string" &&
    word.trim().length > 0
  );

};







/**
 * Highlight searched word
 */
export const highlightWord = (
  text = "",
  word = ""
) => {

  if (!word)
    return text;


  const regex =
    new RegExp(
      `(${word})`,
      "gi"
    );


  return text.replace(
    regex,
    "<mark>$1</mark>"
  );

};