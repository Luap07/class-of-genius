import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";
import LanguageOverviewForm from "../../../components/admin/languages/LanguageOverviewForm";


export default function LanguageOverview({
  language,
  refresh,
}) {

  const [overviews, setOverviews] = useState([]);
  const [loading,setLoading] = useState(true);

  const [showForm,setShowForm] = useState(false);
  const [editingOverview,setEditingOverview] = useState(null);



  const fetchOverviews = useCallback(async()=>{

    if(!language?.id) return;

    try{

      setLoading(true);

      const {data,error}= await supabase
      .from("language_overviews")
      .select("*")
      .eq(
        "language_id",
        language.id
      )
      .order(
        "created_at",
        {
          ascending:false
        }
      );


      if(error) throw error;


      setOverviews(data || []);


    }catch(err){

      console.error(
        "Fetch overview error:",
        err
      );

    }finally{

      setLoading(false);

    }


  },[language]);



  useEffect(()=>{

    fetchOverviews();

  },[fetchOverviews]);




  const reload=async()=>{

    await fetchOverviews();

    if(refresh)
      await refresh();

  };




  const deleteOverview = async(id)=>{

    const confirmDelete =
    window.confirm(
      "Delete this overview?"
    );

    if(!confirmDelete)
      return;


    const {error}= await supabase
    .from("language_overviews")
    .delete()
    .eq(
      "id",
      id
    );


    if(error){

      console.error(error);
      return;

    }


    reload();

  };





  if(loading){

    return(
      <div className="flex min-h-[300px] items-center justify-center">

        <Loader2 className="animate-spin text-cyan-400"/>

      </div>
    );

  }





return(

<div className="space-y-8">


<div className="
flex
items-center
justify-between
rounded-3xl
border
border-cyan-500/20
bg-cyan-500/5
p-8
">

<div>

<div className="flex gap-3 items-center">

<BookOpen className="text-cyan-400"/>

<h2 className="
text-3xl
font-black
text-white
">

{language?.name}

</h2>

</div>


<p className="text-slate-400 mt-2">
Language overview management
</p>


</div>



<button
onClick={()=>{

setEditingOverview(null);
setShowForm(true);

}}
className="
flex
gap-2
items-center
rounded-xl
bg-cyan-500
px-5
py-3
font-black
text-black
"
>

<Plus size={18}/>

Create Overview

</button>


</div>






{
overviews.length === 0 && (

<div className="
rounded-3xl
border
border-white/10
bg-white/5
p-10
text-center
">

<h3 className="
text-2xl
font-black
text-white
">

No Overview Created

</h3>

</div>

)
}






<div className="
grid
gap-6
md:grid-cols-2
">


{
overviews.map((item)=>(


<div
key={item.id}
className="
overflow-hidden
rounded-3xl
border
border-white/10
bg-slate-900
"
>


{
item.cover_image && (

<img
src={item.cover_image}
className="
h-48
w-full
object-cover
"
/>

)

}




<div className="p-6">


<h3 className="
text-2xl
font-black
text-white
">

{item.title}

</h3>


<p className="
mt-3
text-slate-400
line-clamp-3
">

{item.description}

</p>



<div className="
mt-5
flex
gap-3
">


<button

onClick={()=>{

setEditingOverview(item);
setShowForm(true);

}}

className="
flex
items-center
gap-2
rounded-xl
bg-indigo-500/20
px-4
py-2
font-bold
text-indigo-300
"

>

<Pencil size={16}/>

Edit

</button>




<button

onClick={()=>deleteOverview(item.id)}

className="
flex
items-center
gap-2
rounded-xl
bg-red-500/20
px-4
py-2
font-bold
text-red-300
"

>

<Trash2 size={16}/>

Delete

</button>



</div>



</div>


</div>


))

}


</div>





{
showForm && (

<LanguageOverviewForm

language={language}

overview={editingOverview}

onClose={()=>{

setShowForm(false);
setEditingOverview(null);

}}

refresh={reload}

/>

)

}



</div>

);


}