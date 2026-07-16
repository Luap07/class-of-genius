import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  supabase,
} from "../../../lib/supabaseClient";

import AdminButton from "../../../components/admin/ui/AdminButton";


const EditMonthlyQuiz = () => {

  const navigate = useNavigate();

  const {
    topicId,
    id,
  } = useParams();



  const [courses,setCourses] = useState([]);

  const [topics,setTopics] = useState([]);

  const [loading,setLoading] = useState(true);

  const [saving,setSaving] = useState(false);



  const [formData,setFormData] = useState({

    course_id:"",
    topic_id:"",

    title:"",
    description:"",

    month:"",

    quiz_number:1,

    duration:30,

    passing_score:50,

    status:"Draft",

  });



  /* ================= FETCH COURSES ================= */


  const fetchCourses = async()=>{


    const {
      data,
      error
    } = await supabase
      .from("courses")
      .select("id,title")
      .order("title");


    if(error){

      console.error(error);

      return;

    }


    setCourses(data || []);

  };





  /* ================= FETCH TOPICS ================= */


  const fetchTopics = async(courseId)=>{


    if(!courseId){

      setTopics([]);

      return;

    }



    const {
      data,
      error
    } = await supabase
      .from("course_topics")
      .select("id,title")
      .eq(
        "course_id",
        courseId
      )
      .order("created_at");


    if(error){

      console.error(error);

      return;

    }


    setTopics(data || []);

  };






  /* ================= FETCH QUIZ ================= */


  const fetchQuiz = async()=>{


    const {
      data,
      error
    } = await supabase
      .from("monthly_quizzes")
      .select("*")
      .eq(
        "id",
        id
      )
      .single();



    if(error){

      console.error(error);

      alert(error.message);

      return;

    }



    setFormData({

      course_id:data.course_id || "",

      topic_id:data.topic_id || "",

      title:data.title || "",

      description:data.description || "",

      month:data.month || "",

      quiz_number:data.quiz_number || 1,

      duration:data.duration || 30,

      passing_score:data.passing_score || 50,

      status:data.status || "Draft",

    });



    if(data.course_id){

      fetchTopics(
        data.course_id
      );

    }



    setLoading(false);


  };







  useEffect(()=>{


    fetchCourses();

    fetchQuiz();


  },[]);








  const handleChange=(e)=>{


    const {
      name,
      value
    } = e.target;



    setFormData(prev=>({

      ...prev,

      [name]:value

    }));



    if(name==="course_id"){


      fetchTopics(value);


      setFormData(prev=>({

        ...prev,

        course_id:value,

        topic_id:""

      }));

    }


  };









  const handleSubmit=async(e)=>{


    e.preventDefault();



    setSaving(true);



    const {
      error
    } = await supabase
      .from("monthly_quizzes")
      .update({

        course_id:
        formData.course_id,


        topic_id:
        formData.topic_id,


        title:
        formData.title,


        description:
        formData.description,


        month:
        formData.month,


        quiz_number:
        Number(formData.quiz_number),


        duration:
        Number(formData.duration),


        passing_score:
        Number(formData.passing_score),


        status:
        formData.status,


      })
      .eq(
        "id",
        id
      );



    setSaving(false);



    if(error){

      console.error(error);

      alert(error.message);

      return;

    }



    alert(
      "Quiz updated successfully"
    );



    navigate(
      `/admin/lms/topic/${formData.topic_id}/quizzes`
    );


  };






  if(loading){

    return (

      <div className="flex min-h-[400px] items-center justify-center">

        <Loader2
          size={40}
          className="animate-spin text-blue-500"
        />

      </div>

    );

  }







return (

<div className="max-w-5xl mx-auto p-6 space-y-8 text-white">



<div className="flex items-center justify-between">


<div>

<h1 className="text-3xl font-bold">

Edit Monthly Quiz

</h1>


<p className="mt-2 text-slate-400">

Update quiz information

</p>


</div>



<AdminButton

variant="secondary"

onClick={()=>navigate(-1)}

>

<ArrowLeft size={18}/>

Back

</AdminButton>



</div>







<form

onSubmit={handleSubmit}

className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8"

>




<select

name="course_id"

value={formData.course_id}

onChange={handleChange}

className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"

>


<option value="">

Select Course

</option>


{

courses.map(course=>(

<option

key={course.id}

value={course.id}

>

{course.title}

</option>

))

}


</select>







<select

name="topic_id"

value={formData.topic_id}

onChange={handleChange}

className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"

>


<option value="">

Select Topic

</option>


{

topics.map(topic=>(

<option

key={topic.id}

value={topic.id}

>

{topic.title}

</option>

))

}


</select>







<input

name="title"

value={formData.title}

onChange={handleChange}

placeholder="Quiz title"

className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"

/>







<textarea

name="description"

value={formData.description}

onChange={handleChange}

placeholder="Description"

rows="4"

className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"

/>







<input

type="month"

name="month"

value={formData.month}

onChange={handleChange}

className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"

/>







<div className="grid md:grid-cols-3 gap-5">


<input

type="number"

name="quiz_number"

value={formData.quiz_number}

onChange={handleChange}

placeholder="Quiz Number"

className="rounded-xl border border-slate-700 bg-slate-950 p-3"

/>



<input

type="number"

name="duration"

value={formData.duration}

onChange={handleChange}

placeholder="Duration"

className="rounded-xl border border-slate-700 bg-slate-950 p-3"

/>



<input

type="number"

name="passing_score"

value={formData.passing_score}

onChange={handleChange}

placeholder="Passing Score"

className="rounded-xl border border-slate-700 bg-slate-950 p-3"

/>


</div>








<select

name="status"

value={formData.status}

onChange={handleChange}

className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"

>

<option>
Draft
</option>

<option>
Published
</option>

</select>








<div className="flex justify-end">


<AdminButton

type="submit"

disabled={saving}

>


{

saving ?

<Loader2 className="animate-spin"/>

:

<Save/>

}


Save Changes


</AdminButton>


</div>





</form>


</div>

);


};


export default EditMonthlyQuiz;