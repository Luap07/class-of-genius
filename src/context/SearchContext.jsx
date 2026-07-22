import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";


export const SearchContext = createContext(null);



export const SearchProvider = ({ children }) => {


  const [searchValue, setSearchValue] = useState("");



  const [history, setHistory] = useState(() => {

    try {

      const saved =
        localStorage.getItem("searchHistory");

      return saved
        ? JSON.parse(saved)
        : [];

    } catch {

      return [];

    }

  });



  /* ================= SAVE SEARCH ================= */

  const saveSearch = (value) => {

    const trimmed = value?.trim();

    if (!trimmed) return;


    setHistory((prev)=>{

      const updated = [

        trimmed,

        ...prev.filter(
          (item)=>item !== trimmed
        ),

      ].slice(0,10);



      localStorage.setItem(
        "searchHistory",
        JSON.stringify(updated)
      );


      return updated;

    });

  };



  /* ================= DELETE SEARCH ================= */

  const deleteSearchItem = (value)=>{


    setHistory((prev)=>{


      const updated =
        prev.filter(
          (item)=>item !== value
        );


      localStorage.setItem(
        "searchHistory",
        JSON.stringify(updated)
      );


      return updated;

    });


  };



  /* ================= CLEAR HISTORY ================= */

  const clearHistory = ()=>{


    setHistory([]);


    localStorage.removeItem(
      "searchHistory"
    );


  };



  /* ================= STORAGE SYNC ================= */

  useEffect(()=>{


    const sync = ()=>{


      try {


        const updated =
          JSON.parse(
            localStorage.getItem(
              "searchHistory"
            )
          ) || [];



        setHistory(updated);


      } catch {}

    };



    window.addEventListener(
      "storage",
      sync
    );


    return ()=>{

      window.removeEventListener(
        "storage",
        sync
      );

    };


  },[]);




  return (

    <SearchContext.Provider

      value={{

        searchValue,

        setSearchValue,


        history,

        saveSearch,

        deleteSearchItem,

        clearHistory,

      }}

    >

      {children}

    </SearchContext.Provider>

  );

};





// ================= USE SEARCH HOOK =================

export const useSearch = ()=>{


  const context =
    useContext(SearchContext);



  if(!context){


    throw new Error(
      "useSearch must be used inside SearchProvider"
    );


  }



  return context;


};