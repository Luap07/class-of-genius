import { createClient } from "@supabase/supabase-js";

/* =========================================================
   SUPABASE
========================================================= */

const supabaseUrl =
  process.env.SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "SUPABASE_URL is missing from .env"
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing from .env"
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
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
   HELPERS
========================================================= */

function cleanText(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const cleaned =
    String(value)
      .trim()
      .replace(/\s+/g, " ");

  return cleaned || null;
}

function normalizeName(value) {
  return cleanText(value);
}

function normalizeUrl(value) {
  if (!value) {
    return null;
  }

  try {
    const url =
      new URL(String(value).trim());

    return url.origin;
  } catch {
    return null;
  }
}

/* =========================================================
   OPENALEX REQUEST
========================================================= */

async function fetchOpenAlex({
  cursor = "*",
  perPage = 100,
}) {
  const params =
    new URLSearchParams();

  params.set(
    "per-page",
    String(perPage)
  );

  params.set(
    "cursor",
    cursor
  );

  if (
    process.env.OPENALEX_MAILTO
  ) {
    params.set(
      "mailto",
      process.env.OPENALEX_MAILTO
    );
  }

  const response =
    await fetch(
      `${OPENALEX_API}?${params.toString()}`
    );

  if (!response.ok) {
    const body =
      await response.text();

    throw new Error(
      `OpenAlex request failed: ${response.status} ${body}`
    );
  }

  return response.json();
}

/* =========================================================
   CONVERT OPENALEX UNIVERSITY
========================================================= */

function mapInstitution(
  institution
) {
  const name =
    normalizeName(
      institution.display_name
    );

  const website =
    normalizeUrl(
      institution.homepage_url
    );

  const country =
    cleanText(
      institution.country
        ?.display_name
    );

  const countryCode =
    cleanText(
      institution.country?.code
    )?.toUpperCase() ||
    null;

  const city =
    cleanText(
      institution.geo?.city
    );

  const state =
    cleanText(
      institution.geo?.region
    );

  return {
    name,

    short_name:
      cleanText(
        institution.display_name_acronyms
          ?.join(" / ")
      ),

    description: null,

    logo_url:
      cleanText(
        institution.image_url
      ),

    cover_url: null,

    image_url:
      cleanText(
        institution.image_url
      ),

    website,

    email: null,

    phone: null,

    address: null,

    city,

    state,

    country,

    established_year: null,

    accreditation: null,

    ownership: null,

    type: "University",

    active: true,

    external_source:
      "openalex",

    external_id:
      cleanText(
        institution.id
      ),

    external_ror:
      cleanText(
        institution.ids?.ror
      ),

    country_code:
      countryCode,
  };
}

/* =========================================================
   FIND EXISTING UNIVERSITY
========================================================= */

async function findUniversity(
  university
) {
  /*
    We first try the external identifier.
  */

  if (
    university.external_id
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from("universities")
        .select("*")
        .eq(
          "external_id",
          university.external_id
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
    Then try the website.
  */

  if (
    university.website
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from("universities")
        .select("*")
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
    Finally try the name.
  */

  if (university.name) {
    const {
      data,
      error,
    } =
      await supabase
        .from("universities")
        .select("*")
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
   UPDATE EXISTING UNIVERSITY
========================================================= */

async function updateUniversity(
  existing,
  incoming
) {
  /*
    Only populate useful values.

    Existing manually entered information
    should not be blindly destroyed by the
    importer.
  */

  const updates = {};

  const fields = [
    "name",
    "short_name",
    "description",
    "logo_url",
    "cover_url",
    "image_url",
    "website",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "country",
    "established_year",
    "accreditation",
    "ownership",
    "type",
    "active",
  ];

  for (const field of fields) {
    const incomingValue =
      incoming[field];

    const existingValue =
      existing[field];

    /*
      Only fill empty fields.

      This prevents the automatic
      importer from overwriting your
      manually curated university data.
    */

    if (
      (
        existingValue === null ||
        existingValue === undefined ||
        existingValue === ""
      ) &&
      incomingValue !== null &&
      incomingValue !== undefined &&
      incomingValue !== ""
    ) {
      updates[field] =
        incomingValue;
    }
  }

  /*
    Store external identifiers only
    if those columns exist in your
    database.

    They will be handled safely later
    when we confirm your schema.
  */

  if (
    Object.keys(updates).length === 0
  ) {
    return existing;
  }

  updates.updated_at =
    new Date().toISOString();

  const {
    data,
    error,
  } =
    await supabase
      .from("universities")
      .update(updates)
      .eq(
        "id",
        existing.id
      )
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}

/* =========================================================
   CREATE UNIVERSITY
========================================================= */

async function createUniversity(
  university
) {
  /*
    Only use columns that we know
    already exist in your university
    table.
  */

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
      new Date().toISOString(),

    updated_at:
      new Date().toISOString(),
  };

  const {
    data,
    error,
  } =
    await supabase
      .from("universities")
      .insert(payload)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}

/* =========================================================
   SAVE UNIVERSITY
========================================================= */

async function saveUniversity(
  university
) {
  const existing =
    await findUniversity(
      university
    );

  if (existing) {
    const updated =
      await updateUniversity(
        existing,
        university
      );

    return {
      action: "updated",
      university: updated,
    };
  }

  const created =
    await createUniversity(
      university
    );

  return {
    action: "created",
    university: created,
  };
}

/* =========================================================
   IMPORT PAGE
========================================================= */

export async function importUniversityPage({
  cursor = "*",
}) {
  const response =
    await fetchOpenAlex({
      cursor,
      perPage: 100,
    });

  const institutions =
    response.results || [];

  const statistics = {
    fetched:
      institutions.length,

    created: 0,

    updated: 0,

    skipped: 0,

    failed: 0,

    errors: [],
  };

  for (
    const institution
    of institutions
  ) {
    try {
      const university =
        mapInstitution(
          institution
        );

      if (!university.name) {
        statistics.skipped++;

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
      } else {
        statistics.updated++;
      }
    } catch (error) {
      statistics.failed++;

      statistics.errors.push({
        university:
          institution?.display_name ||
          null,

        error:
          error?.message ||
          String(error),
      });
    }
  }

  return {
    success: true,

    nextCursor:
      response.meta?.next_cursor ||
      null,

    statistics,
  };
}

/* =========================================================
   EXPORT
========================================================= */

export {
  mapInstitution,
  findUniversity,
  saveUniversity,
};