import React, {
  useState
} from "react";

import {
  motion
} from "framer-motion";

import {
  Headphones,
  Play,
  Pause,
  Volume2,
  Globe,
  Award,
  Clock,
} from "lucide-react";


const Listening = () => {


  const [playing,setPlaying] = useState(null);



  const lessons = [

    {
      id:1,
      title:"Beginner Conversations",
      language:"English",
      level:"Beginner",
      duration:"10 min"
    },

    {
      id:2,
      title:"French Daily Conversation",
      language:"French",
      level:"Intermediate",
      duration:"15 min"
    },

    {
      id:3,
      title:"Japanese Listening Practice",
      language:"Japanese",
      level:"Advanced",
      duration:"20 min"
    },

  ];



  const togglePlay = (id)=>{

    setPlaying(
      playing === id
      ? null
      : id
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



{/* HERO */}


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
from-blue-600/20
via-cyan-600/20
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
bg-blue-500/20
p-4
"
>


<Headphones

size={42}

className="
text-blue-400
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

Listening Practice

</h1>


<p
className="
mt-3
max-w-3xl
leading-8
text-slate-300
"
>

Improve your listening skills with
real conversations, native speakers,
and interactive audio lessons.

</p>


</div>


</div>


</motion.div>
{/* ================= LISTENING LESSONS ================= */}


<section
className="
mt-12
"
>


<div
className="
flex
items-center
gap-3
mb-8
"
>


<Globe
className="
text-cyan-400
"
/>


<h2
className="
text-3xl
font-black
"
>

Audio Lessons

</h2>


</div>





<div
className="
grid
gap-6
md:grid-cols-2
xl:grid-cols-3
"
>


{

lessons.map(
(lesson)=>(


<motion.div

key={lesson.id}

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
items-start
justify-between
"
>


<div>


<h3
className="
text-xl
font-black
"
>

{lesson.title}

</h3>


<p
className="
mt-2
text-slate-400
"
>

{lesson.language}

</p>


</div>



<button

onClick={()=>
togglePlay(
lesson.id
)
}

className="
rounded-full
bg-blue-600
p-4
"

>


{

playing === lesson.id

?

<Pause
size={20}
/>

:

<Play
size={20}
/>

}


</button>



</div>





<div
className="
mt-6
flex
items-center
justify-between
text-sm
"

>


<span
className="
rounded-full
bg-purple-500/20
px-4
py-2
text-purple-300
"
>

{lesson.level}

</span>



<span
className="
flex
items-center
gap-2
text-slate-400
"
>


<Clock
size={16}
/>


{lesson.duration}


</span>


</div>





<div
className="
mt-6
h-2
overflow-hidden
rounded-full
bg-slate-800
"
>


<div
className="
h-full
w-1/3
rounded-full
bg-gradient-to-r
from-cyan-400
to-blue-500
"
/>


</div>





<button

className="
mt-6
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-slate-800
py-3
font-bold
hover:bg-slate-700
"

>


<Volume2
size={18}
/>


Listen Audio


</button>



</motion.div>


)

)

}


</div>


</section>






{/* ================= LISTENING SKILLS ================= */}



<section

className="
mt-20
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
from-indigo-600/20
to-purple-600/20
p-8
"

>


<div
className="
flex
flex-wrap
items-center
justify-between
gap-6
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
bg-yellow-500/20
p-4
"
>


<Award

size={40}

className="
text-yellow-400
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

Listening Mastery

</h2>


<p
className="
mt-2
text-slate-300
"
>

Complete listening challenges,
earn XP and unlock harder levels.

</p>


</div>


</div>





<div
className="
rounded-2xl
bg-black/30
px-6
py-4
"

>


<p
className="
text-sm
text-slate-400
"
>

Current Level

</p>


<h3
className="
text-3xl
font-black
"
>

A1 Beginner

</h3>


</div>



</div>


</motion.div>


</section>
{/* ================= DAILY CHALLENGE ================= */}


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
bg-slate-900
p-8
"

>


<h3
className="
text-2xl
font-black
"
>

Daily Listening Challenge

</h3>


<p
className="
mt-3
leading-7
text-slate-400
"
>

Listen to a short conversation every day,
answer questions and improve your
understanding of native speakers.

</p>



<button

className="
mt-6
rounded-xl
bg-cyan-600
px-6
py-3
font-bold
"

>

Start Challenge

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


<Headphones

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

AI Listening Coach

</h3>


<p
className="
mt-2
text-slate-400
"
>

Get pronunciation feedback,
transcripts and explanations
from AI.

</p>


</div>


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

Practice With AI

</button>


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

Train Your Ears.
Understand The World.

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

Listening is the bridge between
knowing a language and actually
communicating with people globally.

</p>



</div>





</div>

</section>


);

};



export default Listening;