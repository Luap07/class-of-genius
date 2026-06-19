import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Plus, Trash2 } from "lucide-react";

const AdminQuestionUploader = () => {
  /* ================= STATE ================= */
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [subjectName, setSubjectName] = useState("");
  const [examBoard, setExamBoard] = useState("WAEC");

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [subject, setSubject] = useState("");
  const [image, setImage] = useState(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [subRes, qRes] = await Promise.all([
      supabase.from("cbt_subjects").select("*").order("created_at", { ascending: false }),
      supabase.from("cbt_questions").select("*").order("created_at", { ascending: false }),
    ]);

    setSubjects(subRes.data || []);
    setQuestions(qRes.data || []);
  };

  /* ================= UPLOAD IMAGE ================= */
  const uploadImage = async (file) => {
    if (!file) return "";

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("question-images")
      .upload(fileName, file);

    if (error) {
      alert("Image upload failed");
      return "";
    }

    const { data } = supabase.storage
      .from("question-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  /* ================= ADD SUBJECT ================= */
  const addSubject = async () => {
    if (!subjectName) return;

    await supabase.from("cbt_subjects").insert([
      {
        name: subjectName,
        exam_board: examBoard,
      },
    ]);

    setSubjectName("");
    fetchAll();
  };

  /* ================= ADD QUESTION ================= */
  const addQuestion = async () => {
    if (!question || !answer || !subject) return;

    const imageUrl = await uploadImage(image);

    await supabase.from("cbt_questions").insert([
      {
        question,
        options,
        answer,
        subject,
        image_url: imageUrl,
      },
    ]);

    setQuestion("");
    setOptions(["", "", "", ""]);
    setAnswer("");
    setSubject("");
    setImage(null);

    fetchAll();
  };

  /* ================= DELETE SUBJECT ================= */
  const deleteSubject = async (id) => {
    await supabase.from("cbt_subjects").delete().eq("id", id);
    fetchAll();
  };

  /* ================= DELETE QUESTION ================= */
  const deleteQuestion = async (id) => {
    await supabase.from("cbt_questions").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* ================= HEADER ================= */}
      <h1 className="text-2xl font-bold mb-6">CBT Admin Panel</h1>

      {/* ================= ADD SUBJECT ================= */}
      <div className="bg-white/10 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Add Subject</h2>

        <div className="flex gap-2">
          <input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Subject name"
            className="p-2 bg-white/10 flex-1"
          />

          <select
            value={examBoard}
            onChange={(e) => setExamBoard(e.target.value)}
            className="p-2 bg-white/10"
          >
            <option>WAEC</option>
            <option>NECO</option>
            <option>JAMB</option>
            <option>GCE</option>
            <option>IGCSE</option>
          </select>

          <button
            onClick={addSubject}
            className="bg-green-600 px-4 rounded"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* ================= ADD QUESTION ================= */}
      <div className="bg-white/10 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Add Question</h2>

        <input
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 bg-white/10 mb-2"
        />

        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 bg-white/10 mb-2"
        />

        {options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => {
              const newOpt = [...options];
              newOpt[i] = e.target.value;
              setOptions(newOpt);
            }}
            className="w-full p-2 bg-white/10 mb-2"
          />
        ))}

        <input
          placeholder="Correct Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-2 bg-white/10 mb-2"
        />

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-3"
        />

        <button
          onClick={addQuestion}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Add Question
        </button>
      </div>

      {/* ================= SUBJECT LIST ================= */}
      <div className="mb-6">
        <h2 className="font-bold mb-2">Subjects</h2>

        <div className="grid md:grid-cols-3 gap-3">
          {subjects.map((s) => (
            <div key={s.id} className="bg-white/10 p-3 rounded flex justify-between">
              <div>
                <p className="font-bold">{s.name}</p>
                <p className="text-xs text-gray-400">{s.exam_board}</p>
              </div>

              <button onClick={() => deleteSubject(s.id)}>
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= QUESTION LIST ================= */}
      <div>
        <h2 className="font-bold mb-2">Questions</h2>

        <div className="grid md:grid-cols-3 gap-3">
          {questions.map((q) => (
            <div key={q.id} className="bg-white/10 p-3 rounded">

              {q.image_url && (
                <img
                  src={q.image_url}
                  className="w-full h-28 object-cover rounded mb-2"
                />
              )}

              <p className="font-bold">{q.question}</p>
              <p className="text-xs text-gray-400">{q.subject}</p>

              <button
                onClick={() => deleteQuestion(q.id)}
                className="mt-2 text-red-400 flex gap-1"
              >
                <Trash2 size={14} /> Delete
              </button>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminQuestionUploader;