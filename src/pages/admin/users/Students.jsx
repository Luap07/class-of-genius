import React, { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Eye,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";


const studentData = [
  {
    id:1,
    name:"Daniel James",
    email:"daniel@gmail.com",
    level:"SS3",
    school:"Bright Academy",
    status:"Active",
    joined:"July 2, 2026",
  },
  {
    id:2,
    name:"Michael Brown",
    email:"michael@gmail.com",
    level:"JSS2",
    school:"Future College",
    status:"Inactive",
    joined:"June 20, 2026",
  },
  {
    id:3,
    name:"Sarah Williams",
    email:"sarah@gmail.com",
    level:"SS1",
    school:"Royal High School",
    status:"Active",
    joined:"June 15, 2026",
  },
];


const levels = [
  "All",
  "JSS1",
  "JSS2",
  "JSS3",
  "SS1",
  "SS2",
  "SS3",
];


const Students = () => {


  const [students,setStudents] = useState(studentData);

  const [search,setSearch] = useState("");

  const [level,setLevel] = useState("All");



  const toggleStatus = (id)=>{

    setStudents(prev =>
      prev.map(student =>
        student.id === id
        ?
        {
          ...student,
          status:
          student.status==="Active"
          ?
          "Inactive"
          :
          "Active"
        }
        :
        student
      )
    );

  };



  const removeStudent = (id)=>{

    setStudents(prev =>
      prev.filter(student=>student.id!==id)
    );

  };



  const filteredStudents = useMemo(()=>{


    return students.filter(student=>{


      const searchMatch =

      student.name
      .toLowerCase()
      .includes(search.toLowerCase())

      ||

      student.email
      .toLowerCase()
      .includes(search.toLowerCase());



      const levelMatch =
      level==="All"
      ||
      student.level===level;



      return searchMatch && levelMatch;


    });


  },[
    students,
    search,
    level
  ]);




  return (

    <div className="p-6 text-white">


      {/* Header */}

      <div className="
      flex
      flex-col
      md:flex-row
      justify-between
      gap-4
      mb-8
      ">


        <div>

          <h1 className="text-3xl font-bold">
            Students
          </h1>

          <p className="text-gray-400 mt-2">
            Manage registered students
          </p>

        </div>



        <button className="
        flex
        items-center
        gap-2
        bg-blue-600
        hover:bg-blue-700
        px-5
        py-3
        rounded-xl
        ">

          <UserPlus size={18}/>

          Add Student

        </button>


      </div>





      {/* Controls */}


      <div className="
      flex
      flex-col
      md:flex-row
      gap-4
      mb-6
      ">


        <div className="
        flex
        items-center
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        px-4
        flex-1
        ">

          <Search
          size={18}
          className="text-gray-400"
          />

          <input

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          placeholder="Search students..."

          className="
          bg-transparent
          outline-none
          px-3
          py-3
          w-full
          "

          />

        </div>



        <select

        value={level}

        onChange={(e)=>setLevel(e.target.value)}

        className="
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        px-5
        outline-none
        "

        >

          {
            levels.map(item=>(

              <option
              key={item}
              className="bg-slate-900"
              >

                {item}

              </option>

            ))
          }


        </select>


      </div>







      {/* Table */}



      <div className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      overflow-hidden
      ">


        <div className="
        grid
        grid-cols-12
        p-4
        text-gray-400
        text-sm
        border-b
        border-slate-800
        ">


          <span className="col-span-2">
            Name
          </span>


          <span className="col-span-3">
            Email
          </span>


          <span>
            Level
          </span>


          <span className="col-span-2">
            School
          </span>


          <span>
            Status
          </span>


          <span className="col-span-2">
            Actions
          </span>


        </div>





        {
          filteredStudents.map(student=>(


            <div

            key={student.id}

            className="
            grid
            grid-cols-12
            items-center
            p-4
            border-b
            border-slate-800
            hover:bg-slate-800/50
            ">


              <div className="col-span-2">

                {student.name}

              </div>



              <div className="
              col-span-3
              text-gray-400
              ">

                {student.email}

              </div>



              <div>

                {student.level}

              </div>




              <div className="col-span-2">

                {student.school}

              </div>




              <div>


                <span className={`
                px-3
                py-1
                rounded-full
                text-xs

                ${
                  student.status==="Active"
                  ?
                  "bg-green-500/20 text-green-400"
                  :
                  "bg-red-500/20 text-red-400"
                }

                `}>

                  {student.status}

                </span>


              </div>





              <div className="
              flex
              gap-2
              ">


                <button
                className="
                p-2
                bg-slate-800
                rounded-lg
                "
                >

                  <Eye size={16}/>

                </button>



                <button

                onClick={()=>toggleStatus(student.id)}

                className="
                p-2
                bg-slate-800
                rounded-lg
                text-yellow-400
                "

                >

                  {
                    student.status==="Active"
                    ?
                    <UserX size={16}/>
                    :
                    <UserCheck size={16}/>
                  }

                </button>




                <button

                onClick={()=>removeStudent(student.id)}

                className="
                p-2
                bg-slate-800
                rounded-lg
                text-red-400
                "

                >

                  <Trash2 size={16}/>

                </button>



              </div>



            </div>


          ))
        }




        {
          filteredStudents.length===0 && (

            <div className="
            p-10
            text-center
            text-gray-400
            ">

              No students found

            </div>

          )
        }



      </div>



    </div>

  );

};


export default Students;