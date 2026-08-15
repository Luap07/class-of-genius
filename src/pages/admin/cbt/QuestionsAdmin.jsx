import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../../../lib/supabaseClient";

import {
  Trash2,
  Search,
  Edit3,
  X,
  Save,
  CheckCircle2,
  Power,
  Bold,
  Italic,
  Underline,
  Superscript,
  Subscript,
  Divide,
  Sigma,
  Plus,
  Minus,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from "lucide-react";

/* ============================================================
   HELPERS
============================================================ */

/*
 * Decode HTML entities such as:
 *
 * &nbsp;
 * &amp;
 * &lt;
 * &gt;
 *
 * This is important because old questions may have been stored
 * with HTML entities instead of actual HTML.
 */
const decodeHtml = (value = "") => {
  if (typeof value !== "string") {
    return "";
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;

  return textarea.value;
};

/*
 * Convert HTML entities into proper browser HTML.
 *
 * Example:
 *
 * "The reading&nbsp;&nbsp;above"
 *
 * becomes:
 *
 * "The reading  above"
 */
const normalizeRichContent = (value = "") => {
  if (!value) {
    return "";
  }

  let content = String(value);

  /*
   * If the value contains HTML tags, preserve the HTML.
   */
  const hasHtmlTags =
    /<\/?[a-z][\s\S]*>/i.test(content);

  if (hasHtmlTags) {
    return content;
  }

  /*
   * Decode entities.
   */
  content = decodeHtml(content);

  /*
   * Convert plain text newlines to <br>.
   */
  content = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "<br />");

  return content;
};

/*
 * Clean content before saving.
 *
 * We intentionally DO NOT strip HTML because the editor
 * needs to preserve formatting.
 */
const cleanRichContent = (value = "") => {
  if (!value) {
    return "";
  }

  let content = String(value);

  /*
   * Decode accidental double entities.
   */
  content = decodeHtml(content);

  /*
   * Convert common mathematical caret notation.
   *
   * 2^4  -> 2<sup>4</sup>
   * x^2  -> x<sup>2</sup>
   * a^n  -> a<sup>n</sup>
   *
   * Only simple exponent expressions are automatically
   * transformed.
   */
  content = convertCaretPowers(content);

  return content.trim();
};

/*
 * Automatically convert:
 *
 * 2^4
 * x^2
 * a^n
 *
 * to:
 *
 * 2<sup>4</sup>
 * x<sup>2</sup>
 * a<sup>n</sup>
 */
const convertCaretPowers = (html = "") => {
  if (!html) {
    return "";
  }

  /*
   * Don't modify existing sup elements.
   *
   * We temporarily protect them.
   */
  const protectedSuperscripts = [];

  let content = html.replace(
    /<sup\b[^>]*>[\s\S]*?<\/sup>/gi,
    (match) => {
      const token = `___SUP_TOKEN_${protectedSuperscripts.length}___`;

      protectedSuperscripts.push(match);

      return token;
    }
  );

  /*
   * Convert:
   *
   * 2^4
   * x^2
   * a^n
   * )
   *
   * The exponent can be:
   * - one number
   * - one letter
   * - one simple group
   */
  content = content.replace(
    /([A-Za-z0-9)\]])\^(\d+|[A-Za-z]+|\([^)]*\))/g,
    (_, base, exponent) => {
      let cleanExponent = exponent;

      if (
        cleanExponent.startsWith("(") &&
        cleanExponent.endsWith(")")
      ) {
        cleanExponent =
          cleanExponent.slice(1, -1);
      }

      return `${base}<sup>${cleanExponent}</sup>`;
    }
  );

  /*
   * Restore existing superscripts.
   */
  protectedSuperscripts.forEach(
    (sup, index) => {
      content = content.replace(
        `___SUP_TOKEN_${index}___`,
        sup
      );
    }
  );

  return content;
};

/*
 * Get plain text from HTML.
 *
 * Used for validation.
 */
const getTextFromHtml = (html = "") => {
  const div = document.createElement("div");

  div.innerHTML = html;

  return div.textContent || div.innerText || "";
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

const QuestionsAdmin = () => {
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [editingQuestion, setEditingQuestion] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);

  const [activating, setActivating] = useState(null);

  /* ==========================================================
     FETCH QUESTIONS
  ========================================================== */

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const batchSize = 1000;

      let allQuestions = [];

      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from("cbt_questions")
          .select("*")
          .order("created_at", {
            ascending: false,
          })
          .range(
            from,
            from + batchSize - 1
          );

        if (error) {
          throw error;
        }

        const currentBatch = data || [];

        allQuestions = [
          ...allQuestions,
          ...currentBatch,
        ];

        if (
          currentBatch.length <
          batchSize
        ) {
          break;
        }

        from += batchSize;
      }

      setQuestions(allQuestions);
    } catch (error) {
      console.error(
        "Fetch Questions Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  /* ==========================================================
     DELETE
  ========================================================== */

  const deleteQuestion = async (id) => {
    const confirmed = window.confirm(
      "Delete this question permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(id);

      const { error } = await supabase
        .from("cbt_questions")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setQuestions((previous) =>
        previous.filter(
          (question) =>
            question.id !== id
        )
      );

      if (
        editingQuestion?.id === id
      ) {
        setEditingQuestion(null);
      }
    } catch (error) {
      console.error(
        "Delete Question Error:",
        error
      );

      alert(
        error?.message ||
          "Failed to delete question."
      );
    } finally {
      setDeleting(null);
    }
  };

  /* ==========================================================
     ACTIVE / INACTIVE
  ========================================================== */

  const toggleActive = async (question) => {
    try {
      setActivating(question.id);

      const newStatus =
        question.active === false;

      const { data, error } =
        await supabase
          .from("cbt_questions")
          .update({
            active: newStatus,
          })
          .eq("id", question.id)
          .select()
          .single();

      if (error) {
        throw error;
      }

      setQuestions((previous) =>
        previous.map((item) =>
          item.id === question.id
            ? data
            : item
        )
      );

      if (
        editingQuestion?.id ===
        question.id
      ) {
        setEditingQuestion(data);
      }
    } catch (error) {
      console.error(
        "Toggle Active Error:",
        error
      );

      alert(
        error?.message ||
          "Unable to change question status."
      );
    } finally {
      setActivating(null);
    }
  };

  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredQuestions = useMemo(() => {
    const searchText = search
      .toLowerCase()
      .trim();

    if (!searchText) {
      return questions;
    }

    return questions.filter((item) => {
      const optionsText =
        Array.isArray(item.options)
          ? item.options.join(" ")
          : "";

      const text = `
        ${item.exam || ""}
        ${item.subject || ""}
        ${item.question || ""}
        ${optionsText}
        ${item.answer || ""}
        ${item.reason || ""}
      `.toLowerCase();

      return text.includes(searchText);
    });
  }, [questions, search]);

  /* ==========================================================
     OPEN EDITOR
  ========================================================== */

  const openEditor = (question) => {
    const normalizedOptions =
      Array.isArray(question.options)
        ? question.options.map((option) =>
            normalizeRichContent(
              option || ""
            )
          )
        : ["", "", "", ""];

    /*
     * IMPORTANT:
     *
     * Normalize the question when opening it.
     *
     * This fixes existing content such as:
     *
     * The reading&nbsp;&nbsp;above
     *
     * and preserves existing <strong>, <sup>,
     * <sub>, <br>, etc.
     */
    const normalizedQuestion =
      normalizeRichContent(
        question.question || ""
      );

    const normalizedReason =
      normalizeRichContent(
        question.reason || ""
      );

    setEditingQuestion({
      ...question,

      question:
        normalizedQuestion,

      options:
        normalizedOptions,

      reason:
        normalizedReason,

      answer:
        String(
          question.answer || ""
        ).trim().toUpperCase(),
    });
  };

  /* ==========================================================
     CLOSE EDITOR
  ========================================================== */

  const closeEditor = () => {
    if (saving) {
      return;
    }

    setEditingQuestion(null);
  };

  /* ==========================================================
     UPDATE FIELD
  ========================================================== */

  const updateEditingField = (
    field,
    value
  ) => {
    setEditingQuestion((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        [field]: value,
      };
    });
  };

  /* ==========================================================
     UPDATE OPTION
  ========================================================== */

  const updateOption = (
    index,
    value
  ) => {
    setEditingQuestion((previous) => {
      if (!previous) {
        return previous;
      }

      const options = [
        ...(previous.options || []),
      ];

      options[index] = value;

      return {
        ...previous,
        options,
      };
    });
  };

  /* ==========================================================
     ADD OPTION
  ========================================================== */

  const addOption = () => {
    setEditingQuestion((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,

        options: [
          ...(previous.options || []),
          "",
        ],
      };
    });
  };

  /* ==========================================================
     REMOVE OPTION
  ========================================================== */

  const removeOption = (index) => {
    setEditingQuestion((previous) => {
      if (!previous) {
        return previous;
      }

      const options = [
        ...(previous.options || []),
      ];

      options.splice(index, 1);

      let answer =
        previous.answer || "";

      const removedLetter =
        String.fromCharCode(
          65 + index
        );

      if (
        answer === removedLetter
      ) {
        answer = "";
      }

      /*
       * If an option after the removed
       * option was the correct answer,
       * shift the letter down.
       */
      const answerIndex =
        answer
          ? answer.charCodeAt(0) - 65
          : -1;

      if (
        answerIndex > index
      ) {
        answer =
          String.fromCharCode(
            answer.charCodeAt(0) - 1
          );
      }

      return {
        ...previous,
        options,
        answer,
      };
    });
  };

  /* ==========================================================
     SAVE QUESTION
  ========================================================== */

  const saveQuestion = async () => {
    if (!editingQuestion?.id) {
      return;
    }

    try {
      setSaving(true);

      /*
       * Clean question HTML.
       */
      const cleanedQuestion =
        cleanRichContent(
          editingQuestion.question ||
            ""
        );

      /*
       * Clean options.
       */
      const cleanedOptions = (
        editingQuestion.options || []
      ).map((option) =>
        cleanRichContent(
          option || ""
        )
      );

      /*
       * Clean reason.
       */
      const cleanedReason =
        cleanRichContent(
          editingQuestion.reason ||
            ""
        );

      /*
       * Validate question.
       */
      const questionText =
        getTextFromHtml(
          cleanedQuestion
        ).trim();

      if (!questionText) {
        alert(
          "Please enter the question."
        );

        setSaving(false);

        return;
      }

      /*
       * Validate options.
       */
      const emptyOption =
        cleanedOptions.some(
          (option) =>
            !getTextFromHtml(
              option
            ).trim()
        );

      if (emptyOption) {
        alert(
          "Please fill all answer options."
        );

        setSaving(false);

        return;
      }

      /*
       * Normalize answer.
       */
      const answer =
        String(
          editingQuestion.answer ||
            ""
        )
          .trim()
          .toUpperCase();

      if (
        !/^[A-Z]$/.test(answer)
      ) {
        alert(
          "Please select a valid correct answer."
        );

        setSaving(false);

        return;
      }

      /*
       * IMPORTANT:
       *
       * Reason is included here.
       *
       * Your old save function did not
       * include reason, so editing could
       * lose the explanation.
       */
      const payload = {
        exam: String(
          editingQuestion.exam ||
            ""
        ).trim(),

        subject: String(
          editingQuestion.subject ||
            ""
        ).trim(),

        question:
          cleanedQuestion,

        options:
          cleanedOptions,

        answer,

        reason:
          cleanedReason,

        image:
          editingQuestion.image ||
          null,
      };

      /*
       * Only send active if the field
       * exists on the question.
       */
      if (
        Object.prototype.hasOwnProperty.call(
          editingQuestion,
          "active"
        )
      ) {
        payload.active =
          editingQuestion.active !==
          false;
      }

      const { data, error } =
        await supabase
          .from("cbt_questions")
          .update(payload)
          .eq(
            "id",
            editingQuestion.id
          )
          .select()
          .single();

      if (error) {
        throw error;
      }

      /*
       * Update local state with exactly
       * what Supabase returned.
       */
      setQuestions((previous) =>
        previous.map((item) =>
          item.id ===
          editingQuestion.id
            ? data
            : item
        )
      );

      /*
       * Close editor only AFTER successful
       * database update.
       */
      setEditingQuestion(null);
    } catch (error) {
      console.error(
        "Update Question Error:",
        error
      );

      alert(
        error?.message ||
          "Failed to update question."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                <Sigma
                  size={18}
                  className="text-blue-400"
                />
              </div>

              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                CBT Question Bank
              </span>

            </div>

            <h1 className="text-3xl font-black tracking-tight text-white">
              Manage Questions
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Edit, update, format, activate
              and manage your CBT questions.
            </p>
          </div>

          {/* SEARCH */}

          <div className="relative w-full lg:w-[360px]">

            <Search
              size={18}
              className="absolute left-4 top-3.5 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/30 focus:bg-white/[0.05]"
            />

          </div>

        </div>

        {/* STATS */}

        <div className="mb-7 grid gap-4 sm:grid-cols-3">

          <StatCard
            label="Total Questions"
            value={questions.length}
            icon={Sigma}
          />

          <StatCard
            label="Active"
            value={
              questions.filter(
                (item) =>
                  item.active !== false
              ).length
            }
            icon={CheckCircle2}
          />

          <StatCard
            label="Inactive"
            value={
              questions.filter(
                (item) =>
                  item.active === false
              ).length
            }
            icon={EyeOff}
          />

        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex items-center gap-3 text-sm text-slate-500">

              <Loader2
                size={18}
                className="animate-spin"
              />

              Loading questions...

            </div>

          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-14 text-center">

            <Sigma
              size={35}
              className="mx-auto text-slate-700"
            />

            <h3 className="mt-4 font-black text-white">
              No Questions Found
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              No questions match your current
              search.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {filteredQuestions.map(
              (item, index) => (
                <QuestionCard
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={() =>
                    openEditor(item)
                  }
                  onDelete={() =>
                    deleteQuestion(
                      item.id
                    )
                  }
                  onToggleActive={() =>
                    toggleActive(item)
                  }
                  deleting={
                    deleting === item.id
                  }
                  activating={
                    activating === item.id
                  }
                />
              )
            )}

          </div>
        )}

      </div>

      {/* EDIT MODAL */}

      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          saving={saving}
          onClose={closeEditor}
          onSave={saveQuestion}
          onFieldChange={
            updateEditingField
          }
          onOptionChange={updateOption}
          onAddOption={addOption}
          onRemoveOption={
            removeOption
          }
          onToggleActive={() =>
            toggleActive(
              editingQuestion
            )
          }
          activating={
            activating ===
            editingQuestion.id
          }
        />
      )}

    </div>
  );
};

/* =============================================================
   QUESTION CARD
============================================================= */

const QuestionCard = ({
  item,
  index,
  onEdit,
  onDelete,
  onToggleActive,
  deleting,
  activating,
}) => {
  const isActive =
    item.active !== false;

  return (
    <div
      className={`rounded-[1.75rem] border p-6 transition ${
        isActive
          ? "border-white/10 bg-white/[0.025]"
          : "border-red-500/10 bg-red-500/[0.015] opacity-75"
      }`}
    >

      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">

        <div className="min-w-0 flex-1">

          {/* BADGES */}

          <div className="mb-4 flex flex-wrap items-center gap-2">

            <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400">
              {item.exam || "Exam"}
            </span>

            <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-purple-400">
              {item.subject || "Subject"}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {isActive
                ? "Active"
                : "Inactive"}
            </span>

          </div>

          {/* QUESTION */}

          <div className="text-lg font-bold leading-8 text-white">

            <span className="mr-2 text-blue-400">
              {index + 1}.
            </span>

            <RichContent
              content={item.question}
            />

          </div>

        </div>

        {/* ACTIONS */}

        <div className="flex shrink-0 items-start gap-2">

          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-400/10 px-4 py-2.5 text-xs font-black text-blue-400 transition hover:border-blue-400/30 hover:bg-blue-400/15 hover:text-blue-300"
          >
            <Edit3 size={16} />
            Edit
          </button>

          <button
            type="button"
            onClick={onToggleActive}
            disabled={activating}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              isActive
                ? "border-amber-400/10 bg-amber-400/[0.06] text-amber-400 hover:bg-amber-400/10"
                : "border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-400 hover:bg-emerald-400/10"
            }`}
          >

            {activating ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : isActive ? (
              <EyeOff size={16} />
            ) : (
              <Power size={16} />
            )}

          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.05] text-red-400 transition hover:bg-red-400/10"
          >

            {deleting ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={17} />
            )}

          </button>

        </div>

      </div>

      {/* OPTIONS */}

      <div className="mt-6 grid gap-3 md:grid-cols-2">

        {(item.options || []).map(
          (option, optionIndex) => {
            const letter =
              String.fromCharCode(
                65 + optionIndex
              );

            const isCorrect =
              String(
                item.answer || ""
              )
                .trim()
                .toUpperCase() ===
              letter;

            return (
              <div
                key={optionIndex}
                className={`rounded-xl border p-4 text-sm ${
                  isCorrect
                    ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
                    : "border-white/5 bg-white/[0.025] text-slate-400"
                }`}
              >

                <div className="flex gap-3">

                  <span className="font-black text-slate-500">
                    {letter}.
                  </span>

                  <div className="min-w-0 flex-1">
                    <RichContent
                      content={option}
                    />
                  </div>

                  {isCorrect && (
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-emerald-400"
                    />
                  )}

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* ANSWER */}

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">

        <span className="font-black text-slate-600">
          Correct Answer:
        </span>

        <span className="rounded-lg bg-emerald-400/10 px-3 py-1.5 font-black text-emerald-400">
          {item.answer || "Not set"}
        </span>

      </div>

      {/* REASON */}

      {item.reason && (
        <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">

          <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-600">
            Explanation
          </p>

          <div className="text-sm leading-7 text-slate-400">
            <RichContent
              content={item.reason}
            />
          </div>

        </div>
      )}

      {/* IMAGE */}

      {item.image && (
        <div className="mt-5">

          <img
            src={item.image}
            alt="Question"
            className="max-h-64 max-w-full rounded-2xl border border-white/10 object-contain"
          />

        </div>
      )}

    </div>
  );
};

/* =============================================================
   EDIT QUESTION MODAL
============================================================= */

const EditQuestionModal = ({
  question,
  saving,
  onClose,
  onSave,
  onFieldChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onToggleActive,
  activating,
}) => {
  const questionEditorRef =
    useRef(null);

  const reasonEditorRef =
    useRef(null);

  const isActive =
    question.active !== false;

  /*
   * IMPORTANT:
   *
   * Whenever a different question is opened,
   * put its HTML into the editor.
   */
  useEffect(() => {
    if (!questionEditorRef.current) {
      return;
    }

    const content =
      normalizeRichContent(
        question.question || ""
      );

    if (
      questionEditorRef.current
        .innerHTML !== content
    ) {
      questionEditorRef.current.innerHTML =
        content;
    }
  }, [question.id]);

  useEffect(() => {
    if (!reasonEditorRef.current) {
      return;
    }

    const content =
      normalizeRichContent(
        question.reason || ""
      );

    if (
      reasonEditorRef.current
        .innerHTML !== content
    ) {
      reasonEditorRef.current.innerHTML =
        content;
    }
  }, [question.id]);

  /* ==========================================================
     EXEC COMMAND
  ========================================================== */

  const runCommand = (
    command,
    value = null
  ) => {
    const editor =
      questionEditorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    document.execCommand(
      command,
      false,
      value
    );

    syncQuestionEditor();
  };

  /* ==========================================================
     INSERT HTML
  ========================================================== */

  const insertHTML = (html) => {
    const editor =
      questionEditorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    document.execCommand(
      "insertHTML",
      false,
      html
    );

    syncQuestionEditor();
  };

  /* ==========================================================
     SYNC QUESTION EDITOR
  ========================================================== */

  const syncQuestionEditor = () => {
    if (
      !questionEditorRef.current
    ) {
      return;
    }

    let html =
      questionEditorRef.current
        .innerHTML;

    /*
     * Automatically turn 2^4 into 2⁴.
     */
    html = convertCaretPowers(html);

    /*
     * Put transformed HTML back into
     * editor if necessary.
     */
    if (
      questionEditorRef.current
        .innerHTML !== html
    ) {
      questionEditorRef.current.innerHTML =
        html;
    }

    onFieldChange(
      "question",
      html
    );
  };

  /* ==========================================================
     QUESTION INPUT
  ========================================================== */

  const handleQuestionInput = () => {
    syncQuestionEditor();
  };

  /* ==========================================================
     REASON INPUT
  ========================================================== */

  const handleReasonInput = () => {
    if (!reasonEditorRef.current) {
      return;
    }

    onFieldChange(
      "reason",
      reasonEditorRef.current
        .innerHTML
    );
  };

  /* ==========================================================
     AUTO POWER
  ========================================================== */

  const handleQuestionKeyUp = () => {
    /*
     * Run after the browser has updated
     * contentEditable.
     */
    setTimeout(() => {
      syncQuestionEditor();
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:p-8">

      <div className="my-4 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-[0_30px_120px_rgba(0,0,0,0.6)] sm:my-8">

        {/* HEADER */}

        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur-xl sm:px-7">

          <div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              Question Editor
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              Edit CBT Question
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
          >
            <X size={19} />
          </button>

        </div>

        {/* BODY */}

        <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-5 sm:p-7">

          {/* EXAM + SUBJECT */}

          <div className="grid gap-4 md:grid-cols-2">

            <Field
              label="Exam"
              value={question.exam || ""}
              onChange={(value) =>
                onFieldChange(
                  "exam",
                  value
                )
              }
              placeholder="e.g. WAEC"
            />

            <Field
              label="Subject"
              value={
                question.subject || ""
              }
              onChange={(value) =>
                onFieldChange(
                  "subject",
                  value
                )
              }
              placeholder="e.g. Physics"
            />

          </div>

          {/* QUESTION */}

          <div className="mt-6">

            <div className="mb-2 flex items-center justify-between">

              <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                Question
              </label>

              <span className="text-[10px] font-bold text-blue-400">
                2^4 → 2⁴ automatically
              </span>

            </div>

            {/* TOOLBAR */}

            <div className="flex flex-wrap gap-1 rounded-t-2xl border border-white/10 bg-white/[0.03] p-2">

              <ToolbarButton
                icon={Bold}
                title="Bold"
                onClick={() =>
                  runCommand("bold")
                }
              />

              <ToolbarButton
                icon={Italic}
                title="Italic"
                onClick={() =>
                  runCommand("italic")
                }
              />

              <ToolbarButton
                icon={Underline}
                title="Underline"
                onClick={() =>
                  runCommand(
                    "underline"
                  )
                }
              />

              <ToolbarDivider />

              <ToolbarButton
                icon={Superscript}
                title="Superscript"
                onClick={() =>
                  runCommand(
                    "superscript"
                  )
                }
              />

              <ToolbarButton
                icon={Subscript}
                title="Subscript"
                onClick={() =>
                  runCommand(
                    "subscript"
                  )
                }
              />

              <ToolbarDivider />

              <ToolbarButton
                icon={Sigma}
                title="Insert π"
                onClick={() =>
                  insertHTML("π")
                }
              />

              <ToolbarButton
                icon={Plus}
                title="Insert ±"
                onClick={() =>
                  insertHTML("±")
                }
              />

              <ToolbarButton
                icon={Minus}
                title="Insert ×"
                onClick={() =>
                  insertHTML("×")
                }
              />

              <ToolbarButton
                icon={Divide}
                title="Insert ÷"
                onClick={() =>
                  insertHTML("÷")
                }
              />

              <ToolbarDivider />

              <button
                type="button"
                title="Square root"
                onClick={() =>
                  insertHTML("√")
                }
                className="flex h-8 items-center justify-center rounded-lg px-2.5 text-sm font-black text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                √
              </button>

              <button
                type="button"
                title="Fraction"
                onClick={() =>
                  insertHTML(
                    `<span style="display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.1"><span>numerator</span><span style="border-top:1px solid currentColor;padding:0 4px">denominator</span></span>&nbsp;`
                  )
                }
                className="flex h-8 items-center justify-center rounded-lg px-2.5 text-sm font-black text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                ½
              </button>

            </div>

            {/* EDITOR */}

            <div
              ref={questionEditorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={
                handleQuestionInput
              }
              onKeyUp={
                handleQuestionKeyUp
              }
              className="min-h-[150px] rounded-b-2xl border-x border-b border-white/10 bg-white/[0.025] p-5 text-[15px] leading-8 text-white outline-none transition focus:border-blue-400/30"
            />

            <p className="mt-2 text-[11px] leading-5 text-slate-600">
              Type mathematical powers normally:
              <span className="mx-1 text-slate-400">
                2^4
              </span>
              becomes
              <span className="mx-1 text-slate-400">
                2⁴
              </span>
              automatically.
            </p>

          </div>

          {/* OPTIONS */}

          <div className="mt-7">

            <div className="mb-4 flex items-center justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                  Answer Options
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Format each option if necessary.
                </p>

              </div>

              <button
                type="button"
                onClick={onAddOption}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-400/10 px-3.5 py-2 text-xs font-black text-blue-400 transition hover:bg-blue-400/15"
              >
                <Plus size={15} />
                Add Option
              </button>

            </div>

            <div className="space-y-3">

              {(question.options || []).map(
                (option, index) => {
                  const letter =
                    String.fromCharCode(
                      65 + index
                    );

                  const isCorrect =
                    String(
                      question.answer ||
                        ""
                    )
                      .trim()
                      .toUpperCase() ===
                    letter;

                  return (
                    <OptionEditor
                      key={`${question.id}-${index}`}
                      index={index}
                      letter={letter}
                      value={option}
                      isCorrect={isCorrect}
                      onChange={(value) =>
                        onOptionChange(
                          index,
                          value
                        )
                      }
                      onRemove={() =>
                        onRemoveOption(
                          index
                        )
                      }
                      onSetCorrect={() =>
                        onFieldChange(
                          "answer",
                          letter
                        )
                      }
                    />
                  );
                }
              )}

            </div>

          </div>

          {/* REASON */}

          <div className="mt-7">

            <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">
              Reason / Explanation
            </label>

            <div
              ref={reasonEditorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleReasonInput}
              className="min-h-[120px] rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm leading-7 text-white outline-none focus:border-blue-400/30"
            />

            <p className="mt-2 text-[11px] text-slate-600">
              This explanation is shown to students after
              answering the question.
            </p>

          </div>

          {/* IMAGE */}

          <div className="mt-7">

            <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">
              Question Image
            </label>

            <div className="relative">

              <ImageIcon
                size={17}
                className="absolute left-4 top-3.5 text-slate-600"
              />

              <input
                type="text"
                value={
                  question.image || ""
                }
                onChange={(e) =>
                  onFieldChange(
                    "image",
                    e.target.value
                  )
                }
                placeholder="Image URL (optional)"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.025] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-700 focus:border-blue-400/30"
              />

            </div>

            {question.image && (
              <img
                src={question.image}
                alt="Question preview"
                className="mt-4 max-h-64 rounded-2xl border border-white/10 object-contain"
              />
            )}

          </div>

          {/* STATUS */}

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-emerald-400/10"
                      : "bg-red-400/10"
                  }`}
                >

                  {isActive ? (
                    <Eye
                      size={19}
                      className="text-emerald-400"
                    />
                  ) : (
                    <EyeOff
                      size={19}
                      className="text-red-400"
                    />
                  )}

                </div>

                <div>

                  <p className="font-black text-white">
                    Question Status
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {isActive
                      ? "This question is available for students."
                      : "This question is hidden from students."}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={onToggleActive}
                disabled={activating}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                  isActive
                    ? "border border-red-400/15 bg-red-400/10 text-red-400 hover:bg-red-400/15"
                    : "border border-emerald-400/15 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/15"
                }`}
              >

                {activating ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : isActive ? (
                  <>
                    <EyeOff size={15} />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power size={15} />
                    Activate
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-slate-950/95 p-5 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-7">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Changes
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
};

/* =============================================================
   OPTION EDITOR
============================================================= */

const OptionEditor = ({
  index,
  letter,
  value,
  isCorrect,
  onChange,
  onRemove,
  onSetCorrect,
}) => {
  const editorRef = useRef(null);

  /*
   * Load option HTML when the option changes
   * or a different question is opened.
   */
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const normalized =
      normalizeRichContent(
        value || ""
      );

    if (
      editorRef.current.innerHTML !==
      normalized
    ) {
      editorRef.current.innerHTML =
        normalized;
    }
  }, [value]);

  const handleInput = (event) => {
    let html =
      event.currentTarget.innerHTML;

    /*
     * Automatic power conversion.
     */
    html = convertCaretPowers(html);

    if (
      event.currentTarget.innerHTML !==
      html
    ) {
      event.currentTarget.innerHTML =
        html;
    }

    onChange(html);
  };

  const format = (command) => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();

    document.execCommand(
      command,
      false,
      null
    );

    onChange(
      editorRef.current.innerHTML
    );
  };

  return (
    <div
      className={`rounded-2xl border p-3 transition ${
        isCorrect
          ? "border-emerald-400/20 bg-emerald-400/[0.04]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >

      <div className="flex items-start gap-3">

        {/* LETTER */}

        <button
          type="button"
          onClick={onSetCorrect}
          title="Set as correct answer"
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black transition ${
            isCorrect
              ? "bg-emerald-400 text-slate-950"
              : "bg-white/[0.05] text-slate-500 hover:bg-blue-400/10 hover:text-blue-400"
          }`}
        >
          {isCorrect ? (
            <Check size={16} />
          ) : (
            letter
          )}
        </button>

        <div className="min-w-0 flex-1">

          {/* MINI TOOLBAR */}

          <div className="mb-2 flex gap-1">

            <button
              type="button"
              onClick={() =>
                format("bold")
              }
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
            >
              <Bold size={13} />
            </button>

            <button
              type="button"
              onClick={() =>
                format("italic")
              }
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
            >
              <Italic size={13} />
            </button>

            <button
              type="button"
              onClick={() =>
                format("underline")
              }
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
            >
              <Underline size={13} />
            </button>

            <button
              type="button"
              onClick={() =>
                format("superscript")
              }
              title="Superscript"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
            >
              <Superscript size={13} />
            </button>

            <button
              type="button"
              onClick={() =>
                format("subscript")
              }
              title="Subscript"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
            >
              <Subscript size={13} />
            </button>

          </div>

          {/* EDITABLE OPTION */}

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="min-h-[45px] rounded-xl border border-white/5 bg-black/10 p-3 text-sm leading-6 text-white outline-none focus:border-blue-400/20"
          />

        </div>

        {/* REMOVE */}

        <button
          type="button"
          onClick={onRemove}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-red-400/10 hover:text-red-400"
          title="Remove option"
        >
          <X size={16} />
        </button>

      </div>

    </div>
  );
};

/* =============================================================
   TOOLBAR BUTTON
============================================================= */

const ToolbarButton = ({
  icon: Icon,
  title,
  onClick,
}) => {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-8 items-center justify-center rounded-lg px-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
    >
      <Icon size={15} />
    </button>
  );
};

/* =============================================================
   TOOLBAR DIVIDER
============================================================= */

const ToolbarDivider = () => (
  <div className="mx-1 h-8 w-px bg-white/10" />
);

/* =============================================================
   FIELD
============================================================= */

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div>

      <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-blue-400/30"
      />

    </div>
  );
};

/* =============================================================
   STAT CARD
============================================================= */

const StatCard = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">

          <Icon
            size={19}
            className="text-blue-400"
          />

        </div>

        <div>

          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
            {label}
          </p>

          <p className="mt-1 text-2xl font-black text-white">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
};

/* =============================================================
   RICH CONTENT
============================================================= */

const RichContent = ({
  content,
}) => {
  if (!content) {
    return (
      <span className="text-slate-600">
        —
      </span>
    );
  }

  const normalized =
    normalizeRichContent(
      content
    );

  /*
   * If there is no HTML, render as
   * normal text.
   */
  const looksLikeHtml =
    /<\/?[a-z][\s\S]*>/i.test(
      String(normalized)
    );

  if (!looksLikeHtml) {
    return (
      <span className="whitespace-pre-wrap">
        {decodeHtml(
          String(normalized)
        )}
      </span>
    );
  }

  return (
    <span
      className="rich-content [&_sup]:align-super [&_sup]:text-[0.7em] [&_sub]:align-sub [&_sub]:text-[0.7em]"
      dangerouslySetInnerHTML={{
        __html: normalized,
      }}
    />
  );
};

export default QuestionsAdmin;