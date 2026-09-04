import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   HELPERS
========================================================= */

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const formatUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
});

const isAdminRole = (role) => {
  if (!role) return false;

  const normalized = String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return [
    "admin",
    "super_admin",
    "superadmin",
    "content_admin",
    "analytics_admin",
    "moderator",
  ].includes(normalized);
};

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const result = await pool.query(
      `
      SELECT
        id,
        username,
        email,
        role,
        created_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    req.user = result.rows[0];

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please login again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

/* =========================================================
   ADMIN MIDDLEWARE
========================================================= */

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !isAdminRole(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Administrator access is required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify administrator access.",
    });
  }
};

/* =========================================================
   SIGN UP
   POST /api/auth/signup
========================================================= */

router.post("/signup", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required.",
      });
    }

    const cleanUsername = String(username).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    if (cleanUsername.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 2 characters.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const result = await pool.query(
      `
      INSERT INTO users (
        username,
        email,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        username,
        email,
        role,
        created_at
      `,
      [
        cleanUsername,
        cleanEmail,
        passwordHash,
        "user",
      ]
    );

    const user = result.rows[0];

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

/* =========================================================
   LOGIN
   POST /api/auth/login
========================================================= */

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    const result = await pool.query(
      `
      SELECT
        id,
        username,
        email,
        password_hash,
        role,
        created_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(500).json({
        success: false,
        message:
          "This account does not have a valid password.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    console.log(
      `✅ Login successful: ${user.email} (${user.role})`
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

/* =========================================================
   CURRENT USER
   GET /api/auth/me
========================================================= */

router.get("/me", requireAuth, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: formatUser(req.user),
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user information.",
    });
  }
});

/* =========================================================
   GET ALL ADMINS
   GET /api/auth/admins
========================================================= */

router.get(
  "/admins",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          username,
          email,
          role,
          created_at
        FROM users
        WHERE role IS NOT NULL
          AND (
            LOWER(role) = 'admin'
            OR LOWER(role) = 'super_admin'
            OR LOWER(role) = 'superadmin'
            OR LOWER(role) = 'content_admin'
            OR LOWER(role) = 'analytics_admin'
            OR LOWER(role) = 'moderator'
          )
        ORDER BY created_at DESC
      `);

      return res.status(200).json({
        success: true,
        admins: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error("Get admins error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load administrators.",
      });
    }
  }
);

/* =========================================================
   CREATE ADMIN
   POST /api/auth/admins
========================================================= */

router.post(
  "/admins",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        role,
      } = req.body;

      if (
        !username ||
        !email ||
        !password ||
        !role
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Username, email, password and role are required.",
        });
      }

      const cleanUsername = String(username).trim();
      const cleanEmail = String(email)
        .trim()
        .toLowerCase();

      const cleanRole = String(role).trim();

      if (cleanUsername.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Username must be at least 2 characters.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      if (!isAdminRole(cleanRole)) {
        return res.status(400).json({
          success: false,
          message:
            "The selected role is not an administrator role.",
        });
      }

      const existing = await pool.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [cleanEmail]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists.",
        });
      }

      const passwordHash =
        await bcrypt.hash(password, 12);

      const result = await pool.query(
        `
        INSERT INTO users (
          username,
          email,
          password_hash,
          role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          username,
          email,
          role,
          created_at
        `,
        [
          cleanUsername,
          cleanEmail,
          passwordHash,
          cleanRole,
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Administrator created successfully.",
        admin: result.rows[0],
      });
    } catch (error) {
      console.error("Create admin error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to create administrator.",
      });
    }
  }
);

/* =========================================================
   EDIT ADMIN
   PATCH /api/auth/admins/:id
========================================================= */

router.patch(
  "/admins/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        username,
        email,
        role,
        password,
      } = req.body;

      const existing = await pool.query(
        `
        SELECT
          id,
          username,
          email,
          role,
          password_hash,
          created_at
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Administrator not found.",
        });
      }

      const current = existing.rows[0];

      const newUsername =
        username !== undefined
          ? String(username).trim()
          : current.username;

      const newEmail =
        email !== undefined
          ? String(email).trim().toLowerCase()
          : current.email;

      const newRole =
        role !== undefined
          ? String(role).trim()
          : current.role;

      if (newUsername.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Username must be at least 2 characters.",
        });
      }

      if (!isAdminRole(newRole)) {
        return res.status(400).json({
          success: false,
          message:
            "The selected role is not an administrator role.",
        });
      }

      const duplicate = await pool.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
          AND id <> $2
        LIMIT 1
        `,
        [newEmail, id]
      );

      if (duplicate.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Another account already uses this email.",
        });
      }

      let passwordHash = current.password_hash;

      if (password) {
        if (password.length < 6) {
          return res.status(400).json({
            success: false,
            message:
              "Password must be at least 6 characters.",
          });
        }

        passwordHash =
          await bcrypt.hash(password, 12);
      }

      const result = await pool.query(
        `
        UPDATE users
        SET
          username = $1,
          email = $2,
          role = $3,
          password_hash = $4
        WHERE id = $5
        RETURNING
          id,
          username,
          email,
          role,
          created_at
        `,
        [
          newUsername,
          newEmail,
          newRole,
          passwordHash,
          id,
        ]
      );

      return res.status(200).json({
        success: true,
        message: "Administrator updated successfully.",
        admin: result.rows[0],
      });
    } catch (error) {
      console.error("Edit admin error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update administrator.",
      });
    }
  }
);

/* =========================================================
   ACTIVATE / DEACTIVATE ADMIN
   PATCH /api/auth/admins/:id/status
========================================================= */

router.patch(
  "/admins/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Status must be active or inactive.",
        });
      }

      const result = await pool.query(
        `
        UPDATE users
        SET role = CASE
          WHEN $1 = 'inactive'
            THEN 'inactive_admin'
          ELSE 'admin'
        END
        WHERE id = $2
        RETURNING
          id,
          username,
          email,
          role,
          created_at
        `,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Administrator not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          status === "active"
            ? "Administrator activated."
            : "Administrator deactivated.",
        admin: result.rows[0],
      });
    } catch (error) {
      console.error("Admin status error:", error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to change administrator status.",
      });
    }
  }
);

/* =========================================================
   DELETE ADMIN
   DELETE /api/auth/admins/:id
========================================================= */

router.delete(
  "/admins/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      /* -----------------------------------------
         PREVENT SELF DELETE
      ----------------------------------------- */

      if (String(req.user.id) === String(id)) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot delete your own administrator account.",
        });
      }

      const existing = await pool.query(
        `
        SELECT
          id,
          username,
          email,
          role
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Administrator not found.",
        });
      }

      if (!isAdminRole(existing.rows[0].role)) {
        return res.status(400).json({
          success: false,
          message:
            "This account is not an administrator.",
        });
      }

      await pool.query(
        `
        DELETE FROM users
        WHERE id = $1
        `,
        [id]
      );

      return res.status(200).json({
        success: true,
        message:
          "Administrator removed successfully.",
      });
    } catch (error) {
      console.error("Delete admin error:", error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to remove administrator.",
      });
    }
  }
);

/* =========================================================
   AUTH TEST
========================================================= */

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working.",
    routes: [
      "POST /api/auth/signup",
      "POST /api/auth/login",
      "GET /api/auth/me",
      "GET /api/auth/admins",
      "POST /api/auth/admins",
      "PATCH /api/auth/admins/:id",
      "PATCH /api/auth/admins/:id/status",
      "DELETE /api/auth/admins/:id",
    ],
  });
});

/* =========================================================
   EXPORT
========================================================= */

export default router;