import React from "react";



const styles = {

  Active:
    "bg-green-500/10 text-green-400 border-green-500/20",

  Inactive:
    "bg-red-500/10 text-red-400 border-red-500/20",

  Draft:
    "bg-slate-700 text-slate-300 border-slate-600",

  Published:
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",

  Beginner:
    "bg-blue-500/10 text-blue-400 border-blue-500/20",

  Intermediate:
    "bg-purple-500/10 text-purple-400 border-purple-500/20",

  Advanced:
    "bg-orange-500/10 text-orange-400 border-orange-500/20",

};





export default function LanguageBadge({

  children,

  type = "Active",

}) {



const badgeStyle =
styles[type] || styles.Active;



return (

<span

className={`
inline-flex
items-center
rounded-full
border
px-3
py-1
text-xs
font-bold
${badgeStyle}
`}

>

{children}

</span>

);


}