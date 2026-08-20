import csv
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client


# ============================================================
# CONFIG
# ============================================================

load_dotenv()

DATA_DIR = Path("data")
CSV_FILE = DATA_DIR / "cbt_questions.csv"

TABLE_NAME = "cbt_questions"

SUPABASE_URL = os.getenv("SUPABASE_URL")

SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
)


# ============================================================
# SUPABASE
# ============================================================

def get_supabase() -> Client:

    if not SUPABASE_URL:
        raise RuntimeError(
            "SUPABASE_URL is missing from your .env file."
        )

    if not SUPABASE_KEY:
        raise RuntimeError(
            "SUPABASE_SERVICE_ROLE_KEY or "
            "SUPABASE_ANON_KEY is missing from your .env file."
        )

    return create_client(
        SUPABASE_URL,
        SUPABASE_KEY,
    )


# ============================================================
# TEXT HELPERS
# ============================================================

def clean(value):

    if value is None:
        return ""

    return (
        str(value)
        .replace("\ufeff", "")
        .replace("\xa0", " ")
        .strip()
    )


def normalize_text(value):

    return re.sub(
        r"\s+",
        " ",
        clean(value)
    ).strip().lower()


def normalize_header(value):

    value = clean(value).lower()

    for character in [
        " ",
        "_",
        "-",
        ".",
        ":",
    ]:
        value = value.replace(
            character,
            ""
        )

    return value


# ============================================================
# CSV HEADER DETECTION
# ============================================================

def find_column(
    fieldnames,
    possible_names
):

    if not fieldnames:
        return None

    normalized = {
        normalize_header(field): field
        for field in fieldnames
        if field
    }

    for name in possible_names:

        key = normalize_header(name)

        if key in normalized:
            return normalized[key]

    return None


def get_column_map(fieldnames):

    return {

        "exam": find_column(
            fieldnames,
            [
                "exam",
                "examination",
            ]
        ),

        "subject": find_column(
            fieldnames,
            [
                "subject",
                "subjects",
            ]
        ),

        "question": find_column(
            fieldnames,
            [
                "question",
                "questions",
                "questiontext",
                "question_text",
            ]
        ),

        "optionA": find_column(
            fieldnames,
            [
                "optionA",
                "option A",
                "option_a",
                "a",
                "option1",
                "option 1",
            ]
        ),

        "optionB": find_column(
            fieldnames,
            [
                "optionB",
                "option B",
                "option_b",
                "b",
                "option2",
                "option 2",
            ]
        ),

        "optionC": find_column(
            fieldnames,
            [
                "optionC",
                "option C",
                "option_c",
                "c",
                "option3",
                "option 3",
            ]
        ),

        "optionD": find_column(
            fieldnames,
            [
                "optionD",
                "option D",
                "option_d",
                "d",
                "option4",
                "option 4",
            ]
        ),

        "answer": find_column(
            fieldnames,
            [
                "answer",
                "correctanswer",
                "correct_answer",
                "correctoption",
                "correct_option",
            ]
        ),

        "reason": find_column(
            fieldnames,
            [
                "reason",
                "explanation",
                "explain",
            ]
        ),
    }


# ============================================================
# ANSWER NORMALIZATION
# ============================================================

def normalize_answer(answer):

    answer = clean(answer)

    if not answer:
        return ""

    upper = answer.upper().strip()

    # Direct answer
    if upper in [
        "A",
        "B",
        "C",
        "D",
    ]:
        return upper

    # Remove common prefixes
    patterns = [
        r"^OPTION\s+([ABCD])(?:[\s\.\):\-]|$)",
        r"^ANSWER\s*[:\-]?\s*([ABCD])(?:[\s\.\):\-]|$)",
        r"^\(([ABCD])\)",
        r"^([ABCD])[\.\)]",
    ]

    for pattern in patterns:

        match = re.match(
            pattern,
            upper
        )

        if match:
            return match.group(1)

    return upper


# ============================================================
# EXTRACT ANSWER FROM OPTION TEXT
# ============================================================

def extract_option_from_answer(
    answer,
    options
):

    answer = clean(answer)

    if not answer:
        return ""

    normalized = normalize_answer(
        answer
    )

    if normalized in [
        "A",
        "B",
        "C",
        "D",
    ]:
        return normalized

    answer_normalized = normalize_text(
        answer
    )

    for index, option in enumerate(
        options[:4]
    ):

        option_normalized = normalize_text(
            option
        )

        if not option_normalized:
            continue

        if (
            answer_normalized
            == option_normalized
        ):
            return chr(
                65 + index
            )

    return ""


# ============================================================
# REASON
# ============================================================

def create_reason(
    question,
    answer,
    options
):

    if answer not in [
        "A",
        "B",
        "C",
        "D",
    ]:
        return ""

    index = ord(answer) - 65

    if index >= len(options):
        return ""

    correct_option = clean(
        options[index]
    )

    if not correct_option:
        return ""

    return (
        f"The correct answer is {answer} because "
        f"the option \"{correct_option}\" correctly "
        f"answers the question."
    )


# ============================================================
# VALIDATION
# ============================================================

def validate_question(
    record,
    row_number
):

    problems = []

    if not record["exam"]:
        problems.append(
            "missing exam"
        )

    if not record["subject"]:
        problems.append(
            "missing subject"
        )

    if not record["question"]:
        problems.append(
            "missing question"
        )

    if not record["optionA"]:
        problems.append(
            "missing optionA"
        )

    if not record["optionB"]:
        problems.append(
            "missing optionB"
        )

    if not record["optionC"]:
        problems.append(
            "missing optionC"
        )

    if not record["optionD"]:
        problems.append(
            "missing optionD"
        )

    if record["answer"] not in [
        "A",
        "B",
        "C",
        "D",
    ]:
        problems.append(
            f"invalid answer: {record['answer']!r}"
        )

    if problems:

        print()
        print(
            f"Skipping row {row_number}: "
            + ", ".join(problems)
        )

        print(
            f"  Question: "
            f"{record['question'][:150]!r}"
        )

        print(
            f"  Answer: "
            f"{record['answer']!r}"
        )

        return False

    return True


# ============================================================
# READ CSV
# ============================================================

def read_csv_file():

    if not CSV_FILE.exists():

        print()
        print("=" * 70)
        print("JAMB QUESTION IMPORTER")
        print("=" * 70)
        print()

        print(
            "No JAMB CSV file found."
        )

        print()

        print(
            f"Expected:"
        )

        print(
            f"  {CSV_FILE}"
        )

        print()

        return []

    print()
    print("=" * 70)
    print("JAMB QUESTION IMPORTER")
    print("=" * 70)
    print()

    print(
        f"CSV      : {CSV_FILE}"
    )

    questions = []

    # --------------------------------------------------------
    # IMPORTANT
    #
    # utf-8-sig handles BOM.
    #
    # newline="" is required for proper CSV parsing.
    # --------------------------------------------------------

    with open(
        CSV_FILE,
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:

        reader = csv.DictReader(
            file,
            quotechar='"',
            delimiter=",",
            doublequote=True,
            skipinitialspace=False,
        )

        fieldnames = (
            reader.fieldnames or []
        )

        print(
            "Columns  :",
            ", ".join(
                fieldnames
            )
        )

        # ----------------------------------------------------
        # HEADER CHECK
        # ----------------------------------------------------

        column_map = get_column_map(
            fieldnames
        )

        print()
        print(
            "COLUMN MAPPING"
        )
        print(
            "-" * 70
        )

        for key, value in column_map.items():

            print(
                f"{key:<12}: "
                f"{value or 'NOT FOUND'}"
            )

        print()

        required = [
            "subject",
            "question",
            "optionA",
            "optionB",
            "optionC",
            "optionD",
            "answer",
        ]

        missing = [
            key
            for key in required
            if not column_map.get(key)
        ]

        if missing:

            raise RuntimeError(
                "The CSV is missing required "
                "columns: "
                + ", ".join(missing)
            )

        # ----------------------------------------------------
        # READ EACH ROW
        # ----------------------------------------------------

        for row_number, row in enumerate(
            reader,
            start=2,
        ):

            try:

                exam_column = column_map.get(
                    "exam"
                )

                subject_column = column_map.get(
                    "subject"
                )

                question_column = column_map.get(
                    "question"
                )

                option_a_column = column_map.get(
                    "optionA"
                )

                option_b_column = column_map.get(
                    "optionB"
                )

                option_c_column = column_map.get(
                    "optionC"
                )

                option_d_column = column_map.get(
                    "optionD"
                )

                answer_column = column_map.get(
                    "answer"
                )

                reason_column = column_map.get(
                    "reason"
                )

                record = {

                    "exam": clean(
                        row.get(
                            exam_column,
                            ""
                        )
                        if exam_column
                        else "JAMB"
                    ),

                    "subject": clean(
                        row.get(
                            subject_column,
                            ""
                        )
                    ),

                    "question": clean(
                        row.get(
                            question_column,
                            ""
                        )
                    ),

                    "optionA": clean(
                        row.get(
                            option_a_column,
                            ""
                        )
                    ),

                    "optionB": clean(
                        row.get(
                            option_b_column,
                            ""
                        )
                    ),

                    "optionC": clean(
                        row.get(
                            option_c_column,
                            ""
                        )
                    ),

                    "optionD": clean(
                        row.get(
                            option_d_column,
                            ""
                        )
                    ),

                    "answer": clean(
                        row.get(
                            answer_column,
                            ""
                        )
                    ),

                    "reason": clean(
                        row.get(
                            reason_column,
                            ""
                        )
                        if reason_column
                        else ""
                    ),
                }

                # ------------------------------------------------
                # DEFAULT EXAM
                # ------------------------------------------------

                if not record["exam"]:
                    record["exam"] = "JAMB"

                # ------------------------------------------------
                # ANSWER
                # ------------------------------------------------

                record["answer"] = (
                    normalize_answer(
                        record["answer"]
                    )
                )

                options = [
                    record["optionA"],
                    record["optionB"],
                    record["optionC"],
                    record["optionD"],
                ]

                # ------------------------------------------------
                # IF ANSWER IS OPTION TEXT
                # ------------------------------------------------

                if record["answer"] not in [
                    "A",
                    "B",
                    "C",
                    "D",
                ]:

                    detected_answer = (
                        extract_option_from_answer(
                            record["answer"],
                            options,
                        )
                    )

                    if detected_answer:

                        record["answer"] = (
                            detected_answer
                        )

                # ------------------------------------------------
                # GENERATE REASON
                # ------------------------------------------------

                if not record["reason"]:

                    record["reason"] = (
                        create_reason(
                            record["question"],
                            record["answer"],
                            options,
                        )
                    )

                # ------------------------------------------------
                # VALIDATE
                # ------------------------------------------------

                if not validate_question(
                    record,
                    row_number,
                ):
                    continue

                questions.append(
                    record
                )

            except Exception as error:

                print()
                print(
                    f"Error reading row "
                    f"{row_number}:"
                )

                print(
                    f"  {error}"
                )

                continue

    return questions


# ============================================================
# DEDUPLICATE
# ============================================================

def deduplicate_questions(
    questions
):

    unique = []

    seen = set()

    for question in questions:

        key = (
            normalize_text(
                question["exam"]
            ),

            normalize_text(
                question["subject"]
            ),

            normalize_text(
                question["question"]
            ),
        )

        if key in seen:
            continue

        seen.add(key)

        unique.append(
            question
        )

    return unique


# ============================================================
# SUPABASE RECORD
# ============================================================

def make_supabase_record(
    question
):

    options = {
        "A": question["optionA"],
        "B": question["optionB"],
        "C": question["optionC"],
        "D": question["optionD"],
    }

    return {

        "exam": question["exam"],

        "subject": question["subject"],

        "question": question["question"],

        # Required JSON/JSONB column
        "options": options,

        # Existing CBT columns
        "optionA": question["optionA"],
        "optionB": question["optionB"],
        "optionC": question["optionC"],
        "optionD": question["optionD"],

        "answer": question["answer"],

        "reason": question["reason"],
    }


# ============================================================
# CHECK EXISTING QUESTIONS
# ============================================================

def question_exists(
    supabase,
    question
):

    try:

        result = (
            supabase
            .table(TABLE_NAME)
            .select("id")
            .eq(
                "exam",
                question["exam"]
            )
            .eq(
                "subject",
                question["subject"]
            )
            .eq(
                "question",
                question["question"]
            )
            .limit(1)
            .execute()
        )

        return bool(
            result.data
        )

    except Exception as error:

        print(
            "Warning: duplicate check failed:",
            error
        )

        return False


# ============================================================
# UPLOAD
# ============================================================

def upload_to_supabase(
    questions
):

    if not questions:

        print(
            "Nothing to upload."
        )

        return

    print()
    print("=" * 70)
    print("SUPABASE UPLOAD")
    print("=" * 70)
    print()

    supabase = get_supabase()

    uploaded = 0
    skipped = 0
    failed = 0

    for index, question in enumerate(
        questions,
        start=1,
    ):

        print(
            f"[{index}/{len(questions)}] "
            f"{question['subject']}"
        )

        print(
            f"Question: "
            f"{question['question'][:120]}"
        )

        print(
            f"  A: {question['optionA'][:100]}"
        )

        print(
            f"  B: {question['optionB'][:100]}"
        )

        print(
            f"  C: {question['optionC'][:100]}"
        )

        print(
            f"  D: {question['optionD'][:100]}"
        )

        print(
            f"  Answer: "
            f"{question['answer']}"
        )

        # ----------------------------------------------------
        # DUPLICATE
        # ----------------------------------------------------

        if question_exists(
            supabase,
            question
        ):

            print(
                "  -> Already exists; skipped."
            )

            skipped += 1

            continue

        record = make_supabase_record(
            question
        )

        try:

            result = (
                supabase
                .table(TABLE_NAME)
                .insert(record)
                .execute()
            )

            if result.data:

                uploaded += 1

                print(
                    "  -> Uploaded successfully."
                )

            else:

                failed += 1

                print(
                    "  -> Upload returned no data."
                )

        except Exception as error:

            failed += 1

            print(
                "  -> Upload failed:"
            )

            print(
                f"     {error}"
            )

        print()

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    print("=" * 70)
    print(
        "SUPABASE UPLOAD COMPLETE"
    )
    print("=" * 70)
    print()

    print(
        f"Uploaded : {uploaded}"
    )

    print(
        f"Skipped  : {skipped}"
    )

    print(
        f"Failed   : {failed}"
    )

    print(
        f"Total    : {len(questions)}"
    )

    print()


# ============================================================
# SUBJECT BREAKDOWN
# ============================================================

def show_subject_breakdown(
    questions
):

    subjects = {}

    for question in questions:

        subject = question[
            "subject"
        ]

        subjects[subject] = (
            subjects.get(
                subject,
                0
            )
            + 1
        )

    print()
    print("=" * 70)
    print(
        "SUBJECT BREAKDOWN"
    )
    print("=" * 70)
    print()

    for subject, count in sorted(
        subjects.items()
    ):

        print(
            f"{subject:<35} "
            f"{count}"
        )

    print()


# ============================================================
# PREVIEW
# ============================================================

def preview_questions(
    questions
):

    print()
    print("=" * 70)
    print(
        "QUESTION PREVIEW"
    )
    print("=" * 70)
    print()

    for index, question in enumerate(
        questions[:3],
        start=1,
    ):

        print(
            f"{index}. "
            f"{question['question']}"
        )

        print(
            f"   A. "
            f"{question['optionA']}"
        )

        print(
            f"   B. "
            f"{question['optionB']}"
        )

        print(
            f"   C. "
            f"{question['optionC']}"
        )

        print(
            f"   D. "
            f"{question['optionD']}"
        )

        print(
            f"   Answer: "
            f"{question['answer']}"
        )

        print()


# ============================================================
# MAIN
# ============================================================

def main():

    questions = read_csv_file()

    if not questions:

        print()
        print(
            "No valid questions found."
        )

        return

    # --------------------------------------------------------
    # DEDUPLICATE
    # --------------------------------------------------------

    before = len(
        questions
    )

    questions = (
        deduplicate_questions(
            questions
        )
    )

    duplicates_removed = (
        before
        - len(questions)
    )

    print()
    print(
        f"Rows              : "
        f"{len(questions)}"
    )

    print(
        f"Duplicates removed : "
        f"{duplicates_removed}"
    )

    # --------------------------------------------------------
    # EXAMS
    # --------------------------------------------------------

    exams = sorted(
        set(
            question["exam"]
            for question in questions
        )
    )

    subjects = sorted(
        set(
            question["subject"]
            for question in questions
        )
    )

    print(
        f"Exam     : "
        f"{', '.join(exams)}"
    )

    print(
        f"Subjects : "
        f"{', '.join(subjects)}"
    )

    # --------------------------------------------------------
    # BREAKDOWN
    # --------------------------------------------------------

    show_subject_breakdown(
        questions
    )

    # --------------------------------------------------------
    # PREVIEW
    # --------------------------------------------------------

    preview_questions(
        questions
    )

    # --------------------------------------------------------
    # CONFIRM
    # --------------------------------------------------------

    print(
        "The questions above will be uploaded "
        f"to Supabase table: {TABLE_NAME}"
    )

    print()

    response = input(
        "Upload these questions to Supabase? [Y/n]: "
    ).strip().lower()

    if response in [
        "",
        "y",
        "yes",
    ]:

        upload_to_supabase(
            questions
        )

    else:

        print()
        print(
            "Upload cancelled."
        )


# ============================================================
# ENTRY
# ============================================================

if __name__ == "__main__":

    main()
