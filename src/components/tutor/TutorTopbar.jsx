import React, { useEffect, useMemo, useState } from "react";
import { Menu, UserRound } from "lucide-react";

const TutorTopbar = ({
  onMenuClick,
  tutor,
  title = "Tutor Dashboard",
}) => {
  const [profileImage, setProfileImage] = useState("");

  const API_URL = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");

  const API_BASE_URL = `${API_URL}/api/academy`;

  /* -------------------------------------------------------
     GET TUTOR REFERENCE
  ------------------------------------------------------- */
  const getTutorReference = () => {
    try {
      const directReference =
        localStorage.getItem("tutorReference") ||
        localStorage.getItem("tutor_reference");

      if (directReference) {
        return directReference;
      }

      const possibleKeys = [
        "tutor",
        "academyTutor",
        "scholiqen_user",
      ];

      for (const key of possibleKeys) {
        const raw = localStorage.getItem(key);

        if (!raw) continue;

        try {
          const parsed = JSON.parse(raw);

          const reference =
            parsed?.tutorReference ||
            parsed?.reference ||
            parsed?.tutor_reference ||
            parsed?.applicationReference ||
            parsed?.application_reference;

          if (reference) {
            return reference;
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    return "";
  };

  /* -------------------------------------------------------
     GET NAME
  ------------------------------------------------------- */
  const getTutorName = () => {
    if (!tutor) {
      return "Tutor";
    }

    const directName =
      tutor.name ||
      tutor.fullName ||
      tutor.full_name ||
      tutor.tutorName;

    if (directName) {
      return String(directName).trim();
    }

    const name = [
      tutor.firstName || tutor.first_name,
      tutor.middleName || tutor.middle_name,
      tutor.lastName || tutor.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || "Tutor";
  };

  /* -------------------------------------------------------
     INITIALS
  ------------------------------------------------------- */
  const getInitials = () => {
    const name = getTutorName();

    const parts = name
      .split(" ")
      .filter(Boolean);

    if (!parts.length) {
      return "TU";
    }

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  /* -------------------------------------------------------
     IMAGE URL
  ------------------------------------------------------- */
  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    const value = String(image).trim();

    if (!value) {
      return "";
    }

    // Already an absolute URL
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("blob:") ||
      value.startsWith("data:")
    ) {
      return value;
    }

    // Relative uploaded image
    if (value.startsWith("/")) {
      return `${API_URL}${value}`;
    }

    return `${API_URL}/${value}`;
  };

  /* -------------------------------------------------------
     GET IMAGE FROM TUTOR OBJECT
  ------------------------------------------------------- */
  const tutorImageFromObject = useMemo(() => {
    if (!tutor) {
      return "";
    }

    return (
      tutor.profileImage ||
      tutor.profile_image ||
      tutor.profileImageUrl ||
      tutor.profile_image_url ||
      tutor.imageUrl ||
      tutor.image_url ||
      tutor.avatar ||
      tutor.photo ||
      tutor.profile?.profileImage ||
      tutor.profile?.profileImageUrl ||
      tutor.profile?.profile_image_url ||
      tutor.data?.profileImage ||
      tutor.data?.profileImageUrl ||
      tutor.data?.profile_image_url ||
      ""
    );
  }, [tutor]);

  /* -------------------------------------------------------
     USE IMAGE ALREADY PASSED FROM PARENT
  ------------------------------------------------------- */
  useEffect(() => {
    const image = getImageUrl(tutorImageFromObject);

    if (image) {
      setProfileImage(image);
    }
  }, [tutorImageFromObject]);

  /* -------------------------------------------------------
     FETCH PROFILE IMAGE DIRECTLY FROM TUTOR PROFILE
     This makes the topbar stay connected even if the parent
     only passes basic tutor information.
  ------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const loadTutorProfileImage = async () => {
      const tutorReference = getTutorReference();

      if (!tutorReference) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/tutor/profile`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "x-tutor-reference": tutorReference,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        const profile =
          data?.profile ||
          data?.tutor ||
          data?.data ||
          data;

        const image =
          profile?.profileImage ||
          profile?.profile_image ||
          profile?.profileImageUrl ||
          profile?.profile_image_url ||
          profile?.imageUrl ||
          profile?.image_url ||
          "";

        if (image) {
          setProfileImage(getImageUrl(image));
        }
      } catch (error) {
        console.error(
          "Failed to load tutor profile image:",
          error
        );
      }
    };

    /*
      Only fetch when the image wasn't already supplied.
    */
    if (!tutorImageFromObject) {
      loadTutorProfileImage();
    }

    return () => {
      cancelled = true;
    };
  }, [tutorImageFromObject]);

  /* -------------------------------------------------------
     UPDATE IMAGE IF PARENT TUTOR CHANGES
  ------------------------------------------------------- */
  useEffect(() => {
    if (tutorImageFromObject) {
      setProfileImage(
        getImageUrl(tutorImageFromObject)
      );
    }
  }, [tutorImageFromObject]);

  /* -------------------------------------------------------
     IMAGE ERROR FALLBACK
  ------------------------------------------------------- */
  const handleImageError = () => {
    setProfileImage("");
  };

  const tutorName = getTutorName();
  const initials = getInitials();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/85 backdrop-blur-2xl">
      <div className="flex h-[76px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =================================================
            LEFT
        ================================================== */}
        <div className="flex min-w-0 items-center gap-3">

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Menu size={19} />
          </button>

          {/* Title */}
          <div className="min-w-0">
            <p className="hidden text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/60 sm:block">
              Scholiqen Academy
            </p>

            <h2 className="truncate text-lg font-black text-white sm:text-xl">
              {title}
            </h2>
          </div>
        </div>

        {/* =================================================
            RIGHT
        ================================================== */}
        <div className="flex items-center">

          {/* Divider */}
          <div className="mr-3 hidden h-9 w-px bg-white/10 sm:block" />

          {/* Tutor Profile */}
          <div className="flex items-center gap-3">

            {/* Name */}
            <div className="hidden text-right sm:block">
              <p className="max-w-[180px] truncate text-sm font-black text-white">
                {tutorName}
              </p>

              <div className="mt-0.5 flex items-center justify-end gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-400/70">
                  Tutor
                </p>
              </div>
            </div>

            {/* Profile Image */}
            <div className="relative">

              {/* Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-400/20 via-transparent to-violet-500/20 blur-sm" />

              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 to-violet-500/15 shadow-lg shadow-cyan-950/20 sm:h-12 sm:w-12">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${tutorName} profile`}
                    className="h-full w-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <>
                    <span className="text-xs font-black text-cyan-200 sm:text-sm">
                      {initials}
                    </span>

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-400/5 to-violet-500/5">
                      <UserRound
                        size={13}
                        className="absolute bottom-1 right-1 text-cyan-300/30"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#050816] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TutorTopbar;