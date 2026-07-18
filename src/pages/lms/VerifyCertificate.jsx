import React, {
  useEffect,
  useState
} from "react";

import {
  ShieldCheck,
  Award,
  CheckCircle2
} from "lucide-react";

import {
  useParams
} from "react-router-dom";

import {
  supabase
} from "../../lib/supabaseClient";



const VerifyCertificate =()=>{


const {
certificate_number
}=useParams();



const [
certificate,
setCertificate
]=useState(null);



const [
loading,
setLoading
]=useState(true);





useEffect(()=>{


fetchCertificate();


},[]);





const fetchCertificate =
async()=>{


const {
data,
error
}=await supabase

.from("certificates")

.select(`

certificate_number,

issued_at,


courses(

title

),


profiles(

username,

email

)


`)

.eq(
"certificate_number",
certificate_number
)

.single();




if(error){


console.error(error);


}

else{


setCertificate(data);


}


setLoading(false);



};






if(loading){


return(

<div className="
min-h-screen
flex
items-center
justify-center
">

Loading...

</div>

)


}





return(


<div className="
min-h-screen
flex
items-center
justify-center
px-6
">


<div className="
max-w-xl
w-full
rounded-3xl
bg-slate-900
border
border-slate-800
p-10
text-center
">


{
certificate ?


<>


<CheckCircle2

size={80}

className="
mx-auto
text-green-400
"

/>



<h1 className="
text-4xl
font-bold
mt-6
">

Certificate Verified

</h1>



<div className="
mt-8
space-y-4
text-left
">


<div>

<p className="text-slate-400">

Student

</p>


<h3 className="font-bold">

{
certificate.profiles?.username
}

</h3>

</div>




<div>

<p className="text-slate-400">

Course

</p>


<h3 className="font-bold">

{
certificate.courses?.title
}

</h3>


</div>




<div>

<p className="text-slate-400">

Certificate ID

</p>


<h3 className="font-bold">

{
certificate.certificate_number
}

</h3>


</div>



<div>

<p className="text-slate-400">

Issued Date

</p>


<h3 className="font-bold">

{
new Date(
certificate.issued_at
)
.toLocaleDateString()

}

</h3>


</div>



</div>


</>


:


<>


<Award

size={80}

className="
mx-auto
text-red-400
"

/>


<h1 className="
text-3xl
font-bold
mt-5
">

Certificate Not Found

</h1>


<p className="
text-slate-400
mt-3
">

Invalid certificate number.

</p>


</>


}



</div>


</div>


)


}



export default VerifyCertificate;