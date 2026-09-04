import React, { useMemo } from "react";
import {
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  School,
  User,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

const getFullName = (user) => {
  if (!user) return "Unknown User";

  const name =
    user.name ||
    [
      user.first_name || user.firstName,
      user.middle_name || user.middleName,
      user.last_name || user.lastName,
    ]
      .filter(Boolean)
      .join(" ");

  return String(name || "Unknown User").trim();
};

const getEmail = (user) => {
  return user?.email || "No email";
};

const getRole = (user) => {
  if (user?.role) return user.role;

  if (user?.user_type === "student") {
    return "Student";
  }

  if (user?.user_type === "tutor") {
    return "Tutor";
  }

  if (user?.userType === "student") {
    return "Student";
  }

  if (user?.userType === "tutor") {
    return "Tutor";
  }

  return "Student";
};

const getStatus = (user) => {
  return (
    user?.status ||
    user?.account_status ||
    user?.accountStatus ||
    "Inactive"
  );
};

const getJoinedDate = (user) => {
  const value =
    user?.created_at ||
    user?.createdAt ||
    user?.joined_at ||
    user?.joinedAt;

  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeStatus = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const getInitial = (user) => {
  const name = getFullName(user);

  return name.charAt(0).toUpperCase() || "U";
};

/* =========================================================
   COMPONENT
========================================================= */

const UserTable = ({
  users = [],
  onEdit,
  onDelete,
  onView,
}) => {
  /* =======================================================
     NORMALIZE USERS
  ======================================================= */

  const normalizedUsers = useMemo(() => {
    return Array.isArray(users)
      ? users.map((user) => ({
          ...user,

          displayName: getFullName(user),

          displayEmail: getEmail(user),

          displayRole: getRole(user),

          displayStatus: getStatus(user),

          displayJoined: getJoinedDate(user),

          displayInitial: getInitial(user),
        }))
      : [];
  }, [users]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-900/80
        shadow-xl
        shadow-black/20
        backdrop-blur
      "
    >
      {/* ===================================================
          TABLE HEADER
      =================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-slate-800
          bg-slate-950/60
          px-6
          py-4
        "
      >
        <div>
          <h2 className="font-semibold text-white">
            Users
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {normalizedUsers.length}{" "}
            {normalizedUsers.length === 1
              ? "user"
              : "users"}{" "}
            found
          </p>
        </div>
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead
            className="
              border-b
              border-slate-800
              bg-slate-950
              text-xs
              uppercase
              tracking-wider
              text-slate-500
            "
          >
            <tr>
              <th className="px-6 py-4">
                User
              </th>

              <th className="px-6 py-4">
                Email
              </th>

              <th className="px-6 py-4">
                Role
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4">
                Joined
              </th>

              <th className="px-6 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {/* =================================================
                EMPTY
            ================================================= */}

            {normalizedUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="
                    px-6
                    py-16
                    text-center
                  "
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="
                        mb-4
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-slate-800
                        text-slate-500
                      "
                    >
                      <User size={25} />
                    </div>

                    <p className="font-medium text-slate-300">
                      No users found
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Users will appear here when they are
                      available.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              normalizedUsers.map((user, index) => {
                const status = normalizeStatus(
                  user.displayStatus
                );

                const isActive =
                  status === "active" ||
                  status === "approved" ||
                  status === "verified" ||
                  status === "completed";

                const isStudent =
                  user.displayRole.toLowerCase() ===
                  "student";

                return (
                  <tr
                    key={
                      user.id ||
                      user.enrollment_id ||
                      user.reference ||
                      index
                    }
                    className="
                      border-b
                      border-slate-800/80
                      transition
                      last:border-b-0
                      hover:bg-slate-800/30
                    "
                  >
                    {/* =========================================
                        USER
                    ========================================= */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            font-bold
                            ${
                              isStudent
                                ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-400"
                                : "border-violet-400/20 bg-violet-500/10 text-violet-400"
                            }
                          `}
                        >
                          {isStudent ? (
                            <GraduationCap size={20} />
                          ) : (
                            <School size={20} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">
                            {user.displayName}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            ID:{" "}
                            {user.id ||
                              user.enrollment_id ||
                              user.reference ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* =========================================
                        EMAIL
                    ========================================= */}

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">
                        {user.displayEmail}
                      </span>
                    </td>

                    {/* =========================================
                        ROLE
                    ========================================= */}

                    <td className="px-6 py-4">
                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          px-3
                          py-1.5
                          text-xs
                          font-semibold
                          ${
                            isStudent
                              ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-400"
                              : "border-violet-400/20 bg-violet-500/10 text-violet-400"
                          }
                        `}
                      >
                        {isStudent ? (
                          <GraduationCap size={13} />
                        ) : (
                          <School size={13} />
                        )}

                        {user.displayRole}
                      </span>
                    </td>

                    {/* =========================================
                        STATUS
                    ========================================= */}

                    <td className="px-6 py-4">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          border
                          px-3
                          py-1.5
                          text-xs
                          font-semibold
                          ${
                            isActive
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                          }
                        `}
                      >
                        {user.displayStatus}
                      </span>
                    </td>

                    {/* =========================================
                        JOINED
                    ========================================= */}

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {user.displayJoined}
                      </span>
                    </td>

                    {/* =========================================
                        ACTIONS
                    ========================================= */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() =>
                            onView?.(user)
                          }
                          title="View user"
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-800
                            text-slate-400
                            transition
                            hover:border-cyan-400/30
                            hover:bg-cyan-500/10
                            hover:text-cyan-400
                          "
                        >
                          <Eye size={17} />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            onEdit?.(user)
                          }
                          title="Edit user"
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-800
                            text-slate-400
                            transition
                            hover:border-emerald-400/30
                            hover:bg-emerald-500/10
                            hover:text-emerald-400
                          "
                        >
                          <Edit size={17} />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            onDelete?.(user)
                          }
                          title="Delete user"
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-800
                            text-slate-400
                            transition
                            hover:border-red-400/30
                            hover:bg-red-500/10
                            hover:text-red-400
                          "
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;