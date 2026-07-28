import React, {
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Search,
  BookOpen,
  FileText,
  ExternalLink,
  Download,
  Layers,
  Sparkles,
} from "lucide-react";

import {
  useCourses,
} from "../../context/LMSContext/CourseContext";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardAnimation = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
    },
  },
};

export default function CategorySubjects() {
  const navigate = useNavigate();

  const {
    categoryId,
  } = useParams();

  const {
    categories = [],
    documents = [],
    loading,
  } = useCourses();

  const [search, setSearch] = useState("");

  /*
    FIND CATEGORY
  */
  const selectedCategory = useMemo(() => {
    return categories.find(
      (cat) =>
        String(cat.id) ===
        String(categoryId)
    );
  }, [
    categories,
    categoryId,
  ]);

  /*
    FILTER SUBJECT RESOURCES
  */
  const categoryDocuments = useMemo(() => {
    const list = documents.filter(
      (doc) =>
        String(doc.category_id) ===
        String(categoryId)
    );

    if (!search.trim()) {
      return list;
    }

    const keyword =
      search.toLowerCase().trim();

    return list.filter(
      (item) =>
        item.title
          ?.toLowerCase()
          .includes(keyword) ||
        item.description
          ?.toLowerCase()
          .includes(keyword)
    );
  }, [
    documents,
    categoryId,
    search,
  ]);

  const totalFiles =
    categoryDocuments.length;

  return (
    <div
      className="
        min-h-screen
        overflow-hidden
        bg-[#030712]
        text-white
      "
    >
      {/* BACKGROUND */}
      <div
        className="
          fixed
          inset-0
          -z-10
        "
      >
        <div
          className="
            absolute
            inset-0
            bg-[#020617]
          "
        />

        <div
          className="
            absolute
            left-0
            top-0
            h-[500px]
            w-[500px]
            rounded-full
            bg-cyan-500/10
            blur-[180px]
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-0
            h-[500px]
            w-[500px]
            rounded-full
            bg-blue-600/10
            blur-[180px]
          "
        />
      </div>

      <main
        className="
          mx-auto
          max-w-7xl
          px-6
          py-16
        "
      >
        {/* HERO */}
        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-14"
        >
          <button
            onClick={() =>
              navigate("/subjects")
            }
            className="
              flex
              items-center
              gap-2
              text-slate-400
              hover:text-cyan-400
            "
          >
            <ArrowLeft size={18} />
            Back to Categories
          </button>

          <div
            className="
              mt-10
              flex
              flex-col
              gap-6
              md:flex-row
              md:items-center
            "
          >
            <div
              className="
                flex
                h-24
                w-24
                items-center
                justify-center
                rounded-3xl
                bg-gradient-to-br
                from-cyan-500
                to-blue-600
              "
            >
              <BookOpen size={45} />
            </div>

            <div>
              <h1
                className="
                  text-5xl
                  font-black
                "
              >
                {
                  selectedCategory?.name
                  ||
                  "Category"
                }
              </h1>

              <p
                className="
                  mt-3
                  text-lg
                  text-slate-400
                "
              >
                Explore all learning materials
                available in this category.
              </p>
            </div>
          </div>
          
          {/* STATS */}
          <div
            className="
              mt-10
              grid
              gap-5
              md:grid-cols-3
            "
          >
            <StatCard
              icon={<Layers size={24} />}
              title="Resources"
              value={totalFiles}
            />

            <StatCard
              icon={<FileText size={24} />}
              title="Documents"
              value={
                categoryDocuments.filter(
                  (doc) =>
                    doc.file_type
                    ?.toLowerCase()
                    ===
                    "pdf"
                ).length
              }
            />

            <StatCard
              icon={<Sparkles size={24} />}
              title="Category"
              value={
                selectedCategory?.name
                ||
                "General"
              }
            />
          </div>

          {/* SEARCH */}
          <div
            className="
              mt-10
              flex
              items-center
              gap-4
              rounded-3xl
              border
              border-slate-800
              bg-slate-900/70
              px-6
              py-5
            "
          >
            <Search
              size={22}
              className="text-slate-500"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="
                Search learning resources...
              "
              className="
                w-full
                bg-transparent
                outline-none
                placeholder:text-slate-500
              "
            />
          </div>
        </motion.section>

        {/* RESOURCE GRID */}
        {
          loading ? (
            <div
              className="
                flex
                h-64
                items-center
                justify-center
              "
            >
              <div
                className="
                  h-12
                  w-12
                  animate-spin
                  rounded-full
                  border-4
                  border-cyan-500
                  border-t-transparent
                "
              />
            </div>
          ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="
              grid
              gap-8
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
          {
            categoryDocuments.length > 0 ? (
              categoryDocuments.map(
                (doc) => (
                  <motion.div
                    key={doc.id}
                    variants={cardAnimation}
                    whileHover={{
                      y: -10,
                    }}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-[32px]
                      border
                      border-slate-800
                      bg-slate-900/80
                      p-7
                    "
                  >
                    {/* CARD GLOW */}
                    <div
                      className="
                        absolute
                        -right-20
                        -top-20
                        h-48
                        w-48
                        rounded-full
                        bg-cyan-500/10
                        blur-[100px]
                        transition
                        group-hover:bg-cyan-500/20
                      "
                    />

                    <div
                      className="
                        relative
                        z-10
                      "
                    >
                      {/* ICON */}
                      <div
                        className="
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gradient-to-br
                          from-cyan-500
                          to-blue-600
                        "
                      >
                        <FileText
                          size={32}
                        />
                      </div>

                      {/* TITLE */}
                      <h2
                        className="
                          mt-7
                          line-clamp-2
                          text-2xl
                          font-black
                        "
                      >
                        {doc.title}
                      </h2>

                      <p
                        className="
                          mt-4
                          line-clamp-3
                          leading-7
                          text-slate-400
                        "
                      >
                        {
                          doc.description
                          ||
                          "No description available."
                        }
                      </p>

                      {/* FILE DETAILS */}
                      <div
                        className="
                          mt-6
                          flex
                          flex-wrap
                          gap-3
                        "
                      >
                        <span
                          className="
                            rounded-full
                            bg-cyan-500/10
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-cyan-300
                          "
                        >
                          {
                            doc.file_type
                            ?.toUpperCase()
                            ||
                            "FILE"
                          }
                        </span>

                        {
                          doc.file_size && (
                            <span
                              className="
                                rounded-full
                                bg-slate-800
                                px-4
                                py-2
                                text-sm
                                text-slate-300
                              "
                            >
                              {
                                Math.round(
                                  doc.file_size / 1024
                                )
                              }
                              KB
                            </span>
                          )
                        }
                      </div>

                      {/* ACTIONS */}
                      <div
                        className="
                          mt-8
                          flex
                          gap-3
                        "
                      >
                     <button
  onClick={() => {
    console.log("Document:", doc);
    console.log("Navigating to:", `/pdf/${doc.id}`);
    navigate(`/pdf/${doc.id}`);
  }}
  className="
    flex-1
    rounded-2xl
    bg-cyan-500
    px-5
    py-3
    font-bold
    text-slate-950
  "
>
  Read Document
</button>   {
                          doc.file_url && (
                            <button
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = doc.file_url;
                                link.download = doc.title;
                                link.click();
                              }}
                              className="
                                flex
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-slate-700
                                px-4
                                hover:border-cyan-500
                                hover:text-cyan-400
                              "
                            >
                              <Download size={20} />
                            </button>
                          )
                        }
                      </div>
                    </div>
                  </motion.div>
                )
              )
            ) : (
              <EmptyState />
            )
          }
          </motion.div>
          )
        }

        {/* CTA SECTION */}
        <motion.section
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="
            mt-24
            rounded-[35px]
            border
            border-cyan-500/20
            bg-gradient-to-r
            from-cyan-500/10
            via-blue-500/10
            to-indigo-500/10
            p-10
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-3xl
              bg-gradient-to-br
              from-cyan-500
              to-blue-600
            "
          >
            <BookOpen size={40} />
          </div>

          <h2
            className="
              mt-8
              text-4xl
              font-black
            "
          >
            Keep Learning
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-lg
              leading-8
              text-slate-400
            "
          >
            Explore more categories and continue
            building your knowledge with Scholiqen.
          </p>

          <button
            onClick={() =>
              navigate("/subjects")
            }
            className="
              mt-8
              rounded-2xl
              bg-cyan-500
              px-8
              py-4
              font-bold
              text-slate-950
              transition
              hover:bg-cyan-400
            "
          >
            Browse Categories
          </button>
        </motion.section>
      </main>
    </div>
  );
}

/* ============================================
   STAT CARD
============================================ */
const StatCard = ({
  icon,
  title,
  value,
}) => {
  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900/70
        p-6
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-cyan-500/10
          text-cyan-400
        "
      >
        {icon}
      </div>

      <p
        className="
          mt-5
          text-sm
          text-slate-500
        "
      >
        {title}
      </p>

      <h3
        className="
          mt-2
          text-3xl
          font-black
        "
      >
        {value}
      </h3>
    </div>
  );
};

/* ============================================
   EMPTY STATE
============================================ */
const EmptyState = () => (
  <div
    className="
      col-span-full
      rounded-[32px]
      border
      border-dashed
      border-slate-700
      bg-slate-900/50
      p-16
      text-center
    "
  >
    <BookOpen
      size={70}
      className="
        mx-auto
        text-slate-600
      "
    />

    <h2
      className="
        mt-8
        text-3xl
        font-black
      "
    >
      No Resources Found
    </h2>

    <p
      className="
        mx-auto
        mt-4
        max-w-xl
        leading-7
        text-slate-400
      "
    >
      There are currently no learning materials
      available in this category.
    </p>
  </div>
);