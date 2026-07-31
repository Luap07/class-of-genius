import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";


import VocabularyStats from "../../../components/admin/languages/vocabulary/VocabularyStats";
import VocabularyFilters from "../../../components/admin/languages/vocabulary/VocabularyFilters";
import VocabularyGrid from "../../../components/admin/languages/vocabulary/VocabularyGrid";
import VocabularyForm from "../../../components/admin/languages/vocabulary/VocabularyForm";
import DeleteVocabularyModal from "../../../components/admin/languages/vocabulary/DeleteVocabularyModal";
import EmptyVocabulary from "../../../components/admin/languages/vocabulary/EmptyVocabulary";



export default function LanguageVocabularyAdmin(){


/* ---------------------------------
      DATA
---------------------------------- */


const [vocabulary,setVocabulary] =
useState([]);


const [languages,setLanguages] =
useState([]);


const [filteredVocabulary,setFilteredVocabulary] =
useState([]);



/* ---------------------------------
      LOADING
---------------------------------- */


const [loading,setLoading] =
useState(true);


const [refreshing,setRefreshing] =
useState(false);


const [saving,setSaving] =
useState(false);



/* ---------------------------------
      SEARCH / FILTER
---------------------------------- */


const [search,setSearch] =
useState("");


const [languageFilter,setLanguageFilter] =
useState("all");



/* ---------------------------------
      FORM
---------------------------------- */


const [showForm,setShowForm] =
useState(false);


const [editingWord,setEditingWord] =
useState(null);



/* ---------------------------------
      DELETE
---------------------------------- */


const [deleteWord,setDeleteWord] =
useState(null);


const [showDelete,setShowDelete] =
useState(false);


const [deleting,setDeleting] =
useState(false);





/* ---------------------------------
      FETCH LANGUAGES
---------------------------------- */


const fetchLanguages =
useCallback(async()=>{


try{


const {
data,
error
}
=
await supabase

.from("languages")

.select("id,name")

.order("name");



if(error)
throw error;



setLanguages(
data || []
);



}

catch(error){

console.error(
"Fetch languages:",
error
);

}



},[]);




/* ---------------------------------
      FETCH VOCABULARY
---------------------------------- */


const fetchVocabulary =
useCallback(async()=>{


try{


setLoading(true);



const {
data,
error
}
=
await supabase

.from("language_vocabulary")

.select(`

*

,

languages(
id,
name
)

`)

.order(
"created_at",
{
ascending:false
}
);



if(error)
throw error;



setVocabulary(
data || []
);



}

catch(error){

console.error(
"Fetch vocabulary:",
error
);


}


finally{

setLoading(false);

}



},[]);




/* ---------------------------------
      INITIAL LOAD
---------------------------------- */


useEffect(()=>{


fetchLanguages();

fetchVocabulary();


},[
fetchLanguages,
fetchVocabulary
]);
/* ---------------------------------
      REFRESH
---------------------------------- */


const handleRefresh = async()=>{

  try{

    setRefreshing(true);


    await Promise.all([
      fetchLanguages(),
      fetchVocabulary(),
    ]);


  }

  finally{

    setRefreshing(false);

  }

};





/* ---------------------------------
      CREATE / UPDATE
---------------------------------- */


const handleSaveVocabulary = async(wordData)=>{


try{


setSaving(true);



const payload = {


  language_id:
    wordData.language_id,


  word:
    wordData.word,


  meaning:
    wordData.meaning,


  pronunciation:
    wordData.pronunciation,


  example:
    wordData.example,


  audio_url:
    wordData.audio_url,


  category:
    wordData.category,


};



if(editingWord){


const {
error
}
=
await supabase

.from("language_vocabulary")

.update(payload)

.eq(
"id",
editingWord.id
);



if(error)
throw error;



}


else{


const {
error
}
=
await supabase

.from("language_vocabulary")

.insert([
payload
]);



if(error)
throw error;


}



setShowForm(false);

setEditingWord(null);


await fetchVocabulary();



}

catch(error){


console.error(
"Save vocabulary:",
error
);


}

finally{


setSaving(false);


}


};






/* ---------------------------------
      EDIT
---------------------------------- */


const handleEdit=(word)=>{


setEditingWord(word);


setShowForm(true);


};






/* ---------------------------------
      DELETE OPEN
---------------------------------- */


const handleDelete=(word)=>{


setDeleteWord(word);


setShowDelete(true);


};







/* ---------------------------------
      DELETE CONFIRM
---------------------------------- */


const confirmDelete = async()=>{


if(!deleteWord)
return;



try{


setDeleting(true);



const {
error
}
=
await supabase

.from("language_vocabulary")

.delete()

.eq(
"id",
deleteWord.id
);



if(error)
throw error;



setShowDelete(false);


setDeleteWord(null);



await fetchVocabulary();



}

catch(error){


console.error(
"Delete vocabulary:",
error
);


}


finally{


setDeleting(false);


}


};





/* ---------------------------------
      FILTER
---------------------------------- */


const filteredData =
useMemo(()=>{


let data=[
...vocabulary
];



if(search.trim()){


const keyword =
search.toLowerCase();



data =
data.filter((item)=>{


return (

item.word
?.toLowerCase()
.includes(keyword)



||

item.meaning
?.toLowerCase()
.includes(keyword)



||

item.languages?.name
?.toLowerCase()
.includes(keyword)


);



});


}



if(languageFilter !== "all"){


data =
data.filter(
(item)=>

String(item.language_id)
===
String(languageFilter)

);


}



return data;



},[
vocabulary,
search,
languageFilter
]);





useEffect(()=>{


setFilteredVocabulary(
filteredData
);


},[
filteredData
]);
/* ---------------------------------
      STATISTICS
---------------------------------- */


const totalWords =
  vocabulary.length;


const totalLanguages =
  languages.length;


const categories =
  new Set(
    vocabulary
      .map(
        (item)=>item.category
      )
      .filter(Boolean)
  ).size;



/* ---------------------------------
      CLOSE HANDLERS
---------------------------------- */


const closeForm = ()=>{

  setShowForm(false);

  setEditingWord(null);

};



const closeDelete = ()=>{

  setShowDelete(false);

  setDeleteWord(null);

};




/* ---------------------------------
      RETURN
---------------------------------- */


return (

<section
className="
space-y-8
"
>


{/* HEADER */}


<div
className="
flex
flex-col
gap-6
lg:flex-row
lg:items-center
lg:justify-between
"
>


<div>


<h1
className="
text-4xl
font-black
text-white
"
>

Vocabulary

</h1>


<p
className="
mt-2
text-slate-400
"
>

Manage vocabulary words for every language.

</p>


</div>




<div
className="
flex
gap-3
"
>


<button

onClick={handleRefresh}

disabled={refreshing}

className="
flex
items-center
gap-2
rounded-2xl
border
border-slate-700
bg-slate-900
px-5
py-3
font-semibold
text-white
"

>


{
refreshing ?

<Loader2
size={18}
className="animate-spin"
/>

:

<RefreshCw
size={18}
/>

}


Refresh


</button>





<button

onClick={()=>{

setEditingWord(null);

setShowForm(true);

}}

className="
flex
items-center
gap-2
rounded-2xl
bg-gradient-to-r
from-cyan-500
to-blue-600
px-6
py-3
font-bold
text-white
"

>


<Plus size={18}/>


Add Word


</button>



</div>


</div>





{/* STATS */}


<WordStats

totalWords={totalWords}

totalLanguages={totalLanguages}

categories={categories}

/>





{/* FILTERS */}


<WordFilters

search={search}

setSearch={setSearch}

languageFilter={languageFilter}

setLanguageFilter={setLanguageFilter}

languages={languages}

/>






{/* CONTENT */}



{
loading ? (


<LoadingVocabulary />


)

:

filteredVocabulary.length === 0 ? (


<EmptyVocabulary />


)

:

(


<VocabularyGrid

words={filteredVocabulary}

onEdit={handleEdit}

onDelete={handleDelete}

/>


)

}







{/* FORM */}



<WordForm

open={showForm}

word={editingWord}

languages={languages}

saving={saving}

onClose={closeForm}

onSave={handleSaveVocabulary}


/>






{/* DELETE */}



<DeleteWordModal

open={showDelete}

word={deleteWord}

deleting={deleting}

onClose={closeDelete}

onConfirm={confirmDelete}

/>



</section>

);


}