import React, {
  useState
} from "react";

import {
  motion
} from "framer-motion";

import {
  Mic,
  Volume2,
  Languages,
  Sparkles,
  Waves,
  ArrowRight,
  StopCircle,
} from "lucide-react";



const VoiceTranslator = () => {


  const [recording,setRecording] = useState(false);

  const [voiceText,setVoiceText] = useState("");

  const [translation,setTranslation] = useState("");





  const startRecording = ()=>{


    setRecording(
      !recording
    );



    if(!recording){

      setVoiceText(
        "Hello, how are you?"
      );

    }


  };




  const translateVoice = ()=>{


    if(!voiceText){

      setTranslation(
        "Record your voice first."
      );

      return;

    }



    setTranslation(
      "Bonjour, comment allez-vous ?"
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
from-green-600/20
via-cyan-600/20
to-blue-600/20
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
bg-green-500/20
p-4
"

>


<Mic

size={42}

className="
text-green-400
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

Voice Translator

</h1>



<p

className="
mt-3
max-w-3xl
leading-8
text-slate-300
"

>

Speak naturally and translate your
voice instantly into different languages
with AI speech technology.

</p>


</div>


</div>


</motion.div>
{/* ================= VOICE TRANSLATOR PANEL ================= */}



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
grid
gap-8
md:grid-cols-2
"

>





{/* ================= RECORD AREA ================= */}



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
gap-4
"

>


<div

className="
rounded-2xl
bg-green-500/20
p-4
"

>


<Waves

size={35}

className="
text-green-400
"

/>


</div>




<div>


<h2

className="
text-2xl
font-black
"

>

Voice Input

</h2>


<p

className="
mt-1
text-slate-400
"

>

Speak your sentence

</p>


</div>


</div>








<motion.div

animate={

recording

?

{

scale:[
1,
1.1,
1
]

}

:

{}

}

transition={{

repeat:Infinity,

duration:1.5

}}

className="
mx-auto
mt-10
flex
h-36
w-36
items-center
justify-center
rounded-full
bg-green-600/20
"

>


<Mic

size={60}

className={
recording

?

"text-red-400"

:

"text-green-400"

}

/>


</motion.div>








<button

onClick={startRecording}

className={`

mx-auto
mt-8
flex
items-center
justify-center
gap-3
rounded-xl
px-7
py-3
font-black

${
recording

?

"bg-red-600"

:

"bg-green-600"

}

`}

>


{

recording

?

<>

<StopCircle

size={18}

/>

Stop Recording

</>


:

<>

<Mic

size={18}

/>

Start Recording

</>

}


</button>







<div

className="
mt-8
rounded-2xl
bg-slate-800/50
p-5
"

>


<h3

className="
font-black
"

>

Recognized Speech

</h3>



<p

className="
mt-3
text-slate-300
"

>

{

voiceText ||

"Your voice text will appear here."

}

</p>


</div>



</div>








{/* ================= TRANSLATION ================= */}



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



<h2

className="
text-2xl
font-black
"

>

Translation

</h2>


</div>






<div

className="
mt-8
rounded-2xl
bg-slate-800/50
p-6
min-h-[160px]
"

>


{

translation

?

<p

className="
leading-8
text-cyan-300
"

>

{translation}

</p>


:

<p

className="
text-slate-500
"

>

Translated voice will appear here.

</p>


}



</div>






<button

onClick={translateVoice}

className="
mt-6
flex
items-center
justify-center
gap-3
rounded-xl
bg-blue-600
px-7
py-4
font-black
"

>


Translate Voice


<ArrowRight

size={18}

/>


</button>






</div>




</div>


</motion.div>


</section>
{/* ================= LANGUAGE SELECTOR ================= */}



<section

className="
mt-14
"

>


<motion.div

whileHover={{
scale:1.02
}}

className="
rounded-3xl
border
border-white/10
bg-gradient-to-r
from-blue-600/20
to-cyan-600/20
p-8
"

>


<h2

className="
text-3xl
font-black
"

>

Choose Translation Language

</h2>



<div

className="
mt-6
grid
gap-4
sm:grid-cols-2
md:grid-cols-4
"

>


{

[
"English",
"French",
"Spanish",
"German",
"Chinese",
"Arabic",
"Japanese",
"Korean"

]

.map(

(lang,index)=>(


<button

key={index}

className="
rounded-xl
border
border-white/10
bg-black/30
px-5
py-4
font-bold
transition
hover:bg-cyan-600
"

>

{lang}

</button>


)

)

}



</div>



</motion.div>


</section>








{/* ================= AI VOICE FEATURES ================= */}



<section

className="
mt-14
grid
gap-6
md:grid-cols-3
"

>


<div

className="
rounded-3xl
border
border-white/10
bg-slate-900
p-6
"

>


<Mic

size={35}

className="
text-green-400
"

/>



<h3

className="
mt-5
text-xl
font-black
"

>

Speech Recognition

</h3>



<p

className="
mt-3
text-slate-400
"

>

AI understands natural speech
and converts it into text.

</p>


</div>








<div

className="
rounded-3xl
border
border-white/10
bg-slate-900
p-6
"

>


<Volume2

size={35}

className="
text-blue-400
"

/>



<h3

className="
mt-5
text-xl
font-black
"

>

Voice Playback

</h3>



<p

className="
mt-3
text-slate-400
"

>

Listen to translated sentences
with realistic AI voices.

</p>


</div>








<div

className="
rounded-3xl
border
border-white/10
bg-slate-900
p-6
"

>


<Sparkles

size={35}

className="
text-purple-400
"

/>



<h3

className="
mt-5
text-xl
font-black
"

>

AI Context

</h3>



<p

className="
mt-3
text-slate-400
"

>

Understand meaning,
expressions and conversation style.

</p>


</div>



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

Translation History

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

No voice translations yet.

Your previous translations will appear here.

</p>


</div>



</section>








{/* ================= FOOTER ================= */}



<footer

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

Speak Any Language.

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

Break communication barriers
with intelligent AI voice translation.

</p>


</footer>






</div>

</section>


);

};



export default VoiceTranslator;