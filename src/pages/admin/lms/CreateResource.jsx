// src/pages/admin/lms/CreateResource.jsx

import React, { useState } from "react";
import {
  ArrowLeft,
  Upload,
  Save,
  Loader2,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";


const CreateResource = () => {

  const navigate = useNavigate();

  const { topicId } = useParams();


  console.log(
    "CREATE RESOURCE TOPIC ID:",
    topicId
  );



  const [loading,setLoading] = useState(false);

  const [uploading,setUploading] = useState(false);



  const [formData,setFormData] = useState({

    title:"",
    description:"",
    resource_type:"pdf",
    file:null,
    youtube_url:"",

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






  const handleFileChange=(e)=>{


    const file=e.target.files[0];


    if(file){

      setFormData(prev=>({

        ...prev,

        file

      }));

    }


  };







  const getBucket=()=>{


    if(
      formData.resource_type==="pdf" ||
      formData.resource_type==="docx"
    ){

      return "course-documents";

    }



    if(
      formData.resource_type==="video"
    ){

      return "course-videos";

    }



    return null;


  };








  const uploadFile=async()=>{


    if(!formData.file)
      return null;



    const bucket=getBucket();



    if(!bucket)
      return null;




    setUploading(true);



    const fileName =
      `${Date.now()}-${formData.file.name}`;




    const {
      error
    } = await supabase.storage
      .from(bucket)
      .upload(
        fileName,
        formData.file
      );




    if(error){

      console.error(
        "UPLOAD ERROR:",
        error
      );

      alert(error.message);

      setUploading(false);

      return null;

    }






    const {
      data
    } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);




    setUploading(false);



    return data.publicUrl;


  };








  const handleSubmit=async(e)=>{


    e.preventDefault();




    if(!topicId){


      alert(
        "Missing Topic ID. Return to the topic page and try again."
      );


      console.error(
        "TOPIC ID IS:",
        topicId
      );


      return;


    }






    if(!formData.title.trim()){


      alert(
        "Resource title is required."
      );


      return;


    }






    if(
      formData.resource_type!=="youtube" &&
      !formData.file
    ){


      alert(
        "Please select a file."
      );


      return;


    }






    setLoading(true);



    let fileUrl=null;




    if(
      formData.resource_type!=="youtube"
    ){


      fileUrl=await uploadFile();



      if(!fileUrl){

        setLoading(false);

        return;

      }


    }







    const resourceData={


      topic_id:topicId,


      title:
        formData.title.trim(),


      description:
        formData.description.trim(),


      resource_type:
        formData.resource_type,


      file_url:fileUrl,


      youtube_url:
        formData.youtube_url || null,


    };






    console.log(
      "INSERT RESOURCE:",
      resourceData
    );







    const {
      data,
      error
    } = await supabase
      .from("resources")
      .insert(resourceData)
      .select()
      .single();







    console.log(
      "RESOURCE RESULT:",
      data
    );


    console.log(
      "RESOURCE ERROR:",
      error
    );







    setLoading(false);





    if(error){


      alert(error.message);


      return;


    }






    navigate(
      `/admin/lms/topic/${topicId}/resources`
    );



  };








  return (

<div className="max-w-5xl mx-auto space-y-8 p-6">





<div className="flex items-center justify-between">


<div>

<h1 className="text-3xl font-bold text-white">

Add Learning Resource

</h1>


<p className="mt-2 text-slate-400">

Upload PDF, DOCX, videos or add lessons.

</p>


</div>





<AdminButton

variant="secondary"

onClick={()=>navigate(
`/admin/lms/topic/${topicId}/resources`
)}

>

<ArrowLeft size={18} className="mr-2"/>

Back

</AdminButton>



</div>







<form
onSubmit={handleSubmit}
className="rounded-3xl border border-slate-800 bg-slate-900 p-8 space-y-8"
>





<div>

<label className="mb-2 block text-sm text-slate-300">

Title

</label>


<input

name="title"

value={formData.title}

onChange={handleChange}

className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"

/>


</div>







<div>

<label className="mb-2 block text-sm text-slate-300">

Description

</label>


<textarea

name="description"

value={formData.description}

onChange={handleChange}

rows="5"

className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"

/>


</div>







<div>

<label className="mb-2 block text-sm text-slate-300">

Resource Type

</label>


<select

name="resource_type"

value={formData.resource_type}

onChange={handleChange}

className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"

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


<option value="youtube">
YouTube
</option>


</select>


</div>







{
formData.resource_type==="youtube" ? (

<input

name="youtube_url"

value={formData.youtube_url}

onChange={handleChange}

placeholder="YouTube URL"

className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"

/>

):(


<label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-700 p-6 text-slate-400">


<Upload/>


{formData.file
?
formData.file.name
:
"Choose file"
}



<input

type="file"

onChange={handleFileChange}

className="hidden"

/>


</label>


)

}





<div className="flex justify-end">


<AdminButton
type="submit"
disabled={loading || uploading}
>

{
loading || uploading
?
<Loader2 className="animate-spin mr-2"/>
:
<Save className="mr-2"/>
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
"Save Resource"
}


</AdminButton>


</div>




</form>



</div>

  );


};


export default CreateResource;