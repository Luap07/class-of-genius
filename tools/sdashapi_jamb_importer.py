
# tools/sdashapi_jamb_importer.py

import csv
import hashlib
import os
import sys
import time
from pathlib import Path

import requests


# ============================================================
# CONFIGURATION
# ============================================================

API_URL = "https://sdashapi.com/api/v1/q"

OUTPUT_DIR = Path("data")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "jamb_questions.csv"

# ------------------------------------------------------------
# PUT YOUR TOKEN IN YOUR ENVIRONMENT:
#
# Windows PowerShell:
#
# $env:SDASH_API_TOKEN="YOUR_TOKEN"
#
# OR create a .env/config system later.
# ------------------------------------------------------------

ACCESS_TOKEN = os.getenv("SDASH_API_TOKEN", "").strip()

# Maximum questions requested per API call.
# SdashAPI currently documents a maximum of 50.
REQUEST_LIMIT = 50

# Delay between requests.
REQUEST_DELAY = 0.5

TIMEOUT = 30

# ------------------------------------------------------------
# IMPORTANT
#
# Set this to False if you don't want every question printed.
# ------------------------------------------------------------

SHOW_QUESTIONS = True

CSV_COLUMNS = [
    "exam",
    "subject",
    "question",
    "optionA",
    "optionB",
    "optionC",
    "optionD",
    "answer",
    "reason",
]


# ============================================================
# JAMB SUBJECTS
# ============================================================

SUBJECTS = {
    "Use of English": "english",
    "Mathematics": "mathematics",
    "Biology": "biology",
    "Chemistry": "chemistry",
    "Physics": "physics",
    "Economics": "economics",
    "Government": "government",
    "Literature in English": "englishlit",
    "CRS": "crk",
    "IRS": "irk",
    "Geography": "geography",
    "Commerce": "commerce",
    "Accounting": "accounting",
    "Agricultural Science": "agriculture",
    "French": "french",
    "Arabic": "arabic",
    "Hausa": "hausa",
    "Igbo": "igbo",
    "Yoruba": "yoruba",
    "Music": "music",
    "Fine Arts": "fineart",
    "Home Economics": "homeeconomics",
    "Computer Studies": "computer",
    "History": "history",
}


# ============================================================
# YEARS
# ============================================================

# Edit this range if you want a smaller/larger range.
START_YEAR = 2001
END_YEAR = 2026

YEARS = list(
    range(
        END_YEAR,
        START_YEAR - 1,
        -1,
    )
)


# ============================================================
# SESSION
# ============================================================

session = requests.Session()

session.headers.update(
    {
        "Accept": "application/json",
        "User-Agent": (
            "Scholiqen-JAMB-Importer/1.0"
        ),
    }
)


# ============================================================
# TEXT HELPERS
# ============================================================

def clean_text(value):
    if value is None:
        return ""

    value = str(value)

    value = value.replace("\xa0", " ")
    value = value.replace("\u200b", "")
    value = value.replace("\ufeff", "")

    # Normalize whitespace.
    value = " ".join(
        value.split()
    )

    return value.strip()


def normalize_text(value):
    return clean_text(value).lower()


# ============================================================
# DUPLICATE FINGERPRINT
# ============================================================

def question_fingerprint(row):
    values = [
        row.get("subject", ""),
        row.get("question", ""),
        row.get("optionA", ""),
        row.get("optionB", ""),
        row.get("optionC", ""),
        row.get("optionD", ""),
    ]

    combined = "||".join(
        normalize_text(value)
        for value in values
    )

    return hashlib.sha256(
        combined.encode("utf-8")
    ).hexdigest()


# ============================================================
# ANSWER NORMALIZATION
# ============================================================

def normalize_answer(answer):
    answer = clean_text(answer).upper()

    if answer in {
        "A",
        "B",
        "C",
        "D",
    }:
        return answer

    return ""


# ============================================================
# API REQUEST
# ============================================================

def fetch_questions(
    subject_slug,
    year,
    limit=REQUEST_LIMIT,
):
    params = {
        "subject": subject_slug,
        "type": "utme",
        "year": str(year),
        "limit": str(limit),
    }

    headers = {
        "AccessToken": ACCESS_TOKEN,
    }

    try:
        response = session.get(
            API_URL,
            params=params,
            headers=headers,
            timeout=TIMEOUT,
        )

    except requests.RequestException as exc:

        print()
        print("[REQUEST ERROR]")
        print(exc)

        return []


    # --------------------------------------------------------
    # HTTP STATUS
    # --------------------------------------------------------

    if response.status_code != 200:

        print()
        print(
            f"[API ERROR] "
            f"HTTP {response.status_code}"
        )

        try:
            error_data = response.json()

            print(
                error_data
            )

        except ValueError:

            print(
                response.text[:500]
            )

        return []


    # --------------------------------------------------------
    # JSON
    # --------------------------------------------------------

    try:
        payload = response.json()

    except ValueError:

        print()
        print(
            "[ERROR] API did not return JSON."
        )

        print(
            response.text[:500]
        )

        return []


    # --------------------------------------------------------
    # API STATUS
    # --------------------------------------------------------

    if payload.get("status") != 200:

        print()
        print(
            "[API ERROR]"
        )

        print(
            payload.get(
                "message",
                payload,
            )
        )

        return []


    data = payload.get(
        "data",
        [],
    )

    if isinstance(data, dict):
        data = [data]

    if not isinstance(data, list):
        return []

    return data


# ============================================================
# CONVERT API QUESTION
# ============================================================

def convert_question(
    item,
    subject_name,
):
    if not isinstance(item, dict):
        return None

    question = clean_text(
        item.get(
            "question",
            "",
        )
    )

    options = item.get(
        "option",
        {},
    )

    if not isinstance(options, dict):
        options = {}

    option_a = clean_text(
        options.get("a", "")
    )

    option_b = clean_text(
        options.get("b", "")
    )

    option_c = clean_text(
        options.get("c", "")
    )

    option_d = clean_text(
        options.get("d", "")
    )

    answer = normalize_answer(
        item.get(
            "answer",
            "",
        )
    )

    solution = clean_text(
        item.get(
            "solution",
            "",
        )
    )

    # --------------------------------------------------------
    # Do not accept incomplete questions.
    # --------------------------------------------------------

    if not question:
        return None

    if not option_a:
        return None

    if not option_b:
        return None

    if not option_c:
        return None

    if not option_d:
        return None

    if answer not in {
        "A",
        "B",
        "C",
        "D",
    }:
        return None

    if not solution:
        solution = (
            "No explanation provided."
        )

    return {
        "exam": "JAMB",
        "subject": subject_name,
        "question": question,
        "optionA": option_a,
        "optionB": option_b,
        "optionC": option_c,
        "optionD": option_d,
        "answer": answer,
        "reason": solution,
    }


# ============================================================
# DISPLAY QUESTION
# ============================================================

def display_question(
    row,
    number,
    year,
):
    print()
    print(
        "─" * 90
    )

    print(
        f"QUESTION #{number}"
    )

    print(
        f"Exam:    {row['exam']}"
    )

    print(
        f"Subject: {row['subject']}"
    )

    print(
        f"Year:    {year}"
    )

    print()

    print(
        row["question"]
    )

    print()

    print(
        f"A. {row['optionA']}"
    )

    print(
        f"B. {row['optionB']}"
    )

    print(
        f"C. {row['optionC']}"
    )

    print(
        f"D. {row['optionD']}"
    )

    print()

    print(
        f"ANSWER: {row['answer']}"
    )

    print(
        f"REASON: {row['reason']}"
    )

    print(
        "─" * 90
    )


# ============================================================
# CSV WRITER
# ============================================================

def write_csv(rows):

    with open(
        OUTPUT_FILE,
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=CSV_COLUMNS,
        )

        writer.writeheader()

        for row in rows:

            writer.writerow(
                {
                    column: row.get(
                        column,
                        "",
                    )
                    for column in CSV_COLUMNS
                }
            )

    print()
    print(
        "=" * 90
    )

    print(
        "CSV CREATED"
    )

    print(
        "=" * 90
    )

    print(
        f"FILE:      {OUTPUT_FILE}"
    )

    print(
        f"QUESTIONS: {len(rows)}"
    )

    print(
        "=" * 90
    )


# ============================================================
# STATISTICS
# ============================================================

def print_statistics(rows):

    statistics = {}

    for row in rows:

        subject = row["subject"]

        statistics[subject] = (
            statistics.get(
                subject,
                0,
            )
            + 1
        )

    print()
    print(
        "=" * 90
    )

    print(
        "JAMB QUESTION STATISTICS"
    )

    print(
        "=" * 90
    )

    for subject, count in sorted(
        statistics.items()
    ):

        print(
            f"{subject:<30}"
            f"{count:>8}"
        )

    print(
        "-" * 90
    )

    print(
        f"{'TOTAL':<30}"
        f"{len(rows):>8}"
    )

    print(
        "=" * 90
    )


# ============================================================
# IMPORTER
# ============================================================

class JAMBImporter:

    def __init__(self):

        self.rows = []

        self.fingerprints = set()

        self.total_candidates = 0

        self.valid_questions = 0

        self.rejected_questions = 0

        self.failed_requests = 0

        self.subjects_completed = 0

        self.years_completed = 0


    # --------------------------------------------------------
    # ADD QUESTION
    # --------------------------------------------------------

    def add_question(
        self,
        item,
        subject_name,
        year,
    ):

        self.total_candidates += 1

        row = convert_question(
            item,
            subject_name,
        )

        if row is None:

            self.rejected_questions += 1

            print(
                "[REJECTED] Invalid question"
            )

            return False

        fingerprint = (
            question_fingerprint(row)
        )

        if fingerprint in self.fingerprints:

            self.rejected_questions += 1

            print(
                "[DUPLICATE] "
                f"{subject_name} "
                f"{year}"
            )

            return False

        self.fingerprints.add(
            fingerprint
        )

        self.rows.append(
            row
        )

        self.valid_questions += 1

        if SHOW_QUESTIONS:

            display_question(
                row,
                self.valid_questions,
                year,
            )

        else:

            print(
                f"[ADDED] "
                f"{subject_name} "
                f"{year} "
                f"→ "
                f"{self.valid_questions}"
            )

        return True


    # --------------------------------------------------------
    # IMPORT SUBJECT/YEAR
    # --------------------------------------------------------

    def import_subject_year(
        self,
        subject_name,
        subject_slug,
        year,
    ):

        print()
        print(
            "=" * 90
        )

        print(
            f"SUBJECT: {subject_name}"
        )

        print(
            f"SLUG:    {subject_slug}"
        )

        print(
            f"YEAR:    {year}"
        )

        print(
            "=" * 90
        )

        data = fetch_questions(
            subject_slug,
            year,
            REQUEST_LIMIT,
        )

        if not data:

            print(
                "[INFO] No questions returned."
            )

            return

        print(
            f"[API] Received "
            f"{len(data)} candidates"
        )

        before = self.valid_questions

        for item in data:

            self.add_question(
                item,
                subject_name,
                year,
            )

        added = (
            self.valid_questions
            - before
        )

        print()
        print(
            f"[RESULT] "
            f"{subject_name} "
            f"{year}: "
            f"+{added} valid"
        )

        time.sleep(
            REQUEST_DELAY
        )


    # --------------------------------------------------------
    # RUN
    # --------------------------------------------------------

    def run(self):

        total_subjects = len(
            SUBJECTS
        )

        total_jobs = (
            total_subjects
            * len(YEARS)
        )

        current_job = 0

        print()
        print(
            "=" * 90
        )

        print(
            "SCHOLIQEN JAMB IMPORTER"
        )

        print(
            "=" * 90
        )

        print(
            f"Subjects:       {total_subjects}"
        )

        print(
            f"Years:          "
            f"{START_YEAR}-{END_YEAR}"
        )

        print(
            f"API limit:      "
            f"{REQUEST_LIMIT}"
        )

        print(
            f"Output:         "
            f"{OUTPUT_FILE}"
        )

        print(
            "=" * 90
        )


        for subject_name, subject_slug in (
            SUBJECTS.items()
        ):

            self.subjects_completed += 1

            print()
            print(
                "#" * 90
            )

            print(
                f"SUBJECT "
                f"{self.subjects_completed}/"
                f"{total_subjects}"
            )

            print(
                f"{subject_name}"
            )

            print(
                "#" * 90
            )


            for year in YEARS:

                current_job += 1

                print()
                print(
                    f"[JOB "
                    f"{current_job}/"
                    f"{total_jobs}]"
                )

                self.import_subject_year(
                    subject_name,
                    subject_slug,
                    year,
                )

                self.years_completed += 1


        print()
        print(
            "=" * 90
        )

        print(
            "IMPORT COMPLETE"
        )

        print(
            "=" * 90
        )

        print(
            f"Candidates:       "
            f"{self.total_candidates}"
        )

        print(
            f"Valid questions:  "
            f"{self.valid_questions}"
        )

        print(
            f"Rejected:         "
            f"{self.rejected_questions}"
        )

        print(
            f"Subjects:         "
            f"{self.subjects_completed}"
        )

        print(
            f"Jobs completed:   "
            f"{self.years_completed}"
        )

        print(
            "=" * 90
        )

        return self.rows


# ============================================================
# VALIDATION
# ============================================================

def validate_rows(rows):

    valid = []

    for row in rows:

        required = [
            "exam",
            "subject",
            "question",
            "optionA",
            "optionB",
            "optionC",
            "optionD",
            "answer",
            "reason",
        ]

        if not all(
            clean_text(
                row.get(
                    column,
                    "",
                )
            )
            for column in required
        ):
            continue

        if row["answer"] not in {
            "A",
            "B",
            "C",
            "D",
        }:
            continue

        valid.append(
            row
        )

    return valid


# ============================================================
# MAIN
# ============================================================

def main():

    # --------------------------------------------------------
    # TOKEN CHECK
    # --------------------------------------------------------

    if not ACCESS_TOKEN:

        print()
        print(
            "=" * 90
        )

        print(
            "ERROR: SDASH_API_TOKEN NOT FOUND"
        )

        print(
            "=" * 90
        )

        print()
        print(
            "PowerShell:"
        )

        print(
            '$env:SDASH_API_TOKEN="YOUR_TOKEN"'
        )

        print()
        print(
            "Then run:"
        )

        print(
            "python tools/sdashapi_jamb_importer.py"
        )

        print()

        sys.exit(1)


    # --------------------------------------------------------
    # IMPORT
    # --------------------------------------------------------

    importer = JAMBImporter()

    rows = importer.run()


    # --------------------------------------------------------
    # VALIDATE
    # --------------------------------------------------------

    rows = validate_rows(
        rows
    )

    print()
    print(
        f"After validation: "
        f"{len(rows)}"
    )


    # --------------------------------------------------------
    # SORT
    # --------------------------------------------------------

    rows.sort(
        key=lambda row: (
            row["subject"].lower(),
            row["question"].lower(),
        )
    )


    # --------------------------------------------------------
    # WRITE
    # --------------------------------------------------------

    write_csv(
        rows
    )


    # --------------------------------------------------------
    # STATISTICS
    # --------------------------------------------------------

    print_statistics(
        rows
    )


# ============================================================
# START
# ============================================================

if __name__ == "__main__":
    main()
