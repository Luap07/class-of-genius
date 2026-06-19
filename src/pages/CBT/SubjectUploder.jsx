import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Plus, Trash2 } from "lucide-react";

const SubjectUploader = () => {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [cbtBoard, setCbtBoard] = useState("WAEC");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from("cbt_subjects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch error:", error);
      return;
    }

    setSubjects(data || []);
  };

  const addSubject = async () => {
    if (!subjectName.trim()) return;

    const { error } = await supabase.from("cbt_subjects").insert([
      {
        name: subjectName,
        cbt_board: cbtBoard, // ✅ MUST MATCH DB COLUMN
      },
    ]);

    if (error) {
      console.log("Insert error:", error);
      alert("Failed to add subject (check DB columns)");
      return;
    }

    setSubjectName("");
    fetchSubjects();
  };

  const deleteSubject = async (id) => {
    const confirmDelete = window.confirm("Delete this subject?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("cbt_subjects")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("Delete error:", error);
      return;
    }

    fetchSubjects();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CBT Subjects</h1>

        <button
          onClick={addSubject}
          className="bg-green-600 px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {/* INPUT */}
      <div className="bg-white/10 p-4 rounded mb-6">
        <input
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          placeholder="Subject name"
          className="w-full p-2 mb-3 bg-white/10 rounded"
        />

        <select
          value={cbtBoard}
          onChange={(e) => setCbtBoard(e.target.value)}
          className="w-full p-2 bg-white/10 rounded"
        >
          <option>WAEC</option>
          <option>NECO</option>
          <option>JAMB</option>
          <option>GCE</option>
          <option>IGCSE</option>
        </select>
      </div>

      {/* LIST */}
      <div className="grid md:grid-cols-3 gap-3">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="bg-white/10 p-4 rounded flex justify-between"
          >
            <div>
              <p className="font-bold">{s.name}</p>
              <p className="text-xs text-gray-400">
                {s.cbt_board}
              </p>
            </div>

            <button onClick={() => deleteSubject(s.id)}>
              <Trash2 size={16} className="text-red-400" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default SubjectUploader;