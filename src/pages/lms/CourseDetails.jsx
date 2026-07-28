import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Clock3,
  GraduationCap,
  Users,
  Star,
  Trophy,
  PlayCircle,
  FileText,
  ExternalLink,
  Download,
} from "lucide-react";

import ModuleCard from "../../components/courses/ModuleCard";
import { useCourses } from "../../context/LMSContext/CourseContext";

const CourseDetails = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const {
    courses = [],
    documents = [],
    openModule,
  } = useCourses();
  console.log("Courses:", courses);
console.log("Documents:", documents);
console.log("Current ID:", id);

  /* ==========================================
      FIND COURSE OR DOCUMENT
  ========================================== */

  const course =
    courses.find(
      (item) => String(item.id) === String(id)
    ) || null;

  const document =
  documents.find(
    (item) =>
      String(item.id) === String(id) ||
      String(item.course_id) === String(id)
  ) || null;

  if (!course && !document) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <div className="text-center">

          <BookOpen
            size={70}
            className="mx-auto text-slate-600"
          />

          <h1 className="mt-6 text-3xl font-bold">
            Resource Not Found
          </h1>

          <p className="mt-4 text-slate-400">
            This learning resource doesn't exist.
          </p>

          <button
            onClick={() => navigate("/subjects")}
            className="mt-8 rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950"
          >
            Back to Categories
          </button>

        </div>
      </div>
    );
  }

  const data = course || document;

  const title =
    data.title || "Untitled Resource";

  const description =
    data.description ||
    "No description available.";

  const thumbnail =
    data.thumbnail ||
    data.thumbnail_url ||
    "";

  const category =
    data.category ||
    data.course_categories?.name ||
    "General";

  const instructor =
    data.instructor ||
    "Class Of Genius";

  const duration =
    data.duration ||
    "Self Paced";

  const level =
    data.level ||
    "All Levels";

  const rating =
    data.rating ||
    5;

  const students =
    data.students ||
    0;

  const modules =
    data.modules || [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">

      {/* ==========================================
          BACK
      ========================================== */}

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-cyan-400"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* ==========================================
          HERO
      ========================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
        "
      >

        <div className="grid lg:grid-cols-2">

          {/* LEFT */}

          <div className="flex h-[350px] items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700">

            {thumbnail ? (

              <img
                src={thumbnail}
                alt={title}
                className="h-full w-full object-cover"
              />

            ) : (

              <FileText
                size={120}
                className="text-white/80"
              />

            )}

          </div>

          {/* RIGHT */}

          <div className="flex flex-col justify-center p-8">

            <span
              className="
                w-fit
                rounded-full
                bg-cyan-500/20
                px-4
                py-2
                text-sm
                font-semibold
                text-cyan-300
              "
            >
              {category}
            </span>

            <h1 className="mt-6 text-5xl font-black">
              {title}
            </h1>

            <p className="mt-6 leading-8 text-slate-400">
              {description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-5">

              <div className="flex items-center gap-3">

                <GraduationCap className="text-cyan-400" />

                <div>

                  <p className="text-sm text-slate-500">
                    Level
                  </p>

                  <p>{level}</p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <Clock3 className="text-blue-400" />

                <div>

                  <p className="text-sm text-slate-500">
                    Duration
                  </p>

                  <p>{duration}</p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <Users className="text-violet-400" />

                <div>

                  <p className="text-sm text-slate-500">
                    Students
                  </p>

                  <p>{students}</p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <Star
                  className="fill-yellow-400 text-yellow-400"
                />

                <div>

                  <p className="text-sm text-slate-500">
                    Rating
                  </p>

                  <p>{rating}</p>

                </div>

              </div>

            </div>

            <div className="mt-10 flex flex-wrap gap-4">

              <button
                className="
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  bg-cyan-500
                  px-6
                  py-3
                  font-semibold
                  text-slate-950
                "
              >
                <PlayCircle size={20} />
                Start Learning
              </button>
                            {document?.file_url && (
                <button
                  onClick={() =>
                    window.open(
                      document.file_url,
                      "_blank"
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-cyan-500/20
                    bg-cyan-500/10
                    px-6
                    py-3
                    font-semibold
                    text-cyan-300
                    transition
                    hover:bg-cyan-500/20
                  "
                >
                  <ExternalLink size={20} />
                  Open Resource
                </button>
              )}

              {document?.file_url && (
                <a
                  href={document.file_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-slate-700
                    px-6
                    py-3
                    font-semibold
                    transition
                    hover:border-cyan-500
                  "
                >
                  <Download size={20} />
                  Download
                </a>
              )}

            </div>

          </div>

        </div>

      </motion.div>

      {/* ==========================================
          CONTENT
      ========================================== */}

      <div className="grid gap-8 xl:grid-cols-3">

        {/* =========================
            RESOURCE
        ========================= */}

        <div className="xl:col-span-2">

          <div
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              overflow-hidden
            "
          >

            <div className="border-b border-slate-800 p-6">

              <h2 className="text-3xl font-bold">
                Learning Resource
              </h2>

              <p className="mt-2 text-slate-400">
                Read the uploaded material directly from
                Document Admin.
              </p>

            </div>

            {document?.file_url ? (

              <iframe
                src={document.file_url}
                title={title}
                className="h-[850px] w-full"
              />

            ) : (

              <div className="p-20 text-center">

                <FileText
                  size={70}
                  className="mx-auto text-slate-600"
                />

                <h3 className="mt-8 text-2xl font-bold">
                  No Document Uploaded
                </h3>

                <p className="mt-4 text-slate-400">
                  The administrator hasn't uploaded
                  any learning resource yet.
                </p>

              </div>

            )}

          </div>

          {course && (
            <div className="mt-8">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-3xl font-bold">
                    Course Modules
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Continue learning through modules.
                  </p>

                </div>

                <span
                  className="
                    rounded-full
                    bg-cyan-500/10
                    px-4
                    py-2
                    font-semibold
                    text-cyan-300
                  "
                >
                  {modules.length} Modules
                </span>

              </div>

              {modules.length ? (

                <div className="space-y-6">

{modules.map((module, index) => (
                    <ModuleCard
  key={module.id}
  index={index}
  module={module}
  onOpen={openModule}
/>

                  ))}

                </div>

              ) : (

                <div
                  className="
                    rounded-3xl
                    border
                    border-dashed
                    border-slate-700
                    p-16
                    text-center
                  "
                >

                  <BookOpen
                    size={60}
                    className="mx-auto text-slate-600"
                  />

                  <h3 className="mt-6 text-2xl font-bold">
                    No Modules Available
                  </h3>

                  <p className="mt-4 text-slate-400">
                    Modules haven't been added for this
                    course yet.
                  </p>

                </div>

              )}

            </div>
          )}

        </div>
                {/* =========================
            SIDEBAR
        ========================= */}

        <div className="space-y-6">

          {/* Course Information */}

          <div
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-6
            "
          >

            <h3 className="text-2xl font-bold">
              Resource Information
            </h3>

            <div className="mt-6 space-y-5">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Instructor
                </span>

                <span>
                  {instructor}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Category
                </span>

                <span>
                  {category}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Duration
                </span>

                <span>
                  {duration}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Level
                </span>

                <span>
                  {level}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Students
                </span>

                <span>
                  {students}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Rating
                </span>

                <span>
                  ⭐ {rating}
                </span>
              </div>

              {document?.file_type && (

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    File Type
                  </span>

                  <span className="uppercase">
                    {document.file_type}
                  </span>

                </div>

              )}

              {document?.file_name && (

                <div>

                  <p className="text-slate-400 mb-2">
                    File Name
                  </p>

                  <div className="rounded-xl bg-slate-800 p-3 break-all text-sm">
                    {document.file_name}
                  </div>

                </div>

              )}

            </div>

          </div>

          {/* Progress */}

          <div
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-6
            "
          >

            <h3 className="text-xl font-bold">
              Learning Progress
            </h3>

            <div className="mt-6">

              <div className="flex justify-between text-sm">

                <span className="text-slate-400">
                  Completion
                </span>

                <span className="font-semibold">
                  {course?.progress ?? 0}%
                </span>

              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">

                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${course?.progress ?? 0}%`,
                  }}
                  className="
                    h-full
                    bg-gradient-to-r
                    from-cyan-500
                    to-blue-500
                  "
                />

              </div>

            </div>

          </div>

          {/* Achievement */}

          <div
            className="
              rounded-3xl
              bg-gradient-to-r
              from-cyan-600
              to-blue-600
              p-8
            "
          >

            <Trophy size={48} />

            <h2 className="mt-6 text-2xl font-black">
              Keep Learning
            </h2>

            <p className="mt-4 leading-7 text-white/90">

              Finish every uploaded learning resource
              to improve your mastery and unlock future
              certificates.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CourseDetails;