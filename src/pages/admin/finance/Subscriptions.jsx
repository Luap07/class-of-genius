import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";

import AdminSearch from "../../components/admin/ui/AdminSearch";

const Subscriptions = () => {
  const [search, setSearch] = useState("");

  const [subscriptions] = useState([
    {
      id: 1,
      user: "David Johnson",
      plan: "Premium",
      price: "$20/month",
      status: "Active",
      renewal: "August 2026"
    },
    {
      id: 2,
      user: "Sarah Williams",
      plan: "Pro",
      price: "$50/month",
      status: "Expired",
      renewal: "July 2026"
    }
  ]);

  const filteredSubscriptions = subscriptions.filter((subscription) =>
    subscription.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Subscriptions
        </h1>

        <p className="text-slate-400 mt-1">
          Manage user subscription plans and renewals.
        </p>
      </div>


      <AdminSearch
        value={search}
        onChange={setSearch}
        placeholder="Search subscriptions..."
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
                Price
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4">
                Renewal
              </th>

              <th className="px-6 py-4">
                Action
              </th>

            </tr>
          </thead>


          <tbody>

            {filteredSubscriptions.map((subscription) => (
              <tr
                key={subscription.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {subscription.user}
                </td>


                <td className="px-6 py-4">
                  {subscription.plan}
                </td>


                <td className="px-6 py-4">
                  {subscription.price}
                </td>


                <td className="px-6 py-4">

                  <span
                    className={`flex items-center gap-2 ${
                      subscription.status === "Active"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >

                    {subscription.status === "Active" ? (
                      <CheckCircle size={16}/>
                    ) : (
                      <XCircle size={16}/>
                    )}

                    {subscription.status}

                  </span>

                </td>


                <td className="px-6 py-4">
                  {subscription.renewal}
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

export default Subscriptions;