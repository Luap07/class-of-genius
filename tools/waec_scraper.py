import csv
import hashlib
import re
import sys
import time
from collections import deque
from pathlib import Path
from urllib.parse import urljoin, urlparse, urldefrag

import requests
from bs4 import BeautifulSoup


# ============================================================
# CONFIGURATION
# ============================================================

START_URLS = [
    # WAEC Online Mathematics
    "https://www.waeconline.org.ng/e-Learning/Mathematics/mathsmain.html",

    # Add other sources here.
    # Example:
    # "https://myschoolgist.com/news/waec-mathematics-past-questions/",
]

OUTPUT_DIR = Path("data")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "waec_questions.csv"

MAX_PAGES = 5000
MAX_QUESTIONS = 50000

REQUEST_DELAY = 0.8
TIMEOUT = 25

# Print every successfully extracted question
SHOW_QUESTIONS = True

# Print rejected blocks when debugging extraction
SHOW_REJECTED = False

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 "
        "(KHTML, like Gecko) "
        "Chrome/151.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,"
        "application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
}


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
# SESSION
# ============================================================

session = requests.Session()
session.headers.update(HEADERS)


# ============================================================
# SUBJECT ALIASES
# ============================================================

SUBJECT_ALIASES = {
    "english": "English Language",
    "english language": "English Language",

    "mathematics": "Mathematics",
    "math": "Mathematics",
    "maths": "Mathematics",

    "further mathematics": "Further Mathematics",
    "further maths": "Further Mathematics",

    "biology": "Biology",
    "chemistry": "Chemistry",
    "physics": "Physics",

    "geography": "Geography",
    "economics": "Economics",
    "government": "Government",
    "history": "History",
    "commerce": "Commerce",
    "accounting": "Accounting",

    "literature": "Literature in English",
    "literature in english": "Literature in English",

    "agric": "Agricultural Science",
    "agriculture": "Agricultural Science",
    "agricultural science": "Agricultural Science",

    "health education": "Health Education",
    "physical education": "Physical Education",

    "computer": "Computer Studies",
    "computer studies": "Computer Studies",
    "data processing": "Data Processing",

    "civic education": "Civic Education",

    "technical drawing": "Technical Drawing",

    "food and nutrition": "Food and Nutrition",
    "home economics": "Home Economics",

    "office practice": "Office Practice",
    "office": "Office Practice",

    "marketing": "Marketing",
    "insurance": "Insurance",

    "building construction": "Building Construction",
    "woodwork": "Woodwork",
    "metalwork": "Metalwork",
    "electrical installation": "Electrical Installation",
    "auto mechanics": "Auto Mechanics",
    "automobile": "Auto Mechanics",
}


YEAR_PATTERN = re.compile(r"\b(?:19|20)\d{2}\b")


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
    value = value.replace("\r", " ")
    value = value.replace("\n", " ")
    value = value.replace("\t", " ")

    value = re.sub(r"\s+", " ", value)

    return value.strip()


def normalize_text(value):
    return clean_text(value).lower()


def normalize_subject(value):
    value = clean_text(value)
    lower = value.lower()

    if lower in SUBJECT_ALIASES:
        return SUBJECT_ALIASES[lower]

    for key, subject in SUBJECT_ALIASES.items():
        if lower == key:
            return subject

    return value


def make_hash(value):
    return hashlib.sha256(
        normalize_text(value).encode("utf-8")
    ).hexdigest()


# ============================================================
# URL HELPERS
# ============================================================

def normalize_url(url):
    url = url.strip()

    url = urldefrag(url)[0]

    parsed = urlparse(url)

    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    path = parsed.path or "/"

    path = re.sub(r"/+", "/", path)

    result = f"{scheme}://{netloc}{path}"

    if parsed.query:
        result += f"?{parsed.query}"

    return result


def same_domain(url, base_url):
    return (
        urlparse(url).netloc.lower()
        == urlparse(base_url).netloc.lower()
    )


def is_web_page(url):
    path = urlparse(url).path.lower()

    blocked = (
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
        ".ico",
        ".pdf",
        ".mp4",
        ".mp3",
        ".wav",
        ".zip",
        ".rar",
        ".7z",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".css",
        ".js",
        ".json",
        ".xml",
    )

    return not path.endswith(blocked)


# ============================================================
# FETCH
# ============================================================

def fetch(url):
    print()
    print("=" * 80)
    print(f"[FETCH] {url}")
    print("=" * 80)

    try:
        response = session.get(
            url,
            timeout=TIMEOUT,
            allow_redirects=True,
        )

        response.raise_for_status()

        content_type = (
            response.headers
            .get("Content-Type", "")
            .lower()
        )

        if (
            "text/html" not in content_type
            and "application/xhtml" not in content_type
        ):
            print(
                f"[SKIP] Content type: {content_type}"
            )
            return None

        print(
            f"[OK] HTTP {response.status_code} "
            f"| {len(response.text):,} characters"
        )

        time.sleep(REQUEST_DELAY)

        return response.text

    except requests.RequestException as exc:
        print(f"[ERROR] {url}")
        print(f"        {exc}")
        return None


# ============================================================
# SUBJECT DETECTION
# ============================================================

def infer_subject_from_url(url):
    path = urlparse(url).path.lower()

    checks = [
        ("mathemat", "Mathematics"),
        ("english", "English Language"),
        ("biology", "Biology"),
        ("chem", "Chemistry"),
        ("physics", "Physics"),
        ("geograph", "Geography"),
        ("econom", "Economics"),
        ("government", "Government"),
        ("history", "History"),
        ("commerce", "Commerce"),
        ("account", "Accounting"),
        ("agric", "Agricultural Science"),
        ("technical", "Technical Drawing"),
        ("computer", "Computer Studies"),
        ("office", "Office Practice"),
        ("marketing", "Marketing"),
        ("insurance", "Insurance"),
        ("woodwork", "Woodwork"),
        ("metalwork", "Metalwork"),
        ("building", "Building Construction"),
        ("electrical", "Electrical Installation"),
        ("automobile", "Auto Mechanics"),
        ("mechanic", "Auto Mechanics"),
    ]

    for keyword, subject in checks:
        if keyword in path:
            return subject

    return ""


def infer_subject_from_text(text):
    text = normalize_text(text)

    # Longest names first
    aliases = sorted(
        SUBJECT_ALIASES.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    )

    for alias, subject in aliases:
        if re.search(
            rf"\b{re.escape(alias)}\b",
            text,
        ):
            return subject

    return ""


def infer_year(text, url=""):
    match = YEAR_PATTERN.search(url)

    if match:
        return match.group(0)

    match = YEAR_PATTERN.search(text)

    if match:
        return match.group(0)

    return ""


def infer_metadata(html, url):
    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    title = ""

    if soup.title:
        title = clean_text(
            soup.title.get_text(
                " ",
                strip=True,
            )
        )

    headings = []

    for tag in soup.find_all(
        ["h1", "h2", "h3", "h4", "title"]
    ):
        text = clean_text(
            tag.get_text(
                " ",
                strip=True,
            )
        )

        if text:
            headings.append(text)

    combined = " ".join(
        [title, *headings[:10]]
    )

    subject = infer_subject_from_url(url)

    if not subject:
        subject = infer_subject_from_text(
            combined
        )

    if not subject:
        subject = infer_subject_from_text(
            url
        )

    year = infer_year(
        combined,
        url,
    )

    return (
        normalize_subject(subject),
        year,
    )


# ============================================================
# LINK DISCOVERY
# ============================================================

def extract_links(html, current_url, base_url):
    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    links = set()

    for anchor in soup.find_all(
        "a",
        href=True,
    ):
        href = clean_text(
            anchor.get("href", "")
        )

        if not href:
            continue

        lower = href.lower()

        if lower.startswith(
            (
                "#",
                "mailto:",
                "javascript:",
                "tel:",
            )
        ):
            continue

        absolute = urljoin(
            current_url,
            href,
        )

        absolute = normalize_url(
            absolute
        )

        if not same_domain(
            absolute,
            base_url,
        ):
            continue

        if not is_web_page(
            absolute
        ):
            continue

        links.add(absolute)

    return links


# ============================================================
# QUESTION / OPTION PATTERNS
# ============================================================

QUESTION_START = re.compile(
    r"^\s*"
    r"(?:question\s*)?"
    r"(\d{1,3})"
    r"\s*[\.\):\-]\s*"
    r"(.+)$",
    re.I,
)


OPTION_PATTERN = re.compile(
    r"^\s*"
    r"[\(\[]?"
    r"([A-Da-d])"
    r"[\)\]\.\:\-]"
    r"\s*(.+?)"
    r"\s*$"
)


ANSWER_PATTERN = re.compile(
    r"\b"
    r"(?:correct\s+answer|"
    r"correct\s+option|"
    r"answer|"
    r"ans)"
    r"\s*"
    r"[\:\-\=]?\s*"
    r"[\(\[]?"
    r"([A-Da-d])"
    r"[\)\]\.]?"
    r"\b",
    re.I,
)


REASON_PATTERN = re.compile(
    r"\b"
    r"(?:reason|"
    r"explanation|"
    r"solution|"
    r"correct\s+answer\s+because)"
    r"\s*"
    r"[\:\-]\s*"
    r"(.+)$",
    re.I,
)


# ============================================================
# OPTION PARSING
# ============================================================

def parse_option(text):
    text = clean_text(text)

    match = OPTION_PATTERN.match(
        text
    )

    if not match:
        return None, None

    letter = match.group(1).upper()
    value = clean_text(
        match.group(2)
    )

    if not value:
        return None, None

    return letter, value


def extract_options_from_text_lines(lines):
    options = {
        "A": "",
        "B": "",
        "C": "",
        "D": "",
    }

    current = None

    for line in lines:
        line = clean_text(line)

        if not line:
            continue

        letter, value = parse_option(
            line
        )

        if letter in options:
            options[letter] = value
            current = letter
            continue

        # Handle wrapped option text
        if current and len(line) > 1:
            options[current] = clean_text(
                options[current] + " " + line
            )

    return options


# ============================================================
# ANSWER / REASON
# ============================================================

def extract_answer(text):
    text = clean_text(text)

    match = ANSWER_PATTERN.search(
        text
    )

    if match:
        return match.group(1).upper()

    # Additional formats:
    # Correct: A
    # Ans A
    # Answer = B
    patterns = [
        r"\bcorrect\s*[:\-]\s*([A-D])\b",
        r"\bans\s*[:\-]?\s*([A-D])\b",
        r"\bkey\s*[:\-]\s*([A-D])\b",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.I,
        )

        if match:
            return match.group(1).upper()

    return ""


def extract_reason(text):
    text = clean_text(text)

    match = REASON_PATTERN.search(
        text
    )

    if match:
        reason = clean_text(
            match.group(1)
        )

        if reason:
            return reason

    return "No explanation provided."


# ============================================================
# QUESTION BLOCKS
# ============================================================

def get_candidate_elements(soup):
    candidates = []

    # Tables are very common on old WAEC pages.
    candidates.extend(
        soup.find_all("tr")
    )

    # Div/p/article structures are common
    # on modern question sites.
    candidates.extend(
        soup.find_all(
            [
                "article",
                "section",
                "div",
                "li",
            ]
        )
    )

    return candidates


def element_lines(element):
    # First try direct text lines.
    raw = element.get_text(
        "\n",
        strip=True,
    )

    lines = []

    for line in raw.splitlines():
        line = clean_text(line)

        if line:
            lines.append(line)

    return lines


def find_question_number(line):
    match = QUESTION_START.match(
        clean_text(line)
    )

    if not match:
        return None, None

    number = match.group(1)
    question_text = clean_text(
        match.group(2)
    )

    return number, question_text


def looks_like_question_text(text):
    text = clean_text(text)

    if len(text) < 10:
        return False

    if text.endswith("?"):
        return True

    if re.search(
        r"\b(?:find|calculate|which|what|"
        r"determine|select|choose|given|"
        r"solve|evaluate|identify|state|"
        r"according)\b",
        text,
        re.I,
    ):
        return True

    return False


# ============================================================
# EXTRACT ONE BLOCK
# ============================================================

def extract_from_element(
    element,
    subject,
    year,
):
    lines = element_lines(
        element
    )

    if not lines:
        return None

    # Avoid giant page containers.
    if len(lines) > 100:
        return None

    question_number = ""
    question_text = ""

    question_index = None

    # Find the numbered question.
    for index, line in enumerate(lines):

        number, text = find_question_number(
            line
        )

        if number:
            question_number = number
            question_text = text
            question_index = index
            break

    # Some pages don't number questions in
    # normal text, so look for a question-like line.
    if not question_text:

        for index, line in enumerate(lines):

            if looks_like_question_text(
                line
            ):
                question_text = line
                question_index = index
                break

    if not question_text:
        return None

    # Collect options from the entire block.
    options = extract_options_from_text_lines(
        lines
    )

    if not all(
        options[key]
        for key in ("A", "B", "C", "D")
    ):
        return None

    full_text = " ".join(lines)

    answer = extract_answer(
        full_text
    )

    if answer not in {
        "A",
        "B",
        "C",
        "D",
    }:
        return None

    reason = extract_reason(
        full_text
    )

    # Remove accidental trailing answer/reason
    # from question text.
    question_text = re.sub(
        r"\s+(?:answer|ans|correct answer)"
        r"\s*[:\-=\s].*$",
        "",
        question_text,
        flags=re.I,
    )

    question_text = clean_text(
        question_text
    )

    if len(question_text) < 8:
        return None

    return {
        "exam": "WAEC",
        "subject": subject or "Unknown",
        "question": question_text,
        "optionA": options["A"],
        "optionB": options["B"],
        "optionC": options["C"],
        "optionD": options["D"],
        "answer": answer,
        "reason": reason,
    }


# ============================================================
# FALLBACK EXTRACTION
# ============================================================

def extract_by_text_sequence(
    soup,
    subject,
    year,
):
    """
    Fallback for pages where questions are not wrapped
    in useful div/tr elements.

    Looks through visible text and groups:

        question
        A...
        B...
        C...
        D...
        answer...

    """

    text = soup.get_text(
        "\n",
        strip=True,
    )

    lines = [
        clean_text(line)
        for line in text.splitlines()
        if clean_text(line)
    ]

    records = []

    current_question = None
    current_lines = []

    def flush():
        nonlocal current_question
        nonlocal current_lines

        if not current_question:
            return

        fake_text = "\n".join(
            current_lines
        )

        options = (
            extract_options_from_text_lines(
                current_lines
            )
        )

        if not all(
            options[key]
            for key in ("A", "B", "C", "D")
        ):
            current_question = None
            current_lines = []
            return

        answer = extract_answer(
            fake_text
        )

        if answer not in {
            "A",
            "B",
            "C",
            "D",
        }:
            current_question = None
            current_lines = []
            return

        record = {
            "exam": "WAEC",
            "subject": subject or "Unknown",
            "question": current_question,
            "optionA": options["A"],
            "optionB": options["B"],
            "optionC": options["C"],
            "optionD": options["D"],
            "answer": answer,
            "reason": extract_reason(
                fake_text
            ),
        }

        records.append(record)

        current_question = None
        current_lines = []

    for line in lines:

        number, question = find_question_number(
            line
        )

        if number:

            flush()

            current_question = clean_text(
                question
            )

            current_lines = [line]

            continue

        if current_question:
            current_lines.append(
                line
            )

    flush()

    return records


# ============================================================
# PAGE EXTRACTION
# ============================================================

def extract_questions_from_page(
    html,
    subject,
    year,
):
    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    records = []

    seen_local = set()

    candidates = get_candidate_elements(
        soup
    )

    for element in candidates:

        record = extract_from_element(
            element,
            subject,
            year,
        )

        if not record:
            continue

        fingerprint = question_fingerprint(
            record
        )

        if fingerprint in seen_local:
            continue

        seen_local.add(
            fingerprint
        )

        records.append(
            record
        )

    # Fallback if normal block extraction
    # found nothing.
    if not records:
        fallback = extract_by_text_sequence(
            soup,
            subject,
            year,
        )

        for record in fallback:

            fingerprint = question_fingerprint(
                record
            )

            if fingerprint in seen_local:
                continue

            seen_local.add(
                fingerprint
            )

            records.append(
                record
            )

    return records


# ============================================================
# FINGERPRINT
# ============================================================

def question_fingerprint(row):
    values = [
        row.get("subject", ""),
        row.get("question", ""),
        row.get("optionA", ""),
        row.get("optionB", ""),
        row.get("optionC", ""),
        row.get("optionD", ""),
        row.get("answer", ""),
    ]

    combined = "||".join(
        normalize_text(value)
        for value in values
    )

    return hashlib.sha256(
        combined.encode("utf-8")
    ).hexdigest()


# ============================================================
# PRINT QUESTION
# ============================================================

def print_question(
    record,
    number,
    source_url,
    status,
):
    print()
    print("┌" + "─" * 78 + "┐")
    print(
        f"│ QUESTION #{number:<67}│"
    )
    print("├" + "─" * 78 + "┤")

    print(
        f"│ Subject: {record['subject']:<68}│"
    )

    print(
        f"│ Exam:    {record['exam']:<68}│"
    )

    print(
        f"│ Source:  {source_url[:66]:<68}│"
    )

    print("├" + "─" * 78 + "┤")

    print(
        f"│ Q: {record['question'][:73]}"
    )

    if len(record["question"]) > 73:
        print(
            f"│    {record['question'][73:]:<75}"
        )

    print(
        f"│ A. {record['optionA'][:72]}"
    )

    print(
        f"│ B. {record['optionB'][:72]}"
    )

    print(
        f"│ C. {record['optionC'][:72]}"
    )

    print(
        f"│ D. {record['optionD'][:72]}"
    )

    print("├" + "─" * 78 + "┤")

    print(
        f"│ ANSWER: {record['answer']:<67}│"
    )

    print(
        f"│ STATUS: {status:<67}│"
    )

    print(
        "└" + "─" * 78 + "┘"
    )


# ============================================================
# VALIDATION
# ============================================================

def validate_row(row):
    for column in CSV_COLUMNS:

        if column not in row:
            return False

        if not clean_text(
            row[column]
        ):
            return False

    if row["answer"].upper() not in {
        "A",
        "B",
        "C",
        "D",
    }:
        return False

    return True


def normalize_rows(rows):
    output = []

    for row in rows:

        cleaned = {}

        for column in CSV_COLUMNS:
            cleaned[column] = clean_text(
                row.get(
                    column,
                    "",
                )
            )

        cleaned["exam"] = "WAEC"

        cleaned["subject"] = (
            normalize_subject(
                cleaned["subject"]
            )
            or "Unknown"
        )

        cleaned["answer"] = (
            cleaned["answer"]
            .upper()
        )

        if not validate_row(
            cleaned
        ):
            continue

        output.append(
            cleaned
        )

    return output


# ============================================================
# CSV
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

        writer.writerows(
            rows
        )

    print()
    print("=" * 80)
    print("CSV CREATED")
    print("=" * 80)
    print(
        f"FILE:      {OUTPUT_FILE}"
    )
    print(
        f"QUESTIONS: {len(rows):,}"
    )
    print("=" * 80)


# ============================================================
# CRAWLER
# ============================================================

class Crawler:

    def __init__(
        self,
        start_url,
    ):
        self.start_url = normalize_url(
            start_url
        )

        self.queue = deque(
            [self.start_url]
        )

        self.queued = {
            self.start_url
        }

        self.visited = set()

        self.questions = []

        self.question_hashes = set()

        self.pages_with_questions = 0

        self.total_candidates = 0

        self.duplicates = 0

        self.rejected = 0

    def should_visit(self, url):
        url = normalize_url(url)

        if not same_domain(
            url,
            self.start_url,
        ):
            return False

        if url in self.visited:
            return False

        if not is_web_page(url):
            return False

        return True

    def add_url(self, url):
        url = normalize_url(url)

        if not self.should_visit(
            url
        ):
            return False

        if url in self.queued:
            return False

        self.queue.append(
            url
        )

        self.queued.add(
            url
        )

        return True

    def add_question(
        self,
        record,
        source_url,
    ):
        fingerprint = (
            question_fingerprint(
                record
            )
        )

        self.total_candidates += 1

        if fingerprint in self.question_hashes:

            self.duplicates += 1

            if SHOW_QUESTIONS:
                print_question(
                    record,
                    len(
                        self.questions
                    ) + 1,
                    source_url,
                    "DUPLICATE",
                )

            return False

        if len(
            self.questions
        ) >= MAX_QUESTIONS:
            return False

        self.question_hashes.add(
            fingerprint
        )

        self.questions.append(
            record
        )

        if SHOW_QUESTIONS:
            print_question(
                record,
                len(
                    self.questions
                ),
                source_url,
                "✓ ADDED",
            )

        return True

    def run(self):

        pages = 0

        while (
            self.queue
            and pages < MAX_PAGES
            and len(
                self.questions
            ) < MAX_QUESTIONS
        ):

            url = self.queue.popleft()

            if not self.should_visit(
                url
            ):
                continue

            self.visited.add(
                url
            )

            html = fetch(
                url
            )

            if not html:
                continue

            pages += 1

            subject, year = infer_metadata(
                html,
                url,
            )

            print()
            print(
                f"[PAGE {pages}/{MAX_PAGES}]"
            )

            print(
                f"[SUBJECT] "
                f"{subject or 'Unknown'}"
            )

            print(
                f"[YEAR] "
                f"{year or 'Unknown'}"
            )

            records = (
                extract_questions_from_page(
                    html,
                    subject,
                    year,
                )
            )

            if records:

                self.pages_with_questions += 1

                print()
                print(
                    f"[FOUND] "
                    f"{len(records)} "
                    f"question(s)"
                )

                for record in records:

                    if len(
                        self.questions
                    ) >= MAX_QUESTIONS:
                        break

                    self.add_question(
                        record,
                        url,
                    )

            else:
                print(
                    "[FOUND] No valid "
                    "questions on this page"
                )

            if (
                len(self.questions)
                >= MAX_QUESTIONS
            ):
                print()
                print(
                    "QUESTION LIMIT REACHED"
                )
                break

            links = extract_links(
                html,
                url,
                self.start_url,
            )

            added_links = 0

            for link in links:

                if self.add_url(
                    link
                ):
                    added_links += 1

            print(
                f"[LINKS] +{added_links}"
            )

            print(
                f"[QUEUE] "
                f"{len(self.queue)}"
            )

            print(
                f"[TOTAL QUESTIONS] "
                f"{len(self.questions):,}"
            )

        return self.questions


# ============================================================
# STATISTICS
# ============================================================

def print_statistics(
    rows,
    crawler,
):
    subjects = {}

    for row in rows:

        subject = (
            row["subject"]
            or "Unknown"
        )

        subjects[subject] = (
            subjects.get(
                subject,
                0,
            )
            + 1
        )

    print()
    print("=" * 80)
    print("SCRAPER STATISTICS")
    print("=" * 80)

    print(
        f"Pages visited:          "
        f"{len(crawler.visited):,}"
    )

    print(
        f"Pages with questions:   "
        f"{crawler.pages_with_questions:,}"
    )

    print(
        f"Candidate questions:    "
        f"{crawler.total_candidates:,}"
    )

    print(
        f"Duplicates:             "
        f"{crawler.duplicates:,}"
    )

    print(
        f"Final questions:        "
        f"{len(rows):,}"
    )

    print()
    print("QUESTIONS BY SUBJECT")
    print("-" * 80)

    if subjects:

        for subject, count in sorted(
            subjects.items(),
            key=lambda item:
                item[0].lower(),
        ):
            print(
                f"{subject:<40}"
                f"{count:>10,}"
            )

    else:
        print(
            "No questions were collected."
        )

    print("-" * 80)

    print(
        f"TOTAL QUESTIONS: "
        f"{len(rows):,}"
    )

    print("=" * 80)


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 80)
    print("WAEC QUESTION SCRAPER")
    print("=" * 80)

    print(
        f"START SOURCES:   "
        f"{len(START_URLS)}"
    )

    print(
        f"MAX PAGES:       "
        f"{MAX_PAGES:,}"
    )

    print(
        f"MAX QUESTIONS:   "
        f"{MAX_QUESTIONS:,}"
    )

    print(
        f"REQUEST DELAY:   "
        f"{REQUEST_DELAY}s"
    )

    print(
        f"SHOW QUESTIONS:  "
        f"{SHOW_QUESTIONS}"
    )

    print(
        f"OUTPUT:          "
        f"{OUTPUT_FILE}"
    )

    print("=" * 80)

    all_rows = []

    global_hashes = set()

    total_pages = 0

    for source_number, start_url in enumerate(
        START_URLS,
        start=1,
    ):

        print()
        print("#" * 80)
        print(
            f"SOURCE {source_number}/"
            f"{len(START_URLS)}"
        )
        print(
            start_url
        )
        print("#" * 80)

        crawler = Crawler(
            start_url
        )

        try:
            rows = crawler.run()

        except KeyboardInterrupt:

            print()
            print(
                "Scraper interrupted."
            )

            rows = crawler.questions

        for row in rows:

            fingerprint = (
                question_fingerprint(
                    row
                )
            )

            if fingerprint in global_hashes:
                continue

            global_hashes.add(
                fingerprint
            )

            all_rows.append(
                row
            )

        total_pages += len(
            crawler.visited
        )

        print()
        print(
            f"[SOURCE COMPLETE]"
        )

        print(
            f"Questions from source: "
            f"{len(rows):,}"
        )

        print(
            f"Total questions so far: "
            f"{len(all_rows):,}"
        )

        if (
            len(all_rows)
            >= MAX_QUESTIONS
        ):
            break

    # ========================================================
    # NORMALIZATION
    # ========================================================

    all_rows = normalize_rows(
        all_rows
    )

    print()
    print(
        f"After normalization: "
        f"{len(all_rows):,}"
    )

    # ========================================================
    # FINAL DUPLICATE REMOVAL
    # ========================================================

    unique = []
    seen = set()

    duplicates_removed = 0

    for row in all_rows:

        fingerprint = (
            question_fingerprint(
                row
            )
        )

        if fingerprint in seen:

            duplicates_removed += 1

            continue

        seen.add(
            fingerprint
        )

        unique.append(
            row
        )

    all_rows = unique

    print(
        f"Duplicates removed: "
        f"{duplicates_removed:,}"
    )

    # ========================================================
    # SORT
    # ========================================================

    all_rows.sort(
        key=lambda row: (
            row["subject"].lower(),
            row["question"].lower(),
        )
    )

    # ========================================================
    # WRITE
    # ========================================================

    write_csv(
        all_rows
    )

    # ========================================================
    # FINAL STATISTICS
    # ========================================================

    fake_crawler = Crawler(
        START_URLS[0]
    )

    fake_crawler.visited = set()

    fake_crawler.pages_with_questions = 0

    fake_crawler.total_candidates = len(
        all_rows
    )

    fake_crawler.duplicates = (
        duplicates_removed
    )

    print_statistics(
        all_rows,
        fake_crawler,
    )

    print()
    print("=" * 80)
    print("DONE")
    print("=" * 80)
    print(
        f"Total pages visited: "
        f"{total_pages:,}"
    )
    print(
        f"Total questions saved: "
        f"{len(all_rows):,}"
    )
    print(
        f"CSV: {OUTPUT_FILE}"
    )
    print("=" * 80)


# ============================================================
# START
# ============================================================

if __name__ == "__main__":
    main()
