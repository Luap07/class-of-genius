import React from "react";
import { Award, DollarSign } from "lucide-react";

const PricingCertificates = ({ data, setData }) => {

  const updateField = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold">
          Pricing & Certificates
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Configure course payment and completion certificate.
        </p>
      </div>


      <div className="grid md:grid-cols-2 gap-5">

        <div className="bg-[#111827] border border-[#243047] rounded-2xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center">
              <DollarSign size={20}/>
            </div>

            <h3 className="font-semibold">
              Course Pricing
            </h3>

          </div>


          <label className="text-sm text-slate-400">
            Price
          </label>


          <input
            type="number"
            value={data.price || ""}
            onChange={(e) =>
              updateField(
                "price",
                e.target.value
              )
            }
            placeholder="0.00"
            className="w-full mt-2 bg-[#0B1220] border border-[#243047] rounded-xl px-4 py-3 text-white"
          />


          <div className="mt-4 flex items-center gap-3">

            <input
              type="checkbox"
              checked={data.freeCourse || false}
              onChange={(e) =>
                updateField(
                  "freeCourse",
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-slate-300">
              Make this course free
            </span>

          </div>

        </div>



        <div className="bg-[#111827] border border-[#243047] rounded-2xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <Award size={20}/>
            </div>


            <h3 className="font-semibold">
              Certificate
            </h3>

          </div>


          <label className="text-sm text-slate-400">
            Certificate Name
          </label>


          <input
            value={data.certificateName || ""}
            onChange={(e) =>
              updateField(
                "certificateName",
                e.target.value
              )
            }
            placeholder="e.g. Chemistry Mastery Certificate"
            className="w-full mt-2 bg-[#0B1220] border border-[#243047] rounded-xl px-4 py-3 text-white"
          />


          <div className="mt-4 flex items-center gap-3">

            <input
              type="checkbox"
              checked={
                data.certificateEnabled || false
              }
              onChange={(e) =>
                updateField(
                  "certificateEnabled",
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-slate-300">
              Enable completion certificate
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PricingCertificates;