import React, {
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  motion,
} from "framer-motion";


import {
  Plus,
  Search,
  RefreshCw,
  Languages,
  FileText,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";


import {
  supabase,
} from "../../../lib/supabaseClient";




/*
================================================

TRANSLATOR ADMIN

Manage:
- Translation content
- Source language
- Target language
- Translation status

Expected table:

translations

id
source_language
target_language
original_text
translated_text
category
status
created_at
updated_at


================================================
*/



const statuses = [

  "Published",

  "Draft",

  "Review",

];




const categories = [

  "General",

  "Education",

  "Travel",

  "Business",

  "Conversation",

];





export default function TranslatorAdmin(){



/*
========================================
STATES
========================================
*/


const [translations,setTranslations] =
useState([]);



const [loading,setLoading] =
useState(true);



const [refreshing,setRefreshing] =
useState(false);



const [search,setSearch] =
useState("");



const [filterStatus,setFilterStatus] =
useState("All");



const [filterCategory,setFilterCategory] =
useState("All");



const [showModal,setShowModal] =
useState(false);



const [editingTranslation,setEditingTranslation] =
useState(null);




const [form,setForm] =
useState({

source_language:"",

target_language:"",

original_text:"",

translated_text:"",

category:"General",

status:"Draft",

});







/*
========================================
FETCH TRANSLATIONS
========================================
*/


const fetchTranslations = async()=>{


try{


setLoading(true);



const {

data,

error

}=

await supabase

.from(
"translations"
)

.select("*")

.order(
"created_at",
{
ascending:false,
}
);



if(error)
throw error;



setTranslations(
data || []
);



}

catch(error){


console.error(
"Translation Fetch Error:",
error
);



}

finally{


setLoading(false);


}


};





useEffect(()=>{


fetchTranslations();


},[]);








/*
========================================
REFRESH
========================================
*/


const handleRefresh = async()=>{


setRefreshing(true);



await fetchTranslations();



setRefreshing(false);



};







/*
========================================
STATS
========================================
*/


const stats =
useMemo(()=>{


return [


{


title:
"Total Translations",


value:
translations.length,


icon:
Languages,


},



{


title:
"Languages",


value:

new Set(

translations.flatMap(
item=>[
item.source_language,
item.target_language
]
)

).size,


icon:
FileText,


},



{


title:
"Published",


value:

translations.filter(
item=>
item.status==="Published"
).length,


icon:
CheckCircle,


},



{


title:
"Review",


value:

translations.filter(
item=>
item.status==="Review"
).length,


icon:
Clock,


},



];


},[
translations
]);






/*
========================================
FILTER
========================================
*/


const filteredTranslations =
useMemo(()=>{


return translations.filter(
item=>{


const matchesSearch =


item.original_text

?.toLowerCase()

.includes(
search.toLowerCase()
)

||

item.translated_text

?.toLowerCase()

.includes(
search.toLowerCase()
);



const matchesStatus =

filterStatus==="All"

||

item.status===filterStatus;




const matchesCategory =

filterCategory==="All"

||

item.category===filterCategory;



return (

matchesSearch &&

matchesStatus &&

matchesCategory

);



}

);



},[

translations,

search,

filterStatus,

filterCategory

]);





const handleChange=(e)=>{


setForm({

...form,

[e.target.name]:
e.target.value,

});


};






const resetForm=()=>{


setForm({

source_language:"",

target_language:"",

original_text:"",

translated_text:"",

category:"General",

status:"Draft",

});



setEditingTranslation(null);



};





/*
UI CONTINUES PART 2
*/


return (
<section

className="
min-h-screen
bg-slate-950
p-6
text-white
"

>


{/* ======================================
    HEADER
====================================== */}


<div
className="
mb-10
flex
flex-col
justify-between
gap-6
lg:flex-row
lg:items-center
"
>


<div>


<h1
className="
text-4xl
font-black
"
>

Translator Management

</h1>


<p
className="
mt-2
text-slate-400
"
>

Manage translations between different languages.

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
font-bold
hover:border-cyan-500
"

>


<RefreshCw

size={18}

className={
refreshing
?
"animate-spin"
:
""
}

/>


Refresh


</button>





<button

onClick={()=>{

resetForm();

setShowModal(true);

}}

className="
flex
items-center
gap-2
rounded-2xl
bg-gradient-to-r
from-cyan-500
to-blue-600
px-5
py-3
font-bold
"

>


<Plus
size={18}
/>


Add Translation


</button>



</div>


</div>








{/* ======================================
    STATS
====================================== */}


<div

className="
mb-10
grid
gap-6
md:grid-cols-2
xl:grid-cols-4
"

>


{

stats.map(
(item,index)=>{


const Icon =
item.icon;



return (

<motion.div


key={
item.title
}


initial={{
opacity:0,
y:20
}}


animate={{
opacity:1,
y:0
}}


transition={{
delay:index*0.1
}}


className="
rounded-3xl
border
border-slate-800
bg-slate-900/80
p-6
"


>


<div

className="
flex
h-14
w-14
items-center
justify-center
rounded-2xl
bg-cyan-500/10
text-cyan-400
"

>


<Icon

size={28}

/>


</div>



<h2

className="
mt-5
text-3xl
font-black
"

>

{item.value}

</h2>



<p

className="
mt-2
text-slate-400
"

>

{item.title}

</p>


</motion.div>


);


}

)


}



</div>







{/* ======================================
    SEARCH FILTERS
====================================== */}



<div

className="
mb-8
rounded-3xl
border
border-slate-800
bg-slate-900/80
p-6
"

>



<div

className="
grid
gap-5
lg:grid-cols-4
"

>



{/* SEARCH */}


<div

className="
lg:col-span-2
"

>


<label

className="
mb-2
block
text-sm
font-bold
text-slate-300
"

>

Search Translation

</label>




<div

className="
flex
items-center
rounded-2xl
border
border-slate-700
bg-slate-800
px-4
"

>


<Search

size={18}

className="
text-slate-400
"

/>




<input


value={search}


onChange={
e=>setSearch(
e.target.value
)
}



placeholder="
Search text or translation...
"



className="
w-full
bg-transparent
px-4
py-4
outline-none
"

/>


</div>


</div>






{/* STATUS */}


<div>


<label

className="
mb-2
block
text-sm
font-bold
text-slate-300
"

>

Status

</label>



<select

value={
filterStatus
}


onChange={
e=>setFilterStatus(
e.target.value
)
}



className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-800
px-4
py-4
outline-none
"

>


<option>
All
</option>



{
statuses.map(
status=>(

<option

key={status}

>

{status}

</option>


)

)

}



</select>


</div>






{/* CATEGORY */}


<div>


<label

className="
mb-2
block
text-sm
font-bold
text-slate-300
"

>

Category

</label>




<select

value={
filterCategory
}



onChange={
e=>setFilterCategory(
e.target.value
)
}



className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-800
px-4
py-4
outline-none
"

>


<option>
All
</option>



{
categories.map(
category=>(

<option

key={category}

>

{category}

</option>

)

)

}



</select>



</div>



</div>



</div>





{/* ======================================
    TRANSLATION TABLE
====================================== */}


<div

className="
overflow-hidden
rounded-3xl
border
border-slate-800
bg-slate-900/80
"

>


<div
className="
overflow-x-auto
"
>


<table

className="
w-full
text-left
"

>


<thead

className="
border-b
border-slate-800
bg-slate-900
"

>


<tr>


<th
className="
px-6
py-5
text-sm
text-slate-400
"
>

Original

</th>



<th
className="
px-6
py-5
text-sm
text-slate-400
"
>

Translation

</th>




<th
className="
px-6
py-5
text-sm
text-slate-400
"
>

Languages

</th>




<th
className="
px-6
py-5
text-sm
text-slate-400
"
>

Status

</th>




<th
className="
px-6
py-5
text-sm
text-slate-400
"
>

Actions

</th>



</tr>


</thead>





<tbody>


{

loading ? (


<tr>

<td

colSpan="5"

className="
py-20
text-center
text-slate-400
"

>

Loading translations...

</td>


</tr>


)

:

filteredTranslations.length===0 ? (


<tr>

<td

colSpan="5"

className="
py-20
text-center
text-slate-400
"

>

No translations found.

</td>


</tr>


)

:

filteredTranslations.map(
(item)=>(


<tr

key={
item.id
}


className="
border-b
border-slate-800
hover:bg-slate-800/50
transition
"

>



<td

className="
px-6
py-5
"

>


<p

className="
font-bold
text-white
"

>

{item.original_text}

</p>


<p

className="
mt-1
text-sm
text-slate-500
"

>

{item.category}

</p>


</td>







<td

className="
px-6
py-5
text-slate-300
"

>

{item.translated_text}

</td>






<td

className="
px-6
py-5
text-slate-300
"

>


{item.source_language}

<span
className="
mx-2
text-cyan-400
"
>
→
</span>

{item.target_language}


</td>







<td

className="
px-6
py-5
"

>


<span

className={`

rounded-full

px-4

py-2

text-sm

${
item.status==="Published"

?

"bg-green-500/10 text-green-400"

:

item.status==="Review"

?

"bg-yellow-500/10 text-yellow-400"

:

"bg-slate-700 text-slate-300"

}

`}

>

{item.status}

</span>


</td>







<td

className="
px-6
py-5
"

>


<div

className="
flex
gap-3
"

>


<button


onClick={()=>{


setEditingTranslation(item);


setForm(item);


setShowModal(true);



}}


className="
rounded-xl
bg-blue-500/10
p-3
text-blue-400
"

>


<Edit

size={18}

/>


</button>





<button


className="
rounded-xl
bg-red-500/10
p-3
text-red-400
"

>


<Trash2

size={18}

/>


</button>



</div>



</td>



</tr>


)

)


}



</tbody>



</table>


</div>


</div>







{/* ======================================
    ADD / EDIT MODAL
====================================== */}



{

showModal && (


<div

className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/70
p-6
"

>


<div

className="
max-h-[90vh]
w-full
max-w-3xl
overflow-y-auto
rounded-3xl
border
border-slate-800
bg-slate-950
p-8
"

>



<div

className="
mb-6
flex
justify-between
items-center
"

>


<h2

className="
text-2xl
font-black
"

>

{

editingTranslation

?

"Edit Translation"

:

"Add Translation"

}


</h2>





<button


onClick={()=>{


setShowModal(false);


resetForm();


}}


className="
text-slate-400
"

>

✕

</button>



</div>





<div

className="
grid
gap-5
md:grid-cols-2
"

>


<input

name="source_language"

value={
form.source_language
}

onChange={
handleChange
}

placeholder="
Source Language
"

className="
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
"

/>




<input

name="target_language"

value={
form.target_language
}

onChange={
handleChange
}

placeholder="
Target Language
"

className="
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
"

/>


</div>




id="a9x4qp"
<div

className="
mt-5
"

>


<textarea

name="original_text"

value={
form.original_text
}

onChange={
handleChange
}

placeholder="
Original Text
"

rows="4"

className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
outline-none
"

/>





<textarea

name="translated_text"

value={
form.translated_text
}

onChange={
handleChange
}

placeholder="
Translated Text
"

rows="4"

className="
mt-5
w-full
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
outline-none
"

/>



</div>







<div

className="
mt-5
grid
gap-5
md:grid-cols-2
"

>



<select

name="category"

value={
form.category
}

onChange={
handleChange
}

className="
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
"

>


{

categories.map(
category=>(


<option

key={
category
}

>

{category}

</option>


)

)

}



</select>







<select

name="status"

value={
form.status
}

onChange={
handleChange
}

className="
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
"

>


{

statuses.map(
status=>(


<option

key={
status
}

>

{status}

</option>


)

)

}


</select>



</div>









<button


onClick={

async()=>{


try{


const payload={

...form,

updated_at:
new Date()
.toISOString(),

};





if(editingTranslation){



const {

error

}=


await supabase

.from(
"translations"
)

.update(payload)

.eq(
"id",
editingTranslation.id
);




if(error)
throw error;



}

else{



const {

error

}=


await supabase

.from(
"translations"
)

.insert({

...payload,

created_at:
new Date()
.toISOString(),

});




if(error)
throw error;



}




setShowModal(false);



resetForm();



fetchTranslations();




}

catch(error){



console.error(
"Translation Save Error:",
error
);



}



}

}



className="
mt-8
w-full
rounded-2xl
bg-gradient-to-r
from-cyan-500
to-blue-600
py-4
font-black
text-white
"

>



{

editingTranslation

?

"Update Translation"

:

"Create Translation"

}



</button>





</div>


</div>


)

}

</section>

);


}