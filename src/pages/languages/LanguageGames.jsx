import React, {
  useState
} from "react";

import {
  motion
} from "framer-motion";

import {
  Gamepad2,
  Trophy,
  Star,
  Brain,
  Timer,
  Languages,
  Play,
} from "lucide-react";



const LanguageGames = () => {


  const [started,setStarted] = useState(null);



  const games = [

    {
      id:1,
      title:"Word Match",
      description:
      "Match words with their correct meanings.",
      level:"Beginner",
      xp:200,
      icon:"🧩"
    },


    {
      id:2,
      title:"Vocabulary Quiz",
      description:
      "Answer vocabulary questions and earn points.",
      level:"Intermediate",
      xp:500,
      icon:"📚"
    },


    {
      id:3,
      title:"Sentence Builder",
      description:
      "Create correct sentences from mixed words.",
      level:"Intermediate",
      xp:700,
      icon:"✍️"
    },


    {
      id:4,
      title:"Speed Translator",
      description:
      "Translate words before the timer ends.",
      level:"Advanced",
      xp:1000,
      icon:"⚡"
    },


  ];






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
via-purple-600/20
to-pink-600/20
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
bg-purple-500/20
p-4
"

>


<Gamepad2

size={42}

className="
text-purple-400
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

Language Games

</h1>



<p

className="
mt-3
max-w-3xl
leading-8
text-slate-300
"

>

Learn languages through fun games,
competitions and interactive challenges.

</p>


</div>


</div>


</motion.div>
{/* ================= GAME CARDS ================= */}



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


<Play

className="
text-green-400
"

/>



<h2

className="
text-3xl
font-black
"

>

Choose A Game

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

games.map(

(game)=>(


<motion.div

key={game.id}

whileHover={{
y:-10,
scale:1.02
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
text-5xl
"

>

{game.icon}

</div>





<h3

className="
mt-5
text-2xl
font-black
"

>

{game.title}

</h3>




<p

className="
mt-3
leading-7
text-slate-400
"

>

{game.description}

</p>






<div

className="
mt-5
flex
items-center
justify-between
"

>


<span

className="
rounded-full
bg-blue-500/20
px-4
py-2
text-sm
text-blue-300
"

>

{game.level}

</span>



<span

className="
font-black
text-yellow-400
"

>

+{game.xp} XP

</span>



</div>








<button


onClick={()=>setStarted(game.id)}


className="

mt-6
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-purple-600
py-3
font-black

"

>


<Play

size={18}

/>


{

started===game.id

?

"Playing..."

:

"Start Game"

}


</button>



</motion.div>


)

)

}


</div>


</section>









{/* ================= PLAYER STATS ================= */}



<section

className="
mt-14
grid
gap-6
md:grid-cols-3
"

>




<motion.div

whileHover={{
y:-6
}}

className="
rounded-3xl
border
border-white/10
bg-slate-900
p-6
"

>


<Trophy

size={35}

className="
text-yellow-400
"

/>


<h3

className="
mt-5
text-xl
font-black
"

>

Total Score

</h3>



<p

className="
mt-3
text-4xl
font-black
"

>

8500

</p>



</motion.div>








<motion.div

whileHover={{
y:-6
}}

className="
rounded-3xl
border
border-white/10
bg-slate-900
p-6
"

>


<Timer

size={35}

className="
text-cyan-400
"

/>



<h3

className="
mt-5
text-xl
font-black
"

>

Play Time

</h3>


<p

className="
mt-3
text-4xl
font-black
"

>

42h

</p>



</motion.div>








<motion.div

whileHover={{
y:-6
}}

className="
rounded-3xl
border
border-white/10
bg-slate-900
p-6
"

>


<Star

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

Game Level

</h3>


<p

className="
mt-3
text-4xl
font-black
"

>

Gold

</p>



</motion.div>




</section>
{/* ================= MULTIPLAYER ================= */}



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
from-cyan-600/20
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
bg-cyan-500/20
p-4
"

>


<Languages

size={35}

className="
text-cyan-400
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

Global Language Arena

</h2>


<p

className="
mt-2
text-slate-300
"

>

Compete with learners worldwide
and improve together.

</p>


</div>


</div>






<button

className="
mt-6
rounded-xl
bg-cyan-600
px-7
py-3
font-black
"

>

Join Competition

</button>



</motion.div>


</section>








{/* ================= LEADERBOARD ================= */}



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

Top Players

</h2>





<div

className="
space-y-4
"

>


{

[
{
name:"Sofia",
score:"15,400"
},

{
name:"Daniel",
score:"13,900"
},

{
name:"You",
score:"8,500"
}

]

.map(

(player,index)=>(


<motion.div

key={index}

whileHover={{
x:8
}}

className="
flex
items-center
justify-between
rounded-2xl
border
border-white/10
bg-slate-900
p-5
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
flex
h-12
w-12
items-center
justify-center
rounded-full
bg-purple-500/20
font-black
"

>

{index+1}

</div>



<h3

className="
font-black
"

>

{player.name}

</h3>



</div>





<p

className="
font-black
text-yellow-400
"

>

{player.score} XP

</p>



</motion.div>


)

)

}



</div>



</section>








{/* ================= ACHIEVEMENTS ================= */}



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
border-yellow-500/20
bg-yellow-500/10
p-8
"

>


<h2

className="
text-3xl
font-black
"

>

Game Achievements

</h2>



<div

className="
mt-6
flex
flex-wrap
gap-4
"

>


<span

className="
rounded-full
bg-yellow-500/20
px-5
py-2
text-yellow-300
"

>

🏆 Quiz Champion

</span>



<span

className="
rounded-full
bg-blue-500/20
px-5
py-2
text-blue-300
"

>

⚡ Speed Translator

</span>



<span

className="
rounded-full
bg-green-500/20
px-5
py-2
text-green-300
"

>

🌍 Language Explorer

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

Play.
Learn.
Become Fluent.

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

Games make language learning
fun, competitive and memorable.

</p>


</div>






</div>

</section>


);

};



export default LanguageGames;