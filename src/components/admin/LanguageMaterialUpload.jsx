// src/components/admin/LanguageMaterialUpload.jsx

import React, { useState, useEffect } from "react";

import {
  Upload,
  FileText,
  Video,
  X,
  Loader2,
} from "lucide-react";


export default function LanguageMaterialUpload({
  language,
  open,
  onClose,
  onSuccess,
}) {


  const [uploading,setUploading] = useState(false);


  const [form,setForm] = useState({

    title:"",
    description:"",
    type:"PDF",
    level:"Beginner",
    file:null,

  });





  useEffect(()=>{

    if(open){

      setForm({

        title:"",
        description:"",
        type:"PDF",
        level:"Beginner",
        file:null,

      });

    }

  },[open]);






  if(!open) return null;






  const handleChange=(e)=>{


    setForm({

      ...form,

      [e.target.name]:e.target.value,

    });


  };







  const handleFile=(e)=>{


    setForm({

      ...form,

      file:e.target.files[0],

    });


  };








  const handleSubmit=async()=>{


    if(!language){

      console.error(
        "No language selected"
      );

      return;

    }



    try{


      setUploading(true);



      console.log(
        "UPLOAD MATERIAL:",
        {

          language_id:language.id,

          ...form

        }
      );



      await new Promise(
        resolve=>setTimeout(resolve,1000)
      );



      onSuccess?.();


      onClose();



    }catch(error){


      console.error(
        "UPLOAD ERROR:",
        error
      );


    }finally{


      setUploading(false);


    }


  };







return (

<div
className="
fixed
inset-0
z-[100]
flex
items-center
justify-center
bg-black/70
backdrop-blur-sm
p-6
"
>


<div
className="
w-full
max-w-2xl
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
flex
items-center
justify-between
border-b
border-slate-800
pb-5
mb-6
"
>


<div>


<h2
className="
text-2xl
font-black
text-white
"
>

Upload Material

</h2>



<p
className="
text-sm
text-slate-400
mt-1
"
>

Adding content for

<span
className="
ml-1
text-cyan-400
font-bold
"
>

{language?.name}

</span>

</p>


</div>




<button
onClick={onClose}
className="
rounded-xl
p-2
text-slate-400
hover:bg-slate-900
hover:text-white
"
>

<X size={20}/>

</button>


</div>







<div className="space-y-5">



<input

name="title"

value={form.title}

onChange={handleChange}

placeholder="Material title"

className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
text-white
"

/>







<textarea

name="description"

value={form.description}

onChange={handleChange}

placeholder="Description"

rows="3"

className="
w-full
rounded-2xl
border
border-slate-700
bg-slate-900
px-4
py-3
text-white
"

/>








<div
className="
grid
grid-cols-2
gap-4
"
>


<select

name="type"

value={form.type}

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

<option value="PDF">
PDF Document
</option>


<option value="VIDEO">
Video Lesson
</option>


</select>







<select

name="level"

value={form.level}

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



</div>









<label
className="
flex
cursor-pointer
items-center
justify-center
gap-3
rounded-2xl
border
border-dashed
border-slate-700
bg-slate-900
p-6
text-slate-400
hover:border-cyan-500
"
>


{

form.type==="VIDEO"

?

<Video size={25}/>

:

<FileText size={25}/>

}



<span>

{

form.file

?

form.file.name

:

"Choose File"

}

</span>



<input

hidden

type="file"

accept={
form.type==="VIDEO"
?
"video/*"
:
".pdf"
}

onChange={handleFile}

/>


</label>








<button

disabled={uploading}

onClick={handleSubmit}

className="
flex
w-full
items-center
justify-center
gap-2
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

uploading

?

<>

<Loader2
className="animate-spin"
/>

Uploading...

</>

:

<>

<Upload size={18}/>

Upload Material

</>

}


</button>




</div>



</div>


</div>


);


}