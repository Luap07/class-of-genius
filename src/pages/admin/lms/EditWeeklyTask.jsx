import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Upload,
  Save,
  Loader2,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  supabase,
} from "../../../lib/supabaseClient";

import AdminButton from "../../../components/admin/ui/AdminButton";

const EditWeeklyTask = () => {

  const navigate = useNavigate();

  const { id } = useParams();

  /* ===========================
      STATE
  =========================== */

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [courses, setCourses] = useState([]);

  const [topics, setTopics] = useState([]);

  const [formData, setFormData] = useState({

    course_id: "",

    topic_id: "",

    title: "",

    description: "",

    due_date: "",

    file_url: "",

    file: null,

  });

  /* ===========================
      FETCH COURSES
  =========================== */

  const fetchCourses = async () => {

    const { data, error } = await supabase
      .from("courses")
      .select("id,title")
      .order("title");

    if (error) {

      console.error(error);

      return;

    }

    setCourses(data || []);

  };

  /* ===========================
      FETCH TOPICS
  =========================== */

  const fetchTopics = async (courseId) => {

    if (!courseId) {

      setTopics([]);

      return;

    }

    const { data, error } = await supabase
      .from("course_topics")
      .select("id,title")
      .eq("course_id", courseId)
      .order("position");

    if (error) {

      console.error(error);

      return;

    }

    setTopics(data || []);

  };

  /* ===========================
      FETCH TASK
  =========================== */

  const fetchTask = async () => {

    setLoading(true);

    const { data, error } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {

      console.error(error);

      alert("Unable to load task.");

      navigate("/admin/lms/tasks");

      return;

    }

    setFormData({

      course_id: data.course_id || "",

      topic_id: data.topic_id || "",

      title: data.title || "",

      description: data.description || "",

      due_date: data.due_date
        ? data.due_date.slice(0, 10)
        : "",

      file_url: data.file_url || "",

      file: null,

    });

    await fetchTopics(data.course_id);

    setLoading(false);

  };

  useEffect(() => {

    fetchCourses();

    fetchTask();

  }, []);
    /* ===========================
      HANDLE INPUT CHANGE
  =========================== */

  const handleChange = async (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "course_id") {

      setFormData((previous) => ({
        ...previous,
        course_id: value,
        topic_id: "",
      }));

      await fetchTopics(value);
    }
  };

  /* ===========================
      FILE CHANGE
  =========================== */

  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setFormData((previous) => ({
      ...previous,
      file,
    }));
  };

  /* ===========================
      UPLOAD FILE
  =========================== */

  const uploadFile = async () => {

    if (!formData.file) {

      return formData.file_url;

    }

    setUploading(true);

    const fileName =
      `${Date.now()}-${formData.file.name}`;

    const { error } = await supabase.storage
      .from("course-documents")
      .upload(fileName, formData.file);

    if (error) {

      console.error(error);

      alert(error.message);

      setUploading(false);

      return null;

    }

    const { data } = supabase.storage
      .from("course-documents")
      .getPublicUrl(fileName);

    setUploading(false);

    return data.publicUrl;
  };

  /* ===========================
      UPDATE TASK
  =========================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !formData.course_id ||
      !formData.topic_id ||
      !formData.title.trim()
    ) {

      alert(
        "Course, topic and title are required."
      );

      return;
    }

    setSaving(true);

    const fileUrl = await uploadFile();

    if (formData.file && !fileUrl) {

      setSaving(false);

      return;

    }

    const { error } = await supabase
      .from("weekly_tasks")
      .update({

        course_id: formData.course_id,

        topic_id: formData.topic_id,

        title: formData.title,

        description: formData.description,

        due_date:
          formData.due_date || null,

        file_url: fileUrl,

      })
      .eq("id", id);

    setSaving(false);

    if (error) {

      console.error(error);

      alert(error.message);

      return;

    }

    navigate("/admin/lms/tasks");
  };
    if (loading) {

    return (
      <div className="flex min-h-[400px] items-center justify-center text-white">
        <Loader2
          size={40}
          className="animate-spin text-blue-500"
        />
      </div>
    );

  }


  return (

    <div className="max-w-5xl mx-auto space-y-8 p-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-white">
            Edit Weekly Task
          </h1>

          <p className="mt-2 text-slate-400">
            Update task details and learning materials.
          </p>

        </div>


        <AdminButton
          variant="secondary"
          onClick={() =>
            navigate("/admin/lms/tasks")
          }
        >

          <ArrowLeft size={18} className="mr-2"/>

          Back

        </AdminButton>


      </div>



      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="
          space-y-8
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
          p-8
        "
      >


        {/* COURSE */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Course
          </label>

          <select

            name="course_id"

            value={formData.course_id}

            onChange={handleChange}

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              px-4
              py-3
              text-white
            "

          >

            <option value="">
              Select Course
            </option>


            {
              courses.map((course)=>(

                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.title}
                </option>

              ))
            }


          </select>

        </div>




        {/* TOPIC */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Topic
          </label>


          <select

            name="topic_id"

            value={formData.topic_id}

            onChange={handleChange}

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              px-4
              py-3
              text-white
            "

          >

            <option value="">
              Select Topic
            </option>


            {
              topics.map((topic)=>(

                <option
                  key={topic.id}
                  value={topic.id}
                >

                  {topic.title}

                </option>

              ))
            }


          </select>


        </div>




        {/* TITLE */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Task Title
          </label>


          <input

            type="text"

            name="title"

            value={formData.title}

            onChange={handleChange}

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              px-4
              py-3
              text-white
            "

          />

        </div>




        {/* DESCRIPTION */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Instructions
          </label>


          <textarea

            rows="5"

            name="description"

            value={formData.description}

            onChange={handleChange}

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              px-4
              py-3
              text-white
            "

          />


        </div>




        {/* DEADLINE */}

        <div>

          <label className="mb-2 block text-slate-300">
            Due Date
          </label>


          <input

            type="date"

            name="due_date"

            value={formData.due_date}

            onChange={handleChange}

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              px-4
              py-3
              text-white
            "

          />


        </div>




        {/* FILE */}

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Replace File (Optional)
          </label>


          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-4
              rounded-xl
              border
              border-dashed
              border-slate-700
              bg-slate-950
              p-6
              text-slate-400
            "
          >

            <Upload size={25}/>


            <span>

              {
                formData.file
                ?
                formData.file.name
                :
                "Choose new PDF/DOCX file"
              }

            </span>


            <input

              type="file"

              onChange={handleFileChange}

              className="hidden"

            />

          </label>



          {
            formData.file_url && (

              <p className="mt-3 text-sm text-blue-400">

                Existing file attached

              </p>

            )
          }


        </div>




        {/* BUTTON */}

        <div className="flex justify-end">


          <AdminButton

            type="submit"

            disabled={
              saving ||
              uploading
            }

          >

            {
              saving || uploading

              ?

              <Loader2
                size={18}
                className="mr-2 animate-spin"
              />

              :

              <Save
                size={18}
                className="mr-2"
              />

            }


            {
              uploading
              ?
              "Uploading..."

              :

              saving
              ?
              "Updating..."

              :

              "Update Task"
            }


          </AdminButton>


        </div>


      </form>


    </div>

  );

};


export default EditWeeklyTask;