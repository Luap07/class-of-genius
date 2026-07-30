import React, {
  useState
} from "react";

import {
  motion
} from "framer-motion";

import {
  PenTool,
  Sparkles,
  FileText,
  CheckCircle,
  Languages,
  Brain,
} from "lucide-react";



const Writing = () => {


  const [text,setText] = useState("");

  const [feedback,setFeedback] = useState("");



  const writingTasks = [

    {
      title:"Daily Journal",
      description:"Write about your day using new vocabulary."
    },


    {
      title:"Story Writing",
      description:"Create short stories and improve creativity."
    },


    {
      title:"Formal Writing",
      description:"Practice emails, essays and professional writing."
    },


    {
      title:"Creative Writing",
      description:"Express your ideas through poems and stories."
    },


  ];





  const checkWriting = ()=>{


    if(!text){

      setFeedback(
        "Start writing something first."
      );

      return;

    }


    setFeedback(
      "AI analysis completed. Your writing structure looks good. Keep practicing to improve fluency."
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
from-purple-600/20
via-blue-600/20
to-cyan-600/20
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


<PenTool

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

Writing Practice

</h1>


<p

className="
mt-3
max-w-3xl
text-slate-300
leading-8
"

>

Improve your writing skills with
AI corrections, grammar checks,
and creative exercises.

</p>


</div>


</div>


</motion.div>
{/* ================= WRITING EDITOR ================= */}



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
gap-3
mb-6
"

>


<FileText

className="
text-blue-400
"

/>



<h2

className="
text-3xl
font-black
"

>

Writing Workspace

</h2>


</div>





<textarea


value={text}


onChange={
e=>setText(
e.target.value
)
}


placeholder="
Write your paragraph, essay or story here...
"


className="
min-h-[250px]
w-full
resize-none
rounded-2xl
border
border-white/10
bg-slate-800
p-6
text-white
outline-none
focus:border-blue-500
"

>




</textarea>






<div

className="
mt-6
flex
flex-wrap
gap-4
"

>



<button

onClick={checkWriting}


className="
flex
items-center
gap-2
rounded-xl
bg-blue-600
px-6
py-3
font-bold
"

>


<Sparkles

size={18}

/>


Check With AI


</button>





<button

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


<Languages

size={18}

/>


Translate


</button>




</div>






{

feedback &&

<div

className="
mt-6
rounded-2xl
border
border-green-500/20
bg-green-500/10
p-5
text-green-300
"

>


{feedback}


</div>


}



</motion.div>


</section>








{/* ================= WRITING TASKS ================= */}



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

Writing Challenges

</h2>




<div

className="
grid
gap-6
md:grid-cols-2
"

>


{

writingTasks.map(

(task,index)=>(


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
gap-4
"

>


<div

className="
rounded-2xl
bg-purple-500/20
p-3
"

>


<PenTool

className="
text-purple-400
"

/>


</div>



<div>


<h3

className="
text-xl
font-black
"

>

{task.title}

</h3>


<p

className="
mt-2
text-slate-400
"

>

{task.description}

</p>


</div>


</div>





<button

className="
mt-5
rounded-xl
bg-purple-600
px-5
py-2
font-bold
"

>

Start Task

</button>



</motion.div>


)

)


}


</div>


</section>
{/* ================= AI WRITING COACH ================= */}



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
from-blue-600/20
to-indigo-600/20
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

size={32}

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

AI Writing Coach

</h3>


<p

className="
mt-2
text-slate-300
"

>

Get suggestions for better words,
sentence structure and writing style.

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

Open AI Coach

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


<CheckCircle

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

Grammar Improvement

</h3>


<p

className="
mt-2
text-slate-300
"

>

Fix grammar mistakes and learn
why corrections are needed.

</p>


</div>


</div>





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

Improve Grammar

</button>



</motion.div>




</section>








{/* ================= ACHIEVEMENT ================= */}



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

Writing Achievement

</h2>


<p

className="
mt-3
text-slate-300
leading-7
"

>

Complete writing exercises,
practice consistently and unlock
language writing badges.

</p>



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

✍️ Beginner Writer

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

📚 Essay Builder

</span>


<span

className="
rounded-full
bg-purple-500/20
px-5
py-2
text-purple-300
"

>

🌎 Global Communicator

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

Write Your Ideas.
Share Your World.

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

Writing helps learners communicate,
create stories and express ideas
in any language.

</p>


</div>






</div>

</section>


);

};



export default Writing;