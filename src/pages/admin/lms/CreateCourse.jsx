// src/pages/admin/courses/CreateCourse.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  GraduationCap,
  Target,
  Sparkles,
  Briefcase,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../../../lib/supabaseClient";


const CreateCourse = () => {

  const navigate = useNavigate();


  const [loading,setLoading] = useState(false);

  const [uploading,setUploading] = useState(false);

  const [error,setError] = useState("");

  const [success,setSuccess] = useState(false);


  const [categories,setCategories] = useState([]);

  const [subjects,setSubjects] = useState([]);


  const [thumbnail,setThumbnail] = useState(null);

  const [preview,setPreview] = useState("");



  const [course,setCourse] = useState({

    title:"",

    slug:"",

    description:"",


    category_id:"",

    subject_id:"",


    instructor:"",


    level:"Beginner",

    language:"English",


    duration:"",

    lessons_count:0,


    price:0,


    certificate:true,

    featured:false,


    status:"Draft",


    requirements:"",

    learning_outcomes:"",


    skills:"",

    career_paths:"",


    job_roles:"",


    average_salary:"",


    experience_required:"",


    companies:"",


    remote_friendly:false,

    internship_available:false,

  });



/* =====================================
   LOAD CATEGORY + SUBJECT
===================================== */


useEffect(()=>{

  loadCategories();

  loadSubjects();

},[]);




const loadCategories = async()=>{


  const {

    data,

    error

  } = await supabase

  .from("course_categories")

  .select("*")

  .order("name");


  if(!error){

    setCategories(data || []);

  }

};





const loadSubjects = async()=>{


  const {

    data,

    error

  } = await supabase

  .from("subjects")

  .select("*")

  .order("name");



  if(!error){

    setSubjects(data || []);

  }


};





/* =====================================
   INPUT HANDLER
===================================== */


const handleChange = (e)=>{


 const {

 name,

 value,

 checked,

 type


 } = e.target;



 setCourse(prev=>({


   ...prev,


   [name]:

   type === "checkbox"

   ? checked

   : value



 }));



 if(name==="title"){


 setCourse(prev=>({

 ...prev,


 slug:value

 .toLowerCase()

 .replace(/[^a-z0-9 ]/g,"")

 .replace(/\s+/g,"-")


 }));


 }


};





/* =====================================
   IMAGE
===================================== */


const handleImage=(e)=>{


 const file=e.target.files[0];


 if(!file)return;


 setThumbnail(file);


 setPreview(

 URL.createObjectURL(file)

 );


};




/* =====================================
   UPLOAD IMAGE
===================================== */


const uploadThumbnail = async()=>{


 if(!thumbnail)

 return "";



 setUploading(true);



 const fileName =

 `${Date.now()}-${thumbnail.name}`;



 const {

 error

 } = await supabase

 .storage

 .from("course-thumbnails")

 .upload(

 fileName,

 thumbnail

 );



 if(error){

   throw error;

 }



 const {

 data

 } = supabase

 .storage

 .from("course-thumbnails")

 .getPublicUrl(fileName);



 setUploading(false);



 return data.publicUrl;


};
/* =====================================
   CREATE COURSE
===================================== */


const handleSubmit = async(e)=>{

 e.preventDefault();


 setLoading(true);

 setError("");

 setSuccess(false);



 try{


   const thumbnailUrl = await uploadThumbnail();



   const {

    error:insertError

   } = await supabase

   .from("courses")

   .insert([

   {


    title:course.title,


    slug:course.slug,


    description:course.description,



    thumbnail:

    thumbnailUrl,



    thumbnail_url:

    thumbnailUrl,



    category_id:

    course.category_id,



    subject_id:

    course.subject_id,



    instructor:

    course.instructor,



    level:

    course.level,



    language:

    course.language,



    duration:

    course.duration,



    lessons_count:

    Number(course.lessons_count),



    price:

    Number(course.price),



    certificate:

    course.certificate,



    featured:

    course.featured,



    status:

    course.status,



    requirements:

    course.requirements,



    learning_outcomes:

    course.learning_outcomes,



    skills:

    course.skills,



    career_paths:

    course.career_paths,



    job_roles:

    course.job_roles,



    average_salary:

    course.average_salary,



    experience_required:

    course.experience_required,



    companies:

    course.companies,



    remote_friendly:

    course.remote_friendly,



    internship_available:

    course.internship_available,



    students:0,


    rating:0,


   }


   ]);





   if(insertError)

   throw insertError;



   setSuccess(true);



   alert(

   "Course created successfully"

   );



   navigate("/admin/lms/courses");



 }


 catch(err){


 console.error(

 "CREATE COURSE ERROR:",

 err

 );


 setError(

 err.message

 );


 }


 finally{


 setLoading(false);


 }


};





return (

<form

onSubmit={handleSubmit}

className="space-y-8 text-white"

>


{/* ===========================
 COURSE DETAILS
=========================== */}


<motion.div

initial={{

opacity:0,

y:20

}}

animate={{

opacity:1,

y:0

}}

className="rounded-[30px]

border border-slate-800

bg-slate-900/70

p-8

backdrop-blur-xl"

>


<div className="flex items-center gap-4 mb-8">


<div className="h-14 w-14 rounded-2xl

bg-violet-500/10

text-violet-400

flex items-center justify-center">


<GraduationCap size={30}/>


</div>



<div>

<h2 className="text-2xl font-bold">

Course Details

</h2>


<p className="text-slate-400">

Basic course information

</p>


</div>


</div>




<div className="grid md:grid-cols-2 gap-6">


<div>

<label className="block mb-3 text-sm">

Course Title

</label>


<input

name="title"

value={course.title}

onChange={handleChange}

placeholder="Complete React Developer Bootcamp"

className="w-full rounded-2xl

bg-slate-950

border border-slate-700

px-5 py-4

outline-none"

/>


</div>





<div>


<label className="block mb-3 text-sm">

Category

</label>



<select

name="category_id"

value={course.category_id}

onChange={handleChange}

className="w-full rounded-2xl

bg-slate-950

border border-slate-700

px-5 py-4"

>


<option value="">

Select Category

</option>



{

categories.map(cat=>(


<option

key={cat.id}

value={cat.id}

>

{cat.name}

</option>


))

}



</select>


</div>




<div>


<label className="block mb-3 text-sm">

Subject

</label>



<select

name="subject_id"

value={course.subject_id}

onChange={handleChange}

className="w-full rounded-2xl

bg-slate-950

border border-slate-700

px-5 py-4"

>


<option value="">

Select Subject

</option>



{

subjects.map(sub=>(


<option

key={sub.id}

value={sub.id}

>

{sub.name}

</option>


))

}



</select>


</div>





<div>


<label className="block mb-3 text-sm">

Instructor

</label>



<input

name="instructor"

value={course.instructor}

onChange={handleChange}

placeholder="Instructor name"

className="w-full rounded-2xl

bg-slate-950

border border-slate-700

px-5 py-4"

/>


</div>


</div>


</motion.div>
{/* ===========================
 COURSE INFORMATION
=========================== */}

<motion.div

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

className="
rounded-[30px]
border border-slate-800
bg-slate-900/70
p-8
backdrop-blur-xl
"

>


<div className="flex items-center gap-4 mb-8">


<div className="
h-14 w-14
rounded-2xl
bg-cyan-500/10
text-cyan-400
flex items-center justify-center
">

<Target size={30}/>

</div>



<div>

<h2 className="text-2xl font-bold">

Course Information

</h2>


<p className="text-slate-400">

Learning details and difficulty

</p>


</div>


</div>





<div className="grid md:grid-cols-2 gap-6">



<div>

<label className="block mb-3 text-sm">

Level

</label>


<select

name="level"

value={course.level}

onChange={handleChange}

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
"

>


<option>

Beginner

</option>


<option>

Intermediate

</option>


<option>

Advanced

</option>


</select>


</div>





<div>

<label className="block mb-3 text-sm">

Language

</label>


<input

name="language"

value={course.language}

onChange={handleChange}

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
"

/>


</div>





<div>

<label className="block mb-3 text-sm">

Duration

</label>


<input

name="duration"

value={course.duration}

onChange={handleChange}

placeholder="20 Hours"

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
"

/>


</div>





<div>

<label className="block mb-3 text-sm">

Number Of Lessons

</label>


<input

type="number"

name="lessons_count"

value={course.lessons_count}

onChange={handleChange}

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
"

/>


</div>





<div>

<label className="block mb-3 text-sm">

Price

</label>


<input

type="number"

name="price"

value={course.price}

onChange={handleChange}

placeholder="0"

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
"

/>


</div>



</div>


</motion.div>





{/* ===========================
 SKILLS
=========================== */}


<motion.div

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

className="
rounded-[30px]
border border-slate-800
bg-slate-900/70
p-8
backdrop-blur-xl
"

>



<div className="flex items-center gap-4 mb-8">


<div className="
h-14 w-14
rounded-2xl
bg-blue-500/10
text-blue-400
flex items-center justify-center
">

<Sparkles size={30}/>

</div>



<div>

<h2 className="text-2xl font-bold">

Skills & Outcomes

</h2>


<p className="text-slate-400">

What students will learn

</p>


</div>


</div>





<div className="space-y-6">


<div>

<label className="block mb-3 text-sm">

Skills

</label>


<textarea

rows="5"

name="skills"

value={course.skills}

onChange={handleChange}

placeholder="
React
JavaScript
Python
Database
"

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
resize-none
"

/>


</div>





<div>

<label className="block mb-3 text-sm">

Learning Outcomes

</label>


<textarea

rows="5"

name="learning_outcomes"

value={course.learning_outcomes}

onChange={handleChange}

placeholder="
Build real applications
Understand programming concepts
"

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
resize-none
"

/>


</div>



<div>

<label className="block mb-3 text-sm">

Requirements

</label>


<textarea

rows="4"

name="requirements"

value={course.requirements}

onChange={handleChange}

placeholder="
Basic computer knowledge
"

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
resize-none
"

/>


</div>



</div>


</motion.div>
{/* ===========================
 CAREER OPPORTUNITIES
=========================== */}

<motion.div

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

className="
rounded-[30px]
border border-slate-800
bg-slate-900/70
p-8
backdrop-blur-xl
"

>


<div className="flex items-center gap-4 mb-8">


<div className="
h-14 w-14
rounded-2xl
bg-indigo-500/10
text-indigo-400
flex items-center justify-center
">

<Briefcase size={30}/>

</div>



<div>

<h2 className="text-2xl font-bold">

Career Opportunities

</h2>


<p className="text-slate-400">

Help students understand career paths

</p>


</div>


</div>





<div className="grid md:grid-cols-2 gap-6">



<div className="md:col-span-2">


<label className="block mb-3 text-sm">

Job Roles

</label>


<textarea

rows="4"

name="job_roles"

value={course.job_roles}

onChange={handleChange}

placeholder="
Frontend Developer
Backend Developer
Data Analyst
"

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
resize-none
"

/>


</div>





<div>


<label className="block mb-3 text-sm">

Average Salary

</label>


<input

name="average_salary"

value={course.average_salary}

onChange={handleChange}

placeholder="$50,000 - $100,000"

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
"

/>


</div>





<div>


<label className="block mb-3 text-sm">

Experience Required

</label>


<select

name="experience_required"

value={course.experience_required}

onChange={handleChange}

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
"

>


<option>

No Experience

</option>


<option>

0-1 Years

</option>


<option>

1-3 Years

</option>


<option>

3+ Years

</option>


</select>


</div>





<div className="md:col-span-2">


<label className="block mb-3 text-sm">

Hiring Companies

</label>


<input

name="companies"

value={course.companies}

onChange={handleChange}

placeholder="
Google, Microsoft, Meta
"

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5 py-4
"

/>


</div>



</div>


</motion.div>





{/* ===========================
 THUMBNAIL
=========================== */}


<motion.div

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

className="
rounded-[30px]
border border-slate-800
bg-slate-900/70
p-8
backdrop-blur-xl
"

>


<div className="flex items-center gap-4 mb-8">


<div className="
h-14
w-14
rounded-2xl
bg-orange-500/10
text-orange-400
flex items-center justify-center
">

<ImageIcon size={30}/>

</div>



<div>

<h2 className="text-2xl font-bold">

Course Thumbnail

</h2>


<p className="text-slate-400">

Upload course cover image

</p>


</div>


</div>





<label

className="
flex
cursor-pointer
flex-col
items-center
justify-center
rounded-3xl
border
border-dashed
border-slate-700
bg-slate-950
p-12
hover:border-cyan-400
transition
"

>


<Upload size={40}/>


<p className="mt-4">

Upload Image

</p>


<input

type="file"

accept="image/*"

hidden

onChange={handleImage}

/>


</label>





{
preview &&

<img

src={preview}

alt="preview"

className="
mt-6
h-64
w-full
rounded-3xl
object-cover
"

/>

}



</motion.div>
{/* ===========================
 COURSE SETTINGS
=========================== */}

<motion.div

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

className="
rounded-[30px]
border border-slate-800
bg-slate-900/70
p-8
backdrop-blur-xl
"

>


<div className="flex items-center gap-4 mb-8">


<div className="
h-14
w-14
rounded-2xl
bg-violet-500/10
text-violet-400
flex
items-center
justify-center
">

<Sparkles size={30}/>

</div>



<div>

<h2 className="text-2xl font-bold">

Publishing Settings

</h2>


<p className="text-slate-400">

Control course visibility

</p>


</div>


</div>





<div className="space-y-5">



<label

className="
flex
items-center
justify-between
rounded-2xl
border
border-slate-800
bg-slate-950
px-6
py-5
"

>


<span>

Featured Course

</span>


<input

type="checkbox"

name="featured"

checked={course.featured}

onChange={handleChange}

className="h-5 w-5"

/>


</label>





<label

className="
flex
items-center
justify-between
rounded-2xl
border
border-slate-800
bg-slate-950
px-6
py-5
"

>


<span>

Certificate Available

</span>


<input

type="checkbox"

name="certificate"

checked={course.certificate}

onChange={handleChange}

className="h-5 w-5"

/>


</label>





<div>


<label className="block mb-3 text-sm">

Course Status

</label>


<select

name="status"

value={course.status}

onChange={handleChange}

className="
w-full
rounded-2xl
bg-slate-950
border border-slate-700
px-5
py-4
"

>


<option value="Draft">

Draft

</option>


<option value="Published">

Published

</option>


</select>


</div>



</div>


</motion.div>







        {/* ===========================
            ACTION BUTTONS
        =========================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            flex
            flex-col
            md:flex-row
            gap-5
            justify-between
            rounded-[30px]
            border
            border-slate-800
            bg-slate-900/70
            p-8
          "
        >

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              flex
              items-center
              justify-center
              gap-3
              rounded-2xl
              border
              border-slate-700
              px-8
              py-4
              font-semibold
            "
          >
            <ArrowLeft size={20}/>
            Cancel
          </button>


          <button
            type="submit"
            disabled={loading}
            className="
              flex
              items-center
              justify-center
              gap-3
              rounded-2xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              px-10
              py-4
              font-bold
              text-slate-950
            "
          >

            {
              loading
              ?
              <Loader2 className="animate-spin"/>
              :
              <Save/>
            }

            {
              loading
              ?
              "Saving..."
              :
              "Create Course"
            }

          </button>


        </motion.div>


             {/* ===========================
            ACTION BUTTONS
        =========================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            flex
            flex-col
            md:flex-row
            gap-5
            justify-between
            rounded-[30px]
            border
            border-slate-800
            bg-slate-900/70
            p-8
          "
        >

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              flex
              items-center
              justify-center
              gap-3
              rounded-2xl
              border
              border-slate-700
              px-8
              py-4
              font-semibold
            "
          >
            <ArrowLeft size={20}/>
            Cancel
          </button>


          <button
            type="submit"
            disabled={loading}
            className="
              flex
              items-center
              justify-center
              gap-3
              rounded-2xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              px-10
              py-4
              font-bold
              text-slate-950
            "
          >

            {
              loading
              ?
              <Loader2 className="animate-spin"/>
              :
              <Save/>
            }

            {
              loading
              ?
              "Saving..."
              :
              "Create Course"
            }

          </button>


        </motion.div>



    </form>
  );
};


export default CreateCourse;