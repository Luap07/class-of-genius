// src/components/admin/languages/EmptyLanguages.jsx

import React from "react";

import {
  Languages,
  Plus,
} from "lucide-react";


export default function EmptyLanguages({

  onCreate,

}) {


return (

<div
className="
flex
min-h-[300px]
flex-col
items-center
justify-center
rounded-3xl
border
border-dashed
border-slate-700
bg-slate-900/50
p-10
text-center
"
>


<div
className="
mb-5
flex
h-16
w-16
items-center
justify-center
rounded-2xl
bg-cyan-500/10
text-cyan-400
"
>

<Languages size={32}/>

</div>




<h3
className="
text-xl
font-black
text-white
"
>

No Languages Found

</h3>




<p
className="
mt-2
max-w-md
text-sm
text-slate-400
"
>

There are no languages available yet.
Create your first language to start adding learning materials.

</p>





{
onCreate && (

<button

onClick={onCreate}

className="
mt-6
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

Add Language

</button>

)

}



</div>

);


}