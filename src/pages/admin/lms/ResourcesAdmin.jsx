// src/pages/admin/lms/ResourcesAdmin.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Video,
  Link,
  Trash2,
  Edit,
  Download,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const ResourcesAdmin = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();

  const [topic, setTopic] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================================
     DATA FETCHING
  ================================= */

  const fetchTopic = async () => {
    const { data, error } = await supabase
      .from("course_topics")
      .select("*")
      .eq("id", topicId)
      .single();

    if (error) console.error("Topic error:", error);
    else setTopic(data);
  };

  const fetchResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("topic_id", topicId)
      .order("created_at", { ascending: false });

    if (error) console.error("Resources error:", error);
    setResources(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTopic();
    fetchResources();
  }, [topicId]);

  /* ================================
     LOGIC
  ================================= */

  const filteredResources = useMemo(() => {
    return resources.filter((item) =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [resources, search]);

  const deleteResource = async (id) => {
    if (!window.confirm("Delete this resource?")) return;

    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchResources();
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "pdf": return <FileText size={40} className="text-red-400" />;
      case "docx": return <FileText size={40} className="text-blue-400" />;
      case "video": return <Video size={40} className="text-purple-400" />;
      case "youtube": return <Link size={40} className="text-green-400" />;
      default: return <FileText size={40} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{topic?.title || "Learning Unit"} Resources</h1>
          <p className="mt-2 text-slate-400">Manage PDFs, documents, videos, and external lessons.</p>
        </div>
        <AdminButton
          icon={<Plus size={18} />}
          onClick={() => navigate(`/admin/lms/topic/${topicId}/resources/create`)}
        >
          Add Resource
        </AdminButton>
      </div>

      {/* SEARCH */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">Loading resources...</div>
      ) : filteredResources.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">
          <FileText size={50} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white">No Resources Yet</h3>
          <p className="mt-2 text-slate-400">Upload PDFs, documents or videos for this learning unit.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500/50"
            >
              <div className="mb-5">{getResourceIcon(resource.resource_type)}</div>
              <h3 className="font-semibold text-white">{resource.title}</h3>
              <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                {resource.description || "No description"}
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => navigate(`/admin/lms/topic/${topicId}/resources/edit/${resource.id}`)}
                  className="rounded-lg bg-green-500/10 p-2 text-green-400"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => deleteResource(resource.id)}
                  className="rounded-lg bg-red-500/10 p-2 text-red-400"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
                {resource.file_url && (
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-blue-500/10 p-2 text-blue-400"
                    title="Open"
                  >
                    <Download size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesAdmin;