// src/components/layout/Topbar.jsx

import React, { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { motion } from "framer-motion";
import Cog from "../../assets/cog.png";
import SearchDropdown from "../SearchDropdown";
import { useSearch } from "../../context/SearchContext";

const Topbar = ({
  onMenuClick,
}) => {


const [profileOpen,setProfileOpen] =
useState(false);
const {
  searchValue,
  setSearchValue,
} = useSearch();

return (

<header
className="
fixed
top-0
left-0
right-0
z-50
flex
h-20
w-full
items-center
justify-between
border-b
border-slate-800
bg-[#020617]/90
px-6
backdrop-blur-xl
"
>

{/* LEFT BRAND */}


<div

className="
flex
items-center
gap-5
"

>


<button

onClick={onMenuClick}

className="
rounded-xl
border
border-slate-800
bg-slate-900
p-3
transition
hover:border-cyan-400
lg:hidden
"

>

<Menu
size={22}
className="text-white"
/>

</button>




<div

className="
flex
items-center
gap-3
"

>


<div

className="
flex
h-11
w-11
items-center
justify-center
rounded-2xl
border
border-cyan-500/30
bg-cyan-500/10
"

>

<img

src={Cog}

alt="Scholiqen"

className="
h-7
w-7
object-contain
"

/>

</div>




<div className="hidden sm:block">


<h1

className="
text-xl
font-black
tracking-wide
text-white
"

>

SCHOLIQEN

<span className="text-cyan-400">
.
</span>

</h1>



<p

className="
text-[10px]
uppercase
tracking-[0.2em]
text-slate-500
"

>

Learn Beyond Limits

</p>


</div>


</div>


</div>






{/* SEARCH */}


<div

className="
hidden
w-[420px]
items-center
gap-3
rounded-2xl
border
border-slate-800
bg-slate-900/70
px-5
py-3
md:flex
mb-4.5
"

>

<Search

size={20}

className="
text-slate-500
"

/>


<input

value={searchValue}

onChange={(e)=>
  setSearchValue(e.target.value)
}

placeholder="
Search courses, labs, lessons...
"

className="
w-full
bg-transparent
text-sm
text-white
outline-none
placeholder:text-slate-500
"

/>

</div>







{/* RIGHT */}


<div

className="
flex
items-center
gap-3
"

>

{/* Notification */}


<button

className="
relative
rounded-xl
border
border-slate-800
bg-slate-900
p-3
mb-4.5
transition
hover:border-cyan-400
"

>

<Bell

size={21}

className="
text-slate-300
"

/>


<span

className="
absolute
right-2
top-2
h-2.5
w-2.5
rounded-full
bg-cyan-400
ring-4
ring-slate-900
"

/>


</button>

{/* USER */}

<div

className=" mb-16.5 h-2
relative
"

>


<button

onClick={()=>
setProfileOpen(!profileOpen)
}

className="
flex
items-center
gap-3
rounded-2xl
border
border-slate-800
bg-slate-900
px-3
py-2
transition
hover:border-cyan-400
"

>


<div className="hidden md:block text-right">


<p

className="
text-sm
font-bold
text-white
"

>

Student

</p>


<p

className="
text-[10px]
uppercase
text-cyan-400

"

>

Learning Account

</p>


</div>



<UserCircle

size={38}

className="
text-cyan-400
"

/>


<ChevronDown

size={16}

className="
hidden
text-slate-400
md:block
"

/>


</button>





{

profileOpen && (

<motion.div

initial={{
opacity:0,
y:-10
}}

animate={{
opacity:1,
y:0
}}

className="
absolute
right-0
mt-3
w-52
rounded-2xl
border
border-slate-800
bg-slate-950
p-3
shadow-2xl
"

>


<button

className="
flex
w-full
items-center
gap-3
rounded-xl
px-4
py-3
text-sm
text-red-400
hover:bg-red-500/10
"

>

<LogOut
size={18}
/>

Logout

</button>


</motion.div>

)


}


</div>



</div>



</header>

);

};


export default Topbar;