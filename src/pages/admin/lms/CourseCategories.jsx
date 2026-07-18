// src/pages/admin/lms/CourseCategories.jsx

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, FolderOpen, BookOpen, Loader2, X, Star, CheckCircle2,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

/* ==========================================================
   CONSTANTS
========================================================== */
const CATEGORY_TYPES = ["Academic", "Technology", "Professional", "Creative", "Language"];
const ACADEMIC_LEVELS = ["Primary Education", "Junior Secondary School (JSS)", "Senior Secondary School (SSS)", "University", "Postgraduate"];
const EDUCATION_STAGES = ["School", "Exam Preparation", "University Preparation", "Undergraduate", "Professional"];
const SUBJECT_AREAS = [
  "Mathematics", "Further Mathematics", "Physics", "Chemistry", "Biology", "English Language", 
  "Literature", "Economics", "Government", "Geography", "Computer Science", "Programming", 
  "Artificial Intelligence", "Machine Learning", "Data Science", "Engineering", "Medicine", 
  "Business", "Finance", "Accounting", "Law"
];
const COURSE_TYPES = ["Academic", "Professional", "Certification", "Bootcamp"];
const DEFAULT_COLORS = ["#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#f59e0b", "#22c55e", "#14b8a6"];

const CourseCategories = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "", description: "", image: "", color: DEFAULT_COLORS[0],
    type: "Academic", academic_level: "", education_stage: "",
    subject_area: "", course_type: "Academic", featured: false,
    active: true, sort_order: 1,
  });

  /* ==========================================================
     HELPERS & LOGIC
  ========================================================== */
  const generateSlug = (text) => text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [{ data: categoryData, error: categoryError }, { data: courseData, error: courseError }] = await Promise.all([
        supabase.from("course_categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("courses").select("id, category_id")
      ]);
      if (categoryError) throw categoryError;
      if (courseError) throw courseError;

      const formatted = (categoryData || []).map(cat => ({
        ...cat,
        courses: (courseData || []).filter(c => c.category_id === cat.id).length
      }));
      setCategories(formatted);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const filtered = useMemo(() => {
    return categories.filter(item => 
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.type?.toLowerCase().includes(search.toLowerCase()) ||
      item.subject_area?.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const stats = {
    total: categories.length,
    featured: categories.filter(c => c.featured).length,
    active: categories.filter(c => c.active).length,
    courses: categories.reduce((sum, item) => sum + item.courses, 0)
  };

  const saveCategory = async () => {
    if (!form.name.trim()) return alert("Category name is required.");
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(), slug: generateSlug(form.name), description: form.description,
        image: form.image, color: form.color, type: form.type,
        academic_level: form.academic_level, education_stage: form.education_stage,
        subject_area: form.subject_area, course_type: form.course_type,
        featured: form.featured, active: form.active, sort_order: Number(form.sort_order)
      };

      if (editing) {
        const { error } = await supabase.from("course_categories").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("course_categories").insert(payload);
        if (error) throw error;
      }
      setShowModal(false);
      setEditing(null);
      await loadCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const { count } = await supabase.from("courses").select("*", { head: true, count: "exact" }).eq("category_id", id);
      if ((count || 0) > 0) return alert("Move or delete all courses inside this category first.");
      const { error } = await supabase.from("course_categories").delete().eq("id", id);
      if (error) throw error;
      await loadCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) return (
    <div className="flex h-[70vh] items-center justify-center">
      <Loader2 size={46} className="animate-spin text-cyan-400" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* HEADER & STATS */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">LMS Administration</span>
          <h1 className="mt-4 text-5xl font-black text-white">Course Categories</h1>
          <p className="mt-3 text-slate-400">Manage Academic, Technology, Professional and Creative learning paths.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 font-bold text-white">
          <Plus size={20} /> Create Category
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Categories", value: stats.total, icon: FolderOpen, color: "text-cyan-400" },
          { label: "Featured", value: stats.featured, icon: Star, color: "text-yellow-400" },
          { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Courses", value: stats.courses, icon: BookOpen, color: "text-blue-400" }
        ].map((item, i) => (
          <div key={i} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">{item.label}</p><h2 className="mt-2 text-4xl font-black text-white">{item.value}</h2></div>
              <item.icon size={40} className={item.color} />
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-4 pl-12 text-white" />
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <table className="w-full text-white">
          <thead className="bg-slate-950">
            <tr>
              <th className="p-5 text-left">Category</th><th className="p-5 text-left">Type</th>
              <th className="p-5 text-left">Subject</th><th className="p-5 text-left">Courses</th>
              <th className="p-5 text-left">Status</th><th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cat => (
              <tr key={cat.id} className="border-t border-slate-800">
                <td className="p-5"><div className="flex items-center gap-3"><div className="h-4 w-4 rounded-full" style={{ background: cat.color }} />{cat.name}</div></td>
                <td className="p-5">{cat.type}</td>
                <td className="p-5">{cat.subject_area || "-"}</td>
                <td className="p-5">{cat.courses}</td>
                <td className="p-5">{cat.active ? "Active" : "Disabled"}</td>
                <td className="p-5 flex justify-end gap-3">
                  <button onClick={() => { setEditing(cat); setForm(cat); setShowModal(true); }} className="rounded-xl bg-blue-600 px-4 py-2">Edit</button>
                  <button onClick={() => deleteCategory(cat.id)} className="rounded-xl bg-red-600 px-4 py-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL (Briefly omitted for space; keep your existing AnimatePresence modal here) */}
    </div>
  );
};

export default CourseCategories;