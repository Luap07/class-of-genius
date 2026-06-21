import requests
from bs4 import BeautifulSoup
import json

url = "https://example.com"

res = requests.get(url)
soup = BeautifulSoup(res.text, "html.parser")

questions = []

for q in soup.select(".question"):
    questions.append({
        "question": q.text.strip(),
        "options": [],
        "answer": "",
        "subject": "General"
    })

with open("questions.json", "w") as f:
    json.dump(questions, f, indent=2)

print("Scraping done")