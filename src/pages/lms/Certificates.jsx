import React, { useMemo, useState } from "react";
import {
  Search,
  Award,
  Lock,
  Download,
  ShieldCheck,
} from "lucide-react";

import CertificateCard from "../../components/lms/CertificateCard";

const certificates = [
  {
    id: 1,
    course: "Mathematics",
    student: "John Doe",
    issueDate: "12 Jun 2026",
    certificateId: "COG-MATH-2026-001",
    grade: "A+",
    verified: true,
    earned: true,
  },
  {
    id: 2,
    course: "Physics",
    student: "John Doe",
    issueDate: "28 May 2026",
    certificateId: "COG-PHY-2026-014",
    grade: "A",
    verified: true,
    earned: true,
  },
  {
    id: 3,
    course: "Chemistry",
    student: "John Doe",
    issueDate: "",
    certificateId: "Locked",
    grade: "--",
    verified: false,
    earned: false,
  },
];

const Certificates = () => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return certificates.filter(
      (item) =>
        item.course.toLowerCase().includes(search.toLowerCase()) ||
        item.certificateId.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const earnedCount = certificates.filter((c) => c.earned).length;
  const lockedCount = certificates.filter((c) => !c.earned).length;

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">

        <div>
          <h1 className="text-4xl font-bold">
            Certificates
          </h1>

          <p className="text-slate-400 mt-2">
            View, verify and download your course certificates.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 lg:w-[380px]">

          <Search className="text-slate-500" />

          <input
            className="bg-transparent outline-none w-full placeholder:text-slate-500"
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <Award className="text-yellow-400 mb-4" size={36} />
          <h2 className="text-4xl font-bold">
            {earnedCount}
          </h2>
          <p className="text-slate-400 mt-2">
            Certificates Earned
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <Lock className="text-red-400 mb-4" size={36} />
          <h2 className="text-4xl font-bold">
            {lockedCount}
          </h2>
          <p className="text-slate-400 mt-2">
            Locked Certificates
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <ShieldCheck className="text-green-400 mb-4" size={36} />
          <h2 className="text-4xl font-bold">
            100%
          </h2>
          <p className="text-slate-400 mt-2">
            Verification Rate
          </p>
        </div>

      </div>

      {/* Earned Certificates */}
      <div>

        <h2 className="text-3xl font-bold mb-6">
          Earned Certificates
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">

          {filtered
            .filter((item) => item.earned)
            .map((item) => (
              <CertificateCard
                key={item.id}
                {...item}
                onPreview={() =>
                  console.log("Preview:", item.course)
                }
                onDownload={() =>
                  console.log("Download:", item.course)
                }
              />
            ))}

        </div>

      </div>

      {/* Locked Certificates */}
      <div>

        <h2 className="text-3xl font-bold mb-6">
          Locked Certificates
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">

          {filtered
            .filter((item) => !item.earned)
            .map((item) => (

              <div
                key={item.id}
                className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center"
              >

                <Lock
                  className="mx-auto text-slate-500"
                  size={60}
                />

                <h3 className="text-2xl font-bold mt-5">
                  {item.course}
                </h3>

                <p className="text-slate-400 mt-4">
                  Complete this course to unlock your certificate.
                </p>

              </div>

            ))}

        </div>

      </div>

      {/* Footer */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 flex flex-col lg:flex-row justify-between items-center gap-6">

        <div>

          <h2 className="text-2xl font-bold">
            Download All Certificates
          </h2>

          <p className="text-slate-400 mt-2">
            Export your certificates for offline access.
          </p>

        </div>

        <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-600 hover:bg-yellow-700 transition">

          <Download size={20} />

          Download ZIP

        </button>

      </div>

    </div>
  );
};

export default Certificates;