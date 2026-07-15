// src/pages/admin/lms/CreateMaterial.jsx

import React, { useState } from "react";
import {
  ArrowLeft,
  Upload,
  Save,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";


const CreateMaterial = () => {


  const navigate = useNavigate();


  const [loading,setLoading] = useState(false);
  const [uploading,setUploading] = useState(false);



  const [formData,setFormData] = useState({

    title:"",
    description:"",
    subject:"",
    level:"SS1",
    material_type:"pdf",
    file:null,

  });





  const handleChange=(e)=>{

    const {
      name,
      value
    } = e.target;


    setFormData(prev=>({

      ...prev,
      [name]:value

    }));

  };







  const handleFile=(e)=>{

    const file=e.target.files[0];


    if(file){

      setFormData(prev=>({

        ...prev,
        file

      }));

    }

  };







  const getBucket=()=>{


    if(formData.material_type==="video")
      return "course-videos";


    return "course-documents";


  };








  const uploadFile=async()=>{


    if(!formData.file)
      return null;



    setUploading(true);



    const bucket=getBucket();



    const fileName =
    `${Date.now()}-${formData.file.name}`;



    const {error}=await supabase.storage
    .from(bucket)
    .upload(fileName,formData.file);




    if(error){

      console.error(error);

      alert(error.message);

      setUploading(false);

      return null;

    }





    const {data}=supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);



    setUploading(false);



    return data.publicUrl;


  };










  const handleSubmit=async(e)=>{


    e.preventDefault();



    if(!formData.title.trim()){

      alert(
        "Material title required"
      );

      return;

    }



    if(!formData.file){

      alert(
        "Please select a file"
      );

      return;

    }



    setLoading(true);




    const fileUrl = await uploadFile();




    if(!fileUrl){

      setLoading(false);

      return;

    }






    const {error}=await supabase
    .from("learning_materials")
    .insert({

      title:formData.title,

      description:formData.description,

      subject:formData.subject,

      level:formData.level,

      material_type:formData.material_type,

      file_url:fileUrl,

    });







    setLoading(false);




    if(error){

      console.error(
        "CREATE MATERIAL ERROR:",
        error
      );


      alert(error.message);

      return;

    }





    navigate(
      "/admin/lms/materials"
    );



  };









return (

<div className="max-w-5xl mx-auto space-y-8 p-6">





{/* HEADER */}


<div className="
flex
items-center
justify-between
">


<div>

<h1 className="
text-3xl
font-bold
text-white
">

Add Learning Material

</h1>


<p className="
mt-2
text-slate-400
">

Upload school notes, documents and videos.

</p>


</div>




<AdminButton

variant="secondary"

onClick={()=>navigate(
"/admin/lms/materials"
)}

>

<ArrowLeft
size={18}
className="mr-2"
/>

Back

</AdminButton>



</div>









<form

onSubmit={handleSubmit}

className="
rounded-3xl
border
border-slate-800
bg-slate-900
p-8
space-y-8
"

>






<div>


<label className="
mb-2
block
text-sm
text-slate-300
">

Title

</label>



<input

name="title"

value={formData.title}

onChange={handleChange}

placeholder="Example: SS2 Physics Motion Notes"

className="
w-full
rounded-xl
border
border-slate-700
bg-slate-950
px-4
py-3
text-white
outline-none
focus:border-blue-500
"

/>


</div>







<div>


<label className="
mb-2
block
text-sm
text-slate-300
">

Description

</label>


<textarea

rows="5"

name="description"

value={formData.description}

onChange={handleChange}

placeholder="Describe this material..."

className="
w-full
rounded-xl
border
border-slate-700
bg-slate-950
px-4
py-3
text-white
outline-none
focus:border-blue-500
"

/>


</div>









<div className="
grid
md:grid-cols-2
gap-5
">



<div>


<label className="
mb-2
block
text-sm
text-slate-300
">

Subject

</label>


<input

name="subject"

value={formData.subject}

onChange={handleChange}

placeholder="Physics"

className="
w-full
rounded-xl
border
border-slate-700
bg-slate-950
px-4
py-3
text-white
"

/>


</div>







<div>


<label className="
mb-2
block
text-sm
text-slate-300
">

Class Level

</label>



<select

name="level"

value={formData.level}

onChange={handleChange}

className="
w-full
rounded-xl
border
border-slate-700
bg-slate-950
px-4
py-3
text-white
"

>


<option>JSS1</option>
<option>JSS2</option>
<option>JSS3</option>
<option>SS1</option>
<option>SS2</option>
<option>SS3</option>


</select>



</div>



</div>









<div>


<label className="
mb-2
block
text-sm
text-slate-300
">

Material Type

</label>



<select

name="material_type"

value={formData.material_type}

onChange={handleChange}

className="
w-full
rounded-xl
border
border-slate-700
bg-slate-950
px-4
py-3
text-white
"

>


<option value="pdf">
PDF
</option>


<option value="docx">
DOCX
</option>


<option value="video">
Video
</option>



</select>



</div>









<div>


<label className="
mb-2
block
text-sm
text-slate-300
">

Upload File

</label>



<label className="
flex
cursor-pointer
items-center
gap-4
rounded-xl
border
border-dashed
border-slate-700
bg-slate-950
p-6
text-slate-400
hover:border-blue-500
">


<Upload size={25}/>



<span>

{
formData.file
?
formData.file.name
:
"Choose file"
}

</span>



<input

type="file"

onChange={handleFile}

className="hidden"

/>


</label>



</div>








<div className="
flex
justify-end
gap-4
">


<AdminButton

type="button"

variant="secondary"

onClick={()=>navigate(
"/admin/lms/materials"
)}

>

Cancel

</AdminButton>





<AdminButton

type="submit"

disabled={
loading ||
uploading
}

>


{
loading || uploading
?

<Loader2
size={18}
className="animate-spin mr-2"
/>

:

<Save
size={18}
className="mr-2"
/>

}


{
uploading
?
"Uploading..."
:
loading
?
"Saving..."
:
"Save Material"
}


</AdminButton>



</div>







</form>




</div>


);


};


export default CreateMaterial;