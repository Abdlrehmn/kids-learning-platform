from django.db import migrations


GAMES = [
    ("word-match", "Word Match", "word"), ("picture-match", "Picture Word Match", "word"),
    ("color-match", "Color Match", "logic"), ("spelling-bee", "Spelling Bee", "word"),
    ("missing-letters", "Missing Letters", "word"), ("word-scramble", "Word Scramble", "puzzle"),
    ("memory-cards", "Memory Cards", "memory"), ("vocabulary-quiz", "Vocabulary Quiz", "word"),
    ("noun-detective", "Noun Detective", "logic"), ("verb-action", "Verb Action Challenge", "word"),
    ("adjective-explorer", "Adjective Explorer", "word"), ("sentence-builder", "Sentence Builder", "puzzle"),
    ("treasure-hunt", "Grammar Treasure Hunt", "logic"), ("punctuation-fixer", "Punctuation Fixer", "word"),
    ("story-sequence", "Story Sequence", "logic"), ("listening-detective", "Listening Detective", "word"),
    ("word-sorting", "Word Sorting", "logic"), ("odd-one-out", "Odd One Out", "logic"),
    ("crossword", "Crossword Word Puzzle", "puzzle"), ("guess-the-word", "Guess the Word", "logic"),
    ("build-a-sentence", "Build a Sentence", "word"), ("alphabet-hunt", "Alphabet Hunt", "word"),
    ("math-adventure", "Math Adventure", "math"), ("number-quest", "Number Quest", "math"),
    ("addition-adventure", "Addition Adventure", "math"), ("subtraction-challenge", "Subtraction Challenge", "math"),
    ("multiplication-stars", "Multiplication Stars", "math"), ("division-explorer", "Division Explorer", "math"),
    ("shape-detective", "Shape Detective", "math"), ("counting-adventure", "Counting Adventure", "math"),
    ("number-sequence", "Number Sequence", "math"), ("picture-pairs", "Picture Pairs", "memory"),
    ("word-memory", "Word Memory", "memory"), ("sound-memory", "Sound Memory", "memory"),
    ("sequence-memory", "Sequence Memory", "memory"), ("animal-match", "Animal Match", "memory"),
    ("jigsaw-puzzle", "Jigsaw Puzzle", "puzzle"), ("picture-puzzle", "Picture Puzzle", "puzzle"),
    ("missing-piece", "Missing Piece", "puzzle"), ("shape-builder", "Shape Builder", "puzzle"),
    ("letter-puzzle", "Letter Puzzle", "puzzle"), ("pattern-builder", "Pattern Builder", "puzzle"),
    ("find-difference", "Find the Difference", "logic"), ("pattern-detective", "Pattern Detective", "logic"),
    ("object-sorting", "Object Sorting", "logic"), ("logic-quest", "Logic Quest", "logic"),
]

ACHIEVEMENTS = [
    ("first-game", "First Game", "Complete your first game", "trophy", "games_completed", 1),
    ("five-games", "Game Explorer", "Complete five games", "game", "games_completed", 5),
    ("first-activity", "Learning Star", "Complete your first learning activity", "star", "activities_completed", 1),
    ("ten-activities", "Curious Mind", "Complete ten learning activities", "lightbulb", "activities_completed", 10),
    ("hundred-xp", "Bright Beginner", "Earn 100 XP", "sparkle", "xp_earned", 100),
]


def seed(apps, schema_editor):
    Game = apps.get_model("learning", "Game")
    Achievement = apps.get_model("learning", "Achievement")
    Game.objects.using(schema_editor.connection.alias).bulk_create([
        Game(slug=slug, title=title, category=category, sort_order=index)
        for index, (slug, title, category) in enumerate(GAMES)
    ], ignore_conflicts=True)
    Achievement.objects.using(schema_editor.connection.alias).bulk_create([
        Achievement(slug=slug, title=title, description=description, icon_id=icon, criterion=criterion, threshold=threshold)
        for slug, title, description, icon, criterion, threshold in ACHIEVEMENTS
    ], ignore_conflicts=True)


def unseed(apps, schema_editor):
    apps.get_model("learning", "Game").objects.using(schema_editor.connection.alias).filter(
        slug__in=[row[0] for row in GAMES]
    ).delete()
    apps.get_model("learning", "Achievement").objects.using(schema_editor.connection.alias).filter(
        slug__in=[row[0] for row in ACHIEVEMENTS]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [("learning", "0001_initial")]
    operations = [migrations.RunPython(seed, unseed)]
