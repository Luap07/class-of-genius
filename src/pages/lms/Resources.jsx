import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  FileText,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";

import ResourceCard from "../../components/lms/ResourceCard";

const resources = [
  {
    id: 1,
    title: "Newton's Laws Notes",
    subject: "Physics",
    type: "pdf",
    size: "2.3 MB",
    uploaded: "July 2026",
    description:
      "Complete notes covering Newton's three laws of motion.",
  },
  {
    id: 2,
    title: "Organic Chemistry Slides",
    subject: "Chemistry",
    type: "ppt",
    size: "5.1 MB",
    uploaded: "June 2026",
    description:
      "Lecture slides on hydrocarbons and organic reactions.",
  },
  {
    id: 3,
    title: "Human Anatomy",
    subject: "Biology",
    type: "image",
    size: "4.8 MB",
    uploaded: "July 2026",
    description:
      "High-resolution anatomical diagrams for revision.",
  },
  {
    id: 4,
    title: "Calculus Formula Sheet",
    subject: "Mathematics",
    type: "pdf",
    size: "900 KB",
    uploaded: "May 2026",
    description:
      "Important calculus formulas for quick revision.",
  },
  {
    id: 5,
    title: "Programming Fundamentals",
    subject: "Computer Science",
    type: "doc",
    size: "1.7 MB",
    uploaded: "July 2026",
    description:
      "Introduction to programming concepts and algorithms.",
  },
];

const filters = ["All", "pdf", "doc", "ppt", "image"];

const Resources = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesFilter =
        filter === "All" || resource.type === filter;

      const matchesSearch =
        resource.title.toLowerCase().includes(search.toLowerCase()) ||
        resource.subject.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [search, filter]);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">
          Learning Resources
        </h1>

        <p className="text-slate-400 mt-2">
          Access notes, slides, diagrams, and study materials.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col lg:flex-row justify-between gap-5">

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 lg:w-[450px]">

          <Search size={20} className="text-slate-500" />

          <input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full placeholder:text-slate-500"
          />

        </div>

        <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl">
          <Filter size={18} />
          Filters
        </button>

      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3">

        {filters.map((item) => (

          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-5 py-3 rounded-xl transition ${
              filter === item
                ? "bg-blue-600"
                : "bg-slate-900 border border-slate-800 hover:bg-slate-800"
            }`}
          >
            {item.toUpperCase()}
          </button>

        ))}

      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <FileText className="text-red-400 mb-4" size={32} />
          <h3 className="text-2xl font-bold">
            PDFs
          </h3>
          <p className="text-slate-400">
            Revision notes and manuals.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <BookOpen className="text-blue-400 mb-4" size={32} />
          <h3 className="text-2xl font-bold">
            Documents
          </h3>
          <p className="text-slate-400">
            Study guides and handouts.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
          <ImageIcon className="text-purple-400 mb-4" size={32} />
          <h3 className="text-2xl font-bold">
            Diagrams
          </h3>
          <p className="text-slate-400">
            Images and illustrations.
          </p>
        </div>

      </div>

      {/* Resource Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

        {filteredResources.map((resource) => (

          <ResourceCard
            key={resource.id}
            {...resource}
            onView={() => console.log("Preview:", resource.title)}
            onDownload={() => console.log("Download:", resource.title)}
          />

        ))}

      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">

          <h2 className="text-2xl font-bold">
            No resources found
          </h2>

          <p className="text-slate-400 mt-3">
            Try another search term or filter.
          </p>

        </div>

      )}

    </div>
  );
};

export default Resources;