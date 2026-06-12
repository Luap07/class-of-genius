import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      setError("Please fill in all fields.");
      return;
    }

    if (loading) return; // prevent spam clicks
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("contact_messages")
        .insert([
          {
            name,
            email,
            message,
          },
        ]);

      if (insertError) throw insertError;

      setSuccess("✅ Message sent successfully!");

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact error:", err);
      setError(err.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 px-6 text-white min-h-screen bg-[#070b14]">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#070b14] to-black" />
      <div className="absolute top-0 left-1/3 w-[300px] h-[300px] bg-blue-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-indigo-500/10 blur-[120px]" />

      <div className="relative max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Get in <span className="text-blue-400">Touch</span>
        </h2>

        <p className="text-center text-gray-400 mb-10">
          We'd love to hear from you. Send us a message anytime.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 outline-none"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 outline-none"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Message..."
              rows={5}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 transition py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            {success && (
              <p className="text-green-400 text-center font-medium">
                {success}
              </p>
            )}

            {error && (
              <p className="text-red-400 text-center font-medium">
                {error}
              </p>
            )}

          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;