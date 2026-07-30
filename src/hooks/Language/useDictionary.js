import { useCallback, useState } from "react";
import {
  searchWord,
  getWordDetails,
} from "../services/dictionaryService";


const useDictionary = () => {

  const [word, setWord] = useState("");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);



  const search = useCallback(
    async (query) => {

      if (!query?.trim()) {
        setResult(null);
        return;
      }


      try {

        setLoading(true);
        setError(null);

        setWord(query);


        const data =
          await searchWord(query);


        setResult(data);


      } catch (err) {

        setError(
          err.message ||
          "Unable to find word"
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );



  const getDetails = useCallback(
    async (id) => {

      try {

        setLoading(true);
        setError(null);


        const data =
          await getWordDetails(id);


        setResult(data);


        return data;


      } catch (err) {

        setError(
          err.message ||
          "Unable to load word details"
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );



  const clear = () => {

    setWord("");

    setResult(null);

    setError(null);

  };



  return {

    word,

    result,

    loading,

    error,

    search,

    getDetails,

    clear,

  };

};



export default useDictionary;