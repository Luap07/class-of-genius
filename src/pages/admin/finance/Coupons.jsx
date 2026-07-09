import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

import AdminButton from "../../components/admin/ui/AdminButton";

const Coupons = () => {
  const [coupons] = useState([
    {
      id: 1,
      code: "GENIUS20",
      discount: "20%",
      usage: 450,
      status: "Active"
    },
    {
      id: 2,
      code: "WELCOME50",
      discount: "50%",
      usage: 120,
      status: "Expired"
    }
  ]);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            Coupons
          </h1>

          <p className="text-slate-400 mt-1">
            Create and manage discount coupons.
          </p>
        </div>


        <AdminButton>
          <span className="flex items-center gap-2">
            <Plus size={18}/>
            Add Coupon
          </span>
        </AdminButton>

      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-800 text-slate-300">
            <tr>

              <th className="px-6 py-4">
                Code
              </th>

              <th className="px-6 py-4">
                Discount
              </th>

              <th className="px-6 py-4">
                Uses
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4">
                Actions
              </th>

            </tr>
          </thead>


          <tbody>

            {coupons.map((coupon) => (
              <tr
                key={coupon.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >

                <td className="px-6 py-4 font-medium">
                  {coupon.code}
                </td>


                <td className="px-6 py-4">
                  {coupon.discount}
                </td>


                <td className="px-6 py-4">
                  {coupon.usage}
                </td>


                <td className="px-6 py-4">

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      coupon.status === "Active"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {coupon.status}
                  </span>

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

export default Coupons;