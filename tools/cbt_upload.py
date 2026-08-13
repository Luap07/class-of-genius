import csv
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client


# ==============================
# LOAD ENVIRONMENT VARIABLES
# ==============================

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("ENV PATH:", env_path)
print("SUPABASE_URL FOUND:", bool(SUPABASE_URL))
print("SERVICE ROLE KEY FOUND:", bool(SUPABASE_KEY))

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception(
        "Supabase credentials missing. Check your .env file."
    )


# ==============================
# CONNECT TO SUPABASE
# ==============================

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# ==============================
# CSV FILE LOCATION
# ==============================

CSV_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "cbt_questions.csv"
)

if not CSV_FILE.exists():
    raise FileNotFoundError(
        f"CSV file not found: {CSV_FILE}"
    )


# ==============================
# REQUIRED CSV COLUMNS
# ==============================

required_columns = {
    "exam",
    "subject",
    "question",
    "optionA",
    "optionB",
    "optionC",
    "optionD",
    "answer",
    "reason",
}


# ==============================
# READ QUESTIONS
# ==============================

questions = []

with open(
    CSV_FILE,
    "r",
    encoding="utf-8-sig",
    newline=""
) as file:

    reader = csv.DictReader(file)

    actual_columns = set(reader.fieldnames or [])

    missing_columns = required_columns - actual_columns

    if missing_columns:
        raise Exception(
            "Missing CSV columns: "
            + ", ".join(sorted(missing_columns))
        )

    for row_number, row in enumerate(reader, start=2):

        # ==============================
        # SKIP EMPTY ROWS
        # ==============================

        if not any(
            value and value.strip()
            for value in row.values()
            if value is not None
        ):
            continue


        # ==============================
        # GET CSV VALUES SAFELY
        # ==============================

        exam = (row.get("exam") or "").strip()
        subject = (row.get("subject") or "").strip()
        question = (row.get("question") or "").strip()

        option_a = (row.get("optionA") or "").strip()
        option_b = (row.get("optionB") or "").strip()
        option_c = (row.get("optionC") or "").strip()
        option_d = (row.get("optionD") or "").strip()

        answer = (row.get("answer") or "").strip().upper()
        reason = (row.get("reason") or "").strip()


        # ==============================
        # VALIDATE REQUIRED VALUES
        # ==============================

        if not exam:
            raise ValueError(
                f"Row {row_number}: exam is empty."
            )

        if not subject:
            raise ValueError(
                f"Row {row_number}: subject is empty."
            )

        if not question:
            raise ValueError(
                f"Row {row_number}: question is empty."
            )

        if not option_a:
            raise ValueError(
                f"Row {row_number}: optionA is empty."
            )

        if not option_b:
            raise ValueError(
                f"Row {row_number}: optionB is empty."
            )

        if not option_c:
            raise ValueError(
                f"Row {row_number}: optionC is empty."
            )

        if not option_d:
            raise ValueError(
                f"Row {row_number}: optionD is empty."
            )

        if not answer:
            raise ValueError(
                f"Row {row_number}: answer is empty."
            )

        if answer not in {"A", "B", "C", "D"}:
            raise ValueError(
                f"Row {row_number}: invalid answer '{answer}'. "
                "Answer must be A, B, C, or D."
            )

        if not reason:
            raise ValueError(
                f"\n❌ Row {row_number} is missing a reason.\n"
                f"Question: {question}\n"
                f"Answer: {answer}\n\n"
                "Add a reason to this row in cbt_questions.csv."
            )


        # ==============================
        # BUILD QUESTION
        # ==============================

        questions.append(
            {
                "exam": exam,
                "subject": subject,
                "question": question,
                "options": [
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                ],
                "answer": answer,
                "reason": reason,
            }
        )


# ==============================
# CHECK QUESTIONS
# ==============================

if not questions:
    print("⚠️ No questions found in CSV.")
    exit()


# ==============================
# DISPLAY SUMMARY
# ==============================

print()
print("================================")
print("       CBT QUESTION IMPORT")
print("================================")
print(f"CSV file: {CSV_FILE}")
print(f"Total questions: {len(questions)}")
print("Reason column: ENABLED")
print("================================")
print()


# ==============================
# UPLOAD TO SUPABASE
# ==============================

try:

    response = (
        supabase
        .table("cbt_questions")
        .insert(questions)
        .execute()
    )

    print("✅ Questions uploaded successfully!")
    print(f"Total uploaded: {len(questions)}")

except Exception as error:

    print("❌ Upload failed:")
    print(error)