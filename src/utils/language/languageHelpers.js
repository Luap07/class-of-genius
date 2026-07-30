export const languageLevels = [
  "Beginner",
  "Elementary",
  "Intermediate",
  "Upper Intermediate",
  "Advanced",
  "Fluent",
];





/**
 * Get language flag emoji
 */
export const getLanguageFlag = (
  language
) => {

  const flags = {

    English: "🇬🇧",

    Spanish: "🇪🇸",

    French: "🇫🇷",

    German: "🇩🇪",

    Italian: "🇮🇹",

    Portuguese: "🇵🇹",

    Chinese: "🇨🇳",

    Japanese: "🇯🇵",

    Korean: "🇰🇷",

    Arabic: "🇸🇦",

    Russian: "🇷🇺",

    Hindi: "🇮🇳",

  };


  return (
    flags[language] ||
    "🌐"
  );

};







/**
 * Convert level to number
 */
export const levelToNumber = (
  level
) => {

  const levels = {

    Beginner: 1,

    Elementary: 2,

    Intermediate: 3,

    "Upper Intermediate": 4,

    Advanced: 5,

    Fluent: 6,

  };


  return (
    levels[level] ||
    1
  );

};







/**
 * Calculate learning progress
 */
export const calculateProgress = ({
  completed,
  total,
}) => {

  if (!total)
    return 0;


  return Math.min(
    100,
    Math.round(
      (completed / total) * 100
    )
  );

};







/**
 * Format study time
 */
export const formatStudyTime = (
  minutes
) => {

  if (minutes < 60) {

    return `${minutes} min`;

  }


  const hours =
    Math.floor(
      minutes / 60
    );


  const remaining =
    minutes % 60;



  return remaining
    ? `${hours}h ${remaining}m`
    : `${hours}h`;

};







/**
 * Get difficulty color class
 */
export const getLevelStyle = (
  level
) => {

  const styles = {

    Beginner:
      "text-green-400 bg-green-500/10",

    Elementary:
      "text-cyan-400 bg-cyan-500/10",

    Intermediate:
      "text-blue-400 bg-blue-500/10",

    "Upper Intermediate":
      "text-purple-400 bg-purple-500/10",

    Advanced:
      "text-orange-400 bg-orange-500/10",

    Fluent:
      "text-yellow-400 bg-yellow-500/10",

  };


  return (
    styles[level] ||
    styles.Beginner
  );

};







/**
 * Sort languages alphabetically
 */
export const sortLanguages =
  (
    languages = []
  ) => {

    return [
      ...languages,
    ].sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );

  };







/**
 * Search languages
 */
export const searchLanguages =
  (
    languages = [],
    query = ""
  ) => {

    if (!query)
      return languages;


    return languages.filter(
      (language) =>
        language.name
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
    );

};







/**
 * Generate lesson completion text
 */
export const getCompletionMessage =
  (
    progress
  ) => {

    if (progress >= 100)
      return "Mastered 🎉";


    if (progress >= 75)
      return "Almost there 🚀";


    if (progress >= 50)
      return "Great progress 🔥";


    if (progress > 0)
      return "Keep learning 💪";


    return "Start your journey";

  };