import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const CBTExam = () => {
  const location = useLocation();

  const { exam, subjects } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchQuestions = async () => {
    try {

      const { data, error } = await supabase
        .from("cbt_questions")
        .select("*")
        .eq("exam", exam);


      if (error) throw error;


      // filter selected subjects
      const filtered = data.filter((q)=>
        subjects.includes(q.subject)
      );


      // random questions
      const random =
        filtered
        .sort(()=>Math.random() - 0.5)
        .slice(0, 40);


      setQuestions(random);


    } catch(error){

      console.log(
        "Question loading error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(()=>{
    if(exam && subjects){
      fetchQuestions();
    }
  },[]);



  if(loading){

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Questions...
      </div>
    );

  }



  return (
    <div className="min-h-screen bg-[#05060a] text-white p-6">


      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-400 mb-2">
          {exam} CBT Exam
        </h1>

        <p className="text-gray-400 mb-8">
          Subjects: {subjects?.join(", ")}
        </p>



        <div className="space-y-6">

          {questions.map((q,index)=>(

            <div
              key={q.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >

              <h2 className="font-semibold text-lg mb-4">
                {index + 1}. {q.question}
              </h2>


              <div className="space-y-3">

                {q.options?.map((option,i)=>(

                  <button
                    key={i}
                    className="
                    w-full
                    text-left
                    bg-slate-800
                    hover:bg-blue-600/30
                    border
                    border-slate-700
                    rounded-xl
                    p-3
                    transition
                    "
                  >
                    {String.fromCharCode(65+i)}. {option}
                  </button>

                ))}

              </div>


            </div>

          ))}

        </div>


      </div>

    </div>
  );
};


export default CBTExam;