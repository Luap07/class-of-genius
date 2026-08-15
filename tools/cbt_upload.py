import csv
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

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


# ============================================================
# CONNECT TO SUPABASE
# ============================================================

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# ============================================================
# CSV LOCATION
# ============================================================

CSV_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "cbt_questions.csv"
)

if not CSV_FILE.exists():
    raise FileNotFoundError(
        f"CSV file not found: {CSV_FILE}"
    )


# ============================================================
# MATHEMATICAL TEXT CONVERTER
#
# Converts Unicode mathematical notation into HTML that
# CBTExam.jsx can render correctly.
# ============================================================

SUPERSCRIPT_MAP = str.maketrans({
    "⁰": "0",
    "¹": "1",
    "²": "2",
    "³": "3",
    "⁴": "4",
    "⁵": "5",
    "⁶": "6",
    "⁷": "7",
    "⁸": "8",
    "⁹": "9",
    "⁺": "+",
    "⁻": "−",
    "⁼": "=",
    "⁽": "(",
    "⁾": ")",
    "ⁿ": "n",
})

SUBSCRIPT_MAP = str.maketrans({
    "₀": "0",
    "₁": "1",
    "₂": "2",
    "₃": "3",
    "₄": "4",
    "₅": "5",
    "₆": "6",
    "₇": "7",
    "₈": "8",
    "₉": "9",
    "₊": "+",
    "₋": "−",
    "₌": "=",
    "₍": "(",
    "₎": ")",
    "ₙ": "n",
})


def convert_math_unicode(text):
    """
    Converts Unicode powers/subscripts into HTML.

    Examples:

        m²       -> m<sup>2</sup>
        m⁻²      -> m<sup>−2</sup>
        kg m⁻³   -> kg m<sup>−3</sup>
        x₂       -> x<sub>2</sub>
    """

    if not text:
        return ""

    text = str(text)

    # --------------------------------------------------------
    # SUPERSCRIPTS
    # --------------------------------------------------------

    superscript_chars = set(
        "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ"
    )

    result = []
    current_sup = []

    def flush_sup():
        nonlocal current_sup

        if current_sup:
            converted = "".join(
                current_sup
            ).translate(
                SUPERSCRIPT_MAP
            )

            result.append(
                f"<sup>{converted}</sup>"
            )

            current_sup = []

    for char in text:

        if char in superscript_chars:
            current_sup.append(char)

        else:
            flush_sup()
            result.append(char)

    flush_sup()

    text = "".join(result)


    # --------------------------------------------------------
    # SUBSCRIPTS
    # --------------------------------------------------------

    subscript_chars = set(
        "₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₙ"
    )

    result = []
    current_sub = []

    def flush_sub():
        nonlocal current_sub

        if current_sub:
            converted = "".join(
                current_sub
            ).translate(
                SUBSCRIPT_MAP
            )

            result.append(
                f"<sub>{converted}</sub>"
            )

            current_sub = []

    for char in text:

        if char in subscript_chars:
            current_sub.append(char)

        else:
            flush_sub()
            result.append(char)

    flush_sub()

    text = "".join(result)

    return text


# ============================================================
# FRACTION CONVERTER
# ============================================================

def convert_simple_fractions(text):
    """
    Converts simple mathematical fractions.

    Example:

        1/2 -> HTML fraction

    We deliberately avoid converting dates, URLs,
    normal text paths, etc.
    """

    if not text:
        return ""

    fraction_pattern = re.compile(
        r"(?<![\w.])"
        r"(\d+)"
        r"/"
        r"(\d+)"
        r"(?![\w.])"
    )

    def replace_fraction(match):

        numerator = match.group(1)
        denominator = match.group(2)

        return (
            '<span class="math-fraction">'
            f'<span>{numerator}</span>'
            f'<span>{denominator}</span>'
            '</span>'
        )

    return fraction_pattern.sub(
        replace_fraction,
        text
    )


# ============================================================
# COMPLETE MATH FORMATTER
# ============================================================

def format_math(text):

    if not text:
        return ""

    text = str(text).strip()

    # First convert Unicode powers/subscripts.
    text = convert_math_unicode(text)

    # Then convert simple fractions.
    text = convert_simple_fractions(text)

    return text


# ============================================================
# REQUIRED CSV COLUMNS
# ============================================================

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


# ============================================================
# READ QUESTIONS
# ============================================================

questions = []

with open(
    CSV_FILE,
    "r",
    encoding="utf-8-sig",
    newline=""
) as file:

    reader = csv.DictReader(file)

    actual_columns = set(
        reader.fieldnames or []
    )

    missing_columns = (
        required_columns -
        actual_columns
    )

    if missing_columns:
        raise Exception(
            "Missing CSV columns: "
            + ", ".join(
                sorted(missing_columns)
            )
        )

    for row_number, row in enumerate(
        reader,
        start=2
    ):

        # ====================================================
        # SKIP EMPTY ROWS
        # ====================================================

        if not any(
            value and value.strip()
            for value in row.values()
            if value is not None
        ):
            continue


        # ====================================================
        # GET VALUES
        # ====================================================

        exam = (
            row.get("exam") or ""
        ).strip()

        subject = (
            row.get("subject") or ""
        ).strip()

        question = (
            row.get("question") or ""
        ).strip()

        option_a = (
            row.get("optionA") or ""
        ).strip()

        option_b = (
            row.get("optionB") or ""
        ).strip()

        option_c = (
            row.get("optionC") or ""
        ).strip()

        option_d = (
            row.get("optionD") or ""
        ).strip()

        answer = (
            row.get("answer") or ""
        ).strip().upper()

        reason = (
            row.get("reason") or ""
        ).strip()


        # ====================================================
        # VALIDATION
        # ====================================================

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

        if answer not in {
            "A",
            "B",
            "C",
            "D",
        }:
            raise ValueError(
                f"Row {row_number}: invalid answer "
                f"'{answer}'. "
                "Answer must be A, B, C, or D."
            )

        if not reason:
            raise ValueError(
                f"\n❌ Row {row_number} is missing a reason.\n"
                f"Question: {question}\n"
                f"Answer: {answer}\n\n"
                "Add a reason to this row in "
                "cbt_questions.csv."
            )


        # ====================================================
        # FORMAT MATHEMATICS
        # ====================================================

        question = format_math(
            question
        )

        option_a = format_math(
            option_a
        )

        option_b = format_math(
            option_b
        )

        option_c = format_math(
            option_c
        )

        option_d = format_math(
            option_d
        )

        reason = format_math(
            reason
        )


        # ====================================================
        # BUILD QUESTION
        # ====================================================

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


# ============================================================
# CHECK QUESTIONS
# ============================================================

if not questions:
    print(
        "⚠️ No questions found in CSV."
    )
    raise SystemExit


# ============================================================
# DISPLAY SUMMARY
# ============================================================

print()
print(
    "================================"
)
print(
    "       CBT QUESTION IMPORT"
)
print(
    "================================"
)

print(
    f"CSV file: {CSV_FILE}"
)

print(
    f"Total questions: {len(questions)}"
)

print(
    "Reason column: ENABLED"
)

print(
    "Mathematical formatting: ENABLED"
)

print(
    "Superscripts: ENABLED"
)

print(
    "Subscripts: ENABLED"
)

print(
    "Fractions: ENABLED"
)

print(
    "================================"
)

print()


# ============================================================
# UPLOAD
# ============================================================

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