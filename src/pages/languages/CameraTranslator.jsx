import React, {
  useState
} from "react";

import {
  motion
} from "framer-motion";

import {
  Camera,
  ScanLine,
  Languages,
  Sparkles,
  Image,
  Upload,
  ArrowRight,
} from "lucide-react";



const CameraTranslator = () => {


  const [image,setImage] = useState(null);

  const [translated,setTranslated] = useState("");



  const handleImage = (e)=>{


    const file = e.target.files[0];


    if(file){

      setImage(
        URL.createObjectURL(file)
      );


    }


  };




  const translateImage = ()=>{


    if(!image){

      setTranslated(
        "Upload an image first."
      );

      return;

    }


    setTranslated(
      "Detected text: Welcome. Translation: Bienvenue."
    );


  };






return (

<section

className="
min-h-screen
bg-[#020617]
px-8
py-12
text-white
"

>


<div

className="
mx-auto
max-w-7xl
"

>





{/* ================= HERO ================= */}



<motion.div

initial={{
opacity:0,
y:30
}}

animate={{
opacity:1,
y:0
}}

className="
rounded-3xl
border
border-white/10
bg-gradient-to-br
from-cyan-600/20
via-blue-600/20
to-purple-600/20
p-10
"

>


<div

className="
flex
items-center
gap-5
"

>


<div

className="
rounded-2xl
bg-cyan-500/20
p-4
"

>


<Camera

size={42}

className="
text-cyan-400
"

/>


</div>





<div>


<h1

className="
text-5xl
font-black
"

>

Camera Translator

</h1>



<p

className="
mt-3
max-w-3xl
leading-8
text-slate-300
"

>

Translate text from images instantly.
Scan books, signs, notes and documents
using AI vision technology.

</p>


</div>


</div>


</motion.div>
{/* ================= IMAGE SCANNER ================= */}



<section

className="
mt-12
"

>


<motion.div

whileHover={{
scale:1.01
}}

className="
rounded-3xl
border
border-white/10
bg-slate-900
p-8
"

>


<div

className="
flex
items-center
gap-4
"

>


<div

className="
rounded-2xl
bg-purple-500/20
p-4
"

>


<ScanLine

size={35}

className="
text-purple-400
"

/>


</div>




<div>


<h2

className="
text-3xl
font-black
"

>

AI Image Scanner

</h2>


<p

className="
mt-2
text-slate-400
"

>

Upload an image containing text
and translate automatically.

</p>


</div>


</div>







<div

className="
mt-8
grid
gap-8
md:grid-cols-2
"

>





{/* UPLOAD BOX */}



<div

className="
flex
min-h-[350px]
flex-col
items-center
justify-center
rounded-3xl
border
border-dashed
border-white/20
bg-black/30
p-6
"

>


{

image

?

<img

src={image}

alt="uploaded"

className="
h-72
w-full
rounded-2xl
object-cover
"

/>

:

<>

<Image

size={70}

className="
text-slate-500
"

/>


<p

className="
mt-5
text-slate-400
"

>

Upload image to scan

</p>

</>

}






<label

className="
mt-6
flex
cursor-pointer
items-center
gap-3
rounded-xl
bg-blue-600
px-6
py-3
font-black
"

>


<Upload

size={18}

/>


Choose Image



<input

type="file"

accept="image/*"

onChange={handleImage}

className="
hidden
"

/>



</label>



</div>








{/* RESULT BOX */}



<div

className="
rounded-3xl
bg-black/30
p-8
"

>


<div

className="
flex
items-center
gap-3
"

>


<Languages

className="
text-cyan-400
"

/>


<h3

className="
text-2xl
font-black
"

>

Translation Result

</h3>


</div>





<div

className="
mt-8
min-h-[150px]
rounded-2xl
bg-slate-800/50
p-6
"

>


{

translated

?

<p

className="
leading-8
text-cyan-300
"

>

{translated}

</p>


:

<p

className="
text-slate-500
"

>

Your translation will appear here.

</p>

}



</div>







<button

onClick={translateImage}

className="
mt-6
flex
items-center
justify-center
gap-3
rounded-xl
bg-purple-600
px-7
py-4
font-black
"

>


Translate Image

<ArrowRight

size={18}

/>


</button>



</div>






</div>


</motion.div>


</section>
{/* ================= SUPPORTED LANGUAGES ================= */}



<section

className="
mt-14
grid
gap-6
md:grid-cols-3
"

>


{

[
"English",
"French",
"Spanish",
"German",
"Chinese",
"Japanese"

]

.map(

(lang,index)=>(


<motion.div

key={index}

whileHover={{
y:-8
}}

className="
rounded-2xl
border
border-white/10
bg-slate-900
p-6
"

>


<h3

className="
text-xl
font-black
"

>

{lang}

</h3>



<p

className="
mt-2
text-slate-400
"

>

Camera translation available

</p>


</motion.div>


)

)

}



</section>








{/* ================= AI FEATURES ================= */}



<section

className="
mt-16
"

>


<motion.div

className="
rounded-3xl
border
border-white/10
bg-gradient-to-r
from-purple-600/20
to-blue-600/20
p-8
"

>


<div

className="
flex
items-center
gap-4
"

>


<div

className="
rounded-2xl
bg-purple-500/20
p-4
"

>


<Sparkles

size={35}

className="
text-purple-400
"

/>


</div>




<div>


<h2

className="
text-3xl
font-black
"

>

AI Vision Translation

</h2>


<p

className="
mt-2
text-slate-300
"

>

Smart OCR technology detects text,
understands context and provides
natural translations.

</p>


</div>


</div>






<div

className="
mt-8
grid
gap-4
md:grid-cols-3
"

>


<div

className="
rounded-2xl
bg-black/30
p-5
"

>

<h3

className="
font-black
"

>

📷 OCR Detection

</h3>

<p

className="
mt-2
text-sm
text-slate-400
"

>

Extract words from any image.

</p>

</div>





<div

className="
rounded-2xl
bg-black/30
p-5
"

>

<h3

className="
font-black
"

>

🌎 Context AI

</h3>

<p

className="
mt-2
text-sm
text-slate-400
"

>

Understand meaning beyond direct translation.

</p>

</div>





<div

className="
rounded-2xl
bg-black/30
p-5
"

>

<h3

className="
font-black
"

>

🔊 Voice Support

</h3>

<p

className="
mt-2
text-sm
text-slate-400
"

>

Listen to translated words.

</p>

</div>



</div>



</motion.div>


</section>








{/* ================= HISTORY ================= */}



<section

className="
mt-14
"

>


<h2

className="
text-3xl
font-black
"

>

Recent Scans

</h2>




<div

className="
mt-6
rounded-3xl
border
border-white/10
bg-slate-900
p-8
"

>


<p

className="
text-slate-400
"

>

No previous scans yet.

Your translated images will appear here.

</p>


</div>



</section>








{/* ================= FOOTER ================= */}



<div

className="
mt-20
rounded-3xl
border
border-white/10
bg-black/30
p-8
text-center
"

>


<h2

className="
text-3xl
font-black
"

>

Translate The World Through Your Camera.

</h2>



<p

className="
mx-auto
mt-4
max-w-3xl
leading-8
text-slate-400
"

>

Break language barriers by
turning images into instant understanding.

</p>


</div>






</div>

</section>


);

};



export default CameraTranslator;