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


import SpeakingStats from "../../../components/admin/languages/speaking/SpeakingStats";
import SpeakingFilters from "../../../components/admin/languages/speaking/SpeakingFilters";
import SpeakingGrid from "../../../components/admin/languages/speaking/SpeakingGrid";
import SpeakingForm from "../../../components/admin/languages/speaking/SpeakingForm";
import DeleteSpeakingModal from "../../../components/admin/languages/speaking/DeleteSpeakingModal";
import EmptySpeaking from "../../../components/admin/languages/speaking/EmptySpeaking";



export default function LanguageSpeakingAdmin(){



/* =========================
      DATA
========================= */


const [speaking,setSpeaking] =
useState([]);


const [languages,setLanguages] =
useState([]);


const [filteredSpeaking,setFilteredSpeaking] =
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


const [editingSpeaking,setEditingSpeaking] =
useState(null);








/* =========================
      DELETE
========================= */


const [deleteSpeaking,setDeleteSpeaking] =
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
      FETCH SPEAKING
========================= */


const fetchSpeaking =
useCallback(async()=>{


try{


setLoading(true);



const {
data,
error
}
=
await supabase

.from("language_speaking")

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



setSpeaking(
data || []
);



}

catch(error){


console.error(
"Fetch speaking:",
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

fetchSpeaking();


},[
fetchLanguages,
fetchSpeaking
]);
/* =========================
      REFRESH
========================= */


const handleRefresh = async()=>{


try{


setRefreshing(true);



await Promise.all([

fetchLanguages(),

fetchSpeaking(),

]);


}

finally{


setRefreshing(false);


}


};








/* =========================
      SAVE SPEAKING
========================= */


const handleSaveSpeaking =
async(speakingData)=>{


try{


setSaving(true);



const payload = {


language_id:
speakingData.language_id,


title:
speakingData.title,


description:
speakingData.description,


prompt:
speakingData.prompt,


audio_example:
speakingData.audio_example,


level:
speakingData.level,


duration:
speakingData.duration,



};





if(editingSpeaking){



const {
error
}
=
await supabase

.from("language_speaking")

.update(payload)

.eq(
"id",
editingSpeaking.id
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

.from("language_speaking")

.insert([
payload
]);



if(error)
throw error;



}






setShowForm(false);


setEditingSpeaking(null);



await fetchSpeaking();



}

catch(error){


console.error(
"Save speaking:",
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


setEditingSpeaking(item);


setShowForm(true);


};









/* =========================
      DELETE
========================= */


const handleDelete=(item)=>{


setDeleteSpeaking(item);


setShowDelete(true);


};









const confirmDelete =
async()=>{


if(!deleteSpeaking)
return;



try{


setDeleting(true);



const {
error
}
=
await supabase

.from("language_speaking")

.delete()

.eq(
"id",
deleteSpeaking.id
);



if(error)
throw error;



setDeleteSpeaking(null);


setShowDelete(false);



await fetchSpeaking();



}

catch(error){


console.error(
"Delete speaking:",
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
...speaking
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
speaking,
search,
languageFilter
]);







useEffect(()=>{


setFilteredSpeaking(
filteredData
);



},[
filteredData
]);
/* =========================
      STATS
========================= */


const totalSpeaking =
speaking.length;



const totalLanguages =
new Set(
  speaking.map(
    item=>item.language_id
  )
).size;



const beginnerSpeaking =
speaking.filter(
  item =>
  item.level === "Beginner"
).length;



const advancedSpeaking =
speaking.filter(
  item =>
  item.level === "Advanced"
).length;








/* =========================
      CLOSE HANDLERS
========================= */


const closeForm = ()=>{

setShowForm(false);

setEditingSpeaking(null);

};



const closeDelete = ()=>{

setShowDelete(false);

setDeleteSpeaking(null);

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

Speaking

</h1>


<p
className="
mt-2
text-slate-400
"
>

Manage speaking exercises and practice lessons.

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


setEditingSpeaking(null);

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


Add Speaking


</button>




</div>


</div>









{/* =========================
      STATS
========================= */}



<SpeakingStats

totalSpeaking={
totalSpeaking
}


totalLanguages={
totalLanguages
}


beginnerSpeaking={
beginnerSpeaking
}


advancedSpeaking={
advancedSpeaking
}


/>









{/* =========================
      FILTERS
========================= */}



<SpeakingFilters

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


filteredSpeaking.length === 0 ? (


<EmptySpeaking />


)


:


(


<SpeakingGrid

speaking={
filteredSpeaking
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









{/* =========================
      FORM
========================= */}



<SpeakingForm

open={
showForm
}


speaking={
editingSpeaking
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
handleSaveSpeaking
}


/>









{/* =========================
      DELETE
========================= */}



<DeleteSpeakingModal

open={
showDelete
}


speaking={
deleteSpeaking
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