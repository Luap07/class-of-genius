// src/pages/admin/novels/NovelsList.jsx

import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Trash2, BookOpen, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const NovelsList = () => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNovels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("novels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching novels:", error);
    } else {
      setNovels(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  // Memoize statistics so they only recalculate when 'novels' changes
  const { totalNovels, genreStats } = useMemo(() => {
    const total = novels.length;
    const stats = novels.reduce((acc, novel) => {
      const genre = novel.genre || "Unknown";
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});
    return { totalNovels: total, genreStats: stats };
  }, [novels]);

  const deleteNovel = async (id) => {
    if (!window.confirm("Delete this novel?")) return;

    const { error } = await supabase.from("novels").delete().eq("id", id);
    if (error) {
      console.error("Error deleting novel:", error);
      alert("Failed to delete novel.");
      return;
    }
    setNovels((prev) => prev.filter((novel) => novel.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Novels</h1>
          <p className="text-slate-400 mt-2">Manage uploaded novels, chapters and details.</p>
        </div>
        <AdminButton onClick={() => navigate("/admin/novels/create")}>
          <span className="flex items-center gap-2">
            <Plus size={18} /> Add Novel
          </span>
        </AdminButton>
      </div>

      {/* Live Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Novels</p>
          <h2 className="text-3xl font-bold text-blue-400 mt-2">{totalNovels}</h2>
        </div>
        {Object.entries(genreStats).map(([genre, total]) => (
          <div key={genre} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">{genre}</p>
            <h2 className="text-2xl font-bold text-green-400 mt-2">{total}</h2>
          </div>
        ))}
      </div>

      {/* Novels Table */}
      {novels.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <BookOpen size={50} className="mx-auto text-slate-500" />
          <h2 className="text-xl font-bold mt-4">No Novels Found</h2>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-4">Cover</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Genre</th>
                <th className="px-6 py-4">Chapters</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {novels.map((novel) => (
                <tr key={novel.id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <img
                      src={novel.cover_url || "https://via.placeholder.com/80"}
                      alt={novel.title}
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold">{novel.title}</td>
                  <td className="px-6 py-4 text-slate-400">{novel.genre || "Unknown"}</td>
                  <td className="px-6 py-4">{novel.chapters?.length || 0}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        novel.status === "Published"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {novel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button onClick={() => navigate(`/admin/novels/view/${novel.id}`)} className="text-blue-400">
                        <Eye size={20} />
                      </button>
                      <button onClick={() => navigate(`/admin/novels/edit/${novel.id}`)} className="text-blue-400">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteNovel(novel.id)} className="text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NovelsList;