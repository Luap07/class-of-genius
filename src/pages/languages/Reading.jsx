import React, {
  useState
} from "react";

import {
  motion
} from "framer-motion";

import {
  BookOpen,
  Search,
  Globe,
  Clock,
  Award,
  Bookmark,
  Languages,
} from "lucide-react";



const Reading = () => {


  const [search,setSearch] = useState("");



  const articles = [

    {
      id:1,
      title:"The Future of Technology",
      language:"English",
      level:"Intermediate",
      duration:"8 min",
      category:"Technology"
    },


    {
      id:2,
      title:"La Vie Quotidienne",
      language:"French",
      level:"Beginner",
      duration:"5 min",
      category:"Daily Life"
    },


    {
      id:3,
      title:"日本の文化",
      language:"Japanese",
      level:"Advanced",
      duration:"12 min",
      category:"Culture"
    },


    {
      id:4,
      title:"La Historia del Mundo",
      language:"Spanish",
      level:"Intermediate",
      duration:"10 min",
      category:"History"
    },

  ];



  const filteredArticles =
  articles.filter(
    item =>
    item.title
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


<BookOpen

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

Reading Practice

</h1>


<p
className="
mt-3
max-w-3xl
leading-8
text-slate-300
"
>

Improve your vocabulary,
grammar and comprehension by
reading articles and stories
from different cultures.

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

size={20}

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

placeholder="Search reading materials..."

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
focus:border-green-500
"

/>


</div>






{/* ================= READING LIBRARY ================= */}



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


<Languages

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

Reading Library

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

filteredArticles.map(

(article)=>(


<motion.div


key={article.id}


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

{article.title}

</h3>


<p

className="
mt-2
text-slate-400
"

>

{article.language}

</p>


</div>




<button

className="
rounded-xl
bg-blue-500/20
p-3
"

>


<Bookmark

size={20}

className="
text-blue-400
"

/>


</button>



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
text-sm
text-green-300
"

>

{article.level}

</span>



<span

className="
flex
items-center
gap-2
rounded-full
bg-slate-800
px-4
py-2
text-sm
text-slate-300
"

>


<Clock

size={15}
/>


{article.duration}


</span>



</div>






<p

className="
mt-5
text-sm
text-slate-400
"

>

Category:
<span className="text-white">

{article.category}

</span>

</p>





<button

className="
mt-6
w-full
rounded-xl
bg-green-600
py-3
font-bold
"

>

Start Reading

</button>




</motion.div>


)

)

}


</div>


</section>
{/* ================= READING PROGRESS ================= */}



<section

className="
mt-16
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
from-green-600/20
to-cyan-600/20
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


<div>


<h2

className="
text-3xl
font-black
"

>

Reading Progress

</h2>


<p

className="
mt-3
max-w-xl
text-slate-300
leading-7
"

>

Track completed articles,
new vocabulary learned and
your reading improvement.

</p>


</div>





<div

className="
rounded-2xl
bg-black/30
px-8
py-5
text-center
"

>


<p

className="
text-sm
text-slate-400
"

>

Articles Completed

</p>


<h3

className="
mt-2
text-4xl
font-black
"

>

24

</h3>


</div>



</div>


</motion.div>


</section>







{/* ================= COMPREHENSION ================= */}



<section

className="
mt-12
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

Reading Quiz

</h3>



<p

className="
mt-3
text-slate-400
leading-7
"

>

Answer questions after reading
to test your understanding.

</p>



<button

className="
mt-6
rounded-xl
bg-green-600
px-6
py-3
font-bold
"

>

Take Quiz

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


<h3

className="
text-2xl
font-black
"

>

AI Reading Assistant

</h3>



<p

className="
mt-3
text-slate-400
leading-7
"

>

Ask AI to explain difficult words,
summarize articles and improve
your understanding.

</p>



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

Read More.
Learn More.

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

Reading exposes learners to new ideas,
cultures and vocabulary while building
strong communication skills.

</p>



</div>






</div>

</section>


);

};



export default Reading;