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
  BookOpen,
  Languages,
  Layers,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react";


import {
  supabase,
} from "../../../lib/supabaseClient";




/*
================================================

DICTIONARY ADMIN

Manage:

- Words
- Definitions
- Pronunciation
- Language
- Category


Expected table:

dictionary

id
word
definition
pronunciation
language
category
status
created_at
updated_at


================================================
*/


const categories = [

"General",

"Education",

"Travel",

"Business",

"Conversation",

];


const statuses = [

"Published",

"Draft",

"Review",

];





export default function DictionaryAdmin(){



/*
==================================
STATES
==================================
*/


const [dictionary,setDictionary] =
useState([]);



const [loading,setLoading] =
useState(true);



const [refreshing,setRefreshing] =
useState(false);



const [search,setSearch] =
useState("");



const [filterCategory,setFilterCategory] =
useState("All");



const [filterStatus,setFilterStatus] =
useState("All");



const [showModal,setShowModal] =
useState(false);



const [editingWord,setEditingWord] =
useState(null);





const [form,setForm] =
useState({

word:"",

definition:"",

pronunciation:"",

language:"",

category:"General",

status:"Draft",

});







/*
==================================
FETCH DICTIONARY
==================================
*/


const fetchDictionary = async()=>{


try{


setLoading(true);



const {

data,

error

}=


await supabase

.from(
"dictionary"
)

.select("*")

.order(
"created_at",
{
ascending:false
}
);





if(error)
throw error;



setDictionary(
data || []
);



}

catch(error){


console.error(
"Dictionary Fetch Error:",
error
);



}

finally{


setLoading(false);


}


};






useEffect(()=>{


fetchDictionary();


},[]);







/*
==================================
REFRESH
==================================
*/


const handleRefresh = async()=>{


setRefreshing(true);



await fetchDictionary();



setRefreshing(false);


};







/*
==================================
STATS
==================================
*/


const stats =
useMemo(()=>{


return [


{


title:
"Total Words",


value:
dictionary.length,


icon:
BookOpen,


},



{


title:
"Languages",


value:

new Set(
dictionary.map(
item=>item.language
)
).size,


icon:
Languages,


},



{


title:
"Categories",


value:

new Set(
dictionary.map(
item=>item.category
)
).size,


icon:
Layers,


},



{


title:
"Published",


value:

dictionary.filter(
item=>
item.status==="Published"
).length,


icon:
CheckCircle,


},



];


},[
dictionary
]);








/*
==================================
FILTER
==================================
*/


const filteredDictionary =
useMemo(()=>{


return dictionary.filter(
item=>{


const searchMatch =


item.word

?.toLowerCase()

.includes(
search.toLowerCase()
)

||

item.definition

?.toLowerCase()

.includes(
search.toLowerCase()
);




const categoryMatch =

filterCategory==="All"

||

item.category===filterCategory;




const statusMatch =

filterStatus==="All"

||

item.status===filterStatus;




return (

searchMatch &&

categoryMatch &&

statusMatch

);



}

);



},[

dictionary,

search,

filterCategory,

filterStatus

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

word:"",

definition:"",

pronunciation:"",

language:"",

category:"General",

status:"Draft",

});



setEditingWord(null);


};





/*
UI PART 2
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





{/* ============================
HEADER
============================ */}



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

Dictionary Management

</h1>




<p

className="
mt-2
text-slate-400
"

>

Manage vocabulary definitions and dictionary entries.

</p>



</div>







<div

className="
flex
gap-3
"

>



<button


onClick={
handleRefresh
}



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
/}

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


Add Word


</button>



</div>



</div>









{/* ============================
STATS
============================ */}




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









{/* ============================
FILTERS
============================ */}



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
lg:grid-cols-3
"

>







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

Search Dictionary

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


value={
search
}



onChange={

e=>

setSearch(
e.target.value
)

}



placeholder="
Search word or definition...
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

e=>

setFilterCategory(
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
"

>


<option>

All

</option>




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



</div>







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

e=>

setFilterStatus(
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
"

>


<option>

All

</option>



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





</div>


</div>







{/* ============================
DICTIONARY TABLE
============================ */}



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

Word

</th>



<th

className="
px-6
py-5
text-sm
text-slate-400
"

>

Definition

</th>



<th

className="
px-6
py-5
text-sm
text-slate-400
"

>

Language

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

Loading dictionary...

</td>



</tr>



)

:



filteredDictionary.length===0 ? (



<tr>


<td

colSpan="5"

className="
py-20
text-center
text-slate-400
"

>

No dictionary entries found.

</td>



</tr>



)



:



filteredDictionary.map(
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
font-black
"

>

{item.word}

</p>



<p

className="
text-sm
text-slate-500
"

>

{item.pronunciation}

</p>


</td>







<td

className="
px-6
py-5
text-slate-300
"

>

{item.definition}

</td>







<td

className="
px-6
py-5
text-slate-300
"

>

{item.language}

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


setEditingWord(item);


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


onClick={async()=>{


const confirmDelete =
window.confirm(
"Delete this dictionary entry?"
);



if(!confirmDelete)
return;





const {

error

}=


await supabase

.from(
"dictionary"
)

.delete()

.eq(
"id",
item.id
);





if(!error)

fetchDictionary();



}}



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










{/* ============================
ADD / EDIT MODAL
============================ */}



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
items-center
justify-between
"

>


<h2

className="
text-2xl
font-black
"

>


{

editingWord

?

"Edit Dictionary Word"

:

"Add Dictionary Word"


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


name="word"


value={
form.word
}



onChange={
handleChange
}



placeholder="
Word
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


name="language"


value={
form.language
}



onChange={
handleChange
}



placeholder="
Language
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







<div

className="
mt-5
"

>


<textarea


name="definition"


value={
form.definition
}



onChange={
handleChange
}



placeholder="
Definition
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







<input


name="pronunciation"


value={
form.pronunciation
}



onChange={
handleChange
}



placeholder="
Pronunciation
"



className="
mt-5
w-full
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
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


onClick={async()=>{


try{


const payload={


...form,


updated_at:

new Date()

.toISOString(),


};






if(editingWord){



const {

error

}=


await supabase

.from(
"dictionary"
)

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

}=


await supabase

.from(
"dictionary"
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



fetchDictionary();



}



catch(error){



console.error(
"Dictionary Save Error:",
error
);



}



}}



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

editingWord

?

"Update Word"

:

"Create Word"

}


</button>







</div>


</div>


)


}




</section>

);


}