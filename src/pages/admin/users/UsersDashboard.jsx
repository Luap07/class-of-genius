import React from "react";
import {
  Users,
  GraduationCap,
  School,
  ShieldCheck,
  UserPlus,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const stats = [
  {
    title: "Total Users",
    value: "24,850",
    icon: Users,
    color: "blue",
  },
  {
    title: "Students",
    value: "21,430",
    icon: GraduationCap,
    color: "green",
  },
  {
    title: "Teachers",
    value: "1,850",
    icon: School,
    color: "purple",
  },
  {
    title: "Admins",
    value: "120",
    icon: ShieldCheck,
    color: "red",
  },
];


const recentUsers = [
  {
    name: "Daniel James",
    role: "Student",
    email: "daniel@email.com",
    date: "Today",
  },
  {
    name: "Sarah Williams",
    role: "Teacher",
    email: "sarah@email.com",
    date: "Yesterday",
  },
  {
    name: "Bright Academy",
    role: "School",
    email: "info@brightacademy.com",
    date: "2 days ago",
  },
];


const quickLinks = [
  {
    title:"Manage Students",
    path:"/admin/users/students",
    icon:GraduationCap,
  },
  {
    title:"Manage Teachers",
    path:"/admin/users/teachers",
    icon:School,
  },
  {
    title:"Manage Schools",
    path:"/admin/users/schools",
    icon:Users,
  },
  {
    title:"Manage Admins",
    path:"/admin/users/admins",
    icon:ShieldCheck,
  },
];


const UsersDashboard = () => {


  const navigate = useNavigate();



  return (

    <div className="p-6 text-white">


      {/* Header */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Users Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          Monitor and manage all platform users
        </p>

      </div>



      {/* Stats */}

      <div className="
      grid
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-4
      gap-6
      mb-10
      ">


        {
          stats.map((item)=>{


            const Icon=item.icon;


            return (

              <div

              key={item.title}

              className="
              bg-slate-900
              border border-slate-800
              rounded-2xl
              p-6
              hover:-translate-y-1
              transition
              "

              >


                <div className="
                flex
                justify-between
                items-center
                ">


                  <div className="
                  p-3
                  rounded-xl
                  bg-slate-800
                  ">

                    <Icon size={25}/>

                  </div>


                  <TrendingUp
                  className="text-green-400"
                  size={20}
                  />


                </div>



                <h2 className="
                text-gray-400
                mt-5
                ">

                  {item.title}

                </h2>


                <p className="
                text-3xl
                font-bold
                mt-2
                ">

                  {item.value}

                </p>


              </div>

            )


          })
        }


      </div>





      <div className="
      grid
      lg:grid-cols-3
      gap-6
      ">




        {/* Recent Users */}

        <div className="
        lg:col-span-2
        bg-slate-900
        border border-slate-800
        rounded-2xl
        p-6
        ">


          <div className="
          flex
          justify-between
          mb-5
          ">

            <h2 className="text-xl font-bold">
              Recent Users
            </h2>


            <UserPlus/>

          </div>



          <div className="space-y-4">


          {
            recentUsers.map((user,index)=>(


              <div

              key={index}

              className="
              flex
              justify-between
              items-center
              bg-slate-800/50
              rounded-xl
              p-4
              "

              >


                <div>

                  <h3 className="font-semibold">
                    {user.name}
                  </h3>


                  <p className="
                  text-sm
                  text-gray-400
                  ">
                    {user.email}
                  </p>


                </div>




                <div className="text-right">


                  <span className="
                  bg-blue-500/20
                  text-blue-400
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  ">

                    {user.role}

                  </span>


                  <p className="
                  text-xs
                  text-gray-500
                  mt-2
                  ">

                    {user.date}

                  </p>


                </div>


              </div>


            ))
          }


          </div>


        </div>





        {/* Quick Management */}


        <div className="
        bg-slate-900
        border border-slate-800
        rounded-2xl
        p-6
        ">


          <h2 className="
          text-xl
          font-bold
          mb-5
          ">

            User Management

          </h2>



          <div className="space-y-3">


          {
            quickLinks.map((item)=>{


              const Icon=item.icon;


              return (

                <button

                key={item.title}

                onClick={()=>navigate(item.path)}

                className="
                w-full
                flex
                items-center
                justify-between
                bg-slate-800
                hover:bg-slate-700
                rounded-xl
                p-4
                transition
                ">


                  <div className="
                  flex
                  items-center
                  gap-3
                  ">

                    <Icon size={20}/>

                    <span>
                      {item.title}
                    </span>


                  </div>


                  <ArrowRight size={18}/>


                </button>

              )


            })
          }


          </div>


        </div>


      </div>



    </div>

  );

};


export default UsersDashboard;