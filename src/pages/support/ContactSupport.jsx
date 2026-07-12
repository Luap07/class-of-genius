import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Clock,
  HelpCircle,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";

const supportCards = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Reach our support team anytime via email.",
    value: "support@scholiqen.com",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our support specialists.",
    value: "+234 XXX XXX XXXX",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Available Monday - Friday",
    value: "9:00 AM - 6:00 PM",
  },
];

const categories = [
  "General Question",
  "Technical Issue",
  "Account",
  "Course",
  "Instructor",
  "Billing",
  "Bug Report",
  "Feature Request",
  "Other",
];

const ContactSupport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    category: "",
    subject: "",
    message: "",
    priority: "Medium",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      console.log(formData);
      setLoading(false);
      setSubmitted(true);
    }, 1800);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg rounded-[32px] border border-slate-800 bg-slate-900 p-10 text-center"
        >
          <Send size={65} className="mx-auto text-blue-500" />
          <h1 className="mt-6 text-4xl font-black">Ticket Submitted</h1>
          <p className="mt-4 leading-7 text-slate-400">
            Your support request has been received successfully. Our support team will get back to you as soon as possible.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex items-center gap-4">
            <img src={Cog} alt="Scholiqen" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-black">Scholiqen</h1>
              <p className="text-xs text-slate-400">Support Center</p>
            </div>
          </div>
          <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-400">
            24/7 Support
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-10 lg:grid-cols-3"
        >
          <aside className="space-y-6 lg:col-span-1">
            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-8">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-blue-500/10 p-4">
                  <HelpCircle className="text-blue-500" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Need Help?</h2>
                  <p className="mt-1 text-sm text-slate-400">We're always here for you.</p>
                </div>
              </div>
              <p className="mt-8 leading-7 text-slate-400">
                Whether you're experiencing technical issues, have billing questions, need course assistance, or want to contact our instructor team, Scholiqen Support is ready to help.
              </p>
            </div>

            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-8">
              <h3 className="text-xl font-bold">Contact Methods</h3>
              <div className="mt-6 space-y-5">
                {supportCards.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-blue-500/10 p-3">
                          <Icon size={22} className="text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-bold">{item.title}</h4>
                          <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                          <p className="mt-3 text-sm font-semibold text-blue-400">{item.value}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-8">
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-blue-500" />
                <h3 className="text-xl font-bold">Response Time</h3>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                {[
                  { label: "General Support", time: "24 Hours" },
                  { label: "Technical Issues", time: "12 Hours" },
                  { label: "Billing", time: "24 Hours" },
                  { label: "Priority Tickets", time: "2 Hours", highlight: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={`font-semibold ${item.highlight ? "text-blue-400" : ""}`}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-8">
              <div className="flex items-center gap-3">
                <MapPin size={22} className="text-blue-500" />
                <h3 className="text-xl font-bold">Office</h3>
              </div>
              <p className="mt-5 leading-7 text-slate-400">
                Scholiqen Headquarters<br /> Lagos, Nigeria
              </p>
            </div>
          </aside>

          <section className="lg:col-span-2">
            <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-8 lg:p-10">
              <h2 className="text-3xl font-black">Contact Support</h2>
              <p className="mt-3 leading-7 text-slate-400">
                Fill in the form below and our support team will respond as quickly as possible.
              </p>
              <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" />
                  <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Support Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} required className="field">
                    <option value="">Choose a category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="field">
                    <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                  </select>
                </div>
                <Input label="Subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="Briefly describe your issue" />
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Message</label>
                  <textarea rows={8} required name="message" value={formData.message} onChange={handleChange} placeholder="Tell us everything about your issue..." className="field resize-none" />
                </div>
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-300">Attachment (Optional)</label>
                  <label htmlFor="attachment" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 py-10 text-center transition hover:border-blue-500 hover:bg-slate-900">
                    <Send size={34} className="text-blue-500" />
                    <h3 className="mt-4 text-lg font-bold">Upload Screenshot or Document</h3>
                    <p className="mt-2 text-sm text-slate-400">PNG, JPG, PDF, DOCX (Max 10MB)</p>
                    <input id="attachment" type="file" className="hidden" />
                  </label>
                </div>
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-lg font-bold transition hover:bg-blue-700 disabled:opacity-60">
                  <Send size={22} /> {loading ? "Submitting Ticket..." : "Submit Support Ticket"}
                </button>
              </form>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

const Input = ({ label, placeholder, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
    <input {...props} required placeholder={placeholder} className="w-full rounded-xl border-2 border-slate-600 bg-slate-950 px-5 py-4 text-white outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20" />
  </div>
);

export default ContactSupport;