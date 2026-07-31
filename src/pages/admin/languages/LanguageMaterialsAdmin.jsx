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
  Upload,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";


import MaterialStats from "../../../components/admin/languages/materials/MaterialStats";
import MaterialFilters from "../../../components/admin/languages/materials/MaterialFilters";
import MaterialsGrid from "../../../components/admin/languages/materials/MaterialsGrid";
import MaterialForm from "../../../components/admin/languages/materials/MaterialForm";
import DeleteMaterialModal from "../../../components/admin/languages/materials/DeleteMaterialModal";
import EmptyMaterials from "../../../components/admin/languages/materials/EmptyMaterials";



export default function LanguageMaterialsAdmin(){



/* =========================
      DATA
========================= */


const [materials,setMaterials] =
useState([]);


const [languages,setLanguages] =
useState([]);


const [filteredMaterials,setFilteredMaterials] =
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


const [editingMaterial,setEditingMaterial] =
useState(null);








/* =========================
      DELETE
========================= */


const [deleteMaterial,setDeleteMaterial] =
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
      FETCH MATERIALS
========================= */


const fetchMaterials =
useCallback(async()=>{


try{


setLoading(true);



const {
data,
error
}
=
await supabase

.from("language_materials")

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



setMaterials(
data || []
);



}

catch(error){


console.error(
"Fetch materials:",
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

fetchMaterials();


},[
fetchLanguages,
fetchMaterials
]);
/* =========================
      UPLOAD FILE
========================= */


const uploadFile =
async(file)=>{


if(!file)
return null;



const extension =
file.name
.split(".")
.pop();



const fileName =
`${Date.now()}-${Math.random()
.toString(36)
.substring(2)}.${extension}`;





const {
error
}
=
await supabase.storage

.from("language-materials")

.upload(
fileName,
file
);





if(error)
throw error;






const {
data
}
=
supabase.storage

.from("language-materials")

.getPublicUrl(
fileName
);



return data.publicUrl;


};









/* =========================
      REFRESH
========================= */


const handleRefresh =
async()=>{


try{


setRefreshing(true);



await Promise.all([

fetchLanguages(),

fetchMaterials(),

]);


}

finally{


setRefreshing(false);


}


};









/* =========================
      SAVE MATERIAL
========================= */


const handleSaveMaterial =
async(materialData)=>{


try{


setSaving(true);



let fileUrl =
editingMaterial?.file_url || "";



if(materialData.file){


fileUrl =
await uploadFile(
materialData.file
);


}






const payload = {


language_id:
materialData.language_id,


title:
materialData.title,


description:
materialData.description,


type:
materialData.type,


file_url:
fileUrl,


category:
materialData.category,


level:
materialData.level,


};



if(editingMaterial){



const {
error
}
=
await supabase

.from("language_materials")

.update(payload)

.eq(
"id",
editingMaterial.id
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

.from("language_materials")

.insert([
payload
]);



if(error)
throw error;



}








setShowForm(false);


setEditingMaterial(null);



await fetchMaterials();



}

catch(error){


console.error(
"Save material:",
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


setEditingMaterial(item);


setShowForm(true);


};









/* =========================
      DELETE
========================= */


const handleDelete=(item)=>{


setDeleteMaterial(item);


setShowDelete(true);


};









const confirmDelete =
async()=>{


if(!deleteMaterial)
return;



try{


setDeleting(true);



const {
error
}
=
await supabase

.from("language_materials")

.delete()

.eq(
"id",
deleteMaterial.id
);



if(error)
throw error;



setDeleteMaterial(null);


setShowDelete(false);



await fetchMaterials();



}

catch(error){


console.error(
"Delete material:",
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
...materials
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


item.type
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
materials,
search,
languageFilter
]);









useEffect(()=>{


setFilteredMaterials(
filteredData
);



},[
filteredData
]);
/* =========================
      STATS
========================= */


const totalMaterials =
materials.length;



const totalLanguages =
new Set(
  materials.map(
    item => item.language_id
  )
).size;



const pdfMaterials =
materials.filter(
  item =>
  item.type === "PDF"
).length;



const videoMaterials =
materials.filter(
  item =>
  item.type === "Video"
).length;








/* =========================
      CLOSE HANDLERS
========================= */


const closeForm = ()=>{

setShowForm(false);

setEditingMaterial(null);

};



const closeDelete = ()=>{

setShowDelete(false);

setDeleteMaterial(null);

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

Learning Materials

</h1>


<p
className="
mt-2
text-slate-400
"
>

Manage language resources, files and study materials.

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

className="
animate-spin
"

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


setEditingMaterial(null);

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


Add Material


</button>





</div>



</div>









{/* =========================
      STATS
========================= */}



<MaterialStats

totalMaterials={
totalMaterials
}


totalLanguages={
totalLanguages
}


pdfMaterials={
pdfMaterials
}


videoMaterials={
videoMaterials
}


/>









{/* =========================
      FILTERS
========================= */}



<MaterialFilters

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


filteredMaterials.length === 0 ? (


<EmptyMaterials />


)


:


(


<MaterialsGrid

materials={
filteredMaterials
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



<MaterialForm

open={
showForm
}


material={
editingMaterial
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
handleSaveMaterial
}


/>









{/* =========================
      DELETE
========================= */}



<DeleteMaterialModal

open={
showDelete
}


material={
deleteMaterial
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