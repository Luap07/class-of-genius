import axios from "axios";


const PRONUNCIATION_API =
  import.meta.env.VITE_PRONUNCIATION_API ||
  "http://localhost:5000/api/pronunciation";






/**
 * Analyze user's pronunciation
 */
export const checkPronunciation =
  async ({
    audio,
    expectedText,
  }) => {

    try {

      const formData =
        new FormData();


      formData.append(
        "audio",
        audio
      );


      formData.append(
        "text",
        expectedText
      );



      const response =
        await axios.post(
          `${PRONUNCIATION_API}/analyze`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );



      return {

        score:
          response.data.score || 0,


        feedback:
          response.data.feedback ||
          "Keep practicing!",


        mistakes:
          response.data.mistakes ||
          [],


      };


    } catch (error) {

      throw new Error(
        "Pronunciation analysis unavailable"
      );

    }

  };







/**
 * Get native pronunciation audio
 */
export const getPronunciationAudio =
  async (
    word,
    language = "en"
  ) => {

    try {

      const response =
        await axios.get(
          `${PRONUNCIATION_API}/audio`,
          {
            params: {
              word,
              language,
            },
          }
        );



      return response.data.audioUrl;


    } catch (error) {

      throw new Error(
        "Audio pronunciation unavailable"
      );

    }

  };







/**
 * Convert speech to text
 */
export const speechToText =
  async (
    audio
  ) => {

    try {

      const formData =
        new FormData();


      formData.append(
        "audio",
        audio
      );



      const response =
        await axios.post(
          `${PRONUNCIATION_API}/speech`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );



      return response.data.text;


    } catch (error) {

      throw new Error(
        "Speech recognition failed"
      );

    }

  };







/**
 * Compare pronunciation manually
 */
export const comparePronunciation =
  ({
    spoken,
    expected,
  }) => {

    const spokenWords =
      spoken
        .toLowerCase()
        .split(" ");


    const expectedWords =
      expected
        .toLowerCase()
        .split(" ");


    const matches =
      spokenWords.filter(
        (word, index) =>
          word === expectedWords[index]
      ).length;



    return Math.round(
      (
        matches /
        expectedWords.length
      ) *
      100
    );

  };