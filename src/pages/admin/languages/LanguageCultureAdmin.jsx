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


import CultureStats from "../../../components/admin/languages/culture/CultureStats";
import CultureFilters from "../../../components/admin/languages/culture/CultureFilters";
import CultureGrid from "../../../components/admin/languages/culture/CultureGrid";
import CultureForm from "../../../components/admin/languages/culture/CultureForm";
import DeleteCultureModal from "../../../components/admin/languages/culture/DeleteCultureModal";
import EmptyCulture from "../../../components/admin/languages/culture/EmptyCulture";



export default function LanguageCultureAdmin(){



/* =========================
      DATA
========================= */


const [culture,setCulture] =
useState([]);


const [languages,setLanguages] =
useState([]);


const [filteredCulture,setFilteredCulture] =
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
      FILTERS
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


const [editingCulture,setEditingCulture] =
useState(null);








/* =========================
      DELETE
========================= */


const [deleteCulture,setDeleteCulture] =
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
      FETCH CULTURE
========================= */


const fetchCulture =
useCallback(async()=>{


try{


setLoading(true);



const {
data,
error
}
=
await supabase

.from("language_culture")

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



setCulture(
data || []
);



}

catch(error){


console.error(
"Fetch culture:",
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

fetchCulture();


},[
fetchLanguages,
fetchCulture
]);
/* =========================
      REFRESH
========================= */


const handleRefresh = async()=>{


try{


setRefreshing(true);



await Promise.all([

fetchLanguages(),

fetchCulture(),

]);


}

finally{


setRefreshing(false);


}


};








/* =========================
      SAVE CULTURE
========================= */


const handleSaveCulture =
async(cultureData)=>{


try{


setSaving(true);



const payload = {


language_id:
cultureData.language_id,


title:
cultureData.title,


description:
cultureData.description,


category:
cultureData.category,


content:
cultureData.content,


image_url:
cultureData.image_url,


level:
cultureData.level,



};







if(editingCulture){



const {
error
}
=
await supabase

.from("language_culture")

.update(payload)

.eq(
"id",
editingCulture.id
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

.from("language_culture")

.insert([
payload
]);



if(error)
throw error;



}






setShowForm(false);


setEditingCulture(null);



await fetchCulture();



}

catch(error){


console.error(
"Save culture:",
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


setEditingCulture(item);


setShowForm(true);


};









/* =========================
      DELETE
========================= */


const handleDelete=(item)=>{


setDeleteCulture(item);


setShowDelete(true);


};








const confirmDelete =
async()=>{


if(!deleteCulture)
return;



try{


setDeleting(true);



const {
error
}
=
await supabase

.from("language_culture")

.delete()

.eq(
"id",
deleteCulture.id
);



if(error)
throw error;



setDeleteCulture(null);


setShowDelete(false);



await fetchCulture();



}

catch(error){


console.error(
"Delete culture:",
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
...culture
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


item.category
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
culture,
search,
languageFilter
]);








useEffect(()=>{


setFilteredCulture(
filteredData
);



},[
filteredData
]);
/* =========================
      STATS
========================= */


const totalCulture =
culture.length;



const totalLanguages =
new Set(
  culture.map(
    item=>item.language_id
  )
).size;



const categories =
new Set(
  culture
  .map(
    item=>item.category
  )
  .filter(Boolean)
).size;








/* =========================
      CLOSE HANDLERS
========================= */


const closeForm = ()=>{

setShowForm(false);

setEditingCulture(null);

};



const closeDelete = ()=>{

setShowDelete(false);

setDeleteCulture(null);

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

Culture

</h1>


<p
className="
mt-2
text-slate-400
"
>

Manage cultural lessons and language insights.

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


setEditingCulture(null);

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


Add Culture


</button>




</div>


</div>









{/* =========================
      STATS
========================= */}



<CultureStats

totalCulture={
totalCulture
}


totalLanguages={
totalLanguages
}


categories={
categories
}


/>









{/* =========================
      FILTERS
========================= */}



<CultureFilters

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


filteredCulture.length === 0 ? (


<EmptyCulture />


)


:


(


<CultureGrid

culture={
filteredCulture
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



<CultureForm

open={
showForm
}


culture={
editingCulture
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
handleSaveCulture
}


/>









{/* =========================
      DELETE
========================= */}



<DeleteCultureModal

open={
showDelete
}


culture={
deleteCulture
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