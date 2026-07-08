// src/pages/lms/Dashboard.jsx

import React from "react";
import { motion } from "framer-motion";

import {
  BookOpen,CheckCircle2,Clock3,Trophy,Flame,TrendingUp, CalendarDays,PlayCircle} from "lucide-react";


// CONTEXTS

import { useCourses } from "../../context/LMSContext/CourseContext";
import { useProgress } from "../../context/LMSContext/ProgressContext";
import { useWeeklyTasks } from "../../context/LMSContext/WeeklyTaskContext";
import { useCertificates } from "../../context/LMSContext/CertificateContext";
import { useAchievements } from "../../context/LMSContext/AchievementContext";
import Footer from "../../components/lms/Footer"


/* ============================
   GLASS CARD
============================ */

const GlassCard = ({children,className=""}) => {

return (

<div
className={`bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md ${className}`}>
{children}
</div>
)
}

/* ============================STAT CARD============================ */

const StatCard = ({title,value,icon:Icon}) => {

return (
<motion.div whileHover={{y:-5 }}
    className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
<div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
<Icon size={28} />
</div>
<p className="text-slate-400 mt-5">{title}</p>
<h2 className="text-3xl font-bold mt-2 ">{value}</h2>
</motion.div>
)}

/* ============================DASHBOARD============================ */
const Dashboard = () => {

const {totalCourses = 0} = useCourses() || {};

const {
currentLearning = [],
weeklyProgress = [],
totalCompletedLessons = 0,
studyHours = 0,
completeLesson = ()=>{}
} = useProgress() || {};

const { tasks = [] } = useWeeklyTasks() || {};

const {totalCertificates = 0} = useCertificates() || {};

const {badges = []} = useAchievements() || {};

/*SAFE ARRAYS*/
const courses =
Array.isArray(currentLearning)
?
currentLearning
:
[];

const progress =
Array.isArray(weeklyProgress) ? weeklyProgress: [];

const weeklyTasks = Array.isArray(tasks) ? tasks : [];

const achievements = Array.isArray(badges) ? badges : [];

const stats=[
{title:"Courses",value:totalCourses,icon:BookOpen},

{title:"Completed Lessons",value:totalCompletedLessons,icon:CheckCircle2},

{title:"Study Hours",value:`${studyHours}h`,icon:Clock3},

{title:"Certificates",value:totalCertificates,icon:Trophy}];

return (
    <div className="space-y-8">
{/* HERO */}
<motion.div initial={{opacity:0,y:20}}

animate={{opacity:1,y:0}}
className="rounded-3xl p-10 bg-gradient-to-r from-indigo-900 via-slate-900 to-black border border-slate-800">

<div className="flex justify-between items-center gap-6 flex-wrap"><div>

<h1 className="text-5xl font-bold">Welcome Back 👋</h1>
<p className="text-slate-400 mt-4 text-lg">
Continue your learning journey.
</p>
</div>

<div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-6">
<Flame className="text-orange-400" size={40}/>
<div>

<h2 className="text-3xl font-bold">28 Days</h2>

<p className="text-slate-400">Learning streak</p>
</div>
</div>
</div>
</motion.div>

{/* STATS */}
<div
className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

{stats.map((item)=>(
<StatCard key={item.title}
{...item}/>
))
}
</div>
{/* ============================ MAIN CONTENT============================ */}
<div className="grid xl:grid-cols-3 gap-6">

{/* ============================ CONTINUE LEARNING ============================ */}
<GlassCard className="xl:col-span-2">

<div className="flex justify-between items-center mb-6"><div>

<h2 className="text-2xl font-bold">Continue Learning</h2>

<p className="text-slate-400">Pick up where you stopped.</p>
</div>
</div>

{
courses.length === 0 ? (
<div className="border border-dashed border-slate-700 rounded-2xl p-10 text-center">
<BookOpen size={45} className="mx-auto text-slate-500"/>

<h3 className="text-xl font-bold mt-4">No Active Course</h3>

<p className="text-slate-500 mt-2">Start a course to see it here.</p>
</div>
) : 
(
<div className="space-y-5">
{courses.map((course)=>(
<motion.div
    key={course.id}
        whileHover={{y:-4}}
className="bg-slate-950 border border-slate-800 rounded-2xl p-5">

<div className="flex justify-between items-center">
<div>


<h3
className="
text-xl
font-bold
"
>

{course.title}

</h3>



<p
className="
text-slate-400
mt-1
"
>

{course.currentLesson || "Continue lesson"}

</p>


</div>



<span
className="
text-blue-400
font-bold
"
>

{course.progress || 0}%

</span>


</div>

<div
className="
mt-5
h-3
bg-slate-800
rounded-full
overflow-hidden
"
>


<div

style={{
width:`${course.progress || 0}%`
}}

className="
h-full
bg-blue-500
rounded-full
"

/>


</div>





<div
className="
flex
justify-between
items-center
mt-6
"
>


<p
className="
text-slate-400
text-sm
"
>

{
course.lessonsCompleted || 0
}

/

{
course.totalLessons || 0
}

Lessons

</p>




<button

onClick={()=>
completeLesson(course.id)
}

className="
flex
items-center
gap-2
bg-blue-600
px-5
py-3
rounded-xl
font-semibold
hover:bg-blue-700
"

>


<PlayCircle size={18}/>

Continue


</button>


</div>



</motion.div>


))


}


</div>


)

}


</GlassCard>






{/* ============================
    WEEKLY PROGRESS
============================ */}


<GlassCard>


<div
className="
flex
justify-between
items-center
mb-6
"
>


<div>


<h2
className="
text-2xl
font-bold
"
>

Weekly Progress

</h2>


<p
className="
text-slate-400
"
>

Your learning activity

</p>


</div>



<TrendingUp
className="
text-blue-400
"
size={28}
/>


</div>





<div
className="
flex
items-end
gap-3
h-56
"
>


{

progress.length === 0 ? (


<p
className="
text-slate-500
"
>

No progress data yet.

</p>


)

:

(

progress.map((day)=>(


<div

key={day.day}

className="
flex-1
flex
flex-col
items-center
"
>


<div
className="
h-44
w-full
flex
items-end
"
>


<motion.div

initial={{
height:0
}}

animate={{
height:`${day.value || 0}%`
}}

className="
w-full
rounded-t-xl
bg-cyan-500
"

/>


</div>



<p
className="
text-sm
text-slate-400
mt-3
"
>

{day.day}

</p>



</div>


))


)


}


</div>



</GlassCard>



</div>
{/* ============================
    ACHIEVEMENTS
============================ */}


<GlassCard>


<div
className="
flex
justify-between
items-center
mb-6
"
>


<div>

<h2
className="
text-2xl
font-bold
"
>

Achievements

</h2>


<p className="text-slate-400">Badges earned from learning.</p>
</div>
<Trophy size={28} className="text-yellow-400"/>
</div>

{achievements.length === 0 ? (
<div className="border border-dashed border-slate-700 rounded-2xl p-10 text-center">
<Trophy size={45} className="mx-auto text-slate-600"/>

<h3 className="text-xl font-bold mt-4">No Achievements Yet</h3>
<p className="text-slate-500 mt-2">Complete lessons and quizzes to unlock badges.</p>
</div>

) : (

<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
{
achievements.map((badge)=>(

<motion.div key={badge.id} whileHover={{
y:-5
}}

className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
<div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center">
<Trophy size={28} />
</div>
<h3 className="text-xl font-bold mt-5">
{badge.title || "Achievement"}

</h3>
<p className="text-slate-400 mt-2">

{badge.description || "Unlocked badge"}

</p>
<CheckCircle2 className="text-green-400 mt-5"/>

</motion.div>
))
}

</div>
)

}
</GlassCard>

{/* ============================WeeklyTasks============================ */}
<GlassCard>
<div className="flex justify-between items-center mb-6">
<div>
<h2 className="text-2xl font-bold">Upcoming weeklytasks</h2>

<p className="text-slate-400">Stay ahead of deadlines.</p>
</div>
<CalendarDays size={28} className="text-cyan-400"/>

</div>
{

weeklyTasks.length === 0 ? (

<div className="text-center text-slate-500 py-8"> No task available. </div>

) : (

<div className="space-y-4">
{

weeklyTasks.map((task)=>(

<motion.div
    key={task.id}
    whileHover={{
y:-3
}}

className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
<div
className="flex justify-between items-center">
<div>
<h3 className="text-lg font-bold">

{task.title || "WeeklyTasks"}

</h3>
<p className="text-slate-400 mt-1">

{task.course || "Course"}
</p>
</div>
<span className="text-blue-400 text-sm">

{task.dueDate || "No date"}

</span>
</div>
</motion.div>
))

}

</div>
)
}
</GlassCard>
{/* ============================QUICK ACTIONS=========================== */}
<GlassCard>
<div className="mb-6">
<h2 className="text-2xl font-bold">Quick Actions</h2>

<p className="text-slate-400">Access your learning tools quickly.</p>
</div>

<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

<motion.button
whileHover={{
scale:1.03
}}

className="rounded-2xl p-6 text-left bg-blue-600">

<BookOpen size={32}/>

<h3 className="text-xl font-bold mt-4">Courses</h3>
<p className="text-white/80 mt-2">Continue learning.</p>
</motion.button>

<motion.button
whileHover={{
scale:1.03
}}

className="rounded-2xl p-6 text-left bg-purple-600">

<CheckCircle2 size={32} />
<h3 className="text-xl font-bold mt-4">WeeklyTasks</h3>
<p className="text-white/80 mt-2">Complete your tasks.</p>
</motion.button>
<motion.button whileHover={{ 
scale:1.03
}}
className="rounded-2xl p-6 text-left bg-emerald-600">

<TrendingUp size={32}/>
<h3 className="text-xl font-bold mt-4">Progress</h3>
<p className="text-white/80 mt-2">Track your growth.</p>
</motion.button>
<motion.button whileHover={{ scale:1.03}}
className="rounded-2xl p-6 text-left bg-orange-600">
<CalendarDays size={32} />

<h3 className="text-xl font-bold mt-4">Calendar</h3>

<p className="text-white/80 mt-2">View upcoming events.</p>
</motion.button>
</div>

</GlassCard>

{/* Footer */}
<Footer />

</div>
    );

};
export default Dashboard;