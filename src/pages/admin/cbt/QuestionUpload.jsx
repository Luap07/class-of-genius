import React, { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { UploadCloud, ImagePlus } from "lucide-react";

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

  const exams = [
    "JAMB",
    "WAEC",
    "NECO",
  ];

  const subjects = [
    "Mathematics",
    "English",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Government",
    "Literature",
  ];

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];
    updated[index] = value;

    setForm({
      ...form,
      options: updated,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.exam ||
      !form.subject ||
      !form.question ||
      !form.answer ||
      !form.reason
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = null;

      // ==============================
      // UPLOAD IMAGE
      // ==============================

      if (form.image) {
        const fileName = `${Date.now()}-${form.image.name}`;

        const { error: uploadError } = await supabase.storage
          .from("cbt-images")
          .upload(fileName, form.image);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("cbt-images")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // ==============================
      // INSERT QUESTION
      // ==============================

      const { error } = await supabase
        .from("cbt_questions")
        .insert([
          {
            exam: form.exam,
            subject: form.subject,
            question: form.question,
            options: form.options,
            answer: form.answer,
            reason: form.reason,
            image: imageUrl,
          },
        ]);

      if (error) throw error;

      // ==============================
      // SUCCESS
      // ==============================

      alert("Question uploaded successfully");

      setForm({
        exam: "",
        subject: "",
        question: "",
        options: ["", "", "", ""],
        answer: "",
        reason: "",
        image: null,
      });

    } catch (error) {
      console.log(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-400 mb-8">
          Upload CBT Question
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6"
        >

          {/* Exam */}
          <div>
            <label className="text-sm text-slate-400">
              Exam Category
            </label>

            <select
              value={form.exam}
              onChange={(e) =>
                setForm({
                  ...form,
                  exam: e.target.value,
                })
              }
              className="w-full mt-2 bg-slate-800 rounded-lg p-3"
            >
              <option value="">
                Select Exam
              </option>

              {exams.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm text-slate-400">
              Subject
            </label>

            <select
              value={form.subject}
              onChange={(e) =>
                setForm({
                  ...form,
                  subject: e.target.value,
                })
              }
              className="w-full mt-2 bg-slate-800 rounded-lg p-3"
            >
              <option value="">
                Select Subject
              </option>

              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="text-sm text-slate-400">
              Question
            </label>

            <textarea
              value={form.question}
              onChange={(e) =>
                setForm({
                  ...form,
                  question: e.target.value,
                })
              }
              placeholder="Enter the question..."
              className="w-full mt-2 bg-slate-800 rounded-lg p-3 h-32 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Options */}
          <div>
            <label className="text-sm text-slate-400 mb-3 block">
              Answer Options
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              {form.options.map((option, index) => (
                <div key={index}>
                  <label className="text-xs text-slate-500">
                    Option {String.fromCharCode(65 + index)}
                  </label>

                  <input
                    value={option}
                    placeholder={`Enter option ${String.fromCharCode(
                      65 + index
                    )}`}
                    onChange={(e) =>
                      handleOptionChange(
                        index,
                        e.target.value
                      )
                    }
                    className="w-full mt-1 bg-slate-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Correct Answer */}
          <div>
            <label className="text-sm text-slate-400">
              Correct Answer
            </label>

            <input
              value={form.answer}
              onChange={(e) =>
                setForm({
                  ...form,
                  answer: e.target.value,
                })
              }
              placeholder="Example: B"
              className="w-full mt-2 bg-slate-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xs text-slate-500 mt-2">
              Enter A, B, C, or D depending on the correct option.
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm text-slate-400">
              Reason for Answer
            </label>

            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm({
                  ...form,
                  reason: e.target.value,
                })
              }
              placeholder="Explain why this answer is correct..."
              className="w-full mt-2 bg-slate-800 rounded-lg p-3 h-32 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xs text-slate-500 mt-2">
              This explanation will be shown to students after they
              answer the question.
            </p>
          </div>

          {/* Image */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer text-blue-400">
              <ImagePlus size={20} />
              Add Question Image

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  setForm({
                    ...form,
                    image: e.target.files?.[0] || null,
                  })
                }
              />
            </label>

            {form.image && (
              <p className="text-sm text-slate-400 mt-2">
                Selected: {form.image.name}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition"
          >
            <UploadCloud size={20} />

            {loading
              ? "Uploading..."
              : "Upload Question"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default QuestionUpload;