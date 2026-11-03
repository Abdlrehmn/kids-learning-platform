import type { WordCard, WordSet } from "./englishContent";

const colorHexByName: Record<string, string> = {
  red: "#ef4444", cyan: "#06b6d4", yellow: "#facc15", green: "#22c55e", blue: "#3b82f6",
  purple: "#8b5cf6", pink: "#ec4899", brown: "#8b5e3c", black: "#202124", white: "#ffffff",
  gray: "#9ca3af", silver: "#a8b3c2", gold: "#eab308", turquoise: "#14b8a6", violet: "#7c3aed",
  beige: "#d6c3a1", navy: "#1e3a8a", maroon: "#7f1d1d",
};

type VocabularyTopic = {
  id: string;
  label: string;
  icon: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  descriptor: string;
  words: string;
};

const vocabularyTopics: VocabularyTopic[] = [
  { id: "animals", label: "Animals", icon: "🐾", level: "Beginner", descriptor: "an animal", words: "dog|cat|rabbit|horse|cow|sheep|goat|pig|chicken|duck|goose|mouse|hamster|turtle|frog|lion|tiger|elephant|giraffe|monkey|bear|fox|deer|zebra" },
  { id: "birds", label: "Birds", icon: "🐦", level: "Beginner", descriptor: "a bird", words: "robin|sparrow|eagle|owl|parrot|penguin|flamingo|peacock|swan|pigeon|crow|raven|seagull|woodpecker|hummingbird|stork" },
  { id: "fruits", label: "Fruits", icon: "🍎", level: "Beginner", descriptor: "a fruit", words: "apple|banana|orange|pear|peach|plum|grape|cherry|strawberry|blueberry|raspberry|blackberry|watermelon|cantaloupe|pineapple|mango|kiwi|lemon|lime|apricot" },
  { id: "vegetables", label: "Vegetables", icon: "🥕", level: "Beginner", descriptor: "a vegetable", words: "carrot|potato|tomato|cucumber|lettuce|spinach|broccoli|cauliflower|cabbage|pumpkin|corn|peas|bean|onion|garlic|pepper|celery|radish|beet|zucchini" },
  { id: "food", label: "Food", icon: "🥪", level: "Beginner", descriptor: "a kind of food", words: "bread|rice|pasta|cereal|sandwich|soup|salad|pizza|pancake|waffle|cheese|yogurt|egg|butter|honey|jam|cookie|cracker|muffin|noodle|tortilla|dumpling" },
  { id: "drinks", label: "Food and Drinks", icon: "🥛", level: "Beginner", descriptor: "a drink", words: "water|milk|juice|lemonade|cocoa|tea|smoothie|milkshake|coconut water|apple cider|herbal tea|hot chocolate|sparkling water|fruit punch|broth|ginger tea" },
  { id: "colors", label: "Colors", icon: "🎨", level: "Beginner", descriptor: "a color word", words: "red|cyan|yellow|green|blue|purple|pink|brown|black|white|gray|silver|gold|turquoise|violet|beige|navy|maroon" },
  { id: "shapes", label: "Shapes", icon: "🔷", level: "Beginner", descriptor: "a shape", words: "circle|square|triangle|rectangle|oval|star|heart|cube|diamond|hexagon|octagon|cylinder|cone|sphere|crescent|spiral" },
  { id: "numbers", label: "Numbers", icon: "🔢", level: "Beginner", descriptor: "a number word", words: "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty" },
  { id: "family", label: "Family Members", icon: "👨‍👩‍👧", level: "Beginner", descriptor: "a family word", words: "mother|father|parent|sister|brother|grandmother|grandfather|aunt|uncle|cousin|baby|twin|niece|nephew|daughter|son|grandchild|relative" },
  { id: "body", label: "Body Parts", icon: "🖐️", level: "Beginner", descriptor: "a body part", words: "head|hair|face|eye|ear|nose|mouth|tooth|tongue|neck|shoulder|arm|elbow|wrist|hand|finger|leg|knee|ankle|foot|thumb|chin" },
  { id: "clothes", label: "Clothes", icon: "👕", level: "Beginner", descriptor: "an item of clothing", words: "shirt|trousers|shorts|skirt|dress|sweater|jacket|coat|raincoat|sock|shoe|boot|sandal|hat|cap|scarf|glove|mitten|belt|pocket|uniform|pajamas" },
  { id: "school", label: "School Objects", icon: "🎒", level: "Beginner", descriptor: "a school object", words: "pencil|pen|crayon|marker|eraser|ruler|notebook|textbook|workbook|backpack|lunchbox|scissors|glue|sharpener|calculator|folder|paper|chalk|clipboard|dictionary|highlighter|stapler" },
  { id: "classroom", label: "Classroom Items", icon: "🏫", level: "Intermediate", descriptor: "a classroom item", words: "whiteboard|chalkboard|globe|easel|bookshelf|planner|poster|map|projector|screen|bell|cubby|worksheet|timetable|chalk tray|name tag|noticeboard|desk lamp" },
  { id: "toys", label: "Toys", icon: "🧸", level: "Beginner", descriptor: "a toy", words: "doll|teddy bear|puzzle|building blocks|kite|yo-yo|marbles|spinning top|toy train|toy car|toy boat|toy robot|puppet|jump rope|board game|building set|toy drum|play dough" },
  { id: "vehicles", label: "Vehicles", icon: "🚗", level: "Beginner", descriptor: "a vehicle", words: "car|bus|truck|van|taxi|bicycle|motorcycle|scooter|tractor|ambulance|fire engine|police car|train|subway|airplane|helicopter|boat|ship|sailboat|hot-air balloon|ambulance van|delivery truck" },
  { id: "transport", label: "Transport", icon: "🚌", level: "Intermediate", descriptor: "a transport word", words: "ticket|station|platform|crossing|sidewalk|highway|runway|harbor|ferry|tram|cable car|skateboard|sled|canoe|kayak|wagon|traffic light|seat belt" },
  { id: "household", label: "Household Objects", icon: "🧺", level: "Beginner", descriptor: "a household object", words: "spoon|fork|knife|plate|bowl|cup|glass|pan|pot|kettle|toaster|blender|refrigerator|freezer|oven|sink|soap|towel|toothbrush|toothpaste|broom|bucket" },
  { id: "furniture", label: "Furniture", icon: "🪑", level: "Beginner", descriptor: "a piece of furniture", words: "chair|table|bed|sofa|lamp|desk|wardrobe|dresser|drawer|shelf|cabinet|stool|bench|rocking chair|coffee table|bookcase|mirror|rug|curtain|cushion|mattress|nightstand" },
  { id: "rooms", label: "Rooms", icon: "🏠", level: "Beginner", descriptor: "a room or home space", words: "kitchen|bedroom|bathroom|living room|dining room|hallway|attic|basement|garage|balcony|nursery|laundry room|guest room|pantry|porch|closet" },
  { id: "nature", label: "Nature", icon: "🌿", level: "Beginner", descriptor: "a part of nature", words: "mountain|hill|valley|forest|jungle|desert|island|beach|ocean|river|lake|pond|waterfall|cave|field|meadow|volcano|glacier|cliff|stream|canyon|wetland" },
  { id: "weather", label: "Weather", icon: "🌦️", level: "Intermediate", descriptor: "a weather word", words: "sunny|cloudy|rainy|windy|snowy|stormy|foggy|thunder|lightning|rainbow|breeze|drizzle|hail|frost|temperature|forecast|hurricane|heatwave" },
  { id: "seasons", label: "Seasons", icon: "🍂", level: "Beginner", descriptor: "a season", words: "spring|summer|autumn|winter" },
  { id: "places", label: "Places", icon: "🗺️", level: "Beginner", descriptor: "a place in a community", words: "park|zoo|library|museum|hospital|bakery|market|restaurant|playground|theater|cinema|post office|airport|supermarket|bank|hotel|swimming pool|stadium|farm|fire station|bookshop|aquarium" },
  { id: "professions", label: "Professions", icon: "🧑‍🔬", level: "Intermediate", descriptor: "a job", words: "doctor|nurse|dentist|veterinarian|artist|farmer|baker|chef|pilot|astronaut|scientist|builder|firefighter|police officer|librarian|musician|mechanic|gardener|photographer|engineer|carpenter|designer" },
  { id: "sports", label: "Sports", icon: "🏅", level: "Intermediate", descriptor: "a sport", words: "soccer|basketball|tennis|swimming|running|baseball|volleyball|hockey|gymnastics|skating|skiing|surfing|badminton|rugby|golf|boxing|karate|cricket|cycling|wrestling|fencing|archery" },
  { id: "emotions", label: "Emotions", icon: "😊", level: "Intermediate", descriptor: "a feeling word", words: "happy|sad|excited|proud|worried|shy|calm|angry|surprised|curious|brave|lonely|grateful|nervous|silly|bored|hopeful|jealous" },
  { id: "actions", label: "Actions", icon: "🏃", level: "Beginner", descriptor: "an action word", words: "run|jump|skip|dance|sing|swim|hop|crawl|walk|laugh|smile|wave|clap|stretch|yawn|rest|climb|slide|skate|blink|listen|whisper|shout|think|dream|cheer|jog|splash" },
  { id: "routines", label: "Daily Routines", icon: "⏰", level: "Beginner", descriptor: "a daily routine word", words: "wake|wash|brush|get dressed|eat breakfast|pack|travel|study|read|play|tidy|help|cook|eat dinner|relax|sleep|water plants|feed a pet" },
  { id: "opposites", label: "Opposites", icon: "↔️", level: "Intermediate", descriptor: "an opposite word", words: "big|small|tall|short|fast|slow|hot|cold|wet|dry|open|closed|light|dark|full|empty|early|late|loud|quiet|near|far" },
  { id: "time", label: "Time", icon: "🕒", level: "Intermediate", descriptor: "a time word", words: "morning|noon|afternoon|evening|midnight|minute|hour|second|yesterday|today|tomorrow|watch|weekend|weekday|calendar date|sunrise|sunset|schedule" },
  { id: "days-months", label: "Days and Months", icon: "📅", level: "Beginner", descriptor: "a calendar word", words: "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December" },
  { id: "helpers", label: "Community Helpers", icon: "🤝", level: "Intermediate", descriptor: "a community helper", words: "mail carrier|crossing guard|paramedic|coast guard|park ranger|rescue worker|sanitation worker|bus driver|train conductor|shopkeeper|lifeguard|translator|caretaker|counselor|coach|mayor|plumber|electrician|fire inspector" },
  { id: "technology", label: "Technology", icon: "💻", level: "Intermediate", descriptor: "a technology word", words: "computer|laptop|tablet|keyboard|trackpad|printer|camera|phone|smartphone|headphones|speaker|microphone|robot|website|password|internet|charger|remote control|webpage|touchscreen|game console|search engine" },
  { id: "everyday", label: "Everyday Objects", icon: "🧰", level: "Beginner", descriptor: "an everyday object", words: "key|wallet|coin|bag|bottle|umbrella|flashlight|battery|box|basket|envelope|stamp|postcard|tissue|bandage|comb|hairbrush|portrait|greeting card|gift|thermometer|reusable cup" },
];

const pictureHints: Record<string, string> = {
  Animals: "🐾", Birds: "🐦", Fruits: "🍎", Vegetables: "🥕", Food: "🥪", "Food and Drinks": "🥛", Colors: "🎨", Shapes: "🔷", Numbers: "🔢", "Family Members": "👨‍👩‍👧", "Body Parts": "🖐️", Clothes: "👕", "School Objects": "🎒", "Classroom Items": "🏫", Toys: "🧸", Vehicles: "🚗", Transport: "🚌", "Household Objects": "🧺", Furniture: "🪑", Rooms: "🏠", Nature: "🌿", Weather: "🌦️", Seasons: "🍂", Places: "🗺️", Professions: "🧑‍🔬", Sports: "🏅", Emotions: "😊", Actions: "🏃", "Daily Routines": "⏰", Opposites: "↔️", Time: "🕒", "Days and Months": "📅", "Community Helpers": "🤝", Technology: "💻", "Everyday Objects": "🧰",
};

const wordPictures: Record<string, string> = {
  dog: "🐕", cat: "🐈", rabbit: "🐇", horse: "🐎", cow: "🐄", sheep: "🐑", goat: "🐐", pig: "🐖", chicken: "🐓", duck: "🦆", goose: "🪿", mouse: "🐁", hamster: "🐹", turtle: "🐢", frog: "🐸", lion: "🦁", tiger: "🐅", elephant: "🐘", giraffe: "🦒", monkey: "🐒", bear: "🐻", fox: "🦊", deer: "🦌", zebra: "🦓",
  robin: "🐦", sparrow: "🐦", eagle: "🦅", owl: "🦉", parrot: "🦜", penguin: "🐧", flamingo: "🦩", peacock: "🦚", swan: "🦢", pigeon: "🕊️", crow: "🐦‍⬛", raven: "🐦‍⬛", seagull: "🐦", woodpecker: "🐦", hummingbird: "🐦", stork: "🪽",
  apple: "🍎", banana: "🍌", orange: "🍊", pear: "🍐", peach: "🍑", plum: "🟣", grape: "🍇", cherry: "🍒", strawberry: "🍓", blueberry: "🫐", raspberry: "🫐", blackberry: "🫐", watermelon: "🍉", cantaloupe: "🍈", pineapple: "🍍", mango: "🥭", kiwi: "🥝", lemon: "🍋", lime: "🍋", apricot: "🍑",
  carrot: "🥕", potato: "🥔", tomato: "🍅", cucumber: "🥒", lettuce: "🥬", spinach: "🥬", broccoli: "🥦", cauliflower: "🥦", cabbage: "🥬", pumpkin: "🎃", corn: "🌽", peas: "🫛", bean: "🫘", onion: "🧅", garlic: "🧄", pepper: "🫑", celery: "🥬", radish: "🌱", beet: "🫜", zucchini: "🥒",
  bread: "🍞", rice: "🍚", pasta: "🍝", cereal: "🥣", sandwich: "🥪", soup: "🍲", salad: "🥗", pizza: "🍕", pancake: "🥞", waffle: "🧇", cheese: "🧀", yogurt: "🥣", egg: "🥚", butter: "🧈", honey: "🍯", jam: "🫙", cookie: "🍪", cracker: "🍘", muffin: "🧁", noodle: "🍜", tortilla: "🫓", dumpling: "🥟",
  shirt: "👕", trousers: "👖", shorts: "🩳", skirt: "👗", dress: "👗", sweater: "🧥", jacket: "🧥", coat: "🧥", raincoat: "🧥", sock: "🧦", shoe: "👟", boot: "🥾", sandal: "🩴", hat: "👒", cap: "🧢", scarf: "🧣", glove: "🧤", mitten: "🧤", belt: "🪢", uniform: "🥋", pajamas: "🥱",
  pencil: "✏️", pen: "🖊️", crayon: "🖍️", marker: "🖊️", eraser: "🧽", ruler: "📏", notebook: "📓", textbook: "📘", workbook: "📒", backpack: "🎒", lunchbox: "🍱", scissors: "✂️", glue: "🧴", sharpener: "🔪", calculator: "🧮", folder: "📁", paper: "📄", chalk: "🖍️", dictionary: "📕", highlighter: "🖍️", stapler: "📎",
  doll: "🪆", "teddy bear": "🧸", puzzle: "🧩", "building blocks": "🧱", kite: "🪁", "yo-yo": "🪀", marbles: "🔵", "spinning top": "🌀", "toy train": "🚂", "toy car": "🚗", "toy boat": "🛶", "toy robot": "🤖", puppet: "🪆", "jump rope": "🪢", "board game": "🎲", "building set": "🧱", "toy drum": "🥁", "play dough": "🟣",
  red: "🔴", cyan: "🔹", yellow: "🟡", green: "🟢", blue: "🔵", purple: "🟣", pink: "🩷", brown: "🟤", black: "⚫", white: "⚪", gray: "◽", silver: "🪙", gold: "🥇", turquoise: "🟦", violet: "🟣", beige: "🟫", navy: "🔵", maroon: "🔴",
  circle: "⭕", square: "🟦", triangle: "🔺", rectangle: "▭", oval: "🥚", star: "⭐", heart: "❤️", cube: "🧊", diamond: "💎", hexagon: "⬡", octagon: "🛑", cylinder: "🛢️", cone: "🍦", sphere: "🔮", crescent: "🌙", spiral: "🌀",
  one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣", five: "5️⃣", six: "6️⃣", seven: "7️⃣", eight: "8️⃣", nine: "9️⃣", ten: "🔟",
  park: "🌳", zoo: "🦒", library: "📚", museum: "🏛️", hospital: "🏥", bakery: "🥐", market: "🛒", restaurant: "🍽️", playground: "🛝", theater: "🎭", cinema: "🎬", "post office": "📮", airport: "🛫", supermarket: "🛒", bank: "🏦", hotel: "🏨", "swimming pool": "🏊", stadium: "🏟️", farm: "🚜", aquarium: "🐠", bookshop: "📚",
  car: "🚗", bus: "🚌", truck: "🚚", van: "🚐", taxi: "🚕", bicycle: "🚲", motorcycle: "🏍️", scooter: "🛴", tractor: "🚜", ambulance: "🚑", "fire engine": "🚒", "police car": "🚓", train: "🚆", subway: "🚇", airplane: "✈️", helicopter: "🚁", boat: "⛵", ship: "🚢", sailboat: "⛵", "hot-air balloon": "🎈", "delivery truck": "🚚",
  mountain: "⛰️", hill: "🌄", valley: "🏞️", forest: "🌲", jungle: "🌴", desert: "🏜️", island: "🏝️", beach: "🏖️", ocean: "🌊", river: "🏞️", lake: "🌅", pond: "🪷", waterfall: "💦", cave: "🕳️", field: "🌾", meadow: "🌼", volcano: "🌋", glacier: "🧊", cliff: "🪨", stream: "💧", canyon: "🏜️", wetland: "🪷",
  soccer: "⚽", basketball: "🏀", tennis: "🎾", swimming: "🏊", running: "🏃", baseball: "⚾", volleyball: "🏐", hockey: "🏒", gymnastics: "🤸", skating: "⛸️", skiing: "⛷️", surfing: "🏄", badminton: "🏸", rugby: "🏉", golf: "⛳", boxing: "🥊", karate: "🥋", cricket: "🏏", cycling: "🚴", wrestling: "🤼", fencing: "🤺", archery: "🏹",
  happy: "😊", sad: "😢", excited: "🤩", proud: "😌", worried: "😟", shy: "😊", calm: "😌", angry: "😠", surprised: "😲", curious: "🧐", brave: "🦸", lonely: "😔", grateful: "🙏", nervous: "😬", silly: "🤪", bored: "🥱", hopeful: "🌟", jealous: "😕",
  run: "🏃", jump: "🤾", skip: "🦘", dance: "💃", sing: "🎤", swim: "🏊", hop: "🐇", crawl: "🐛", walk: "🚶", laugh: "😄", smile: "😊", wave: "👋", clap: "👏", stretch: "🙆", yawn: "🥱", rest: "😴", climb: "🧗", slide: "🛝", skate: "🛼", blink: "😉", listen: "👂", whisper: "🤫", shout: "📣", think: "💭", dream: "💤", cheer: "🙌", jog: "🏃", splash: "💦",
};

function wordId(word: string) {
  return word.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function makeWordCard(word: string, topic: VocabularyTopic): WordCard {
  const isAction = topic.id === "actions" || topic.id === "routines";
  const isNumber = topic.id === "numbers";
  const sentence = isAction
    ? `The children can ${word} together.`
    : isNumber
      ? `I can count to ${word}.`
      : `We learned about ${word} in class.`;

  return {
    id: wordId(word),
    word,
    picture: wordPictures[word.toLocaleLowerCase()] ?? pictureHints[topic.label] ?? topic.icon,
    meaning: `The word “${word}” names ${topic.descriptor}.`,
    sentence,
    pronunciation: word,
    topic: topic.label,
    level: topic.level,
    ...(topic.id === "colors" ? { colorHex: colorHexByName[word.toLocaleLowerCase()] } : {}),
  };
}

export const curriculumWordSets: WordSet[] = vocabularyTopics.map((topic) => ({
  id: topic.id,
  label: topic.label,
  icon: topic.icon,
  words: topic.words.split("|").map((word) => makeWordCard(word, topic)),
}));

const invalidColorWords = curriculumWordSets.find((set) => set.id === "colors")?.words.filter((word) => !word.colorHex || !/^#[0-9a-f]{6}$/i.test(word.colorHex)) ?? [];
if (invalidColorWords.length) throw new Error(`Every Colors vocabulary word needs a valid swatch: ${invalidColorWords.map((word) => word.word).join(", ")}`);

const allCurriculumWords = curriculumWordSets.flatMap((set) => set.words);
const uniqueWordIds = new Set(allCurriculumWords.map((word) => word.id));
const duplicateWordIds = allCurriculumWords.map((word) => word.id).filter((id, index, ids) => ids.indexOf(id) !== index);

if (uniqueWordIds.size !== allCurriculumWords.length) {
  throw new Error(`Vocabulary curriculum contains duplicate word entries: ${[...new Set(duplicateWordIds)].join(", ")}.`);
}

if (allCurriculumWords.length < 500) {
  throw new Error(`Vocabulary curriculum requires at least 500 words; found ${allCurriculumWords.length}.`);
}

export const vocabularyWordCount = allCurriculumWords.length;
