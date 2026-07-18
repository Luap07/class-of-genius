// src/context/LMSContext/ProfileContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabaseClient";

import { AuthContext } from "../AuthContext";


const ProfileContext = createContext();



export const ProfileProvider = ({
  children
}) => {


const {
  user
}=useContext(AuthContext);



const [
profile,
setProfile
]=useState(null);



const [
stats,
setStats
]=useState({

  courses:0,

  completedCourses:0,

  certificates:0,

  lessonsCompleted:0,

  submissions:0,

});



const [
activity,
setActivity
]=useState([]);



const [
loading,
setLoading
]=useState(true);







/*
================================
FETCH PROFILE DATA
================================
*/


const fetchProfileData =
async()=>{


if(!user)
return;



try{


setLoading(true);



/*
=========================
PROFILE
=========================
*/


const {
data:profileData,
error:profileError
}=await supabase

.from("profiles")

.select("*")

.eq(
"id",
user.id
)

.single();



if(profileError)
throw profileError;






/*
=========================
COURSE ENROLLMENTS
=========================
*/


const {
data:enrollments
}=await supabase

.from("course_enrollments")

.select("*")

.eq(
"student_id",
user.id
);







/*
=========================
CERTIFICATES
=========================
*/


const {
data:certificates
}=await supabase

.from("certificates")

.select("*")

.eq(
"student_id",
user.id
);







/*
=========================
LESSON PROGRESS
=========================
*/


const {
data:lessons
}=await supabase

.from("lesson_progress")

.select("*")

.eq(
"student_id",
user.id
)

.eq(
"completed",
true
);







/*
=========================
TASK SUBMISSIONS
=========================
*/


const {
data:submissions
}=await supabase

.from("weekly_task_submissions")

.select("*")

.eq(
"student_id",
user.id
);








setProfile({

...profileData,

id:user.id,

email:user.email,

avatar:
profileData.avatar ||
profileData.avatar_url ||
"",


username:
profileData.username ||
user.email?.split("@")[0],

});

setStats({

courses:
enrollments?.length || 0,


completedCourses:

enrollments?.filter(
item=>item.completed
).length || 0,


certificates:
certificates?.length || 0,


lessonsCompleted:
lessons?.length || 0,


submissions:
submissions?.length || 0,

});

/*
=========================
RECENT ACTIVITY
=========================
*/


const activities=[];



lessons?.slice(0,3)
.forEach(item=>{


activities.push({

id:item.id,

title:
"Completed Lesson",


description:
"Lesson completed",


date:
item.completed_at


});


});





submissions?.slice(0,3)
.forEach(item=>{


activities.push({

id:item.id,

title:
"Submitted Weekly Task",


description:
item.feedback ||
"Task submission received",


date:
item.submitted_at


});


});





setActivity(
activities
.sort(
(a,b)=>
new Date(b.date)
-
new Date(a.date)
)

);





}
catch(error){


console.error(
"Profile Fetch Error:",
error
);


}
finally{


setLoading(false);


}



};









useEffect(()=>{


fetchProfileData();



},[user]);







return (

<ProfileContext.Provider

value={{

profile,

stats,

activity,

loading,

refreshProfile:
fetchProfileData


}}

>


{children}


</ProfileContext.Provider>


);


};







export const useProfile =()=>{


const context =
useContext(ProfileContext);



if(!context){


throw new Error(

"useProfile must be used inside ProfileProvider"

);


}


return context;


};