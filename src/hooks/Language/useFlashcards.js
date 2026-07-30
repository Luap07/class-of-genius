import { useCallback, useMemo, useState } from "react";


const useFlashcards = (
  initialCards = []
) => {

  const [cards, setCards] =
    useState(initialCards);


  const [currentIndex, setCurrentIndex] =
    useState(0);


  const [showAnswer, setShowAnswer] =
    useState(false);


  const [knownCards, setKnownCards] =
    useState([]);


  const [reviewCards, setReviewCards] =
    useState([]);





  const currentCard =
    useMemo(() => {

      if (!cards.length)
        return null;


      return cards[currentIndex];

    }, [
      cards,
      currentIndex,
    ]);








  const nextCard = useCallback(
    () => {

      setShowAnswer(false);


      setCurrentIndex((prev) => {

        if (
          prev >= cards.length - 1
        ) {

          return 0;

        }


        return prev + 1;

      });


    },
    [
      cards.length,
    ]
  );








  const previousCard =
    useCallback(
      () => {

        setShowAnswer(false);


        setCurrentIndex((prev) => {

          if (prev <= 0) {

            return cards.length - 1;

          }


          return prev - 1;

        });


      },
      [
        cards.length,
      ]
    );








  const flipCard = () => {

    setShowAnswer(
      (prev) => !prev
    );

  };








  const markKnown =
    useCallback(
      (card) => {

        setKnownCards((prev) => {

          if (
            prev.includes(card.id)
          ) {

            return prev;

          }


          return [
            ...prev,
            card.id,
          ];

        });


        setReviewCards((prev) =>
          prev.filter(
            (id) =>
              id !== card.id
          )
        );


        nextCard();

      },
      [
        nextCard,
      ]
    );








  const markForReview =
    useCallback(
      (card) => {

        setReviewCards((prev) => {

          if (
            prev.includes(card.id)
          ) {

            return prev;

          }


          return [
            ...prev,
            card.id,
          ];

        });


        nextCard();

      },
      [
        nextCard,
      ]
    );








  const addCard =
    useCallback(
      (card) => {

        setCards((prev) => [

          ...prev,

          card,

        ]);

      },
      []
    );








  const removeCard =
    useCallback(
      (id) => {

        setCards((prev) =>
          prev.filter(
            (card) =>
              card.id !== id
          )
        );


        setCurrentIndex(0);

      },
      []
    );








  const reset =
    () => {

      setCurrentIndex(0);

      setShowAnswer(false);

      setKnownCards([]);

      setReviewCards([]);

    };








  const progress =
    useMemo(() => {

      if (!cards.length)
        return 0;


      return Math.round(
        (
          knownCards.length /
          cards.length
        ) *
        100
      );


    }, [
      cards,
      knownCards,
    ]);








  return {

    cards,

    currentCard,

    currentIndex,


    showAnswer,


    knownCards,

    reviewCards,


    progress,


    flipCard,


    nextCard,

    previousCard,


    markKnown,

    markForReview,


    addCard,

    removeCard,


    reset,

  };

};



export default useFlashcards;