import React, { useEffect, useRef, useState } from "react";
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
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
} from "lucide-react";

/* =========================================================
   POLYTECHNIC FORM
   Same structure/flow as CollegeForm
========================================================= */

const PolytechnicForm = ({
  polytechnic = null,
  onSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(polytechnic);

  const logoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [logoPreview, setLogoPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    state: "",
    country: "Nigeria",
    website: "",
    email: "",
    phone: "",
    logo_url: "",
    image_url: "",
  });

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      state: "",
      country: "Nigeria",
      website: "",
      email: "",
      phone: "",
      logo_url: "",
      image_url: "",
    });

    setLogoPreview("");
    setImagePreview("");
  };

  /* =========================================================
     LOAD POLYTECHNIC
  ========================================================= */

  useEffect(() => {
    if (!polytechnic) {
      resetForm();
      return;
    }

    const logo =
      polytechnic.logo_url ||
      polytechnic.logo ||
      "";

    const image =
      polytechnic.image_url ||
      polytechnic.cover_url ||
      polytechnic.image ||
      "";

    setForm({
      name: polytechnic.name || "",
      description: polytechnic.description || "",
      state: polytechnic.state || "",
      country: polytechnic.country || "Nigeria",
      website: polytechnic.website || "",
      email: polytechnic.email || "",
      phone: polytechnic.phone || "",
      logo_url: logo,
      image_url: image,
    });

    setLogoPreview(logo);
    setImagePreview(image);
  }, [polytechnic]);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     VALIDATE IMAGE
  ========================================================= */

  const validateImage = (file) => {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please upload a PNG, JPG, JPEG or WEBP image."
      );

      return false;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Maximum image size is 5MB.");

      return false;
    }

    return true;
  };

  /* =========================================================
     CREATE SAFE FILE NAME
  ========================================================= */

  const createFileName = (file) => {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    return `${Date.now()}-${safeName}.${extension}`;
  };

  /* =========================================================
     UPLOAD IMAGE
  ========================================================= */

  const uploadImage = async (file, type) => {
    if (!file) {
      return null;
    }

    if (!validateImage(file)) {
      return null;
    }

    const isLogo = type === "logo";

    try {
      if (isLogo) {
        setUploadingLogo(true);
      } else {
        setUploadingImage(true);
      }

      /*
       * Storage bucket
       *
       * Change ONLY the bucket name below if your existing
       * CollegeForm uses a different bucket.
       */
      const bucket = "school-images";

      const fileName = createFileName(file);

      const folder = isLogo
        ? "polytechnics/logos"
        : "polytechnics/images";

      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        console.error(
          "Polytechnic Image Upload Error:",
          uploadError
        );

        throw uploadError;
      }

      const { data: publicData } =
        supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

      const publicUrl =
        publicData?.publicUrl || "";

      if (!publicUrl) {
        throw new Error(
          "Unable to generate public image URL."
        );
      }

      if (isLogo) {
        setForm((previous) => ({
          ...previous,
          logo_url: publicUrl,
        }));

        setLogoPreview(publicUrl);
      } else {
        setForm((previous) => ({
          ...previous,
          image_url: publicUrl,
        }));

        setImagePreview(publicUrl);
      }

      return publicUrl;
    } catch (error) {
      console.error(
        `Upload ${type} Error:`,
        error
      );

      alert(
        error?.message ||
          `Unable to upload ${type}.`
      );

      return null;
    } finally {
      if (isLogo) {
        setUploadingLogo(false);
      } else {
        setUploadingImage(false);
      }
    }
  };

  /* =========================================================
     LOGO SELECT
  ========================================================= */

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadImage(file, "logo");

    event.target.value = "";
  };

  /* =========================================================
     IMAGE SELECT
  ========================================================= */

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadImage(file, "image");

    event.target.value = "";
  };

  /* =========================================================
     REMOVE LOGO
  ========================================================= */

  const removeLogo = () => {
    setLogoPreview("");

    setForm((previous) => ({
      ...previous,
      logo_url: "",
    }));
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = () => {
    setImagePreview("");

    setForm((previous) => ({
      ...previous,
      image_url: "",
    }));
  };

  /* =========================================================
     WEBSITE URL
  ========================================================= */

  const normalizeWebsite = (value) => {
    if (!value) {
      return "";
    }

    const trimmed = value.trim();

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  /* =========================================================
     SAVE POLYTECHNIC
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Polytechnic name is required.");
      return;
    }

    if (uploadingLogo || uploadingImage) {
      alert(
        "Please wait for the image uploads to finish."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),

        description:
          form.description.trim() || null,

        state:
          form.state.trim() || null,

        country:
          form.country.trim() || "Nigeria",

        website:
          form.website.trim()
            ? normalizeWebsite(form.website)
            : null,

        email:
          form.email.trim() || null,

        phone:
          form.phone.trim() || null,

        logo_url:
          form.logo_url.trim() || null,

        image_url:
          form.image_url.trim() || null,
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
        "Polytechnic Save Error:",
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
     TEXT INPUT
  ========================================================= */

  const Input = ({
    label,
    name,
    placeholder,
    type = "text",
    icon: Icon,
    required = false,
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
          {Icon && (
            <Icon
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
          )}

          <input
            type={type}
            name={name}
            value={form[name] || ""}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            className={`w-full rounded-2xl border border-white/10 bg-white/[0.035] py-3.5 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/15 focus:border-cyan-400/40 focus:bg-white/[0.055] ${
              Icon ? "pl-11" : "pl-4"
            }`}
          />
        </div>
      </div>
    );
  };

  /* =========================================================
     TEXTAREA
  ========================================================= */

  const TextArea = ({
    label,
    name,
    placeholder,
    rows = 6,
  }) => {
    return (
      <div>
        <label className="mb-2 block text-sm font-bold text-slate-300">
          {label}
        </label>

        <textarea
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          rows={rows}
          placeholder={placeholder}
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 hover:border-white/15 focus:border-cyan-400/40 focus:bg-white/[0.055]"
        />
      </div>
    );
  };

  /* =========================================================
     UPLOAD CARD
  ========================================================= */

  const UploadCard = ({
    type,
    title,
    description,
    preview,
    uploading,
    inputRef,
    onChange,
    onRemove,
  }) => {
    const isLogo = type === "logo";

    return (
      <div>
        <label className="mb-2 block text-sm font-bold text-slate-300">
          {title}
        </label>

        <div
          className={`relative overflow-hidden rounded-3xl border border-dashed transition ${
            preview
              ? "border-cyan-400/20 bg-cyan-400/[0.025]"
              : "border-white/10 bg-white/[0.025] hover:border-cyan-400/20 hover:bg-white/[0.035]"
          }`}
        >
          {preview ? (
            <div className="relative">
              <div
                className={`relative overflow-hidden ${
                  isLogo
                    ? "flex h-64 items-center justify-center bg-white/[0.03] p-8"
                    : "h-64"
                }`}
              >
                <img
                  src={preview}
                  alt={title}
                  className={
                    isLogo
                      ? "h-full w-full object-contain"
                      : "h-full w-full object-cover"
                  }
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 backdrop-blur-xl">
                    <CheckCircle2
                      size={15}
                      className="text-emerald-400"
                    />
                  </div>

                  <span className="text-xs font-bold text-white">
                    Image uploaded
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onRemove}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 bg-slate-950/70 text-red-400 backdrop-blur-xl transition hover:bg-red-500/10 hover:text-red-300"
                  title="Remove image"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/5 p-4">
                <div>
                  <p className="text-sm font-bold text-white">
                    {isLogo
                      ? "College logo"
                      : "College image"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    You can upload a different image.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    inputRef.current?.click()
                  }
                  disabled={uploading}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <Upload size={14} />
                  Change
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              disabled={uploading}
              className="flex min-h-[260px] w-full flex-col items-center justify-center px-6 py-10 text-center transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="relative">
                <div className="absolute -inset-5 rounded-full bg-cyan-400/10 blur-2xl" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.08]">
                  {uploading ? (
                    <Loader2
                      size={25}
                      className="animate-spin text-cyan-400"
                    />
                  ) : isLogo ? (
                    <Building2
                      size={25}
                      className="text-cyan-400"
                    />
                  ) : (
                    <ImageIcon
                      size={25}
                      className="text-cyan-400"
                    />
                  )}
                </div>
              </div>

              <p className="mt-6 text-sm font-black text-white">
                {uploading
                  ? "Uploading..."
                  : `Upload ${isLogo ? "Polytechnic Logo" : "Polytechnic Image"}`}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {description}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                PNG, JPG, JPEG or WEBP
              </div>

              <p className="mt-2 text-[10px] font-medium text-slate-600">
                Maximum size: 5MB
              </p>
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={onChange}
            className="hidden"
          />
        </div>
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[-10%] h-96 w-96 rounded-full bg-cyan-500/[0.06] blur-[140px]" />

        <div className="absolute right-[5%] top-[35%] h-80 w-80 rounded-full bg-blue-500/[0.04] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#020617]/80 px-4 py-5 backdrop-blur-2xl sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.08]">
              <Building2
                size={23}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                {isEditing
                  ? "Edit Polytechnic"
                  : "Add Polytechnic"}
              </h1>

              <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                {isEditing
                  ? "Update the polytechnic information."
                  : "Add a polytechnic to the school directory."}
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="relative z-10 mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-6 lg:px-10 lg:py-10"
      >
        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 py-6 sm:px-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/70">
                Step 01
              </p>

              <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                Basic Information
              </h2>

              <p className="mt-1.5 text-sm text-slate-500">
                Main information displayed on the
                polytechnic profile.
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <Input
              label="Polytechnic Name"
              name="name"
              placeholder="e.g. Yaba College of Technology"
              icon={Building2}
              required
            />

            <TextArea
              label="Description"
              name="description"
              placeholder="Describe the polytechnic, its academic focus and educational opportunities..."
              rows={6}
            />
          </div>
        </section>

        {/* ===================================================
            LOCATION
        =================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 py-6 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-400/[0.08]">
                <MapPin
                  size={20}
                  className="text-blue-400"
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-400/70">
                  Step 02
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
                  Location
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Where the polytechnic is located.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:p-8 md:grid-cols-2">
            <Input
              label="State"
              name="state"
              placeholder="e.g. Osun State"
              icon={MapPin}
            />

            <Input
              label="Country"
              name="country"
              placeholder="Nigeria"
              icon={Globe}
            />
          </div>
        </section>

        {/* ===================================================
            CONTACT & WEBSITE
        =================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 py-6 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-400/[0.08]">
                <Globe
                  size={20}
                  className="text-violet-400"
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-400/70">
                  Step 03
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
                  Contact & Website
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Public contact information for the
                  polytechnic.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:p-8 md:grid-cols-2">
            <Input
              label="Website"
              name="website"
              placeholder="https://example.edu.ng"
              icon={Globe}
            />

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
          </div>
        </section>

        {/* ===================================================
            POLYTECHNIC LOGO
        =================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 py-6 sm:px-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/70">
                Step 04
              </p>

              <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                Polytechnic Logo
              </h2>

              <p className="mt-1.5 text-sm text-slate-500">
                Upload the official logo of the
                polytechnic.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <UploadCard
              type="logo"
              title="Upload Polytechnic Logo"
              description="Choose the official logo of the polytechnic."
              preview={logoPreview}
              uploading={uploadingLogo}
              inputRef={logoInputRef}
              onChange={handleLogoChange}
              onRemove={removeLogo}
            />
          </div>
        </section>

        {/* ===================================================
            POLYTECHNIC IMAGE
        =================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/50 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 py-6 sm:px-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/70">
                Step 05
              </p>

              <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                Polytechnic Image
              </h2>

              <p className="mt-1.5 text-sm text-slate-500">
                Upload a high-quality image for the
                polytechnic profile.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <UploadCard
              type="image"
              title="Upload Polytechnic Image"
              description="Choose a high-quality image representing the polytechnic."
              preview={imagePreview}
              uploading={uploadingImage}
              inputRef={imageInputRef}
              onChange={handleImageChange}
              onRemove={removeImage}
            />
          </div>
        </section>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="sticky bottom-4 z-30 flex flex-col-reverse gap-3 rounded-3xl border border-white/10 bg-slate-950/85 p-3 shadow-2xl backdrop-blur-2xl sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-3.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={
              saving ||
              uploadingLogo ||
              uploadingImage
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-7 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
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