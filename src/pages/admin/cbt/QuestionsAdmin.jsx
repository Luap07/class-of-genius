import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Trash2, Search } from "lucide-react";

const QuestionsAdmin = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("cbt_questions")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setQuestions(data || []);

    } catch (error) {
      console.log("Fetch Questions Error:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchQuestions();
  }, []);


  const deleteQuestion = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this question?"
    );

    if (!confirmDelete) return;


    const { error } = await supabase
      .from("cbt_questions")
      .delete()
      .eq("id", id);


    if (error) {
      console.log(error);
      return;
    }


    setQuestions(
      questions.filter(
        (question) => question.id !== id
      )
    );
  };


  const filteredQuestions = questions.filter((item)=>{

    const text =
      `${item.exam} ${item.subject} ${item.question}`
      .toLowerCase();

    return text.includes(
      search.toLowerCase()
    );

  });


  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-3xl font-bold text-blue-400">
              Manage Questions
            </h1>

            <p className="text-slate-400 mt-1">
              View and manage uploaded CBT questions
            </p>
          </div>


          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              placeholder="Search questions..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2"
            />

          </div>

        </div>



        {loading ? (

          <div className="text-center text-slate-400">
            Loading questions...
          </div>

        ) : filteredQuestions.length === 0 ? (

          <div className="text-center text-slate-500">
            No questions found.
          </div>

        ) : (

          <div className="space-y-5">

            {filteredQuestions.map((item,index)=>(

              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >

                <div className="flex justify-between">

                  <div>

                    <div className="flex gap-3 mb-3">

                      <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs">
                        {item.exam}
                      </span>

                      <span className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 text-xs">
                        {item.subject}
                      </span>

                    </div>


                    <h2 className="font-semibold text-lg">
                      {index + 1}. {item.question}
                    </h2>


                  </div>


                  <button
                    onClick={() =>
                      deleteQuestion(item.id)
                    }
                    className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg"
                  >
                    <Trash2 size={20}/>
                  </button>


                </div>



                <div className="grid md:grid-cols-2 gap-3 mt-5">

                  {item.options?.map((option,i)=>(

                    <div
                      key={i}
                      className="bg-slate-800 rounded-lg p-3 text-sm"
                    >
                      {String.fromCharCode(65+i)}. {option}
                    </div>

                  ))}

                </div>



                <div className="mt-4 text-green-400 text-sm">
                  Correct Answer: {item.answer}
                </div>


                {item.image && (
                  <img
                    src={item.image}
                    alt="question"
                    className="mt-4 max-h-48 rounded-xl"
                  />
                )}


              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default QuestionsAdmin;