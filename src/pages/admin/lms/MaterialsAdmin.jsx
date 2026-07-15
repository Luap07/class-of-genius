// src/pages/admin/lms/MaterialsAdmin.jsx

import React, { useEffect, useState } from "react";
import {
  Plus,
  FileText,
  Video,
  Download,
  Trash2,
  Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";


const MaterialsAdmin = () => {

  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");



  const fetchMaterials = async () => {

    setLoading(true);


    const { data, error } = await supabase
      .from("learning_materials")
      .select("*")
      .order("created_at", {
        ascending:false,
      });



    if(error){

      console.error(
        "FETCH MATERIALS ERROR:",
        error
      );

      setLoading(false);
      return;

    }



    setMaterials(data || []);

    setLoading(false);

  };





  useEffect(()=>{

    fetchMaterials();

  },[]);







  const deleteMaterial = async(id)=>{


    const confirmDelete = window.confirm(
      "Delete this material?"
    );


    if(!confirmDelete)
      return;



    const {error} = await supabase
      .from("learning_materials")
      .delete()
      .eq("id",id);



    if(error){

      alert(error.message);
      return;

    }


    fetchMaterials();


  };








  const filteredMaterials = materials.filter((item)=>

    item.title
    ?.toLowerCase()
    .includes(search.toLowerCase())

  );









  const icon = (type)=>{


    if(type==="video")
    {
      return (
        <Video
          size={35}
          className="text-purple-400"
        />
      );
    }


    return (

      <FileText
        size={35}
        className="text-blue-400"
      />

    );


  };







return (

<div className="space-y-8 p-6">



{/* HEADER */}

<div className="
flex
flex-col
gap-5
lg:flex-row
lg:items-center
lg:justify-between
">


<div>

<h1 className="
text-3xl
font-bold
text-white
">

Learning Materials

</h1>


<p className="
mt-2
text-slate-400
">

Upload and manage general school materials.

</p>


</div>





<AdminButton

onClick={()=>navigate(
"/admin/lms/materials/create"
)}

>

<Plus
size={18}
className="mr-2"
/>

Add Material

</AdminButton>



</div>








{/* SEARCH */}


<div className="
rounded-3xl
border
border-slate-800
bg-slate-900
p-6
">


<div className="relative">


<Search

size={20}

className="
absolute
left-4
top-1/2
-translate-y-1/2
text-slate-500
"

/>



<input

value={search}

onChange={(e)=>setSearch(e.target.value)}

placeholder="Search materials..."

className="
w-full
rounded-xl
border
border-slate-700
bg-slate-950
py-3
pl-12
pr-4
text-white
outline-none
focus:border-blue-500
"

/>



</div>


</div>









{/* CONTENT */}



{
loading ?


(

<div className="
py-20
text-center
text-slate-400
">

Loading materials...

</div>

)


:

filteredMaterials.length===0 ?


(

<div className="
rounded-3xl
border
border-slate-800
bg-slate-900
p-12
text-center
">


<FileText

size={55}

className="
mx-auto
text-slate-600
"

/>


<h2 className="
mt-5
text-xl
font-bold
text-white
">

No Materials Found

</h2>


<p className="
mt-2
text-slate-400
">

Upload PDFs, documents and videos.

</p>


</div>

)



:


(


<div className="
grid
gap-6
md:grid-cols-2
xl:grid-cols-3
">


{

filteredMaterials.map((material)=>(


<div

key={material.id}

className="
rounded-3xl
border
border-slate-800
bg-slate-900
p-6
hover:border-blue-500/40
transition
"

>



<div className="
flex
items-center
gap-4
">


<div className="
flex
h-14
w-14
items-center
justify-center
rounded-2xl
bg-slate-800
">


{

icon(material.material_type)

}


</div>



<div>

<h3 className="
font-bold
text-white
">

{material.title}

</h3>


<p className="
text-sm
text-slate-400
">

{material.level || "General"}

</p>


</div>



</div>






<p className="
mt-4
line-clamp-2
text-sm
text-slate-400
">

{material.description || "No description"}

</p>







<div className="
mt-6
flex
gap-3
">


{

material.file_url &&

<a

href={material.file_url}

target="_blank"

rel="noreferrer"

className="
rounded-xl
bg-blue-500/10
p-3
text-blue-400
"

>

<Download size={18}/>

</a>

}




<button

onClick={()=>deleteMaterial(material.id)}

className="
rounded-xl
bg-red-500/10
p-3
text-red-400
"

>

<Trash2 size={18}/>

</button>



</div>





</div>


))

}


</div>


)

}



</div>


);


};


export default MaterialsAdmin;