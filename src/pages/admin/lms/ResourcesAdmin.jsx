import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, FileText, Video, Link, Trash2, Edit, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const ResourcesAdmin = () => {
  const navigate = useNavigate();
  const { topicId, courseId } = useParams(); // Capture both possible params

  const [topic, setTopic] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from("resources").select("*");

    // Logic: If topicId exists, filter by it. Otherwise, filter by courseId.
    if (topicId) {
      query = query.eq("topic_id", topicId);
      
      // Also fetch topic name for the header
      const { data: topicData } = await supabase
        .from("course_topics")
        .select("title")
        .eq("id", topicId)
        .single();
      setTopic(topicData);
    } else if (courseId) {
      query = query.eq("course_id", courseId);
    } else {
      console.error("NO ID PROVIDED IN URL");
      setLoading(false);
      return;
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) console.error("Error fetching resources:", error);
    setResources(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [topicId, courseId]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) =>
      item.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [resources, search]);

  const deleteResource = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchData();
  };

  const openCreateResource = () => {
    if (topicId) {
      navigate(`/admin/lms/topic/${topicId}/resources/create`);
    } else if (courseId) {
      // Handle navigation for creating a course-level resource if needed
      alert("Please navigate to a specific topic to add a resource.");
    }
  };

  // ... (getResourceIcon function remains the same as your original code)
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
      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {topic?.title || "Resources"}
          </h1>
          <p className="mt-2 text-slate-400">Manage PDFs, documents, videos and lessons.</p>
        </div>
        {topicId && <AdminButton onClick={openCreateResource}><Plus size={18} className="mr-2" /> Add Resource</AdminButton>}
      </div>

      {/* Search and List UI remains the same... */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading resources...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5">{getResourceIcon(resource.resource_type)}</div>
              <h3 className="font-bold text-white">{resource.title}</h3>
              <div className="mt-5 flex gap-3">
                <button onClick={() => navigate(`/admin/lms/topic/${topicId || resource.topic_id}/resources/edit/${resource.id}`)} className="rounded-lg bg-yellow-500/10 p-2 text-yellow-400"><Edit size={18} /></button>
                <button onClick={() => deleteResource(resource.id)} className="rounded-lg bg-red-500/10 p-2 text-red-400"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesAdmin;