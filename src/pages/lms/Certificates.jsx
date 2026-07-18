// src/pages/lms/Certificates.jsx

import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";

import {
  Search,
  Award,
  Lock,
  ShieldCheck,
  Download,
} from "lucide-react";


import CertificateCard from "../../components/lms/CertificateCard";

import {
  supabase
} from "../../lib/supabaseClient";


import {
  AuthContext
} from "../../context/AuthContext";



const Certificates = () => {


const {
  user
}=useContext(AuthContext);



const [
certificates,
setCertificates
]=useState([]);



const [
loading,
setLoading
]=useState(true);



const [
search,
setSearch
]=useState("");





/*
=========================
FETCH CERTIFICATES
=========================
*/


useEffect(()=>{


if(user){

fetchCertificates();

}


},[user]);





const fetchCertificates =
async()=>{


try{


setLoading(true);



const {
data,
error
}=await supabase

.from("certificates")

.select(`

id,

certificate_number,

issued_at,


courses(

id,

title,

thumbnail_url

)


`)

.eq(
"student_id",
user.id
)

.order(
"issued_at",
{
ascending:false
}
);




if(error)
throw error;




const formatted =
(data || []).map(item=>({


id:item.id,


title:
`${item.courses?.title || "Course"} Certificate`,


course:
item.courses?.title || "Unknown Course",



issuer:
"Class Of Genius",



issueDate:

new Date(
item.issued_at
)
.toLocaleDateString(),



credentialId:
item.certificate_number,



thumbnail:
item.courses?.thumbnail_url || "",



verified:true,


earned:true



}));




setCertificates(formatted);



}
catch(error){


console.error(
"Certificate Fetch Error:",
error
);


}
finally{


setLoading(false);


}



};







/*
=========================
SEARCH
=========================
*/


const filtered =
useMemo(()=>{


return certificates.filter(item=>

item.course
.toLowerCase()
.includes(
search.toLowerCase()
)


||

item.credentialId
.toLowerCase()
.includes(
search.toLowerCase()
)


);


},[
certificates,
search
]);







if(loading){


return(

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


)


}





return (

<div className="space-y-10">



{/* HEADER */}


<div className="
flex
flex-col
lg:flex-row
justify-between
gap-5
">


<div>

<h1 className="
text-4xl
font-bold
">

Certificates

</h1>


<p className="
text-slate-400
mt-2
">

Your verified learning achievements.

</p>


</div>




<div className="
flex
items-center
gap-3
bg-slate-900
border
border-slate-800
rounded-2xl
px-5
py-4
">


<Search
className="text-slate-500"
/>


<input

value={search}

onChange={
e=>setSearch(e.target.value)
}

placeholder="
Search certificates...
"

className="
bg-transparent
outline-none
"

/>


</div>



</div>







{/* STATS */}


<div className="
grid
md:grid-cols-3
gap-6
">



<div className="
rounded-3xl
bg-slate-900
border
border-slate-800
p-6
">


<Award
className="text-yellow-400"
size={36}
/>


<h2 className="
text-4xl
font-bold
mt-4
">

{
certificates.length
}

</h2>


<p className="text-slate-400">

Certificates Earned

</p>


</div>





<div className="
rounded-3xl
bg-slate-900
border
border-slate-800
p-6
">


<Lock
className="text-red-400"
size={36}
/>


<h2 className="
text-4xl
font-bold
mt-4
">

0

</h2>


<p className="text-slate-400">

Locked Certificates

</p>


</div>





<div className="
rounded-3xl
bg-slate-900
border
border-slate-800
p-6
">


<ShieldCheck
className="text-green-400"
size={36}
/>


<h2 className="
text-4xl
font-bold
mt-4
">

100%

</h2>


<p className="text-slate-400">

Verification

</p>


</div>


</div>









{/* CERTIFICATES */}


<div>


<h2 className="
text-3xl
font-bold
mb-6
">

My Certificates

</h2>



{
filtered.length > 0 ?


<div className="
grid
lg:grid-cols-2
gap-8
">


{
filtered.map(certificate=>(


<CertificateCard

key={
certificate.id
}

certificate={
certificate
}


onView={(item)=>{


window.open(

`/verify/${item.credentialId}`,

"_blank"

);


}}


onDownload={(item)=>{


console.log(
"Download:",
item
);


}}


/>


))


}


</div>



:


<div className="
rounded-3xl
bg-slate-900
border
border-slate-800
p-10
text-center
">


<Award
size={70}
className="
mx-auto
text-slate-600
"
/>


<h2 className="
text-2xl
font-bold
mt-5
">

No certificates yet

</h2>


<p className="text-slate-400 mt-3">

Complete courses to earn certificates.

</p>


</div>


}



</div>



</div>

);


};



export default Certificates;