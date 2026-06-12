import React, { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) return;

    setLoading(true);
    setSuccess("");

    try {
      // 🔌 Replace this with Supabase / Firebase / API later
      await new Promise((res) => setTimeout(res, 1200));

      setSuccess("Message sent successfully 🚀");

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 px-6 text-white bg-[#070b14]">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#070b14] to-black" />
      <div className="absolute top-0 left-1/3 w-[300px] h-[300px] bg-blue-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-indigo-500/10 blur-[120px]" />

      <div className="relative max-w-5xl mx-auto">
        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Get in <span className="text-blue-400">Touch</span>
        </h2>

        <p className="text-center text-gray-400 mb-10">
          We’d love to hear from you. Send us a message anytime.
        </p>

        {/* FORM CARD */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 outline-none"
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 outline-none"
            />

            {/* MESSAGE */}
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Message..."
              rows="5"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 outline-none"
            />

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 transition py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            {/* SUCCESS */}
            {success && (
              <p className="text-green-400 text-center text-sm mt-2">
                {success}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;