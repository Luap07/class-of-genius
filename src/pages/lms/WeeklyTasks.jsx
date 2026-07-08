// src/pages/lms/WeeklyTasks.jsx

import React, { useMemo, useState } from "react";
import { Search, Filter, Plus } from "lucide-react";

import WeeklyTaskCard from "../../components/lms/WeeklyTaskCard";

import { useWeeklyTasks } from "../../context/LMSContext/WeeklyTaskContext";


const filters = [
  "All",
  "Pending",
  "Completed",
];


const WeeklyTasks = () => {


  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");


  const {
    tasks = [],
  } = useWeeklyTasks();




  const filteredTasks = useMemo(() => {

    return tasks.filter((task) => {


      const matchesFilter =

        filter === "All" ||

        task.status === filter;




      const matchesSearch =

        task.title
        ?.toLowerCase()
        .includes(search.toLowerCase())

        ||

        task.course
        ?.toLowerCase()
        .includes(search.toLowerCase());




      return (

        matchesFilter &&

        matchesSearch

      );


    });


  }, [
    tasks,
    search,
    filter
  ]);






  return (

    <div className="space-y-8">


      {/* Header */}

      <div className="flex justify-between items-start">


        <div>

          <h1 className="text-4xl font-bold">

            Weekly Tasks

          </h1>


          <p className="text-slate-400 mt-2">

            Manage your learning tasks for this week.

          </p>


        </div>



        <button

          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"

        >

          <Plus size={18}/>

          Add Task

        </button>


      </div>






      {/* Search + Filter */}

      <div className="flex flex-col lg:flex-row justify-between gap-5">


        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 lg:w-[450px]">


          <Search
            size={20}
            className="text-slate-500"
          />


          <input

            placeholder="Search task..."

            value={search}

            onChange={(e)=>
              setSearch(e.target.value)
            }

            className="bg-transparent outline-none w-full placeholder:text-slate-500"

          />


        </div>




        <button

          className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl"

        >

          <Filter size={18}/>

          Filters

        </button>



      </div>







      {/* Filter Tabs */}

      <div className="flex flex-wrap gap-3">


        {filters.map((item)=>(


          <button

            key={item}

            onClick={() =>
              setFilter(item)
            }


            className={`px-5 py-3 rounded-xl transition ${
              
              filter === item

              ?

              "bg-blue-600"

              :

              "bg-slate-900 border border-slate-800 hover:bg-slate-800"

            }`}

          >

            {item}

          </button>


        ))}


      </div>









      {/* Task Cards */}

      <div className="space-y-6">


        {filteredTasks.map((task)=>(


          <WeeklyTaskCard

            key={task.id}

            {...task}

            onOpen={() =>
              console.log(
                task.title
              )
            }

          />


        ))}



      </div>









      {/* Empty State */}

      {filteredTasks.length === 0 && (


        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">


          <h2 className="text-2xl font-bold">

            No tasks found

          </h2>



          <p className="text-slate-400 mt-3">

            Create a new task or change your search.

          </p>


        </div>


      )}



    </div>

  );

};


export default WeeklyTasks;