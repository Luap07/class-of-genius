export const pronunciationLevels = [
  "Beginner",
  "Good",
  "Excellent",
];






/**
 * Calculate pronunciation score
 */
export const calculatePronunciationScore = ({
  correct = 0,
  total = 0,
}) => {

  if (!total)
    return 0;


  return Math.min(
    100,
    Math.round(
      (correct / total) * 100
    )
  );

};







/**
 * Get pronunciation rating
 */
export const getPronunciationRating = (
  score = 0
) => {

  if (score >= 90) {

    return {
      label: "Excellent",
      message:
        "Your pronunciation is very accurate.",
      color:
        "text-green-400",
    };

  }


  if (score >= 70) {

    return {
      label: "Good",
      message:
        "Nice work. Keep improving your accent.",
      color:
        "text-cyan-400",
    };

  }


  if (score >= 50) {

    return {
      label: "Needs Practice",
      message:
        "Practice slowly and focus on sounds.",
      color:
        "text-yellow-400",
    };

  }


  return {
    label: "Beginner",
    message:
      "Keep practicing. Every attempt helps.",
    color:
      "text-red-400",
  };

};







/**
 * Compare two pronunciation texts
 */
export const compareWords = (
  spoken = "",
  expected = ""
) => {

  const spokenWords =
    spoken
      .toLowerCase()
      .trim()
      .split(/\s+/);


  const expectedWords =
    expected
      .toLowerCase()
      .trim()
      .split(/\s+/);



  const result =
    expectedWords.map(
      (word, index) => ({

        word,

        correct:
          spokenWords[index] === word,

      })
    );



  return result;

};







/**
 * Find pronunciation mistakes
 */
export const findMistakes = (
  spoken,
  expected
) => {

  const comparison =
    compareWords(
      spoken,
      expected
    );


  return comparison.filter(
    (item) =>
      !item.correct
  );

};







/**
 * Format pronunciation feedback
 */
export const createFeedback = (
  score
) => {

  if (score >= 90) {

    return "Perfect pronunciation!";

  }


  if (score >= 70) {

    return "Very good. Minor improvements needed.";

  }


  if (score >= 50) {

    return "Good attempt. Practice difficult sounds.";

  }


  return "Try again and speak more clearly.";

};







/**
 * Convert seconds to audio duration
 */
export const formatAudioTime = (
  seconds = 0
) => {

  const minutes =
    Math.floor(
      seconds / 60
    );


  const remaining =
    Math.floor(
      seconds % 60
    );


  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;

};