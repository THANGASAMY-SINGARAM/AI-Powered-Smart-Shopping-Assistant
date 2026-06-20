import json
import re
import sys
from collections import Counter


CATEGORIES = {
    "Groceries": {
        "apple", "banana", "bread", "butter", "carrot", "cereal", "cheese",
        "chicken", "coffee", "curd", "egg", "flour", "fruit", "juice",
        "milk", "oil", "onion", "paneer", "pasta", "potato", "rice",
        "salt", "sugar", "tea", "tomato", "vegetable", "yogurt"
    },
    "Electronics": {
        "adapter", "battery", "cable", "camera", "charger", "earbuds",
        "headphone", "keyboard", "laptop", "monitor", "mouse", "phone",
        "powerbank", "router", "speaker", "tablet", "usb"
    },
    "Stationery": {
        "book", "diary", "eraser", "file", "folder", "marker", "notebook",
        "paper", "pen", "pencil", "scale", "sharpener", "stapler", "tape"
    },
    "Household": {
        "brush", "cleaner", "detergent", "dishwash", "mop", "napkin",
        "soap", "sponge", "tissue", "toothpaste", "trash", "wash"
    },
    "Personal Care": {
        "conditioner", "cream", "deodorant", "lotion", "medicine",
        "razor", "sanitizer", "shampoo", "sunscreen"
    },
}

PAIRINGS = {
    "milk": ["bread", "eggs", "cereal"],
    "bread": ["butter", "jam", "eggs"],
    "rice": ["dal", "oil", "salt"],
    "pasta": ["cheese", "tomato sauce"],
    "phone": ["charger", "earbuds", "case"],
    "laptop": ["mouse", "keyboard", "usb cable"],
    "notebook": ["pen", "pencil", "eraser"],
    "pen": ["notebook", "paper", "marker"],
}


def tokens(text):
    return re.findall(r"[a-z0-9]+", (text or "").lower())


def categorize(name):
    words = tokens(name)
    scores = {}

    for category, keywords in CATEGORIES.items():
        score = 0
        for word in words:
            if word in keywords:
                score += 2
            if any(word in keyword or keyword in word for keyword in keywords):
                score += 1
        scores[category] = score

    category, score = max(scores.items(), key=lambda item: item[1])
    if score == 0:
        return {"category": "Other", "confidence": 0.35}

    confidence = min(0.95, 0.55 + (score * 0.12))
    return {"category": category, "confidence": round(confidence, 2)}


def suggest(history, limit=6):
    names = [item.get("name", "") for item in history if item.get("name")]
    flat_words = [word for name in names for word in tokens(name)]
    history_counts = Counter(flat_words)

    candidates = Counter()
    for word, count in history_counts.items():
        for suggestion in PAIRINGS.get(word, []):
            candidates[suggestion] += count + 2

    category_counts = Counter(item.get("category") for item in history if item.get("category"))
    for category, _ in category_counts.most_common(2):
        for keyword in list(CATEGORIES.get(category, []))[:8]:
            candidates[keyword] += 1

    existing = {name.strip().lower() for name in names}
    suggestions = []
    for name, score in candidates.most_common():
        if name.lower() in existing:
            continue
        ai = categorize(name)
        suggestions.append({
            "name": name.title(),
            "category": ai["category"],
            "score": score,
            "reason": "Based on your shopping history"
        })
        if len(suggestions) == limit:
            break

    return suggestions


def main():
    payload = json.loads(sys.stdin.read() or "{}")
    action = payload.get("action", "analyze")

    if action == "suggest":
        print(json.dumps({"suggestions": suggest(payload.get("history", []))}))
        return

    name = payload.get("name", "")
    print(json.dumps(categorize(name)))


if __name__ == "__main__":
    main()
