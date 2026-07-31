// src/components/admin/languages/LanguagesGrid.jsx

import React from "react";

import LanguageCard from "./LanguageCard";


export default function LanguagesGrid({

  languages = [],

  onEdit,

  onDelete,

  onManageContent,

}) {


  if(!languages.length){

    return null;

  }



  return (

    <div
      className="
      grid
      gap-6
      md:grid-cols-2
      xl:grid-cols-3
      "
    >


      {
        languages.map((language)=>(

          <LanguageCard

            key={language.id}

            language={language}

            onEdit={onEdit}

            onDelete={onDelete}

            onManageContent={onManageContent}

          />

        ))
      }



    </div>

  );


}