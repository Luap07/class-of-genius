import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import NovelEditor from "../components/NovelEditor";
import { Plus, Trash2, Edit } from "lucide-react";

const ADMIN_EMAIL = "scholiqen@gmail.com";

const AdminDashboard = () => {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNovel, setEditingNovel] = useState(null);
  const [creating, setCreating] = useState(false);

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  /* ================= CHECK ADMIN ================= */
  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      await fetchNovels();
    }

    setCheckingAccess(false);
  };

  /* ================= FETCH NOVELS ================= */
  const fetchNovels = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("novels")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setNovels(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  /* ================= DELETE ================= */
  const deleteNovel = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this novel?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("novels")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchNovels();
  };

  /* ================= ACCESS DENIED ================= */
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Checking permissions...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-400">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  /* ================= EDITOR ================= */
  if (creating || editingNovel) {
    return (
      <NovelEditor
        novel={editingNovel}
        onBack={() => {
          setCreating(false);
          setEditingNovel(null);
          fetchNovels();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen text-white p-6 bg-gradient-to-br from-[#05070f] via-[#0b1020] to-black">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📚 Admin Dashboard</h1>

        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Novel
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="text-gray-400">Loading novels...</p>
      ) : novels.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No novels found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {novels.map((n) => (
            <div
              key={n.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:scale-[1.02] transition"
            >
              {n.cover_url && (
                <img
                  src={n.cover_url}
                  alt={n.title}
                  className="h-40 w-full object-cover"
                />
              )}

              <div className="p-4">
                <h2 className="font-bold text-lg">{n.title}</h2>

                <p className="text-xs text-gray-400 mt-1">
                  {n.genre}
                </p>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {n.description}
                </p>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setEditingNovel(n)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    <Edit size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteNovel(n.id)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;