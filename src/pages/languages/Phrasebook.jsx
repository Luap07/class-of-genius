import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  Search,
  Globe,
  Mic,
  Volume2,
  Star,
  Languages,
  BookOpen,
  Copy,
  Sparkles,
  Check,
} from "lucide-react";


const categories = [
  "All",
  "Greetings",
  "Travel",
  "Restaurant",
  "Shopping",
  "School",
  "Business",
  "Hospital",
  "Airport",
  "Hotel",
  "Emergency",
];


const phrases = [

{
id:1,
category:"Greetings",
english:"Good morning",
translation:"Buenos días",
pronunciation:"BWEH-nos DEE-ahs",
tip:"Used when greeting someone in the morning."
},

{
id:2,
category:"Greetings",
english:"How are you?",
translation:"¿Cómo estás?",
pronunciation:"KOH-moh es-TAHS",
tip:"A common friendly greeting."
},

{
id:3,
category:"Travel",
english:"Where is the bus station?",
translation:"¿Dónde está la estación de autobuses?",
pronunciation:"DON-de es-TA la es-ta-syon",
tip:"Useful when moving around a new city."
},

{
id:4,
category:"Restaurant",
english:"I would like to order.",
translation:"Me gustaría pedir.",
pronunciation:"Me gus-ta-REE-a pe-DEER",
tip:"Use this when ordering food."
},

{
id:5,
category:"Shopping",
english:"How much is this?",
translation:"¿Cuánto cuesta esto?",
pronunciation:"KWAN-to KWES-ta ES-to",
tip:"Helpful when buying items."
},

{
id:6,
category:"Hotel",
english:"I have a reservation.",
translation:"Tengo una reserva.",
pronunciation:"TEN-go OO-na re-ser-va",
tip:"Used when checking into hotels."
},

{
id:7,
category:"Airport",
english:"Where is the departure gate?",
translation:"¿Dónde está la puerta de salida?",
pronunciation:"DON-de es-TA la PWER-ta",
tip:"Useful before boarding flights."
},

{
id:8,
category:"Emergency",
english:"I need help.",
translation:"Necesito ayuda.",
pronunciation:"Ne-se-SI-to a-yu-da",
tip:"Important emergency phrase."
},

{
id:9,
category:"School",
english:"I don't understand.",
translation:"No entiendo.",
pronunciation:"No en-TYEN-do",
tip:"Use when you need an explanation."
},

{
id:10,
category:"Business",
english:"Nice to meet you.",
translation:"Mucho gusto.",
pronunciation:"MOO-cho GOOS-to",
tip:"Professional introduction phrase."
},

];


export default function Phrasebook(){


const [search,setSearch]=useState("");

const [category,setCategory]=useState("All");

const [favorites,setFavorites]=useState([]);

const [copied,setCopied]=useState(null);



const filtered = useMemo(()=>{

return phrases.filter(item=>{


const categoryMatch =
category==="All" ||
item.category===category;


const searchMatch =
item.english
.toLowerCase()
.includes(search.toLowerCase())

||
item.translation
.toLowerCase()
.includes(search.toLowerCase());


return categoryMatch && searchMatch;


});


},[search,category]);



const toggleFavorite=(id)=>{

setFavorites(prev=>

prev.includes(id)

?
prev.filter(x=>x!==id)

:
[...prev,id]

);

};



const speak=(text)=>{

const speech =
new SpeechSynthesisUtterance(text);

speech.lang="en-US";

window.speechSynthesis.speak(speech);

};



const copyText=(text,id)=>{

navigator.clipboard.writeText(text);

setCopied(id);

setTimeout(()=>{

setCopied(null);

},1500);

};



return (

<div className="
min-h-screen
bg-[#020617]
text-white
overflow-hidden
">
  {/* HERO SECTION */}

<section
className="
relative
border-b
border-white/10
overflow-hidden
"
>

<div
className="
absolute
inset-0
bg-gradient-to-br
from-cyan-500/10
via-transparent
to-purple-500/10
"
/>


<div
className="
relative
mx-auto
max-w-7xl
px-6
py-24
"
>


<motion.div

initial={{
opacity:0,
y:40
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:0.7
}}

>


<div
className="
inline-flex
items-center
gap-3
rounded-full
border
border-cyan-400/30
bg-cyan-400/10
px-6
py-3
text-cyan-300
font-bold
"
>

<Languages size={20}/>

Premium Phrasebook

</div>



<h1
className="
mt-8
max-w-5xl
text-5xl
md:text-7xl
font-black
leading-tight
"
>

Speak Any Language
<br/>

<span
className="
bg-gradient-to-r
from-cyan-400
to-purple-400
bg-clip-text
text-transparent
"
>
Like A Native
</span>

</h1>



<p
className="
mt-8
max-w-3xl
text-lg
leading-9
text-slate-400
"
>

Master everyday conversations with
real-world phrases for travel,
business, education, emergencies,
and daily communication.

</p>


</motion.div>


</div>

</section>



{/* SEARCH */}


<section
className="
mx-auto
max-w-7xl
px-6
mt-12
"
>


<div
className="
relative
"
>


<Search

size={22}

className="
absolute
left-6
top-6
text-slate-500
"

/>



<input

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

placeholder="
Search phrase, translation...
"

className="
w-full
rounded-3xl
border
border-white/10
bg-slate-900/80
backdrop-blur-xl
py-6
pl-16
pr-6
text-lg
outline-none
focus:border-cyan-400
transition
"

/>


</div>


</section>




{/* CATEGORY FILTER */}


<section
className="
mx-auto
max-w-7xl
px-6
mt-10
"
>


<div
className="
flex
flex-wrap
gap-3
"
>


{
categories.map(item=>(


<motion.button

whileTap={{
scale:.95
}}

key={item}

onClick={()=>
setCategory(item)
}

className={`
rounded-full
px-6
py-3
font-bold
transition

${
category===item

?

"bg-cyan-400 text-black shadow-lg shadow-cyan-400/30"

:

"bg-slate-900 border border-white/10 text-slate-300 hover:border-cyan-400"

}

`}

>

{item}

</motion.button>


))

}


</div>


</section>





{/* STATS */}


<section
className="
mx-auto
max-w-7xl
px-6
mt-14
"
>


<div
className="
grid
gap-6
md:grid-cols-4
"
>


{


[

{
icon:<Globe/>,
number:"100+",
title:"Languages"
},

{
icon:<BookOpen/>,
number:"50K+",
title:"Phrases"
},

{
icon:<Mic/>,
number:"AI",
title:"Speaking Practice"
},

{
icon:<Sparkles/>,
number:"24/7",
title:"Learning"
}


].map((item,index)=>(


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
p-8
shadow-xl
"

>


<div
className="
text-cyan-400
"
>

{item.icon}

</div>



<h2
className="
mt-6
text-4xl
font-black
"
>

{item.number}

</h2>



<p
className="
mt-2
text-slate-400
"
>

{item.title}

</p>


</motion.div>


))

}



</div>


</section>
{/* PHRASE LIST */}


<section
className="
mx-auto
max-w-7xl
px-6
mt-20
pb-20
"
>


<div
className="
mb-10
flex
flex-col
md:flex-row
md:items-center
md:justify-between
gap-5
"
>


<div>


<h2
className="
text-4xl
font-black
"
>

Everyday Conversations

</h2>


<p
className="
mt-3
text-slate-400
"
>

Learn expressions used in real conversations.

</p>


</div>



<div
className="
rounded-full
bg-cyan-400/10
border
border-cyan-400/20
px-6
py-3
text-cyan-300
font-bold
"
>

{filtered.length} Phrases

</div>


</div>





<div
className="
grid
gap-8
"
>


{

filtered.map((phrase)=>(


<motion.div


key={phrase.id}


initial={{
opacity:0,
y:30
}}


animate={{
opacity:1,
y:0
}}


whileHover={{
y:-8
}}


transition={{
duration:.3
}}


className="
overflow-hidden
rounded-3xl
border
border-white/10
bg-slate-900
shadow-2xl
"


>



{/* CARD HEADER */}


<div
className="
flex
items-center
justify-between
border-b
border-white/10
px-8
py-6
"
>


<span
className="
rounded-full
bg-cyan-400/10
border
border-cyan-400/20
px-5
py-2
text-sm
font-bold
text-cyan-300
"
>

{phrase.category}

</span>



<button

onClick={()=>
toggleFavorite(phrase.id)
}

className="
rounded-full
p-3
hover:bg-yellow-400/10
transition
"

>


<Star

size={22}

className={

favorites.includes(phrase.id)

?

"text-yellow-400 fill-yellow-400"

:

"text-slate-400"

}

/>


</button>


</div>






{/* CONTENT */}


<div
className="
grid
gap-10
lg:grid-cols-2
p-8
"
>



{/* ENGLISH */}


<div>


<p
className="
text-xs
uppercase
tracking-[0.3em]
text-slate-500
"
>

English

</p>


<h3
className="
mt-5
text-4xl
font-black
leading-tight
"
>

{phrase.english}

</h3>




<div
className="
mt-10
"
>


<p
className="
text-xs
uppercase
tracking-[0.3em]
text-slate-500
"
>

Pronunciation

</p>


<p
className="
mt-4
text-xl
font-semibold
text-cyan-300
"
>

{phrase.pronunciation}

</p>


</div>


</div>






{/* TRANSLATION */}



<div>


<p
className="
text-xs
uppercase
tracking-[0.3em]
text-slate-500
"
>

Translation

</p>



<h3
className="
mt-5
text-4xl
font-black
text-green-400
leading-tight
"
>

{phrase.translation}

</h3>




<div
className="
mt-8
rounded-2xl
bg-slate-800
p-6
"
>


<div
className="
flex
items-center
gap-2
text-purple-300
font-bold
"
>

<Sparkles size={18}/>

AI Learning Tip

</div>



<p
className="
mt-4
leading-8
text-slate-400
"
>

{phrase.tip}

</p>


</div>


</div>



</div>






{/* ACTION BAR */}


<div
className="
flex
flex-wrap
gap-4
border-t
border-white/10
p-6
"
>


<button

onClick={()=>
speak(phrase.english)
}

className="
flex
items-center
gap-2
rounded-xl
bg-cyan-500
px-6
py-3
font-bold
text-black
hover:scale-105
transition
"

>

<Volume2 size={18}/>

Listen

</button>





<button

onClick={()=>
speak(phrase.translation)
}

className="
flex
items-center
gap-2
rounded-xl
bg-green-500
px-6
py-3
font-bold
text-black
hover:scale-105
transition
"

>


<Mic size={18}/>

Practice

</button>





<button

onClick={()=>
copyText(
phrase.translation,
phrase.id
)
}

className="
flex
items-center
gap-2
rounded-xl
bg-slate-800
px-6
py-3
font-bold
"

>


{

copied===phrase.id

?

<>

<Check size={18}/>

Copied

</>


:

<>

<Copy size={18}/>

Copy

</>

}


</button>





<button

className="
rounded-xl
bg-purple-600
px-6
py-3
font-bold
hover:bg-purple-500
transition
"

>

Explain With AI

</button>



</div>




</motion.div>


))

}


</div>


</section>

{/* PREMIUM FOOT NOTE */}
<section
className="
mx-auto
max-w-7xl
px-6
pb-20
"
>


<motion.div

initial={{
opacity:0,
y:30
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

className="
rounded-3xl
border
border-white/10
bg-gradient-to-r
from-cyan-500/10
via-purple-500/10
to-transparent
p-10
"

>


<div
className="
flex
flex-col
md:flex-row
items-center
justify-between
gap-8
"
>


<div>


<h2
className="
text-3xl
font-black
"
>

Master Languages Faster

</h2>


<p
className="
mt-3
max-w-2xl
text-slate-400
leading-8
"
>

Practice phrases daily,
improve pronunciation,
and build confidence in real conversations.

</p>


</div>



<div
className="
flex
items-center
gap-3
rounded-full
bg-cyan-400
px-7
py-4
font-black
text-black
"
>

<Languages size={22}/>

Start Learning

</div>


</div>


</motion.div>


</section>



</div>


);

}