// src/pages/admin/novels/NovelEditor.jsx

import React, { useEffect, useState } from "react";

import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AdminButton from "../../../components/admin/ui/AdminButton";

/* =========================================================
   API CONFIG
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

/* =========================================================
   FALLBACK COVER
========================================================= */

const FALLBACK_COVER =
  "https://via.placeholder.com/208x288?text=Novel";

/* =========================================================
   COVER URL HELPER
========================================================= */

const getCoverUrl = (coverUrl) => {
  if (!coverUrl) {
    return "";
  }

  // Already a complete URL
  if (/^https?:\/\//i.test(coverUrl)) {
    return coverUrl;
  }

  // Backend returns:
  // /uploads/covers/example.jpg

  return `${API_URL}${
    coverUrl.startsWith("/")
      ? ""
      : "/"
  }${coverUrl}`;
};

/* =========================================================
   REUSABLE INPUT
========================================================= */

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="block mb-2 text-sm text-slate-400">
      {label}
    </label>

    <input
      type="text"
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="
        w-full
        rounded-xl
        bg-slate-800
        border border-slate-700
        px-4 py-3
        text-white
        placeholder:text-slate-500
        outline-none
        focus:border-blue-500
        focus:ring-1
        focus:ring-blue-500
        transition
      "
    />
  </div>
);

/* =========================================================
   REUSABLE TEXTAREA
========================================================= */

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="block mb-2 text-sm text-slate-400">
      {label}
    </label>

    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={5}
      className="
        w-full
        rounded-xl
        bg-slate-800
        border border-slate-700
        px-4 py-3
        text-white
        placeholder:text-slate-500
        outline-none
        resize-y
        focus:border-blue-500
        focus:ring-1
        focus:ring-blue-500
        transition
      "
    />
  </div>
);

/* =========================================================
   DEFAULT FORM
========================================================= */

const defaultForm = {
  title: "",
  author: "",
  genre: "",
  description: "",
  introduction: "",
  cover_url: "",
  status: "Draft",
  chapters: [],
};

/* =========================================================
   MAIN EDITOR
========================================================= */

const NovelEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] =
    useState(defaultForm);

  const [loading, setLoading] =
    useState(false);

  const [fetching, setFetching] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [preview, setPreview] =
    useState("");

  const [coverFile, setCoverFile] =
    useState(null);

  /* =========================================================
     LOAD EXISTING NOVEL
  ========================================================= */

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchNovel = async () => {
      try {
        setFetching(true);

        const response = await fetch(
          `${API_URL}/api/novels/${id}`
        );

        let data = null;

        try {
          data = await response.json();
        } catch {
          throw new Error(
            "The server returned an invalid response."
          );
        }

        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.error ||
              "Unable to load novel."
          );
        }

        const novel = data.novel;

        if (!novel) {
          throw new Error(
            "Novel data was not returned."
          );
        }

        setForm({
          ...defaultForm,
          ...novel,

          author:
            novel.author || "",

          genre:
            novel.genre || "",

          description:
            novel.description || "",

          introduction:
            novel.introduction || "",

          cover_url:
            novel.cover_url || "",

          status:
            novel.status || "Draft",

          chapters:
            Array.isArray(novel.chapters)
              ? novel.chapters
              : [],
        });

        if (novel.cover_url) {
          setPreview(
            getCoverUrl(
              novel.cover_url
            )
          );
        }
      } catch (error) {
        console.error(
          "Fetch Novel Error:",
          error
        );

        alert(
          error?.message ||
            "Unable to load novel."
        );
      } finally {
        setFetching(false);
      }
    };

    fetchNovel();
  }, [id]);

  /* =========================================================
     HANDLE INPUT CHANGES
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     HANDLE COVER SELECTION
  ========================================================= */

  const uploadCover = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    /* -------------------------------------------------------
       VALIDATE TYPE
    ------------------------------------------------------- */

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      e.target.value = "";
      return;
    }

    /* -------------------------------------------------------
       VALIDATE SIZE
       Backend limit = 5MB
    ------------------------------------------------------- */

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "Cover image must be 5MB or smaller."
      );

      e.target.value = "";
      return;
    }

    /* -------------------------------------------------------
       CREATE LOCAL PREVIEW
    ------------------------------------------------------- */

    const previewUrl =
      URL.createObjectURL(file);

    setPreview(previewUrl);

    /* -------------------------------------------------------
       KEEP FILE UNTIL SAVE
    ------------------------------------------------------- */

    setCoverFile(file);

    /*
      We deliberately do NOT upload here.

      The actual upload happens inside
      handleSubmit() together with the novel data.
    */

    setUploading(false);
  };

  /* =========================================================
     ADD CHAPTER
  ========================================================= */

  const addChapter = () => {
    setForm((prev) => ({
      ...prev,

      chapters: [
        ...(Array.isArray(
          prev.chapters
        )
          ? prev.chapters
          : []),

        {
          chapter:
            (prev.chapters?.length ||
              0) + 1,

          title: "",

          content: "",
        },
      ],
    }));
  };

  /* =========================================================
     UPDATE CHAPTER
  ========================================================= */

  const updateChapter = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const updated = Array.isArray(
        prev.chapters
      )
        ? [...prev.chapters]
        : [];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        chapters: updated,
      };
    });
  };

  /* =========================================================
     REMOVE CHAPTER
  ========================================================= */

  const removeChapter = (index) => {
    setForm((prev) => {
      const updated =
        Array.isArray(
          prev.chapters
        )
          ? prev.chapters.filter(
              (_, i) =>
                i !== index
            )
          : [];

      /*
       * Re-number chapters after deletion.
       */

      const renumbered =
        updated.map(
          (chapter, chapterIndex) => ({
            ...chapter,
            chapter:
              chapterIndex + 1,
          })
        );

      return {
        ...prev,
        chapters: renumbered,
      };
    });
  };

  /* =========================================================
     SAVE NOVEL
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!form.title.trim()) {
      alert(
        "Please enter a novel title."
      );
      return;
    }

    if (!form.author.trim()) {
      alert(
        "Please enter the author name."
      );
      return;
    }

    try {
      setLoading(true);
      setUploading(
        Boolean(coverFile)
      );

      /* -----------------------------------------------------
         CREATE MULTIPART FORM DATA
      ----------------------------------------------------- */

      const formData =
        new FormData();

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "author",
        form.author.trim()
      );

      formData.append(
        "genre",
        form.genre?.trim() || ""
      );

      formData.append(
        "description",
        form.description?.trim() ||
          ""
      );

      formData.append(
        "introduction",
        form.introduction?.trim() ||
          ""
      );

      formData.append(
        "status",
        form.status?.trim() ||
          "Draft"
      );

      /* -----------------------------------------------------
         CHAPTERS
      ----------------------------------------------------- */

      formData.append(
        "chapters",
        JSON.stringify(
          Array.isArray(
            form.chapters
          )
            ? form.chapters
            : []
        )
      );

      /* -----------------------------------------------------
         COVER FILE
      ----------------------------------------------------- */

      if (coverFile) {
        formData.append(
          "cover",
          coverFile
        );
      }

      /* -----------------------------------------------------
         DETERMINE REQUEST
      ----------------------------------------------------- */

      const endpoint = id
        ? `${API_URL}/api/novels/${id}`
        : `${API_URL}/api/novels`;

      const method = id
        ? "PUT"
        : "POST";

      /* -----------------------------------------------------
         SEND TO EXPRESS / NEON
      ----------------------------------------------------- */

      const response =
        await fetch(
          endpoint,
          {
            method,
            body: formData,
          }
        );

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.error ||
            `Unable to ${
              id
                ? "update"
                : "create"
            } novel.`
        );
      }

      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      navigate(
        "/admin/novels/list"
      );
    } catch (error) {
      console.error(
        "Save Novel Error:",
        error
      );

      alert(
        error?.message ||
          "Something went wrong while saving the novel."
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  /* =========================================================
     LOADING EXISTING NOVEL
  ========================================================= */

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="flex flex-col items-center gap-3 text-slate-400">

          <Loader2
            size={32}
            className="animate-spin text-blue-500"
          />

          <p>
            Loading novel...
          </p>

        </div>

      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-8 pb-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>

        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {id
            ? "Edit Novel"
            : "Create Novel"}
        </h1>

        <p className="text-slate-400 mt-2">
          {id
            ? "Update your existing novel."
            : "Create a brand new novel for your readers."}
        </p>

      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="
          bg-slate-900
          border border-slate-800
          rounded-2xl
          p-6
          space-y-6
        "
      >

        {/* ===================================================
            COVER UPLOAD
        =================================================== */}

        <div>

          <label className="block mb-3 text-sm text-slate-400">
            Cover Image
          </label>

          <div className="flex flex-col md:flex-row gap-6">

            {/* COVER PREVIEW */}

            <div
              className="
                w-52
                h-72
                rounded-xl
                overflow-hidden
                border border-slate-700
                bg-slate-800
                flex
                items-center
                justify-center
              "
            >

              {preview ? (

                <img
                  src={preview}
                  alt="Novel Cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      FALLBACK_COVER;
                  }}
                />

              ) : (

                <div className="text-center text-slate-500">

                  <ImageIcon
                    size={55}
                    className="mx-auto mb-3"
                  />

                  <p>
                    No Cover Selected
                  </p>

                </div>

              )}

            </div>

            {/* COVER CONTROLS */}

            <div className="flex flex-col justify-center gap-4">

              <label
                className="
                  cursor-pointer
                  bg-blue-600
                  hover:bg-blue-700
                  px-5
                  py-3
                  rounded-xl
                  inline-flex
                  items-center
                  gap-2
                  w-fit
                  transition
                "
              >

                <Upload size={18} />

                {coverFile
                  ? "Change Cover"
                  : "Choose Cover"}

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  hidden
                  onChange={
                    uploadCover
                  }
                  disabled={
                    loading
                  }
                />

              </label>

              {coverFile && (
                <p className="text-blue-400 text-sm">
                  New cover selected:
                  {" "}
                  {coverFile.name}
                </p>
              )}

              {uploading && (
                <div className="flex items-center gap-2 text-blue-400 text-sm">

                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  Uploading image...

                </div>
              )}

              {form.cover_url &&
                !coverFile && (
                  <p className="text-green-400 text-sm">
                    ✔ Existing cover loaded
                  </p>
                )}

              <p className="text-xs text-slate-500">
                JPG, JPEG, PNG or WEBP.
                Maximum 5MB.
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Input
            label="Novel Title"
            name="title"
            value={form.title}
            onChange={
              handleChange
            }
            placeholder="Enter novel title"
          />

          <Input
            label="Author"
            name="author"
            value={form.author}
            onChange={
              handleChange
            }
            placeholder="Enter author name"
          />

          <Input
            label="Genre"
            name="genre"
            value={form.genre}
            onChange={
              handleChange
            }
            placeholder="Fantasy, Romance, Mystery..."
          />

        </div>

        {/* ===================================================
            INTRODUCTION
        =================================================== */}

        <Textarea
          label="Introduction"
          name="introduction"
          value={
            form.introduction
          }
          onChange={
            handleChange
          }
          placeholder="Write the introduction..."
        />

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        <Textarea
          label="Description"
          name="description"
          value={
            form.description
          }
          onChange={
            handleChange
          }
          placeholder="Write the novel description..."
        />

        {/* ===================================================
            CHAPTERS
        =================================================== */}

        <div>

          <div className="flex items-center justify-between mb-4">

            <label className="text-sm text-slate-400">
              Chapters
            </label>

            <button
              type="button"
              onClick={
                addChapter
              }
              disabled={
                loading
              }
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-blue-600
                px-4
                py-2
                hover:bg-blue-700
                disabled:opacity-50
                transition
              "
            >

              <Plus size={18} />

              Add Chapter

            </button>

          </div>

          {/* NO CHAPTERS */}

          {form.chapters.length ===
            0 && (
            <div
              className="
                rounded-xl
                border
                border-dashed
                border-slate-700
                bg-slate-800/50
                p-8
                text-center
              "
            >

              <BookOpenIcon />

              <p className="text-slate-500 mt-2">
                No chapters added yet.
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Click "Add Chapter" to begin.
              </p>

            </div>
          )}

          {/* CHAPTER LIST */}

          <div className="space-y-5">

            {form.chapters.map(
              (
                chapter,
                index
              ) => (

                <div
                  key={index}
                  className="
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-800
                    p-5
                  "
                >

                  {/* CHAPTER HEADER */}

                  <div className="mb-4 flex items-center justify-between">

                    <h3 className="font-semibold text-lg text-white">
                      Chapter{" "}
                      {index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        removeChapter(
                          index
                        )
                      }
                      disabled={
                        loading
                      }
                      className="
                        text-red-400
                        hover:text-red-500
                        disabled:opacity-50
                        transition
                      "
                      title="Remove chapter"
                    >

                      <Trash2
                        size={18}
                      />

                    </button>

                  </div>

                  <div className="space-y-4">

                    {/* CHAPTER TITLE */}

                    <input
                      value={
                        chapter.title ||
                        ""
                      }
                      onChange={(
                        e
                      ) =>
                        updateChapter(
                          index,
                          "title",
                          e.target
                            .value
                        )
                      }
                      placeholder="Chapter title..."
                      disabled={
                        loading
                      }
                      className="
                        w-full
                        rounded-xl
                        bg-slate-900
                        border border-slate-700
                        px-4 py-3
                        text-white
                        placeholder:text-slate-500
                        outline-none
                        focus:border-blue-500
                        transition
                      "
                    />

                    {/* CHAPTER CONTENT */}

                    <textarea
                      rows={8}
                      value={
                        chapter.content ||
                        ""
                      }
                      onChange={(
                        e
                      ) =>
                        updateChapter(
                          index,
                          "content",
                          e.target
                            .value
                        )
                      }
                      placeholder="Chapter content..."
                      disabled={
                        loading
                      }
                      className="
                        w-full
                        rounded-xl
                        bg-slate-900
                        border border-slate-700
                        px-4 py-3
                        text-white
                        placeholder:text-slate-500
                        outline-none
                        resize-y
                        focus:border-blue-500
                        transition
                      "
                    />

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* ===================================================
            STATUS
        =================================================== */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">
            Status
          </label>

          <select
            name="status"
            value={
              form.status
            }
            onChange={
              handleChange
            }
            disabled={
              loading
            }
            className="
              w-full
              rounded-xl
              bg-slate-800
              border border-slate-700
              px-4 py-3
              text-white
              outline-none
              focus:border-blue-500
            "
          >

            <option value="Draft">
              Draft
            </option>

            <option value="Published">
              Published
            </option>

          </select>

        </div>

        {/* ===================================================
            SUBMIT
        =================================================== */}

        <AdminButton
          type="submit"
          disabled={
            loading ||
            uploading
          }
        >

          <span className="flex items-center gap-2">

            {loading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {loading
              ? id
                ? "Updating Novel..."
                : "Saving Novel..."
              : id
                ? "Update Novel"
                : "Save Novel"}

          </span>

        </AdminButton>

      </form>

    </div>
  );
};

/* =========================================================
   SMALL EMPTY-CHAPTER ICON
========================================================= */

const BookOpenIcon = () => (
  <div className="flex justify-center text-slate-600">
    <ImageIcon size={36} />
  </div>
);

export default NovelEditor;
