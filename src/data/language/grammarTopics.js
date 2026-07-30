export const grammarTopics = [

  {
    id: "basic-sentences",

    title: "Basic Sentence Structure",

    level: "Beginner",

    category: "Grammar",


    description:
      "Learn how words combine to create simple and correct sentences.",


    lessons: 5,


    examples: [
      "I am a student.",
      "She likes music.",
      "They play football.",
    ],

  },



  {
    id: "present-tense",

    title: "Present Tense",

    level: "Beginner",

    category: "Grammar",


    description:
      "Understand habits, routines, and actions happening now.",


    lessons: 8,


    examples: [
      "I work every day.",
      "He studies English.",
      "They live here.",
    ],

  },



  {
    id: "past-tense",

    title: "Past Tense",

    level: "Beginner",

    category: "Grammar",


    description:
      "Learn how to describe completed actions and events.",


    lessons: 7,


    examples: [
      "I visited London.",
      "She watched a movie.",
      "They played yesterday.",
    ],

  },



  {
    id: "future-tense",

    title: "Future Tense",

    level: "Intermediate",

    category: "Grammar",


    description:
      "Express plans, predictions, and future events.",


    lessons: 6,


    examples: [
      "I will travel tomorrow.",
      "She is going to study.",
    ],

  },



  {
    id: "articles",

    title: "Articles (A, An, The)",

    level: "Beginner",

    category: "Grammar",


    description:
      "Learn when to use English articles correctly.",


    lessons: 4,


    examples: [
      "A book",
      "An apple",
      "The car",
    ],

  },



  {
    id: "pronouns",

    title: "Pronouns",

    level: "Beginner",

    category: "Grammar",


    description:
      "Understand subject, object, and possessive pronouns.",


    lessons: 5,


    examples: [
      "I love my dog.",
      "She helped him.",
    ],

  },



  {
    id: "adjectives",

    title: "Adjectives",

    level: "Intermediate",

    category: "Grammar",


    description:
      "Describe people, places, and things with adjectives.",


    lessons: 5,


    examples: [
      "A beautiful city.",
      "A smart student.",
    ],

  },



  {
    id: "conditionals",

    title: "Conditional Sentences",

    level: "Advanced",

    category: "Grammar",


    description:
      "Learn sentences that describe possibilities and situations.",


    lessons: 10,


    examples: [
      "If I study, I will pass.",
      "If I had money, I would travel.",
    ],

  },



  {
    id: "passive-voice",

    title: "Passive Voice",

    level: "Advanced",

    category: "Grammar",


    description:
      "Learn how to focus on actions instead of the subject.",


    lessons: 6,


    examples: [
      "The book was written by him.",
    ],

  },

];





export const getGrammarByLevel = (
  level
) => {

  return grammarTopics.filter(
    (topic) =>
      topic.level === level
  );

};





export const getGrammarTopic = (
  id
) => {

  return grammarTopics.find(
    (topic) =>
      topic.id === id
  );

};





export const getGrammarCategories = () => {

  return [
    ...new Set(
      grammarTopics.map(
        (topic) =>
          topic.category
      )
    ),
  ];

};