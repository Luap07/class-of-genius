import React, { useEffect, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function ListeningForm({
  open,
  onClose,
  listening,
  languages = [],
  saving,
  setSaving,
  refreshListening,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    language_id: "",
    level: "Beginner",
    audio_url: "",
    video_url: "",
    transcript: "",
  });

  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);


  useEffect(() => {
    if (listening) {
      setForm({
        title: listening.title || "",
        description: listening.description || "",
        language_id: listening.language_id || "",
        level: listening.level || "Beginner",
        audio_url: listening.audio_url || "",
        video_url: listening.video_url || "",
        transcript: listening.transcript || "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        language_id: "",
        level: "Beginner",
        audio_url: "",
        video_url: "",
        transcript: "",
      });
    }
  }, [listening]);


  function updateField(field,value){
    setForm(prev=>({
      ...prev,
      [field]:value
    }));
  }



  async function uploadFile(file,folder){

    if(!file) return null;

    const fileName =
      `${Date.now()}-${file.name}`;

    const path =
      `${folder}/${fileName}`;


    const {error} =
      await supabase.storage
      .from("language-media")
      .upload(
        path,
        file
      );


    if(error)
      throw error;


    const {
      data
    } =
    supabase.storage
    .from("language-media")
    .getPublicUrl(path);


    return data.publicUrl;
  }




  async function handleSave(){

    try{

      setSaving(true);


      let audioUrl =
        form.audio_url;


      let videoUrl =
        form.video_url;



      // AUDIO ONLY FILE UPLOAD

      if(audioFile){

        audioUrl =
        await uploadFile(
          audioFile,
          "listening/audio"
        );

      }



      // VIDEO FILE UPLOAD

      if(videoFile){

        videoUrl =
        await uploadFile(
          videoFile,
          "listening/video"
        );

      }



      const payload = {

        title:
          form.title,

        description:
          form.description,

        language_id:
          form.language_id,

        level:
          form.level,

        audio_url:
          audioUrl,

        video_url:
          videoUrl,

        transcript:
          form.transcript,

        updated_at:
          new Date()
          .toISOString(),

      };



      let response;


      if(listening){

        response =
        await supabase
        .from("language_listening")
        .update(payload)
        .eq(
          "id",
          listening.id
        );

      }
      else{

        response =
        await supabase
        .from("language_listening")
        .insert(payload);

      }



      if(response.error)
        throw response.error;



      await refreshListening();

      onClose();


    }
    catch(error){

      console.error(
        "Listening Save Error:",
        error
      );

      alert(
        "Unable to save listening lesson"
      );

    }
    finally{

      setSaving(false);

    }

  }




  if(!open)
    return null;



  return (

<div
className="
fixed
inset-0
z-[999]
bg-black/70
backdrop-blur-md
flex
items-center
justify-center
p-6
"
>


<div
className="
w-full
max-w-4xl
rounded-[35px]
border
border-white/10
bg-slate-950
p-8
text-white
"
>


<div
className="
flex
items-center
justify-between
mb-8
"
>

<h2
className="
text-3xl
font-black
"
>
{listening
?
"Edit Listening Lesson"
:
"Add Listening Lesson"}
</h2>


<button
onClick={onClose}
>
<X/>
</button>


</div>




<div className="space-y-6">


<input
value={form.title}
onChange={
e=>updateField(
"title",
e.target.value
)
}
placeholder="Lesson title"
className="
w-full
rounded-xl
bg-slate-900
border
border-slate-700
p-4
"
/>



<textarea
value={form.description}
onChange={
e=>updateField(
"description",
e.target.value
)
}
placeholder="Description"
className="
w-full
rounded-xl
bg-slate-900
border
border-slate-700
p-4
"
/>




<select
value={form.language_id}
onChange={
e=>updateField(
"language_id",
e.target.value
)
}
className="
w-full
rounded-xl
bg-slate-900
border
border-slate-700
p-4
"
>

<option value="">
Select Language
</option>

{
languages.map(lang=>(

<option
key={lang.id}
value={lang.id}
>
{lang.name}
</option>

))
}

</select>





<select
value={form.level}
onChange={
e=>updateField(
"level",
e.target.value
)
}
className="
w-full
rounded-xl
bg-slate-900
border
border-slate-700
p-4
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





{/* AUDIO */}

<div
className="
rounded-2xl
border
border-cyan-500/20
bg-cyan-500/5
p-5
"
>

<h3 className="font-bold mb-3">
Audio Upload (Required)
</h3>


<input
type="file"
accept="audio/*"
onChange={
e=>setAudioFile(
e.target.files[0]
)
}
/>


<p className="text-xs text-slate-400 mt-2">
Audio must come from your device.
</p>


</div>





{/* VIDEO */}

<div
className="
rounded-2xl
border
border-purple-500/20
bg-purple-500/5
p-5
"
>

<h3 className="font-bold mb-3">
Video (Upload OR Link)
</h3>


<input
type="file"
accept="video/*"
onChange={
e=>setVideoFile(
e.target.files[0]
)
}
/>


<input
value={form.video_url}
onChange={
e=>updateField(
"video_url",
e.target.value
)
}
placeholder="Paste video URL"
className="
mt-4
w-full
rounded-xl
bg-slate-900
border
border-slate-700
p-4
"
/>


</div>





<textarea
rows="8"
value={form.transcript}
onChange={
e=>updateField(
"transcript",
e.target.value
)
}
placeholder="Listening transcript..."
className="
w-full
rounded-xl
bg-slate-900
border
border-slate-700
p-4
"
/>





<button
disabled={saving}
onClick={handleSave}
className="
w-full
rounded-2xl
bg-gradient-to-r
from-cyan-500
to-blue-600
py-4
font-black
"
>

{
saving
?
<>
<Loader2
className="inline animate-spin"
/>
Saving...
</>
:
<>
<Upload
className="inline mr-2"
/>
Save Listening Lesson
</>
}

</button>


</div>


</div>

</div>

  );
}