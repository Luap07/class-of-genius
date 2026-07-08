import React, { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Edit,
} from "lucide-react";


const adminData = [
  {
    id:1,
    name:"John Administrator",
    email:"john@classofgenius.com",
    role:"Super Admin",
    permissions:"Full Access",
    status:"Active",
    joined:"July 1, 2026",
  },
  {
    id:2,
    name:"Mary Johnson",
    email:"mary@classofgenius.com",
    role:"Content Admin",
    permissions:"Courses & Novels",
    status:"Active",
    joined:"June 20, 2026",
  },
  {
    id:3,
    name:"David Smith",
    email:"david@classofgenius.com",
    role:"Analytics Admin",
    permissions:"Reports Only",
    status:"Inactive",
    joined:"June 10, 2026",
  },
];



const roles = [
  "All",
  "Super Admin",
  "Content Admin",
  "Analytics Admin",
];



const Admins = ()=>{


  const [admins,setAdmins] = useState(adminData);

  const [search,setSearch] = useState("");

  const [role,setRole] = useState("All");





  const toggleStatus=(id)=>{


    setAdmins(prev=>

      prev.map(admin=>

        admin.id===id

        ?

        {
          ...admin,
          status:
          admin.status==="Active"
          ?
          "Inactive"
          :
          "Active"
        }

        :

        admin

      )

    );


  };






  const deleteAdmin=(id)=>{


    setAdmins(prev=>

      prev.filter(
        admin=>admin.id!==id
      )

    );


  };






  const filteredAdmins = useMemo(()=>{


    return admins.filter(admin=>{


      const searchMatch =

      admin.name
      .toLowerCase()
      .includes(search.toLowerCase())

      ||

      admin.email
      .toLowerCase()
      .includes(search.toLowerCase());




      const roleMatch =

      role==="All"

      ||

      admin.role===role;




      return searchMatch && roleMatch;


    });


  },[
    admins,
    search,
    role
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
          flex
          gap-3
          items-center
          ">

            <Shield/>

            Administrators

          </h1>


          <p className="
          text-gray-400
          mt-2
          ">

            Manage admin accounts and permissions

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

          Add Admin


        </button>



      </div>









      {/* Filters */}



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

          placeholder="Search admins..."

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

        value={role}

        onChange={(e)=>setRole(e.target.value)}

        className="
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        px-5
        "

        >

          {
            roles.map(item=>(

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



          <span className="col-span-3">
            Admin
          </span>


          <span className="col-span-3">
            Email
          </span>


          <span>
            Role
          </span>


          <span className="col-span-2">
            Permissions
          </span>


          <span>
            Status
          </span>


          <span>
            Actions
          </span>



        </div>









        {
          filteredAdmins.map(admin=>(


            <div

            key={admin.id}

            className="
            grid
            grid-cols-12
            items-center
            p-4
            border-b
            border-slate-800
            hover:bg-slate-800/50
            ">



              <div className="col-span-3">

                {admin.name}

              </div>





              <div className="
              col-span-3
              text-gray-400
              ">

                {admin.email}

              </div>





              <div>

                <span className="
                bg-purple-500/20
                text-purple-400
                px-3
                py-1
                rounded-full
                text-xs
                ">

                  {admin.role}

                </span>


              </div>





              <div className="col-span-2 text-sm">

                {admin.permissions}

              </div>





              <div>


                <span className={`
                px-3
                py-1
                rounded-full
                text-xs

                ${
                  admin.status==="Active"
                  ?
                  "bg-green-500/20 text-green-400"
                  :
                  "bg-red-500/20 text-red-400"
                }

                `}>

                  {admin.status}

                </span>


              </div>







              <div className="
              flex
              gap-2
              ">




                <button className="
                p-2
                bg-slate-800
                rounded-lg
                ">

                  <Edit size={16}/>

                </button>





                <button

                onClick={()=>toggleStatus(admin.id)}

                className="
                p-2
                bg-slate-800
                rounded-lg
                "

                >

                  {
                    admin.status==="Active"
                    ?
                    <UserX size={16}/>
                    :
                    <UserCheck size={16}/>
                  }

                </button>






                <button

                onClick={()=>deleteAdmin(admin.id)}

                className="
                p-2
                bg-slate-800
                text-red-400
                rounded-lg
                ">

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


export default Admins;