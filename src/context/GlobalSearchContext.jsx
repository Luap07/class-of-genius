import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";


const GlobalSearchContext = createContext();


export const useGlobalSearch = () => {
  return useContext(GlobalSearchContext);
};



export const GlobalSearchProvider = ({ children }) => {


  const [query, setQuery] = useState("");



  /*
    SEARCH DATABASE

    Later this will connect to:
    - Supabase courses
    - lessons
    - labs
    - CBT
    - novels

  */

  const searchData = [

    // COURSES

    {
      id:1,
      title:"Physics Motion",
      type:"Course",
      path:"/courses/physics",
      icon:"📘",
    },


    {
      id:2,
      title:"Organic Chemistry",
      type:"Course",
      path:"/courses/chemistry",
      icon:"🧪",
    },


    {
      id:3,
      title:"Mathematics Algebra",
      type:"Course",
      path:"/courses/mathematics",
      icon:"📐",
    },


    // LABS

    {
      id:4,
      title:"Physics Virtual Lab",
      type:"Virtual Lab",
      path:"/lab/physics",
      icon:"⚡",
    },


    {
      id:5,
      title:"Chemistry Virtual Lab",
      type:"Virtual Lab",
      path:"/lab/chemistry",
      icon:"⚗️",
    },


    {
      id:6,
      title:"Biology Virtual Lab",
      type:"Virtual Lab",
      path:"/lab/biology",
      icon:"🧬",
    },


    // AI

    {
      id:7,
      title:"AI Tutor",
      type:"AI",
      path:"/ai-tutor",
      icon:"🤖",
    },


    // CBT

    {
      id:8,
      title:"CBT Practice Exams",
      type:"CBT",
      path:"/cbt",
      icon:"📝",
    },


    // NOVELS

    {
      id:9,
      title:"Educational Novels",
      type:"Novels",
      path:"/novels",
      icon:"📚",
    },


  ];



  const results = useMemo(()=>{


    if(!query.trim()) {
      return [];
    }


    return searchData.filter((item)=>

      item.title
      .toLowerCase()
      .includes(
        query.toLowerCase()
      )

    );


  },[query]);




  return (

    <GlobalSearchContext.Provider

      value={{

        query,

        setQuery,

        results,

      }}

    >

      {children}

    </GlobalSearchContext.Provider>

  );

};