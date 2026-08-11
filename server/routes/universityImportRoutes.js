import express from "express";

import {
  importUniversityPage,
  importUniversitiesByCountry,
} from "../services/universityImporter.js";

const router =
  express.Router();

/* =========================================================
   IMPORT ONE PAGE
========================================================= */

router.post(
  "/page",
  async (req, res) => {
    try {
      const {
        cursor = "*",
        countryCode = null,
      } = req.body;

      const result =
        await importUniversityPage({
          cursor,
          countryCode,
        });

      return res.json(result);
    } catch (error) {
      console.error(
        "University page import error:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          error?.message ||
          "University import failed.",
      });
    }
  }
);

/* =========================================================
   IMPORT BY COUNTRY
========================================================= */

router.post(
  "/country/:countryCode",
  async (req, res) => {
    try {
      const countryCode =
        String(
          req.params.countryCode
        )
          .trim()
          .toUpperCase();

      if (
        !/^[A-Z]{2}$/.test(
          countryCode
        )
      ) {
        return res.status(400).json({
          success: false,

          error:
            "Country code must be a two-letter ISO code.",
        });
      }

      const result =
        await importUniversitiesByCountry(
          countryCode
        );

      return res.json(result);
    } catch (error) {
      console.error(
        "University country import error:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          error?.message ||
          "University country import failed.",
      });
    }
  }
);

export default router;