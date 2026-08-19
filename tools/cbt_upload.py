import csv
import os
import re
import random
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client


# ============================================================
# CONFIGURATION
# ============================================================

# Randomly shuffle A/B/C/D for every question
RANDOMIZE_OPTIONS = True

# ============================================================
# IMPORTANT
#
# FALSE = KEEP existing questions and ADD new questions
#
# TRUE = DELETE ALL existing questions before importing
#
# KEEP THIS FALSE for normal uploads.
# ============================================================

REPLACE_EXISTING_QUESTIONS = False

# Upload in batches
BATCH_SIZE = 500


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
        "Supabase credentials missing. "
        "Check your .env file."
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
        f"CSV file not found:\n{CSV_FILE}"
    )


# ============================================================
# SUPERSCRIPT MAP
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


# ============================================================
# SUBSCRIPT MAP
# ============================================================

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


# ============================================================
# CLEAN LATEX + MARKDOWN
# ============================================================

def clean_latex(text):

    if not text:
        return ""

    text = str(text).strip()

    # --------------------------------------------------------
    # Markdown bold
    # --------------------------------------------------------

    text = re.sub(
        r"\*\*(.*?)\*\*",
        r"\1",
        text,
        flags=re.DOTALL
    )

    # --------------------------------------------------------
    # Markdown italic
    # --------------------------------------------------------

    text = re.sub(
        r"(?<!\*)\*([^*]+)\*(?!\*)",
        r"\1",
        text
    )

    # --------------------------------------------------------
    # Markdown underscore bold
    # --------------------------------------------------------

    text = re.sub(
        r"__([^_]+)__",
        r"\1",
        text
    )

    # --------------------------------------------------------
    # Markdown underscore italic
    # --------------------------------------------------------

    text = re.sub(
        r"(?<!_)_([^_]+)_(?!_)",
        r"\1",
        text
    )

    # --------------------------------------------------------
    # Math delimiters
    # --------------------------------------------------------

    text = text.replace("$", "")
    text = text.replace(r"\(", "")
    text = text.replace(r"\)", "")
    text = text.replace(r"\[", "")
    text = text.replace(r"\]", "")

    # --------------------------------------------------------
    # \text{...}
    # --------------------------------------------------------

    text = re.sub(
        r"\\text\s*\{\s*([^{}]*?)\s*\}",
        r"\1",
        text,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # Other text commands
    # --------------------------------------------------------

    text = re.sub(
        r"\\(?:mathrm|textrm|textnormal|textbf|textit|"
        r"mathbf|mathit|mathsf|mathtt)"
        r"\s*\{\s*([^{}]*?)\s*\}",
        r"\1",
        text,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # Fractions
    # --------------------------------------------------------

    text = re.sub(
        r"\\frac\s*\{\s*([^{}]*)\s*\}"
        r"\s*\{\s*([^{}]*)\s*\}",
        r"\1/\2",
        text,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # Square root
    # --------------------------------------------------------

    text = re.sub(
        r"\\sqrt\s*\{\s*([^{}]*)\s*\}",
        r"√\1",
        text,
        flags=re.IGNORECASE
    )

    # --------------------------------------------------------
    # LaTeX symbols
    # --------------------------------------------------------

    latex_symbols = {
        r"\times": "×",
        r"\cdot": "·",
        r"\div": "÷",
        r"\pm": "±",
        r"\mp": "∓",
        r"\leq": "≤",
        r"\le": "≤",
        r"\geq": "≥",
        r"\ge": "≥",
        r"\neq": "≠",
        r"\approx": "≈",
        r"\infty": "∞",
        r"\pi": "π",
        r"\theta": "θ",
        r"\alpha": "α",
        r"\beta": "β",
        r"\gamma": "γ",
        r"\delta": "δ",
        r"\lambda": "λ",
        r"\mu": "μ",
        r"\sigma": "σ",
        r"\omega": "ω",
        r"\Delta": "Δ",
        r"\degree": "°",
    }

    for latex, symbol in latex_symbols.items():
        text = text.replace(
            latex,
            symbol
        )

    # --------------------------------------------------------
    # LaTeX spacing
    # --------------------------------------------------------

    text = text.replace(
        r"\,",
        " "
    )

    text = text.replace(
        r"\;",
        " "
    )

    text = text.replace(
        r"\:",
        " "
    )

    text = text.replace(
        r"\!",
        ""
    )

    text = text.replace(
        r"\ ",
        " "
    )

    # --------------------------------------------------------
    # Remove remaining LaTeX commands
    # --------------------------------------------------------

    text = re.sub(
        r"\\[A-Za-z]+",
        "",
        text
    )

    # --------------------------------------------------------
    # Remove braces
    # --------------------------------------------------------

    text = text.replace(
        "{",
        ""
    )

    text = text.replace(
        "}",
        ""
    )

    # --------------------------------------------------------
    # Normalize whitespace
    # --------------------------------------------------------

    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


# ============================================================
# UNICODE MATH
# ============================================================

def convert_math_unicode(text):

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

            current_sup.append(
                char
            )

        else:

            flush_sup()

            result.append(
                char
            )

    flush_sup()

    text = "".join(
        result
    )

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

            current_sub.append(
                char
            )

        else:

            flush_sub()

            result.append(
                char
            )

    flush_sub()

    return "".join(
        result
    )


# ============================================================
# FRACTION CONVERTER
# ============================================================

def convert_simple_fractions(text):

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
            f"<span>{numerator}</span>"
            f"<span>{denominator}</span>"
            "</span>"
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

    text = str(
        text
    ).strip()

    text = clean_latex(
        text
    )

    text = convert_math_unicode(
        text
    )

    text = convert_simple_fractions(
        text
    )

    return text


# ============================================================
# ANSWER CLEANER
# ============================================================

def clean_answer(answer):

    if not answer:
        return ""

    answer = str(
        answer
    ).strip().upper()

    # Remove markdown bold
    answer = re.sub(
        r"\*\*(.*?)\*\*",
        r"\1",
        answer
    )

    # Remove markdown underscore bold
    answer = re.sub(
        r"__([^_]+)__",
        r"\1",
        answer
    )

    # Accept:
    #
    # A
    # A.
    # A)
    # A - something
    # A: something

    match = re.match(
        r"^\s*([ABCD])"
        r"(?:\s*[,.:;()\-\u2013\u2014]"
        r"|\s+|$)",
        answer
    )

    if match:

        return match.group(
            1
        )

    if answer in {
        "A",
        "B",
        "C",
        "D"
    }:

        return answer

    return answer


# ============================================================
# RANDOMIZE OPTIONS
# ============================================================

def shuffle_options(
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer
):
    """
    Randomly rearrange the four options.

    The correct answer is recalculated after
    the shuffle.

    Example:

        Original:

        A = Apple
        B = Banana
        C = Orange
        D = Mango

        Correct = C

        After shuffle:

        A = Mango
        B = Orange
        C = Apple
        D = Banana

        New correct answer = B
    """

    original_options = {
        "A": option_a,
        "B": option_b,
        "C": option_c,
        "D": option_d,
    }

    if correct_answer not in original_options:

        raise ValueError(
            f"Invalid correct answer: "
            f"{correct_answer}"
        )

    # --------------------------------------------------------
    # Get the actual correct option text
    # --------------------------------------------------------

    correct_text = original_options[
        correct_answer
    ]

    # --------------------------------------------------------
    # Make list of all option texts
    # --------------------------------------------------------

    options = [
        option_a,
        option_b,
        option_c,
        option_d,
    ]

    # --------------------------------------------------------
    # Shuffle
    # --------------------------------------------------------

    random.shuffle(
        options
    )

    # --------------------------------------------------------
    # Find where correct text moved
    # --------------------------------------------------------

    correct_index = options.index(
        correct_text
    )

    letters = [
        "A",
        "B",
        "C",
        "D"
    ]

    new_answer = letters[
        correct_index
    ]

    return (
        options[0],
        options[1],
        options[2],
        options[3],
        new_answer
    )


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
# QUESTIONS STORAGE
# ============================================================

questions = []

answer_distribution = {
    "A": 0,
    "B": 0,
    "C": 0,
    "D": 0,
}


# ============================================================
# READING CSV
# ============================================================

print()
print("=" * 70)
print("                    READING CSV")
print("=" * 70)
print()

print(
    "CSV:",
    CSV_FILE
)

print()


with open(
    CSV_FILE,
    "r",
    encoding="utf-8-sig",
    newline=""
) as file:

    reader = csv.DictReader(
        file
    )

    actual_columns = set(
        reader.fieldnames or []
    )

    missing_columns = (
        required_columns
        -
        actual_columns
    )

    if missing_columns:

        raise Exception(
            "Missing CSV columns: "
            +
            ", ".join(
                sorted(
                    missing_columns
                )
            )
        )

    print(
        "CSV columns detected:",
        ", ".join(
            reader.fieldnames or []
        )
    )

    print()

    # --------------------------------------------------------
    # READ EVERY ROW
    # --------------------------------------------------------

    for row_number, row in enumerate(
        reader,
        start=2
    ):

        # ----------------------------------------------------
        # Skip empty rows
        # ----------------------------------------------------

        if not any(
            value and value.strip()
            for value in row.values()
            if value is not None
        ):

            continue

        # ----------------------------------------------------
        # READ BASIC FIELDS
        # ----------------------------------------------------

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

        answer = clean_answer(
            row.get("answer") or ""
        )

        reason = (
            row.get("reason") or ""
        ).strip()

        # ----------------------------------------------------
        # Optional image
        # ----------------------------------------------------

        image = (
            row.get("image") or ""
        ).strip()

        # ----------------------------------------------------
        # VALIDATION
        # ----------------------------------------------------

        if not exam:

            raise ValueError(
                f"Row {row_number}: "
                f"exam is empty."
            )

        if not subject:

            raise ValueError(
                f"Row {row_number}: "
                f"subject is empty."
            )

        if not question:

            raise ValueError(
                f"Row {row_number}: "
                f"question is empty."
            )

        if not option_a:

            raise ValueError(
                f"Row {row_number}: "
                f"optionA is empty."
            )

        if not option_b:

            raise ValueError(
                f"Row {row_number}: "
                f"optionB is empty."
            )

        if not option_c:

            raise ValueError(
                f"Row {row_number}: "
                f"optionC is empty."
            )

        if not option_d:

            raise ValueError(
                f"Row {row_number}: "
                f"optionD is empty."
            )

        if answer not in {
            "A",
            "B",
            "C",
            "D"
        }:

            raise ValueError(
                f"Row {row_number}: "
                f"invalid answer "
                f"'{answer}'. "
                f"Answer must be "
                f"A, B, C or D."
            )

        if not reason:

            raise ValueError(
                f"\nRow {row_number} "
                f"is missing a reason.\n"
                f"Question: {question}\n"
                f"Answer: {answer}\n"
            )

        # ----------------------------------------------------
        # FORMAT CONTENT
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # SAVE ORIGINAL ANSWER
        # ----------------------------------------------------

        original_answer = answer

        # ----------------------------------------------------
        # SHUFFLE OPTIONS
        # ----------------------------------------------------

        if RANDOMIZE_OPTIONS:

            (
                option_a,
                option_b,
                option_c,
                option_d,
                new_answer
            ) = shuffle_options(
                option_a,
                option_b,
                option_c,
                option_d,
                answer
            )

        else:

            new_answer = answer

        # ----------------------------------------------------
        # COUNT NEW ANSWER
        # ----------------------------------------------------

        answer_distribution[
            new_answer
        ] += 1

        # ----------------------------------------------------
        # BUILD JSONB OPTIONS
        # ----------------------------------------------------

        options_json = {
            "A": option_a,
            "B": option_b,
            "C": option_c,
            "D": option_d,
        }

        # ----------------------------------------------------
        # BUILD DATABASE ROW
        #
        # DATABASE:
        #
        # id
        # exam
        # subject
        # question
        # options JSONB
        # answer
        # image
        # created_at
        # reason
        #
        # id and created_at are NOT supplied.
        # PostgreSQL generates them.
        # ----------------------------------------------------

        question_data = {
            "exam": exam,
            "subject": subject,
            "question": question,
            "options": options_json,
            "answer": new_answer,
            "reason": reason,
            "image": image if image else None,
        }

        questions.append(
            question_data
        )

        # ----------------------------------------------------
        # DISPLAY
        # ----------------------------------------------------

        print(
            f"Q{len(questions):04d} | "
            f"{subject:<25} | "
            f"{original_answer} -> "
            f"{new_answer}"
        )


# ============================================================
# CHECK QUESTIONS
# ============================================================

if not questions:

    print()
    print(
        "ERROR: No questions found in CSV."
    )

    raise SystemExit(1)


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 70)
print("                 CBT QUESTION IMPORT")
print("=" * 70)

print()

print(
    f"CSV: {CSV_FILE}"
)

print(
    f"Questions prepared: "
    f"{len(questions)}"
)

print()

print(
    "NEW ANSWER DISTRIBUTION"
)

print("-" * 30)

print(
    f"A = {answer_distribution['A']}"
)

print(
    f"B = {answer_distribution['B']}"
)

print(
    f"C = {answer_distribution['C']}"
)

print(
    f"D = {answer_distribution['D']}"
)

print()

print(
    "Option shuffling:",
    "ENABLED"
    if RANDOMIZE_OPTIONS
    else "DISABLED"
)

print(
    "Replace existing questions:",
    "YES"
    if REPLACE_EXISTING_QUESTIONS
    else "NO"
)

print()

print(
    "Database schema:"
)

print(
    "id | exam | subject | question | "
    "options(JSONB) | answer | image | "
    "created_at | reason"
)

print()

print("=" * 70)
print()


# ============================================================
# SAFETY PREVIEW
# ============================================================

print("=" * 70)
print("                 FIRST QUESTION PREVIEW")
print("=" * 70)

first = questions[0]

print()

print("Exam:")
print(
    first["exam"]
)

print()

print("Subject:")
print(
    first["subject"]
)

print()

print("Question:")
print(
    first["question"]
)

print()

print("Options:")

print(
    "A:",
    first["options"]["A"]
)

print(
    "B:",
    first["options"]["B"]
)

print(
    "C:",
    first["options"]["C"]
)

print(
    "D:",
    first["options"]["D"]
)

print()

print("Correct Answer:")
print(
    first["answer"]
)

print()

print("Reason:")
print(
    first["reason"]
)

print()

print("=" * 70)
print()


# ============================================================
# DELETE EXISTING QUESTIONS ONLY IF ENABLED
# ============================================================

if REPLACE_EXISTING_QUESTIONS:

    print(
        "WARNING: REPLACE_EXISTING_QUESTIONS = TRUE"
    )

    print(
        "Deleting existing cbt_questions..."
    )

    try:

        (
            supabase
            .table("cbt_questions")
            .delete()
            .not_.is_(
                "id",
                "null"
            )
            .execute()
        )

        print(
            "Existing questions deleted."
        )

    except Exception as error:

        print()
        print(
            "DATABASE DELETE FAILED"
        )

        print(
            error
        )

        raise SystemExit(1)

else:

    # --------------------------------------------------------
    # THIS IS THE NORMAL MODE
    # --------------------------------------------------------

    print(
        "KEEPING EXISTING QUESTIONS."
    )

    print(
        "New questions will be ADDED."
    )

    print()


# ============================================================
# UPLOAD IN BATCHES
# ============================================================

total_uploaded = 0

print()
print(
    "Uploading questions..."
)

print()


try:

    for start in range(
        0,
        len(questions),
        BATCH_SIZE
    ):

        batch = questions[
            start:start + BATCH_SIZE
        ]

        (
            supabase
            .table("cbt_questions")
            .insert(batch)
            .execute()
        )

        total_uploaded += len(
            batch
        )

        print(
            f"Uploaded "
            f"{total_uploaded}/"
            f"{len(questions)}"
        )


except Exception as error:

    print()
    print("=" * 70)
    print("                     UPLOAD FAILED")
    print("=" * 70)
    print()

    print(
        error
    )

    print()

    print(
        "The importer stopped."
    )

    print(
        "Check the database schema "
        "and the error above."
    )

    print()

    raise SystemExit(1)


# ============================================================
# FINAL RESULT
# ============================================================

print()
print("=" * 70)
print("              IMPORT COMPLETED")
print("=" * 70)

print()

print(
    f"Total uploaded: "
    f"{total_uploaded}"
)

print()

print(
    "ANSWER DISTRIBUTION"
)

print("-" * 30)

print(
    f"A = {answer_distribution['A']}"
)

print(
    f"B = {answer_distribution['B']}"
)

print(
    f"C = {answer_distribution['C']}"
)

print(
    f"D = {answer_distribution['D']}"
)

print()

print(
    "✓ Existing questions were NOT deleted."
    if not REPLACE_EXISTING_QUESTIONS
    else "✓ Existing questions were replaced."
)

print(
    "✓ New questions were added."
)

print(
    "✓ Options were randomly shuffled."
)

print(
    "✓ Correct-answer letters were updated."
)

print(
    "✓ Options stored in JSONB."
)

print(
    "✓ Reasons preserved."
)

print(
    "✓ Images preserved when supplied."
)

print(
    "✓ id generated by database."
)

print(
    "✓ created_at generated by database."
)

print()

print("=" * 70)
print()