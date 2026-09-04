import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

/*
|--------------------------------------------------------------------------
| ENVIRONMENT
|--------------------------------------------------------------------------
*/

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
const NEON_DB_URL = process.env.DATABASE_URL;

if (!SUPABASE_DB_URL) {
  console.error("\n❌ SUPABASE_DB_URL is missing from .env\n");
  process.exit(1);
}

if (!NEON_DB_URL) {
  console.error("\n❌ DATABASE_URL is missing from .env\n");
  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| CONNECTION POOLS
|--------------------------------------------------------------------------
*/

const source = new Pool({
  connectionString: SUPABASE_DB_URL,

  ssl: {
    rejectUnauthorized: false,
  },

  max: 3,
  min: 0,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 30000,

  keepAlive: true,

  keepAliveInitialDelayMillis: 10000,
});

const target = new Pool({
  connectionString: NEON_DB_URL,

  ssl: {
    rejectUnauthorized: false,
  },

  max: 5,
  min: 0,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 30000,

  keepAlive: true,

  keepAliveInitialDelayMillis: 10000,
});

/*
|--------------------------------------------------------------------------
| POOL ERROR HANDLERS
|--------------------------------------------------------------------------
*/

source.on("error", (error) => {
  console.warn(
    `\n⚠️ Supabase pool error: ${error.message}`
  );
});

target.on("error", (error) => {
  console.warn(
    `\n⚠️ Neon pool error: ${error.message}`
  );
});

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const SOURCE_SCHEMA = "public";
const TARGET_SCHEMA = "public";

/*
 * Keep batches reasonably sized.
 *
 * JSON-heavy tables such as:
 *
 * - cbt_questions
 * - novels
 *
 * are still handled safely because JSON values are explicitly
 * serialized and cast during insertion.
 */
const BATCH_SIZE = 500;

/*
 * Retry temporary PostgreSQL/network failures.
 */
const MAX_RETRIES = 8;

const RETRY_BASE_DELAY = 1500;

/*
 * These tables are NEVER copied/replaced by this script.
 */
const PROTECTED_TABLES = new Set([
  "users",
]);

/*
|--------------------------------------------------------------------------
| EXCLUDED SCHEMAS
|--------------------------------------------------------------------------
*/

const EXCLUDED_SCHEMAS = new Set([
  "pg_catalog",
  "information_schema",
  "pg_toast",
  "pg_temp_1",
  "pg_toast_temp_1",

  // Supabase internal schemas
  "auth",
  "storage",
  "extensions",
  "realtime",
  "vault",
  "graphql",
  "graphql_public",
  "net",
  "cron",
  "supabase_functions",
  "pgbouncer",
]);

/*
|--------------------------------------------------------------------------
| EXCLUDED TABLES
|--------------------------------------------------------------------------
*/

const EXCLUDED_TABLES = new Set([
  "schema_migrations",
  "spatial_ref_sys",
]);

/*
|--------------------------------------------------------------------------
| GENERAL HELPERS
|--------------------------------------------------------------------------
*/

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const quoteIdentifier = (value) => {
  return `"${String(value).replaceAll('"', '""')}"`;
};

const quoteQualifiedName = (
  schema,
  table
) => {
  return `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
};

/*
|--------------------------------------------------------------------------
| RETRYABLE ERROR DETECTION
|--------------------------------------------------------------------------
*/

const isRetryableError = (error) => {
  if (!error) {
    return false;
  }

  const message = String(
    error.message || ""
  ).toLowerCase();

  const code = String(
    error.code || ""
  ).toUpperCase();

  const retryableCodes = new Set([
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "EAI_AGAIN",

    "57P01",
    "57P02",
    "57P03",

    "08000",
    "08001",
    "08003",
    "08004",
    "08006",
    "08007",
    "08009",
    "08016",
    "08020",
    "08030",
  ]);

  if (retryableCodes.has(code)) {
    return true;
  }

  return (
    message.includes(
      "connection terminated unexpectedly"
    ) ||
    message.includes(
      "connection terminated"
    ) ||
    message.includes(
      "connection reset"
    ) ||
    message.includes(
      "connection refused"
    ) ||
    message.includes(
      "connection timed out"
    ) ||
    message.includes(
      "timeout"
    ) ||
    message.includes(
      "eai_again"
    ) ||
    message.includes(
      "server closed the connection"
    ) ||
    message.includes(
      "socket hang up"
    )
  );
};

/*
|--------------------------------------------------------------------------
| RETRYABLE DATABASE QUERY
|--------------------------------------------------------------------------
*/

const queryWithRetry = async (
  pool,
  text,
  params = [],
  label = "database query"
) => {
  let lastError;

  for (
    let attempt = 1;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      return await pool.query(
        text,
        params
      );
    } catch (error) {
      lastError = error;

      const retryable =
        isRetryableError(error);

      if (
        !retryable ||
        attempt >= MAX_RETRIES
      ) {
        throw error;
      }

      const delay =
        RETRY_BASE_DELAY *
        Math.min(
          attempt,
          5
        );

      console.warn(
        `\n   ⚠️ ${label} failed`
      );

      console.warn(
        `      Attempt ${attempt}/${MAX_RETRIES}`
      );

      console.warn(
        `      ${error.message}`
      );

      console.warn(
        `      Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
};

/*
|--------------------------------------------------------------------------
| JSON HELPERS
|--------------------------------------------------------------------------
*/

/*
 * Detect JSON and JSONB columns.
 */
const isJsonColumn = (column) => {
  return (
    column.data_type === "json" ||
    column.data_type === "jsonb"
  );
};

/*
 * Return the PostgreSQL JSON type.
 *
 * json  -> json
 * jsonb -> jsonb
 */
const getJsonCast = (column) => {
  if (
    column.data_type === "jsonb"
  ) {
    return "::jsonb";
  }

  if (
    column.data_type === "json"
  ) {
    return "::json";
  }

  return "";
};

/*
|--------------------------------------------------------------------------
| SAFE JSON SERIALIZATION
|--------------------------------------------------------------------------
|
| This is the important fix.
|
| pg normally returns JSONB as JavaScript objects/arrays.
|
| Example:
|
| [
|   {
|     title: "Chapter 1"
|   }
| ]
|
| We explicitly convert that into a JSON string before sending
| it back to PostgreSQL.
|
*/

const sanitizeJsonValue = (
  value,
  column,
  context = {}
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  /*
   * Buffers are converted to UTF-8 strings.
   */
  if (Buffer.isBuffer(value)) {
    const bufferValue =
      value.toString("utf8");

    try {
      JSON.parse(bufferValue);

      return bufferValue;
    } catch {
      console.warn(
        `\n   ⚠️ Invalid JSON buffer detected`
      );

      console.warn(
        `      Table: ${
          context.table || "unknown"
        }`
      );

      console.warn(
        `      Column: ${
          column.column_name
        }`
      );

      if (
        context.offset !== undefined
      ) {
        console.warn(
          `      Source offset: ${
            context.offset
          }`
        );
      }

      return JSON.stringify(
        bufferValue
      );
    }
  }

  /*
   * JSON/JSONB returned from PostgreSQL is normally
   * already a JavaScript object or array.
   *
   * Explicitly stringify it.
   */
  if (
    typeof value === "object"
  ) {
    try {
      return JSON.stringify(
        value
      );
    } catch (error) {
      console.warn(
        `\n   ⚠️ Could not stringify JSON value`
      );

      console.warn(
        `      Table: ${
          context.table || "unknown"
        }`
      );

      console.warn(
        `      Column: ${
          column.column_name
        }`
      );

      console.warn(
        `      Error: ${
          error.message
        }`
      );

      throw error;
    }
  }

  /*
   * If PostgreSQL returned a string, determine whether
   * the string itself is valid JSON.
   */
  const stringValue =
    String(value);

  try {
    JSON.parse(
      stringValue
    );

    return stringValue;
  } catch {
    console.warn(
      `\n   ⚠️ Invalid JSON detected`
    );

    console.warn(
      `      Table: ${
        context.table || "unknown"
      }`
    );

    console.warn(
      `      Column: ${
        column.column_name
      }`
    );

    if (
      context.offset !== undefined
    ) {
      console.warn(
        `      Source offset: ${
          context.offset
        }`
      );
    }

    /*
     * Preserve the original text as a JSON string.
     *
     * Example:
     *
     * hello world
     *
     * becomes:
     *
     * "hello world"
     */
    return JSON.stringify(
      stringValue
    );
  }
};

/*
|--------------------------------------------------------------------------
| POSTGRES TYPE MAPPING
|--------------------------------------------------------------------------
*/

const mapArrayType = (
  udtName
) => {
  const type = String(
    udtName || ""
  ).replace(/^_/, "");

  const map = {
    text: "TEXT[]",
    varchar: "VARCHAR[]",
    bpchar: "CHAR[]",

    int2: "SMALLINT[]",
    int4: "INTEGER[]",
    int8: "BIGINT[]",

    numeric: "NUMERIC[]",

    float4: "REAL[]",
    float8: "DOUBLE PRECISION[]",

    bool: "BOOLEAN[]",

    uuid: "UUID[]",

    json: "JSON[]",
    jsonb: "JSONB[]",

    date: "DATE[]",

    timestamp: "TIMESTAMP[]",
    timestamptz: "TIMESTAMPTZ[]",

    time: "TIME[]",
    timetz: "TIMETZ[]",
  };

  return (
    map[type] ||
    "TEXT[]"
  );
};

const mapPostgresType = (
  column
) => {
  const {
    data_type,
    udt_name,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
  } = column;

  if (
    data_type === "ARRAY"
  ) {
    return mapArrayType(
      udt_name
    );
  }

  if (
    data_type ===
    "USER-DEFINED"
  ) {
    return "TEXT";
  }

  if (
    data_type === "json"
  ) {
    return "JSON";
  }

  if (
    data_type === "jsonb"
  ) {
    return "JSONB";
  }

  if (
    data_type === "uuid"
  ) {
    return "UUID";
  }

  if (
    data_type === "boolean"
  ) {
    return "BOOLEAN";
  }

  if (
    data_type === "smallint"
  ) {
    return "SMALLINT";
  }

  if (
    data_type === "integer"
  ) {
    return "INTEGER";
  }

  if (
    data_type === "bigint"
  ) {
    return "BIGINT";
  }

  if (
    data_type === "numeric" ||
    data_type === "decimal"
  ) {
    if (
      numeric_precision !==
        null &&
      numeric_scale !== null
    ) {
      return `NUMERIC(${numeric_precision},${numeric_scale})`;
    }

    return "NUMERIC";
  }

  if (
    data_type === "real"
  ) {
    return "REAL";
  }

  if (
    data_type ===
    "double precision"
  ) {
    return "DOUBLE PRECISION";
  }

  if (
    data_type === "date"
  ) {
    return "DATE";
  }

  if (
    data_type ===
    "timestamp without time zone"
  ) {
    return "TIMESTAMP";
  }

  if (
    data_type ===
    "timestamp with time zone"
  ) {
    return "TIMESTAMPTZ";
  }

  if (
    data_type ===
    "time without time zone"
  ) {
    return "TIME";
  }

  if (
    data_type ===
    "time with time zone"
  ) {
    return "TIMETZ";
  }

  if (
    data_type === "interval"
  ) {
    return "INTERVAL";
  }

  if (
    data_type === "bytea"
  ) {
    return "BYTEA";
  }

  if (
    data_type === "text"
  ) {
    return "TEXT";
  }

  if (
    data_type ===
      "character varying" ||
    data_type === "varchar"
  ) {
    return character_maximum_length
      ? `VARCHAR(${character_maximum_length})`
      : "TEXT";
  }

  if (
    data_type ===
    "character"
  ) {
    return character_maximum_length
      ? `CHAR(${character_maximum_length})`
      : "CHAR";
  }

  return "TEXT";
};

/*
|--------------------------------------------------------------------------
| DEFAULT VALUE MAPPING
|--------------------------------------------------------------------------
*/

const mapColumnDefault = (
  column
) => {
  const value =
    column.column_default;

  if (!value) {
    return null;
  }

  const defaultValue =
    String(value);

  if (
    defaultValue.includes(
      "gen_random_uuid()"
    )
  ) {
    return "gen_random_uuid()";
  }

  if (
    defaultValue.includes(
      "uuid_generate_v4()"
    )
  ) {
    return "gen_random_uuid()";
  }

  if (
    defaultValue.includes(
      "CURRENT_TIMESTAMP"
    ) ||
    defaultValue.includes(
      "now()"
    )
  ) {
    return "NOW()";
  }

  if (
    defaultValue === "true" ||
    defaultValue === "false"
  ) {
    return defaultValue.toUpperCase();
  }

  if (
    /^-?\d+(\.\d+)?$/.test(
      defaultValue
    )
  ) {
    return defaultValue;
  }

  if (
    defaultValue.startsWith("'") &&
    defaultValue.endsWith("'")
  ) {
    return defaultValue;
  }

  if (
    defaultValue.includes(
      "nextval("
    )
  ) {
    return null;
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| DISCOVER TABLES
|--------------------------------------------------------------------------
*/

const getTables = async () => {
  const result =
    await queryWithRetry(
      source,
      `
        SELECT
          table_schema,
          table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
          AND table_schema = $1
        ORDER BY table_schema, table_name;
      `,
      [SOURCE_SCHEMA],
      "discover tables"
    );

  return result.rows.filter(
    (table) => {
      if (
        EXCLUDED_SCHEMAS.has(
          table.table_schema
        )
      ) {
        return false;
      }

      if (
        EXCLUDED_TABLES.has(
          table.table_name
        )
      ) {
        return false;
      }

      return true;
    }
  );
};

/*
|--------------------------------------------------------------------------
| COLUMNS
|--------------------------------------------------------------------------
*/

const getColumns = async (
  schema,
  table
) => {
  const result =
    await queryWithRetry(
      source,
      `
        SELECT
          column_name,
          data_type,
          udt_name,
          character_maximum_length,
          numeric_precision,
          numeric_scale,
          is_nullable,
          column_default,
          ordinal_position
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = $2
        ORDER BY ordinal_position;
      `,
      [schema, table],
      `get columns for ${schema}.${table}`
    );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| PRIMARY KEYS
|--------------------------------------------------------------------------
*/

const getPrimaryKeys = async (
  schema,
  table
) => {
  const result =
    await queryWithRetry(
      source,
      `
        SELECT
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
          AND tc.table_name = kcu.table_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = $1
          AND tc.table_name = $2
        ORDER BY kcu.ordinal_position;
      `,
      [schema, table],
      `get primary keys for ${schema}.${table}`
    );

  return result.rows.map(
    (row) =>
      row.column_name
  );
};

/*
|--------------------------------------------------------------------------
| FOREIGN KEYS
|--------------------------------------------------------------------------
*/

const getForeignKeys = async (
  schema,
  table
) => {
  const result =
    await queryWithRetry(
      source,
      `
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
          AND tc.table_name = kcu.table_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = $1
          AND tc.table_name = $2
        ORDER BY
          tc.constraint_name,
          kcu.ordinal_position;
      `,
      [schema, table],
      `get foreign keys for ${schema}.${table}`
    );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

const getIndexes = async (
  schema,
  table
) => {
  const result =
    await queryWithRetry(
      source,
      `
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = $1
          AND tablename = $2
        ORDER BY indexname;
      `,
      [schema, table],
      `get indexes for ${schema}.${table}`
    );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| CHECK CONSTRAINTS
|--------------------------------------------------------------------------
*/

const getCheckConstraints =
  async (
    schema,
    table
  ) => {
    const result =
      await queryWithRetry(
        source,
        `
          SELECT
            tc.constraint_name,
            cc.check_clause
          FROM information_schema.table_constraints tc
          JOIN information_schema.check_constraints cc
            ON tc.constraint_name = cc.constraint_name
            AND tc.constraint_schema = cc.constraint_schema
          WHERE tc.constraint_type = 'CHECK'
            AND tc.table_schema = $1
            AND tc.table_name = $2
          ORDER BY tc.constraint_name;
        `,
        [schema, table],
        `get check constraints for ${schema}.${table}`
      );

    return result.rows;
  };

/*
|--------------------------------------------------------------------------
| SCHEMA / TABLE HELPERS
|--------------------------------------------------------------------------
*/

const createSchema = async (
  schema
) => {
  await queryWithRetry(
    target,
    `
      CREATE SCHEMA IF NOT EXISTS
      ${quoteIdentifier(schema)};
    `,
    [],
    `create schema ${schema}`
  );
};

const tableExists = async (
  pool,
  schema,
  table
) => {
  const result =
    await queryWithRetry(
      pool,
      `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = $1
            AND table_name = $2
        ) AS exists;
      `,
      [schema, table],
      `check table ${schema}.${table}`
    );

  return Boolean(
    result.rows[0]?.exists
  );
};

const getTargetColumns = async (
  schema,
  table
) => {
  const result =
    await queryWithRetry(
      target,
      `
        SELECT
          column_name
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = $2
        ORDER BY ordinal_position;
      `,
      [schema, table],
      `get target columns for ${schema}.${table}`
    );

  return result.rows.map(
    (row) =>
      row.column_name
  );
};

/*
|--------------------------------------------------------------------------
| TARGET COLUMN TYPES
|--------------------------------------------------------------------------
|
| Used for diagnostics.
|--------------------------------------------------------------------------
*/

const getTargetColumnMetadata =
  async (
    schema,
    table
  ) => {
    const result =
      await queryWithRetry(
        target,
        `
          SELECT
            column_name,
            data_type,
            udt_name
          FROM information_schema.columns
          WHERE table_schema = $1
            AND table_name = $2
          ORDER BY ordinal_position;
        `,
        [schema, table],
        `get target column metadata for ${schema}.${table}`
      );

    return result.rows;
  };

/*
|--------------------------------------------------------------------------
| CREATE TABLE
|--------------------------------------------------------------------------
*/

const createTable = async ({
  schema,
  table,
  columns,
  primaryKeys,
}) => {
  const exists =
    await tableExists(
      target,
      schema,
      table
    );

  if (exists) {
    console.log(
      `   ✓ ${schema}.${table} already exists`
    );

    return;
  }

  const definitions = [];

  for (const column of columns) {
    const type =
      mapPostgresType(column);

    const nullable =
      column.is_nullable ===
      "NO"
        ? "NOT NULL"
        : "";

    const mappedDefault =
      mapColumnDefault(column);

    const defaultSql =
      mappedDefault
        ? `DEFAULT ${mappedDefault}`
        : "";

    definitions.push(
      [
        quoteIdentifier(
          column.column_name
        ),
        type,
        defaultSql,
        nullable,
      ]
        .filter(Boolean)
        .join(" ")
    );
  }

  if (
    primaryKeys.length > 0
  ) {
    definitions.push(
      `PRIMARY KEY (${primaryKeys
        .map(quoteIdentifier)
        .join(", ")})`
    );
  }

  const sql = `
    CREATE TABLE
    ${quoteQualifiedName(
      schema,
      table
    )}
    (
      ${definitions.join(
        ",\n      "
      )}
    );
  `;

  await queryWithRetry(
    target,
    sql,
    [],
    `create table ${schema}.${table}`
  );

  console.log(
    `   ✓ Created ${schema}.${table}`
  );
};

/*
|--------------------------------------------------------------------------
| ADD MISSING COLUMNS
|--------------------------------------------------------------------------
*/

const addMissingColumns =
  async ({
    schema,
    table,
    columns,
  }) => {
    const exists =
      await tableExists(
        target,
        schema,
        table
      );

    if (!exists) {
      return;
    }

    const existingColumns =
      await getTargetColumns(
        schema,
        table
      );

    for (const column of columns) {
      if (
        existingColumns.includes(
          column.column_name
        )
      ) {
        continue;
      }

      const type =
        mapPostgresType(column);

      const sql = `
        ALTER TABLE
        ${quoteQualifiedName(
          schema,
          table
        )}
        ADD COLUMN
        ${quoteIdentifier(
          column.column_name
        )}
        ${type};
      `;

      try {
        await queryWithRetry(
          target,
          sql,
          [],
          `add column ${schema}.${table}.${column.column_name}`
        );

        console.log(
          `   + Added column ${column.column_name}`
        );
      } catch (error) {
        console.warn(
          `   ⚠️ Could not add column ${column.column_name}: ${error.message}`
        );
      }
    }
  };

/*
|--------------------------------------------------------------------------
| CHECK TARGET TYPES
|--------------------------------------------------------------------------
|
| We do NOT automatically alter columns.
|
| This protects existing Neon data.
|
| Instead, we report differences.
|--------------------------------------------------------------------------
*/

const checkColumnTypes = async ({
  schema,
  table,
  sourceColumns,
}) => {
  const targetColumns =
    await getTargetColumnMetadata(
      schema,
      table
    ).catch(() => []);

  if (
    !targetColumns.length
  ) {
    return;
  }

  const targetMap =
    new Map(
      targetColumns.map(
        (column) => [
          column.column_name,
          column,
        ]
      )
    );

  for (const sourceColumn of sourceColumns) {
    const targetColumn =
      targetMap.get(
        sourceColumn.column_name
      );

    if (!targetColumn) {
      continue;
    }

    const sourceType =
      String(
        sourceColumn.data_type
      ).toLowerCase();

    const targetType =
      String(
        targetColumn.data_type
      ).toLowerCase();

    /*
     * Ignore equivalent timestamp naming differences.
     */
    const normalizedSource =
      sourceType ===
      "timestamp without time zone"
        ? "timestamp"
        : sourceType;

    const normalizedTarget =
      targetType ===
      "timestamp without time zone"
        ? "timestamp"
        : targetType;

    if (
      normalizedSource !==
      normalizedTarget
    ) {
      console.warn(
        `   ⚠️ TYPE DIFFERENCE: ${table}.${sourceColumn.column_name}`
      );

      console.warn(
        `      Supabase: ${sourceColumn.data_type} (${sourceColumn.udt_name})`
      );

      console.warn(
        `      Neon:     ${targetColumn.data_type} (${targetColumn.udt_name})`
      );
    }
  }
};

/*
|--------------------------------------------------------------------------
| COUNT
|--------------------------------------------------------------------------
*/

const countRows = async (
  pool,
  schema,
  table
) => {
  const result =
    await queryWithRetry(
      pool,
      `
        SELECT COUNT(*)::BIGINT AS count
        FROM ${quoteQualifiedName(
          schema,
          table
        )};
      `,
      [],
      `count ${schema}.${table}`
    );

  return Number(
    result.rows[0].count
  );
};

/*
|--------------------------------------------------------------------------
| FETCH PAGE
|--------------------------------------------------------------------------
*/

const fetchRowsPage = async ({
  schema,
  table,
  columns,
  offset,
  limit,
}) => {
  const columnNames =
    columns
      .map((column) =>
        quoteIdentifier(
          column.column_name
        )
      )
      .join(", ");

  const result =
    await queryWithRetry(
      source,
      `
        SELECT ${columnNames}
        FROM ${quoteQualifiedName(
          schema,
          table
        )}
        OFFSET $1
        LIMIT $2;
      `,
      [offset, limit],
      `fetch ${schema}.${table} offset ${offset}`
    );

  return result.rows;
};

/*
|--------------------------------------------------------------------------
| PREPARE ROW
|--------------------------------------------------------------------------
*/

const prepareRow = ({
  row,
  columns,
  table,
  offset,
}) => {
  const prepared = {};

  for (const column of columns) {
    let value =
      row[column.column_name];

    if (
      isJsonColumn(column) &&
      value !== null &&
      value !== undefined
    ) {
      value =
        sanitizeJsonValue(
          value,
          column,
          {
            table,
            offset,
          }
        );
    }

    prepared[
      column.column_name
    ] = value;
  }

  return prepared;
};

/*
|--------------------------------------------------------------------------
| INSERT BATCH
|--------------------------------------------------------------------------
|
| IMPORTANT JSON FIX:
|
| JSON/JSONB parameters receive explicit PostgreSQL casts:
|
| $5::jsonb
|
| instead of simply:
|
| $5
|
|--------------------------------------------------------------------------
*/

const insertBatch = async ({
  schema,
  table,
  columns,
  rows,
  offset,
}) => {
  if (!rows.length) {
    return;
  }

  const columnNames =
    columns
      .map((column) =>
        quoteIdentifier(
          column.column_name
        )
      )
      .join(", ");

  const values = [];

  const placeholders = [];

  let parameterIndex = 1;

  for (
    let rowIndex = 0;
    rowIndex < rows.length;
    rowIndex++
  ) {
    const originalRow =
      rows[rowIndex];

    const row =
      prepareRow({
        row: originalRow,
        columns,
        table,
        offset:
          offset + rowIndex,
      });

    const rowPlaceholders = [];

    for (const column of columns) {
      const value =
        row[
          column.column_name
        ];

      values.push(value);

      /*
       * Explicitly cast JSON / JSONB parameters.
       */
      const cast =
        isJsonColumn(column)
          ? getJsonCast(column)
          : "";

      rowPlaceholders.push(
        `$${parameterIndex}${cast}`
      );

      parameterIndex++;
    }

    placeholders.push(
      `(${rowPlaceholders.join(
        ", "
      )})`
    );
  }

  const sql = `
    INSERT INTO
    ${quoteQualifiedName(
      schema,
      table
    )}
    (${columnNames})
    VALUES
    ${placeholders.join(
      ",\n"
    )}
    ON CONFLICT DO NOTHING;
  `;

  try {
    await queryWithRetry(
      target,
      sql,
      values,
      `insert batch ${table} offset ${offset}`
    );
  } catch (error) {
    /*
     * Add useful diagnostics.
     */
    console.warn(
      `\n   ⚠️ INSERT BATCH ERROR`
    );

    console.warn(
      `      Table: ${table}`
    );

    console.warn(
      `      Source offset: ${offset}`
    );

    console.warn(
      `      Rows in batch: ${rows.length}`
    );

    console.warn(
      `      Error: ${error.message}`
    );

    /*
     * Identify JSON columns in the batch.
     */
    const jsonColumns =
      columns.filter(
        isJsonColumn
      );

    if (
      jsonColumns.length
    ) {
      console.warn(
        `      JSON columns: ${jsonColumns
          .map(
            (column) =>
              `${column.column_name}:${column.data_type}`
          )
          .join(", ")}`
      );
    }

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| FALLBACK ROW-BY-ROW INSERT
|--------------------------------------------------------------------------
*/

const insertRowsSafely =
  async ({
    schema,
    table,
    columns,
    rows,
    offset,
  }) => {
    try {
      await insertBatch({
        schema,
        table,
        columns,
        rows,
        offset,
      });

      return rows.length;
    } catch (batchError) {
      console.warn(
        `\n   ⚠️ Batch insert failed for ${table}`
      );

      console.warn(
        `      ${batchError.message}`
      );

      console.warn(
        `      Retrying rows individually...`
      );

      let successful = 0;

      for (
        let index = 0;
        index < rows.length;
        index++
      ) {
        const currentOffset =
          offset + index;

        try {
          await insertBatch({
            schema,
            table,
            columns,
            rows: [
              rows[index],
            ],
            offset:
              currentOffset,
          });

          successful++;
        } catch (rowError) {
          console.warn(
            `\n   ⚠️ Skipped row at source offset ${currentOffset}`
          );

          console.warn(
            `      Table: ${table}`
          );

          console.warn(
            `      Error: ${rowError.message}`
          );

          /*
           * Inspect JSON fields from the failing row.
           */
          const jsonColumns =
            columns.filter(
              isJsonColumn
            );

          for (
            const column of jsonColumns
          ) {
            const value =
              rows[index][
                column.column_name
              ];

            if (
              value === null ||
              value === undefined
            ) {
              continue;
            }

            console.warn(
              `      JSON column: ${column.column_name}`
            );

            try {
              const serialized =
                sanitizeJsonValue(
                  value,
                  column,
                  {
                    table,
                    offset:
                      currentOffset,
                  }
                );

              console.warn(
                `      JSON value length: ${
                  serialized
                    ? String(
                        serialized
                      ).length
                    : 0
                }`
              );
            } catch (jsonError) {
              console.warn(
                `      JSON serialization error: ${jsonError.message}`
              );
            }
          }
        }
      }

      return successful;
    }
  };

/*
|--------------------------------------------------------------------------
| MIGRATE TABLE
|--------------------------------------------------------------------------
*/

const migrateTable =
  async ({
    schema,
    table,
    columns,
  }) => {
    console.log(
      `\n📦 Migrating ${schema}.${table}`
    );

    /*
     * Protected users table.
     */
    if (
      schema ===
        TARGET_SCHEMA &&
      PROTECTED_TABLES.has(
        table
      )
    ) {
      console.log(
        `   🔒 PROTECTED TABLE — skipped`
      );

      return {
        schema,
        table,
        sourceCount: null,
        targetCount:
          await countRows(
            target,
            schema,
            table
          ).catch(() => 0),
        migrated: false,
        skipped: true,
      };
    }

    const sourceCount =
      await countRows(
        source,
        schema,
        table
      );

    console.log(
      `   Source records: ${sourceCount}`
    );

    if (
      sourceCount === 0
    ) {
      console.log(
        `   ✓ Empty table`
      );

      return {
        schema,
        table,
        sourceCount: 0,
        targetCount: 0,
        migrated: true,
        skipped: false,
      };
    }

    /*
     * Make sure missing columns exist.
     */
    await addMissingColumns({
      schema,
      table,
      columns,
    });

    /*
     * Check source/target types without automatically
     * altering existing Neon columns.
     */
    await checkColumnTypes({
      schema,
      table,
      sourceColumns:
        columns,
    });

    let existingTargetCount =
      0;

    try {
      existingTargetCount =
        await countRows(
          target,
          schema,
          table
        );
    } catch {
      existingTargetCount =
        0;
    }

    console.log(
      `   Existing Neon records: ${existingTargetCount}`
    );

    let migrated = 0;

    for (
      let offset = 0;
      offset < sourceCount;
      offset += BATCH_SIZE
    ) {
      let rows;

      /*
       * Fetch source page.
       */
      try {
        rows =
          await fetchRowsPage({
            schema,
            table,
            columns,
            offset,
            limit:
              BATCH_SIZE,
          });
      } catch (error) {
        console.error(
          `\n   ❌ Could not fetch ${table} at offset ${offset}`
        );

        console.error(
          `      ${error.message}`
        );

        throw error;
      }

      if (!rows.length) {
        break;
      }

      const inserted =
        await insertRowsSafely({
          schema,
          table,
          columns,
          rows,
          offset,
        });

      migrated +=
        inserted;

      const percentage =
        sourceCount > 0
          ? Math.min(
              100,
              Math.round(
                ((offset +
                  rows.length) /
                  sourceCount) *
                  100
              )
            )
          : 100;

      console.log(
        `   ${offset + rows.length}/${sourceCount} (${percentage}%)`
      );

      /*
       * Small pause to avoid hammering Supabase.
       */
      await sleep(25);
    }

    const targetCount =
      await countRows(
        target,
        schema,
        table
      );

    console.log(
      `   ✓ Neon records: ${targetCount}`
    );

    return {
      schema,
      table,
      sourceCount,
      targetCount,
      migrated,
      skipped: false,
    };
  };

/*
|--------------------------------------------------------------------------
| FOREIGN KEYS
|--------------------------------------------------------------------------
*/

const createForeignKeys =
  async ({
    schema,
    table,
    foreignKeys,
  }) => {
    if (
      !foreignKeys.length
    ) {
      return;
    }

    const grouped =
      new Map();

    for (const fk of foreignKeys) {
      if (
        !grouped.has(
          fk.constraint_name
        )
      ) {
        grouped.set(
          fk.constraint_name,
          []
        );
      }

      grouped
        .get(
          fk.constraint_name
        )
        .push(fk);
    }

    for (
      const [
        constraintName,
        rows,
      ] of grouped
    ) {
      const localColumns =
        rows.map(
          (row) =>
            row.column_name
        );

      const foreignColumns =
        rows.map(
          (row) =>
            row.foreign_column_name
        );

      const foreignSchema =
        rows[0]
          .foreign_table_schema;

      const foreignTable =
        rows[0]
          .foreign_table_name;

      if (
        EXCLUDED_SCHEMAS.has(
          foreignSchema
        )
      ) {
        console.log(
          `   ⚠️ Skipping FK ${constraintName} → internal schema ${foreignSchema}`
        );

        continue;
      }

      const referencedExists =
        await tableExists(
          target,
          foreignSchema,
          foreignTable
        );

      if (
        !referencedExists
      ) {
        console.log(
          `   ⚠️ Skipping FK ${constraintName}: referenced table ${foreignSchema}.${foreignTable} does not exist`
        );

        continue;
      }

      const constraintExists =
        await queryWithRetry(
          target,
          `
            SELECT EXISTS (
              SELECT 1
              FROM information_schema.table_constraints
              WHERE constraint_schema = $1
                AND table_name = $2
                AND constraint_name = $3
            ) AS exists;
          `,
          [
            schema,
            table,
            constraintName,
          ],
          `check FK ${constraintName}`
        );

      if (
        constraintExists
          .rows[0]?.exists
      ) {
        continue;
      }

      const sql = `
        ALTER TABLE
        ${quoteQualifiedName(
          schema,
          table
        )}
        ADD CONSTRAINT
        ${quoteIdentifier(
          constraintName
        )}
        FOREIGN KEY (
          ${localColumns
            .map(
              quoteIdentifier
            )
            .join(", ")}
        )
        REFERENCES
        ${quoteQualifiedName(
          foreignSchema,
          foreignTable
        )}
        (
          ${foreignColumns
            .map(
              quoteIdentifier
            )
            .join(", ")}
        );
      `;

      try {
        await queryWithRetry(
          target,
          sql,
          [],
          `create FK ${constraintName}`
        );

        console.log(
          `   ✓ FK ${constraintName}`
        );
      } catch (error) {
        console.warn(
          `   ⚠️ FK ${constraintName} could not be created: ${error.message}`
        );
      }
    }
  };

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

const createIndexes =
  async ({
    schema,
    table,
    indexes,
  }) => {
    if (
      !indexes.length
    ) {
      return;
    }

    for (const index of indexes) {
      if (
        index.indexname.endsWith(
          "_pkey"
        )
      ) {
        continue;
      }

      const exists =
        await queryWithRetry(
          target,
          `
            SELECT EXISTS (
              SELECT 1
              FROM pg_indexes
              WHERE schemaname = $1
                AND tablename = $2
                AND indexname = $3
            ) AS exists;
          `,
          [
            schema,
            table,
            index.indexname,
          ],
          `check index ${index.indexname}`
        );

      if (
        exists.rows[0]
          ?.exists
      ) {
        continue;
      }

      try {
        await queryWithRetry(
          target,
          index.indexdef,
          [],
          `create index ${index.indexname}`
        );

        console.log(
          `   ✓ Index ${index.indexname}`
        );
      } catch (error) {
        console.warn(
          `   ⚠️ Index ${index.indexname} could not be created: ${error.message}`
        );
      }
    }
  };

/*
|--------------------------------------------------------------------------
| CHECK CONSTRAINTS
|--------------------------------------------------------------------------
*/

const createCheckConstraints =
  async ({
    schema,
    table,
    constraints,
  }) => {
    if (
      !constraints.length
    ) {
      return;
    }

    for (const constraint of constraints) {
      const exists =
        await queryWithRetry(
          target,
          `
            SELECT EXISTS (
              SELECT 1
              FROM information_schema.table_constraints
              WHERE constraint_schema = $1
                AND table_name = $2
                AND constraint_name = $3
            ) AS exists;
          `,
          [
            schema,
            table,
            constraint.constraint_name,
          ],
          `check constraint ${constraint.constraint_name}`
        );

      if (
        exists.rows[0]
          ?.exists
      ) {
        continue;
      }

      const sql = `
        ALTER TABLE
        ${quoteQualifiedName(
          schema,
          table
        )}
        ADD CONSTRAINT
        ${quoteIdentifier(
          constraint.constraint_name
        )}
        CHECK (
          ${constraint.check_clause}
        );
      `;

      try {
        await queryWithRetry(
          target,
          sql,
          [],
          `create check ${constraint.constraint_name}`
        );

        console.log(
          `   ✓ Check ${constraint.constraint_name}`
        );
      } catch (error) {
        console.warn(
          `   ⚠️ Check ${constraint.constraint_name} skipped: ${error.message}`
        );
      }
    }
  };

/*
|--------------------------------------------------------------------------
| VERIFICATION
|--------------------------------------------------------------------------
*/

const verifyTable = async (
  schema,
  table
) => {
  const sourceCount =
    await countRows(
      source,
      schema,
      table
    );

  const targetCount =
    await countRows(
      target,
      schema,
      table
    );

  return {
    sourceCount,
    targetCount,
    matched:
      sourceCount ===
      targetCount,
  };
};

/*
|--------------------------------------------------------------------------
| CONNECTION TEST
|--------------------------------------------------------------------------
*/

const testConnections =
  async () => {
    console.log(
      "\n🔌 Connecting to Supabase..."
    );

    await queryWithRetry(
      source,
      "SELECT 1;",
      [],
      "Supabase connection test"
    );

    console.log(
      "✓ Supabase connected"
    );

    console.log(
      "\n🔌 Connecting to Neon..."
    );

    await queryWithRetry(
      target,
      "SELECT 1;",
      [],
      "Neon connection test"
    );

    console.log(
      "✓ Neon connected"
    );
  };

/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

const main = async () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║       SCHOLIQEN DATABASE MIGRATION                ║
║       SUPABASE  →  NEON                            ║
║                                                    ║
╚════════════════════════════════════════════════════╝
`);

  console.log(
    "🛡️ SAFE MODE ENABLED"
  );

  console.log(
    "   • Supabase data will NOT be deleted."
  );

  console.log(
    "   • Neon users table is protected."
  );

  console.log(
    "   • Supabase internal schemas are skipped."
  );

  console.log(
    "   • JSON/JSONB values are explicitly serialized."
  );

  console.log(
    "   • JSON/JSONB INSERT parameters are explicitly cast."
  );

  console.log(
    "   • PostgreSQL connections automatically retry."
  );

  console.log(
    "   • Existing Neon records are preserved."
  );

  await testConnections();

  /*
  |--------------------------------------------------------------------------
  | DISCOVER TABLES
  |--------------------------------------------------------------------------
  */

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DISCOVERING APPLICATION TABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  const tables =
    await getTables();

  console.log(
    `Found ${tables.length} application tables.`
  );

  if (
    !tables.length
  ) {
    throw new Error(
      "No application tables were found in Supabase public schema."
    );
  }

  for (
    const table of tables
  ) {
    console.log(
      `   • ${table.table_schema}.${table.table_name}`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PREPARE STRUCTURE
  |--------------------------------------------------------------------------
  */

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ PREPARING DATABASE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  const metadata = [];

  for (
    const tableInfo of tables
  ) {
    const schema =
      tableInfo.table_schema;

    const table =
      tableInfo.table_name;

    console.log(
      `\n🔧 ${schema}.${table}`
    );

    await createSchema(
      TARGET_SCHEMA
    );

    const columns =
      await getColumns(
        schema,
        table
      );

    const primaryKeys =
      await getPrimaryKeys(
        schema,
        table
      );

    const foreignKeys =
      await getForeignKeys(
        schema,
        table
      );

    const indexes =
      await getIndexes(
        schema,
        table
      );

    const checkConstraints =
      await getCheckConstraints(
        schema,
        table
      );

    metadata.push({
      schema,
      table,
      columns,
      primaryKeys,
      foreignKeys,
      indexes,
      checkConstraints,
    });

    /*
     * Never create or replace users.
     */
    if (
      schema ===
        SOURCE_SCHEMA &&
      PROTECTED_TABLES.has(
        table
      )
    ) {
      console.log(
        `   🔒 ${table} is protected — not creating/replacing it.`
      );

      continue;
    }

    await createTable({
      schema:
        TARGET_SCHEMA,
      table,
      columns,
      primaryKeys,
    });
  }

  console.log(
    "\n✓ Database structures created."
  );

  /*
  |--------------------------------------------------------------------------
  | DATA MIGRATION
  |--------------------------------------------------------------------------
  */

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 MIGRATING DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  const migrationResults =
    [];

  for (
    const item of metadata
  ) {
    try {
      const result =
        await migrateTable({
          schema:
            item.schema,
          table:
            item.table,
          columns:
            item.columns,
        });

      migrationResults.push(
        result
      );
    } catch (error) {
      console.error(
        `\n❌ Failed migrating ${item.schema}.${item.table}`
      );

      console.error(
        `   ${error.message}`
      );

      /*
       * Continue instead of stopping the entire migration.
       */
      migrationResults.push({
        schema:
          item.schema,
        table:
          item.table,
        sourceCount:
          null,
        targetCount:
          null,
        migrated: false,
        skipped: false,
        failed: true,
        error:
          error.message,
      });

      console.log(
        `   ↪ Continuing with the next table...`
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FOREIGN KEYS
  |--------------------------------------------------------------------------
  */

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 CREATING FOREIGN KEYS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  for (
    const item of metadata
  ) {
    if (
      PROTECTED_TABLES.has(
        item.table
      )
    ) {
      continue;
    }

    await createForeignKeys({
      schema:
        TARGET_SCHEMA,
      table:
        item.table,
      foreignKeys:
        item.foreignKeys,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK CONSTRAINTS
  |--------------------------------------------------------------------------
  */

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CREATING CHECK CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  for (
    const item of metadata
  ) {
    if (
      PROTECTED_TABLES.has(
        item.table
      )
    ) {
      continue;
    }

    await createCheckConstraints({
      schema:
        TARGET_SCHEMA,
      table:
        item.table,
      constraints:
        item.checkConstraints,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | INDEXES
  |--------------------------------------------------------------------------
  */

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ CREATING INDEXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  for (
    const item of metadata
  ) {
    if (
      PROTECTED_TABLES.has(
        item.table
      )
    ) {
      continue;
    }

    await createIndexes({
      schema:
        TARGET_SCHEMA,
      table:
        item.table,
      indexes:
        item.indexes,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | VERIFICATION
  |--------------------------------------------------------------------------
  */

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔎 VERIFYING MIGRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  let failed = 0;
  let skipped = 0;

  let sourceTotal = 0;
  let targetTotal = 0;

  for (
    const item of metadata
  ) {
    if (
      PROTECTED_TABLES.has(
        item.table
      )
    ) {
      skipped++;

      const protectedCount =
        await countRows(
          target,
          TARGET_SCHEMA,
          item.table
        ).catch(() => 0);

      console.log(
        `🔒 ${item.schema}.${item.table}: PROTECTED (${protectedCount} Neon records)`
      );

      continue;
    }

    try {
      const verification =
        await verifyTable(
          item.schema,
          item.table
        );

      sourceTotal +=
        verification.sourceCount;

      targetTotal +=
        verification.targetCount;

      if (
        verification.matched
      ) {
        console.log(
          `✓ ${item.schema}.${item.table}: ${verification.sourceCount} → ${verification.targetCount}`
        );
      } else {
        failed++;

        console.log(
          `❌ ${item.schema}.${item.table}: ${verification.sourceCount} → ${verification.targetCount}`
        );
      }
    } catch (error) {
      failed++;

      console.log(
        `❌ ${item.schema}.${item.table}: verification failed`
      );

      console.log(
        `   ${error.message}`
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FAILED MIGRATIONS
  |--------------------------------------------------------------------------
  */

  const failedMigrations =
    migrationResults.filter(
      (item) =>
        item.failed
    );

  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  console.log(`
╔════════════════════════════════════════════════════╗
║                 MIGRATION SUMMARY                  ║
╚════════════════════════════════════════════════════╝

Tables discovered:       ${tables.length}

Source records:          ${sourceTotal}
Neon records:            ${targetTotal}

Mismatched tables:       ${failed}
Protected tables:        ${skipped}
Failed migrations:       ${failedMigrations.length}

`);

  if (
    failedMigrations.length
  ) {
    console.log(
      "⚠️ TABLES THAT NEED ANOTHER PASS:"
    );

    for (
      const item of failedMigrations
    ) {
      console.log(
        `   • ${item.schema}.${item.table}`
      );

      if (item.error) {
        console.log(
          `     ${item.error}`
        );
      }
    }

    console.log("");
  }

  if (
    failed === 0 &&
    failedMigrations.length === 0
  ) {
    console.log(`
🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY

Your Supabase application data has been copied
into Neon.

Nothing was deleted from Supabase.

Next phase:
1. Verify important tables.
2. Migrate Supabase Storage files.
3. Move API queries from Supabase to Express/Neon.
4. Remove remaining Supabase database dependencies.
5. Test the entire application.
`);
  } else {
    console.log(`
⚠️ MIGRATION COMPLETED WITH WARNINGS

Some tables did not match their source record counts
or could not be migrated completely.

DO NOT DELETE YOUR SUPABASE PROJECT YET.

Review the mismatched/failed tables before
switching the application completely to Neon.
`);
  }

  console.log(
    "\n✅ Migration script finished.\n"
  );
};

/*
|--------------------------------------------------------------------------
| SHUTDOWN
|--------------------------------------------------------------------------
*/

const closePools = async () => {
  try {
    await source.end();
  } catch {}

  try {
    await target.end();
  } catch {}
};

/*
|--------------------------------------------------------------------------
| RUN
|--------------------------------------------------------------------------
*/

main()
  .catch(
    async (error) => {
      console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ MIGRATION FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

      console.error(
        error?.stack ||
          error?.message ||
          error
      );

      console.error(`
Your Supabase data has NOT been intentionally deleted.

The migration stopped because the error above
could not be recovered automatically.

You can safely rerun the migration.
Existing Neon records are protected with
ON CONFLICT DO NOTHING.

Supabase remains untouched.
`);
      
      process.exitCode = 1;
    }
  )
  .finally(
    async () => {
      await closePools();
    }
  );