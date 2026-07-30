const questionTypes = [
  "multiple-choice",
  "true-false",
  "fill-blank",
];





/**
 * Shuffle array items
 */
export const shuffleArray = (
  array = []
) => {

  return [
    ...array,
  ].sort(
    () =>
      Math.random() - 0.5
  );

};







/**
 * Generate multiple choice question
 */
export const createMultipleChoice = ({
  word,
  answer,
  options = [],
}) => {

  return {

    id:
      crypto.randomUUID(),

    type:
      "multiple-choice",

    question:
      `What does "${word}" mean?`,

    options:
      shuffleArray([
        answer,
        ...options,
      ]).slice(0, 4),

    answer,

  };

};







/**
 * Generate fill blank question
 */
export const createFillBlank = ({
  sentence,
  answer,
}) => {

  return {

    id:
      crypto.randomUUID(),

    type:
      "fill-blank",

    question:
      sentence,

    answer,

  };

};







/**
 * Generate true false question
 */
export const createTrueFalse = ({
  statement,
  answer,
}) => {

  return {

    id:
      crypto.randomUUID(),

    type:
      "true-false",

    question:
      statement,

    answer,

  };

};







/**
 * Generate quiz from vocabulary
 */
export const generateVocabularyQuiz = ({
  words = [],
  count = 5,
}) => {

  const selected =
    shuffleArray(words)
      .slice(0, count);



  return selected.map(
    (item, index) => {

      const type =
        questionTypes[
          index %
          questionTypes.length
        ];



      if (
        type ===
        "multiple-choice"
      ) {

        return createMultipleChoice({

          word:
            item.word,

          answer:
            item.meaning,

          options:
            words
              .filter(
                (word) =>
                  word.word !== item.word
              )
              .map(
                (word) =>
                  word.meaning
              ),

        });

      }




      if (
        type ===
        "fill-blank"
      ) {

        return createFillBlank({

          sentence:
            item.example ||
            `I learned the word ${item.word}`,

          answer:
            item.word,

        });

      }




      return createTrueFalse({

        statement:
          `${item.word} means ${item.meaning}`,

        answer:
          true,

      });


    }

  );

};







/**
 * Calculate quiz score
 */
export const calculateQuizScore = ({
  answers = [],
  questions = [],
}) => {

  if (!questions.length)
    return 0;



  const correct =
    answers.filter(
      (answer, index) =>
        answer ===
        questions[index].answer
    ).length;



  return Math.round(
    (
      correct /
      questions.length
    ) *
    100
  );

};







/**
 * Get quiz result message
 */
export const getQuizMessage = (
  score
) => {

  if (score >= 90)
    return "Amazing! Language master 🏆";


  if (score >= 70)
    return "Great job! Keep improving 🚀";


  if (score >= 50)
    return "Good effort. Practice more 💪";


  return "Keep learning. You will improve 🌱";

};