import { useCallback, useState } from "react";
import {
  askAI,
  explainGrammar,
  explainWord,
  generateQuiz,
} from "../services/aiLanguageService";


const useLanguageAI = () => {

  const [messages, setMessages] =
    useState([]);

  const [response, setResponse] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);



  const sendMessage = useCallback(
    async (message) => {

      if (!message?.trim()) return;


      const userMessage = {
        role: "user",
        content: message,
      };


      setMessages((prev) => [
        ...prev,
        userMessage,
      ]);


      try {

        setLoading(true);

        setError(null);



        const result =
          await askAI(message);



        const aiMessage = {
          role: "assistant",
          content: result,
        };


        setMessages((prev) => [
          ...prev,
          aiMessage,
        ]);


        setResponse(result);



        return result;


      } catch (err) {

        setError(
          err.message ||
          "AI request failed"
        );


      } finally {

        setLoading(false);

      }

    },
    []
  );





  const grammarHelp = useCallback(
    async (sentence) => {

      try {

        setLoading(true);

        setError(null);


        const result =
          await explainGrammar(
            sentence
          );


        setResponse(result);


        return result;


      } catch (err) {

        setError(
          err.message
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );





  const wordHelp = useCallback(
    async (word) => {

      try {

        setLoading(true);

        setError(null);


        const result =
          await explainWord(word);



        setResponse(result);


        return result;


      } catch (err) {

        setError(
          err.message
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );






  const createQuiz = useCallback(
    async ({
      topic,
      level,
      count = 5,
    }) => {

      try {

        setLoading(true);

        setError(null);


        const result =
          await generateQuiz({
            topic,
            level,
            count,
          });



        setResponse(result);


        return result;


      } catch (err) {

        setError(
          err.message
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );






  const clearChat = () => {

    setMessages([]);

    setResponse(null);

    setError(null);

  };





  return {

    messages,

    response,

    loading,

    error,


    sendMessage,

    grammarHelp,

    wordHelp,

    createQuiz,


    clearChat,

  };

};



export default useLanguageAI;