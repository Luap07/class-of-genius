import axios from "axios";


const AI_API =
  import.meta.env.VITE_AI_LANGUAGE_API ||
  "http://localhost:5000/api/language-ai";





/**
 * Chat with AI language tutor
 */
export const askAI = async (
  message
) => {

  try {

    const response =
      await axios.post(
        `${AI_API}/chat`,
        {
          message,
        }
      );


    return response.data.answer;


  } catch (error) {

    throw new Error(
      "AI tutor unavailable"
    );

  }

};







/**
 * Explain grammar
 */
export const explainGrammar = async (
  sentence
) => {

  try {

    const response =
      await axios.post(
        `${AI_API}/grammar`,
        {
          sentence,
        }
      );


    return response.data;


  } catch (error) {

    throw new Error(
      "Grammar explanation failed"
    );

  }

};







/**
 * Explain vocabulary word
 */
export const explainWord = async (
  word
) => {

  try {

    const response =
      await axios.post(
        `${AI_API}/word`,
        {
          word,
        }
      );


    return response.data;


  } catch (error) {

    throw new Error(
      "Word explanation failed"
    );

  }

};







/**
 * Generate language quiz
 */
export const generateQuiz = async ({
  topic,
  level = "Beginner",
  count = 5,
}) => {

  try {

    const response =
      await axios.post(
        `${AI_API}/quiz`,
        {
          topic,

          level,

          count,
        }
      );


    return response.data;


  } catch (error) {

    throw new Error(
      "Quiz generation failed"
    );

  }

};







/**
 * Break down sentence
 */
export const breakdownSentence =
  async (
    sentence
  ) => {

    try {

      const response =
        await axios.post(
          `${AI_API}/breakdown`,
          {
            sentence,
          }
        );


      return response.data;


    } catch (error) {

      throw new Error(
        "Sentence breakdown failed"
      );

    }

  };







/**
 * Create learning suggestions
 */
export const getLearningTips =
  async ({
    level,
    goal,
    language,
  }) => {

    try {

      const response =
        await axios.post(
          `${AI_API}/tips`,
          {
            level,
            goal,
            language,
          }
        );


      return response.data;


    } catch (error) {

      throw new Error(
        "Unable to generate tips"
      );

    }

  };