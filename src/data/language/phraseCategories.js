export const phraseCategories = [

  {
    id: "greetings",

    title: "Greetings",

    icon: "👋",

    description:
      "Common phrases for saying hello and starting conversations.",


    phrases: [

      {
        phrase:
          "Hello",

        meaning:
          "A basic greeting.",

        example:
          "Hello, how are you?",
      },


      {
        phrase:
          "Good morning",

        meaning:
          "A greeting used in the morning.",

        example:
          "Good morning, nice to meet you.",
      },


      {
        phrase:
          "Nice to meet you",

        meaning:
          "Used when meeting someone for the first time.",

        example:
          "Nice to meet you, my name is John.",
      },

    ],

  },





  {
    id: "travel",

    title: "Travel",

    icon: "✈️",

    description:
      "Useful phrases for airports, hotels, and transportation.",


    phrases: [

      {
        phrase:
          "Where is the airport?",

        meaning:
          "Asking for airport directions.",

        example:
          "Excuse me, where is the airport?",
      },


      {
        phrase:
          "I need a taxi",

        meaning:
          "Requesting transportation.",

        example:
          "I need a taxi to the hotel.",
      },


      {
        phrase:
          "How much does it cost?",

        meaning:
          "Asking about price.",

        example:
          "How much does this ticket cost?",
      },

    ],

  },







  {
    id: "food",

    title: "Food & Restaurant",

    icon: "🍽️",

    description:
      "Learn phrases used when ordering food.",


    phrases: [

      {
        phrase:
          "I would like this",

        meaning:
          "A polite way to order something.",

        example:
          "I would like this dish, please.",
      },


      {
        phrase:
          "Can I see the menu?",

        meaning:
          "Requesting a restaurant menu.",

        example:
          "Can I see the menu, please?",
      },


      {
        phrase:
          "The food is delicious",

        meaning:
          "Complimenting a meal.",

        example:
          "The food is delicious!",
      },

    ],

  },







  {
    id: "business",

    title: "Business",

    icon: "💼",

    description:
      "Professional phrases for workplace communication.",


    phrases: [

      {
        phrase:
          "Let's schedule a meeting",

        meaning:
          "Arrange a professional meeting.",

        example:
          "Let's schedule a meeting tomorrow.",
      },


      {
        phrase:
          "I agree with you",

        meaning:
          "Showing agreement.",

        example:
          "I agree with your idea.",
      },


      {
        phrase:
          "Thank you for your time",

        meaning:
          "A polite professional expression.",

        example:
          "Thank you for your time today.",
      },

    ],

  },







  {
    id: "daily-life",

    title: "Daily Life",

    icon: "🏠",

    description:
      "Everyday expressions used in normal conversations.",


    phrases: [

      {
        phrase:
          "What are you doing?",

        meaning:
          "Asking about someone's activity.",

        example:
          "What are you doing today?",
      },


      {
        phrase:
          "See you later",

        meaning:
          "A casual goodbye.",

        example:
          "See you later!",
      },


      {
        phrase:
          "I don't understand",

        meaning:
          "Used when something is unclear.",

        example:
          "Sorry, I don't understand.",
      },

    ],

  },

];






export const getPhraseCategory = (
  id
) => {

  return phraseCategories.find(
    (category) =>
      category.id === id
  );

};






export const getAllPhrases = () => {

  return phraseCategories.flatMap(
    (category) =>
      category.phrases
  );

};