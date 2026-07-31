import React from "react";
import {
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";



export default function DeleteLanguageModal({

  isOpen,

  onClose,

  onConfirm,

  language,

  loading = false,

}) {



if(!isOpen) return null;




return (

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
w-full
max-w-md
rounded-3xl
border
border-slate-800
bg-slate-950
p-8
shadow-2xl
"

>





{/* HEADER */}

<div

className="
mb-6
flex
items-center
justify-between
"

>


<div

className="
flex
items-center
gap-3
"

>


<div

className="
flex
h-12
w-12
items-center
justify-center
rounded-2xl
bg-red-500/10
text-red-400
"

>

<AlertTriangle size={26}/>

</div>




<div>


<h2

className="
text-xl
font-black
text-white
"

>

Delete Language

</h2>


<p

className="
text-sm
text-slate-400
"

>

This action cannot be undone.

</p>


</div>


</div>







<button

onClick={onClose}

disabled={loading}

className="
text-slate-400
hover:text-white
"

>

<X size={20}/>

</button>



</div>









{/* CONTENT */}


<div

className="
mb-8
rounded-2xl
bg-slate-900
p-5
"

>


<p

className="
text-sm
text-slate-400
"

>

You are about to delete:

</p>



<h3

className="
mt-2
text-lg
font-black
text-white
"

>

{
language?.name || "this language"
}

</h3>



<p

className="
mt-2
text-sm
text-slate-500
"

>

All related language data may be affected.

</p>



</div>










{/* ACTIONS */}


<div

className="
flex
gap-4
"

>


<button


onClick={onClose}

disabled={loading}

className="
flex-1
rounded-2xl
border
border-slate-700
bg-slate-900
py-3
font-bold
text-slate-300
hover:bg-slate-800
"

>

Cancel

</button>







<button


onClick={onConfirm}

disabled={loading}

className="
flex-1
flex
items-center
justify-center
gap-2
rounded-2xl
bg-red-600
py-3
font-black
text-white
hover:bg-red-700
disabled:opacity-50
"

>


<Trash2 size={18}/>


{

loading

?

"Deleting..."

:

"Delete"

}



</button>




</div>





</div>


</div>


);


}