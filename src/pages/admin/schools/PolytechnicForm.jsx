import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Building2,
  Save,
  X,
  Loader2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Link as LinkIcon,
  FileText,
} from "lucide-react";

/* =========================================================
   POLYTECHNIC FORM
========================================================= */

const PolytechnicForm = ({
  polytechnic = null,
  onSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(polytechnic);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    short_name: "",
    description: "",
    location: "",
    state: "",
    country: "Nigeria",
    website: "",
    email: "",
    phone: "",
    address: "",
    established_year: "",
    ownership: "",
    accreditation: "",
    logo_url: "",
    cover_url: "",
    active: true,
  });

  /* =========================================================
     LOAD POLYTECHNIC
  ========================================================= */

  useEffect(() => {
    if (!polytechnic) {
      setForm({
        name: "",
        short_name: "",
        description: "",
        location: "",
        state: "",
        country: "Nigeria",
        website: "",
        email: "",
        phone: "",
        address: "",
        established_year: "",
        ownership: "",
        accreditation: "",
        logo_url: "",
        cover_url: "",
        active: true,
      });

      return;
    }

    setForm({
      name: polytechnic.name || "",
      short_name: polytechnic.short_name || "",
      description: polytechnic.description || "",
      location: polytechnic.location || "",
      state: polytechnic.state || "",
      country: polytechnic.country || "Nigeria",
      website: polytechnic.website || "",
      email: polytechnic.email || "",
      phone: polytechnic.phone || "",
      address: polytechnic.address || "",
      established_year:
        polytechnic.established_year || "",
      ownership: polytechnic.ownership || "",
      accreditation:
        polytechnic.accreditation || "",
      logo_url: polytechnic.logo_url || "",
      cover_url: polytechnic.cover_url || "",
      active:
        polytechnic.active !== false,
    });
  }, [polytechnic]);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Polytechnic name is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        short_name: form.short_name.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        website: form.website.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        established_year:
          form.established_year
            ? Number(form.established_year)
            : null,
        ownership: form.ownership.trim(),
        accreditation:
          form.accreditation.trim(),
        logo_url: form.logo_url.trim(),
        cover_url: form.cover_url.trim(),
        active: form.active,
      };

      let result;

      if (isEditing) {
        result = await supabase
          .from("polytechnics")
          .update(payload)
          .eq("id", polytechnic.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("polytechnics")
          .insert([payload])
          .select()
          .single();
      }

      if (result.error) {
        console.error(
          "Save Polytechnic Error:",
          result.error
        );

        throw result.error;
      }

      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (error) {
      console.error(
        "Polytechnic save failed:",
        error
      );

      alert(
        error?.message ||
          "Unable to save polytechnic."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     INPUT COMPONENT
  ========================================================= */

  const Input = ({
    label,
    name,
    placeholder,
    type = "text",
    icon: Icon,
  }) => {
    return (
      <div>
        <label className="mb-2 block text-sm font-bold text-slate-300">
          {label}
        </label>

        <div className="relative">
          {Icon && (
            <Icon
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
          )}

          <input
            type={type}
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-white/[0.07] ${
              Icon
                ? "pl-11"
                : "pl-4"
            }`}
          />
        </div>
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-white/10 bg-slate-900/80 px-6 py-6 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Building2
                size={28}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h1 className="text-2xl font-black">
                {isEditing
                  ? "Edit Polytechnic"
                  : "Add Polytechnic"}
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                {isEditing
                  ? "Update the polytechnic information."
                  : "Add a new polytechnic to Scholiqen."}
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={19} />
            </button>
          )}

        </div>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-6xl space-y-8 px-6 py-8"
      >

        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl">

          <div className="mb-6">
            <h2 className="text-xl font-black">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Main information displayed on the polytechnic profile.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              label="Polytechnic Name"
              name="name"
              placeholder="e.g. Yaba College of Technology"
              icon={Building2}
            />

            <Input
              label="Short Name"
              name="short_name"
              placeholder="e.g. YABATECH"
            />

          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Write a detailed description of the polytechnic..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
            />
          </div>

        </section>

        {/* ===================================================
            LOCATION
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl">

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
                Where the polytechnic is located.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              label="Location / City"
              name="location"
              placeholder="e.g. Lagos"
              icon={MapPin}
            />

            <Input
              label="State"
              name="state"
              placeholder="e.g. Lagos State"
            />

            <Input
              label="Country"
              name="country"
              placeholder="e.g. Nigeria"
            />

            <Input
              label="Address"
              name="address"
              placeholder="Full campus address"
            />

          </div>

        </section>

        {/* ===================================================
            CONTACT INFORMATION
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl">

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <Phone
                size={20}
                className="text-violet-400"
              />
            </div>

            <div>
              <h2 className="text-xl font-black">
                Contact Information
              </h2>

              <p className="text-sm text-slate-500">
                Public contact details for the polytechnic.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="info@example.edu.ng"
              icon={Mail}
            />

            <Input
              label="Phone"
              name="phone"
              placeholder="+234..."
              icon={Phone}
            />

            <Input
              label="Website"
              name="website"
              placeholder="https://example.edu.ng"
              icon={Globe}
            />

          </div>

        </section>

        {/* ===================================================
            INSTITUTION DETAILS
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl">

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <FileText
                size={20}
                className="text-emerald-400"
              />
            </div>

            <div>
              <h2 className="text-xl font-black">
                Institution Details
              </h2>

              <p className="text-sm text-slate-500">
                Additional information about the institution.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              label="Established Year"
              name="established_year"
              type="number"
              placeholder="e.g. 1947"
            />

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Ownership
              </label>

              <select
                name="ownership"
                value={form.ownership}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
              >
                <option value="">
                  Select ownership
                </option>

                <option value="Federal">
                  Federal
                </option>

                <option value="State">
                  State
                </option>

                <option value="Private">
                  Private
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Accreditation
            </label>

            <textarea
              name="accreditation"
              value={form.accreditation}
              onChange={handleChange}
              rows={4}
              placeholder="Enter accreditation information..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
            />
          </div>

        </section>

        {/* ===================================================
            MEDIA
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl">

          <div className="mb-6">
            <h2 className="text-xl font-black">
              Media
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add the logo and cover image URLs.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Input
              label="Logo URL"
              name="logo_url"
              placeholder="https://..."
              icon={LinkIcon}
            />

            <Input
              label="Cover Image URL"
              name="cover_url"
              placeholder="https://..."
              icon={LinkIcon}
            />

          </div>

        </section>

        {/* ===================================================
            STATUS
        =================================================== */}

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl">

          <label className="flex cursor-pointer items-center gap-4">

            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-5 w-5 accent-cyan-400"
            />

            <div>
              <p className="font-bold text-white">
                Active Polytechnic
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Make this polytechnic visible on the public platform.
              </p>
            </div>

          </label>

        </section>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing
                  ? "Update Polytechnic"
                  : "Save Polytechnic"}
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
};

export default PolytechnicForm;