import React, {
  useState
} from "react";

import {
  motion
} from "framer-motion";

import {
  Mic,
  Volume2,
  Play,
  Award,
  Languages,
  Sparkles,
  Waves,
} from "lucide-react";



const Pronunciation = () => {


  const [recording,setRecording] = useState(false);

  const [word,setWord] = useState("");



  const practiceWords = [

    {
      word:"Hello",
      language:"English",
      pronunciation:"heh-LOH"
    },

    {
      word:"Bonjour",
      language:"French",
      pronunciation:"bon-ZHOOR"
    },

    {
      word:"Gracias",
      language:"Spanish",
      pronunciation:"GRA-see-as"
    },

    {
      word:"こんにちは",
      language:"Japanese",
      pronunciation:"Kon-ni-chi-wa"
    },

  ];



  const startRecording = ()=>{

    setRecording(!recording);

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
from-pink-600/20
via-purple-600/20
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
bg-pink-500/20
p-4
"

>


<Mic

size={42}

className="
text-pink-400
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

Pronunciation Lab

</h1>



<p

className="
mt-3
max-w-3xl
leading-8
text-slate-300
"

>

Improve your accent, speaking confidence
and pronunciation using voice practice
and AI feedback.

</p>


</div>


</div>


</motion.div>
{/* ================= VOICE PRACTICE ================= */}



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
bg-blue-500/20
p-4
"

>


<Waves

size={35}

className="
text-blue-400
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

Voice Practice Studio

</h2>


<p

className="
mt-2
text-slate-400
"

>

Speak a word and compare your
pronunciation with native speakers.

</p>


</div>


</div>






<div

className="
mt-8
flex
flex-col
items-center
justify-center
rounded-3xl
bg-black/30
p-10
"

>


<motion.div

animate={

recording

?

{
scale:[
1,
1.2,
1
]
}

:

{}

}

transition={

{
repeat:Infinity,
duration:1.5
}

}

className="
flex
h-32
w-32
items-center
justify-center
rounded-full
bg-pink-600
"

>


<Mic

size={55}

/>


</motion.div>





<button

onClick={startRecording}

className={`

mt-8
rounded-xl
px-8
py-4
font-black

${
recording

?

"bg-red-600"

:

"bg-blue-600"

}

`}

>

{

recording

?

"Stop Recording"

:

"Start Recording"

}


</button>





<p

className="
mt-5
text-slate-400
"

>

{

recording

?

"Listening to your voice..."

:

"Press the button and pronounce the word"

}

</p>



</div>


</motion.div>


</section>








{/* ================= WORD PRACTICE ================= */}



<section

className="
mt-14
"

>


<h2

className="
mb-8
text-3xl
font-black
"

>

Pronunciation Practice

</h2>




<div

className="
grid
gap-6
md:grid-cols-2
xl:grid-cols-4
"

>


{

practiceWords.map(

(item,index)=>(


<motion.div

key={index}

whileHover={{
y:-8
}}

className="
rounded-3xl
border
border-white/10
bg-slate-900
p-6
"

>


<div

className="
flex
items-center
justify-between
"

>


<h3

className="
text-2xl
font-black
"

>

{item.word}

</h3>



<button

className="
rounded-xl
bg-cyan-500/20
p-3
"

>


<Volume2

size={20}

className="
text-cyan-400
"

/>


</button>



</div>





<p

className="
mt-3
text-slate-400
"

>

{item.language}

</p>




<div

className="
mt-4
rounded-xl
bg-black/30
p-3
text-sm
text-purple-300
"

>

{item.pronunciation}

</div>




<button

className="
mt-5
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-slate-800
py-3
font-bold
"

>


<Play

size={16}

/>


Listen

</button>



</motion.div>


)

)

}


</div>


</section>
{/* ================= AI PRONUNCIATION SCORE ================= */}



<section

className="
mt-16
grid
gap-6
md:grid-cols-2
"

>



<motion.div

whileHover={{
y:-8
}}

className="
rounded-3xl
border
border-white/10
bg-gradient-to-br
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

size={32}

className="
text-purple-400
"

/>


</div>



<div>


<h3

className="
text-2xl
font-black
"

>

AI Pronunciation Coach

</h3>


<p

className="
mt-2
text-slate-300
"

>

Get instant feedback on your
accent, clarity and speaking rhythm.

</p>


</div>


</div>





<div

className="
mt-6
rounded-2xl
bg-black/30
p-5
"

>


<p

className="
text-sm
text-slate-400
"

>

Latest Score

</p>


<h2

className="
mt-2
text-5xl
font-black
text-green-400
"

>

92%

</h2>


</div>





<button

className="
mt-6
rounded-xl
bg-purple-600
px-6
py-3
font-bold
"

>

Analyze My Voice

</button>


</motion.div>








<motion.div

whileHover={{
y:-8
}}

className="
rounded-3xl
border
border-white/10
bg-gradient-to-br
from-green-600/20
to-cyan-600/20
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


<Award

size={32}

className="
text-green-400
"

/>


</div>




<div>


<h3

className="
text-2xl
font-black
"

>

Speaking Achievements

</h3>


<p

className="
mt-2
text-slate-300
"

>

Practice daily and unlock
speaking badges.

</p>


</div>


</div>





<div

className="
mt-6
flex
flex-wrap
gap-3
"

>


<span

className="
rounded-full
bg-green-500/20
px-4
py-2
text-green-300
"

>

🎤 Clear Speaker

</span>



<span

className="
rounded-full
bg-blue-500/20
px-4
py-2
text-blue-300
"

>

🌎 Global Voice

</span>



<span

className="
rounded-full
bg-purple-500/20
px-4
py-2
text-purple-300
"

>

🔥 Fluent Talker

</span>


</div>


</motion.div>



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

Speak With Confidence.

</h2>



<p

className="
mx-auto
mt-4
max-w-3xl
text-slate-400
leading-8
"

>

Pronunciation practice helps learners
communicate naturally with people
from different cultures around the world.

</p>


</div>





</div>

</section>


);

};



export default Pronunciation;