import React, { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
} from "lucide-react";


const teacherData = [
  {
    id:1,
    name:"Mr. David James",
    email:"david@school.com",
    subject:"Mathematics",
    school:"Bright Academy",
    verification:"Verified",
    status:"Active",
    joined:"July 1, 2026",
  },
  {
    id:2,
    name:"Mrs. Sarah Williams",
    email:"sarah@school.com",
    subject:"Chemistry",
    school:"Future College",
    verification:"Pending",
    status:"Active",
    joined:"June 25, 2026",
  },
  {
    id:3,
    name:"Mr. Michael Brown",
    email:"michael@school.com",
    subject:"Physics",
    school:"Royal High School",
    verification:"Rejected",
    status:"Inactive",
    joined:"June 10, 2026",
  },
];


const subjects = [
  "All",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
];


const Teachers = ()=>{


  const [teachers,setTeachers] = useState(teacherData);

  const [search,setSearch] = useState("");

  const [subject,setSubject] = useState("All");



  const updateVerification=(id,status)=>{

    setTeachers(prev=>

      prev.map(teacher=>

        teacher.id===id
        ?
        {
          ...teacher,
          verification:status
        }
        :
        teacher

      )

    );

  };



  const toggleStatus=(id)=>{


    setTeachers(prev=>

      prev.map(teacher=>

        teacher.id===id
        ?
        {
          ...teacher,
          status:
          teacher.status==="Active"
          ?
          "Inactive"
          :
          "Active"
        }
        :
        teacher

      )

    );


  };



  const deleteTeacher=(id)=>{

    setTeachers(prev=>

      prev.filter(
        teacher=>teacher.id!==id
      )

    );

  };




  const filteredTeachers = useMemo(()=>{


    return teachers.filter(teacher=>{


      const searchMatch =

      teacher.name
      .toLowerCase()
      .includes(search.toLowerCase())

      ||

      teacher.email
      .toLowerCase()
      .includes(search.toLowerCase());



      const subjectMatch =

      subject==="All"

      ||

      teacher.subject===subject;



      return searchMatch && subjectMatch;


    });


  },[
    teachers,
    search,
    subject
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

          <h1 className="
          text-3xl
          font-bold
          ">

            Teachers

          </h1>


          <p className="
          text-gray-400
          mt-2
          ">

            Manage instructors and teaching staff

          </p>

        </div>



        <button className="
        bg-blue-600
        hover:bg-blue-700
        px-5
        py-3
        rounded-xl
        flex
        gap-2
        items-center
        ">

          <UserPlus size={18}/>

          Add Teacher

        </button>


      </div>





      {/* Search */}


      <div className="
      flex
      gap-4
      mb-6
      ">


        <div className="
        flex
        items-center
        flex-1
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        px-4
        ">


          <Search
          size={18}
          className="text-gray-400"
          />


          <input

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          placeholder="Search teachers..."

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

        value={subject}

        onChange={(e)=>setSubject(e.target.value)}

        className="
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        px-5
        "

        >

          {
            subjects.map(item=>(

              <option key={item}>
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
            Teacher
          </span>


          <span className="col-span-3">
            Email
          </span>


          <span>
            Subject
          </span>


          <span className="col-span-2">
            School
          </span>


          <span>
            Verification
          </span>


          <span>
            Status
          </span>


          <span>
            Actions
          </span>


        </div>







        {
          filteredTeachers.map(teacher=>(


            <div

            key={teacher.id}

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

                {teacher.name}

              </div>



              <div className="
              col-span-3
              text-gray-400
              ">

                {teacher.email}

              </div>




              <div>

                {teacher.subject}

              </div>




              <div className="col-span-2">

                {teacher.school}

              </div>





              <div>


                <span className={`
                text-xs
                px-3
                py-1
                rounded-full

                ${
                  teacher.verification==="Verified"
                  &&
                  "bg-green-500/20 text-green-400"
                }

                ${
                  teacher.verification==="Pending"
                  &&
                  "bg-yellow-500/20 text-yellow-400"
                }

                ${
                  teacher.verification==="Rejected"
                  &&
                  "bg-red-500/20 text-red-400"
                }

                `}>

                  {teacher.verification}

                </span>


              </div>






              <div>

                {
                  teacher.status
                }


              </div>





              <div className="
              flex
              gap-2
              ">



                <button

                onClick={()=>updateVerification(
                  teacher.id,
                  "Verified"
                )}

                className="
                p-2
                bg-green-500/20
                text-green-400
                rounded-lg
                "

                >

                  <CheckCircle size={16}/>

                </button>





                <button

                onClick={()=>updateVerification(
                  teacher.id,
                  "Rejected"
                )}

                className="
                p-2
                bg-red-500/20
                text-red-400
                rounded-lg
                "

                >

                  <XCircle size={16}/>

                </button>





                <button

                onClick={()=>toggleStatus(teacher.id)}

                className="
                p-2
                bg-slate-800
                rounded-lg
                "

                >

                  {
                    teacher.status==="Active"
                    ?
                    <UserX size={16}/>
                    :
                    <UserCheck size={16}/>
                  }


                </button>





                <button

                onClick={()=>deleteTeacher(teacher.id)}

                className="
                p-2
                bg-slate-800
                text-red-400
                rounded-lg
                "

                >

                  <Trash2 size={16}/>

                </button>


              </div>



            </div>


          ))
        }



      </div>




    </div>

  );

};


export default Teachers;