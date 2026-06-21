import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NovelEditor from "../components/NovelEditor";
import { Plus, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "scholiqen@gmail.com";

const AdminDashboard = () => {
  const navigate = useNavigate();

  /* ================= NOVELS ================= */
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNovel, setEditingNovel] = useState(null);
  const [creating, setCreating] = useState(false);

  /* ================= CBT ================= */
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);

  /* ================= UI ================= */
  const [activeTab, setActiveTab] = useState("novels");

  /* ================= AUTH ================= */
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      await fetchAll();
    }

    setCheckingAccess(false);
  };

  const fetchAll = async () => {
    setLoading(true);

    const [novelRes, subjectRes, questionRes] = await Promise.all([
      supabase.from("novels").select("*").order("created_at", { ascending: false }),
      supabase.from("cbt_subjects").select("*"),
      supabase.from("cbt_questions").select("*"),
    ]);

    setNovels(novelRes.data || []);
    setSubjects(subjectRes.data || []);
    setQuestions(questionRes.data || []);

    setLoading(false);
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  /* ================= NOVELS DELETE ================= */
  const deleteNovel = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    await supabase.from("novels").delete().eq("id", id);
    fetchAll();
  };

  const editNovel = (novel) => {
    setEditingNovel(novel);
    setCreating(true);
  };

  /* ================= CBT DELETE ================= */
  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    await supabase.from("cbt_questions").delete().eq("id", id);
    fetchAll();
  };

  const editQuestion = (q) => {
    // send to edit page OR later replace with modal
    navigate("/cbt/admin/questions/edit", { state: q });
  };

  /* ================= GUARDS ================= */
  if (checkingAccess) return <div className="text-white p-6">Checking...</div>;
  if (!isAdmin) return <div className="text-red-500 p-6">Access Denied</div>;

  if (creating || editingNovel) {
    return (
      <NovelEditor
        novel={editingNovel}
        onBack={() => {
          setCreating(false);
          setEditingNovel(null);
          fetchAll();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* ================= TABS ================= */}
      <div className="flex gap-3 mb-6">
        {["novels", "cbt"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-600" : "bg-white/10"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================= NOVELS ================= */}
      {activeTab === "novels" && (
        <>
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-bold">Novels</h1>

            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded"
            >
              <Plus size={18} />
              Add Novel
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {novels.map((n) => (
              <div key={n.id} className="bg-white/10 p-3 rounded-xl">

                {n.cover_url && (
                  <img
                    src={n.cover_url}
                    className="h-32 w-full object-cover rounded"
                  />
                )}

                <h2 className="font-bold mt-2">{n.title}</h2>
                <p className="text-xs text-gray-400">{n.genre}</p>

                <div className="flex justify-between mt-2">
                  <button onClick={() => editNovel(n)} className="text-blue-400 flex gap-1">
                    <Edit size={16} /> Edit
                  </button>

                  <button onClick={() => deleteNovel(n.id)} className="text-red-400 flex gap-1">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= CBT ================= */}
      {activeTab === "cbt" && (
        <div className="space-y-6">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">CBT SYSTEM</h2>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/cbt/admin/subjects")}
                className="px-4 py-2 bg-green-600 rounded"
              >
                + Add Subject
              </button>

              <button
                onClick={() => navigate("/cbt/admin/questions")}
                className="px-4 py-2 bg-purple-600 rounded"
              >
                + Add Question
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="bg-white/10 p-4 rounded">
            <p>Subjects: {subjects.length}</p>
            <p>Questions: {questions.length}</p>
          </div>

          {/* ================= CBT QUESTIONS MANAGER ================= */}
          <div className="bg-white/10 p-4 rounded">
            <h3 className="font-bold mb-3">Recent Questions</h3>

            {questions.slice(0, 10).map((q) => (
              <div key={q.id} className="border-b border-white/10 py-3">

                <p className="text-sm">{q.question}</p>

                <div className="flex gap-4 mt-2 text-xs">
                  <button
                    onClick={() => editQuestion(q)}
                    className="text-blue-400 flex gap-1"
                  >
                    <Edit size={14} /> Edit
                  </button>

                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="text-red-400 flex gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};

export default AdminDashboard;