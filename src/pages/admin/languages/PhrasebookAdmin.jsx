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
  MessageCircle,
  Languages,
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

PHRASEBOOK ADMIN

Manage:
- Common phrases
- Translations
- Categories
- Usage examples
- Difficulty levels

Expected table:

language_phrasebook

id
phrase
translation
language_name
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

  "Greetings",

  "Travel",

  "Business",

  "Conversation",

  "Emergency",

  "Daily Life",

];



const statusOptions = [

  "Published",

  "Draft",

];




export default function PhrasebookAdmin(){



  /*
  ==========================================
  STATES
  ==========================================
  */


  const [phrases,setPhrases] =
    useState([]);



  const [loading,setLoading] =
    useState(true);



  const [refreshing,setRefreshing] =
    useState(false);



  const [search,setSearch] =
    useState("");



  const [filterLevel,setFilterLevel] =
    useState("All");



  const [filterStatus,setFilterStatus] =
    useState("All");



  const [showModal,setShowModal] =
    useState(false);



  const [editingPhrase,setEditingPhrase] =
    useState(null);




  const [form,setForm] =
    useState({

      phrase:"",

      translation:"",

      language_name:"",

      category:"Greetings",

      level:"Beginner",

      example:"",

      status:"Draft",

    });






  /*
  ==========================================
  FETCH PHRASES
  ==========================================
  */


  const fetchPhrases = async()=>{


    try{


      setLoading(true);



      const {
        data,
        error
      } =
      await supabase
      .from(
        "language_phrasebook"
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



      setPhrases(
        data || []
      );


    }
    catch(error){


      console.error(
        "Phrasebook Fetch Error:",
        error
      );


    }
    finally{


      setLoading(false);


    }


  };




  useEffect(()=>{


    fetchPhrases();


  },[]);





  /*
  ==========================================
  REFRESH
  ==========================================
  */


  const handleRefresh = async()=>{


    setRefreshing(true);


    await fetchPhrases();


    setRefreshing(false);


  };






  /*
  ==========================================
  STATS
  ==========================================
  */


  const stats = useMemo(()=>{


    return [


      {

        title:"Total Phrases",

        value:phrases.length,

        icon:MessageCircle,

      },


      {

        title:"Languages",

        value:
        new Set(
          phrases.map(
            item =>
            item.language_name
          )
        ).size,

        icon:Languages,

      },


      {

        title:"Published",

        value:
        phrases.filter(
          item =>
          item.status==="Published"
        ).length,

        icon:CheckCircle,

      },


      {

        title:"Draft",

        value:
        phrases.filter(
          item =>
          item.status==="Draft"
        ).length,

        icon:Clock,

      },


    ];


  },[
    phrases
  ]);





  /*
  ==========================================
  FILTER
  ==========================================
  */


  const filteredPhrases =
  useMemo(()=>{


    return phrases.filter(
      item=>{


        const matchesSearch =

        item.phrase
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

        ||

        item.translation
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );



        const matchesLevel =

        filterLevel==="All"

        ||

        item.level===filterLevel;




        const matchesStatus =

        filterStatus==="All"

        ||

        item.status===filterStatus;



        return (

          matchesSearch &&

          matchesLevel &&

          matchesStatus

        );


      }
    );


  },[
    phrases,
    search,
    filterLevel,
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

      phrase:"",

      translation:"",

      language_name:"",

      category:"Greetings",

      level:"Beginner",

      example:"",

      status:"Draft",

    });


    setEditingPhrase(null);


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
  Phrasebook Management
</h1>


<p
  className="
  mt-2
  text-slate-400
  "
>
  Manage useful phrases, translations,
  examples and language conversations.
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
transition
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
shadow-lg
shadow-cyan-500/20
"

>


<Plus
size={18}
/>


Add Phrase


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

key={item.title}

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
backdrop-blur-xl
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
    SEARCH + FILTERS
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

Search Phrase


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
Search phrase or translation...
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
e=>setFilterLevel(
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

Status


</label>



<select

value={filterStatus}

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
statusOptions.map(
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



</div>



</div>





{/* ======================================
    PHRASE TABLE
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
Phrase
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

Loading phrases...

</td>

</tr>


)

:

filteredPhrases.length===0 ? (


<tr>

<td

colSpan="5"

className="
py-20
text-center
text-slate-400
"

>

No phrases found.

</td>

</tr>


)

:

filteredPhrases.map(
(item)=>(


<tr

key={item.id}

className="
border-b
border-slate-800
transition
hover:bg-slate-800/50
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

{item.phrase}

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

{item.translation}

</td>




<td
className="
px-6
py-5
text-slate-300
"
>

{item.language_name}

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
text-sm
text-cyan-300
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


setEditingPhrase(item);

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
editingPhrase
?
"Edit Phrase"
:
"Add Phrase"
}


</h2>



<button

onClick={()=>{

setShowModal(false);

resetForm();

}}

className="
text-slate-400
hover:text-white
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

name="phrase"

value={form.phrase}

onChange={handleChange}

placeholder="Phrase"

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

name="translation"

value={form.translation}

onChange={handleChange}

placeholder="Translation"

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
grid
gap-5
md:grid-cols-2
"
>


<input

name="language_name"

value={
form.language_name
}

onChange={
handleChange
}

placeholder="Language"

className="
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
"

/>




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
key={category}
>

{category}

</option>

)

)

}


</select>


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
key={level}
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
statusOptions.map(
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





<textarea

name="example"

value={
form.example
}

onChange={
handleChange
}

placeholder="
Example usage
"

rows="5"

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



if(editingPhrase){



const {
error
}=

await supabase

.from(
"language_phrasebook"
)

.update(payload)

.eq(
"id",
editingPhrase.id
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
"language_phrasebook"
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


fetchPhrases();



}

catch(error){


console.error(

"Phrase Save Error:",

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
editingPhrase
?
"Update Phrase"
:
"Create Phrase"
}


</button>





</div>


</div>





)

}




</section>

  );


}