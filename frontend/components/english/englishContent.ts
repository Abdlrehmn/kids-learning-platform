export type EnglishCategoryId =
  | "vocabulary"
  | "stories"
  | "grammar"
  | "listening"
  | "speaking"
  | "sentences";

export type EnglishCategory = {
  id: EnglishCategoryId;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: string;
  tone: string;
};

export const englishCategories: EnglishCategory[] = [
  { id: "vocabulary", title: "Vocabulary Adventure", shortTitle: "Vocabulary", subtitle: "Discover new words", icon: "🔤", tone: "aqua" },
  { id: "stories", title: "Story Land", shortTitle: "Stories", subtitle: "Read and understand", icon: "📚", tone: "coral" },
  { id: "grammar", title: "Grammar Garden", shortTitle: "Grammar", subtitle: "Grow great sentences", icon: "🌱", tone: "violet" },
  { id: "listening", title: "Listening Lagoon", shortTitle: "Listening", subtitle: "Listen and choose", icon: "🎧", tone: "blue" },
  { id: "speaking", title: "Speaking Studio", shortTitle: "Speaking", subtitle: "Practise saying it", icon: "🎙️", tone: "pink" },
  { id: "sentences", title: "Sentence Builder", shortTitle: "Sentences", subtitle: "Put words in order", icon: "🧩", tone: "green" },
];

export type WordCard = {
  id: string;
  word: string;
  picture: string;
  meaning: string;
  sentence: string;
};

export type WordSet = {
  id: string;
  label: string;
  icon: string;
  words: WordCard[];
};

export const wordSets: WordSet[] = [
  {
    id: "animals", label: "Animals", icon: "🐾", words: [
      { id: "cat", word: "cat", picture: "🐱", meaning: "A small furry pet that says meow.", sentence: "The cat naps on a soft rug." },
      { id: "bird", word: "bird", picture: "🐦", meaning: "An animal with feathers, wings, and a beak.", sentence: "A little bird sings in the tree." },
      { id: "turtle", word: "turtle", picture: "🐢", meaning: "A slow animal with a hard shell.", sentence: "The turtle walks beside the pond." },
      { id: "rabbit", word: "rabbit", picture: "🐰", meaning: "A small animal with long ears that can hop.", sentence: "The rabbit hops through the grass." },
    ],
  },
  {
    id: "colors", label: "Colors", icon: "🎨", words: [
      { id: "blue", word: "blue", picture: "🫐", meaning: "The color of a clear daytime sky.", sentence: "I see a blue kite above the park." },
      { id: "yellow", word: "yellow", picture: "🌻", meaning: "The bright color of sunshine and lemons.", sentence: "The yellow sun warms the garden." },
      { id: "green", word: "green", picture: "🍀", meaning: "The color of fresh leaves and grass.", sentence: "A green frog sits on a lily pad." },
      { id: "purple", word: "purple", picture: "🍇", meaning: "A color made from red and blue.", sentence: "She picked a purple flower." },
    ],
  },
  {
    id: "food", label: "Food", icon: "🍎", words: [
      { id: "apple", word: "apple", picture: "🍎", meaning: "A round fruit that can be red, green, or yellow.", sentence: "Sam packs an apple for lunch." },
      { id: "bread", word: "bread", picture: "🍞", meaning: "A food baked from flour and water.", sentence: "We share warm bread at the table." },
      { id: "carrot", word: "carrot", picture: "🥕", meaning: "A crunchy orange vegetable that grows underground.", sentence: "The rabbit likes a crunchy carrot." },
      { id: "milk", word: "milk", picture: "🥛", meaning: "A white drink that comes from cows and other animals.", sentence: "I drink milk with my breakfast." },
    ],
  },
  {
    id: "family", label: "Family", icon: "🏡", words: [
      { id: "sister", word: "sister", picture: "👧", meaning: "A girl or woman who has the same parent as you.", sentence: "My sister reads a story with me." },
      { id: "brother", word: "brother", picture: "👦", meaning: "A boy or man who has the same parent as you.", sentence: "My brother builds a tall tower." },
      { id: "grandma", word: "grandma", picture: "👵", meaning: "The mother of your mother or father.", sentence: "Grandma waves from the garden." },
      { id: "family", word: "family", picture: "👨‍👩‍👧‍👦", meaning: "People who care for and belong with one another.", sentence: "Our family eats dinner together." },
    ],
  },
  {
    id: "school", label: "School", icon: "🎒", words: [
      { id: "pencil", word: "pencil", picture: "✏️", meaning: "A tool for writing or drawing that can be sharpened.", sentence: "Use a pencil to draw your favourite animal." },
      { id: "book", word: "book", picture: "📘", meaning: "Pages joined together that we can read.", sentence: "The book has a funny ending." },
      { id: "teacher", word: "teacher", picture: "🧑‍🏫", meaning: "A person who helps others learn.", sentence: "Our teacher reads us a poem." },
      { id: "school", word: "school", picture: "🏫", meaning: "A place where children learn together.", sentence: "We walk to school with our friends." },
    ],
  },
  {
    id: "nature", label: "Nature", icon: "🌿", words: [
      { id: "flower", word: "flower", picture: "🌷", meaning: "The colorful part of a plant that can make seeds.", sentence: "A bee lands on the pink flower." },
      { id: "river", word: "river", picture: "🏞️", meaning: "A long stream of water that flows across land.", sentence: "The river flows past the green hill." },
      { id: "cloud", word: "cloud", picture: "☁️", meaning: "A soft-looking group of tiny water drops in the sky.", sentence: "A white cloud floats over our house." },
      { id: "tree", word: "tree", picture: "🌳", meaning: "A tall plant with a trunk, branches, and leaves.", sentence: "We rest in the shade of a tree." },
    ],
  },
];

export type Story = {
  id: string;
  title: string;
  picture: string;
  level: string;
  minutes: number;
  pages: string[];
  vocabulary: string[];
  question: string;
  choices: string[];
  answer: string;
};

export const stories: Story[] = [
  {
    id: "lantern", title: "The Little Moon Lantern", picture: "🏮", level: "Beginner", minutes: 3,
    pages: [
      "Mina found a tiny lantern under the old apple tree. It glowed like a little moon.",
      "A lost firefly blinked beside the path. Mina held up the lantern, and the firefly found its family.",
      "The lantern grew dim, but Mina's smile stayed bright. Helping a friend was its own kind of light.",
    ], vocabulary: ["lantern", "glowed", "dim"],
    question: "Who did Mina help find the way home?", choices: ["A firefly", "A turtle", "A cloud"], answer: "A firefly",
  },
  {
    id: "seed", title: "Pip and the Patient Seed", picture: "🌱", level: "Beginner", minutes: 4,
    pages: [
      "Pip planted a tiny seed in a pot. Every morning, Pip gave the soil a little water.",
      "For many days, the pot looked the same. Pip kept caring for it and placed it in the warm sun.",
      "One morning a green sprout appeared. Pip learned that some good things need time to grow.",
    ], vocabulary: ["planted", "soil", "sprout"],
    question: "What helped the seed grow?", choices: ["Water and sunshine", "A loud song", "A paper hat"], answer: "Water and sunshine",
  },
  {
    id: "boat", title: "A Boat for Button", picture: "⛵", level: "Growing reader", minutes: 5,
    pages: [
      "Button the mouse folded a paper boat. He drew a bright red star on its sail.",
      "After the rain, Button set the boat in a puddle. His friend Bee watched it sail past a leaf.",
      "The boat reached the other side. Button and Bee took turns steering it back home.",
    ], vocabulary: ["folded", "sail", "steering"],
    question: "What did Button draw on the sail?", choices: ["A red star", "A blue fish", "A green leaf"], answer: "A red star",
  },
];

export type QuizQuestion = { prompt: string; choices: string[]; answer: string; explanation: string };
export type GrammarLesson = { id: string; title: string; icon: string; explanation: string; example: string; questions: QuizQuestion[] };

export const grammarLessons: GrammarLesson[] = [
  { id: "nouns", title: "Nouns", icon: "📕", explanation: "A noun names a person, place, animal, or thing.", example: "The rabbit visits the garden.", questions: [
    { prompt: "Which word is a noun?", choices: ["garden", "softly", "jump"], answer: "garden", explanation: "A garden is a place, so it is a noun." },
    { prompt: "Which word names an animal?", choices: ["turtle", "green", "under"], answer: "turtle", explanation: "Turtle names an animal, so it is a noun." },
  ] },
  { id: "verbs", title: "Verbs", icon: "✏️", explanation: "A verb tells what someone or something does, or what it is.", example: "The happy puppy runs.", questions: [
    { prompt: "Which word tells the action? The bird sings.", choices: ["bird", "sings", "the"], answer: "sings", explanation: "Sings tells what the bird does. It is a verb." },
    { prompt: "Choose the verb: The baby smiles.", choices: ["baby", "smiles", "the"], answer: "smiles", explanation: "Smiles is the action in the sentence." },
  ] },
  { id: "adjectives", title: "Adjectives", icon: "🌈", explanation: "An adjective describes a noun and gives us more detail.", example: "A bright star twinkles.", questions: [
    { prompt: "Which word describes the star? A bright star twinkles.", choices: ["bright", "star", "twinkles"], answer: "bright", explanation: "Bright describes the star, so it is an adjective." },
    { prompt: "Pick the adjective: The small frog hops.", choices: ["frog", "hops", "small"], answer: "small", explanation: "Small describes the frog." },
  ] },
  { id: "pronouns", title: "Pronouns", icon: "🧑‍🤝‍🧑", explanation: "A pronoun can take the place of a naming word, such as I, you, he, she, or they.", example: "Maya is kind. She shares.", questions: [
    { prompt: "Which pronoun can replace Ben?", choices: ["he", "they", "it"], answer: "he", explanation: "He can take the place of a boy's name." },
    { prompt: "Choose the pronoun: They play outside.", choices: ["play", "outside", "They"], answer: "They", explanation: "They stands in for the names of people." },
  ] },
  { id: "articles", title: "Articles", icon: "🧁", explanation: "A, an, and the are articles. Use an before a vowel sound, as in an apple.", example: "A bee visits an orange flower.", questions: [
    { prompt: "Choose the article: ___ umbrella", choices: ["an", "a", "thee"], answer: "an", explanation: "Umbrella starts with a vowel sound, so use an." },
    { prompt: "Choose the best article: ___ kite is in the sky.", choices: ["A", "An", "Are"], answer: "A", explanation: "Kite starts with a consonant sound, so use a." },
  ] },
  { id: "punctuation", title: "Punctuation", icon: "❗", explanation: "A capital letter starts a sentence. A period ends a telling sentence; a question mark ends a question.", example: "Where is my blue hat?", questions: [
    { prompt: "Fix this sentence: where is my hat", choices: ["Where is my hat?", "where is my hat.", "Where is my hat!"], answer: "Where is my hat?", explanation: "Start with a capital letter and end the question with a question mark." },
    { prompt: "Which mark ends a telling sentence?", choices: ["A period (.)", "A question mark (?)", "A comma (,)"], answer: "A period (.)", explanation: "A period can end a telling sentence." },
  ] },
  { id: "tenses", title: "Basic tenses", icon: "⏰", explanation: "Verbs can tell when something happens: now, before, or later.", example: "Today I play. Yesterday I played.", questions: [
    { prompt: "Which sentence tells about yesterday?", choices: ["I jump.", "I jumped.", "I will jump."], answer: "I jumped.", explanation: "Jumped tells about an action that happened before now." },
    { prompt: "Which sentence tells what happens now?", choices: ["We walked.", "We walk.", "We will walk."], answer: "We walk.", explanation: "Walk tells what we do now or often." },
  ] },
];

export const partsOfSpeechRounds = [
  { sentence: "The sleepy cat yawns.", target: "adjective", answer: "sleepy", hint: "Which word describes the cat?" },
  { sentence: "Birds fly above us.", target: "verb", answer: "fly", hint: "Which word tells the action?" },
  { sentence: "Mina likes the garden.", target: "noun", answer: "garden", hint: "Which word names a place?" },
  { sentence: "He waves to his friend.", target: "pronoun", answer: "He", hint: "Which word takes the place of a name?" },
];

export type ListeningActivity = { id: string; prompt: string; picture: string; choices: string[]; answer: string; speak: string };
export const listeningActivities: ListeningActivity[] = [
  { id: "listen-cat", prompt: "Which animal did you hear?", picture: "🐾", choices: ["A cat", "A bird", "A fish"], answer: "A cat", speak: "The cat is sleeping on the mat." },
  { id: "listen-color", prompt: "What color was the kite?", picture: "🪁", choices: ["Yellow", "Blue", "Green"], answer: "Blue", speak: "The blue kite flies high in the sky." },
  { id: "listen-action", prompt: "What does the rabbit do?", picture: "🐇", choices: ["It swims", "It hops", "It reads"], answer: "It hops", speak: "The little rabbit hops over the log." },
  { id: "listen-food", prompt: "What is in the lunch box?", picture: "🍱", choices: ["An apple", "A shoe", "A shell"], answer: "An apple", speak: "I put an apple in my lunch box." },
  { id: "listen-place", prompt: "Where are the children?", picture: "🛝", choices: ["At the park", "In a boat", "On the moon"], answer: "At the park", speak: "The children play together at the park." },
];

export const speakingPrompts = [
  { id: "speak-hello", text: "Hello, how are you?", hint: "Say hello with a friendly voice." },
  { id: "speak-blue", text: "The sky is blue.", hint: "Say each word slowly and clearly." },
  { id: "speak-book", text: "I like to read books.", hint: "Tap the example, then try the sentence." },
  { id: "speak-bird", text: "A bird can fly.", hint: "Listen for the short words: a, can." },
];

export type SentencePrompt = { id: string; sentence: string; tiles: string[]; hint: string };
export const sentencePrompts: SentencePrompt[] = [
  { id: "sentence-bird", sentence: "A bird can fly.", tiles: ["fly.", "A", "can", "bird"], hint: "Start with who the sentence is about." },
  { id: "sentence-sun", sentence: "The sun is warm.", tiles: ["warm.", "The", "is", "sun"], hint: "Put the naming words first: The sun…" },
  { id: "sentence-dog", sentence: "My dog likes to play.", tiles: ["to", "My", "play.", "likes", "dog"], hint: "My dog is the beginning." },
  { id: "sentence-flower", sentence: "A red flower grows.", tiles: ["grows.", "red", "A", "flower"], hint: "What grows? A red flower…" },
  { id: "sentence-friends", sentence: "Friends help each other.", tiles: ["other.", "Friends", "each", "help"], hint: "The sentence starts with Friends." },
];

export const dailyChallengeTargets: Array<{ category: EnglishCategoryId; activityId: string; title: string; subtitle: string }> = [
  { category: "vocabulary", activityId: "vocabulary-animals", title: "Meet four animal words", subtitle: "Learn the animal words and their example sentences." },
  { category: "stories", activityId: "story-lantern", title: "Read a bright little story", subtitle: "Read all the pages and answer the story question." },
  { category: "grammar", activityId: "grammar-nouns", title: "Find the naming words", subtitle: "Try a short nouns lesson and answer both questions." },
  { category: "listening", activityId: "listening-listen-cat", title: "Listen for the details", subtitle: "Hear a sentence and choose the answer." },
  { category: "speaking", activityId: "speaking-speak-hello", title: "Say a sentence aloud", subtitle: "Practise one phrase with a supported tool or text check." },
  { category: "sentences", activityId: "sentence-sentence-bird", title: "Build a tidy sentence", subtitle: "Put the word tiles in a sentence that makes sense." },
];
