import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye
} from "lucide-react";

import AdminSearch from "../../components/admin/ui/AdminSearch";

const Transactions = () => {
  const [search, setSearch] = useState("");

  const [transactions] = useState([
    {
      id: 1,
      user: "David Johnson",
      type: "Payment",
      amount: "$20",
      status: "Successful",
      date: "July 2026"
    },
    {
      id: 2,
      user: "Sarah Williams",
      type: "Refund",
      amount: "$10",
      status: "Completed",
      date: "July 2026"
    }
  ]);

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Transactions
        </h1>

        <p className="text-slate-400 mt-1">
          View all financial transactions on the platform.
        </p>
      </div>


      <AdminSearch
        value={search}
        onChange={setSearch}
        placeholder="Search transactions..."
      />


      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-800 text-slate-300">
            <tr>

              <th className="px-6 py-4">
                User
              </th>

              <th className="px-6 py-4">
                Type
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

            {filteredTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {transaction.user}
                </td>


                <td className="px-6 py-4">

                  <span className="flex items-center gap-2">

                    {transaction.type === "Payment" ? (
                      <ArrowDownLeft className="text-green-400" size={17}/>
                    ) : (
                      <ArrowUpRight className="text-red-400" size={17}/>
                    )}

                    {transaction.type}

                  </span>

                </td>


                <td className="px-6 py-4">
                  {transaction.amount}
                </td>


                <td className="px-6 py-4 text-green-400">
                  {transaction.status}
                </td>


                <td className="px-6 py-4">
                  {transaction.date}
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

export default Transactions;