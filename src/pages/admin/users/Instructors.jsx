import React, { useState } from "react";

import UserTable from "../../../components/admin/tables/UserTable";
import AdminSearch from "../../../components/admin/ui/AdminSearch";

const Instructors = () => {
  const [search, setSearch] = useState("");

  const [instructors] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john@email.com",
      role: "Instructor",
      status: "Active",
      createdAt: "Jan 2026"
    },
    {
      id: 2,
      name: "Emily Davis",
      email: "emily@email.com",
      role: "Instructor",
      status: "Active",
      createdAt: "Feb 2026"
    },
    {
      id: 3,
      name: "Robert Wilson",
      email: "robert@email.com",
      role: "Instructor",
      status: "Inactive",
      createdAt: "Mar 2026"
    }
  ]);

  const filteredInstructors = instructors.filter((instructor) =>
    instructor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Instructors
        </h1>

        <p className="text-slate-400 mt-1">
          Manage teachers and course instructors.
        </p>
      </div>


      <AdminSearch
        value={search}
        onChange={setSearch}
        placeholder="Search instructors..."
      />


      <UserTable
        users={filteredInstructors}
        onView={(user) => console.log("View", user)}
        onEdit={(user) => console.log("Edit", user)}
        onDelete={(user) => console.log("Delete", user)}
      />

    </div>
  );
};

export default Instructors;