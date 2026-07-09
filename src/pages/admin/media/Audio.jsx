import React, { useState } from "react";
import { Upload, Trash2, Music } from "lucide-react";

import AdminButton from "../../../components/admin/ui/AdminButton";

const Audio = () => {
  const [audios] = useState([
    {
      id: 1,
      name: "AI Tutor Voice Lesson.mp3",
      size: "12 MB",
      uploaded: "July 2026"
    },
    {
      id: 2,
      name: "English Pronunciation Guide.mp3",
      size: "18 MB",
      uploaded: "July 2026"
    }
  ]);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            Audio Library
          </h1>

          <p className="text-slate-400 mt-1">
            Manage audio lessons and learning materials.
          </p>
        </div>


        <AdminButton>
          <span className="flex items-center gap-2">
            <Upload size={18}/>
            Upload Audio
          </span>
        </AdminButton>

      </div>


      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

        {audios.map((audio) => (
          <div
            key={audio.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
          >

            <div className="h-32 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-purple-400">
              <Music size={40}/>
            </div>


            <h3 className="font-semibold">
              {audio.name}
            </h3>


            <p className="text-sm text-slate-400 mt-1">
              {audio.size} • {audio.uploaded}
            </p>


            <button className="mt-4 text-red-400 flex items-center gap-2">
              <Trash2 size={17}/>
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  );
};

export default Audio;