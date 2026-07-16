import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
  Loader2,
  ClipboardCheck,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  supabase,
} from "../../../lib/supabaseClient";

import AdminButton from "../../../components/admin/ui/AdminButton";

const CreateMonthlyQuiz = () => {

  const navigate = useNavigate();

  const { topicId } = useParams();

  /* ================= STATE ================= */

  const [loading, setLoading] = useState(false);

  const [topic, setTopic] = useState(null);

  const [formData, setFormData] = useState({

    title: "",

    description: "",

    month: "",

    quiz_number: 1,

    duration: 30,

    passing_score: 50,

    status: "Draft",

  });

  /* ================= FETCH TOPIC ================= */

  const fetchTopic = async () => {

    if (!topicId) return;

    const {

      data,

      error,

    } = await supabase

      .from("course_topics")

      .select(`
        id,
        title,
        course_id,
        courses(
          title
        )
      `)

      .eq("id", topicId)

      .single();

    if (error) {

      console.error(error);

      alert("Unable to load topic.");

      return;

    }

    setTopic(data);

  };

  useEffect(() => {

    fetchTopic();

  }, [topicId]);

  /* ================= INPUT ================= */

  const handleChange = (e) => {

    const {

      name,

      value,

    } = e.target;

    setFormData((previous) => ({

      ...previous,

      [name]: value,

    }));

  };

  /* ================= SAVE ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (

      !formData.title ||

      !formData.month

    ) {

      alert("Quiz title and month are required.");

      return;

    }

    setLoading(true);
        const { error } = await supabase

      .from("monthly_quizzes")

      .insert({

        topic_id: topicId,

        course_id: topic.course_id,

        title: formData.title,

        description: formData.description,

        month: formData.month,

        quiz_number: Number(formData.quiz_number),

        duration: Number(formData.duration),

        passing_score: Number(formData.passing_score),

        status: formData.status,

        question_count: 0,

      });

    setLoading(false);

    if (error) {

      console.error(error);

      alert(error.message);

      return;

    }

    alert("Monthly Quiz created successfully.");

    navigate(`/admin/lms/topic/${topicId}/quizzes`);

  };

  return (

    <div className="mx-auto max-w-5xl space-y-8 p-6">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between">

        <div>

          <div className="flex items-center gap-3">

            <ClipboardCheck
              size={30}
              className="text-blue-400"
            />

            <h1 className="text-3xl font-bold text-white">

              Create Monthly Quiz

            </h1>

          </div>

          <p className="mt-2 text-slate-400">

            Create a quiz for this topic.

          </p>

        </div>

        <AdminButton

          variant="secondary"

          onClick={() => navigate(-1)}

        >

          <ArrowLeft size={18} />

          Back

        </AdminButton>

      </div>

      {/* ================= FORM ================= */}

      <form

        onSubmit={handleSubmit}

        className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8"

      >

        {/* COURSE */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">

            Course

          </label>

          <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">

            {topic?.courses?.title || "Loading..."}

          </div>

        </div>

        {/* TOPIC */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">

            Topic

          </label>

          <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">

            {topic?.title || "Loading..."}

          </div>

        </div>

        {/* TITLE */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">

            Quiz Title

          </label>

          <input

            type="text"

            name="title"

            value={formData.title}

            onChange={handleChange}

            placeholder="e.g. Motion Assessment"

            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"

          />

        </div>

        {/* DESCRIPTION */}

        <div>

          <label className="mb-2 block text-sm text-slate-400">

            Description

          </label>

          <textarea

            rows={4}

            name="description"

            value={formData.description}

            onChange={handleChange}

            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"

          />

        </div>
                {/* ================= QUIZ DETAILS ================= */}

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm text-slate-400">

              Month

            </label>

            <input
              type="month"
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-400">

              Quiz Number

            </label>

            <input
              type="number"
              min="1"
              name="quiz_number"
              value={formData.quiz_number}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />

          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-3">

          <div>

            <label className="mb-2 block text-sm text-slate-400">

              Duration (Minutes)

            </label>

            <input
              type="number"
              min="1"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-400">

              Passing Score (%)

            </label>

            <input
              type="number"
              min="0"
              max="100"
              name="passing_score"
              value={formData.passing_score}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-400">

              Status

            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            >
              <option value="Draft">
                Draft
              </option>

              <option value="Published">
                Published
              </option>

            </select>

          </div>

        </div>

        {/* ================= ACTIONS ================= */}

        <div className="flex justify-end gap-4 border-t border-slate-800 pt-6">

          <AdminButton

            type="button"

            variant="secondary"

            onClick={() => navigate(-1)}

          >

            Cancel

          </AdminButton>

          <AdminButton

            type="submit"

            disabled={loading}

          >

            {loading ? (

              <>

                <Loader2
                  size={18}
                  className="mr-2 animate-spin"
                />

                Saving...

              </>

            ) : (

              <>

                <Save
                  size={18}
                  className="mr-2"
                />

                Create Monthly Quiz

              </>

            )}

          </AdminButton>

        </div>

      </form>

    </div>

  );

};

export default CreateMonthlyQuiz;