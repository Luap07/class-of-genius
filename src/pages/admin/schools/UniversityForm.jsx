// src/admin/pages/schools/universities/UniversityForm.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  X,
  GraduationCap,
  MapPin,
  Globe,
  Mail,
  Phone,
  Building2,
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";

const UniversityForm = ({
  university = null,
  onSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(university?.id);

  /* =========================================================
     FORM
  ========================================================= */

  const [form, setForm] = useState({
    name: "",
    short_name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    website: "",
    email: "",
    phone: "",
    accreditation: "",
  });

  /* =========================================================
     IMAGES
  ========================================================= */

  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  /* =========================================================
     UI
  ========================================================= */

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     LOAD UNIVERSITY
  ========================================================= */

  useEffect(() => {
    if (university) {
      setForm({
        name: university.name || "",
        short_name: university.short_name || "",
        description: university.description || "",
        address: university.address || "",
        city: university.city || "",
        state: university.state || "",
        country: university.country || "Nigeria",
        website: university.website || "",
        email: university.email || "",
        phone: university.phone || "",
        accreditation: university.accreditation || "",
      });

      setLogoPreview(
        university.logo_url ||
          university.image_url ||
          ""
      );

      setCoverPreview(
        university.cover_url || ""
      );
    } else {
      setForm({
        name: "",
        short_name: "",
        description: "",
        address: "",
        city: "",
        state: "",
        country: "Nigeria",
        website: "",
        email: "",
        phone: "",
        accreditation: "",
      });

      setLogoPreview("");
      setCoverPreview("");
    }

    setLogoFile(null);
    setCoverFile(null);
    setError("");
    setSuccess("");
  }, [university]);

  /* =========================================================
     INPUT
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================================
     LOGO FILE
  ========================================================= */

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image for the logo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Logo image must be smaller than 5MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  };

  /* =========================================================
     COVER FILE
  ========================================================= */

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image for the cover.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Cover image must be smaller than 8MB.");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError("");
  };

  /* =========================================================
     REMOVE LOGO PREVIEW
  ========================================================= */

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  /* =========================================================
     REMOVE COVER PREVIEW
  ========================================================= */

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview("");
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (!form.name.trim()) {
      return "University name is required.";
    }

    if (!form.country.trim()) {
      return "Country is required.";
    }

    return "";
  };

  /* =========================================================
     FILE NAME
  ========================================================= */

  const createFileName = (file, prefix) => {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const random =
      Math.random()
        .toString(36)
        .substring(2, 10);

    return `${prefix}-${Date.now()}-${random}.${extension}`;
  };

  /* =========================================================
     UPLOAD IMAGE
  ========================================================= */

  const uploadImage = async (
    file,
    bucket,
    folder
  ) => {
    if (!file) {
      return null;
    }

    const fileName = createFileName(
      file,
      folder
    );

    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  };

  /* =========================================================
     DELETE STORAGE FILE FROM URL
  ========================================================= */

  const deleteStorageFile = async (
    url,
    bucket
  ) => {
    if (!url) return;

    try {
      const marker = `/storage/v1/object/public/${bucket}/`;

      const index = url.indexOf(marker);

      if (index === -1) {
        return;
      }

      const filePath = decodeURIComponent(
        url.substring(index + marker.length)
      );

      if (!filePath) {
        return;
      }

      await supabase.storage
        .from(bucket)
        .remove([filePath]);
    } catch (storageError) {
      console.warn(
        "Unable to remove old image:",
        storageError
      );
    }
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      let logoUrl =
        university?.logo_url ||
        university?.image_url ||
        null;

      let coverUrl =
        university?.cover_url || null;

      /* =====================================================
         UPLOAD NEW LOGO
      ===================================================== */

      if (logoFile) {
        const uploadedLogo =
          await uploadImage(
            logoFile,
            "university-logos",
            university?.id || "new"
          );

        if (uploadedLogo) {
          if (
            university?.logo_url
          ) {
            await deleteStorageFile(
              university.logo_url,
              "university-logos"
            );
          }

          logoUrl = uploadedLogo;
        }
      }

      /* =====================================================
         UPLOAD NEW COVER
      ===================================================== */

      if (coverFile) {
        const uploadedCover =
          await uploadImage(
            coverFile,
            "university-covers",
            university?.id || "new"
          );

        if (uploadedCover) {
          if (
            university?.cover_url
          ) {
            await deleteStorageFile(
              university.cover_url,
              "university-covers"
            );
          }

          coverUrl = uploadedCover;
        }
      }

      /* =====================================================
         PAYLOAD

         ONLY UNIVERSITY FIELDS
      ===================================================== */

      const payload = {
        name: form.name.trim(),

        short_name:
          form.short_name.trim() || null,

        description:
          form.description.trim() || null,

        address:
          form.address.trim() || null,

        city:
          form.city.trim() || null,

        state:
          form.state.trim() || null,

        country:
          form.country.trim() || null,

        website:
          form.website.trim() || null,

        email:
          form.email.trim() || null,

        phone:
          form.phone.trim() || null,

        accreditation:
          form.accreditation.trim() || null,

        logo_url: logoUrl,

        cover_url: coverUrl,
      };

      /* =====================================================
         UPDATE
      ===================================================== */

      if (isEditing) {
        const {
          data,
          error: updateError,
        } = await supabase
          .from("universities")
          .update(payload)
          .eq("id", university.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setSuccess(
          "University updated successfully."
        );

        if (onSuccess) {
          setTimeout(() => {
            onSuccess(data);
          }, 500);
        }

        return;
      }

      /* =====================================================
         CREATE
      ===================================================== */

      const {
        data,
        error: insertError,
      } = await supabase
        .from("universities")
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setSuccess(
        "University created successfully."
      );

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(data);
        }, 500);
      }
    } catch (err) {
      console.error(
        "Save University Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to save university."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    if (saving) return;

    if (onCancel) {
      onCancel();
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="w-full"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-white/10 px-6 py-7 sm:px-8">
        <div className="flex items-start gap-4 pr-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
            <GraduationCap
              size={25}
              className="text-cyan-400"
            />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
              University Management
            </p>

            <h2 className="mt-1 text-2xl font-black text-white">
              {isEditing
                ? "Edit University"
                : "Add University"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {isEditing
                ? "Update the information and images for this university."
                : "Add a university to your school directory."}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="px-6 py-7 sm:px-8"
      >
        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4"
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>
              <p className="text-sm font-bold text-red-400">
                Unable to save university
              </p>

              <p className="mt-1 text-sm leading-6 text-red-400/80">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        {/* ===================================================
            SUCCESS
        =================================================== */}

        {success && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4"
          >
            <CheckCircle2
              size={19}
              className="text-emerald-400"
            />

            <p className="text-sm font-bold text-emerald-400">
              {success}
            </p>
          </motion.div>
        )}

        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <Building2
              size={19}
              className="text-cyan-400"
            />

            <div>
              <h3 className="text-lg font-black text-white">
                University Information
              </h3>

              <p className="text-xs text-slate-600">
                Basic information about the institution.
              </p>
            </div>
          </div>

          {/* NAME + SHORT NAME */}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="university-name"
                className="mb-2 block text-sm font-bold text-white"
              >
                University Name
                <span className="ml-1 text-red-400">
                  *
                </span>
              </label>

              <input
                id="university-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. University of Lagos"
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="university-short-name"
                className="mb-2 block text-sm font-bold text-white"
              >
                Short Name
              </label>

              <input
                id="university-short-name"
                name="short_name"
                type="text"
                value={form.short_name}
                onChange={handleChange}
                placeholder="e.g. UNILAG"
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
              />
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="mt-5">
            <label
              htmlFor="university-description"
              className="mb-2 block text-sm font-bold text-white"
            >
              Description
            </label>

            <textarea
              id="university-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the university..."
              disabled={saving}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
            />
          </div>
        </div>

        {/* ===================================================
            IMAGES
        =================================================== */}

        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <ImageIcon
              size={19}
              className="text-cyan-400"
            />

            <div>
              <h3 className="text-lg font-black text-white">
                University Images
              </h3>

              <p className="text-xs text-slate-600">
                Upload the university logo and cover image.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* =================================================
                LOGO
            ================================================= */}

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">
                    University Logo
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    PNG, JPG or WEBP • Max 5MB
                  </p>
                </div>
              </div>

              <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/10 bg-slate-950">
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt="University logo preview"
                      className="h-full w-full object-contain p-6"
                    />

                    <button
                      type="button"
                      onClick={removeLogo}
                      disabled={saving}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/90 text-white transition hover:bg-red-400 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
                      <Upload
                        size={23}
                        className="text-cyan-400"
                      />
                    </div>

                    <span className="text-sm font-bold text-white">
                      Upload Logo
                    </span>

                    <span className="mt-1 text-xs text-slate-600">
                      Click to select image
                    </span>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoChange}
                      disabled={saving}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {logoPreview && (
                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white">
                  <Upload size={15} />
                  Replace Logo

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoChange}
                    disabled={saving}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* =================================================
                COVER
            ================================================= */}

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <div className="mb-4">
                <p className="text-sm font-black text-white">
                  Cover Image
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  PNG, JPG or WEBP • Max 8MB
                </p>
              </div>

              <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/10 bg-slate-950">
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="University cover preview"
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeCover}
                      disabled={saving}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/90 text-white transition hover:bg-red-400 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
                      <ImageIcon
                        size={23}
                        className="text-cyan-400"
                      />
                    </div>

                    <span className="text-sm font-bold text-white">
                      Upload Cover
                    </span>

                    <span className="mt-1 text-xs text-slate-600">
                      Click to select image
                    </span>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleCoverChange}
                      disabled={saving}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {coverPreview && (
                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white">
                  <Upload size={15} />
                  Replace Cover

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleCoverChange}
                    disabled={saving}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================
            LOCATION
        =================================================== */}

        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <MapPin
              size={19}
              className="text-cyan-400"
            />

            <div>
              <h3 className="text-lg font-black text-white">
                Location
              </h3>

              <p className="text-xs text-slate-600">
                Where the university is located.
              </p>
            </div>
          </div>

          {/* ADDRESS */}

          <div className="mb-5">
            <label
              htmlFor="university-address"
              className="mb-2 block text-sm font-bold text-white"
            >
              Address
            </label>

            <input
              id="university-address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. Akoka, Yaba, Lagos"
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
            />
          </div>

          {/* CITY STATE COUNTRY */}

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="university-city"
                className="mb-2 block text-sm font-bold text-white"
              >
                City
              </label>

              <input
                id="university-city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Lagos"
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="university-state"
                className="mb-2 block text-sm font-bold text-white"
              >
                State
              </label>

              <input
                id="university-state"
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                placeholder="Lagos State"
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="university-country"
                className="mb-2 block text-sm font-bold text-white"
              >
                Country
                <span className="ml-1 text-red-400">
                  *
                </span>
              </label>

              <input
                id="university-country"
                name="country"
                type="text"
                value={form.country}
                onChange={handleChange}
                placeholder="Nigeria"
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* ===================================================
            CONTACT
        =================================================== */}

        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <Globe
              size={19}
              className="text-cyan-400"
            />

            <div>
              <h3 className="text-lg font-black text-white">
                Contact & Online Information
              </h3>

              <p className="text-xs text-slate-600">
                Public contact information for the university.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* WEBSITE */}

            <div>
              <label
                htmlFor="university-website"
                className="mb-2 flex items-center gap-2 text-sm font-bold text-white"
              >
                <Globe size={16} className="text-slate-500" />
                Website
              </label>

              <input
                id="university-website"
                name="website"
                type="text"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.edu.ng"
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="university-email"
                className="mb-2 flex items-center gap-2 text-sm font-bold text-white"
              >
                <Mail size={16} className="text-slate-500" />
                Email
              </label>

              <input
                id="university-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="info@example.edu.ng"
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
              />
            </div>

            {/* PHONE */}

            <div>
              <label
                htmlFor="university-phone"
                className="mb-2 flex items-center gap-2 text-sm font-bold text-white"
              >
                <Phone size={16} className="text-slate-500" />
                Phone
              </label>

              <input
                id="university-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+234..."
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
              />
            </div>

            {/* ACCREDITATION */}

            <div>
              <label
                htmlFor="university-accreditation"
                className="mb-2 block text-sm font-bold text-white"
              >
                Accreditation
              </label>

              <input
                id="university-accreditation"
                name="accreditation"
                type="text"
                value={form.accreditation}
                onChange={handleChange}
                placeholder="e.g. NUC Accredited"
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <div className="mb-8 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">
          <div className="flex items-start gap-3">
            <GraduationCap
              size={20}
              className="mt-0.5 shrink-0 text-cyan-400"
            />

            <div>
              <p className="text-sm font-black text-white">
                University Directory
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                This form only manages the university
                itself. Faculties and programs are not
                required here.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-400">
                  University
                </span>

                <span className="rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-slate-400">
                  {isEditing
                    ? "Editing"
                    : "New Upload"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            BUTTONS
        =================================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={17} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                {isEditing
                  ? "Updating..."
                  : "Uploading..."}
              </>
            ) : (
              <>
                <Save size={17} />

                {isEditing
                  ? "Update University"
                  : "Upload University"}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default UniversityForm;