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


import ListeningStats from "../../../components/admin/languages/listening/ListeningStats";
import ListeningFilters from "../../../components/admin/languages/listening/ListeningFilters";
import ListeningGrid from "../../../components/admin/languages/listening/ListeningGrid";
import ListeningForm from "../../../components/admin/languages/listening/ListeningForm";
import DeleteListeningModal from "../../../components/admin/languages/listening/DeleteListeningModal";
import EmptyListening from "../../../components/admin/languages/listening/EmptyListening";



export default function LanguageListeningAdmin(){



/* =========================
      DATA
========================= */


const [listening,setListening] =
useState([]);


const [languages,setLanguages] =
useState([]);


const [filteredListening,setFilteredListening] =
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


const [editingListening,setEditingListening] =
useState(null);







/* =========================
      DELETE
========================= */


const [deleteListening,setDeleteListening] =
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
      FETCH LISTENING
========================= */


const fetchListening =
useCallback(async()=>{


try{


setLoading(true);



const {
data,
error
}
=
await supabase

.from("language_listening")

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



setListening(
data || []
);



}

catch(error){

console.error(
"Fetch listening:",
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

fetchListening();


},[
fetchLanguages,
fetchListening
]);
/* =========================
      REFRESH
========================= */


const handleRefresh = async()=>{

try{

setRefreshing(true);


await Promise.all([

fetchLanguages(),

fetchListening(),

]);


}

finally{

setRefreshing(false);

}

};







/* =========================
      SAVE LISTENING
========================= */


const handleSaveListening =
async(listeningData)=>{


try{


setSaving(true);



const payload = {


language_id:
listeningData.language_id,


title:
listeningData.title,


description:
listeningData.description,


audio_url:
listeningData.audio_url,


transcript:
listeningData.transcript,


level:
listeningData.level,


duration:
listeningData.duration,


};



if(editingListening){


const {
error
}
=
await supabase

.from("language_listening")

.update(payload)

.eq(
"id",
editingListening.id
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

.from("language_listening")

.insert([
payload
]);



if(error)
throw error;



}



setShowForm(false);


setEditingListening(null);



await fetchListening();



}

catch(error){


console.error(
"Save listening:",
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


setEditingListening(item);


setShowForm(true);


};








/* =========================
      DELETE
========================= */


const handleDelete=(item)=>{


setDeleteListening(item);


setShowDelete(true);


};







const confirmDelete =
async()=>{


if(!deleteListening)
return;



try{


setDeleting(true);



const {
error
}
=
await supabase

.from("language_listening")

.delete()

.eq(
"id",
deleteListening.id
);



if(error)
throw error;



setShowDelete(false);


setDeleteListening(null);



await fetchListening();



}

catch(error){


console.error(
"Delete listening:",
error
);


}

finally{


setDeleting(false);


}


};








/* =========================
      FILTER
========================= */


const filteredData =
useMemo(()=>{


let data=[
...listening
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

item.description
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
listening,
search,
languageFilter
]);







useEffect(()=>{


setFilteredListening(
filteredData
);


},[
filteredData
]);
/* =========================
      STATS
========================= */


const totalListening =
listening.length;



const totalLanguages =
new Set(
  listening.map(
    item=>item.language_id
  )
).size;



const beginnerListening =
listening.filter(
  item =>
  item.level === "Beginner"
).length;



const advancedListening =
listening.filter(
  item =>
  item.level === "Advanced"
).length;








/* =========================
      CLOSE HANDLERS
========================= */


const closeForm = ()=>{

setShowForm(false);

setEditingListening(null);

};



const closeDelete = ()=>{

setShowDelete(false);

setDeleteListening(null);

};









return (

<section
className="
space-y-8
"
>



{/* =========================
      HEADER
========================= */}



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

Listening

</h1>


<p
className="
mt-2
text-slate-400
"
>

Manage listening exercises and audio lessons.

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

setEditingListening(null);

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


Add Listening


</button>



</div>


</div>









{/* =========================
      STATS
========================= */}



<ListeningStats

totalListening={
totalListening
}


totalLanguages={
totalLanguages
}


beginnerListening={
beginnerListening
}


advancedListening={
advancedListening
}


/>








{/* =========================
      FILTERS
========================= */}



<ListeningFilters

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









{/* =========================
      CONTENT
========================= */}



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
text-cyan-500
"

/>


</div>



)


:


filteredListening.length === 0 ? (


<EmptyListening />


)

:

(

<ListeningGrid

listening={
filteredListening
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

{/* ========================= FORM========================= */}
<ListeningForm

open={
showForm
}

listening={
editingListening
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
handleSaveListening
}

/>

{/* ========================= DELETE ========================= */}
<DeleteListeningModal

open={
showDelete
}

listening={
deleteListening
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