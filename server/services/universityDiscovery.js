import { createClient } from "@supabase/supabase-js";
import {
  importUniversityAcademics,
} from "./universityAcademicImporter.js";

/* =========================================================
   SUPABASE
========================================================= */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/* =========================================================
   OPENALEX
========================================================= */

const OPENALEX_URL =
  "https://api.openalex.org/institutions";

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const result = String(value)
    .replace(/\s+/g, " ")
    .trim();

  return result || null;
}

function normalizeWebsite(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.origin;
  } catch {
    return null;
  }
}

/* =========================================================
   FETCH UNIVERSITIES FROM OPENALEX
========================================================= */

async function fetchUniversities({
  cursor = "*",
  perPage = 100,
} = {}) {
  const params = new URLSearchParams();

  /*
   * OpenAlex institutions endpoint.
   *
   * We request education institutions and then save
   * them into our universities table.
   */

  params.set("filter", "type:education");
  params.set("per-page", String(perPage));
  params.set("cursor", cursor);

  if (process.env.OPENALEX_MAILTO) {
    params.set(
      "mailto",
      process.env.OPENALEX_MAILTO
    );
  }

  const response = await fetch(
    `${OPENALEX_URL}?${params.toString()}`
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `University discovery failed: ${response.status} ${body}`
    );
  }

  return response.json();
}

/* =========================================================
   FIND EXISTING UNIVERSITY
========================================================= */

async function findExistingUniversity(university) {
  /*
   * Website is the strongest identifier.
   */

  if (university.website) {
    const {
      data,
      error,
    } = await supabase
      .from("universities")
      .select(
        "id,name,short_name,website"
      )
      .eq(
        "website",
        university.website
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  }

  /*
   * Fall back to exact university name.
   */

  if (university.name) {
    const {
      data,
      error,
    } = await supabase
      .from("universities")
      .select(
        "id,name,short_name,website"
      )
      .ilike(
        "name",
        university.name
      )
      .limit(1);

    if (error) {
      throw error;
    }

    return data?.[0] || null;
  }

  return null;
}

/* =========================================================
   SAVE DISCOVERED UNIVERSITY
========================================================= */

async function saveDiscoveredUniversity(
  institution
) {
  const university = {
    name: clean(
      institution.display_name
    ),

    short_name: clean(
      institution.display_name_acronyms?.join(
        " / "
      )
    ),

    description: null,

    logo_url: clean(
      institution.image_url
    ),

    cover_url: null,

    image_url: clean(
      institution.image_url
    ),

    website: normalizeWebsite(
      institution.homepage_url
    ),

    email: null,

    phone: null,

    address: null,

    city: clean(
      institution.geo?.city
    ),

    state: clean(
      institution.geo?.region
    ),

    /*
     * Country is stored in the database,
     * but it does NOT have to be displayed
     * by the frontend.
     */

    country: clean(
      institution.country?.display_name
    ),

    established_year: null,

    accreditation: null,

    ownership: null,

    type: "University",

    active: true,
  };

  /* -------------------------------------------------------
     VALIDATE NAME
  ------------------------------------------------------- */

  if (!university.name) {
    return {
      action: "skipped",
      reason: "Missing university name",
    };
  }

  /* -------------------------------------------------------
     CHECK DATABASE
  ------------------------------------------------------- */

  const existing =
    await findExistingUniversity(
      university
    );

  /* -------------------------------------------------------
     UNIVERSITY ALREADY EXISTS
  ------------------------------------------------------- */

  if (existing) {
    return {
      action: "existing",
      university: existing,
    };
  }

  /* -------------------------------------------------------
     CREATE UNIVERSITY
  ------------------------------------------------------- */

  const now =
    new Date().toISOString();

  const {
    data,
    error,
  } = await supabase
    .from("universities")
    .insert({
      ...university,

      created_at: now,

      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    action: "created",
    university: data,
  };
}

/* =========================================================
   DISCOVER ONE PAGE
========================================================= */

export async function discoverUniversityPage({
  cursor = "*",
  perPage = 100,
} = {}) {
  const response =
    await fetchUniversities({
      cursor,
      perPage,
    });

  const institutions =
    response.results || [];

  const statistics = {
    discovered:
      institutions.length,

    created: 0,

    existing: 0,

    skipped: 0,

    failed: 0,
  };

  const created = [];

  const existing = [];

  const skipped = [];

  const errors = [];

  /* -------------------------------------------------------
     PROCESS UNIVERSITIES
  ------------------------------------------------------- */

  for (
    const institution of institutions
  ) {
    try {
      const result =
        await saveDiscoveredUniversity(
          institution
        );

      if (
        result.action ===
        "created"
      ) {
        statistics.created++;

        created.push(
          result.university
        );

        continue;
      }

      if (
        result.action ===
        "existing"
      ) {
        statistics.existing++;

        existing.push(
          result.university
        );

        continue;
      }

      statistics.skipped++;

      skipped.push({
        name:
          institution.display_name,

        reason:
          result.reason ||
          "Unknown reason",
      });
    } catch (error) {
      statistics.failed++;

      errors.push({
        name:
          institution.display_name,

        error:
          error?.message ||
          String(error),
      });
    }
  }

  return {
    success: true,

    statistics,

    created,

    existing,

    skipped,

    errors,

    nextCursor:
      response.meta?.next_cursor ||
      null,
  };
}

/* =========================================================
   DISCOVER MULTIPLE PAGES
========================================================= */

export async function discoverUniversities({
  pages = 1,
  perPage = 100,
} = {}) {
  let cursor = "*";

  const totals = {
    discovered: 0,

    created: 0,

    existing: 0,

    skipped: 0,

    failed: 0,
  };

  const created = [];

  const existing = [];

  const skipped = [];

  const errors = [];

  /* -------------------------------------------------------
     PAGE LOOP
  ------------------------------------------------------- */

  for (
    let page = 0;
    page < pages;
    page++
  ) {
    console.log(
      `🌍 Discovering university page ${
        page + 1
      }/${pages}...`
    );

    const result =
      await discoverUniversityPage({
        cursor,
        perPage,
      });

    totals.discovered +=
      result.statistics.discovered;

    totals.created +=
      result.statistics.created;

    totals.existing +=
      result.statistics.existing;

    totals.skipped +=
      result.statistics.skipped;

    totals.failed +=
      result.statistics.failed;

    created.push(
      ...result.created
    );

    existing.push(
      ...result.existing
    );

    skipped.push(
      ...result.skipped
    );

    errors.push(
      ...result.errors
    );

    cursor =
      result.nextCursor;

    if (!cursor) {
      break;
    }
  }

  return {
    success: true,

    statistics: totals,

    created,

    existing,

    skipped,

    errors,

    nextCursor: cursor,
  };
}

/* =========================================================
   DISCOVER + IMPORT UNIVERSITY ACADEMICS
========================================================= */

export async function discoverAndImportUniversities({
  pages = 1,
  perPage = 10,
} = {}) {
  let cursor = "*";

  const statistics = {
    universitiesDiscovered: 0,

    universitiesCreated: 0,

    universitiesExisting: 0,

    universitiesSkipped: 0,

    universitiesFailed: 0,

    academicImportsStarted: 0,

    academicImportsCompleted: 0,

    academicImportsFailed: 0,

    facultiesCreated: 0,

    facultiesUpdated: 0,

    coursesCreated: 0,

    coursesUpdated: 0,
  };

  const universities = [];

  const errors = [];

  /* -------------------------------------------------------
     DISCOVER PAGES
  ------------------------------------------------------- */

  for (
    let page = 0;
    page < pages;
    page++
  ) {
    console.log(
      "=============================================="
    );

    console.log(
      `🌍 UNIVERSITY DISCOVERY PAGE ${
        page + 1
      }/${pages}`
    );

    console.log(
      "=============================================="
    );

    const discovery =
      await discoverUniversityPage({
        cursor,
        perPage,
      });

    statistics.universitiesDiscovered +=
      discovery.statistics.discovered;

    statistics.universitiesCreated +=
      discovery.statistics.created;

    statistics.universitiesExisting +=
      discovery.statistics.existing;

    statistics.universitiesSkipped +=
      discovery.statistics.skipped;

    statistics.universitiesFailed +=
      discovery.statistics.failed;

    /*
     * Both new and existing universities
     * can have their academic structure imported.
     */

    const discoveredUniversities = [
      ...discovery.created,
      ...discovery.existing,
    ];

    /* -----------------------------------------------------
       IMPORT FACULTIES + COURSES
    ----------------------------------------------------- */

    for (
      const university of
      discoveredUniversities
    ) {
      if (!university?.id) {
        errors.push({
          university:
            university?.name ||
            "Unknown university",

          stage:
            "academic_import",

          error:
            "University ID is missing.",
        });

        continue;
      }

      statistics.academicImportsStarted++;

      try {
        console.log(
          `🎓 Importing faculties and courses for: ${university.name}`
        );

        /*
         * This is where the important academic
         * relationship begins:
         *
         * University
         *    ↓
         * Faculties belonging to that university
         *    ↓
         * Courses offered by that university
         *    ↓
         * Courses attached to the correct faculty
         */

        const academicResult =
          await importUniversityAcademics(
            university.id
          );

        statistics.academicImportsCompleted++;

        const academicStatistics =
          academicResult?.statistics ||
          {};

        statistics.facultiesCreated +=
          Number(
            academicStatistics
              .facultiesCreated || 0
          );

        statistics.facultiesUpdated +=
          Number(
            academicStatistics
              .facultiesUpdated || 0
          );

        statistics.coursesCreated +=
          Number(
            academicStatistics
              .coursesCreated || 0
          );

        statistics.coursesUpdated +=
          Number(
            academicStatistics
              .coursesUpdated || 0
          );

        universities.push({
          id:
            university.id,

          name:
            university.name,

          short_name:
            university.short_name,

          website:
            university.website,

          academicImport:
            academicResult,
        });

        console.log(
          `✅ Academic import completed: ${university.name}`
        );
      } catch (error) {
        statistics.academicImportsFailed++;

        console.error(
          `❌ Academic import failed for ${university.name}:`,
          error
        );

        errors.push({
          university:
            university.name,

          universityId:
            university.id,

          stage:
            "academic_import",

          error:
            error?.message ||
            String(error),
        });
      }
    }

    /* -----------------------------------------------------
       NEXT OPENALEX PAGE
    ----------------------------------------------------- */

    cursor =
      discovery.nextCursor;

    if (!cursor) {
      console.log(
        "🌍 No more OpenAlex pages available."
      );

      break;
    }
  }

  /* -------------------------------------------------------
     FINAL RESULT
  ------------------------------------------------------- */

  return {
    success: true,

    statistics,

    universities,

    errors,

    nextCursor: cursor,
  };
}
