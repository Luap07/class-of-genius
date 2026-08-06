import csv
import os
from dotenv import load_dotenv
from supabase import create_client, Client


# ==============================
# LOAD ENVIRONMENT VARIABLES
# ==============================

load_dotenv("../.env")


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


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

CSV_FILE = "../data/cbt_questions.csv"


# ==============================
# READ QUESTIONS FROM CSV
# ==============================

questions = []


with open(
    CSV_FILE,
    "r",
    encoding="utf-8"
) as file:

    reader = csv.DictReader(file)

    for row in reader:

        question_data = {

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

        questions.append(question_data)



# ==============================
# UPLOAD TO SUPABASE
# ==============================

if len(questions) > 0:

    try:

        response = (
            supabase
            .table("cbt_questions")
            .insert(questions)
            .execute()
        )


        print(
            "✅ Questions uploaded successfully!"
        )

        print(
            f"Total uploaded: {len(questions)}"
        )


    except Exception as error:

        print(
            "❌ Upload failed:"
        )

        print(error)


else:

    print(
        "⚠️ No questions found in CSV."
    )