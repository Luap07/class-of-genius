import React from "react";
import {
  Edit,
  Trash2,
  Eye
} from "lucide-react";


const QuestionTable = ({
  questions = [],
  onEdit,
  onDelete,
  onView
}) => {


  return (

    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        overflow-hidden
      "
    >


      <div className="overflow-x-auto">


        <table
          className="
            w-full
            text-left
          "
        >


          <thead
            className="
              bg-slate-800
              text-slate-300
              text-sm
            "
          >

            <tr>


              <th className="px-6 py-4">
                Question
              </th>


              <th className="px-6 py-4">
                Subject
              </th>


              <th className="px-6 py-4">
                Type
              </th>


              <th className="px-6 py-4">
                Difficulty
              </th>


              <th className="px-6 py-4">
                Marks
              </th>


              <th className="px-6 py-4">
                Actions
              </th>


            </tr>


          </thead>






          <tbody>


          {
            questions.length === 0

            ?

            (

              <tr>

                <td
                  colSpan="6"
                  className="
                    text-center
                    py-10
                    text-slate-500
                  "
                >

                  No questions found

                </td>


              </tr>

            )


            :


            questions.map((question)=>(


              <tr

                key={question.id}

                className="
                  border-t
                  border-slate-800
                  hover:bg-slate-800/50
                  transition
                "

              >




                {/* Question */}

                <td
                  className="
                    px-6
                    py-4
                    max-w-md
                  "
                >

                  <p
                    className="
                      font-medium
                      line-clamp-2
                    "
                  >

                    {question.text || "Untitled question"}

                  </p>


                  <p
                    className="
                      text-xs
                      text-slate-500
                      mt-1
                    "
                  >

                    ID: {question.id}

                  </p>


                </td>







                {/* Subject */}

                <td
                  className="
                    px-6
                    py-4
                  "
                >

                  {question.subject || "General"}

                </td>







                {/* Type */}

                <td
                  className="
                    px-6
                    py-4
                  "
                >


                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      bg-blue-500/10
                      text-blue-400
                    "
                  >

                    {question.type || "MCQ"}

                  </span>


                </td>








                {/* Difficulty */}

                <td
                  className="
                    px-6
                    py-4
                  "
                >


                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      ${
                        question.difficulty === "Hard"
                        ?
                        "bg-red-500/10 text-red-400"
                        :
                        question.difficulty === "Medium"
                        ?
                        "bg-yellow-500/10 text-yellow-400"
                        :
                        "bg-green-500/10 text-green-400"
                      }
                    `}
                  >

                    {question.difficulty || "Easy"}

                  </span>


                </td>







                {/* Marks */}

                <td
                  className="
                    px-6
                    py-4
                  "
                >

                  {question.marks || 1}

                </td>








                {/* Actions */}

                <td
                  className="
                    px-6
                    py-4
                  "
                >

                  <div
                    className="
                      flex
                      gap-3
                    "
                  >



                    <button

                      onClick={() =>
                        onView?.(question)
                      }

                      className="
                        p-2
                        rounded-lg
                        hover:bg-slate-700
                        text-blue-400
                      "

                    >

                      <Eye size={18}/>

                    </button>





                    <button

                      onClick={() =>
                        onEdit?.(question)
                      }

                      className="
                        p-2
                        rounded-lg
                        hover:bg-slate-700
                        text-green-400
                      "

                    >

                      <Edit size={18}/>

                    </button>





                    <button

                      onClick={() =>
                        onDelete?.(question)
                      }

                      className="
                        p-2
                        rounded-lg
                        hover:bg-slate-700
                        text-red-400
                      "

                    >

                      <Trash2 size={18}/>

                    </button>




                  </div>


                </td>



              </tr>


            ))

          }


          </tbody>



        </table>


      </div>


    </div>


  );

};


export default QuestionTable;