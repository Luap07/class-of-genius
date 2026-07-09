import React from "react";
import {
  Edit,
  Trash2,
  Eye,
  Star
} from "lucide-react";


const NovelTable = ({
  novels = [],
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
                Novel
              </th>


              <th className="px-6 py-4">
                Genre
              </th>


              <th className="px-6 py-4">
                Chapters
              </th>


              <th className="px-6 py-4">
                Reviews
              </th>


              <th className="px-6 py-4">
                Rating
              </th>


              <th className="px-6 py-4">
                Status
              </th>


              <th className="px-6 py-4">
                Actions
              </th>


            </tr>


          </thead>






          <tbody>


          {
            novels.length === 0

            ?

            (

              <tr>

                <td
                  colSpan="7"
                  className="
                    text-center
                    py-10
                    text-slate-500
                  "
                >

                  No novels available

                </td>


              </tr>

            )


            :


            novels.map((novel)=>(


              <tr

                key={novel.id}

                className="
                  border-t
                  border-slate-800
                  hover:bg-slate-800/50
                  transition
                "

              >




                {/* Novel */}

                <td
                  className="
                    px-6
                    py-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >


                    <img

                      src={
                        novel.cover ||
                        "/images/novel-placeholder.png"
                      }

                      alt={novel.title}

                      className="
                        w-12
                        h-16
                        rounded-lg
                        object-cover
                      "

                    />



                    <div>

                      <p
                        className="
                          font-medium
                        "
                      >

                        {novel.title}

                      </p>


                      <p
                        className="
                          text-xs
                          text-slate-500
                        "
                      >

                        By {novel.author || "Unknown"}

                      </p>


                    </div>


                  </div>


                </td>







                {/* Genre */}

                <td
                  className="
                    px-6
                    py-4
                  "
                >

                  {novel.genre || "General"}

                </td>








                {/* Chapters */}

                <td
                  className="
                    px-6
                    py-4
                  "
                >

                  {novel.chapters || 0}

                </td>







                {/* Reviews */}

                <td
                  className="
                    px-6
                    py-4
                  "
                >

                  {novel.reviews || 0}

                </td>







                {/* Rating */}

                <td
                  className="
                    px-6
                    py-4
                  "
                >


                  <div
                    className="
                      flex
                      items-center
                      gap-1
                      text-yellow-400
                    "
                  >

                    <Star
                      size={16}
                      fill="currentColor"
                    />

                    <span>
                      {novel.rating || "0.0"}
                    </span>


                  </div>


                </td>







                {/* Status */}

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
                        novel.status === "Published"
                        ?
                        "bg-green-500/10 text-green-400"
                        :
                        "bg-yellow-500/10 text-yellow-400"
                      }
                    `}
                  >

                    {novel.status || "Draft"}

                  </span>


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
                      items-center
                      gap-3
                    "
                  >


                    <button

                      onClick={() =>
                        onView?.(novel)
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
                        onEdit?.(novel)
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
                        onDelete?.(novel)
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


export default NovelTable;