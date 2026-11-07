"""Server allowlist for the completion IDs currently emitted by the frontend.

When EnglishWorld or Typing Academy adds content, update this registry and its
tests in the same change. Completion endpoints never accept client-defined IDs.
"""

VOCABULARY_SET_IDS = frozenset({
    "animals", "birds", "fruits", "vegetables", "food", "drinks", "colors", "shapes",
    "numbers", "family", "body", "clothes", "school", "classroom", "toys", "vehicles",
    "transport", "household", "furniture", "rooms", "nature", "weather", "seasons", "places",
    "professions", "sports", "emotions", "actions", "routines", "opposites", "time",
    "days-months", "helpers", "technology", "everyday",
})

# Exactly 100 deduplicated word card IDs. The frontend builds these from the
# starter sets (animals, colors, food, family, school, nature) plus the
# curriculum topics, merged in order with first occurrence winning, then keeps
# the first 100 (`listeningWords.slice(0, 100)` in englishContent.ts). Indexes
# 0-49 are also the Speaking Studio generated prompts (`slice(0, 50)`). Keep
# this list aligned with englishContent.ts whenever the vocabulary data grows.
WORD_IDS_FOR_GENERATED_ACTIVITIES = (
    "cat", "bird", "turtle", "rabbit", "dog", "horse", "cow", "sheep", "goat", "pig",
    "chicken", "duck", "goose", "mouse", "hamster", "frog", "lion", "tiger", "elephant", "giraffe",
    "monkey", "bear", "fox", "deer", "zebra", "blue", "yellow", "green", "purple", "red",
    "cyan", "pink", "brown", "black", "white", "gray", "silver", "gold", "turquoise", "violet",
    "beige", "navy", "maroon", "apple", "bread", "carrot", "milk", "rice", "pasta", "cereal",
    # Generated Speech prompts cover indexes 0-49; the pool continues.
    "sandwich", "soup", "salad", "pizza", "pancake",
    "waffle", "cheese", "yogurt", "egg", "butter",
    "honey", "jam", "cookie", "cracker", "muffin",
    "noodle", "tortilla", "dumpling", "sister", "brother",
    "grandma", "family", "mother", "father", "parent",
    "grandmother", "grandfather", "aunt", "uncle", "cousin",
    "baby", "twin", "niece", "nephew", "daughter",
    "son", "grandchild", "relative", "pencil", "book",
    "teacher", "school", "pen", "crayon", "marker",
    "eraser", "ruler", "notebook", "textbook", "workbook",
)
GRAMMAR_LESSON_IDS = frozenset({
    "nouns", "verbs", "adjectives", "pronouns", "articles", "punctuation", "tenses",
    "common-nouns", "proper-nouns", "collective-nouns", "abstract-nouns", "concrete-nouns",
    "personal-pronouns", "possessive-pronouns", "action-verbs", "helping-verbs", "linking-verbs",
    "descriptive-adjectives", "comparative-adjectives", "superlative-adjectives", "adverbs",
    "prepositions", "conjunctions", "interjections", "singular-plural", "gender-nouns",
    "subject-predicate", "sentence-formation", "sentence-types", "capitalization", "present-tense",
    "past-tense", "future-tense", "simple-tenses", "continuous-tenses", "perfect-tenses", "commas",
})

ENGLISH_ACTIVITY_KEYS = frozenset(
    {f"{prefix}-{set_id}" for prefix in ("match", "spelling", "vocabulary") for set_id in VOCABULARY_SET_IDS}
    | {f"story-{story_id}" for story_id in ("lantern", "seed", "boat", *(f"story-{index}" for index in range(4, 54)))}
    | {f"grammar-{lesson_id}" for lesson_id in GRAMMAR_LESSON_IDS}
    | {"grammar-parts-of-speech"}
    | {f"listening-{activity_id}" for activity_id in ("listen-cat", "listen-color", "listen-action", "listen-food", "listen-place")}
    | {f"listening-listen-word-{word_id}" for word_id in WORD_IDS_FOR_GENERATED_ACTIVITIES}
    | {f"speaking-{activity_id}" for activity_id in ("speak-hello", "speak-blue", "speak-book", "speak-bird")}
    | {f"speaking-speak-word-{word_id}" for word_id in WORD_IDS_FOR_GENERATED_ACTIVITIES[:50]}
    | {f"sentence-{sentence_id}" for sentence_id in ("sentence-bird", "sentence-sun", "sentence-dog", "sentence-flower", "sentence-friends")}
    | {f"sentence-dialogue-{index}" for index in range(1, 51)}
)

TYPING_PROMPT_COUNTS = {"letters": 3, "words": 3, "sentences": 5}


def is_supported_english_activity(activity_key):
    return activity_key in ENGLISH_ACTIVITY_KEYS


def is_supported_typing_activity(activity_key):
    mode, separator, prompt_index = activity_key.partition("-")
    if not separator or mode not in TYPING_PROMPT_COUNTS or not prompt_index.isdecimal():
        return False
    return 0 <= int(prompt_index) < TYPING_PROMPT_COUNTS[mode]
