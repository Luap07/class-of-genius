import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  BookOpen,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminButton from "../../../components/admin/ui/AdminButton";

/* ============================================================
   API
============================================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* ============================================================
   HELPERS
============================================================ */

const getFileUrl = (url) => {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
};

/* ============================================================
   COMPONENT
============================================================ */

const MaterialsAdmin = () => {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ============================================================
     FETCH MATERIALS
  ============================================================ */

  const fetchMaterials = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/admin/lms/materials`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const rawResponse =
          await response.text();

        let result = null;

        try {
          result = rawResponse
            ? JSON.parse(rawResponse)
            : null;
        } catch {
          result = null;
        }

        if (!response.ok) {
          throw new Error(
            result?.error ||
              result?.message ||
              rawResponse ||
              `Unable to fetch materials. HTTP ${response.status}`
          );
        }

        setMaterials(
          Array.isArray(
            result?.materials
          )
            ? result.materials
            : []
        );
      } catch (fetchError) {
        console.error(
          "FETCH MATERIALS ERROR:",
          fetchError
        );

        setError(
          fetchError?.message ||
            "Unable to fetch learning materials."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  /* ============================================================
     SUCCESS MESSAGE
  ============================================================ */

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () =>
      clearTimeout(timer);
  }, [success]);

  /* ============================================================
     FILTER MATERIALS
  ============================================================ */

  const filteredMaterials = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    if (!searchValue) {
      return materials;
    }

    return materials.filter(
      (item) => {
        const title =
          item.title?.toLowerCase() ||
          "";

        const description =
          item.description?.toLowerCase() ||
          "";

        const subject =
          item.subject?.toLowerCase() ||
          "";

        const level =
          item.level?.toLowerCase() ||
          "";

        const fileName =
          item.file_name?.toLowerCase() ||
          "";

        return (
          title.includes(
            searchValue
          ) ||
          description.includes(
            searchValue
          ) ||
          subject.includes(
            searchValue
          ) ||
          level.includes(
            searchValue
          ) ||
          fileName.includes(
            searchValue
          )
        );
      }
    );
  }, [materials, search]);

  /* ============================================================
     BOOK
  ============================================================ */

  const renderBook = (material) => {
    const coverUrl = getFileUrl(
      material.cover_page_url
    );

    const backUrl = getFileUrl(
      material.back_page_url
    );

    const title =
      material.title ||
      "Learning Material";

    return (
      <button
        type="button"
        onClick={() =>
          navigate(
            `/admin/lms/materials/${material.id}`
          )
        }
        aria-label={`Edit ${title}`}
        className="
          group
          relative
          block
          w-full
          text-left
          outline-none
        "
      >
        {/* ======================================================
            BOOK SHADOW
        ====================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-[8%]
            right-[3%]
            h-[15%]
            rounded-full
            bg-black/70
            blur-2xl
            transition-all
            duration-500
            group-hover:translate-y-2
            group-hover:scale-95
            group-hover:opacity-80
          "
        />

        {/* ======================================================
            BOOK
        ====================================================== */}

        <div
          className="
            relative
            mx-auto
            w-[94%]
            max-w-[330px]
            aspect-[1.48/1]
            transition-all
            duration-500
            group-hover:-translate-y-2
          "
        >

          {/* ====================================================
              BACK COVER
          ==================================================== */}

          <div
            className="
              absolute
              right-0
              top-[5%]
              h-[90%]
              w-[56%]
              overflow-hidden
              rounded-r-[5px]
              rounded-l-[2px]
              border
              border-slate-700/80
              bg-[#020617]
              shadow-xl
            "
          >
            {backUrl ? (
              <img
                src={backUrl}
                alt={`${title} back cover`}
                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-[1.02]
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  bg-slate-900
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    gap-2
                    text-slate-600
                  "
                >
                  <ImageIcon size={24} />

                  <span className="text-[10px]">
                    Back Cover
                  </span>
                </div>
              </div>
            )}

            {/* Back cover edge */}
            <div
              className="
                pointer-events-none
                absolute
                inset-y-0
                left-0
                w-2
                bg-black/20
              "
            />
          </div>

          {/* ====================================================
              PAGE BLOCK / SPINE
          ==================================================== */}

          <div
            className="
              absolute
              left-[35%]
              top-[3%]
              z-20
              h-[94%]
              w-[8%]
              overflow-hidden
              rounded-[2px]
              border-y
              border-slate-500/30
              bg-gradient-to-r
              from-[#111827]
              via-[#64748b]
              to-[#0f172a]
              shadow-lg
            "
          >
            {/* Page lines */}
            <div
              className="
                absolute
                inset-y-2
                left-[22%]
                w-[2px]
                rounded-full
                bg-white/15
              "
            />

            <div
              className="
                absolute
                inset-y-2
                right-[22%]
                w-[1px]
                bg-black/40
              "
            />

            <div
              className="
                absolute
                left-1/2
                top-0
                h-full
                w-px
                -translate-x-1/2
                bg-white/10
              "
            />
          </div>

          {/* ====================================================
              FRONT COVER
          ==================================================== */}

          <div
            className="
              absolute
              left-0
              top-0
              z-30
              h-full
              w-[59%]
              overflow-hidden
              rounded-l-[6px]
              rounded-r-[2px]
              border
              border-slate-700/90
              bg-[#020617]
              shadow-[16px_18px_30px_rgba(0,0,0,0.55)]
              transition-all
              duration-500
              group-hover:border-cyan-400/40
            "
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`${title} front cover`}
                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-[1.025]
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  bg-slate-900
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    gap-3
                    text-slate-600
                  "
                >
                  <ImageIcon size={28} />

                  <span className="text-[10px]">
                    Cover Page
                  </span>
                </div>
              </div>
            )}

            {/* ==================================================
                FRONT COVER EDGE
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                inset-y-0
                right-0
                w-4
                bg-gradient-to-l
                from-black/35
                via-black/10
                to-transparent
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-y-0
                left-0
                w-1
                bg-white/10
              "
            />
          </div>

          {/* ====================================================
              BOOK BOTTOM EDGE
          ==================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-[4%]
              right-0
              z-10
              h-2
              rounded-r
              bg-black/30
            "
          />
        </div>

        {/* ======================================================
            NO GENERATED TEXT ON THE BOOK
        ====================================================== */}

      </button>
    );
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      className="
        min-h-full
        space-y-8
        p-6
      "
    >

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                border
                border-blue-500/20
                bg-blue-500/10
                text-blue-400
              "
            >
              <BookOpen size={21} />
            </div>

            <div>
              <h1
                className="
                  text-3xl
                  font-black
                  tracking-tight
                  text-white
                "
              >
                Materials
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Your Scholiqen learning library
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            flex
            flex-wrap
            gap-3
          "
        >
          <AdminButton
            type="button"
            variant="secondary"
            disabled={
              loading ||
              refreshing
            }
            onClick={() =>
              fetchMaterials(true)
            }
          >
            {refreshing ? (
              <Loader2
                size={18}
                className="
                  mr-2
                  animate-spin
                "
              />
            ) : (
              <RefreshCw
                size={18}
                className="mr-2"
              />
            )}

            Refresh
          </AdminButton>

          <AdminButton
            type="button"
            onClick={() =>
              navigate(
                "/admin/lms/materials/create"
              )
            }
          >
            <Plus
              size={18}
              className="mr-2"
            />

            Add Material
          </AdminButton>
        </div>
      </div>

      {/* ========================================================
          ALERTS
      ======================================================== */}

      {success && (
        <div
          className="
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-emerald-500/20
            bg-emerald-500/10
            p-4
            text-emerald-300
          "
        >
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p className="text-sm">
            {success}
          </p>
        </div>
      )}

      {error && (
        <div
          className="
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/10
            p-4
            text-red-300
          "
        >
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p className="text-sm">
            {error}
          </p>
        </div>
      )}

      {/* ========================================================
          SEARCH
      ======================================================== */}

      <div
        className="
          rounded-2xl
          border
          border-slate-800
          bg-slate-900/70
          p-4
        "
      >
        <div className="relative">
          <Search
            size={19}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-500
            "
          />

          <input
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setError("");
            }}
            placeholder="Search materials..."
            className="
              w-full
              rounded-xl
              border
              border-slate-800
              bg-slate-950
              py-3
              pl-11
              pr-4
              text-sm
              text-white
              outline-none
              transition
              placeholder:text-slate-600
              focus:border-blue-500/50
            "
          />
        </div>
      </div>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      {loading ? (
        <div
          className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-900
            py-24
            text-center
          "
        >
          <Loader2
            size={34}
            className="
              mx-auto
              animate-spin
              text-blue-400
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-slate-500
            "
          >
            Loading your library...
          </p>
        </div>
      ) : filteredMaterials.length ===
        0 ? (
        <div
          className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-900
            px-6
            py-20
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-800
              bg-slate-950
              text-slate-600
            "
          >
            <BookOpen size={30} />
          </div>

          <h2
            className="
              mt-5
              text-xl
              font-bold
              text-white
            "
          >
            {search
              ? "No Materials Found"
              : "Your Library Is Empty"}
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              leading-6
              text-slate-500
            "
          >
            {search
              ? "Try searching with another title, subject or class."
              : "Create your first learning material and it will appear here as a textbook."}
          </p>

          {!search && (
            <div className="mt-6">
              <AdminButton
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/lms/materials/create"
                  )
                }
              >
                <Plus
                  size={18}
                  className="mr-2"
                />

                Add Material
              </AdminButton>
            </div>
          )}
        </div>
      ) : (
        <div
          className="
            grid
            gap-x-6
            gap-y-14
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            2xl:grid-cols-5
          "
        >
          {filteredMaterials.map(
            (material) => (
              <div
                key={material.id}
                className="min-w-0"
              >
                {renderBook(
                  material
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* ========================================================
          RESULTS
      ======================================================== */}

      {!loading &&
        materials.length > 0 && (
          <div
            className="
              border-t
              border-slate-800
              pt-5
              text-center
              text-xs
              text-slate-600
            "
          >
            {search
              ? `Showing ${filteredMaterials.length} of ${materials.length} materials`
              : `${materials.length} material${
                  materials.length === 1
                    ? ""
                    : "s"
                } in your library`}
          </div>
        )}
    </div>
  );
};

export default MaterialsAdmin;
