import React from "react";

import {
  Search,
  Filter,
  RotateCcw,
} from "lucide-react";



export default function LanguageFilters({

  search,

  setSearch,

  status,

  setStatus,

  level,

  setLevel,

  onReset,

}) {



return (

<div

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
mb-5
flex
items-center
gap-3
"

>

<div

className="
flex
h-10
w-10
items-center
justify-center
rounded-xl
bg-cyan-500/10
text-cyan-400
"

>

<Filter size={20}/>

</div>


<h2

className="
text-lg
font-black
text-white
"

>

Language Filters

</h2>


</div>








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
text-slate-400
"

>

Search

</label>



<div

className="
flex
items-center
rounded-2xl
border
border-slate-700
bg-slate-950
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
Search language...
"


className="
w-full
bg-transparent
px-4
py-3
outline-none
text-white
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
text-slate-400
"

>

Status

</label>



<select


value={status}


onChange={

e=>

setStatus(
e.target.value
)

}



className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-950
px-4
py-3
text-white
"

>


<option>
All
</option>


<option>
Active
</option>


<option>
Inactive
</option>


<option>
Draft
</option>


<option>
Published
</option>


</select>



</div>









{/* LEVEL */}

<div>


<label

className="
mb-2
block
text-sm
font-bold
text-slate-400
"

>

Level

</label>



<select


value={level}


onChange={

e=>

setLevel(
e.target.value
)

}



className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-950
px-4
py-3
text-white
"

>


<option>
All
</option>


<option>
Beginner
</option>


<option>
Intermediate
</option>


<option>
Advanced
</option>


</select>



</div>





</div>









<button


onClick={onReset}


className="
mt-5
flex
items-center
gap-2
rounded-xl
border
border-slate-700
bg-slate-950
px-5
py-3
font-bold
text-slate-300
hover:bg-slate-800
"

>


<RotateCcw size={16}/>


Reset Filters


</button>







</div>


);


}