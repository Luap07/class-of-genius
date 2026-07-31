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


import WritingStats from "../../../components/admin/languages/writing/WritingStats";
import WritingFilters from "../../../components/admin/languages/writing/WritingFilters";
import WritingGrid from "../../../components/admin/languages/writing/WritingGrid";
import WritingForm from "../../../components/admin/languages/writing/WritingForm";
import DeleteWritingModal from "../../../components/admin/languages/writing/DeleteWritingModal";
import EmptyWriting from "../../../components/admin/languages/writing/EmptyWriting";



export default function LanguageWritingAdmin(){



/* =========================
      DATA
========================= */


const [writing,setWriting] =
useState([]);


const [languages,setLanguages] =
useState([]);


const [filteredWriting,setFilteredWriting] =
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


const [editingWriting,setEditingWriting] =
useState(null);








/* =========================
      DELETE
========================= */


const [deleteWriting,setDeleteWriting] =
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
      FETCH WRITING
========================= */


const fetchWriting =
useCallback(async()=>{


try{


setLoading(true);



const {
data,
error
}
=
await supabase

.from("language_writing")

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



setWriting(
data || []
);



}

catch(error){


console.error(
"Fetch writing:",
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

fetchWriting();


},[
fetchLanguages,
fetchWriting
]);
/* =========================
      REFRESH
========================= */


const handleRefresh = async()=>{


try{


setRefreshing(true);



await Promise.all([

fetchLanguages(),

fetchWriting(),

]);


}

finally{


setRefreshing(false);


}


};









/* =========================
      SAVE WRITING
========================= */


const handleSaveWriting =
async(writingData)=>{


try{


setSaving(true);



const payload = {


language_id:
writingData.language_id,


title:
writingData.title,


description:
writingData.description,


content:
writingData.content,


instructions:
writingData.instructions,


level:
writingData.level,


duration:
writingData.duration,



};







if(editingWriting){



const {
error
}
=
await supabase

.from("language_writing")

.update(payload)

.eq(
"id",
editingWriting.id
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

.from("language_writing")

.insert([
payload
]);



if(error)
throw error;



}







setShowForm(false);


setEditingWriting(null);



await fetchWriting();



}

catch(error){


console.error(
"Save writing:",
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


setEditingWriting(item);


setShowForm(true);


};









/* =========================
      DELETE
========================= */


const handleDelete=(item)=>{


setDeleteWriting(item);


setShowDelete(true);


};









const confirmDelete =
async()=>{


if(!deleteWriting)
return;



try{


setDeleting(true);



const {
error
}
=
await supabase

.from("language_writing")

.delete()

.eq(
"id",
deleteWriting.id
);



if(error)
throw error;



setDeleteWriting(null);


setShowDelete(false);



await fetchWriting();



}

catch(error){


console.error(
"Delete writing:",
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


let data =
[
...writing
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
writing,
search,
languageFilter
]);








useEffect(()=>{


setFilteredWriting(
filteredData
);



},[
filteredData
]);
/* =========================
      STATS
========================= */


const totalWriting =
writing.length;



const totalLanguages =
new Set(
  writing.map(
    item => item.language_id
  )
).size;



const beginnerWriting =
writing.filter(
  item =>
  item.level === "Beginner"
).length;



const advancedWriting =
writing.filter(
  item =>
  item.level === "Advanced"
).length;








/* =========================
      CLOSE HANDLERS
========================= */


const closeForm = ()=>{

setShowForm(false);

setEditingWriting(null);

};



const closeDelete = ()=>{

setShowDelete(false);

setDeleteWriting(null);

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

Writing

</h1>


<p
className="
mt-2
text-slate-400
"
>

Manage writing exercises and language tasks.

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


setEditingWriting(null);

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


Add Writing


</button>



</div>



</div>









{/* =========================
      STATS
========================= */}



<WritingStats

totalWriting={
totalWriting
}


totalLanguages={
totalLanguages
}


beginnerWriting={
beginnerWriting
}


advancedWriting={
advancedWriting
}


/>









{/* =========================
      FILTERS
========================= */}



<WritingFilters

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


filteredWriting.length === 0 ? (


<EmptyWriting />


)


:


(


<WritingGrid

writing={
filteredWriting
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



<WritingForm

open={
showForm
}


writing={
editingWriting
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
handleSaveWriting
}


/>









{/* =========================
      DELETE
========================= */}



<DeleteWritingModal

open={
showDelete
}


writing={
deleteWriting
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