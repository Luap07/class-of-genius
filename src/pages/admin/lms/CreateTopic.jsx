// src/pages/admin/lms/CreateTopic.jsx

import React, { useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const CreateTopic = () => {

  const navigate = useNavigate();

  const { courseId } = useParams();


  console.log("CREATE TOPIC COURSE ID:", courseId);



  const [loading, setLoading] = useState(false);


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    position: 1,
  });



  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev)=>({
      ...prev,
      [name]: value
    }));

  };




  const handleSubmit = async (e)=>{

    e.preventDefault();


    if(!courseId){

      alert("Missing Course ID. Go back and open the course again.");

      console.error(
        "COURSE ID IS UNDEFINED",
        courseId
      );

      return;

    }



    if(!formData.title.trim()){

      alert("Learning Unit title is required.");

      return;

    }



    setLoading(true);



    const topicData = {

      course_id: courseId,

      title: formData.title.trim(),

      description:
        formData.description.trim(),

      position:
        Number(formData.position) || 1,

    };



    console.log(
      "CREATING TOPIC:",
      topicData
    );



    const { data, error } = await supabase
      .from("course_topics")
      .insert(topicData)
      .select()
      .single();



    console.log(
      "NEW TOPIC:",
      data
    );


    console.log(
      "TOPIC ERROR:",
      error
    );



    setLoading(false);



    if(error){

      alert(error.message);

      return;

    }



    navigate(
      `/admin/lms/course/${courseId}/topics`
    );


  };




  return (

    <div className="max-w-5xl mx-auto space-y-8 p-6">


      <div className="flex items-center justify-between">


        <div>

          <h1 className="text-3xl font-bold text-white">
            Create Learning Unit
          </h1>


          <p className="mt-2 text-slate-400">
            Add a new topic to this course.
          </p>


        </div>



        <AdminButton
          variant="secondary"
          onClick={()=>
            navigate(
              `/admin/lms/course/${courseId}/topics`
            )
          }
        >

          <ArrowLeft size={18} className="mr-2"/>

          Back

        </AdminButton>


      </div>





      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-800 bg-slate-900 p-8 space-y-8"
      >


        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Learning Unit Title
          </label>


          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Example: Algebra Basics"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          />

        </div>




        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Description
          </label>


          <textarea

            name="description"

            value={formData.description}

            onChange={handleChange}

            rows="5"

            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"

          />

        </div>




        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Position
          </label>


          <input

            type="number"

            min="1"

            name="position"

            value={formData.position}

            onChange={handleChange}

            className="w-32 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"

          />

        </div>




        <div className="flex justify-end gap-4">


          <AdminButton
            type="button"
            variant="secondary"
            onClick={()=>
              navigate(
                `/admin/lms/course/${courseId}/topics`
              )
            }
          >

            Cancel

          </AdminButton>




          <AdminButton
            type="submit"
            disabled={loading}
          >

            {loading ? (

              <Loader2
                size={18}
                className="animate-spin mr-2"
              />

            ) : (

              <Save
                size={18}
                className="mr-2"
              />

            )}


            {loading
              ? "Creating..."
              : "Create Topic"
            }


          </AdminButton>


        </div>


      </form>


    </div>

  );

};


export default CreateTopic;