import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";

import AdminSearch from "../../components/admin/ui/AdminSearch";

const Withdrawals = () => {
  const [search, setSearch] = useState("");

  const [withdrawals] = useState([
    {
      id: 1,
      instructor: "John Smith",
      amount: "$500",
      method: "Bank Transfer",
      status: "Pending",
      date: "July 2026"
    },
    {
      id: 2,
      instructor: "Emily Davis",
      amount: "$800",
      method: "PayPal",
      status: "Approved",
      date: "July 2026"
    }
  ]);

  const filteredWithdrawals = withdrawals.filter((withdrawal) =>
    withdrawal.instructor
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Withdrawals
        </h1>

        <p className="text-slate-400 mt-1">
          Manage instructor withdrawal requests.
        </p>
      </div>


      <AdminSearch
        value={search}
        onChange={setSearch}
        placeholder="Search withdrawals..."
      />


      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-800 text-slate-300">
            <tr>

              <th className="px-6 py-4">
                Instructor
              </th>

              <th className="px-6 py-4">
                Amount
              </th>

              <th className="px-6 py-4">
                Method
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4">
                Date
              </th>

              <th className="px-6 py-4">
                Action
              </th>

            </tr>
          </thead>


          <tbody>

            {filteredWithdrawals.map((withdrawal) => (
              <tr
                key={withdrawal.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {withdrawal.instructor}
                </td>


                <td className="px-6 py-4">
                  {withdrawal.amount}
                </td>


                <td className="px-6 py-4">
                  {withdrawal.method}
                </td>


                <td className="px-6 py-4">

                  <span
                    className={`flex items-center gap-2 ${
                      withdrawal.status === "Approved"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >

                    {withdrawal.status === "Approved" ? (
                      <CheckCircle size={16}/>
                    ) : (
                      <XCircle size={16}/>
                    )}

                    {withdrawal.status}

                  </span>

                </td>


                <td className="px-6 py-4">
                  {withdrawal.date}
                </td>


                <td className="px-6 py-4">

                  <button className="text-blue-400">
                    <Eye size={18}/>
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Withdrawals;