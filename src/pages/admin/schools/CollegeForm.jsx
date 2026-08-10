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
} from "lucide-react";

/* =========================================================
   SUPABASE STORAGE
========================================================= */

const COLLEGE_LOGO_BUCKET = "college-logos";
const COLLEGE_IMAGE_BUCKET = "college-images";

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  name: "",
  description: "",
  state: "",
  country: "Nigeria",
  website: "",
  email: "",
  phone: "",
  logo_url: "",
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

  const logoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");

  const [logoPreview, setLogoPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  /* =========================================================
     LOAD COLLEGE
  ========================================================= */

  useEffect(() => {
    if (!college) {
      setForm(emptyForm);
      setLogoPreview("");
      setImagePreview("");
      setError("");
      return;
    }

    const logoUrl =
      college.logo_url ||
      college.logo ||
      "";

    const imageUrl =
      college.image_url ||
      college.image ||
      "";

    setForm({
      name: college.name || "",
      description: college.description || "",
      state: college.state || "",
      country: college.country || "Nigeria",
      website: college.website || "",
      email: college.email || "",
      phone: college.phone || "",
      logo_url: logoUrl,
      image_url: imageUrl,
    });

    setLogoPreview(logoUrl);
    setImagePreview(imageUrl);
    setError("");
  }, [college]);

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     GET STORAGE PATH
  ========================================================= */

  const getStoragePath = (
    url,
    bucket
  ) => {
    if (!url) {
      return null;
    }

    const marker =
      `/storage/v1/object/public/${bucket}/`;

    const index =
      url.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(
      url.substring(
        index + marker.length
      )
    );
  };

  /* =========================================================
     DELETE STORAGE FILE
  ========================================================= */

  const deleteStorageFile = async (
    url,
    bucket
  ) => {
    if (!url) {
      return;
    }

    try {
      const filePath =
        getStoragePath(
          url,
          bucket
        );

      if (!filePath) {
        return;
      }

      const {
        error: removeError,
      } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (removeError) {
        console.warn(
          "Storage delete warning:",
          removeError
        );
      }
    } catch (storageError) {
      console.warn(
        "Storage delete error:",
        storageError
      );
    }
  };

  /* =========================================================
     GENERATE FILE PATH
  ========================================================= */

  const createFilePath = (
    file,
    folder
  ) => {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const randomPart =
      Math.random()
        .toString(36)
        .substring(2, 12);

    return `${folder}/${Date.now()}-${randomPart}.${extension}`;
  };

  /* =========================================================
     UPLOAD LOGO
  ========================================================= */

  const handleLogoUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select a valid logo image."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Logo must be smaller than 5MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploadingLogo(true);

      const filePath =
        createFilePath(
          file,
          "colleges"
        );

      const {
        error: uploadError,
      } = await supabase.storage
        .from(
          COLLEGE_LOGO_BUCKET
        )
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType:
              file.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicData,
      } = supabase.storage
        .from(
          COLLEGE_LOGO_BUCKET
        )
        .getPublicUrl(filePath);

      const publicUrl =
        publicData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Unable to generate the logo URL."
        );
      }

      const previousLogo =
        form.logo_url;

      setForm((previous) => ({
        ...previous,
        logo_url: publicUrl,
      }));

      setLogoPreview(publicUrl);

      if (
        previousLogo &&
        previousLogo !== publicUrl
      ) {
        await deleteStorageFile(
          previousLogo,
          COLLEGE_LOGO_BUCKET
        );
      }
    } catch (uploadError) {
      console.error(
        "College Logo Upload Error:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Unable to upload college logo."
      );
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  };

  /* =========================================================
     UPLOAD COLLEGE IMAGE
  ========================================================= */

  const handleImageUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select a valid college image."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "College image must be smaller than 5MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      const filePath =
        createFilePath(
          file,
          "colleges"
        );

      const {
        error: uploadError,
      } = await supabase.storage
        .from(
          COLLEGE_IMAGE_BUCKET
        )
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType:
              file.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicData,
      } = supabase.storage
        .from(
          COLLEGE_IMAGE_BUCKET
        )
        .getPublicUrl(filePath);

      const publicUrl =
        publicData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Unable to generate the college image URL."
        );
      }

      const previousImage =
        form.image_url;

      setForm((previous) => ({
        ...previous,
        image_url: publicUrl,
      }));

      setImagePreview(publicUrl);

      if (
        previousImage &&
        previousImage !== publicUrl
      ) {
        await deleteStorageFile(
          previousImage,
          COLLEGE_IMAGE_BUCKET
        );
      }
    } catch (uploadError) {
      console.error(
        "College Image Upload Error:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Unable to upload college image."
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  /* =========================================================
     REMOVE LOGO
  ========================================================= */

  const handleRemoveLogo = async () => {
    if (!form.logo_url) {
      return;
    }

    try {
      setUploadingLogo(true);
      setError("");

      await deleteStorageFile(
        form.logo_url,
        COLLEGE_LOGO_BUCKET
      );

      setForm((previous) => ({
        ...previous,
        logo_url: "",
      }));

      setLogoPreview("");
    } catch (removeError) {
      console.error(
        "Remove College Logo Error:",
        removeError
      );

      setError(
        removeError?.message ||
          "Unable to remove college logo."
      );
    } finally {
      setUploadingLogo(false);
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

      await deleteStorageFile(
        form.image_url,
        COLLEGE_IMAGE_BUCKET
      );

      setForm((previous) => ({
        ...previous,
        image_url: "",
      }));

      setImagePreview("");
    } catch (removeError) {
      console.error(
        "Remove College Image Error:",
        removeError
      );

      setError(
        removeError?.message ||
          "Unable to remove college image."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  /* =========================================================
     SAVE / UPDATE COLLEGE
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const collegeName =
      String(
        form.name || ""
      ).trim();

    if (!collegeName) {
      setError(
        "College name is required."
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * IMPORTANT:
       * This payload contains ONLY the fields
       * used by this form.
       *
       * There is NO `location` field here.
       */

      const payload = {
        name: collegeName,

        description:
          String(
            form.description || ""
          ).trim() || null,

        state:
          String(
            form.state || ""
          ).trim() || null,

        country:
          String(
            form.country || ""
          ).trim() || "Nigeria",

        website:
          String(
            form.website || ""
          ).trim() || null,

        email:
          String(
            form.email || ""
          ).trim() || null,

        phone:
          String(
            form.phone || ""
          ).trim() || null,

        logo_url:
          form.logo_url || null,

        image_url:
          form.image_url || null,
      };

      console.log(
        "College payload:",
        payload
      );

      let result;

      /* =====================================================
         UPDATE
      ===================================================== */

      if (college?.id) {
        result = await supabase
          .from("colleges")
          .update(payload)
          .eq(
            "id",
            college.id
          )
          .select()
          .single();
      }

      /* =====================================================
         CREATE
      ===================================================== */

      else {
        result = await supabase
          .from("colleges")
          .insert([
            payload,
          ])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      if (!result.data) {
        throw new Error(
          "The college was saved but no data was returned."
        );
      }

      console.log(
        college?.id
          ? "College updated:"
          : "College created:",
        result.data
      );

      if (onSuccess) {
        onSuccess(
          result.data
        );
      }

      /*
       * If this is a new college, return
       * to the college list after saving.
       */

      if (!college?.id) {
        navigate(
          "/admin/schools/colleges"
        );
      }
    } catch (saveError) {
      console.error(
        "Save College Error:",
        saveError
      );

      setError(
        saveError?.message ||
          "Unable to save college. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    navigate(
      "/admin/schools/colleges"
    );
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
              ? "Update College"
              : "Add College"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {college
              ? "Update the information, logo and image for this college."
              : "Add a college to the school directory."}
          </p>

        </div>

      </div>

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

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <section>

          <div className="mb-5 flex items-center gap-2">

            <FileText
              size={18}
              className="text-cyan-400"
            />

            <h2 className="font-black">
              Basic Information
            </h2>

          </div>

          <div className="space-y-5">

            <Field
              label="College Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Federal College of Education Iwo"
              required
            />

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-300">
                Description
              </label>

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                rows={6}
                placeholder="Describe the college, its academic focus and educational opportunities..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
              />

            </div>

          </div>

        </section>

        {/* ===================================================
            LOCATION
        =================================================== */}

        <section>

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
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="e.g. Osun State"
            />

            <Field
              label="Country"
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="e.g. Nigeria"
            />

          </div>

        </section>

        {/* ===================================================
            CONTACT
        =================================================== */}

        <section>

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
              icon={
                <Globe size={16} />
              }
            />

            <Field
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="info@example.edu.ng"
              icon={
                <Mail size={16} />
              }
            />

            <Field
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+234..."
              icon={
                <Phone size={16} />
              }
            />

          </div>

        </section>

        {/* ===================================================
            COLLEGE LOGO
        =================================================== */}

        <section>

          <div className="mb-5 flex items-center gap-2">

            <ImageIcon
              size={18}
              className="text-cyan-400"
            />

            <h2 className="font-black">
              College Logo
            </h2>

          </div>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={
              handleLogoUpload
            }
            className="hidden"
          />

          {!logoPreview ? (

            <button
              type="button"
              onClick={() =>
                logoInputRef.current?.click()
              }
              disabled={
                uploadingLogo
              }
              className="flex min-h-52 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-slate-900 px-6 py-10 text-center transition hover:border-cyan-400/40 hover:bg-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {uploadingLogo ? (
                <>
                  <Loader2
                    size={30}
                    className="animate-spin text-cyan-400"
                  />

                  <p className="mt-4 text-sm font-bold text-white">
                    Uploading logo...
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
                    Upload College Logo
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

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">

              <div className="flex flex-col items-center justify-center">

                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-4">

                  <img
                    src={logoPreview}
                    alt="College logo"
                    className="h-full w-full object-contain"
                  />

                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      logoInputRef.current?.click()
                    }
                    disabled={
                      uploadingLogo
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Upload
                        size={15}
                      />
                    )}

                    Change Logo
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleRemoveLogo
                    }
                    disabled={
                      uploadingLogo
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <Trash2
                      size={15}
                    />

                    Remove
                  </button>

                </div>

              </div>

            </div>

          )}

        </section>

        {/* ===================================================
            COLLEGE IMAGE
        =================================================== */}

        <section>

          <div className="mb-5 flex items-center gap-2">

            <ImageIcon
              size={18}
              className="text-cyan-400"
            />

            <h2 className="font-black">
              College Image
            </h2>

          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={
              handleImageUpload
            }
            className="hidden"
          />

          {!imagePreview ? (

            <button
              type="button"
              onClick={() =>
                imageInputRef.current?.click()
              }
              disabled={
                uploadingImage
              }
              className="flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-slate-900 px-6 py-10 text-center transition hover:border-cyan-400/40 hover:bg-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-60"
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

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">

              <div className="relative">

                <img
                  src={imagePreview}
                  alt="College"
                  className="h-72 w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-20">

                  <div className="flex justify-end gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        imageInputRef.current?.click()
                      }
                      disabled={
                        uploadingImage
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-slate-900 disabled:opacity-50"
                    >

                      {uploadingImage ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Upload
                          size={15}
                        />
                      )}

                      Change Image

                    </button>

                    <button
                      type="button"
                      onClick={
                        handleRemoveImage
                      }
                      disabled={
                        uploadingImage
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/20 px-4 py-2.5 text-xs font-bold text-red-300 backdrop-blur-md transition hover:bg-red-500/30 disabled:opacity-50"
                    >

                      <Trash2
                        size={15}
                      />

                      Remove

                    </button>

                  </div>

                </div>

              </div>

            </div>

          )}

        </section>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={
              handleCancel
            }
            disabled={
              saving ||
              uploadingLogo ||
              uploadingImage
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >

            <X size={17} />

            Cancel

          </button>

          <button
            type="submit"
            disabled={
              saving ||
              uploadingLogo ||
              uploadingImage
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                {college
                  ? "Updating..."
                  : "Saving..."}
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
