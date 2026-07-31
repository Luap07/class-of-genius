import React from "react";



export default function LoadingLanguages({

  count = 6,

}) {


return (

<div

className="
grid
gap-6
md:grid-cols-2
xl:grid-cols-3
"

>


{

Array.from({ length: count }).map((_,index)=>(


<div

key={index}

className="
animate-pulse
rounded-3xl
border
border-slate-800
bg-slate-900/80
p-6
"

>


{/* HEADER SKELETON */}

<div

className="
flex
items-center
gap-4
"

>


<div

className="
h-14
w-14
rounded-2xl
bg-slate-800
"

/>




<div

className="
flex-1
"

>


<div

className="
h-5
w-32
rounded-lg
bg-slate-800
"

/>



<div

className="
mt-2
h-3
w-16
rounded-lg
bg-slate-800
"

/>


</div>



</div>








{/* DESCRIPTION */}

<div

className="
mt-6
space-y-3
"

>


<div

className="
h-3
w-full
rounded-lg
bg-slate-800
"

/>



<div

className="
h-3
w-4/5
rounded-lg
bg-slate-800
"

/>



<div

className="
h-3
w-2/3
rounded-lg
bg-slate-800
"

/>



</div>









{/* STATS */}

<div

className="
mt-6
grid
grid-cols-2
gap-4
"

>


<div

className="
h-20
rounded-2xl
bg-slate-800
"

/>


<div

className="
h-20
rounded-2xl
bg-slate-800
"

/>


</div>









{/* BUTTONS */}

<div

className="
mt-6
flex
gap-3
"

>


<div

className="
h-12
flex-1
rounded-2xl
bg-slate-800
"

/>


<div

className="
h-12
flex-1
rounded-2xl
bg-slate-800
"

/>


</div>





</div>


))

}



</div>


);


}