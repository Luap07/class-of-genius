import React, {
  useState
} from "react";

import {
  BookOpen,
  Brain,
  Search,
  Sparkles,
  Volume2,
  Trophy,
  Layers,
} from "lucide-react";

import {
  motion
} from "framer-motion";


const Vocabulary = () => {


  const [search,setSearch] = useState("");



  const categories = [

    {
      title:"Daily Words",
      description:
      "Common words used in everyday conversations.",
      words:"5000+ Words"
    },

    {
      title:"Academic Vocabulary",
      description:
      "Improve vocabulary for school and university.",
      words:"3000+ Words"
    },

    {
      title:"Business Vocabulary",
      description:
      "Professional words for workplace communication.",
      words:"2000+ Words"
    },

    {
      title:"Travel Vocabulary",
      description:
      "Useful words for travelling around the world.",
      words:"1500+ Words"
    },

  ];



  const words = [

    {
      word:"Beautiful",
      meaning:
      "Having qualities that give pleasure to the senses.",
      example:
      "The sunset is beautiful.",
      level:"Beginner"
    },


    {
      word:"Opportunity",
      meaning:
      "A chance or possibility for success.",
      example:
      "Education creates opportunity.",
      level:"Intermediate"
    },


    {
      word:"Innovation",
      meaning:
      "A new idea, method or technology.",
      example:
      "Innovation changes the world.",
      level:"Advanced"
    },

  ];



  const filteredWords =
  words.filter((item)=>

    item.word
    .toLowerCase()
    .includes(
      search.toLowerCase()
    )

  );



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
from-blue-600/20
via-indigo-600/20
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

<BookOpen
size={40}
className="text-blue-400"
/>

</div>



<div>

<h1
className="
text-5xl
font-black
"
>

Vocabulary Mastery

</h1>


<p
className="
mt-3
max-w-3xl
text-slate-300
leading-8
"
>

Learn thousands of words,
understand meanings,
practice usage,
and build your global language skills.

</p>


</div>


</div>


</motion.div>
{/* ================= SEARCH ================= */}


<div
className="
mt-10
relative
"
>


<Search

className="
absolute
left-5
top-1/2
-translate-y-1/2
text-slate-400
"

/>


<input

value={search}

onChange={
e=>setSearch(
e.target.value
)
}

placeholder="Search vocabulary..."

className="
w-full
rounded-2xl
border
border-white/10
bg-slate-900
py-4
pl-14
pr-5
text-white
outline-none
focus:border-blue-500
"

/>


</div>





{/* ================= WORD LIST ================= */}


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
mb-6
"
>


<Brain
className="
text-purple-400
"
/>


<h2
className="
text-3xl
font-black
"
>

Popular Words

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

filteredWords.map(
(item)=>(


<motion.div

key={item.word}

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
justify-between
items-start
"
>


<h3
className="
text-3xl
font-black
"
>

{item.word}

</h3>



<button

className="
rounded-xl
bg-blue-500/20
p-3
"

>

<Volume2
className="
text-blue-400
"
/>


</button>


</div>





<p
className="
mt-4
text-slate-300
"
>

{item.meaning}

</p>




<div
className="
mt-5
rounded-xl
bg-black/30
p-4
"
>


<p
className="
text-sm
text-slate-400
"
>

Example

</p>


<p
className="
mt-2
italic
"
>

"{item.example}"

</p>


</div>





<span

className="
mt-5
inline-block
rounded-full
bg-purple-500/20
px-4
py-2
text-sm
text-purple-300
"

>

{item.level}

</span>



</motion.div>


)

)

}


</div>


</section>






{/* ================= CATEGORY SECTION ================= */}



<section
className="
mt-20
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


<Layers
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

Vocabulary Categories

</h2>


</div>





<div
className="
grid
gap-6
md:grid-cols-2
xl:grid-cols-4
"
>


{

categories.map(
(category)=>(


<motion.div

key={category.title}

whileHover={{
scale:1.03
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
text-xl
font-black
"
>

{category.title}

</h3>



<p
className="
mt-3
text-slate-400
leading-7
"
>

{category.description}

</p>




<div
className="
mt-5
flex
items-center
gap-2
text-blue-400
font-bold
"
>


<BookOpen
size={18}
/>


{category.words}


</div>


</motion.div>


)

)

}


</div>


</section>
{/* ================= DAILY CHALLENGE ================= */}


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
border-yellow-400/20
bg-gradient-to-r
from-yellow-500/10
to-orange-500/10
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


<Trophy
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

Daily Vocabulary Challenge

</h2>


<p
className="
mt-2
text-slate-300
"
>

Learn 10 new words every day and
increase your language level.

</p>


</div>


</div>




<button

className="
rounded-xl
bg-yellow-500
px-6
py-3
font-black
text-black
"

>

Start Challenge

</button>



</div>


</motion.div>


</section>





{/* ================= FLASHCARD PRACTICE ================= */}



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

Smart Flashcards

</h3>


<p
className="
mt-2
text-slate-400
"
>

Remember words faster using
spaced repetition.

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

Practice Flashcards

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
bg-blue-500/20
p-4
"
>


<Brain
className="
text-blue-400
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

AI Vocabulary Coach

</h3>



<p
className="
mt-2
text-slate-400
"
>

Ask AI to explain words,
examples and usage.

</p>



</div>


</div>



<button

className="
mt-6
rounded-xl
bg-blue-600
px-6
py-3
font-bold
"

>

Ask AI

</button>



</motion.div>



</section>





{/* ================= FOOTER MESSAGE ================= */}



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

Master Words.
Master Languages.

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

Vocabulary is the foundation of communication.
Build your word power and unlock the ability
to learn any language in the world.

</p>


</div>





</div>

</section>


);

};



export default Vocabulary;