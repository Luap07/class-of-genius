import React from "react";

import {
  Save,
  X,
} from "lucide-react";



export default function LanguageForm({

  form = {
    name: "",
    code: "",
    description: "",
    level: "Beginner",
    status: "Draft",
    speakers: "",
    lessons_count: 0,
  },

  setForm,

  onSubmit,

  onCancel,

  loading = false,

  editMode = false,

}) {

const handleChange = (e)=>{


setForm({

...form,

[e.target.name]: e.target.value,

});


};





return (

<form

onSubmit={onSubmit}

className="
space-y-6
"

>






<div

className="
grid
gap-5
md:grid-cols-2
"

>





{/* NAME */}

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

Language Name

</label>


<input


name="name"


value={
form.name || ""
}



onChange={handleChange}



placeholder="
English
"



className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
text-white
outline-none
"




/>


</div>








{/* CODE */}

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

Language Code

</label>


<input


name="code"


value={
form.code || ""
}



onChange={handleChange}



placeholder="
EN
"



className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
text-white
outline-none
"

/>



</div>




</div>









{/* DESCRIPTION */}

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

Description

</label>



<textarea


name="description"


value={
form.description || ""
}



onChange={handleChange}



rows="4"


placeholder="
Describe the language...
"



className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
text-white
outline-none
"

/>


</div>









<div

className="
grid
gap-5
md:grid-cols-3
"

>







{/* LEVEL */}

<select


name="level"


value={
form.level || "Beginner"
}



onChange={handleChange}



className="
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
text-white
"

>


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








{/* STATUS */}

<select


name="status"


value={
form.status || "Draft"
}



onChange={handleChange}



className="
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
text-white
"

>


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









{/* SPEAKERS */}

<input


name="speakers"


value={
form.speakers || ""
}



onChange={handleChange}



placeholder="
Speakers
"



className="
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
text-white
outline-none
"

/>




</div>









<input


name="lessons_count"


type="number"


value={
form.lessons_count || 0
}



onChange={handleChange}



placeholder="
Number of lessons
"



className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
text-white
outline-none
"

/>









{/* BUTTONS */}


<div

className="
flex
gap-4
pt-4
"

>



<button


type="button"


onClick={onCancel}



disabled={loading}



className="
flex-1
flex
items-center
justify-center
gap-2
rounded-2xl
border
border-slate-700
bg-slate-900
py-3
font-bold
text-slate-300
"

>


<X size={18}/>


Cancel


</button>







<button


type="submit"



disabled={loading}



className="
flex-1
flex
items-center
justify-center
gap-2
rounded-2xl
bg-gradient-to-r
from-cyan-500
to-blue-600
py-3
font-black
text-white
disabled:opacity-50
"

>


<Save size={18}/>


{

loading

?

"Saving..."

:

editMode

?

"Update Language"

:

"Create Language"

}

</button>

</div>

</form>


);


}