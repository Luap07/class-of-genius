import React from "react";
import {
  Edit,
  Trash2,
  Eye
} from "lucide-react";


const UserTable = ({
  users = [],
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
                User
              </th>


              <th className="px-6 py-4">
                Email
              </th>


              <th className="px-6 py-4">
                Role
              </th>


              <th className="px-6 py-4">
                Status
              </th>


              <th className="px-6 py-4">
                Joined
              </th>


              <th className="px-6 py-4">
                Actions
              </th>


            </tr>

          </thead>






          <tbody>


          {
            users.length === 0

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

                  No users found

                </td>


              </tr>

            )


            :


            users.map((user)=>(


              <tr

                key={user.id}

                className="
                  border-t
                  border-slate-800
                  hover:bg-slate-800/50
                  transition
                "

              >




                {/* User */}

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


                    <div
                      className="
                        w-11
                        h-11
                        rounded-full
                        bg-blue-600
                        flex
                        items-center
                        justify-center
                        font-bold
                      "
                    >

                      {
                        user.name
                        ?
                        user.name.charAt(0).toUpperCase()
                        :
                        "U"
                      }

                    </div>



                    <div>

                      <p
                        className="
                          font-medium
                        "
                      >

                        {user.name || "Unknown User"}

                      </p>


                      <p
                        className="
                          text-xs
                          text-slate-500
                        "
                      >

                        ID: {user.id}

                      </p>


                    </div>



                  </div>


                </td>






                {/* Email */}

                <td
                  className="
                    px-6
                    py-4
                    text-slate-300
                  "
                >

                  {user.email || "No email"}

                </td>







                {/* Role */}

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
                      bg-blue-500/10
                      text-blue-400
                      text-xs
                    "
                  >

                    {user.role || "Student"}

                  </span>


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
                        user.status === "Active"
                        ?
                        "bg-green-500/10 text-green-400"
                        :
                        "bg-red-500/10 text-red-400"
                      }
                    `}
                  >

                    {user.status || "Inactive"}

                  </span>


                </td>




                {/* Joined */}

                <td
                  className="
                    px-6
                    py-4
                    text-slate-400
                  "
                >

                  {user.createdAt || "N/A"}

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
                        onView?.(user)
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
                        onEdit?.(user)
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
                        onDelete?.(user)
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



export default UserTable;