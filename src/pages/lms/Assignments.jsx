import React, { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import AssignmentCard from "../../components/lms/AssignmentCard";

const assignmentData = [
  {
    id: 1,
    title: "Newton's Laws Assignment",
    subject: "Physics",
    description: "Answer questions on Newton's three laws of motion.",
    dueDate: "15 July 2026",
    duration: "45 mins",
    marks: "20 Marks",
    status: "Pending",
  },
  {
    id: 2,
    title: "Organic Chemistry Quiz",
    subject: "Chemistry",
    description: "Complete the quiz on hydrocarbons and alkanes.",
    dueDate: "10 July 2026",
    duration: "30 mins",
    marks: "15 Marks",
    status: "Submitted",
  },
  {
    id: 3,
    title: "Algebra Test",
    subject: "Mathematics",
    description: "Solve equations and simultaneous equations.",
    dueDate: "05 July 2026",
    duration: "1 Hour",
    marks: "25 Marks",
    status: "Overdue",
  },
  {
    id: 4,
    title: "Essay Writing",
    subject: "English",
    description: "Write a 500-word argumentative essay.",
    dueDate: "18 July 2026",
    duration: "2 Days",
    marks: "30 Marks",
    status: "Pending",
  },
];

const filters = ["All", "Pending", "Submitted", "Overdue"];

const Assignments = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredAssignments = useMemo(() => {
    return assignmentData.filter((assignment) => {
      const matchesFilter =
        filter === "All" || assignment.status === filter;

      const matchesSearch =
        assignment.title.toLowerCase().includes(search.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [search, filter]);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">
          Assignments
        </h1>

        <p className="text-slate-400 mt-2">
          Complete your assignments before their due dates.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col lg:flex-row justify-between gap-5">

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 lg:w-[450px]">

          <Search size={20} className="text-slate-500" />

          <input
            placeholder="Search assignment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full placeholder:text-slate-500"
          />

        </div>

        <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl">
          <Filter size={18} />
          Filters
        </button>

      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3">

        {filters.map((item) => (

          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-5 py-3 rounded-xl transition ${
              filter === item
                ? "bg-blue-600"
                : "bg-slate-900 border border-slate-800 hover:bg-slate-800"
            }`}
          >
            {item}
          </button>

        ))}

      </div>

      {/* Cards */}
      <div className="space-y-6">

        {filteredAssignments.map((assignment) => (

          <AssignmentCard
            key={assignment.id}
            {...assignment}
            onOpen={() => console.log(assignment.title)}
          />

        ))}

      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">

          <h2 className="text-2xl font-bold">
            No assignments found
          </h2>

          <p className="text-slate-400 mt-3">
            Try changing your search or selected filter.
          </p>

        </div>

      )}

    </div>
  );
};

export default Assignments;