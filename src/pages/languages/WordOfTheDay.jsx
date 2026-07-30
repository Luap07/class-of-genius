import React, {
  useState
} from "react";

import {
  motion
} from "framer-motion";

import {
  CalendarDays,
  Volume2,
  Sparkles,
  BookOpen,
  Globe,
  Heart,
} from "lucide-react";



const WordOfTheDay = () => {


  const [saved,setSaved] = useState(false);



  const word = {

    word:"Serendipity",

    meaning:
    "The occurrence of finding something valuable or interesting by chance.",

    language:"English",

    pronunciation:
    "seh-ren-DIP-i-tee",

    example:
    "Finding this language platform was a moment of serendipity.",

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
from-yellow-500/20
via-orange-500/20
to-red-500/20
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
bg-yellow-500/20
p-4
"

>


<CalendarDays

size={42}

className="
text-yellow-400
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

Word Of The Day

</h1>


<p

className="
mt-3
max-w-3xl
leading-8
text-slate-300
"

>

Discover a new word every day,
learn its meaning, pronunciation,
examples and cultural usage.

</p>


</div>


</div>


</motion.div>
{/* ================= WORD CARD ================= */}



<section

className="
mt-12
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
bg-slate-900
p-10
"

>


<div

className="
flex
flex-wrap
items-start
justify-between
gap-6
"

>


<div>


<div

className="
flex
items-center
gap-3
"

>


<Globe

className="
text-cyan-400
"

/>


<span

className="
rounded-full
bg-cyan-500/20
px-4
py-2
text-sm
text-cyan-300
"

>

{word.language}

</span>


</div>





<h2

className="
mt-8
text-6xl
font-black
"

>

{word.word}

</h2>




<p

className="
mt-4
text-xl
text-purple-300
"

>

{word.pronunciation}

</p>


</div>







<button

onClick={()=>
setSaved(
!saved
)
}

className="
rounded-2xl
bg-white/10
p-4
"

>


<Heart

size={28}

className={

saved

?

"text-red-500 fill-red-500"

:

"text-white"

}

/>


</button>



</div>







<div

className="
mt-10
grid
gap-6
md:grid-cols-2
"

>


<div

className="
rounded-2xl
bg-black/30
p-6
"

>


<h3

className="
text-xl
font-black
"

>

Meaning

</h3>


<p

className="
mt-3
leading-8
text-slate-300
"

>

{word.meaning}

</p>


</div>







<div

className="
rounded-2xl
bg-black/30
p-6
"

>


<h3

className="
text-xl
font-black
"

>

Example

</h3>


<p

className="
mt-3
italic
leading-8
text-slate-300
"

>

"{word.example}"

</p>


</div>



</div>







<button

className="
mt-8
flex
items-center
gap-3
rounded-xl
bg-blue-600
px-7
py-4
font-black
"

>


<Volume2

size={20}

/>


Listen Pronunciation


</button>



</motion.div>


</section>
{/* ================= RELATED WORDS ================= */}



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

Related Words

</h2>




<div

className="
grid
gap-6
md:grid-cols-3
"

>


{


[
{
word:"Chance",
type:"Noun"
},

{
word:"Lucky",
type:"Adjective"
},

{
word:"Discovery",
type:"Noun"
}

]

.map(

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


<h3

className="
text-2xl
font-black
"

>

{item.word}

</h3>



<p

className="
mt-3
text-slate-400
"

>

{item.type}

</p>




<button

className="
mt-5
rounded-xl
bg-slate-800
px-5
py-2
font-bold
"

>

Explore

</button>



</motion.div>


)

)


}


</div>


</section>








{/* ================= DAILY GOAL ================= */}



<section

className="
mt-14
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


<BookOpen

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

Daily Vocabulary Goal

</h3>


<p

className="
mt-2
text-slate-300
"

>

Learn 5 new words every day
to grow your vocabulary.

</p>


</div>


</div>





<div

className="
mt-6
h-3
overflow-hidden
rounded-full
bg-black/40
"

>


<div

className="
h-full
w-[60%]
rounded-full
bg-green-500
"

/>


</div>



<p

className="
mt-3
text-sm
text-green-300
"

>

3 / 5 words completed today

</p>



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

Word Challenge

</h3>


<p

className="
mt-2
text-slate-300
"

>

Create a sentence using today's word
and earn XP.

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

Start Challenge

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

One Word Every Day.
A Thousand Words A Year.

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

Small daily vocabulary practice
creates powerful language growth.

</p>


</div>






</div>

</section>


);

};



export default WordOfTheDay;