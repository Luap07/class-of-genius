import axios from "axios";


const API_URL =
  import.meta.env.VITE_LANGUAGE_API ||
  "http://localhost:5000/api/languages";



const languageApi =
  axios.create({
    baseURL: API_URL,

    headers: {
      "Content-Type":
        "application/json",
    },
  });





/**
 * Get all available languages
 */
export const getLanguages =
  async () => {

    try {

      const response =
        await languageApi.get(
          "/"
        );


      return response.data;


    } catch (error) {

      throw new Error(
        "Unable to fetch languages"
      );

    }

  };








/**
 * Get language details
 */
export const getLanguageDetails =
  async (
    languageId
  ) => {

    try {

      const response =
        await languageApi.get(
          `/${languageId}`
        );


      return response.data;


    } catch (error) {

      throw new Error(
        "Unable to load language details"
      );

    }

  };








/**
 * Get lessons by language
 */
export const getLessons =
  async ({
    languageId,
    level,
  }) => {

    try {

      const response =
        await languageApi.get(
          `/${languageId}/lessons`,
          {
            params: {
              level,
            },
          }
        );


      return response.data;


    } catch (error) {

      throw new Error(
        "Unable to fetch lessons"
      );

    }

  };








/**
 * Get vocabulary list
 */
export const getVocabulary =
  async ({
    languageId,
    category,
  }) => {

    try {

      const response =
        await languageApi.get(
          `/${languageId}/vocabulary`,
          {
            params: {
              category,
            },
          }
        );


      return response.data;


    } catch (error) {

      throw new Error(
        "Unable to fetch vocabulary"
      );

    }

  };








/**
 * Save user learning progress
 */
export const saveProgress =
  async ({
    userId,
    languageId,
    progress,
  }) => {

    try {

      const response =
        await languageApi.post(
          "/progress",
          {
            userId,
            languageId,
            progress,
          }
        );


      return response.data;


    } catch (error) {

      throw new Error(
        "Unable to save progress"
      );

    }

  };








/**
 * Get leaderboard
 */
export const getLeaderboard =
  async (
    languageId
  ) => {

    try {

      const response =
        await languageApi.get(
          "/leaderboard",
          {
            params: {
              languageId,
            },
          }
        );


      return response.data;


    } catch (error) {

      throw new Error(
        "Unable to load leaderboard"
      );

    }

  };








export default languageApi;