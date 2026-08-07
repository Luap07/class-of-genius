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

CSV_FILE = Path(__file__).resolve().parent.parent / "data" / "cbt_questions.csv"

if not CSV_FILE.exists():
    raise FileNotFoundError(f"CSV file not found: {CSV_FILE}")


# ==============================
# READ QUESTIONS
# ==============================

questions = []

with open(CSV_FILE, "r", encoding="utf-8") as file:
    reader = csv.DictReader(file)

    for row in reader:
        questions.append(
            {
                "exam": row["exam"],
                "subject": row["subject"],
                "question": row["question"],
                "options": [
                    row["optionA"],
                    row["optionB"],
                    row["optionC"],
                    row["optionD"],
                ],
                "answer": row["answer"],
            }
        )


# ==============================
# UPLOAD TO SUPABASE
# ==============================

if not questions:
    print("⚠️ No questions found in CSV.")
    exit()

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