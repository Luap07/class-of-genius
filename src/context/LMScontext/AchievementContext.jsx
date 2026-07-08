// src/context/AchievementContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";


// Create Context
const AchievementContext = createContext();


// Storage Key
const ACHIEVEMENT_STORAGE_KEY = "lms_achievements";


// Default Data
const defaultAchievements = {

  xp: 0,

  level: 1,

  streak: 0,

  badges: [],

  achievements: []

};




// Available badges
const badgesList = [

  {
    id: "first_course",
    title: "First Step",
    description: "Completed your first course"
  },


  {
    id: "lesson_master",
    title: "Lesson Master",
    description: "Completed 50 lessons"
  },


  {
    id: "weeklytasks_pro",
    title: "WeeklyTasks Pro",
    description: "Submitted 10 weeklytasks"
  },


  {
    id: "knowledge_seeker",
    title: "Knowledge Seeker",
    description: "Earned 1000 XP"
  }

];








// Provider
export const AchievementProvider = ({ children }) => {


  const [xp, setXp] = useState(
    defaultAchievements.xp
  );


  const [level, setLevel] = useState(
    defaultAchievements.level
  );


  const [streak, setStreak] = useState(
    defaultAchievements.streak
  );


  const [badges, setBadges] = useState(
    defaultAchievements.badges
  );


  const [achievements, setAchievements] = useState(
    defaultAchievements.achievements
  );









  // Load achievements
  useEffect(() => {


    const saved =
      localStorage.getItem(
        ACHIEVEMENT_STORAGE_KEY
      );



    if(saved){

      const data = JSON.parse(saved);


      setXp(data.xp || 0);

      setLevel(data.level || 1);

      setStreak(data.streak || 0);

      setBadges(data.badges || []);

      setAchievements(
        data.achievements || []
      );


    }


  }, []);









  // Save achievements
  useEffect(() => {


    localStorage.setItem(

      ACHIEVEMENT_STORAGE_KEY,

      JSON.stringify({

        xp,

        level,

        streak,

        badges,

        achievements

      })

    );


  }, [

    xp,

    level,

    streak,

    badges,

    achievements

  ]);









  // Add XP
  const addXP = (amount)=>{


    setXp(prev => {


      const newXP = prev + amount;


      const newLevel =
        Math.floor(newXP / 500) + 1;


      setLevel(newLevel);


      return newXP;


    });


  };









  // Update learning streak
  const updateStreak = ()=>{


    setStreak(prev => prev + 1);


  };









  // Unlock badge
  const unlockBadge = (
    badgeId
  )=>{


    const badge =
      badgesList.find(

        item =>

        item.id === badgeId

      );



    if(!badge) return;




    const alreadyUnlocked =
      badges.some(

        item =>

        item.id === badgeId

      );



    if(alreadyUnlocked) return;





    setBadges(prev => [

      ...prev,

      badge

    ]);



  };









  // Add achievement
  const addAchievement = (
    achievement
  )=>{


    setAchievements(prev => [

      ...prev,

      {

        id: Date.now(),

        ...achievement

      }

    ]);


  };









  // Reset progress
  const resetAchievements = ()=>{


    setXp(0);

    setLevel(1);

    setStreak(0);

    setBadges([]);

    setAchievements([]);


  };









  // Stats
  const totalBadges =
    badges.length;


  const totalAchievements =
    achievements.length;









  return (

    <AchievementContext.Provider

      value={{

        xp,

        level,

        streak,

        badges,

        achievements,

        addXP,

        updateStreak,

        unlockBadge,

        addAchievement,

        resetAchievements,

        totalBadges,

        totalAchievements

      }}

    >

      {children}

    </AchievementContext.Provider>

  );


};









// Custom Hook
export const useAchievements = ()=>{


  const context =
    useContext(
      AchievementContext
    );



  if(!context){


    throw new Error(
      "useAchievements must be used inside AchievementProvider"
    );


  }



  return context;


};






export default AchievementContext;