import React, { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  UploadCloud,
  ImagePlus,
  Loader2,
  X,
  Calculator,
} from "lucide-react";

/*
 * ============================================================
 * POWER / SUPERSCRIPT CONVERSION
 * ============================================================
 *
 * Examples:
 *
 * 2^4       → 2⁴
 * x^2       → x²
 * 10^3      → 10³
 * (x+1)^2   → (x+1)²
 *
 * Supports:
 * 0 - 9
 * + - = ( )
 *
 * Also supports ^{...}
 *
 * Example:
 * x^{2}     → x²
 * x^{n}     → xⁿ
 */

const superscriptMap = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  "a": "ᵃ",
  "b": "ᵇ",
  "c": "ᶜ",
  "d": "ᵈ",
  "e": "ᵉ",
  "f": "ᶠ",
  "g": "ᵍ",
  "h": "ʰ",
  "i": "ⁱ",
  "j": "ʲ",
  "k": "ᵏ",
  "l": "ˡ",
  "m": "ᵐ",
  "n": "ⁿ",
  "o": "ᵒ",
  "p": "ᵖ",
  "r": "ʳ",
  "s": "ˢ",
  "t": "ᵗ",
  "u": "ᵘ",
  "v": "ᵛ",
  "w": "ʷ",
  "x": "ˣ",
  "y": "ʸ",
  "z": "ᶻ",
};

const convertToSuperscript = (value) => {
  return [...value]
    .map((character) => superscriptMap[character] || character)
    .join("");
};

const convertPowers = (text) => {
  if (!text) return "";

  let result = text;

  /*
   * Handles:
   *
   * x^{2}
   * x^{10}
   * (x+1)^{2}
   */

  result = result.replace(/\^\{([^{}]+)\}/g, (_, power) => {
    return convertToSuperscript(power);
  });

  /*
   * Handles:
   *
   * x^2
   * x^4
   * x^10
   * 2^n
   *
   * The power continues while it contains letters/numbers
   * that can be converted to superscript.
   */

  result = result.replace(
    /\^([0-9a-zA-Z+\-=()]+)/g,
    (_, power) => {
      return convertToSuperscript(power);
    }
  );

  return result;
};

const QuestionUpload = () => {
  const [form, setForm] = useState({
    exam: "",
    subject: "",
    question: "",
    options: ["", "", "", ""],
    answer: "",
    reason: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);

  /*
   * ============================================================
   * HANDLE NORMAL INPUTS
   * ============================================================
   */

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
   * ============================================================
   * HANDLE QUESTION INPUT
   *
   * Automatically converts:
   *
   * 2^4 → 2⁴
   * x^2 → x²
   * x^{10} → x¹⁰
   * ============================================================
   */

  const handleQuestionChange = (value) => {
    setForm((previous) => ({
      ...previous,
      question: convertPowers(value),
    }));
  };

  /*
   * ============================================================
   * HANDLE OPTION CHANGE
   * ============================================================
   */

  const handleOptionChange = (index, value) => {
    setForm((previous) => {
      const updatedOptions = [...previous.options];

      updatedOptions[index] = convertPowers(value);

      return {
        ...previous,
        options: updatedOptions,
      };
    });
  };

  /*
   * ============================================================
   * HANDLE REASON CHANGE
   * ============================================================
   */

  const handleReasonChange = (value) => {
    setForm((previous) => ({
      ...previous,
      reason: convertPowers(value),
    }));
  };

  /*
   * ============================================================
   * RESET FORM
   * ============================================================
   */

  const resetForm = () => {
    setForm({
      exam: "",
      subject: "",
      question: "",
      options: ["", "", "", ""],
      answer: "",
      reason: "",
      image: null,
    });
  };

  /*
   * ============================================================
   * VALIDATE FORM
   * ============================================================
   */

  const validateForm = () => {
    if (!form.exam.trim()) {
      alert("Please enter the examination category.");
      return false;
    }

    if (!form.subject.trim()) {
      alert("Please enter the subject.");
      return false;
    }

    if (!form.question.trim()) {
      alert("Please enter the question.");
      return false;
    }

    if (form.options.some((option) => !option.trim())) {
      alert("Please fill all four answer options.");
      return false;
    }

    if (!form.answer.trim()) {
      alert("Please select the correct answer.");
      return false;
    }

    const answer = form.answer.trim().toUpperCase();

    if (!["A", "B", "C", "D"].includes(answer)) {
      alert("Correct Answer must be A, B, C, or D.");
      return false;
    }

    if (!form.reason.trim()) {
      alert("Please provide the reason for the answer.");
      return false;
    }

    return true;
  };

  /*
   * ============================================================
   * HANDLE IMAGE SELECTION
   * ============================================================
   */

  const handleImageChange = (file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    /*
     * 10MB maximum
     */

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Image must be smaller than 10MB.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      image: file,
    }));
  };

  /*
   * ============================================================
   * REMOVE IMAGE
   * ============================================================
   */

  const removeImage = () => {
    setForm((previous) => ({
      ...previous,
      image: null,
    }));
  };

  /*
   * ============================================================
   * UPLOAD QUESTION
   * ============================================================
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let imageUrl = null;
      let uploadedImagePath = null;

      /*
       * ========================================================
       * UPLOAD IMAGE TO SUPABASE STORAGE
       *
       * Bucket:
       *
       * cbt-images
       * ========================================================
       */

      if (form.image) {
        const safeFileName = form.image.name
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9._-]/g, "");

        const fileName = `${Date.now()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("cbt-images")
          .upload(fileName, form.image, {
            cacheControl: "3600",
            upsert: false,
            contentType: form.image.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        uploadedImagePath = fileName;

        const { data: publicUrlData } = supabase.storage
          .from("cbt-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData?.publicUrl || null;
      }

      /*
       * ========================================================
       * PREPARE DATA
       * ========================================================
       */

      const exam = form.exam.trim();
      const subject = form.subject.trim();
      const question = convertPowers(form.question.trim());

      const options = form.options.map((option) =>
        convertPowers(option.trim())
      );

      const answer = form.answer.trim().toUpperCase();

      const reason = convertPowers(form.reason.trim());

      /*
       * ========================================================
       * INSERT INTO CBT QUESTIONS
       * ========================================================
       */

      const { error: insertError } = await supabase
        .from("cbt_questions")
        .insert([
          {
            exam,
            subject,
            question,
            options,
            answer,
            reason,
            image: imageUrl,
          },
        ]);

      /*
       * ========================================================
       * IF DATABASE INSERT FAILS
       *
       * Delete uploaded image so we don't leave orphan files.
       * ========================================================
       */

      if (insertError) {
        if (uploadedImagePath) {
          await supabase.storage
            .from("cbt-images")
            .remove([uploadedImagePath]);
        }

        throw insertError;
      }

      /*
       * ========================================================
       * SUCCESS
       * ========================================================
       */

      alert("Question uploaded successfully.");

      resetForm();
    } catch (error) {
      console.error("CBT Question Upload Error:", error);

      alert(
        error?.message ||
          "Something went wrong while uploading the question."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/20">
              <UploadCloud size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Upload CBT Question
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Add questions directly to your CBT question bank.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            POWER INFO
        ======================================================= */}

        <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-start gap-3">
            <Calculator
              size={20}
              className="mt-0.5 shrink-0 text-blue-400"
            />

            <div>
              <p className="font-semibold text-blue-300">
                Automatic Power Formatting
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Type powers normally and they will automatically
                become superscripts.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-slate-300">
                  2^4 → 2⁴
                </span>

                <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-slate-300">
                  x^2 → x²
                </span>

                <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-slate-300">
                  x^{10} → x¹⁰
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            FORM
        ======================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-8"
        >

          {/* ====================================================
              EXAM CATEGORY
          ===================================================== */}

          <div>
            <label className="text-sm font-semibold text-slate-300">
              Exam Category
            </label>

            <input
              type="text"
              value={form.exam}
              onChange={(e) =>
                handleChange("exam", e.target.value)
              }
              placeholder="e.g. WAEC, JAMB, NECO"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3.5 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            <p className="mt-2 text-xs text-slate-500">
              Type the examination category manually.
            </p>
          </div>

          {/* ====================================================
              SUBJECT
          ===================================================== */}

          <div>
            <label className="text-sm font-semibold text-slate-300">
              Subject
            </label>

            <input
              type="text"
              value={form.subject}
              onChange={(e) =>
                handleChange("subject", e.target.value)
              }
              placeholder="e.g. Mathematics, Physics, Chemistry"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3.5 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            <p className="mt-2 text-xs text-slate-500">
              Type the subject manually.
            </p>
          </div>

          {/* ====================================================
              QUESTION
          ===================================================== */}

          <div>
            <label className="text-sm font-semibold text-slate-300">
              Question
            </label>

            <textarea
              value={form.question}
              onChange={(e) =>
                handleQuestionChange(e.target.value)
              }
              placeholder="Enter the question... Example: If 2^4 = ?, calculate the value."
              className="mt-2 h-36 w-full resize-y rounded-xl border border-slate-700 bg-slate-800 p-4 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Powers are converted automatically.
              </p>

              <span className="text-xs text-slate-600">
                {form.question.length} characters
              </span>
            </div>
          </div>

          {/* ====================================================
              OPTIONS
          ===================================================== */}

          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-300">
              Answer Options
            </label>

            <div className="grid gap-4 md:grid-cols-2">

              {form.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index);

                return (
                  <div key={letter}>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-700 text-slate-300">
                        {letter}
                      </span>

                      Option {letter}
                    </label>

                    <input
                      type="text"
                      value={option}
                      placeholder={`Enter option ${letter}`}
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3.5 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                );
              })}

            </div>
          </div>

          {/* ====================================================
              CORRECT ANSWER
          ===================================================== */}

          <div>
            <label className="text-sm font-semibold text-slate-300">
              Correct Answer
            </label>

            <select
              value={form.answer}
              onChange={(e) =>
                handleChange("answer", e.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3.5 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">
                Select Correct Answer
              </option>

              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Select the option that contains the correct answer.
            </p>
          </div>

          {/* ====================================================
              REASON
          ===================================================== */}

          <div>
            <label className="text-sm font-semibold text-slate-300">
              Reason for Answer
            </label>

            <textarea
              value={form.reason}
              onChange={(e) =>
                handleReasonChange(e.target.value)
              }
              placeholder="Explain why this answer is correct..."
              className="mt-2 h-36 w-full resize-y rounded-xl border border-slate-700 bg-slate-800 p-4 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            <p className="mt-2 text-xs text-slate-500">
              Powers inside the explanation are also converted
              automatically.
            </p>
          </div>

          {/* ====================================================
              IMAGE
          ===================================================== */}

          <div>
            <label className="text-sm font-semibold text-slate-300">
              Question Image
            </label>

            <div className="mt-2 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-5">
              {!form.image ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl p-6 text-center transition hover:bg-slate-900">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400">
                    <ImagePlus size={26} />
                  </div>

                  <p className="font-semibold text-slate-300">
                    Add Question Image
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    PNG, JPG, JPEG, WEBP — maximum 10MB
                  </p>

                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(
                        e.target.files?.[0] || null
                      )
                    }
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
                      <ImagePlus size={22} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        Image selected
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {form.image.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {(form.image.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ====================================================
              PREVIEW
          ===================================================== */}

          {(form.question ||
            form.options.some(Boolean) ||
            form.reason) && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  Question Preview
                </h3>

                <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400">
                  Preview
                </span>
              </div>

              {form.question && (
                <p className="mb-4 text-base leading-7 text-slate-200">
                  {form.question}
                </p>
              )}

              <div className="space-y-2">
                {form.options.map((option, index) => {
                  if (!option.trim()) return null;

                  const letter = String.fromCharCode(
                    65 + index
                  );

                  const isCorrect =
                    form.answer.toUpperCase() === letter;

                  return (
                    <div
                      key={letter}
                      className={`rounded-xl border p-3 ${
                        isCorrect
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-slate-800 bg-slate-900"
                      }`}
                    >
                      <span className="mr-2 font-semibold text-blue-400">
                        {letter}.
                      </span>

                      <span className="text-sm text-slate-300">
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>

              {form.reason && (
                <div className="mt-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-400">
                    Explanation
                  </p>

                  <p className="text-sm leading-6 text-slate-400">
                    {form.reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              SUBMIT
          ===================================================== */}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Uploading Question...
              </>
            ) : (
              <>
                <UploadCloud size={20} />

                Upload Question
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default QuestionUpload;