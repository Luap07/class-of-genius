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

VOCABULARY ADMIN

Manage:

- Vocabulary words
- Meanings
- Examples
- Difficulty
- Categories


Expected table:

vocabulary

id
word
meaning
language
category
level
example
status
created_at
updated_at


================================================
*/



const levels = [

"Beginner",

"Intermediate",

"Advanced",

];



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





export default function VocabularyAdmin(){



/*
====================================
STATES
====================================
*/


const [words,setWords] =
useState([]);



const [loading,setLoading] =
useState(true);



const [refreshing,setRefreshing] =
useState(false);



const [search,setSearch] =
useState("");



const [filterLevel,setFilterLevel] =
useState("All");



const [filterCategory,setFilterCategory] =
useState("All");



const [showModal,setShowModal] =
useState(false);



const [editingWord,setEditingWord] =
useState(null);





const [form,setForm] =
useState({

word:"",

meaning:"",

language:"",

category:"General",

level:"Beginner",

example:"",

status:"Draft",

});







/*
====================================
FETCH VOCABULARY
====================================
*/


const fetchWords = async()=>{


try{


setLoading(true);



const {

data,

error

}=

await supabase

.from(
"vocabulary"
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



setWords(
data || []
);



}

catch(error){


console.error(
"Vocabulary Fetch Error:",
error
);



}

finally{


setLoading(false);


}



};






useEffect(()=>{


fetchWords();


},[]);






/*
====================================
REFRESH
====================================
*/


const handleRefresh = async()=>{


setRefreshing(true);


await fetchWords();


setRefreshing(false);


};






/*
====================================
STATS
====================================
*/


const stats =
useMemo(()=>{


return [


{

title:
"Total Words",

value:
words.length,

icon:
BookOpen,

},



{

title:
"Languages",

value:

new Set(
words.map(
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
words.map(
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

words.filter(
item=>
item.status==="Published"
).length,

icon:
CheckCircle,

},


];


},[
words
]);







/*
====================================
FILTER
====================================
*/


const filteredWords =
useMemo(()=>{


return words.filter(
item=>{


const matchSearch =

item.word

?.toLowerCase()

.includes(
search.toLowerCase()
)

||

item.meaning

?.toLowerCase()

.includes(
search.toLowerCase()
);





const matchLevel =

filterLevel==="All"

||

item.level===filterLevel;





const matchCategory =

filterCategory==="All"

||

item.category===filterCategory;





return (

matchSearch &&

matchLevel &&

matchCategory

);



}

);



},[

words,

search,

filterLevel,

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

word:"",

meaning:"",

language:"",

category:"General",

level:"Beginner",

example:"",

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



{/* ================================
HEADER
================================ */}


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

Vocabulary Management

</h1>



<p

className="
mt-2
text-slate-400
"

>

Manage words, meanings and vocabulary lessons.

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









{/* ================================
STATS
================================ */}


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










{/* ================================
FILTERS
================================ */}


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

Search Word

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
e=>
setSearch(
e.target.value
)
}




placeholder="
Search vocabulary...
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

Level

</label>



<select


value={filterLevel}



onChange={
e=>
setFilterLevel(
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

levels.map(
level=>(


<option

key={level}

>

{level}

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

Category

</label>



<select


value={filterCategory}



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





{/* ================================
VOCABULARY TABLE
================================ */}


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

Meaning

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

Level

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

Loading vocabulary...

</td>


</tr>


)

:

filteredWords.length===0 ? (


<tr>

<td

colSpan="5"

className="
py-20
text-center
text-slate-400
"

>

No vocabulary found.

</td>


</tr>


)

:


filteredWords.map(
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

{item.meaning}

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

className="
rounded-full
bg-cyan-500/10
px-4
py-2
text-cyan-400
"

>

{item.level}

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
"Delete this vocabulary item?"
);


if(!confirmDelete)
return;



const {

error

}=


await supabase

.from(
"vocabulary"
)

.delete()

.eq(
"id",
item.id
);



if(!error)
fetchWords();



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









{/* ================================
ADD / EDIT MODAL
================================ */}


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


<h2

className="
mb-6
text-2xl
font-black
"

>


{

editingWord

?

"Edit Vocabulary"

:

"Add Vocabulary"

}


</h2>




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





 id="r8x4pq"
<div

className="
mt-5
"

>


<textarea

name="meaning"

value={
form.meaning
}

onChange={
handleChange
}

placeholder="
Meaning
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

name="example"

value={
form.example
}

onChange={
handleChange
}

placeholder="
Example sentence
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
md:grid-cols-3
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

name="level"

value={
form.level
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

levels.map(
level=>(


<option

key={
level
}

>

{level}

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
"vocabulary"
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
"vocabulary"
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


fetchWords();



}

catch(error){



console.error(
"Vocabulary Save Error:",
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