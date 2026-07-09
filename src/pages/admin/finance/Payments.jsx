import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";

import AdminSearch from "../../components/admin/ui/AdminSearch";

const Payments = () => {
  const [search, setSearch] = useState("");

  const [payments] = useState([
    {
      id: 1,
      user: "David Johnson",
      plan: "Premium",
      amount: "$20",
      status: "Completed",
      date: "July 2026"
    },
    {
      id: 2,
      user: "Sarah Williams",
      plan: "Pro",
      amount: "$50",
      status: "Pending",
      date: "July 2026"
    }
  ]);

  const filteredPayments = payments.filter((payment) =>
    payment.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Payments
        </h1>

        <p className="text-slate-400 mt-1">
          Manage user payments and payment status.
        </p>
      </div>


      <AdminSearch
        value={search}
        onChange={setSearch}
        placeholder="Search payments..."
      />


      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-800 text-slate-300">
            <tr>

              <th className="px-6 py-4">
                User
              </th>

              <th className="px-6 py-4">
                Plan
              </th>

              <th className="px-6 py-4">
                Amount
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

            {filteredPayments.map((payment) => (
              <tr
                key={payment.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {payment.user}
                </td>

                <td className="px-6 py-4">
                  {payment.plan}
                </td>

                <td className="px-6 py-4">
                  {payment.amount}
                </td>

                <td className="px-6 py-4">

                  <span
                    className={`flex items-center gap-2 text-sm ${
                      payment.status === "Completed"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >

                    {payment.status === "Completed" ? (
                      <CheckCircle size={16}/>
                    ) : (
                      <XCircle size={16}/>
                    )}

                    {payment.status}

                  </span>

                </td>

                <td className="px-6 py-4">
                  {payment.date}
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

export default Payments;