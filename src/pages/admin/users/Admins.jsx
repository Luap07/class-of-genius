import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
  Crown,
  Activity,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const AUTH_TOKEN_KEY = "scholiqen_auth_token";

const getToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const normalize = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getRoleLabel = (role) => {
  if (!role) return "Administrator";

  return String(role)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const isAdminRole = (role) => {
  const value = normalize(role);

  return [
    "admin",
    "super_admin",
    "superadmin",
    "content_admin",
    "analytics_admin",
    "moderator",
  ].includes(value);
};

const getStatus = (admin) => {
  if (admin.status) {
    return normalize(admin.status) === "inactive"
      ? "inactive"
      : "active";
  }

  return normalize(admin.role) === "inactive_admin"
    ? "inactive"
    : "active";
};

const emptyForm = {
  username: "",
  email: "",
  password: "",
  role: "admin",
};

export default function Admins() {
  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [viewAdmin, setViewAdmin] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [actionId, setActionId] = useState(null);

  /* =========================================================
     API HELPER
  ========================================================= */

  const apiRequest = async (url, options = {}) => {
    const token = getToken();

    const response = await fetch(
      `${API_URL}${url}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
          ...(options.headers || {}),
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Something went wrong while communicating with the server."
      );
    }

    return data;
  };

  /* =========================================================
     FETCH ADMINS
  ========================================================= */

  const fetchAdmins = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await apiRequest(
        "/api/auth/admins"
      );

      const fetchedAdmins = Array.isArray(data.admins)
        ? data.admins
        : [];

      setAdmins(fetchedAdmins);
    } catch (err) {
      console.error("Fetch admins error:", err);

      setError(
        err.message ||
          "Unable to load administrators."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  /* =========================================================
     AUTO CLEAR MESSAGES
  ========================================================= */

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const active = admins.filter(
      (admin) => getStatus(admin) === "active"
    ).length;

    const inactive = admins.filter(
      (admin) => getStatus(admin) === "inactive"
    ).length;

    const superAdmins = admins.filter((admin) =>
      ["super_admin", "superadmin"].includes(
        normalize(admin.role)
      )
    ).length;

    return {
      total: admins.length,
      active,
      inactive,
      superAdmins,
    };
  }, [admins]);

  /* =========================================================
     FILTER ADMINS
  ========================================================= */

  const filteredAdmins = useMemo(() => {
    const query = normalize(search);

    return admins.filter((admin) => {
      const username = normalize(admin.username);
      const email = normalize(admin.email);
      const role = normalize(admin.role);
      const status = getStatus(admin);

      const matchesSearch =
        !query ||
        username.includes(query) ||
        email.includes(query) ||
        role.includes(query);

      const matchesRole =
        roleFilter === "all" ||
        role === normalize(roleFilter);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    admins,
    search,
    roleFilter,
    statusFilter,
  ]);

  /* =========================================================
     OPEN ADD MODAL
  ========================================================= */

  const openAddModal = () => {
    setEditingAdmin(null);
    setForm(emptyForm);
    setShowPassword(false);
    setError("");
    setShowModal(true);
  };

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const openEditModal = (admin) => {
    setEditingAdmin(admin);

    setForm({
      username: admin.username || "",
      email: admin.email || "",
      password: "",
      role: admin.role || "admin",
    });

    setShowPassword(false);
    setError("");
    setShowModal(true);
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingAdmin(null);
    setForm(emptyForm);
    setShowPassword(false);
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     SAVE ADMIN
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.username.trim()) {
        throw new Error(
          "Please enter the administrator username."
        );
      }

      if (!form.email.trim()) {
        throw new Error(
          "Please enter the administrator email."
        );
      }

      if (!editingAdmin && !form.password) {
        throw new Error(
          "Please create a password for the administrator."
        );
      }

      if (
        form.password &&
        form.password.length < 6
      ) {
        throw new Error(
          "Password must be at least 6 characters."
        );
      }

      const payload = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
      };

      if (form.password) {
        payload.password = form.password;
      }

      if (editingAdmin) {
        await apiRequest(
          `/api/auth/admins/${editingAdmin.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        );

        setSuccess(
          "Administrator updated successfully."
        );
      } else {
        await apiRequest(
          "/api/auth/admins",
          {
            method: "POST",
            body: JSON.stringify({
              ...payload,
              password: form.password,
            }),
          }
        );

        setSuccess(
          "Administrator created successfully."
        );
      }

      closeModal();

      await fetchAdmins(true);
    } catch (err) {
      console.error("Save admin error:", err);

      setError(
        err.message ||
          "Unable to save administrator."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const toggleStatus = async (admin) => {
    const currentStatus = getStatus(admin);

    const nextStatus =
      currentStatus === "active"
        ? "inactive"
        : "active";

    try {
      setActionId(admin.id);
      setError("");

      await apiRequest(
        `/api/auth/admins/${admin.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      setSuccess(
        nextStatus === "active"
          ? `${admin.username} has been activated.`
          : `${admin.username} has been deactivated.`
      );

      await fetchAdmins(true);
    } catch (err) {
      console.error(
        "Toggle admin status error:",
        err
      );

      setError(
        err.message ||
          "Unable to change administrator status."
      );
    } finally {
      setActionId(null);
    }
  };

  /* =========================================================
     DELETE ADMIN
  ========================================================= */

  const deleteAdmin = async () => {
    if (!deleteTarget) return;

    try {
      setActionId(deleteTarget.id);
      setError("");

      await apiRequest(
        `/api/auth/admins/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      setAdmins((previous) =>
        previous.filter(
          (admin) =>
            admin.id !== deleteTarget.id
        )
      );

      setSuccess(
        `${deleteTarget.username} was removed successfully.`
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete admin error:", err);

      setError(
        err.message ||
          "Unable to remove administrator."
      );
    } finally {
      setActionId(null);
    }
  };

  /* =========================================================
     UNIQUE ROLES
  ========================================================= */

  const roles = useMemo(() => {
    return Array.from(
      new Set(
        admins
          .map((admin) => admin.role)
          .filter(Boolean)
      )
    );
  }, [admins]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[130px]" />

        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/20 flex items-center justify-center">
                <ShieldCheck
                  size={25}
                  className="text-cyan-300"
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                  User Management
                </p>

                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  Administrators
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-2xl">
              Manage administrator accounts,
              permissions, passwords and access
              status from one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAdmins(true)}
              disabled={refreshing}
              className="h-11 px-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              onClick={openAddModal}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 text-sm font-bold"
            >
              <Plus size={18} />

              Add Administrator
            </button>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 flex items-center gap-3 text-sm text-emerald-300"
            >
              <CheckCircle2 size={18} />

              {success}
            </motion.div>
          )}

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
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 flex items-center gap-3 text-sm text-red-300"
            >
              <AlertCircle size={18} />

              <span className="flex-1">
                {error}
              </span>

              <button
                onClick={() => setError("")}
                className="p-1 hover:bg-white/5 rounded-lg"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Admins"
            value={stats.total}
            description="All administrators"
          />

          <StatCard
            icon={Activity}
            label="Active"
            value={stats.active}
            description="Currently active"
            iconClass="text-emerald-300"
          />

          <StatCard
            icon={UserX}
            label="Inactive"
            value={stats.inactive}
            description="Access disabled"
            iconClass="text-amber-300"
          />

          <StatCard
            icon={Crown}
            label="Super Admins"
            value={stats.superAdmins}
            description="Highest privilege"
            iconClass="text-violet-300"
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search administrators..."
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-black/20 border border-white/10 outline-none focus:border-cyan-400/40 text-sm placeholder:text-slate-600"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              className="h-12 px-4 rounded-xl bg-[#0b1120] border border-white/10 outline-none focus:border-cyan-400/40 text-sm"
            >
              <option value="all">
                All Roles
              </option>

              {roles.map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {getRoleLabel(role)}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-12 px-4 rounded-xl bg-[#0b1120] border border-white/10 outline-none focus:border-cyan-400/40 text-sm"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl overflow-hidden">
          {loading ? (
            <LoadingState />
          ) : filteredAdmins.length === 0 ? (
            <EmptyState
              search={search}
              onAdd={openAddModal}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.025]">
                    <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      Administrator
                    </th>

                    <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      Role
                    </th>

                    <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      Joined
                    </th>

                    <th className="text-right px-6 py-4 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAdmins.map(
                    (admin, index) => {
                      const status =
                        getStatus(admin);

                      const busy =
                        actionId === admin.id;

                      return (
                        <motion.tr
                          key={admin.id}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay:
                              index * 0.03,
                          }}
                          className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.025] transition"
                        >
                          {/* Administrator */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={
                                  admin.username
                                }
                              />

                              <div className="min-w-0">
                                <button
                                  onClick={() =>
                                    setViewAdmin(
                                      admin
                                    )
                                  }
                                  className="font-bold text-white hover:text-cyan-300 transition truncate max-w-[220px] block"
                                >
                                  {
                                    admin.username
                                  }
                                </button>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                  <Mail
                                    size={12}
                                  />

                                  <span className="truncate max-w-[230px]">
                                    {
                                      admin.email
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-400/10 text-xs font-semibold text-violet-300">
                              <ShieldCheck
                                size={13}
                              />

                              {getRoleLabel(
                                admin.role
                              )}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            <StatusBadge
                              status={status}
                            />
                          </td>

                          {/* Joined */}
                          <td className="px-6 py-5 text-sm text-slate-400">
                            {formatDate(
                              admin.created_at
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <IconButton
                                title="View administrator"
                                onClick={() =>
                                  setViewAdmin(
                                    admin
                                  )
                                }
                              >
                                <Eye
                                  size={16}
                                />
                              </IconButton>

                              <IconButton
                                title="Edit administrator"
                                onClick={() =>
                                  openEditModal(
                                    admin
                                  )
                                }
                              >
                                <Pencil
                                  size={16}
                                />
                              </IconButton>

                              <IconButton
                                title={
                                  status ===
                                  "active"
                                    ? "Deactivate"
                                    : "Activate"
                                }
                                onClick={() =>
                                  toggleStatus(
                                    admin
                                  )
                                }
                                disabled={
                                  busy
                                }
                              >
                                {status ===
                                "active" ? (
                                  <UserX
                                    size={16}
                                  />
                                ) : (
                                  <UserCheck
                                    size={16}
                                  />
                                )}
                              </IconButton>

                              <IconButton
                                title="Remove administrator"
                                danger
                                onClick={() =>
                                  setDeleteTarget(
                                    admin
                                  )
                                }
                                disabled={
                                  busy
                                }
                              >
                                <Trash2
                                  size={16}
                                />
                              </IconButton>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-slate-600">
          Showing{" "}
          <span className="text-slate-400">
            {filteredAdmins.length}
          </span>{" "}
          of{" "}
          <span className="text-slate-400">
            {admins.length}
          </span>{" "}
          administrators
        </div>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      <AnimatePresence>
        {showModal && (
          <ModalOverlay>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#080d19] shadow-2xl shadow-black/60 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/10 flex items-center justify-center">
                      {editingAdmin ? (
                        <Pencil
                          size={19}
                          className="text-cyan-300"
                        />
                      ) : (
                        <ShieldCheck
                          size={19}
                          className="text-cyan-300"
                        />
                      )}
                    </div>

                    <div>
                      <h2 className="font-bold text-lg">
                        {editingAdmin
                          ? "Edit Administrator"
                          : "Add Administrator"}
                      </h2>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {editingAdmin
                          ? "Update account details and access."
                          : "Create a new administrator account."}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-5"
              >
                {/* Username */}
                <FormField
                  label="Username"
                  icon={Users}
                >
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="e.g. John Administrator"
                    className="form-input"
                    autoComplete="off"
                  />
                </FormField>

                {/* Email */}
                <FormField
                  label="Email Address"
                  icon={Mail}
                >
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className="form-input"
                    autoComplete="off"
                  />
                </FormField>

                {/* Role */}
                <FormField
                  label="Administrator Role"
                  icon={ShieldCheck}
                >
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="admin">
                      Administrator
                    </option>

                    <option value="super_admin">
                      Super Admin
                    </option>

                    <option value="content_admin">
                      Content Admin
                    </option>

                    <option value="analytics_admin">
                      Analytics Admin
                    </option>

                    <option value="moderator">
                      Moderator
                    </option>
                  </select>
                </FormField>

                {/* Password */}
                <FormField
                  label={
                    editingAdmin
                      ? "New Password (optional)"
                      : "Password"
                  }
                  icon={KeyRound}
                >
                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={
                        editingAdmin
                          ? "Leave empty to keep current password"
                          : "Minimum 6 characters"
                      }
                      className="form-input pr-12"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </FormField>

                {/* Security notice */}
                <div className="rounded-xl border border-cyan-400/10 bg-cyan-500/[0.04] p-4 flex gap-3">
                  <Lock
                    size={17}
                    className="text-cyan-300 mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-sm font-semibold text-cyan-200">
                      Password security
                    </p>

                    <p className="text-xs text-slate-500 mt-1 leading-5">
                      Passwords are securely hashed
                      before being stored. The
                      original password cannot be
                      retrieved later.
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300 flex gap-2">
                    <AlertCircle
                      size={17}
                      className="shrink-0 mt-0.5"
                    />

                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="h-11 px-5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-semibold transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && (
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                    )}

                    {editingAdmin
                      ? "Save Changes"
                      : "Create Administrator"}
                  </button>
                </div>
              </form>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      <AnimatePresence>
        {viewAdmin && (
          <ModalOverlay>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#080d19] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={
                        viewAdmin.username
                      }
                      large
                    />

                    <div>
                      <h2 className="text-xl font-bold">
                        {viewAdmin.username}
                      </h2>

                      <p className="text-sm text-slate-500">
                        {viewAdmin.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setViewAdmin(null)
                    }
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-7 space-y-3">
                  <InfoRow
                    label="Role"
                    value={getRoleLabel(
                      viewAdmin.role
                    )}
                  />

                  <InfoRow
                    label="Status"
                    value={
                      getStatus(viewAdmin) ===
                      "active"
                        ? "Active"
                        : "Inactive"
                    }
                  />

                  <InfoRow
                    label="Joined"
                    value={formatDate(
                      viewAdmin.created_at
                    )}
                  />

                  <InfoRow
                    label="Email"
                    value={viewAdmin.email}
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setViewAdmin(null);
                      openEditModal(
                        viewAdmin
                      );
                    }}
                    className="flex-1 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/10 text-cyan-300 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-cyan-500/15"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      setViewAdmin(null)
                    }
                    className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      <AnimatePresence>
        {deleteTarget && (
          <ModalOverlay>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="w-full max-w-md rounded-3xl border border-red-400/10 bg-[#080d19] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-400/10 flex items-center justify-center mb-5">
                  <Trash2
                    size={21}
                    className="text-red-300"
                  />
                </div>

                <h2 className="text-xl font-bold">
                  Remove Administrator?
                </h2>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  You are about to permanently
                  remove{" "}
                  <span className="text-white font-semibold">
                    {deleteTarget.username}
                  </span>
                  . This action cannot be undone.
                </p>

                <div className="flex gap-3 mt-7">
                  <button
                    onClick={() =>
                      setDeleteTarget(null)
                    }
                    disabled={actionId === deleteTarget.id}
                    className="flex-1 h-11 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={deleteAdmin}
                    disabled={
                      actionId === deleteTarget.id
                    }
                    className="flex-1 h-11 rounded-xl bg-red-500/15 border border-red-400/20 text-red-300 hover:bg-red-500/20 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    {actionId ===
                    deleteTarget.id ? (
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}

                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass = "text-cyan-300",
}) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className="rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-5"
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center ${iconClass}`}
        >
          <Icon size={19} />
        </div>

        <span className="text-2xl font-black">
          {value}
        </span>
      </div>

      <p className="text-sm font-semibold mt-4">
        {label}
      </p>

      <p className="text-xs text-slate-600 mt-1">
        {description}
      </p>
    </motion.div>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({ name = "", large = false }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");

  return (
    <div
      className={[
        large
          ? "w-14 h-14 rounded-2xl text-lg"
          : "w-10 h-10 rounded-xl text-sm",
        "shrink-0 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/10 flex items-center justify-center font-black text-cyan-200",
      ].join(" ")}
    >
      {initials || "A"}
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
        active
          ? "bg-emerald-500/10 border-emerald-400/10 text-emerald-300"
          : "bg-amber-500/10 border-amber-400/10 text-amber-300"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active
            ? "bg-emerald-400"
            : "bg-amber-400"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* =========================================================
   ICON BUTTON
========================================================= */

function IconButton({
  children,
  onClick,
  title,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-9 h-9 rounded-lg border flex items-center justify-center transition disabled:opacity-40 ${
        danger
          ? "border-red-400/10 bg-red-500/5 text-red-400 hover:bg-red-500/10"
          : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.07]"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  icon: Icon,
  children,
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
        <Icon size={14} />

        {label}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-sm text-white font-medium text-right">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   MODAL OVERLAY
========================================================= */

function ModalOverlay({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          // intentionally don't close on outside click
        }
      }}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="p-16 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 flex items-center justify-center">
        <RefreshCw
          size={22}
          className="text-cyan-300 animate-spin"
        />
      </div>

      <p className="mt-4 text-sm font-semibold">
        Loading administrators...
      </p>

      <p className="text-xs text-slate-600 mt-1">
        Fetching live data from the database
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({ search, onAdd }) {
  return (
    <div className="p-16 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
        <Users
          size={24}
          className="text-slate-500"
        />
      </div>

      <h3 className="mt-5 font-bold">
        No administrators found
      </h3>

      <p className="text-sm text-slate-600 mt-2 max-w-sm">
        {search
          ? "Try changing your search or filters."
          : "Create your first administrator account to get started."}
      </p>

      {!search && (
        <button
          onClick={onAdd}
          className="mt-5 px-5 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/10 text-cyan-300 text-sm font-semibold flex items-center gap-2"
        >
          <Plus size={16} />

          Add Administrator
        </button>
      )}
    </div>
  );
}