import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";


const LanguageContext = createContext();



export const LanguageProvider = ({
  children,
}) => {

  const [selectedLanguage, setSelectedLanguage] =
    useState(() => {
      return (
        localStorage.getItem(
          "selectedLanguage"
        ) || "English"
      );
    });


  const [level, setLevel] =
    useState(() => {
      return (
        localStorage.getItem(
          "languageLevel"
        ) || "Beginner"
      );
    });


  const [progress, setProgress] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "languageProgress"
        );

      return saved
        ? JSON.parse(saved)
        : {
            lessons: 0,
            vocabulary: 0,
            grammar: 0,
            listening: 0,
            speaking: 0,
          };
    });



  const [favorites, setFavorites] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "favoriteLanguages"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });



  const [recentLessons, setRecentLessons] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "recentLanguageLessons"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });



  useEffect(() => {

    localStorage.setItem(
      "selectedLanguage",
      selectedLanguage
    );

  }, [selectedLanguage]);



  useEffect(() => {

    localStorage.setItem(
      "languageLevel",
      level
    );

  }, [level]);



  useEffect(() => {

    localStorage.setItem(
      "languageProgress",
      JSON.stringify(progress)
    );

  }, [progress]);



  useEffect(() => {

    localStorage.setItem(
      "favoriteLanguages",
      JSON.stringify(favorites)
    );

  }, [favorites]);



  useEffect(() => {

    localStorage.setItem(
      "recentLanguageLessons",
      JSON.stringify(recentLessons)
    );

  }, [recentLessons]);




  const changeLanguage = (language) => {

    setSelectedLanguage(language);

    setProgress({
      lessons: 0,
      vocabulary: 0,
      grammar: 0,
      listening: 0,
      speaking: 0,
    });

  };



  const updateProgress = (
    category,
    amount = 1
  ) => {

    setProgress((prev) => ({
      ...prev,
      [category]:
        (prev[category] || 0) + amount,
    }));

  };



  const setLearningLevel = (
    newLevel
  ) => {

    setLevel(newLevel);

  };



  const toggleFavorite = (
    language
  ) => {

    setFavorites((prev) => {

      if (prev.includes(language)) {

        return prev.filter(
          (item) =>
            item !== language
        );

      }


      return [
        ...prev,
        language,
      ];

    });

  };



  const addRecentLesson = (
    lesson
  ) => {

    setRecentLessons((prev) => {

      const filtered =
        prev.filter(
          (item) =>
            item.id !== lesson.id
        );


      return [
        lesson,
        ...filtered,
      ].slice(0, 10);

    });

  };



  const resetProgress = () => {

    setProgress({
      lessons: 0,
      vocabulary: 0,
      grammar: 0,
      listening: 0,
      speaking: 0,
    });

  };



  const value = useMemo(
    () => ({
      selectedLanguage,
      changeLanguage,

      level,
      setLearningLevel,

      progress,
      updateProgress,
      resetProgress,

      favorites,
      toggleFavorite,

      recentLessons,
      addRecentLesson,
    }),
    [
      selectedLanguage,
      level,
      progress,
      favorites,
      recentLessons,
    ]
  );



  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );

};



export const useLanguage = () => {

  const context =
    useContext(LanguageContext);


  if (!context) {

    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );

  }


  return context;

};



export default LanguageContext;