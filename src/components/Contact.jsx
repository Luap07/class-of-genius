import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { MessageCircle, Send } from "lucide-react";

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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!form.name || !form.email || !form.message) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // 1. SAVE TO SUPABASE
      const { error } = await supabase
        .from("contact_messages")
        .insert([
          {
            name: form.name,
            email: form.email,
            message: form.message,
          },
        ]);

      if (error) throw error;

      // 2. SEND ALERT TO YOUR GMAIL (via backend)
      await fetch("http://localhost:5000/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setSuccess("Message sent successfully 🚀");

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-16 flex items-center justify-center bg-[#070b14] text-white p-6">

      <div className="w-full max-w-2xl bg-slate-900 p-8 rounded-2xl border border-slate-700">

        <h2 className="text-3xl font-bold mb-2 text-center">
          Contact Us 💬
        </h2>

        <p className="text-gray-400 text-center mb-6">
          Send us a message or reach us on WhatsApp
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message..."
            rows={5}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          {/* BUTTONS */}
          <div className="flex flex-col gap-3">

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg"
            >
              <Send size={18} />
              {loading ? "Sending..." : "Send Message"}
            </button>

            {/* WHATSAPP BUTTON */}
            <a
              href="https://wa.me/2348153274924"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 py-3 rounded-lg"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>

          </div>

          {/* STATUS */}
          {success && (
            <p className="text-green-400 text-center mt-2">
              {success}
            </p>
          )}

          {error && (
            <p className="text-red-400 text-center mt-2">
              {error}
            </p>
          )}
        </form>

      </div>
    </div>
  );
};

export default Contact;