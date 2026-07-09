import React, { useEffect, useState } from "react";
import {
  Loader2,
  BookOpen,
  Edit,
  Layers,
  Calendar,
  Tag,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";

const NovelView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNovel = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
      } else {
        setNovel(data);
      }

      setLoading(false);
    };

    fetchNovel();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2
          size={40}
          className="animate-spin text-blue-500"
        />
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="text-center py-20 text-slate-400">
        Novel not found.
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            {novel.title}
          </h1>

          <p className="text-slate-400 mt-2">
            Novel Details
          </p>
        </div>

        <AdminButton
          onClick={() =>
            navigate(`/admin/novels/edit/${novel.id}`)
          }
        >
          <span className="flex items-center gap-2">
            <Edit size={18}/>
            Edit Novel
          </span>
        </AdminButton>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        <div>

          <img
            src={novel.cover_url}
            alt={novel.title}
            className="w-full rounded-2xl object-cover border border-slate-800"
          />

        </div>

        <div className="lg:col-span-2 space-y-6">

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

            <h2 className="text-xl font-bold mb-4">
              Story Information
            </h2>

            <div className="space-y-4">

              <div className="flex gap-3">
                <BookOpen className="text-blue-400"/>
                <span>{novel.title}</span>
              </div>

              <div className="flex gap-3">
                <Tag className="text-blue-400"/>
                <span>{novel.genre}</span>
              </div>

              <div className="flex gap-3">
                <Layers className="text-blue-400"/>
                <span>
                  {novel.chapters?.length || 0} Chapters
                </span>
              </div>

              <div className="flex gap-3">
                <Calendar className="text-blue-400"/>
                <span>
                  {new Date(
                    novel.created_at
                  ).toLocaleDateString()}
                </span>
              </div>

            </div>

          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

            <h2 className="text-xl font-bold mb-3">
              Description
            </h2>

            <p className="text-slate-300 whitespace-pre-wrap">
              {novel.description}
            </p>

          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

            <h2 className="text-xl font-bold mb-3">
              Introduction
            </h2>

            <p className="text-slate-300 whitespace-pre-wrap">
              {novel.introduction}
            </p>

          </div>

        </div>

      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-5">
          Chapters
        </h2>

        {novel.chapters?.length ? (

          <div className="space-y-4">

            {novel.chapters.map((chapter, index) => (

              <div
                key={index}
                className="rounded-xl bg-slate-800 p-5"
              >

                <h3 className="font-bold">
                  Chapter {index + 1}
                </h3>

                <p className="text-blue-400 mt-1">
                  {chapter.title}
                </p>

              </div>

            ))}

          </div>

        ) : (

          <p className="text-slate-400">
            No chapters available.
          </p>

        )}

      </div>

    </div>
  );
};

export default NovelView;