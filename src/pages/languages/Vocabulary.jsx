import React, {
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  Brain,
  Search,
  Sparkles,
  Trophy,
  Layers,
} from "lucide-react";

import {
  motion
} from "framer-motion";


import wordOfTheDay from "../../data/language/wordOfTheDay";



const Vocabulary = () => {


  const [
    search,
    setSearch
  ] = useState("");




  const categories = [

    {
      title:
      "Daily Words",

      description:
      "Common words used in everyday conversations.",

      words:
      "5000+ Words"
    },


    {
      title:
      "Academic Vocabulary",

      description:
      "Improve vocabulary for school and university.",

      words:
      "3000+ Words"
    },


    {
      title:
      "Business Vocabulary",

      description:
      "Professional words for workplace communication.",

      words:
      "2000+ Words"
    },


    {
      title:
      "Travel Vocabulary",

      description:
      "Useful words for travelling around the world.",

      words:
      "1500+ Words"
    },

  ];






  // ================= WEEKLY WORD SELECTION =================


  const words = useMemo(() => {


    if (
      !Array.isArray(wordOfTheDay) ||
      wordOfTheDay.length === 0
    ) {

      return [];

    }




    const today = new Date();



    const startOfYear =
      new Date(
        today.getFullYear(),
        0,
        1
      );




    const weekNumber =
      Math.floor(

        (

          (
            today -
            startOfYear
          )
          /
          (1000 * 60 * 60 * 24)

          +
          startOfYear.getDay()

        )
        /
        7

      );





    const startIndex =
      (weekNumber * 6)
      %
      wordOfTheDay.length;





    const selected = [];



    for (
      let i = 0;
      i < 6;
      i++
    ) {


      selected.push(

        wordOfTheDay[
          (startIndex + i)
          %
          wordOfTheDay.length
        ]

      );


    }





    return selected.map(
      (item)=>({

        word:
        item.word,


        meaning:
        item.meaning ||
        "Meaning not available",



        example:
        item.example ||
        "Example not available",



        level:
        item.level ||
        item.difficulty ||
        "Beginner",



        language:
        item.language ||
        "Vocabulary"

      })
    );



  }, []);






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


transition={{
duration:0.5
}}


className="
rounded-[32px]
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
rounded-3xl
bg-blue-500/20
p-5
"

>


<BookOpen

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

Vocabulary Mastery

</h1>



<p

className="
mt-4
max-w-3xl
leading-8
text-slate-300
"

>

Build your vocabulary with
weekly selected words,
meanings, examples and
language practice.

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

size={22}

className="
absolute
left-5
top-1/2
-translate-y-1/2
text-slate-400
"

/>



<input


value={
search
}


onChange={
(e)=>
setSearch(
e.target.value
)
}


placeholder="
Search vocabulary...
"


className="
w-full
rounded-2xl
border
border-white/10
bg-slate-900
py-5
pl-14
pr-6
text-white
outline-none
transition
focus:border-blue-500
"


/>



</div>







{/* ================= WEEKLY WORDS ================= */}



<section

className="
mt-14
"

>



<div

className="
mb-8
flex
items-center
gap-3
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

Weekly Vocabulary

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


key={
item.word
}



whileHover={{
y:-8
}}



transition={{
duration:0.25
}}



className="
rounded-[30px]
border
border-white/10
bg-slate-900
p-7
shadow-xl
"



>



<div

className="
flex
items-start
justify-between
gap-4
"

>



<div>


<h3

className="
text-3xl
font-black
"

>

{item.word}

</h3>



<span

className="
mt-3
inline-flex
rounded-full
bg-blue-500/20
px-4
py-2
text-sm
font-bold
text-blue-300
"

>

{item.level}

</span>



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
font-bold
text-cyan-300
"

>

Meaning

</p>



<p

className="
mt-2
leading-7
text-slate-300
"

>

{item.meaning}

</p>



</div>







<div

className="
mt-5
rounded-2xl
border
border-white/10
bg-white/5
p-5
"

>


<p

className="
text-sm
font-bold
text-purple-300
"

>

Example

</p>



<p

className="
mt-2
italic
leading-7
text-slate-300
"

>

"{item.example}"

</p>



</div>





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
mb-8
flex
items-center
gap-3
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


key={
category.title
}



whileHover={{
scale:1.04
}}



className="
rounded-[28px]
border
border-white/10
bg-slate-900
p-7
transition
"



>



<div

className="
flex
h-14
w-14
items-center
justify-center
rounded-2xl
bg-cyan-500/10
"

>


<BookOpen

size={26}

className="
text-cyan-400
"

/>



</div>





<h3

className="
mt-6
text-xl
font-black
"

>

{category.title}

</h3>





<p

className="
mt-3
leading-7
text-slate-400
"

>

{category.description}

</p>





<div

className="
mt-5
font-bold
text-blue-400
"

>


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
y:-5
}}



className="
rounded-[32px]
border
border-yellow-400/20
bg-gradient-to-br
from-yellow-500/10
to-orange-500/10
p-10
"

>



<div

className="
flex
items-center
gap-6
"

>



<div

className="
rounded-3xl
bg-yellow-500/20
p-5
"

>



<Trophy

size={42}

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
mt-3
leading-7
text-slate-300
"

>

Review today's selected words,
practice their meanings and
use them in your own sentences.

</p>



</div>



</div>




</motion.div>



</section>







{/* ================= LEARNING MESSAGE ================= */}



<section

className="
mt-16
"

>



<motion.div


whileHover={{
y:-5
}}
className="
rounded-[32px]
border
border-white/10
bg-gradient-to-br
from-slate-900
via-slate-900
to-slate-800
p-10
text-center
"
>
<div

className="
mx-auto
flex
h-16
w-16
items-center
justify-center
rounded-3xl
bg-purple-500/20
"
>

<Sparkles

size={34}

className="
text-purple-400
"

/>

</div>

<h2

className="
mt-7
text-3xl
font-black
"
>

Grow Your Word Power

</h2>

<p
className="
mx-auto
mt-4
max-w-3xl
leading-8
text-slate-300
"
>
A strong vocabulary helps you
communicate clearly, understand
new ideas and master any language
you choose to learn.
</p>
</motion.div>
</section>
</div>
</section>
  );

};

export default Vocabulary;