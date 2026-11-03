export type ExtraGrammarLesson = {
  id: string; title: string; icon: string; explanation: string; example: string; level: "Beginner" | "Intermediate" | "Advanced"; questions: { prompt: string; choices: string[]; answer: string; explanation: string }[];
};

const grammarTopics = [
  ["common-nouns", "Common Nouns", "A common noun names a general person, place, animal, or thing.", "The teacher sings softly in class.", "teacher", "sings", "softly"],
  ["proper-nouns", "Proper Nouns", "A proper noun names one particular person, place, or thing and begins with a capital letter.", "Amina visits a city on Friday.", "Amina", "visits", "city"],
  ["collective-nouns", "Collective Nouns", "A collective noun names a group as one unit.", "The team celebrates after the game.", "team", "game", "celebrates"],
  ["abstract-nouns", "Abstract Nouns", "An abstract noun names a feeling, idea, or quality we cannot touch.", "Kindness helps everyone feel welcome.", "Kindness", "helps", "welcome"],
  ["concrete-nouns", "Concrete Nouns", "A concrete noun names something we can experience with our senses.", "The warm soup smells delicious.", "soup", "warm", "delicious"],
  ["personal-pronouns", "Personal Pronouns", "Personal pronouns stand for people or things, such as I, you, she, he, it, we, and they.", "Maya has a kite. She flies it.", "She", "kite", "flies"],
  ["possessive-pronouns", "Possessive Pronouns", "Possessive pronouns show who owns something: mine, yours, his, hers, ours, or theirs.", "That blue lunch box is hers.", "hers", "blue", "lunch"],
  ["action-verbs", "Action Verbs", "An action verb tells what a person, animal, or thing does.", "The playful puppy chases a ball.", "chases", "puppy", "playful"],
  ["helping-verbs", "Helping Verbs", "A helping verb works with another verb to show time or meaning.", "They are building a sandcastle.", "are", "They", "sandcastle"],
  ["linking-verbs", "Linking Verbs", "A linking verb connects a subject to a word that describes or renames it.", "The sky looks pink at sunset.", "looks", "pink", "sunset"],
  ["descriptive-adjectives", "Descriptive Adjectives", "A descriptive adjective tells more about a noun.", "A tiny green frog sits beside the pond.", "tiny", "frog", "sits"],
  ["comparative-adjectives", "Comparative Adjectives", "A comparative adjective compares two people, places, animals, or things.", "This path is shorter than the other path.", "shorter", "path", "other"],
  ["superlative-adjectives", "Superlative Adjectives", "A superlative adjective compares three or more things and often ends in -est.", "The tallest sunflower reaches the window.", "tallest", "sunflower", "reaches"],
  ["adverbs", "Adverbs", "An adverb can tell how, when, or where an action happens.", "The little bird sings sweetly in the morning.", "sweetly", "bird", "sings"],
  ["prepositions", "Prepositions", "A preposition shows how a noun relates to another word, often by place or time.", "The puppy sleeps beneath the table.", "beneath", "puppy", "sleeps"],
  ["conjunctions", "Conjunctions", "A conjunction joins words or parts of a sentence, for example and, but, or, and because.", "I wore my coat because the wind was cool.", "because", "coat", "cool"],
  ["interjections", "Interjections", "An interjection is a short word or phrase that shows a strong feeling.", "Wow! The kite flew over the roof.", "Wow!", "kite", "flew"],
  ["singular-plural", "Singular and Plural", "A singular noun names one; a plural noun names more than one.", "One brush is here, and two brushes are there.", "brushes", "brush", "here"],
  ["gender-nouns", "Noun Gender", "Some nouns tell whether a person or animal is male, female, or a general role.", "The queen waves beside the king.", "queen", "waves", "beside"],
  ["subject-predicate", "Subject and Predicate", "The subject tells who or what a sentence is about; the predicate tells something about it.", "The bright moon glows above the quiet lake.", "The bright moon", "glows above the quiet lake", "quiet"],
  ["sentence-formation", "Sentence Formation", "A sentence shares a complete thought and usually has a subject and a predicate.", "Our class planted beans in the garden.", "Our class planted beans in the garden.", "planted beans", "garden"],
  ["sentence-types", "Types of Sentences", "A telling sentence shares information, a question asks, and an exclamation shows strong feeling.", "Where did the little boat go?", "question", "telling sentence", "exclamation"],
  ["capitalization", "Capitalization", "Capitalize the first word in a sentence and the names of people and places.", "Sara and Omar visited Karachi.", "Sara", "visited", "and"],
  ["present-tense", "Present Tense", "Present-tense verbs tell what happens now or what happens regularly.", "Mira reads a new story every night.", "reads", "Mira", "story"],
  ["past-tense", "Past Tense", "Past-tense verbs tell about an action that already happened.", "We planted beans last Saturday.", "planted", "beans", "Saturday"],
  ["future-tense", "Future Tense", "Future-tense verbs tell about an action that will happen later.", "I will visit the museum tomorrow.", "will visit", "museum", "tomorrow"],
  ["simple-tenses", "Simple Tense Forms", "A simple verb form tells about a regular action, an action in the past, or one that will happen.", "Yesterday Jo painted a picture.", "painted", "Yesterday", "picture"],
  ["continuous-tenses", "Continuous Tenses", "Continuous verb forms use a form of be with an -ing verb for an ongoing action.", "The children are building a tall tower.", "are building", "children", "tower"],
  ["perfect-tenses", "Perfect Tenses", "Perfect verb forms use has, have, or had with a past participle.", "Lina has finished her puzzle.", "has finished", "puzzle", "Lina"],
  ["commas", "Commas in a List", "Commas separate items in a list and make the meaning easier to read.", "We packed apples, crackers, and water.", "apples, crackers, and water", "packed", "We"],
] as const;

const questionFrames = [
  (title: string, example: string) => `In “${example}”, which word or phrase shows ${title.toLowerCase()}?`,
  (title: string, example: string) => `Read “${example}”. Choose the example of ${title.toLowerCase()}.`,
  (title: string, example: string) => `Which answer best completes this ${title.toLowerCase()} check about “${example}”?`,
  (title: string, example: string) => `Look closely at “${example}”. What is the ${title.toLowerCase()} clue?`,
  (title: string, example: string) => `A learner is studying “${example}”. Which choice should they notice for ${title.toLowerCase()}?`,
  (title: string, example: string) => `Choose the right answer from the sentence “${example}” for ${title.toLowerCase()}.`,
  (title: string, example: string) => `Which part of “${example}” helps demonstrate ${title.toLowerCase()}?`,
  (title: string, example: string) => `In the practice sentence “${example}”, find the ${title.toLowerCase()} answer.`,
  (title: string, example: string) => `What should you pick when checking ${title.toLowerCase()} in “${example}”?`,
  (title: string, example: string) => `Which choice matches the lesson on ${title.toLowerCase()} in “${example}”?`,
  (title: string, example: string) => `Use the example “${example}”. What is the best ${title.toLowerCase()} response?`,
  (title: string, example: string) => `Which answer fits the ${title.toLowerCase()} idea shown in “${example}”?`,
  (title: string, example: string) => `For “${example}”, tap the correct ${title.toLowerCase()} choice.`,
];

export const expandedGrammarLessons: ExtraGrammarLesson[] = grammarTopics.map(([id, title, explanation, example, answer, distractorA, distractorB], index) => ({
  id, title, icon: "✦", explanation, example, level: index < 10 ? "Beginner" : index < 22 ? "Intermediate" : "Advanced",
  questions: questionFrames.map((frame, index) => ({
    prompt: frame(title, example),
    choices: index % 2 === 0 ? [answer, distractorA, distractorB] : [distractorB, answer, distractorA],
    answer,
    explanation: `${answer} is the best choice here. ${explanation}`,
  })),
}));

const storySeeds = [
  ["The Kite That Waited", "Nuri", "the hilltop", "fly a rainbow kite", "a gentle wind would not come", "Nuri and a friend made a paper tail", "the kite lifted when the breeze arrived", "Patience can make a good moment better", "🪁"],
  ["Milo's Missing Button", "Milo the bear", "a sunny garden", "find a shiny coat button", "the button rolled beneath a bench", "a robin spotted it near a flower", "Milo thanked his new helper", "Kind friends notice little things", "🐻"],
  ["The Bridge of Sticks", "Lina and Bo", "a woodland stream", "cross to pick berries", "the old stepping stones were slippery", "they built a safe bridge from strong sticks", "both friends crossed together", "Teamwork helps solve tricky problems", "🌉"],
  ["A Song for the Rain", "Pia the parrot", "a leafy tree", "cheer up the garden", "rain kept the flowers closed", "Pia sang a cheerful tune", "the clouds passed and the blossoms opened", "Hope can brighten a gray day", "🦜"],
  ["The Honest Paintbrush", "Tariq", "the art room", "finish a picture", "a paint splash landed on a friend's page", "he told the truth and helped clean it", "they painted a new picture together", "Honesty can help repair a mistake", "🖌️"],
  ["The Moonlit Map", "Zoya", "a quiet campsite", "find the picnic blanket", "the path looked different at night", "she followed the bright moon and familiar trees", "her family welcomed her back", "Stay calm and use what you know", "🌙"],
  ["The Helpful Hedgehog", "Hugo", "the orchard", "carry apples home", "his basket was too heavy", "squirrels shared a small wagon", "everyone rolled the apples safely", "Sharing a task makes it easier", "🦔"],
  ["The Little Cloud's Gift", "a small cloud", "above a thirsty meadow", "help the flowers", "the bright sun dried the grass", "the cloud gathered cool drops", "a soft shower refreshed the meadow", "Small help can make a big difference", "☁️"],
  ["Benny Builds a Nest", "Benny the bird", "a tall oak", "make a home", "one twig kept slipping away", "his neighbors brought soft grass", "the nest held firm in the branches", "Asking for help is a strong choice", "🐦"],
  ["The Quiet Library", "Mina", "the town library", "find a book about stars", "the shelves seemed very tall", "a librarian showed her the picture labels", "Mina found a book and read beneath a lamp", "Questions help us discover", "📚"],
  ["A Turn for Everyone", "Ari and friends", "the playground", "try the new swing", "everyone wanted to go first", "they made a fair turn-taking game", "each friend had a happy ride", "Fair turns make play kinder", "🎠"],
  ["The Seed in the Sidewalk", "a tiny seed", "a crack in the path", "grow toward the light", "hard ground left little room", "rain softened the soil around it", "a green leaf reached the sunshine", "Keep trying when you can", "🌱"],
  ["Nell's New Neighbor", "Nell the fox", "a cozy burrow", "welcome a new neighbor", "she felt shy about saying hello", "she brought warm berry muffins", "the two neighbors shared a story", "A small greeting can begin a friendship", "🦊"],
  ["The Snowy Footprints", "Puck the penguin", "a snowy beach", "find his scarf", "fresh snow covered the path", "he followed his own wide footprints back", "his scarf waited beside a shell", "Notice clues around you", "🐧"],
  ["The Clockwork Garden", "Eli", "his grandmother's shed", "make a watering helper", "the first wheel spun backward", "he studied the gears and changed one", "the little cart watered each pot", "Mistakes can teach us how things work", "⚙️"],
  ["The Brave Little Seedling", "a young sunflower", "a windy field", "stand tall", "a strong gust bent its stem", "a nearby fence blocked the wind", "the sunflower grew toward the morning", "Courage can grow with support", "🌻"],
  ["Soup for the Snowman", "Rafi", "a snowy yard", "make a surprise for a snowman", "snow could not taste hot soup", "he made a bowl-shaped snow hat instead", "his friends laughed and added a carrot nose", "Imagination makes play joyful", "⛄"],
  ["The River's Message", "Tala the turtle", "a winding river", "find the cleanest water", "fallen leaves covered the stream", "she guided friends upstream to a clear spring", "the animals drank fresh water", "Care for shared places", "🐢"],
  ["The Red Umbrella", "Omar", "the school gate", "get home in the rain", "his umbrella was small", "he shared it with a classmate", "they walked home side by side", "Kindness makes a hard day lighter", "☂️"],
  ["The Puzzle Picnic", "four friends", "a meadow", "open a picnic basket", "the latch had a picture puzzle", "each friend solved one small clue", "the basket opened for everyone", "Different ideas work well together", "🧺"],
  ["The Star in the Pond", "Lulu the duck", "a moonlit pond", "say hello to a star", "the star seemed to disappear", "she noticed its reflection in the water", "Lulu watched it sparkle all night", "Look carefully before deciding", "🦆"],
  ["The Lost Library Card", "Sam", "the school hallway", "return a library card", "he could not remember where it fell", "he retraced his steps with a teacher", "they found it near the reading rug", "A calm plan can help", "🎫"],
  ["The Busy Bee's Break", "Bibi the bee", "a field of clover", "visit every flower", "she grew tired before lunch", "she rested in a shady petal", "she flew again with fresh energy", "Rest helps us do our best", "🐝"],
  ["The Pebble Orchestra", "Kai", "beside a stream", "make music with friends", "their first sounds did not match", "they listened and found a steady beat", "the pebbles made a gentle song", "Listening helps a group work together", "🎵"],
  ["The Friendly Dragon", "Ember", "a mountain village", "make a new friend", "people were afraid of his smoke", "he used it to warm a cold bakery", "the villagers invited him to breakfast", "Helpful actions build trust", "🐉"],
  ["The Paper Rocket", "Maya", "the classroom", "send a rocket across the room", "her first rocket nosedived", "she folded the wings evenly", "the next rocket sailed past the desk", "Practice can improve an idea", "🚀"],
  ["A Home for the Ladybug", "Dot", "a garden", "find a safe leaf", "a gust blew her away", "a gardener set a leafy plant by the wall", "Dot settled beneath a cool leaf", "Gentle care matters", "🐞"],
  ["The Market Morning", "Asha", "the village market", "buy pears for a pie", "she had to count her coins", "the kind shopkeeper helped her count slowly", "Asha carried home just enough pears", "Take time with new skills", "🍐"],
  ["The Echoing Cave", "Timo", "a bright cave", "hear how echoes work", "his loud shout startled a bat", "he tried a soft clap instead", "the cave answered with a gentle echo", "Curiosity works best with care", "🦇"],
  ["The Big Blue Shoe", "Poppy the mouse", "a shoe shop", "find a tiny home", "every shoe looked too large", "she found a roomy blue slipper", "it became a cozy house", "A new use can hide in an old thing", "👟"],
  ["The Garden Helpers", "Noah and Iman", "a school garden", "grow lunch vegetables", "weeds crowded the young plants", "the class made a gentle weeding team", "lettuce and beans grew tall", "Shared care brings shared rewards", "🥬"],
  ["The Comet's Visit", "a curious comet", "the night sky", "see the world below", "clouds covered the valley", "the comet waited until the sky cleared", "it saw rooftops and a glowing sea", "Waiting can reveal a better view", "☄️"],
  ["The Wobbly Tower", "Rex the robot", "a playroom", "build the tallest block tower", "the tower leaned to one side", "Rex put wider blocks at the bottom", "the tower stood straight and tall", "A strong base helps us succeed", "🤖"],
  ["The Orange Scarf", "Nana the llama", "a chilly mountain trail", "keep her neck warm", "the wind tugged at her scarf", "a friend tied a safe loose knot", "Nana finished the walk smiling", "Friends can look out for each other", "🦙"],
  ["The Tiny Theater", "a group of frogs", "a pond bank", "tell a funny story", "they had no stage", "they used a flat rock and lily pads", "the pond animals clapped along", "Creativity can use simple things", "🐸"],
  ["The Great Leaf Race", "Maple and Ash", "a garden path", "race their bright leaves", "a puddle blocked the finish", "they floated the leaves across together", "both leaves reached the sunny side", "Fun matters more than winning", "🍂"],
  ["The Button Boat", "Pip the mouse", "a rain puddle", "sail a paper boat", "the boat tipped in the ripples", "Pip added a light leaf sail", "it floated all the way to the curb", "Try a small change when a plan slips", "⛵"],
  ["The Kindness Jar", "Laila", "her kitchen", "make her family smile", "she could not choose one big gift", "she wrote little thank-you notes", "everyone picked a note after dinner", "Kind words are gifts too", "💌"],
  ["The Coral Clue", "Nemo the fish", "a coral reef", "find a safe path home", "the reef had many turns", "he followed the striped shells he remembered", "his family waved at the reef gate", "Memory can guide us", "🐠"],
  ["The Helpful Wind", "a wind sprite", "a farm", "help dry the clean laundry", "the clothes were tangled", "she blew gently one line at a time", "the shirts danced in the sunshine", "Gentle effort can do a lot", "🌬️"],
  ["The Shy Drum", "Bola the elephant", "a music room", "play a drum for friends", "he worried his beat was too loud", "his friends played softly beside him", "Bola found a happy rhythm", "Practice feels easier with support", "🥁"],
  ["The Midnight Snack", "Pip the raccoon", "a quiet kitchen", "make a snack for his sister", "the jar lid was tight", "he asked his sister to help", "they shared crackers and giggles", "It is okay to ask for help", "🦝"],
  ["The Rainbow Path", "Ivy", "a rainy park", "find the end of a rainbow", "the rainbow moved as she walked", "she followed it to a puddle full of colors", "Ivy painted the scene at home", "Enjoy the discovery along the way", "🌈"],
  ["The Smallest Seed", "a tiny seed", "a wide garden", "find room to grow", "big plants shaded the soil", "a gardener made a sunny corner", "the seed grew into a little herb", "Everyone needs a chance to grow", "🌿"],
  ["The Snowflake's Journey", "Fia the snowflake", "a winter cloud", "see the world below", "warm air changed her shape", "she landed softly on a pine branch", "children admired her sparkling pattern", "Change can be beautiful", "❄️"],
  ["The Helpful Map", "Ben and Jo", "a park trail", "find the picnic spot", "two paths looked alike", "they checked the map and trail signs", "they arrived before the lemonade melted", "Use good clues to make a plan", "🗺️"],
  ["The Little Lighthouse", "Meri the seal", "a rocky shore", "guide boats through fog", "the old lamp had gone dark", "she polished its glass with a soft cloth", "the light shone across the bay", "Careful work can help many people", "🦭"],
  ["The Day the Colors Swapped", "a playful wizard", "a small village", "paint a cheerful mural", "his magic mixed every color", "the children turned each mix into a new pattern", "the village loved its one-of-a-kind wall", "Unexpected changes can inspire ideas", "🎨"],
  ["The Last Berry", "Runa the rabbit", "a berry patch", "pick the last berry", "her friend had not eaten yet", "she split the berry into two", "they planted its seeds for next year", "Sharing can help good things grow", "🫐"],
  ["The Lantern Parade", "Farah", "the village square", "join the evening parade", "her lantern would not glow", "a neighbor helped her replace its paper shade", "the lantern shone beside all the others", "Neighbors can solve problems together", "🏮"],
] as const;

export type ExtraStory = { id: string; title: string; picture: string; level: string; minutes: number; pages: string[]; vocabulary: string[]; question: string; choices: string[]; answer: string };
export const expandedStories: ExtraStory[] = storySeeds.map(([title, hero, place, goal, challenge, action, result, lesson, picture], index) => ({
  id: `story-${index + 4}`, title, picture, level: index < 16 ? "Beginner" : index < 32 ? "Growing reader" : "Confident reader", minutes: 3 + (index % 3),
  pages: [`${hero} visited ${place} to ${goal}. It was a bright day, and a new adventure was beginning.`, `${challenge}. ${action}, one careful step at a time.`, `${result}. ${lesson}.`],
  vocabulary: ["adventure", "bright", "careful"],
  question: `What did ${hero} learn during this adventure?`, choices: [lesson, "A good plan never needs to change.", "Friends should always work alone."], answer: lesson,
}));

export type DialogueScenario = { id: string; title: string; level: string; character: string; prompt: string; choices: string[]; answer: string; hint: string };
const dialogueSeeds = [
  ["Greeting a classmate", "Mia", "Hello! I am Mia. What is your name?", "Hi, I am Sam.", "Give a friendly greeting and share a name."],
  ["Introducing yourself", "Noah", "What do you like to do after school?", "I like to draw pictures.", "Answer with something you enjoy."],
  ["At the fruit stand", "Shopkeeper Lee", "Which fruit would you like today?", "May I have two apples, please?", "Ask politely for an item."],
  ["Finding the classroom", "A helpful teacher", "Can I help you find a room?", "Yes, please. Where is Room 4?", "Ask clearly for a place."],
  ["Meeting a new friend", "Ava", "Would you like to play a game with us?", "Yes, thank you. That sounds fun!", "Accept an invitation kindly."],
  ["Ordering a snack", "Cafe helper", "What would you like to eat?", "I would like a cheese sandwich, please.", "Use I would like to order."],
  ["Asking for directions", "Mr. Kim", "Where are you trying to go?", "How do I get to the library?", "Name the place you need."],
  ["Talking about a hobby", "Zara", "What do you enjoy doing on weekends?", "I enjoy riding my bicycle.", "Share an activity you like."],
  ["Borrowing a book", "Librarian", "What kind of story would you like?", "Could I borrow a story about space?", "Ask politely to borrow something."],
  ["Saying thank you", "Grandpa", "I brought you a little snack.", "Thank you! That is very kind.", "Show gratitude with a complete thought."],
] as const;
export const conversationScenarios: DialogueScenario[] = Array.from({ length: 50 }, (_, index) => {
  const [title, character, prompt, answer, hint] = dialogueSeeds[index % dialogueSeeds.length];
  const followUps = [
    ["What do you like to do after school?", "I like drawing pictures after school."],
    ["Could you please say that again?", "Of course. I said hello, and I am happy to meet you."],
    ["How can we share fairly?", "We can take turns so everyone gets a chance."],
    ["What would be a kind next step?", "I can listen and offer to help."],
    ["How can you finish politely?", "Thank you for talking with me. Have a nice day!"]
  ];
  const followUp = followUps[Math.floor(index / 10)];
  const finalAnswer = index < 10 ? answer : followUp[1];
  return { id: `dialogue-${index + 1}`, title: index < 10 ? title : `${title}: Follow-up ${Math.floor(index / 10)}`, level: index < 20 ? "Beginner" : index < 40 ? "Intermediate" : "Advanced", character, prompt: index < 10 ? prompt : followUp[0], choices: [finalAnswer, "I do not know, and I will not ask.", "Go away and be quiet."], answer: finalAnswer, hint: index < 10 ? hint : "Choose a calm, friendly response that answers the question." };
});
