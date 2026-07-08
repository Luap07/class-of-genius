import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
} from "lucide-react";

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate(-1)}
            className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"
          >
            <ArrowLeft />
          </button>

          <div>

            <h1 className="text-4xl font-bold">
              Edit Course
            </h1>

            <p className="mt-2 text-slate-400">
              Editing Course ID:
              <span className="ml-2 font-semibold text-white">
                {id}
              </span>
            </p>

          </div>

        </div>

        <div className="flex gap-3">

          <button
            className="rounded-xl bg-slate-800 px-5 py-3 hover:bg-slate-700 flex items-center gap-2"
          >
            <Eye size={18} />
            Preview
          </button>

          <button
            className="rounded-xl bg-blue-600 px-5 py-3 hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={18} />
            Save
          </button>

        </div>

      </div>

      {/* Placeholder */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">

        <h2 className="text-2xl font-bold">
          Course Editor
        </h2>

        <p className="mt-4 text-slate-400">
          The complete course editing wizard will appear here after the backend is connected.
        </p>

      </div>

      {/* Danger Zone */}

      <div className="rounded-3xl border border-red-700 bg-red-950/30 p-8">

        <h2 className="text-2xl font-bold text-red-400">
          Danger Zone
        </h2>

        <p className="mt-3 text-slate-300">
          Deleting a course removes all modules, lessons, quizzes,
          assignments and resources permanently.
        </p>

        <button
          className="mt-6 rounded-xl bg-red-600 px-5 py-3 hover:bg-red-700 flex items-center gap-2"
        >
          <Trash2 size={18} />
          Delete Course
        </button>

      </div>

    </div>
  );
};

export default EditCourse;