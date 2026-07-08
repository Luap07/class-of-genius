import React, { useMemo, useState } from "react";
import {
  Search,
  School,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Ban,
  ShieldCheck,
} from "lucide-react";


const schoolData = [
  {
    id:1,
    name:"Bright Academy",
    email:"admin@brightacademy.com",
    location:"Lagos, Nigeria",
    students:850,
    teachers:45,
    plan:"Premium",
    verification:"Verified",
    status:"Active",
  },
  {
    id:2,
    name:"Future College",
    email:"info@futurecollege.com",
    location:"Abuja, Nigeria",
    students:620,
    teachers:32,
    plan:"Basic",
    verification:"Pending",
    status:"Active",
  },
  {
    id:3,
    name:"Royal High School",
    email:"contact@royalhigh.com",
    location:"Ibadan, Nigeria",
    students:400,
    teachers:25,
    plan:"Free",
    verification:"Rejected",
    status:"Suspended",
  },
];



const Schools = ()=>{


  const [schools,setSchools] = useState(schoolData);

  const [search,setSearch] = useState("");




  const updateVerification=(id,status)=>{


    setSchools(prev=>

      prev.map(school=>

        school.id===id

        ?

        {
          ...school,
          verification:status
        }

        :

        school

      )

    );


  };





  const toggleSchoolStatus=(id)=>{


    setSchools(prev=>

      prev.map(school=>

        school.id===id

        ?

        {

          ...school,

          status:
          school.status==="Active"
          ?
          "Suspended"
          :
          "Active"

        }

        :

        school

      )

    );


  };





  const deleteSchool=(id)=>{


    setSchools(prev=>

      prev.filter(
        school=>school.id!==id
      )

    );


  };





  const filteredSchools = useMemo(()=>{


    return schools.filter(school=>


      school.name
      .toLowerCase()
      .includes(search.toLowerCase())


      ||

      school.email
      .toLowerCase()
      .includes(search.toLowerCase())


    );


  },[
    schools,
    search
  ]);





  return (

    <div className="p-6 text-white">



      {/* Header */}


      <div className="mb-8">


        <h1 className="
        text-3xl
        font-bold
        flex
        items-center
        gap-3
        ">

          <School/>

          Schools

        </h1>


        <p className="
        text-gray-400
        mt-2
        ">

          Manage registered schools and institutions

        </p>


      </div>







      {/* Search */}



      <div className="
      mb-6
      flex
      items-center
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

        placeholder="Search schools..."

        className="
        bg-transparent
        outline-none
        px-3
        py-3
        w-full
        "

        />


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
            School
          </span>


          <span className="col-span-2">
            Email
          </span>


          <span className="col-span-2">
            Location
          </span>


          <span>
            Students
          </span>


          <span>
            Teachers
          </span>


          <span>
            Plan
          </span>


          <span>
            Status
          </span>


          <span>
            Actions
          </span>


        </div>








        {
          filteredSchools.map(school=>(


            <div

            key={school.id}

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

                {school.name}

              </div>




              <div className="
              col-span-2
              text-gray-400
              text-sm
              ">

                {school.email}

              </div>





              <div className="col-span-2">

                {school.location}

              </div>





              <div>

                {school.students}

              </div>





              <div>

                {school.teachers}

              </div>





              <div>

                <span className="
                bg-blue-500/20
                text-blue-400
                px-3
                py-1
                rounded-full
                text-xs
                ">

                  {school.plan}

                </span>

              </div>





              <div>


                <span className={`
                px-3
                py-1
                rounded-full
                text-xs

                ${
                  school.status==="Active"
                  ?
                  "bg-green-500/20 text-green-400"
                  :
                  "bg-red-500/20 text-red-400"
                }

                `}>

                  {school.status}

                </span>


              </div>






              <div className="
              flex
              gap-2
              ">


                <button

                onClick={()=>updateVerification(
                  school.id,
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
                  school.id,
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

                onClick={()=>toggleSchoolStatus(
                  school.id
                )}

                className="
                p-2
                bg-slate-800
                rounded-lg
                "

                >

                  <Ban size={16}/>

                </button>





                <button

                onClick={()=>deleteSchool(
                  school.id
                )}

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


export default Schools;