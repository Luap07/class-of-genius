import React from "react";


import {
  Languages,
  CheckCircle,
  BookOpen,
  Users,
} from "lucide-react";


import {
  motion,
} from "framer-motion";





export default function LanguageStats({

  languages = [],

}) {





const stats = [



{
  title:"Total Languages",

  value:languages.length,

  icon:Languages,

},




{
  title:"Active Languages",

  value:
  languages.filter(
    item=>item.status==="Active"
  ).length,

  icon:CheckCircle,

},




{
  title:"Total Lessons",

  value:
  languages.reduce(
    total =>
    total,
    0
  ),

  icon:BookOpen,

},




{
  title:"Speakers",

  value:
  languages.reduce(

    (total,item)=>

    total +
    Number(item.speakers || 0),

    0

  ),

  icon:Users,

},



];







return (

<div

className="
mb-10
grid
gap-6
md:grid-cols-2
xl:grid-cols-4
"

>



{

stats.map(
(stat,index)=>{


const Icon =
stat.icon;



return (


<motion.div


key={
stat.title
}



initial={{

opacity:0,

y:20

}}



animate={{

opacity:1,

y:0

}}



transition={{

delay:index * 0.1

}}



className="
rounded-3xl
border
border-slate-800
bg-slate-900/80
p-6
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
text-cyan-400
"

>


<Icon size={28}/>


</div>







<h2

className="
mt-5
text-3xl
font-black
text-white
"

>

{stat.value}

</h2>







<p

className="
mt-2
text-sm
text-slate-400
"

>

{stat.title}

</p>





</motion.div>



)


}

)

}




</div>


);


}