// src/components/courses/CategoryCard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  FlaskConical,
  FolderOpen,
} from "lucide-react";


export default function CategoryCard({
  category,
  onClick,
}) {


return (

<motion.div

whileHover={{
  y:-12,
  scale:1.02,
}}

whileTap={{
 scale:0.98
}}

onClick={onClick}

className="
group
relative
cursor-pointer
overflow-hidden
rounded-[34px]
border
border-slate-800
bg-slate-900/70
backdrop-blur-xl
transition-all
duration-300
"


>


{/* Gradient */}

<div

className={`
absolute
inset-0
bg-gradient-to-br
${category.color || "from-cyan-500 to-blue-600"}
opacity-0
group-hover:opacity-100
transition
duration-700
`}

/>



{/* Glow */}

<div

className={`
absolute
-right-24
-top-24
h-72
w-72
rounded-full
bg-gradient-to-br
${category.color || "from-cyan-500 to-blue-600"}
opacity-20
blur-[140px]
`}

/>



<div className="
relative
z-10
p-8
">


{/* Icon */}

<div

className={`
flex
h-20
w-20
items-center
justify-center
rounded-3xl
bg-gradient-to-br
${category.color || "from-cyan-500 to-blue-600"}
`}

>


<FolderOpen
size={38}
className="text-white"
/>


</div>




{/* Name */}

<h2 className="
mt-8
text-3xl
font-black
">

{category.name}


</h2>



<p className="
mt-4
leading-8
text-slate-300
">

{category.description || 
"Explore courses in this learning category."}


</p>



{/* Stats */}

<div className="
mt-8
grid
grid-cols-2
gap-4
">


<div className="
rounded-2xl
border
border-slate-700
bg-slate-800/60
p-4
">

<p className="
text-sm
text-slate-400
">

Type

</p>


<h3 className="
mt-2
text-xl
font-black
text-cyan-400
">

{category.type || "Academic"}

</h3>


</div>




<div className="
rounded-2xl
border
border-slate-700
bg-slate-800/60
p-4
">


<p className="
text-sm
text-slate-400
">

Subject

</p>


<h3 className="
mt-2
text-xl
font-black
text-cyan-400
">

{category.subject_area || "General"}

</h3>


</div>


</div>




{/* Features */}

<div className="
mt-8
flex
flex-wrap
gap-3
">


{category.featured && (

<div className="
flex
items-center
gap-2
rounded-full
bg-cyan-500/10
px-4
py-2
">

<Brain
size={16}
className="text-cyan-400"
/>


<span className="
text-sm
font-semibold
text-cyan-300
">

Featured

</span>


</div>

)}



<div className="
flex
items-center
gap-2
rounded-full
bg-emerald-500/10
px-4
py-2
">


<FlaskConical
size={16}
className="text-emerald-400"
/>


<span className="
text-sm
font-semibold
text-emerald-300
">

Learning Path

</span>


</div>



</div>





{/* Button */}

<motion.button

whileHover={{
x:5
}}

className="
mt-10
flex
w-full
items-center
justify-between
rounded-2xl
border
border-cyan-500/20
bg-cyan-500/10
px-6
py-4
font-semibold
text-cyan-300
"


>

<span>
Browse Courses
</span>


<ArrowRight size={20}/>


</motion.button>


</div>


</motion.div>


);


}