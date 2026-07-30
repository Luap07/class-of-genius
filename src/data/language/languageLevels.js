export const languageLevels = [

  {
    id: "beginner",

    name: "Beginner",

    shortName: "A1",

    icon: "🌱",

    color:
      "from-green-500 to-emerald-500",


    description:
      "Start from the basics. Learn simple words, phrases, pronunciation, and everyday conversations.",


    skills: [

      "Basic vocabulary",

      "Simple sentences",

      "Common greetings",

      "Basic pronunciation",

      "Everyday expressions",

    ],


    goals: [

      "Introduce yourself",

      "Understand simple conversations",

      "Read basic texts",

    ],


    xpRequired: 0,

  },





  {
    id: "elementary",

    name: "Elementary",

    shortName: "A2",

    icon: "📚",

    color:
      "from-cyan-500 to-blue-500",


    description:
      "Build stronger communication skills and understand common situations.",


    skills: [

      "Daily conversations",

      "Basic grammar",

      "Short conversations",

      "Reading simple articles",

      "Writing short texts",

    ],


    goals: [

      "Talk about daily activities",

      "Describe people and places",

      "Understand common phrases",

    ],


    xpRequired: 1000,

  },







  {
    id: "intermediate",

    name: "Intermediate",

    shortName: "B1",

    icon: "🚀",

    color:
      "from-blue-500 to-purple-500",


    description:
      "Communicate confidently in familiar situations and express ideas clearly.",


    skills: [

      "Complex sentences",

      "Conversation practice",

      "Listening comprehension",

      "Intermediate grammar",

      "Vocabulary expansion",

    ],


    goals: [

      "Hold normal conversations",

      "Watch content with less support",

      "Write organized paragraphs",

    ],


    xpRequired: 3000,

  },







  {
    id: "upper-intermediate",

    name: "Upper Intermediate",

    shortName: "B2",

    icon: "🔥",

    color:
      "from-purple-500 to-pink-500",


    description:
      "Improve fluency and handle more complex topics.",


    skills: [

      "Advanced conversations",

      "Professional vocabulary",

      "Natural expressions",

      "Detailed writing",

      "Cultural understanding",

    ],


    goals: [

      "Communicate naturally",

      "Understand native speakers",

      "Express opinions clearly",

    ],


    xpRequired: 6000,

  },







  {
    id: "advanced",

    name: "Advanced",

    shortName: "C1",

    icon: "🏆",

    color:
      "from-orange-500 to-red-500",


    description:
      "Master complex language skills for academic and professional use.",


    skills: [

      "Advanced grammar",

      "Native expressions",

      "Academic vocabulary",

      "Professional communication",

      "Deep comprehension",

    ],


    goals: [

      "Speak fluently",

      "Write advanced content",

      "Understand difficult materials",

    ],


    xpRequired: 10000,

  },







  {
    id: "fluent",

    name: "Fluent",

    shortName: "C2",

    icon: "👑",

    color:
      "from-yellow-500 to-amber-500",


    description:
      "Achieve near-native mastery of the language.",


    skills: [

      "Native-level conversations",

      "Advanced writing",

      "Idioms",

      "Cultural knowledge",

      "Professional mastery",

    ],


    goals: [

      "Communicate effortlessly",

      "Understand all contexts",

      "Master the language",

    ],


    xpRequired: 15000,

  },

];







export const getLevelById = (
  id
) => {

  return languageLevels.find(
    (level) =>
      level.id === id
  );

};







export const getNextLevel = (
  currentId
) => {

  const index =
    languageLevels.findIndex(
      (level) =>
        level.id === currentId
    );


  return (
    languageLevels[index + 1] ||
    null
  );

};







export const calculateLevelProgress = ({
  xp = 0,
  currentLevel,
}) => {

  const current =
    getLevelById(
      currentLevel
    );


  const next =
    getNextLevel(
      currentLevel
    );



  if (!current || !next)
    return 100;



  const progress =
    (
      (xp - current.xpRequired) /
      (next.xpRequired - current.xpRequired)
    ) * 100;



  return Math.min(
    100,
    Math.max(
      0,
      Math.round(progress)
    )
  );

};