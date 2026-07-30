import { useCallback, useMemo, useState } from "react";


const useVocabulary = (
  initialWords = []
) => {

  const [words, setWords] =
    useState(initialWords);


  const [learnedWords, setLearnedWords] =
    useState([]);


  const [favorites, setFavorites] =
    useState([]);



  const addWord = useCallback(
    (word) => {

      setWords((prev) => [

        ...prev,

        word,

      ]);

    },
    []
  );




  const removeWord = useCallback(
    (id) => {

      setWords((prev) =>
        prev.filter(
          (word) =>
            word.id !== id
        )
      );

    },
    []
  );





  const markAsLearned =
    useCallback(
      (word) => {

        setLearnedWords((prev) => {

          if (
            prev.some(
              (item) =>
                item.id === word.id
            )
          ) {

            return prev;

          }


          return [
            ...prev,
            word,
          ];

        });

      },
      []
    );







  const toggleFavorite =
    useCallback(
      (word) => {

        setFavorites((prev) => {

          const exists =
            prev.some(
              (item) =>
                item.id === word.id
            );


          if (exists) {

            return prev.filter(
              (item) =>
                item.id !== word.id
            );

          }


          return [
            ...prev,
            word,
          ];

        });

      },
      []
    );








  const isLearned = useCallback(
    (id) => {

      return learnedWords.some(
        (word) =>
          word.id === id
      );

    },
    [
      learnedWords,
    ]
  );








  const isFavorite =
    useCallback(
      (id) => {

        return favorites.some(
          (word) =>
            word.id === id
        );

      },
      [
        favorites,
      ]
    );








  const progress =
    useMemo(() => {

      if (!words.length)
        return 0;


      return Math.round(
        (
          learnedWords.length /
          words.length
        ) *
        100
      );


    }, [
      words,
      learnedWords,
    ]);








  const resetVocabulary = () => {

    setLearnedWords([]);

    setFavorites([]);

  };






  return {

    words,

    learnedWords,

    favorites,


    progress,


    addWord,

    removeWord,


    markAsLearned,


    toggleFavorite,


    isLearned,

    isFavorite,


    resetVocabulary,

  };

};



export default useVocabulary;