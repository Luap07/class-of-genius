export const vocabularyCategories = [

  {
    id: "animals",

    title: "Animals",

    icon: "🐾",

    description:
      "Learn names of common animals and creatures.",


    words: [

      {
        id: 1,

        word: "Dog",

        meaning: "A common domestic animal.",

        example:
          "The dog is playing outside.",

        level: "Beginner",

      },


      {
        id: 2,

        word: "Cat",

        meaning:
          "A small animal often kept as a pet.",

        example:
          "The cat is sleeping.",

        level: "Beginner",

      },


      {
        id: 3,

        word: "Elephant",

        meaning:
          "A large animal with a trunk.",

        example:
          "The elephant is very big.",

        level: "Beginner",

      },

    ],

  },





  {
    id: "food",

    title: "Food",

    icon: "🍎",

    description:
      "Learn vocabulary related to meals and ingredients.",


    words: [

      {
        id: 4,

        word: "Apple",

        meaning:
          "A sweet fruit.",

        example:
          "I eat an apple every morning.",

        level: "Beginner",

      },


      {
        id: 5,

        word: "Bread",

        meaning:
          "A baked food made from flour.",

        example:
          "I bought fresh bread.",

        level: "Beginner",

      },


      {
        id: 6,

        word: "Vegetable",

        meaning:
          "A plant used as food.",

        example:
          "Vegetables are healthy.",

        level: "Beginner",

      },

    ],

  },







  {
    id: "travel",

    title: "Travel",

    icon: "✈️",

    description:
      "Vocabulary for airports, transportation, and trips.",


    words: [

      {
        id: 7,

        word: "Airport",

        meaning:
          "A place where airplanes arrive and leave.",

        example:
          "I arrived at the airport early.",

        level: "Beginner",

      },


      {
        id: 8,

        word: "Passport",

        meaning:
          "An official travel document.",

        example:
          "I need my passport to travel.",

        level: "Beginner",

      },


      {
        id: 9,

        word: "Journey",

        meaning:
          "An act of travelling from one place to another.",

        example:
          "The journey was long.",

        level: "Intermediate",

      },

    ],

  },







  {
    id: "technology",

    title: "Technology",

    icon: "💻",

    description:
      "Learn words used in the digital world.",


    words: [

      {
        id: 10,

        word: "Computer",

        meaning:
          "An electronic device for processing information.",

        example:
          "I use my computer for work.",

        level: "Beginner",

      },


      {
        id: 11,

        word: "Internet",

        meaning:
          "A global network connecting computers.",

        example:
          "The internet helps us learn.",

        level: "Beginner",

      },


      {
        id: 12,

        word: "Application",

        meaning:
          "A software program designed for users.",

        example:
          "I downloaded a new application.",

        level: "Intermediate",

      },

    ],

  },







  {
    id: "emotions",

    title: "Emotions",

    icon: "😊",

    description:
      "Words for feelings and expressions.",


    words: [

      {
        id: 13,

        word: "Happy",

        meaning:
          "Feeling pleasure or joy.",

        example:
          "She feels happy today.",

        level: "Beginner",

      },


      {
        id: 14,

        word: "Excited",

        meaning:
          "Feeling enthusiastic about something.",

        example:
          "I am excited about the trip.",

        level: "Intermediate",

      },


      {
        id: 15,

        word: "Confident",

        meaning:
          "Feeling sure about yourself.",

        example:
          "He is confident in his skills.",

        level: "Intermediate",

      },

    ],

  },

];







export const getVocabularyCategory = (
  id
) => {

  return vocabularyCategories.find(
    (category) =>
      category.id === id
  );

};







export const getAllVocabulary = () => {

  return vocabularyCategories.flatMap(
    (category) =>
      category.words
  );

};







export const getVocabularyByLevel = (
  level
) => {

  return getAllVocabulary().filter(
    (word) =>
      word.level === level
  );

};