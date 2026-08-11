import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

/* =========================================================
   CLIENTS
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const result =
    String(value)
      .replace(/\s+/g, " ")
      .trim();

  return result || null;
}

function cleanUrl(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).href;
  } catch {
    return null;
  }
}

function normalizeName(value) {
  return cleanText(value)
    ?.toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .trim();
}

/* =========================================================
   FETCH PAGE
========================================================= */

async function fetchPage(url) {
  const response =
    await fetch(url, {
      headers: {
        "User-Agent":
          "Scholiqen University Academic Importer/1.0",
        Accept:
          "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status}`
    );
  }

  return response.text();
}

/* =========================================================
   HTML → TEXT
========================================================= */

function htmlToText(html) {
  return html
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<noscript[\s\S]*?<\/noscript>/gi,
      " "
    )
    .replace(
      /<svg[\s\S]*?<\/svg>/gi,
      " "
    )
    .replace(
      /<[^>]+>/g,
      " "
    )
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

/* =========================================================
   DISCOVER LINKS
========================================================= */

function extractLinks(
  html,
  baseUrl
) {
  const links = [];

  const regex =
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while (
    (match = regex.exec(html))
  ) {
    const href =
      match[1];

    const label =
      htmlToText(
        match[2]
      );

    if (!href) {
      continue;
    }

    try {
      const absolute =
        new URL(
          href,
          baseUrl
        );

      if (
        absolute.protocol !==
          "http:" &&
        absolute.protocol !==
          "https:"
      ) {
        continue;
      }

      links.push({
        url:
          absolute.href,
        label:
          cleanText(label),
      });
    } catch {
      // Ignore malformed links.
    }
  }

  return links;
}

/* =========================================================
   LINK SCORING
========================================================= */

function scoreAcademicLink(
  link
) {
  const value =
    `${link.label || ""} ${link.url || ""}`
      .toLowerCase();

  let score = 0;

  const keywords = [
    "faculty",
    "faculties",
    "school",
    "schools",
    "college",
    "colleges",
    "academic",
    "academics",
    "program",
    "programmes",
    "programs",
    "degree",
    "courses",
    "departments",
    "department",
  ];

  for (
    const keyword of keywords
  ) {
    if (
      value.includes(keyword)
    ) {
      score += 1;
    }
  }

  return score;
}

/* =========================================================
   FIND ACADEMIC PAGES
========================================================= */

async function discoverAcademicPages(
  website
) {
  const homepage =
    cleanUrl(website);

  if (!homepage) {
    throw new Error(
      "University website is invalid."
    );
  }

  const html =
    await fetchPage(
      homepage
    );

  const links =
    extractLinks(
      html,
      homepage
    );

  const ranked =
    links
      .map((link) => ({
        ...link,
        score:
          scoreAcademicLink(
            link
          ),
      }))
      .filter(
        (link) =>
          link.score > 0
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );

  /*
    Keep the homepage first,
    followed by the most relevant
    academic pages.
  */

  return [
    {
      url: homepage,
      label: "University Homepage",
    },
    ...ranked.slice(0, 15),
  ];
}

/* =========================================================
   BUILD ACADEMIC DOCUMENT
========================================================= */

async function buildAcademicDocument(
  pages
) {
  const documents = [];

  for (
    const page of pages
  ) {
    try {
      const html =
        await fetchPage(
          page.url
        );

      const text =
        htmlToText(html);

      if (
        text.length < 100
      ) {
        continue;
      }

      documents.push({
        url:
          page.url,

        title:
          page.label,

        content:
          text.slice(
            0,
            50000
          ),
      });
    } catch (error) {
      console.warn(
        `⚠️ Could not read ${page.url}:`,
        error.message
      );
    }
  }

  return documents;
}

/* =========================================================
   AI EXTRACTION
========================================================= */

async function extractAcademicStructure({
  university,
  documents,
}) {
  if (
    !documents.length
  ) {
    throw new Error(
      "No readable university academic pages were found."
    );
  }

  const sourceText =
    documents
      .map(
        (document, index) =>
          `
SOURCE ${index + 1}

URL:
${document.url}

TITLE:
${document.title}

CONTENT:
${document.content}
`
      )
      .join("\n\n");

  const prompt = `
You are extracting REAL academic programme information
for the university below.

UNIVERSITY:
${university.name}

WEBSITE:
${university.website || "Unknown"}

Your task is to identify the university's actual
schools/faculties and the programmes/courses offered
under each one.

IMPORTANT RULES:

1. Only extract information supported by the supplied
   source content.

2. Do NOT invent faculties.

3. Do NOT invent courses.

4. Do NOT use general knowledge to fill missing courses.

5. A course/programme must belong to the faculty/school
   where the source indicates it belongs.

6. If a faculty is mentioned but its courses cannot be
   established from the sources, include the faculty but
   return an empty courses array.

7. Do not include Scholiqen LMS courses.

8. Do not merge unrelated programmes simply because their
   names are similar.

9. Preserve the university's terminology where possible.

10. Include the source URL supporting each faculty and
    each course whenever available.

Return ONLY valid JSON matching this structure:

{
  "faculties": [
    {
      "name": "School or Faculty name",
      "short_name": null,
      "description": null,
      "source_url": null,
      "courses": [
        {
          "name": "Programme name",
          "short_name": null,
          "description": null,
          "degree_type": null,
          "duration": null,
          "study_mode": null,
          "admission_requirements": null,
          "source_url": null
        }
      ]
    }
  ]
}

SOURCE MATERIAL:

${sourceText}
`;

  const completion =
    await openai.chat.completions.create({
      model:
        "gpt-4o-mini",

      temperature:
        0,

      response_format: {
        type: "json_object",
      },

      messages: [
        {
          role:
            "system",
          content:
            "Extract only evidence-supported university academic data.",
        },

        {
          role:
            "user",
          content:
            prompt,
        },
      ],
    });

  const content =
    completion
      .choices?.[0]
      ?.message
      ?.content;

  if (!content) {
    throw new Error(
      "AI returned no academic data."
    );
  }

  try {
    return JSON.parse(
      content
    );
  } catch {
    throw new Error(
      "AI returned invalid JSON."
    );
  }
}

/* =========================================================
   FIND EXISTING FACULTY
========================================================= */

async function findFaculty({
  universityId,
  name,
}) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "school_faculties"
      )
      .select("*")
      .eq(
        "school_type",
        "university"
      )
      .eq(
        "school_id",
        universityId
      )
      .ilike(
        "name",
        name
      )
      .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

/* =========================================================
   CREATE OR UPDATE FACULTY
========================================================= */

async function saveFaculty({
  universityId,
  faculty,
}) {
  const existing =
    await findFaculty({
      universityId,
      name:
        faculty.name,
    });

  const payload = {
    school_type:
      "university",

    school_id:
      universityId,

    name:
      cleanText(
        faculty.name
      ),

    short_name:
      cleanText(
        faculty.short_name
      ),

    description:
      cleanText(
        faculty.description
      ),

    active:
      true,

    updated_at:
      new Date().toISOString(),
  };

  if (existing) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "school_faculties"
        )
        .update(
          payload
        )
        .eq(
          "id",
          existing.id
        )
        .select()
        .single();

    if (error) {
      throw error;
    }

    return {
      faculty:
        data,

      action:
        "updated",
    };
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "school_faculties"
      )
      .insert({
        ...payload,

        created_at:
          new Date().toISOString(),

        display_order:
          0,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return {
    faculty:
      data,

    action:
      "created",
  };
}

/* =========================================================
   FIND UNIVERSITY COURSE
========================================================= */

async function findUniversityCourse({
  universityId,
  facultyId,
  name,
}) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "university_courses"
      )
      .select("*")
      .eq(
        "university_id",
        universityId
      )
      .eq(
        "school_faculty_id",
        facultyId
      )
      .ilike(
        "name",
        name
      )
      .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

/* =========================================================
   SAVE UNIVERSITY COURSE
========================================================= */

async function saveUniversityCourse({
  universityId,
  facultyId,
  course,
}) {
  const existing =
    await findUniversityCourse({
      universityId,
      facultyId,
      name:
        course.name,
    });

  const payload = {
    university_id:
      universityId,

    school_faculty_id:
      facultyId,

    name:
      cleanText(
        course.name
      ),

    short_name:
      cleanText(
        course.short_name
      ),

    description:
      cleanText(
        course.description
      ),

    degree_type:
      cleanText(
        course.degree_type
      ),

    duration:
      cleanText(
        course.duration
      ),

    study_mode:
      cleanText(
        course.study_mode
      ),

    admission_requirements:
      cleanText(
        course.admission_requirements
      ),

    source_url:
      cleanUrl(
        course.source_url
      ),

    active:
      true,

    updated_at:
      new Date().toISOString(),
  };

  if (existing) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "university_courses"
        )
        .update(
          payload
        )
        .eq(
          "id",
          existing.id
        )
        .select()
        .single();

    if (error) {
      throw error;
    }

    return {
      course:
        data,

      action:
        "updated",
    };
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "university_courses"
      )
      .insert({
        ...payload,

        created_at:
          new Date().toISOString(),

        display_order:
          0,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return {
    course:
      data,

    action:
      "created",
  };
}

/* =========================================================
   IMPORT A UNIVERSITY
========================================================= */

export async function importUniversityAcademics(
  universityId
) {
  /*
    1. Get university
  */

  const {
    data:
      university,
    error:
      universityError,
  } =
    await supabase
      .from(
        "universities"
      )
      .select("*")
      .eq(
        "id",
        universityId
      )
      .single();

  if (universityError) {
    throw universityError;
  }

  if (!university) {
    throw new Error(
      "University not found."
    );
  }

  if (!university.website) {
    throw new Error(
      "This university does not have a website."
    );
  }

  /*
    2. Discover academic pages
  */

  const pages =
    await discoverAcademicPages(
      university.website
    );

  /*
    3. Read academic pages
  */

  const documents =
    await buildAcademicDocument(
      pages
    );

  /*
    4. Extract faculties + courses
  */

  const academicData =
    await extractAcademicStructure({
      university,
      documents,
    });

  const faculties =
    Array.isArray(
      academicData.faculties
    )
      ? academicData.faculties
      : [];

  const result = {
    university: {
      id:
        university.id,

      name:
        university.name,
    },

    faculties: [],

    statistics: {
      facultiesCreated:
        0,

      facultiesUpdated:
        0,

      coursesCreated:
        0,

      coursesUpdated:
        0,
    },
  };

  /*
    5. Save every faculty
  */

  for (
    const faculty
    of faculties
  ) {
    if (
      !cleanText(
        faculty.name
      )
    ) {
      continue;
    }

    const facultyResult =
      await saveFaculty({
        universityId:
          university.id,

        faculty,
      });

    if (
      facultyResult.action ===
      "created"
    ) {
      result.statistics
        .facultiesCreated++;
    } else {
      result.statistics
        .facultiesUpdated++;
    }

    const facultyRecord =
      facultyResult.faculty;

    const facultyOutput = {
      id:
        facultyRecord.id,

      name:
        facultyRecord.name,

      courses: [],
    };

    /*
      6. Save courses under
         THIS faculty
    */

    const courses =
      Array.isArray(
        faculty.courses
      )
        ? faculty.courses
        : [];

    for (
      const course
      of courses
    ) {
      if (
        !cleanText(
          course.name
        )
      ) {
        continue;
      }

      const courseResult =
        await saveUniversityCourse({
          universityId:
            university.id,

          facultyId:
            facultyRecord.id,

          course,
        });

      if (
        courseResult.action ===
        "created"
      ) {
        result.statistics
          .coursesCreated++;
      } else {
        result.statistics
          .coursesUpdated++;
      }

      facultyOutput.courses.push(
        {
          id:
            courseResult.course.id,

          name:
            courseResult.course.name,
        }
      );
    }

    result.faculties.push(
      facultyOutput
    );
  }

  return result;
}

/* =========================================================
   EXPORTS
========================================================= */

export {
  discoverAcademicPages,
  buildAcademicDocument,
  extractAcademicStructure,
  saveFaculty,
  saveUniversityCourse,
};