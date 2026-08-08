import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Building2,
  Save,
  X,
  Loader2,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  location: "",
  state: "",
  country: "Nigeria",
  website: "",
  email: "",
  phone: "",
  image_url: "",
};

const CollegeForm = ({
  college = null,
  onSuccess,
  onCancel,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (college) {
      setForm({
        name: college.name || "",
        description: college.description || "",
        location: college.location || "",
        state: college.state || "",
        country: college.country || "Nigeria",
        website: college.website || "",
        email: college.email || "",
        phone: college.phone || "",
        image_url: college.image_url || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [college]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("College name is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        website: form.website.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        image_url: form.image_url.trim(),
      };

      let result;

      if (college?.id) {
        result = await supabase
          .from("colleges")
          .update(payload)
          .eq("id", college.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("colleges")
          .insert([payload])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (err) {
      console.error("Save College Error:", err);

      setError(
        err?.message ||
          "Unable to save college. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 text-white sm:p-8">
      {/* HEADER */}
      <div className="mb-8 flex items-start gap-4 border-b border-white/10 pb-7">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
          <Building2
            size={28}
            className="text-cyan-400"
          />
        </div>

        <div>
          <h1 className="text-2xl font-black sm:text-3xl">
            {college
              ? "Edit College"
              : "Add College"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {college
              ? "Update the institutional information for this college."
              : "Add a college to the Scholiqen school directory."}
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* BASIC INFORMATION */}
        <div className="mb-8">
          <div className="mb-5 flex items-center gap-2">
            <FileText
              size={18}
              className="text-cyan-400"
            />

            <h2 className="font-black">
              Basic Information
            </h2>
          </div>

          <div className="grid gap-5">
            <Field
              label="College Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Federal College of Education"
              required
            />

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the college, its academic focus and opportunities..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
              />
            </div>
          </div>
        </div>

        {/* LOCATION */}
        <div className="mb-8">
          <div className="mb-5 flex items-center gap-2">
            <MapPin
              size={18}
              className="text-cyan-400"
            />

            <h2 className="font-black">
              Location
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Location / City"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Lagos"
            />

            <Field
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="e.g. Lagos State"
            />

            <Field
              label="Country"
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="e.g. Nigeria"
            />
          </div>
        </div>

        {/* CONTACT */}
        <div className="mb-8">
          <div className="mb-5 flex items-center gap-2">
            <Globe
              size={18}
              className="text-cyan-400"
            />

            <h2 className="font-black">
              Contact & Website
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.edu.ng"
              icon={<Globe size={16} />}
            />

            <Field
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="info@example.edu.ng"
              icon={<Mail size={16} />}
            />

            <Field
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+234..."
              icon={<Phone size={16} />}
            />

            <Field
              label="Image URL"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://..."
              icon={<Globe size={16} />}
            />
          </div>
        </div>

        {/* IMAGE PREVIEW */}
        {form.image_url && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
            <div className="border-b border-white/10 px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Image Preview
              </p>
            </div>

            <img
              src={form.image_url}
              alt="College preview"
              className="h-56 w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={17} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
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
                {college
                  ? "Update College"
                  : "Save College"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* =========================================================
   FIELD
========================================================= */

const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  icon = null,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-300">
        {label}
        {required && (
          <span className="ml-1 text-cyan-400">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
            {icon}
          </span>
        )}

        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-2xl border border-white/10 bg-slate-900 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 ${
            icon
              ? "pl-11 pr-4"
              : "px-4"
          }`}
        />
      </div>
    </div>
  );
};

export default CollegeForm;
