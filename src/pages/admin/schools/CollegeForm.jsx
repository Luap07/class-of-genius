
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Image as ImageIcon,
  Upload,
  Trash2,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const COLLEGE_LOGO_BUCKET = "college-logos";

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

/* =========================================================
   COLLEGE FORM
========================================================= */

const CollegeForm = ({
  college = null,
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");

  const [imagePreview, setImagePreview] = useState("");

  /*
   * After saving, keep the saved college available so the
   * administrator can continue to faculties/programs.
   */
  const [savedCollege, setSavedCollege] = useState(null);

  const fileInputRef = useRef(null);

  /* =========================================================
     LOAD COLLEGE
  ========================================================= */

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

      setImagePreview(college.image_url || "");
      setSavedCollege(null);
    } else {
      setForm(emptyForm);
      setImagePreview("");
      setSavedCollege(null);
    }
  }, [college]);

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
     UPLOAD COLLEGE IMAGE
  ========================================================= */

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    /*
     * Validate image type
     */

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    /*
     * Validate image size
     */

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      e.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      /*
       * Generate unique file name.
       */

      const fileExt =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const uniqueName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${fileExt}`;

      const filePath = `colleges/${uniqueName}`;

      /*
       * Upload to Supabase Storage.
       */

      const { error: uploadError } = await supabase.storage
        .from(COLLEGE_LOGO_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      /*
       * Get public URL.
       */

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(COLLEGE_LOGO_BUCKET)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Unable to generate image URL."
        );
      }

      /*
       * Delete previous image if one exists.
       */

      if (form.image_url) {
        await deleteStorageImage(form.image_url);
      }

      /*
       * Save URL into form state.
       */

      setForm((previous) => ({
        ...previous,
        image_url: publicUrl,
      }));

      setImagePreview(publicUrl);
    } catch (err) {
      console.error(
        "College Image Upload Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to upload college image."
      );
    } finally {
      setUploadingImage(false);

      /*
       * Allow selecting the same file again.
       */

      e.target.value = "";
    }
  };

  /* =========================================================
     DELETE STORAGE IMAGE
  ========================================================= */

  const deleteStorageImage = async (imageUrl) => {
    if (!imageUrl) {
      return;
    }

    try {
      const marker =
        `/storage/v1/object/public/${COLLEGE_LOGO_BUCKET}/`;

      const markerIndex =
        imageUrl.indexOf(marker);

      if (markerIndex === -1) {
        return;
      }

      const filePath = imageUrl.substring(
        markerIndex + marker.length
      );

      if (!filePath) {
        return;
      }

      const { error: removeError } =
        await supabase.storage
          .from(COLLEGE_LOGO_BUCKET)
          .remove([filePath]);

      if (removeError) {
        console.warn(
          "Could not delete old college image:",
          removeError
        );
      }
    } catch (err) {
      console.warn(
        "Delete Storage Image Error:",
        err
      );
    }
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const handleRemoveImage = async () => {
    if (!form.image_url) {
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      await deleteStorageImage(form.image_url);

      setForm((previous) => ({
        ...previous,
        image_url: "",
      }));

      setImagePreview("");
    } catch (err) {
      console.error(
        "Remove College Image Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to remove image."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  /* =========================================================
     SAVE COLLEGE
  ========================================================= */

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

        description:
          form.description.trim() || null,

        location:
          form.location.trim() || null,

        state:
          form.state.trim() || null,

        country:
          form.country.trim() || "Nigeria",

        website:
          form.website.trim() || null,

        email:
          form.email.trim() || null,

        phone:
          form.phone.trim() || null,

        image_url:
          form.image_url || null,
      };

      let result;

      /* =====================================================
         UPDATE EXISTING COLLEGE
      ===================================================== */

      if (college?.id) {
        result = await supabase
          .from("colleges")
          .update(payload)
          .eq("id", college.id)
          .select()
          .single();
      }

      /* =====================================================
         CREATE NEW COLLEGE
      ===================================================== */

      else {
        result = await supabase
          .from("colleges")
          .insert([payload])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      if (!result.data?.id) {
        throw new Error(
          "College was saved, but no college ID was returned."
        );
      }

      /*
       * Keep the saved college.
       *
       * This is important because the next step
       * needs this exact college ID.
       */

      setSavedCollege(result.data);

      /*
       * Notify parent if supplied.
       */

      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (err) {
      console.error(
        "Save College Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to save college. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     GO TO FACULTIES
  ========================================================= */

  const handleManageFaculties = () => {
    const collegeId =
      savedCollege?.id || college?.id;

    if (!collegeId) {
      setError(
        "College ID is missing. Save the college first."
      );

      return;
    }

    /*
     * This is the next stage of the hierarchy:
     *
     * College
     *   ↓
     * Faculties / Departments
     *   ↓
     * Programs / Courses
     */

    navigate(
      `/admin/schools/colleges/${collegeId}/faculties`
    );
  };

  /* =========================================================
     GO BACK TO COLLEGES
  ========================================================= */

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    navigate("/admin/schools/colleges");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl sm:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
          <Building2
            size={24}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl font-black sm:text-3xl">
            {college
              ? "Edit College"
              : "Add College"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {college
              ? "Update the institutional information for this college."
              : "Add a college to the Scholiqen school directory, then continue to its faculties and programs."}
          </p>
        </div>

      </div>

      {/* =====================================================
          SUCCESS / NEXT STEP
      ===================================================== */}

      {savedCollege && (
        <div className="mb-8 overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/5">

          <div className="p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10">
                <CheckCircle2
                  size={25}
                  className="text-emerald-400"
                />
              </div>

              <div className="min-w-0 flex-1">

                <h2 className="text-lg font-black text-white">
                  College Saved Successfully
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  <span className="font-bold text-white">
                    {savedCollege.name}
                  </span>{" "}
                  has been saved. The next step is to add
                  the faculties/departments and the programs
                  or courses they offer.
                </p>

              </div>

            </div>

            {/* NEXT STEP */}

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-5">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                  <GraduationCap
                    size={22}
                    className="text-cyan-400"
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Next Step
                  </p>

                  <h3 className="mt-1 text-base font-black text-white">
                    Manage Faculties & Courses
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Create the faculties or departments
                    belonging to this college and add the
                    programs/courses they offer.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleManageFaculties}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
              >
                <BookOpen size={18} />
                Manage Faculties & Courses
                <ArrowRight size={18} />
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm leading-6 text-red-400">
          {error}
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form onSubmit={handleSubmit}>

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

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

        {/* =================================================
            LOCATION
        ================================================= */}

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

        {/* =================================================
            CONTACT
        ================================================= */}

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

          </div>
        </div>

        {/* =================================================
            COLLEGE IMAGE
        ================================================= */}

        <div className="mb-8">

          <div className="mb-5 flex items-center gap-2">
            <ImageIcon
              size={18}
              className="text-cyan-400"
            />

            <h2 className="font-black">
              College Image
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />

            {!imagePreview ? (

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploadingImage}
                className="flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-slate-950 px-6 py-10 text-center transition hover:border-cyan-400/40 hover:bg-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {uploadingImage ? (
                  <>
                    <Loader2
                      size={30}
                      className="animate-spin text-cyan-400"
                    />

                    <p className="mt-4 text-sm font-bold text-white">
                      Uploading image...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
                      <Upload
                        size={25}
                        className="text-cyan-400"
                      />
                    </div>

                    <p className="mt-4 text-sm font-black text-white">
                      Upload College Image
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      PNG, JPG, JPEG or WEBP
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Maximum size: 5MB
                    </p>
                  </>
                )}

              </button>

            ) : (

              <div className="overflow-hidden rounded-2xl border border-white/10">

                <div className="relative">

                  <img
                    src={imagePreview}
                    alt="College preview"
                    className="h-64 w-full object-cover"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-14">

                    <div className="flex justify-end gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        disabled={uploadingImage}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-slate-900 disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Upload size={15} />
                        )}

                        Change Image
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/20 px-4 py-2.5 text-xs font-bold text-red-300 backdrop-blur-md transition hover:bg-red-500/30 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>

                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving || uploadingImage}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={17} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || uploadingImage}
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

      {/* =====================================================
          EXISTING COLLEGE — QUICK CONTINUE
      ===================================================== */}

      {!savedCollege && college?.id && (
        <div className="mt-8 border-t border-white/10 pt-7">

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                <BookOpen
                  size={19}
                  className="text-cyan-400"
                />
              </div>

              <div className="flex-1">

                <h3 className="text-sm font-black text-white">
                  Manage Academic Structure
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Continue to this college's faculties,
                  departments and programs/courses.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={handleManageFaculties}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-400 transition hover:bg-cyan-400/20"
            >
              <GraduationCap size={17} />
              Manage Faculties & Courses
              <ArrowRight size={17} />
            </button>

          </div>

        </div>
      )}

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
