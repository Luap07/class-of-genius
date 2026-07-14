import React from "react";
import {
  Eye,
  Edit,
  Trash2,
  Check,
  Square,
  BookOpen,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


const CourseTable = ({
  courses = [],
  selectedCourses = [],
  onSelect,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
}) => {

  const navigate = useNavigate();


  const allSelected =
    courses.length > 0 &&
    selectedCourses.length === courses.length;


  return (
    <div className="overflow-x-auto">

      <table className="w-full text-left">

        <thead className="bg-slate-800 text-slate-300">

          <tr>

            <th className="px-6 py-4">
              <button
                onClick={onSelectAll}
                className="text-blue-400"
              >
                {allSelected ? (
                  <Check size={18}/>
                ) : (
                  <Square size={18}/>
                )}
              </button>
            </th>


            <th className="px-6 py-4">
              Course
            </th>

            <th className="px-6 py-4">
              Instructor
            </th>

            <th className="px-6 py-4">
              Category
            </th>

            <th className="px-6 py-4">
              Level
            </th>

            <th className="px-6 py-4">
              Price
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

        {courses.map((course)=>(

          <tr
            key={course.id}
            className="
            border-t
            border-slate-800
            hover:bg-slate-800/50
            transition
            "
          >


            <td className="px-6 py-4">

              <button
                onClick={() => onSelect(course.id)}
                className="text-blue-400"
              >

                {selectedCourses.includes(course.id) ? (
                  <Check size={18}/>
                ) : (
                  <Square size={18}/>
                )}

              </button>

            </td>



            <td className="px-6 py-4">

              <div className="flex items-center gap-4">

                <img
                  src={
                    course.thumbnail ||
                    "https://via.placeholder.com/100"
                  }
                  alt={course.title}
                  className="
                  h-12
                  w-16
                  rounded-lg
                  object-cover
                  bg-slate-700
                  "
                />


                <div>

                  <h3 className="font-semibold text-white">
                    {course.title}
                  </h3>


                  <p className="text-xs text-slate-400">

                    {course.created_at &&
                      new Date(
                        course.created_at
                      ).toLocaleDateString()
                    }

                  </p>

                </div>

              </div>

            </td>



            <td className="px-6 py-4 text-slate-300">
              {course.instructor || "Not Assigned"}
            </td>



            <td className="px-6 py-4 text-slate-300">
              {course.category || "General"}
            </td>



            <td className="px-6 py-4">

              <span
                className="
                rounded-full
                bg-blue-500/10
                px-3
                py-1
                text-xs
                text-blue-400
                "
              >
                {course.level || "Beginner"}
              </span>

            </td>



            <td className="px-6 py-4 text-slate-300">

              {course.price
                ? `₦${course.price}`
                : "Free"
              }

            </td>



            <td className="px-6 py-4">

              <span
                className={`
                rounded-full
                px-3
                py-1
                text-xs
                ${
                  course.status === "Published"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-yellow-500/10 text-yellow-400"
                }
                `}
              >

                {course.status || "Draft"}

              </span>

            </td>



            <td className="px-6 py-4">

              <div className="flex gap-2">


                <button
                  onClick={() =>
                    navigate(
                      `/admin/lms/course/${course.id}/topics`
                    )
                  }
                  className="
                  rounded-lg
                  bg-indigo-500/10
                  p-2
                  text-indigo-400
                  hover:bg-indigo-500/20
                  "
                  title="Learning Units"
                >
                  <BookOpen size={18}/>
                </button>



                <button
                  onClick={() => onView(course)}
                  className="
                  rounded-lg
                  bg-blue-500/10
                  p-2
                  text-blue-400
                  "
                >
                  <Eye size={18}/>
                </button>



                <button
                  onClick={() => onEdit(course)}
                  className="
                  rounded-lg
                  bg-green-500/10
                  p-2
                  text-green-400
                  "
                >
                  <Edit size={18}/>
                </button>



                <button
                  onClick={() => onDelete(course)}
                  className="
                  rounded-lg
                  bg-red-500/10
                  p-2
                  text-red-400
                  "
                >
                  <Trash2 size={18}/>
                </button>


              </div>

            </td>


          </tr>

        ))}



        {courses.length === 0 && (

          <tr>

            <td
              colSpan="8"
              className="
              py-16
              text-center
              text-slate-400
              "
            >
              No courses found
            </td>

          </tr>

        )}


        </tbody>

      </table>

    </div>
  );
};


export default CourseTable;