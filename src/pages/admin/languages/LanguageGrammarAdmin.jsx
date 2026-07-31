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


import GrammarStats from "../../../components/admin/languages/grammar/GrammarStats";
import GrammarFilters from "../../../components/admin/languages/grammar/GrammarFilters";
import GrammarGrid from "../../../components/admin/languages/grammar/GrammarGrid";
import GrammarForm from "../../../components/admin/languages/grammar/GrammarForm";
import DeleteGrammarModal from "../../../components/admin/languages/grammar/DeleteGrammarModal";
import EmptyGrammar from "../../../components/admin/languages/grammar/EmptyGrammar";



export default function LanguageGrammarAdmin(){


/* =========================
      DATA
========================= */


const [grammar,setGrammar] =
useState([]);


const [languages,setLanguages] =
useState([]);


const [filteredGrammar,setFilteredGrammar] =
useState([]);




/* =========================
      LOADING
========================= */


const [loading,setLoading] =
useState(true);


const [refreshing,setRefreshing] =
useState(false);


const [saving,setSaving] =
useState(false);




/* =========================
      FILTER
========================= */


const [search,setSearch] =
useState("");


const [languageFilter,setLanguageFilter] =
useState("all");




/* =========================
      FORM
========================= */


const [showForm,setShowForm] =
useState(false);


const [editingGrammar,setEditingGrammar] =
useState(null);




/* =========================
      DELETE
========================= */


const [deleteGrammar,setDeleteGrammar] =
useState(null);


const [showDelete,setShowDelete] =
useState(false);


const [deleting,setDeleting] =
useState(false);





/* =========================
      FETCH LANGUAGES
========================= */


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

.select(
"id,name"
)

.order(
"name"
);



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





/* =========================
      FETCH GRAMMAR
========================= */


const fetchGrammar =
useCallback(async()=>{


try{


setLoading(true);



const {
data,
error
}
=
await supabase

.from("language_grammar")

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



setGrammar(
data || []
);



}

catch(error){

console.error(
"Fetch grammar:",
error
);


}

finally{

setLoading(false);

}


},[]);





/* =========================
      INITIAL LOAD
========================= */


useEffect(()=>{


fetchLanguages();

fetchGrammar();


},[
fetchLanguages,
fetchGrammar
]);
/* =========================
      REFRESH
========================= */


const handleRefresh = async()=>{


try{


setRefreshing(true);



await Promise.all([

fetchLanguages(),

fetchGrammar(),

]);


}

finally{


setRefreshing(false);


}


};





/* =========================
      SAVE GRAMMAR
========================= */


const handleSaveGrammar =
async(grammarData)=>{


try{


setSaving(true);



const payload = {


language_id:
grammarData.language_id,


title:
grammarData.title,


description:
grammarData.description,


rule:
grammarData.rule,


example:
grammarData.example,


level:
grammarData.level,


};



if(editingGrammar){


const {
error
}
=
await supabase

.from("language_grammar")

.update(payload)

.eq(
"id",
editingGrammar.id
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

.from("language_grammar")

.insert([
payload
]);



if(error)
throw error;



}



setShowForm(false);


setEditingGrammar(null);



await fetchGrammar();



}

catch(error){


console.error(
"Save grammar:",
error
);


}

finally{


setSaving(false);


}


};







/* =========================
      EDIT
========================= */


const handleEdit=(item)=>{


setEditingGrammar(item);


setShowForm(true);


};





/* =========================
      DELETE
========================= */


const handleDelete=(item)=>{


setDeleteGrammar(item);


setShowDelete(true);


};





const confirmDelete =
async()=>{


if(!deleteGrammar)
return;



try{


setDeleting(true);



const {
error
}
=
await supabase

.from("language_grammar")

.delete()

.eq(
"id",
deleteGrammar.id
);



if(error)
throw error;



setShowDelete(false);


setDeleteGrammar(null);



await fetchGrammar();



}

catch(error){


console.error(
"Delete grammar:",
error
);


}

finally{


setDeleting(false);


}


};






/* =========================
      FILTER DATA
========================= */


const filteredData =
useMemo(()=>{


let data=[
...grammar
];



if(search.trim()){


const keyword =
search.toLowerCase();



data =
data.filter((item)=>{


return (

item.title
?.toLowerCase()
.includes(keyword)



||

item.rule
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
grammar,
search,
languageFilter
]);






useEffect(()=>{


setFilteredGrammar(
filteredData
);


},[
filteredData
]);
/* =========================
      STATISTICS
========================= */


const totalGrammar =
  grammar.length;


const totalLanguages =
  new Set(
    grammar.map(
      item=>item.language_id
    )
  ).size;



const beginnerGrammar =
  grammar.filter(
    item =>
    item.level === "Beginner"
  ).length;



const advancedGrammar =
  grammar.filter(
    item =>
    item.level === "Advanced"
  ).length;





/* =========================
      CLOSE HANDLERS
========================= */


const closeForm = ()=>{

setShowForm(false);

setEditingGrammar(null);

};



const closeDelete = ()=>{

setShowDelete(false);

setDeleteGrammar(null);

};






/* =========================
      RETURN
========================= */


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

Grammar

</h1>


<p
className="
mt-2
text-slate-400
"
>

Manage grammar lessons and rules for languages.

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
text-white
font-semibold
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

setEditingGrammar(null);

setShowForm(true);

}}

className="
flex
items-center
gap-2
rounded-2xl
bg-gradient-to-r
from-indigo-500
to-blue-600
px-6
py-3
font-bold
text-white
"

>


<Plus size={18}/>


Add Grammar


</button>


</div>


</div>





{/* STATS */}



<GrammarStats

totalGrammar={
totalGrammar
}


totalLanguages={
totalLanguages
}


beginnerGrammar={
beginnerGrammar
}


advancedGrammar={
advancedGrammar
}


/>






{/* FILTERS */}



<GrammarFilters

search={
search
}


setSearch={
setSearch
}


languageFilter={
languageFilter
}


setLanguageFilter={
setLanguageFilter
}


languages={
languages
}


/>







{/* CONTENT */}



{

loading ? (


<div
className="
flex
justify-center
py-20
"
>

<Loader2
className="
h-12
w-12
animate-spin
text-indigo-500
"
/>


</div>



)


:

filteredGrammar.length === 0 ? (


<EmptyGrammar />


)


:


(


<GrammarGrid

grammar={
filteredGrammar
}


onEdit={
handleEdit
}


onDelete={
handleDelete
}


/>


)

}






{/* FORM */}



<GrammarForm

open={
showForm
}


grammar={
editingGrammar
}


languages={
languages
}


saving={
saving
}


onClose={
closeForm
}


onSave={
handleSaveGrammar
}


/>





{/* DELETE */}



<DeleteGrammarModal

open={
showDelete
}


grammar={
deleteGrammar
}


deleting={
deleting
}


onClose={
closeDelete
}


onConfirm={
confirmDelete
}


/>




</section>


);


}