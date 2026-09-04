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

    /* -----------------------------
       VALIDATION
    ----------------------------- */

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

    /* -----------------------------
       CHECK EXISTING USER
    ----------------------------- */

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

    /* -----------------------------
       HASH PASSWORD
    ----------------------------- */

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    /* -----------------------------
       CREATE USER
    ----------------------------- */

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

    /* -----------------------------
       VALIDATION
    ----------------------------- */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    /* -----------------------------
       FIND USER
    ----------------------------- */

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

    /* -----------------------------
       CHECK PASSWORD
    ----------------------------- */

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

    /* -----------------------------
       CREATE JWT
    ----------------------------- */

    const token = createToken(user);

    /* -----------------------------
       REMOVE PASSWORD HASH
    ----------------------------- */

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
   AUTH TEST
   GET /api/auth/test
========================================================= */

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working.",
    routes: [
      "POST /api/auth/signup",
      "POST /api/auth/login",
      "GET /api/auth/me",
    ],
  });
});

/* =========================================================
   EXPORT
========================================================= */

export default router;