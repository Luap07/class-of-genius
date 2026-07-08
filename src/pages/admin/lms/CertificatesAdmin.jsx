import React, { useState } from "react";
import {
  Award,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ShieldCheck,
} from "lucide-react";

const initialCertificates = [
  {
    id: 1,
    title: "Frontend Development Certificate",
    courses: 8,
    issued: 3240,
    status: "Active",
  },
  {
    id: 2,
    title: "Artificial Intelligence Certificate",
    courses: 12,
    issued: 1892,
    status: "Active",
  },
  {
    id: 3,
    title: "Business Management Certificate",
    courses: 5,
    issued: 742,
    status: "Draft",
  },
];

const statusColor = {
  Active: "bg-emerald-500/20 text-emerald-400",
  Draft: "bg-yellow-500/20 text-yellow-400",
};

const CertificatesAdmin = () => {
  const [certificates] = useState(initialCertificates);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Certificates
          </h1>

          <p className="mt-2 text-slate-400">
            Manage certificate templates and issuance.
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">

          <Plus size={18} />

          Create Certificate

        </button>

      </div>

      {/* Search */}

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          placeholder="Search certificates..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
        />

      </div>

      {/* Cards */}

      <div className="grid gap-6 lg:grid-cols-2">

        {certificates.map((certificate) => (

          <div
            key={certificate.id}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
          >

            <div className="flex justify-between">

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-yellow-600 p-4">

                  <Award size={28} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    {certificate.title}
                  </h2>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor[certificate.status]}`}
                  >
                    {certificate.status}
                  </span>

                </div>

              </div>

              <div className="flex gap-2">

                <button className="rounded-xl bg-slate-800 p-3 hover:bg-cyan-600">

                  <Eye size={18} />

                </button>

                <button className="rounded-xl bg-slate-800 p-3 hover:bg-blue-600">

                  <Pencil size={18} />

                </button>

                <button className="rounded-xl bg-slate-800 p-3 hover:bg-red-600">

                  <Trash2 size={18} />

                </button>

              </div>

            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-slate-400">

              <div className="flex items-center gap-2">

                <Award size={18} />

                {certificate.courses} Courses

              </div>

              <div className="flex items-center gap-2">

                <ShieldCheck size={18} />

                {certificate.issued.toLocaleString()} Issued

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default CertificatesAdmin;