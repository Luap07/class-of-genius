import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import {
  ArrowLeft,
  Save,
  GraduationCap,
  Globe,
  MapPin,
  Mail,
  Phone,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

const UniversityForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    short_name: "",
    description: "",
    logo_url: "",
    cover_url: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    established_year: "",
    ownership: "Public",
    accreditation: "",
    status: "active",
  });

  /* =========================================================
     FETCH UNIVERSITY
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    const fetchUniversity = async () => {
      try {
        setFetching(true);
        setError("");

        const { data, error } = await supabase
          .from("universities")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setForm({
          name: data.name || "",
          short_name: data.short_name || "",
          description: data.description || "",
          logo_url: data.logo_url || "",
          cover_url: data.cover_url || "",
          website: data.website || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "Nigeria",
          established_year: data.established_year || "",
          ownership: data.ownership || "Public",
          accreditation: data.accreditation || "",
          status: data.status || "active",
        });
      } catch (err) {
        console.error("Fetch University Error:", err);
        setError(
          err.message || "Unable to load university information."
        );
      } finally {
        setFetching(false);
      }
    };

    fetchUniversity();
  }, [id]);

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     SAVE UNIVERSITY
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("University name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        short_name: form.short_name.trim() || null,
        description: form.description.trim() || null,
        logo_url: form.logo_url.trim() || null,
        cover_url: form.cover_url.trim() || null,
        website: form.website.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || "Nigeria",
        established_year:
          form.established_year === ""
            ? null
            : Number(form.established_year),
        ownership: form.ownership,
        accreditation: form.accreditation.trim() || null,
        status: form.status,
      };

      let result;

      if (isEditing) {
        result = await supabase
          .from("universities")
          .update(payload)
          .eq("id", id);
      } else {
        result = await supabase
          .from("universities")
          .insert([payload]);
      }

      if (result.error) {
        throw result.error;
      }

      navigate("/admin/schools/universities");
    } catch (err) {
      console.error("Save University Error:", err);

      setError(
        err.message || "Unable to save university."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (fetching) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2
            size={24}
            className="animate-spin text-cyan-400"
          />
          Loading university...
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      {/* HEADER */}

      <div className="mx-auto mb-8 max-w-6xl">

        <button
          type="button"
          onClick={() =>
            navigate("/admin/schools/universities")
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Universities
        </button>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <GraduationCap
                size={28}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h1 className="text-3xl font-black">
                {isEditing
                  ? "Edit University"
                  : "Add University"}
              </h1>

              <p className="mt-1 text-slate-400">
                {isEditing
                  ? "Update university information."
                  : "Add a university to the Scholiqen school directory."}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-6xl"
      >

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-7 lg:grid-cols-3">

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="space-y-7 lg:col-span-2">

            <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-7">

              <div className="mb-6">
                <h2 className="text-xl font-black">
                  Basic Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Main information about the university.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <Field
                  label="University Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="University of Lagos"
                  required
                />

                <Field
                  label="Short Name"
                  name="short_name"
                  value={form.short_name}
                  onChange={handleChange}
                  placeholder="UNILAG"
                />

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe the university..."
                    className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
                  />
                </div>

              </div>
            </section>

            {/* =================================================
                LOCATION
            ================================================= */}

            <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-7">

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <MapPin
                    size={20}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Location
                  </h2>

                  <p className="text-sm text-slate-500">
                    Where the university is located.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div className="sm:col-span-2">
                  <Field
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="University Road, Akoka"
                  />
                </div>

                <Field
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Lagos"
                />

                <Field
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Lagos State"
                />

                <Field
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Nigeria"
                />

              </div>
            </section>

            {/* =================================================
                CONTACT
            ================================================= */}

            <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-7">

              <div className="mb-6">
                <h2 className="text-xl font-black">
                  Contact & Website
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Public contact information.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="info@university.edu.ng"
                  icon={Mail}
                />

                <Field
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+234..."
                  icon={Phone}
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://www.university.edu.ng"
                    icon={LinkIcon}
                  />
                </div>

              </div>
            </section>

            {/* =================================================
                BRANDING
            ================================================= */}

            <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-7">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <ImageIcon
                    size={20}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Branding
                  </h2>

                  <p className="text-sm text-slate-500">
                    University logo and cover image.
                  </p>
                </div>

              </div>

              <div className="grid gap-5">

                <Field
                  label="Logo URL"
                  name="logo_url"
                  value={form.logo_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />

                <Field
                  label="Cover Image URL"
                  name="cover_url"
                  value={form.cover_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />

              </div>
            </section>

          </div>

          {/* =================================================
              SETTINGS SIDEBAR
          ================================================= */}

          <div>

            <div className="sticky top-6 space-y-7">

              <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-7">

                <h2 className="text-xl font-black">
                  University Settings
                </h2>

                <div className="mt-6 space-y-5">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Ownership
                    </label>

                    <select
                      name="ownership"
                      value={form.ownership}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    >
                      <option value="Public">
                        Public
                      </option>

                      <option value="Private">
                        Private
                      </option>

                      <option value="Federal">
                        Federal
                      </option>

                      <option value="State">
                        State
                      </option>
                    </select>
                  </div>

                  <Field
                    label="Established Year"
                    name="established_year"
                    type="number"
                    value={form.established_year}
                    onChange={handleChange}
                    placeholder="1962"
                  />

                  <Field
                    label="Accreditation"
                    name="accreditation"
                    value={form.accreditation}
                    onChange={handleChange}
                    placeholder="NUC Accredited"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    >
                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>
                    </select>
                  </div>

                </div>
              </section>

              {/* SAVE */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-900/20 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={19} />
                    {isEditing
                      ? "Update University"
                      : "Create University"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/schools/universities")
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

/* =========================================================
   FIELD COMPONENT
========================================================= */

const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-cyan-400">
            *
          </span>
        )}
      </label>

      <div className="relative">

        {Icon && (
          <Icon
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 ${
            Icon ? "pl-11" : ""
          }`}
        />

      </div>
    </div>
  );
};

export default UniversityForm;
