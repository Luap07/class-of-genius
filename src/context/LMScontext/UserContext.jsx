// src/context/UserContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";


// Create Context
const UserContext = createContext();


// Storage Key
const USER_STORAGE_KEY = "lms_user";


// Default User Data
const defaultUser = {

  id: 1,

  name: "Student",

  email: "",

  avatar: null,

  role: "student",

  joinedDate: new Date().toISOString(),


  preferences: {

    theme: "dark",

    language: "English",

    notifications: true

  },


  learningSettings: {

    studyGoal: "Learn",

    dailyTarget: 30,

    preferredSubjects: []

  }

};







// Provider
export const UserProvider = ({ children }) => {


  const [user, setUser] = useState(
    defaultUser
  );









  // Load User
  useEffect(() => {


    const savedUser =
      localStorage.getItem(
        USER_STORAGE_KEY
      );


    if(savedUser){

      setUser(
        JSON.parse(savedUser)
      );

    }


  }, []);









  // Save User
  useEffect(() => {


    localStorage.setItem(

      USER_STORAGE_KEY,

      JSON.stringify(user)

    );


  }, [

    user

  ]);









  // Update profile
  const updateProfile = (
    updates
  )=>{


    setUser(prev => ({

      ...prev,

      ...updates

    }));


  };









  // Update preferences
  const updatePreferences = (
    preferences
  )=>{


    setUser(prev => ({


      ...prev,


      preferences:{


        ...prev.preferences,


        ...preferences


      }


    }));


  };









  // Update learning settings
  const updateLearningSettings = (
    settings
  )=>{


    setUser(prev => ({


      ...prev,


      learningSettings:{


        ...prev.learningSettings,


        ...settings


      }


    }));


  };









  // Change avatar
  const updateAvatar = (
    avatar
  )=>{


    setUser(prev => ({


      ...prev,


      avatar


    }));


  };









  // Reset User
  const resetUser = ()=>{


    setUser(
      defaultUser
    );


  };









  return (

    <UserContext.Provider

      value={{

        user,

        updateProfile,

        updatePreferences,

        updateLearningSettings,

        updateAvatar,

        resetUser

      }}

    >

      {children}

    </UserContext.Provider>
  );

};

// Custom Hook
export const useUser = ()=>{


  const context =
    useContext(
      UserContext
    );



  if(!context){


    throw new Error(
      "useUser must be used inside UserProvider"
    );


  }



  return context;
};






export default UserContext;