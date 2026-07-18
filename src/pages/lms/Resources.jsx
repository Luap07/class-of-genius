import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Filter,
  FileText,
  File,
  Video,
  PlayCircle,
  Loader2,
  FolderOpen,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import ResourceCard from "../../components/lms/ResourceCard";

const filters = [
  "All",
  "pdf",
  "docx",
  "video",
  "youtube",
];

const Resources = () => {

  /* ==========================================================
      STATE
  ========================================================== */

  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  /* ==========================================================
      FETCH RESOURCES
  ========================================================== */

  useEffect(() => {

    fetchResources();

  }, []);

  const fetchResources = async () => {

    try {

      setLoading(true);

      setError("");

      const {
        data,
        error,
      } = await supabase

        .from("resources")

        .select(`
          *,
          course_topics(
            id,
            title
          )
        `)

        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      setResources(data || []);

    } catch (err) {

      console.error(err);

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  /* ==========================================================
      SEARCH + FILTER
  ========================================================== */

  const filteredResources = useMemo(() => {

    return resources.filter((resource) => {

      const matchesSearch =

        resource.title
          ?.toLowerCase()
          .includes(search.toLowerCase())

        ||

        resource.description
          ?.toLowerCase()
          .includes(search.toLowerCase())

        ||

        resource.course_topics?.title
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =

        filter === "All"

          ? true

          : resource.resource_type === filter;

      return matchesSearch && matchesFilter;

    });

  }, [
    resources,
    search,
    filter,
  ]);

  /* ==========================================================
      STATISTICS
  ========================================================== */

  const stats = useMemo(() => {

    return {

      pdf: resources.filter(

        (item) =>
          item.resource_type === "pdf"

      ).length,

      docx: resources.filter(

        (item) =>
          item.resource_type === "docx"

      ).length,

      video: resources.filter(

        (item) =>
          item.resource_type === "video"

      ).length,

      youtube: resources.filter(

        (item) =>
          item.resource_type === "youtube"

      ).length,

    };

  }, [resources]);

  /* ==========================================================
      ACTIONS
  ========================================================== */

  const openResource = (resource) => {

    if (
      resource.resource_type === "youtube"
    ) {

      window.open(
        resource.youtube_url,
        "_blank"
      );

      return;

    }

    if (resource.file_url) {

      window.open(
        resource.file_url,
        "_blank"
      );

    }

  };

  const downloadResource = (resource) => {

    if (!resource.file_url) return;

    const link =
      document.createElement("a");

    link.href = resource.file_url;

    link.target = "_blank";

    link.download = resource.title;

    document.body.appendChild(link);

    link.click();

    link.remove();

  };

  /* ==========================================================
      LOADING
  ========================================================== */

  if (loading) {

    return (

      <div className="flex justify-center py-32">

        <Loader2
          size={45}
          className="animate-spin text-blue-500"
        />

      </div>

    );

  }

  /* ==========================================================
      ERROR
  ========================================================== */

  if (error) {

    return (

      <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">

        <h2 className="text-2xl font-bold text-red-400">

          Failed to load resources

        </h2>

        <p className="mt-3 text-slate-300">

          {error}

        </p>

      </div>

    );

  }

  /* ==========================================================
      UI
  ========================================================== */

  return (

    <div className="space-y-8">

      {/* HEADER */}

      <div>

        <h1 className="text-4xl font-bold text-white">

          Learning Resources

        </h1>

        <p className="mt-2 text-slate-400">

          Browse every PDF, document,
          uploaded video and YouTube lesson
          available in your enrolled courses.

        </p>

      </div>

      {/* SEARCH */}

      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">

        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 lg:w-[470px]">

          <Search
            size={20}
            className="text-slate-500"
          />

          <input

            placeholder="Search resources..."

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

            className="w-full bg-transparent outline-none placeholder:text-slate-500"

          />

        </div>

        <button className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-3">

          <Filter size={18} />

          Filters

        </button>

      </div>
            {/* FILTERS */}

      <div className="flex flex-wrap gap-3">

        {filters.map((item) => (

          <button

            key={item}

            onClick={() => setFilter(item)}

            className={`
              rounded-xl
              px-5
              py-3
              font-medium
              transition
              ${
                filter === item
                  ? "bg-blue-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }
            `}

          >

            {item.toUpperCase()}

          </button>

        ))}

      </div>

      {/* ===========================
            RESOURCE STATS
      =========================== */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-400">

                PDF Files

              </p>

              <h2 className="mt-2 text-4xl font-bold text-white">

                {stats.pdf}

              </h2>

            </div>

            <div className="rounded-2xl bg-red-500/10 p-4">

              <FileText
                size={28}
                className="text-red-400"
              />

            </div>

          </div>

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-400">

                Documents

              </p>

              <h2 className="mt-2 text-4xl font-bold text-white">

                {stats.docx}

              </h2>

            </div>

            <div className="rounded-2xl bg-blue-500/10 p-4">

              <File
                size={28}
                className="text-blue-400"
              />

            </div>

          </div>

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-400">

                Uploaded Videos

              </p>

              <h2 className="mt-2 text-4xl font-bold text-white">

                {stats.video}

              </h2>

            </div>

            <div className="rounded-2xl bg-purple-500/10 p-4">

              <Video
                size={28}
                className="text-purple-400"
              />

            </div>

          </div>

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-400">

                YouTube Lessons

              </p>

              <h2 className="mt-2 text-4xl font-bold text-white">

                {stats.youtube}

              </h2>

            </div>

            <div className="rounded-2xl bg-red-500/10 p-4">

              <PlayCircle
  size={28}
  className="text-red-400"
/>

            </div>

          </div>

        </div>

      </div>

      {/* ===========================
            RESOURCE GRID
      =========================== */}

      {

        filteredResources.length > 0 ? (

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

            {

              filteredResources.map((resource) => (

                <ResourceCard

                  key={resource.id}

                  resource={resource}

                  onOpen={openResource}

                  onDownload={downloadResource}

                />

              ))

            }

          </div>

        ) : (

          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-slate-700
              bg-slate-900
              py-24
              text-center
            "
          >

            <FolderOpen
              size={60}
              className="mx-auto text-slate-600"
            />

            <h2 className="mt-6 text-2xl font-bold text-white">

              No Resources Found

            </h2>

            <p className="mt-3 text-slate-400">

              No learning materials matched your search.

            </p>

          </div>

        )

      }
          </div>

  );

};

export default Resources;