import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const Roles = () => {
  const [roles] = useState([
    {
      id: 1,
      name: "Super Admin",
      permissions: "All Access",
      users: 2
    },
    {
      id: 2,
      name: "Instructor",
      permissions: "Course Management",
      users: 150
    },
    {
      id: 3,
      name: "Student",
      permissions: "Learning Access",
      users: 70000
    }
  ]);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            Roles & Permissions
          </h1>

          <p className="text-slate-400 mt-1">
            Manage user roles and access permissions.
          </p>
        </div>


        <AdminButton>
          <span className="flex items-center gap-2">
            <Plus size={18}/>
            Add Role
          </span>
        </AdminButton>

      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-800 text-slate-300">
            <tr>

              <th className="px-6 py-4">
                Role
              </th>

              <th className="px-6 py-4">
                Permissions
              </th>

              <th className="px-6 py-4">
                Users
              </th>

              <th className="px-6 py-4">
                Actions
              </th>

            </tr>
          </thead>


          <tbody>

            {roles.map((role) => (
              <tr
                key={role.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {role.name}
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {role.permissions}
                </td>

                <td className="px-6 py-4">
                  {role.users}
                </td>

                <td className="px-6 py-4">

                  <div className="flex gap-3">

                    <button className="text-blue-400">
                      <Edit size={18}/>
                    </button>


                    <button className="text-red-400">
                      <Trash2 size={18}/>
                    </button>

                  </div>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Roles;