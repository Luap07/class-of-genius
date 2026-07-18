// src/pages/lms/Profile.jsx

import React, {
  useContext
} from "react";

import {
  Target,
  BookOpen,
  Award,
  Clock3,
  Activity,
  CheckCircle2,
  ArrowRight,
  Flame,
} from "lucide-react";


import ProfileCard from "../../components/lms/ProfileCard";


import {
  useProfile
} from "../../context/LMSContext/ProfileContext";

import {
  AuthContext
} from "../../context/AuthContext";




const Profile = () => {


const {
  profile,
  stats,
  activity,
  loading
}=useProfile();



const {
 user
}=useContext(AuthContext);






if(loading){


return (

<div className="
min-h-[60vh]
flex
items-center
justify-center
">


<div className="
h-12
w-12
rounded-full
border-4
border-blue-500
border-t-transparent
animate-spin
"/>


</div>


);


}








const goals = [

"Complete enrolled courses",

"Finish weekly tasks",

"Complete more lessons",

"Earn next certificate",

];









return (

<div className="space-y-10">







{/* PROFILE */}


<ProfileCard

user={{

name:
profile?.username ||
"Student",


email:
profile?.email ||
user?.email,


level:
profile?.role ||
"Learner",


avatar:
profile?.avatar_url || "",


enrolledCourses:
stats.courses,


completedCourses:
stats.completedCourses,


certificates:
stats.certificates,


studyHours:
stats.lessonsCompleted,

}}


onEdit={()=>
console.log(
"Edit Profile"
)
}


/>











{/* QUICK STATS */}


<div className="
grid
md:grid-cols-2
xl:grid-cols-4
gap-6
">



<StatCard

icon={
<BookOpen
className="text-blue-400"
/>
}

title="Courses"

value={
stats.courses
}

/>



<StatCard

icon={
<Award
className="text-yellow-400"
/>
}

title="Certificates"

value={
stats.certificates
}

/>




<StatCard

icon={
<CheckCircle2
className="text-green-400"
/>
}

title="Lessons Completed"

value={
stats.lessonsCompleted
}

/>





<StatCard

icon={
<Flame
className="text-red-400"
/>
}

title="Submissions"

value={
stats.submissions
}

/>



</div>









{/* GOALS + ACTIVITY */}



<div className="
grid
xl:grid-cols-2
gap-8
">







{/* GOALS */}


<div className="
rounded-3xl
bg-slate-900
border
border-slate-800
p-8
">


<div className="
flex
items-center
gap-3
mb-6
">

<Target
className="text-green-400"
/>


<h2 className="
text-2xl
font-bold
">

Current Goals

</h2>


</div>





<div className="space-y-4">


{
goals.map(goal=>(


<div

key={goal}

className="
flex
items-center
justify-between
rounded-2xl
bg-slate-950
border
border-slate-800
p-4
"

>


<div className="
flex
items-center
gap-3
">


<CheckCircle2
className="text-green-400"
/>


{goal}


</div>


<ArrowRight
size={18}
/>


</div>


))


}



</div>


</div>









{/* ACTIVITY */}



<div className="
rounded-3xl
bg-slate-900
border
border-slate-800
p-8
">


<div className="
flex
items-center
gap-3
mb-6
">


<Activity
className="text-blue-400"
/>


<h2 className="
text-2xl
font-bold
">

Recent Activity

</h2>


</div>







<div className="space-y-5">


{

activity.length > 0 ?


activity.map(item=>(


<div

key={item.id}

className="
rounded-2xl
bg-slate-950
border
border-slate-800
p-5
"

>


<h3 className="
font-semibold
text-lg
">

{item.title}

</h3>



<p className="
text-slate-400
mt-2
">

{item.description}

</p>



<p className="
text-xs
text-slate-500
mt-3
">

{
new Date(
item.date
)
.toLocaleDateString()

}

</p>


</div>


))


:

<p className="text-slate-400">

No activity yet.

</p>



}



</div>


</div>






</div>



</div>


);


};






const StatCard=({
icon,
title,
value
})=>(


<div className="
rounded-3xl
bg-slate-900
border
border-slate-800
p-6
">


<div className="mb-5">

{icon}

</div>


<h2 className="
text-3xl
font-bold
">

{value}

</h2>


<p className="
text-slate-400
mt-2
">

{title}

</p>


</div>


);



export default Profile;