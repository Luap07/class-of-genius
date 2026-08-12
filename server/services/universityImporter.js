import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

/* =========================================================
   LOAD ROOT .ENV
   server/services/universityImporter.js
   -> ../../.env
========================================================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_ENV = path.resolve(__dirname, "../../.env");

dotenv.config({
  path: ROOT_ENV,
  override: true,
});

/* =========================================================
   ENVIRONMENT
========================================================= */

const SUPABASE_URL = process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("==============================================");
console.log("🔐 UNIVERSITY IMPORTER");
console.log("==============================================");
console.log("ENV FILE:", ROOT_ENV);
console.log("URL loaded:", Boolean(SUPABASE_URL));
console.log(
  "Service role loaded:",
  Boolean(SUPABASE_SERVICE_ROLE_KEY)
);

if (SUPABASE_SERVICE_ROLE_KEY) {
  console.log(
    "Key type:",
    SUPABASE_SERVICE_ROLE_KEY.startsWith("sb_secret_")
      ? "SECRET"
      : SUPABASE_SERVICE_ROLE_KEY.startsWith(
          "sb_publishable_"
        )
      ? "PUBLISHABLE ❌"
      : "UNKNOWN"
  );
}

console.log("==============================================");

/* =========================================================
   VALIDATE ENVIRONMENT
========================================================= */

if (!SUPABASE_URL) {
  throw new Error(
    `SUPABASE_URL is missing.

Expected in:
${ROOT_ENV}`
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    `SUPABASE_SERVICE_ROLE_KEY is missing.

Expected in:
${ROOT_ENV}`
  );
}

if (
  SUPABASE_SERVICE_ROLE_KEY.startsWith(
    "sb_publishable_"
  )
) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is using a publishable key. Use the Supabase secret key (sb_secret_...) in the server .env."
  );
}

/* =========================================================
   SUPABASE SERVER CLIENT
========================================================= */

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
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

const OPENALEX_API =
  "https://api.openalex.org/institutions";

/* =========================================================
   UNIVERSITIES TO SKIP
========================================================= */

const SKIPPED_UNIVERSITIES = new Set([
  "university of michigan",
]);

function shouldSkipUniversity(name) {
  if (!name) {
    return false;
  }

  const normalized = String(name)
    .trim()
    .toLowerCase();

  return SKIPPED_UNIVERSITIES.has(normalized);
}

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const result = String(value)
    .replace(/\s+/g, " ")
    .trim();

  return result || null;
}

function normalizeUrl(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(String(value).trim());

    return url.origin;
  } catch {
    return null;
  }
}

/* =========================================================
   FETCH OPENALEX
========================================================= */

async function fetchOpenAlex({
  cursor = "*",
  perPage = 100,
  countryCode = null,
} = {}) {
  const params = new URLSearchParams();

  let filter = "type:education";

  if (countryCode) {
    filter += `,country_code:${String(
      countryCode
    )
      .trim()
      .toLowerCase()}`;
  }

  params.set("filter", filter);
  params.set("per-page", String(perPage));
  params.set("cursor", cursor);

  if (process.env.OPENALEX_MAILTO) {
    params.set(
      "mailto",
      process.env.OPENALEX_MAILTO
    );
  }

  const response = await fetch(
    `${OPENALEX_API}?${params.toString()}`
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `OpenAlex request failed: ${response.status} ${body}`
    );
  }

  return response.json();
}

/* =========================================================
   MAP OPENALEX INSTITUTION
========================================================= */

function mapInstitution(institution) {
  return {
    name: cleanText(
      institution?.display_name
    ),

    short_name: cleanText(
      institution?.display_name_acronyms?.join(
        " / "
      )
    ),

    description: null,

    logo_url: cleanText(
      institution?.image_url
    ),

    cover_url: null,

    image_url: cleanText(
      institution?.image_url
    ),

    website: normalizeUrl(
      institution?.homepage_url
    ),

    email: null,

    phone: null,

    address: null,

    city: cleanText(
      institution?.geo?.city
    ),

    state: cleanText(
      institution?.geo?.region
    ),

    country: cleanText(
      institution?.country?.display_name
    ),

    established_year: null,

    accreditation: null,

    ownership: null,

    type: "University",

    active: true,

    external_id: cleanText(
      institution?.id
    ),

    external_ror: cleanText(
      institution?.ids?.ror
    ),

    country_code:
      cleanText(
        institution?.country?.code
      )?.toUpperCase() || null,
  };
}

/* =========================================================
   FIND EXISTING UNIVERSITY
========================================================= */

async function findUniversity(university) {
  /* -------------------------------------------------------
     FIND BY WEBSITE
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     FIND BY NAME
  ------------------------------------------------------- */

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
   SAVE UNIVERSITY
========================================================= */

async function saveUniversity(university) {
  /* -------------------------------------------------------
     SAFETY CHECK
  ------------------------------------------------------- */

  if (!university?.name) {
    return {
      action: "skipped",
      university: null,
      reason: "Missing university name",
    };
  }

  /* -------------------------------------------------------
     NEVER IMPORT SKIPPED UNIVERSITIES
  ------------------------------------------------------- */

  if (
    shouldSkipUniversity(
      university.name
    )
  ) {
    console.log(
      `⏭️ Skipping university: ${university.name}`
    );

    return {
      action: "skipped",
      university: null,
      reason:
        "University is configured to be skipped",
    };
  }

  /* -------------------------------------------------------
     CHECK EXISTING UNIVERSITY
  ------------------------------------------------------- */

  const existing =
    await findUniversity(
      university
    );

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

  const payload = {
    name:
      university.name,

    short_name:
      university.short_name,

    description:
      university.description,

    logo_url:
      university.logo_url,

    cover_url:
      university.cover_url,

    image_url:
      university.image_url,

    website:
      university.website,

    email:
      university.email,

    phone:
      university.phone,

    address:
      university.address,

    city:
      university.city,

    state:
      university.state,

    country:
      university.country,

    established_year:
      university.established_year,

    accreditation:
      university.accreditation,

    ownership:
      university.ownership,

    type:
      university.type,

    active:
      university.active,

    created_at:
      now,

    updated_at:
      now,
  };

  const {
    data,
    error,
  } = await supabase
    .from("universities")
    .insert(payload)
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
   IMPORT ONE OPENALEX PAGE
========================================================= */

async function importUniversityPage({
  cursor = "*",
  perPage = 100,
} = {}) {
  const response =
    await fetchOpenAlex({
      cursor,
      perPage,
    });

  const institutions =
    response?.results || [];

  const statistics = {
    fetched:
      institutions.length,

    created: 0,

    existing: 0,

    skipped: 0,

    failed: 0,

    errors: [],
  };

  const created = [];

  const existing = [];

  const skipped = [];

  /* -------------------------------------------------------
     PROCESS INSTITUTIONS
  ------------------------------------------------------- */

  for (
    const institution of institutions
  ) {
    const institutionName =
      cleanText(
        institution?.display_name
      );

    /* -----------------------------------------------------
       SKIP UNIVERSITY OF MICHIGAN BEFORE ANY DB OPERATION
    ----------------------------------------------------- */

    if (
      shouldSkipUniversity(
        institutionName
      )
    ) {
      console.log(
        `⏭️ Automatically skipped: ${institutionName}`
      );

      statistics.skipped++;

      skipped.push({
        name:
          institutionName,

        reason:
          "University is configured to be skipped",
      });

      continue;
    }

    try {
      const university =
        mapInstitution(
          institution
        );

      /* ---------------------------------------------------
         MISSING NAME
      --------------------------------------------------- */

      if (!university.name) {
        statistics.skipped++;

        skipped.push({
          name: null,

          reason:
            "Missing university name",
        });

        continue;
      }

      /* ---------------------------------------------------
         SAVE
      --------------------------------------------------- */

      const result =
        await saveUniversity(
          university
        );

      /* ---------------------------------------------------
         CREATED
      --------------------------------------------------- */

      if (
        result.action ===
        "created"
      ) {
        statistics.created++;

        created.push(
          result.university
        );

        console.log(
          `✅ Created: ${university.name}`
        );

        continue;
      }

      /* ---------------------------------------------------
         EXISTING
      --------------------------------------------------- */

      if (
        result.action ===
        "existing"
      ) {
        statistics.existing++;

        existing.push(
          result.university
        );

        console.log(
          `ℹ️ Already exists: ${university.name}`
        );

        continue;
      }

      /* ---------------------------------------------------
         SKIPPED
      --------------------------------------------------- */

      statistics.skipped++;

      skipped.push({
        name:
          university.name,

        reason:
          result.reason ||
          "Unknown reason",
      });

      console.log(
        `⏭️ Skipped: ${university.name}`
      );
    } catch (error) {
      statistics.failed++;

      statistics.errors.push({
        university:
          institutionName,

        error:
          error?.message ||
          String(error),
      });

      console.error(
        `❌ Failed: ${institutionName}`,
        error?.message ||
          error
      );
    }
  }

  /* -------------------------------------------------------
     RETURN
  ------------------------------------------------------- */

  return {
    success: true,

    statistics,

    created,

    existing,

    skipped,

    nextCursor:
      response?.meta?.next_cursor ||
      null,
  };
}

/* =========================================================
   IMPORT MULTIPLE PAGES
========================================================= */

async function importUniversities({
  pages = 1,
  perPage = 100,
  cursor = "*",
} = {}) {
  let currentCursor =
    cursor;

  const statistics = {
    pagesRequested:
      Number(pages),

    pagesProcessed:
      0,

    fetched:
      0,

    created:
      0,

    existing:
      0,

    skipped:
      0,

    failed:
      0,
  };

  const created = [];

  const existing = [];

  const skipped = [];

  const errors = [];

  for (
    let page = 0;
    page < Number(pages);
    page++
  ) {
    console.log(
      "=============================================="
    );

    console.log(
      `🌍 Importing university page ${
        page + 1
      }/${pages}...`
    );

    console.log(
      "=============================================="
    );

    const result =
      await importUniversityPage({
        cursor:
          currentCursor,

        perPage,
      });

    statistics.pagesProcessed++;

    statistics.fetched +=
      Number(
        result.statistics?.fetched ||
          0
      );

    statistics.created +=
      Number(
        result.statistics?.created ||
          0
      );

    statistics.existing +=
      Number(
        result.statistics?.existing ||
          0
      );

    statistics.skipped +=
      Number(
        result.statistics?.skipped ||
          0
      );

    statistics.failed +=
      Number(
        result.statistics?.failed ||
          0
      );

    created.push(
      ...(result.created || [])
    );

    existing.push(
      ...(result.existing || [])
    );

    skipped.push(
      ...(result.skipped || [])
    );

    errors.push(
      ...(result.statistics
        ?.errors || [])
    );

    currentCursor =
      result.nextCursor;

    if (!currentCursor) {
      console.log(
        "🌍 No more OpenAlex pages."
      );

      break;
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
      currentCursor || null,
  };
}

/* =========================================================
   IMPORT UNIVERSITIES BY COUNTRY
========================================================= */

async function importUniversitiesByCountry({
  countryCode,
  pages = 1,
  perPage = 100,
} = {}) {
  if (!countryCode) {
    throw new Error(
      "countryCode is required."
    );
  }

  const normalizedCountry =
    String(countryCode)
      .trim()
      .toLowerCase();

  let cursor = "*";

  const statistics = {
    countryCode:
      normalizedCountry.toUpperCase(),

    pagesRequested:
      Number(pages),

    pagesProcessed:
      0,

    fetched:
      0,

    created:
      0,

    existing:
      0,

    skipped:
      0,

    failed:
      0,
  };

  const created = [];

  const existing = [];

  const skipped = [];

  const errors = [];

  for (
    let page = 0;
    page < Number(pages);
    page++
  ) {
    console.log(
      `🌍 Importing ${normalizedCountry.toUpperCase()} universities: page ${
        page + 1
      }/${pages}...`
    );

    const response =
      await fetchOpenAlex({
        cursor,

        perPage,

        countryCode:
          normalizedCountry,
      });

    const institutions =
      response?.results || [];

    statistics.pagesProcessed++;

    statistics.fetched +=
      institutions.length;

    for (
      const institution of institutions
    ) {
      const institutionName =
        cleanText(
          institution?.display_name
        );

      /* ---------------------------------------------------
         SKIP UNIVERSITY OF MICHIGAN
      --------------------------------------------------- */

      if (
        shouldSkipUniversity(
          institutionName
        )
      ) {
        console.log(
          `⏭️ Automatically skipped: ${institutionName}`
        );

        statistics.skipped++;

        skipped.push({
          name:
            institutionName,

          reason:
            "University is configured to be skipped",
        });

        continue;
      }

      try {
        const university =
          mapInstitution(
            institution
          );

        if (!university.name) {
          statistics.skipped++;

          skipped.push({
            name: null,

            reason:
              "Missing university name",
          });

          continue;
        }

        const result =
          await saveUniversity(
            university
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
            university.name,

          reason:
            result.reason ||
            "Unknown reason",
        });
      } catch (error) {
        statistics.failed++;

        errors.push({
          university:
            institutionName,

          error:
            error?.message ||
            String(error),
        });
      }
    }

    cursor =
      response?.meta?.next_cursor ||
      null;

    if (!cursor) {
      break;
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
      cursor || null,
  };
}

/* =========================================================
   EXPORTS
========================================================= */

export {
  importUniversityPage,
  importUniversities,
  importUniversitiesByCountry,
  mapInstitution,
  findUniversity,
  saveUniversity,
};