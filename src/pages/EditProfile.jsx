import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  Save,
  Check,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

const EditProfile = () => {
  const navigate = useNavigate();
  const { profile, user } = useContext(AuthContext);

  /* =========================================================
     PROFILE IMAGE
  ========================================================= */

  const existingProfilePicture =
    profile?.profile_picture ||
    profile?.profile_picture_url ||
    profile?.avatar_url ||
    profile?.photo_url ||
    user?.user_metadata?.profile_picture ||
    user?.user_metadata?.profile_picture_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  /* =========================================================
     FORM STATE
  ========================================================= */

  const [form, setForm] = useState({
    username:
      profile?.username ||
      user?.user_metadata?.username ||
      user?.email?.split("@")[0] ||
      "",

    full_name:
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      "",

    email:
      profile?.email ||
      user?.email ||
      "",

    phone:
      profile?.phone ||
      profile?.phone_number ||
      user?.user_metadata?.phone ||
      user?.user_metadata?.phone_number ||
      "",

    date_of_birth:
      profile?.date_of_birth ||
      profile?.dob ||
      user?.user_metadata?.date_of_birth ||
      user?.user_metadata?.dob ||
      "",

    gender:
      profile?.gender ||
      user?.user_metadata?.gender ||
      "",

    location:
      profile?.location ||
      profile?.address ||
      user?.user_metadata?.location ||
      user?.user_metadata?.address ||
      "",

    profile_picture: existingProfilePicture,
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const [imagePreview, setImagePreview] = useState(
    existingProfilePicture || null
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     CLEANUP IMAGE PREVIEW
  ========================================================= */

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* =========================================================
     UPDATE FORM
  ========================================================= */

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =========================================================
     INITIALS
  ========================================================= */

  const initials = useMemo(() => {
    const name =
      form.full_name ||
      form.username ||
      "Student";

    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${
        parts[parts.length - 1][0]
      }`.toUpperCase();
    }

    return name.charAt(0).toUpperCase();
  }, [form.full_name, form.username]);

  /* =========================================================
     IMAGE SELECT
  ========================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile image must be smaller than 5MB."
      );
      return;
    }

    setError("");

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  /* =========================================================
     UPLOAD PROFILE IMAGE
  ========================================================= */

  const uploadProfileImage = async () => {
    if (!selectedImage || !user?.id) {
      return form.profile_picture || null;
    }

    const fileExtension =
      selectedImage.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const filePath =
      `${user.id}/profile.${fileExtension}`;

    /* -------------------------------------------------------
       UPLOAD TO profile_pictures BUCKET
    ------------------------------------------------------- */

    const { error: uploadError } =
      await supabase.storage
        .from("profile_pictures")
        .upload(
          filePath,
          selectedImage,
          {
            upsert: true,
            contentType: selectedImage.type,
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    /* -------------------------------------------------------
       GET PUBLIC URL
    ------------------------------------------------------- */

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("profile_pictures")
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error(
        "Unable to generate profile image URL."
      );
    }

    return `${publicUrl}?t=${Date.now()}`;
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSave = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      setError(
        "You must be logged in to update your profile."
      );
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      /* -------------------------------------------------------
         UPLOAD IMAGE IF CHANGED
      ------------------------------------------------------- */

      let profilePicture =
        form.profile_picture || null;

      if (selectedImage) {
        profilePicture =
          await uploadProfileImage();
      }

      /* -------------------------------------------------------
         PROFILE DATA
      ------------------------------------------------------- */

      const profileData = {
        username: form.username.trim(),
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        date_of_birth:
          form.date_of_birth || null,
        gender:
          form.gender || null,
        location:
          form.location.trim(),
        profile_picture:
          profilePicture,
      };

      /* -------------------------------------------------------
         UPDATE PROFILES TABLE
      ------------------------------------------------------- */

      const { error: profileError } =
        await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      /* -------------------------------------------------------
         UPDATE AUTH USER METADATA
      ------------------------------------------------------- */

      const { error: authError } =
        await supabase.auth.updateUser({
          email: form.email.trim(),

          data: {
            username:
              form.username.trim(),

            full_name:
              form.full_name.trim(),

            phone:
              form.phone.trim(),

            date_of_birth:
              form.date_of_birth || null,

            gender:
              form.gender || null,

            location:
              form.location.trim(),

            profile_picture:
              profilePicture,

            profile_picture_url:
              profilePicture,

            avatar_url:
              profilePicture,
          },
        });

      if (authError) {
        console.warn(
          "Auth metadata update warning:",
          authError.message
        );
      }

      /* -------------------------------------------------------
         UPDATE LOCAL FORM
      ------------------------------------------------------- */

      setForm((previous) => ({
        ...previous,
        profile_picture:
          profilePicture || "",
      }));

      setSelectedImage(null);
      setSaved(true);

      /* -------------------------------------------------------
         REDIRECT
      ------------------------------------------------------- */

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (saveError) {
      console.error(
        "Profile update error:",
        saveError
      );

      setError(
        saveError?.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     INPUT COMPONENT
  ========================================================= */

  const InputField = ({
    icon: Icon,
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
  }) => {
    return (
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </label>

        <div className="relative">
          <Icon
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            type={type}
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            placeholder={placeholder}
            className="
              w-full
              rounded-xl
              border
              border-white/10
              bg-black/20
              py-3.5
              pl-11
              pr-4
              text-sm
              font-medium
              text-white
              outline-none
              transition
              placeholder:text-slate-700
              focus:border-cyan-400/50
              focus:bg-black/30
            "
          />
        </div>
      </div>
    );
  };

  /* =========================================================
     SELECT COMPONENT
  ========================================================= */

  const SelectField = ({
    icon: Icon,
    label,
    value,
    onChange,
    children,
  }) => {
    return (
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </label>

        <div className="relative">
          <Icon
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <select
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            className="
              w-full
              appearance-none
              rounded-xl
              border
              border-white/10
              bg-black/20
              py-3.5
              pl-11
              pr-4
              text-sm
              font-medium
              text-white
              outline-none
              transition
              focus:border-cyan-400/50
              focus:bg-black/30
            "
          >
            {children}
          </select>
        </div>
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <div className="mb-8 flex items-center justify-between">

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-300
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <ArrowLeft size={17} />
            Back to Profile
          </button>

          <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 sm:flex">
            <Sparkles size={14} />
            Scholiqen
          </div>

        </div>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="
            relative
            mb-7
            overflow-hidden
            rounded-[2rem]
            border
            border-white/10
            bg-gradient-to-br
            from-slate-900
            via-slate-900
            to-cyan-950/30
            p-7
            shadow-2xl
            sm:p-9
          "
        >

          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/10">
              <User
                size={22}
                className="text-cyan-400"
              />
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Edit Profile
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Keep your personal information up to date.
            </p>

          </div>
        </motion.div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mb-6
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/5
              p-4
              text-sm
              font-medium
              text-red-400
            "
          >
            {error}
          </motion.div>
        )}

        {/* =====================================================
            FORM
        ===================================================== */}

        <form onSubmit={handleSave}>

          {/* ===================================================
              PROFILE PHOTO
          =================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.05,
            }}
            className="
              mb-6
              rounded-[2rem]
              border
              border-white/5
              bg-white/[0.02]
              p-6
              sm:p-7
            "
          >

            <div className="mb-6">

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
                Profile
              </p>

              <h2 className="mt-1 text-xl font-black">
                Profile Picture
              </h2>

            </div>

            <div className="flex flex-col items-center gap-5 sm:flex-row">

              {/* Avatar */}

              <div className="relative">

                <div className="
                  flex
                  h-28
                  w-28
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[2rem]
                  border-2
                  border-cyan-400/20
                  bg-gradient-to-br
                  from-cyan-500/20
                  to-blue-600/20
                  text-4xl
                  font-black
                  text-cyan-300
                ">

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}

                </div>

                <label
                  htmlFor="profile-image"
                  className="
                    absolute
                    bottom-0
                    right-0
                    flex
                    h-10
                    w-10
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-xl
                    border-4
                    border-slate-900
                    bg-cyan-500
                    text-slate-950
                    shadow-lg
                    transition
                    hover:bg-cyan-400
                  "
                >
                  <Camera size={17} />

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

              </div>

              <div>

                <h3 className="font-bold text-white">
                  Change your photo
                </h3>

                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Choose a clear profile image. JPG,
                  PNG and other standard image formats
                  are supported.
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  Maximum size: 5MB
                </p>

              </div>

            </div>
          </motion.div>

          {/* ===================================================
              PERSONAL INFORMATION
          =================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.1,
            }}
            className="
              mb-6
              rounded-[2rem]
              border
              border-white/5
              bg-white/[0.02]
              p-6
              sm:p-7
            "
          >

            <div className="mb-6">

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
                Personal Information
              </p>

              <h2 className="mt-1 text-xl font-black">
                Your Details
              </h2>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <InputField
                icon={User}
                label="Username"
                value={form.username}
                onChange={(value) =>
                  updateField(
                    "username",
                    value
                  )
                }
                placeholder="Your username"
              />

              <InputField
                icon={User}
                label="Full Name"
                value={form.full_name}
                onChange={(value) =>
                  updateField(
                    "full_name",
                    value
                  )
                }
                placeholder="Your full name"
              />

              <InputField
                icon={Mail}
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(value) =>
                  updateField(
                    "email",
                    value
                  )
                }
                placeholder="you@example.com"
              />

              <InputField
                icon={Phone}
                label="Phone Number"
                value={form.phone}
                onChange={(value) =>
                  updateField(
                    "phone",
                    value
                  )
                }
                placeholder="Phone number"
              />

              <InputField
                icon={Calendar}
                label="Date of Birth"
                type="date"
                value={form.date_of_birth}
                onChange={(value) =>
                  updateField(
                    "date_of_birth",
                    value
                  )
                }
              />

              <SelectField
                icon={User}
                label="Gender"
                value={form.gender}
                onChange={(value) =>
                  updateField(
                    "gender",
                    value
                  )
                }
              >

                <option
                  value=""
                  className="bg-slate-900"
                >
                  Select gender
                </option>

                <option
                  value="Male"
                  className="bg-slate-900"
                >
                  Male
                </option>

                <option
                  value="Female"
                  className="bg-slate-900"
                >
                  Female
                </option>

                <option
                  value="Other"
                  className="bg-slate-900"
                >
                  Other
                </option>

                <option
                  value="Prefer not to say"
                  className="bg-slate-900"
                >
                  Prefer not to say
                </option>

              </SelectField>

              <div className="md:col-span-2">

                <InputField
                  icon={MapPin}
                  label="Location"
                  value={form.location}
                  onChange={(value) =>
                    updateField(
                      "location",
                      value
                    )
                  }
                  placeholder="City, State, Country"
                />

              </div>

            </div>
          </motion.div>

          {/* ===================================================
              SECURITY NOTICE
          =================================================== */}

          <div className="
            mb-6
            flex
            items-start
            gap-4
            rounded-2xl
            border
            border-cyan-400/10
            bg-cyan-400/5
            p-5
          ">

            <div className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-cyan-400/10
              text-cyan-400
            ">
              <ShieldCheck size={18} />
            </div>

            <div>

              <p className="text-sm font-bold text-white">
                Your information is secure
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your profile information is associated
                with your authenticated Scholiqen account.
              </p>

            </div>

          </div>

          {/* ===================================================
              SAVE
          =================================================== */}

          <div className="
            mb-10
            flex
            flex-col-reverse
            gap-3
            sm:flex-row
            sm:justify-end
          ">

            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
              disabled={saving}
              className="
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-6
                py-3
                text-sm
                font-bold
                text-slate-300
                transition
                hover:bg-white/10
                hover:text-white
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-cyan-500
                px-7
                py-3
                text-sm
                font-black
                text-slate-950
                shadow-lg
                shadow-cyan-500/10
                transition
                hover:bg-cyan-400
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check size={17} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="border-t border-white/5 py-8 text-center">

          <div className="flex items-center justify-center gap-2 text-slate-600">

            <Sparkles size={14} />

            <span className="text-xs font-semibold uppercase tracking-[0.15em]">
              Scholiqen
            </span>

          </div>

          <p className="mt-2 text-xs text-slate-700">
            Your learning. Your journey. Your progress.
          </p>

        </div>

      </div>
    </section>
  );
};

export default EditProfile;