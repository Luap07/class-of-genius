import React from "react";

import {
 FileText,
 ExternalLink
} from "lucide-react";


export default function SubjectDocuments({
 documents=[]
}){


return(

<section className="mt-14">


<h2 className="
text-2xl
font-black
text-white
mb-6
">

Study Materials

</h2>



<div className="
grid
md:grid-cols-2
xl:grid-cols-3
gap-6
">


{
documents.map((doc)=>(


<div
key={doc.id}
className="
overflow-hidden
rounded-3xl
border
border-slate-800
bg-slate-900
transition
hover:border-cyan-500/40
hover:-translate-y-1
"
>


<div className="mb-5 overflow-hidden rounded-2xl bg-slate-950 aspect-video">
  {doc.thumbnail_url ? (
    <img
      src={doc.thumbnail_url}
      alt={doc.title}
      className="h-full w-full object-cover transition duration-500 hover:scale-105"
    />
  ) : (
    <div className="flex h-full items-center justify-center">
      <FileText
        size={50}
        className="text-cyan-400"
      />
    </div>
  )}
</div>

<h3 className="
mt-5
font-bold
text-white
">

{doc.title}

</h3>


<p className="
mt-3
text-sm
text-slate-400
">

{
doc.description ||
"Learning material"
}

</p>


<a
href={doc.file_url}
target="_blank"
rel="noreferrer"

className="
mt-5
flex
items-center
gap-2
text-cyan-400
"
>

Open File

<ExternalLink size={16}/>

</a>


</div>


))
}


</div>


</section>

)

}