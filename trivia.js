(() => {
  const panel = document.getElementById('triviaPanel');
  const startBtn = document.getElementById('triviaStartBtn');
  const nextBtn = document.getElementById('triviaNextBtn');
  const resetBtn = document.getElementById('triviaResetBtn');
  const levelEl = document.getElementById('triviaLevel');
  const scoreEl = document.getElementById('triviaScore');
  const streakEl = document.getElementById('triviaStreak');
  const categoryEl = document.getElementById('triviaCategory');
  const diffEl = document.getElementById('triviaDifficulty');
  const questionEl = document.getElementById('triviaQuestion');
  const answersEl = document.getElementById('triviaAnswers');
  const messageEl = document.getElementById('triviaMessage');

  if (!panel || !startBtn || !nextBtn || !resetBtn || !answersEl) return;

  const FACTS = [
    {
        "cat": "Boondocks",
        "answer": "Huey Freeman",
        "clue": "the politically serious older Freeman brother with the afro and revolutionary worldview",
        "wrong": [
            "Riley Freeman",
            "Robert Freeman",
            "Tom Dubois"
        ],
        "level": 1
    },
    {
        "cat": "Boondocks",
        "answer": "Riley Freeman",
        "clue": "the younger Freeman brother who idolizes gangster culture and chaos",
        "wrong": [
            "Huey Freeman",
            "Jazmine Dubois",
            "Uncle Ruckus"
        ],
        "level": 1
    },
    {
        "cat": "Boondocks",
        "answer": "Robert Freeman",
        "clue": "Huey and Riley's grandfather who moves the family to Woodcrest",
        "wrong": [
            "Tom Dubois",
            "Ed Wuncler",
            "Thugnificent"
        ],
        "level": 1
    },
    {
        "cat": "Boondocks",
        "answer": "Uncle Ruckus",
        "clue": "the recurring character known for extreme self-hating rants",
        "wrong": [
            "Stinkmeaner",
            "Bushido Brown",
            "A Pimp Named Slickback"
        ],
        "level": 2
    },
    {
        "cat": "Boondocks",
        "answer": "Tom Dubois",
        "clue": "the mild-mannered attorney who is often pulled into the Freeman family's chaos",
        "wrong": [
            "Robert Freeman",
            "Gin Rummy",
            "Ed Wuncler III"
        ],
        "level": 2
    },
    {
        "cat": "Boondocks",
        "answer": "Jazmine Dubois",
        "clue": "Tom and Sarah's biracial daughter and Huey's classmate",
        "wrong": [
            "Cindy McPhearson",
            "Sarah Dubois",
            "Cristal"
        ],
        "level": 2
    },
    {
        "cat": "Boondocks",
        "answer": "Thugnificent",
        "clue": "the rapper who moves into Woodcrest and disrupts the neighborhood",
        "wrong": [
            "Gangstalicious",
            "Rollo Goodlove",
            "Macktastic"
        ],
        "level": 3
    },
    {
        "cat": "Boondocks",
        "answer": "Stinkmeaner",
        "clue": "the blind old man whose fighting spirit becomes a recurring supernatural problem",
        "wrong": [
            "Uncle Ruckus",
            "Bushido Brown",
            "Colonel H. Stinkmeaner"
        ],
        "level": 3
    },
    {
        "cat": "Boondocks",
        "answer": "A Pimp Named Slickback",
        "clue": "the character whose name is meant to be said in full every time",
        "wrong": [
            "Thugnificent",
            "Gangstalicious",
            "Ed Wuncler III"
        ],
        "level": 3
    },
    {
        "cat": "Boondocks",
        "answer": "Woodcrest",
        "clue": "the suburb where the Freeman family lives in the animated series",
        "wrong": [
            "Springfield",
            "Quahog",
            "Arlen"
        ],
        "level": 1
    },
    {
        "cat": "Aqua Teen Hunger Force",
        "answer": "Frylock",
        "clue": "the floating box of fries who usually acts as the smartest member",
        "wrong": [
            "Master Shake",
            "Meatwad",
            "Carl"
        ],
        "level": 1
    },
    {
        "cat": "Aqua Teen Hunger Force",
        "answer": "Master Shake",
        "clue": "the selfish talking milkshake who causes many of the team's problems",
        "wrong": [
            "Frylock",
            "Meatwad",
            "Dr. Weird"
        ],
        "level": 1
    },
    {
        "cat": "Aqua Teen Hunger Force",
        "answer": "Meatwad",
        "clue": "the simple shapeshifting ball of meat with a childlike personality",
        "wrong": [
            "Frylock",
            "Carl",
            "Mooninite"
        ],
        "level": 1
    },
    {
        "cat": "Aqua Teen Hunger Force",
        "answer": "Carl Brutananadilewski",
        "clue": "the neighbor who suffers from the Aqua Teens' chaos",
        "wrong": [
            "Coach McGuirk",
            "Brock Samson",
            "Hank Hill"
        ],
        "level": 2
    },
    {
        "cat": "Aqua Teen Hunger Force",
        "answer": "Mooninites",
        "clue": "the pixel-styled alien duo who act superior despite being ridiculous",
        "wrong": [
            "Plutonians",
            "Cybernetic Ghost",
            "Brownie Monsters"
        ],
        "level": 2
    },
    {
        "cat": "Aqua Teen Hunger Force",
        "answer": "Dr. Weird",
        "clue": "the scientist whose bizarre experiments open many early episodes",
        "wrong": [
            "Steve",
            "Frylock",
            "Oglethorpe"
        ],
        "level": 2
    },
    {
        "cat": "Aqua Teen Hunger Force",
        "answer": "Ignignokt",
        "clue": "the green Mooninite who often leads the pixelated alien duo",
        "wrong": [
            "Err",
            "Oglethorpe",
            "Emory"
        ],
        "level": 3
    },
    {
        "cat": "Aqua Teen Hunger Force",
        "answer": "Err",
        "clue": "the smaller purple Mooninite partnered with Ignignokt",
        "wrong": [
            "Ignignokt",
            "Meatwad",
            "MC Pee Pants"
        ],
        "level": 3
    },
    {
        "cat": "Aqua Teen Hunger Force",
        "answer": "MC Pee Pants",
        "clue": "the giant spider rapper voiced as a ridiculous hip-hop character",
        "wrong": [
            "Sir Loin",
            "Handbanana",
            "Rabbot"
        ],
        "level": 3
    },
    {
        "cat": "Aqua Teen Hunger Force",
        "answer": "Rabbot",
        "clue": "the robotic rabbit from the first Aqua Teen episode",
        "wrong": [
            "Handbanana",
            "Cybernetic Ghost",
            "Willie Nelson"
        ],
        "level": 2
    },
    {
        "cat": "Simpsons",
        "answer": "Homer Simpson",
        "clue": "the safety inspector in Sector 7-G who often says D'oh",
        "wrong": [
            "Bart Simpson",
            "Ned Flanders",
            "Waylon Smithers"
        ],
        "level": 1
    },
    {
        "cat": "Simpsons",
        "answer": "Marge Simpson",
        "clue": "the blue-haired mother of the Simpson family",
        "wrong": [
            "Lisa Simpson",
            "Patty Bouvier",
            "Edna Krabappel"
        ],
        "level": 1
    },
    {
        "cat": "Simpsons",
        "answer": "Bart Simpson",
        "clue": "the prankster son known for troublemaking and skateboarding",
        "wrong": [
            "Milhouse Van Houten",
            "Nelson Muntz",
            "Ralph Wiggum"
        ],
        "level": 1
    },
    {
        "cat": "Simpsons",
        "answer": "Lisa Simpson",
        "clue": "the intelligent saxophone-playing daughter",
        "wrong": [
            "Maggie Simpson",
            "Janey Powell",
            "Allison Taylor"
        ],
        "level": 1
    },
    {
        "cat": "Simpsons",
        "answer": "Maggie Simpson",
        "clue": "the pacifier-sucking baby of the Simpson family",
        "wrong": [
            "Lisa Simpson",
            "Ling Bouvier",
            "Gerald Samson"
        ],
        "level": 1
    },
    {
        "cat": "Simpsons",
        "answer": "Mr. Burns",
        "clue": "the elderly owner of the Springfield Nuclear Power Plant",
        "wrong": [
            "Waylon Smithers",
            "Kent Brockman",
            "Mayor Quimby"
        ],
        "level": 2
    },
    {
        "cat": "Simpsons",
        "answer": "Waylon Smithers",
        "clue": "Mr. Burns' loyal assistant",
        "wrong": [
            "Lenny Leonard",
            "Carl Carlson",
            "Seymour Skinner"
        ],
        "level": 2
    },
    {
        "cat": "Simpsons",
        "answer": "Moe Szyslak",
        "clue": "the bartender who runs Moe's Tavern",
        "wrong": [
            "Barney Gumble",
            "Apu Nahasapeemapetilon",
            "Chief Wiggum"
        ],
        "level": 2
    },
    {
        "cat": "Simpsons",
        "answer": "Apu Nahasapeemapetilon",
        "clue": "the longtime Kwik-E-Mart clerk",
        "wrong": [
            "Moe Szyslak",
            "Dr. Hibbert",
            "Krusty"
        ],
        "level": 2
    },
    {
        "cat": "Simpsons",
        "answer": "Ned Flanders",
        "clue": "Homer's extremely friendly religious neighbor",
        "wrong": [
            "Reverend Lovejoy",
            "Principal Skinner",
            "Chief Wiggum"
        ],
        "level": 2
    },
    {
        "cat": "Family Guy",
        "answer": "Peter Griffin",
        "clue": "the chaotic father of the Griffin family",
        "wrong": [
            "Brian Griffin",
            "Joe Swanson",
            "Cleveland Brown"
        ],
        "level": 1
    },
    {
        "cat": "Family Guy",
        "answer": "Lois Griffin",
        "clue": "Peter's wife and the mother of Meg, Chris, and Stewie",
        "wrong": [
            "Marge Simpson",
            "Peggy Hill",
            "Francine Smith"
        ],
        "level": 1
    },
    {
        "cat": "Family Guy",
        "answer": "Stewie Griffin",
        "clue": "the unusually intelligent baby with a dramatic personality",
        "wrong": [
            "Chris Griffin",
            "Rallo Tubbs",
            "Bobby Hill"
        ],
        "level": 1
    },
    {
        "cat": "Family Guy",
        "answer": "Brian Griffin",
        "clue": "the Griffin family dog who talks and writes",
        "wrong": [
            "Santa's Little Helper",
            "Vinny",
            "Jasper"
        ],
        "level": 1
    },
    {
        "cat": "Family Guy",
        "answer": "Meg Griffin",
        "clue": "the often-mocked oldest Griffin child",
        "wrong": [
            "Lisa Simpson",
            "Hayley Smith",
            "Luanne Platter"
        ],
        "level": 1
    },
    {
        "cat": "Family Guy",
        "answer": "Chris Griffin",
        "clue": "the Griffin son voiced by Seth Green",
        "wrong": [
            "Neil Goldman",
            "Kevin Swanson",
            "Bobby Hill"
        ],
        "level": 2
    },
    {
        "cat": "Family Guy",
        "answer": "Glenn Quagmire",
        "clue": "Peter's neighbor known for 'Giggity'",
        "wrong": [
            "Joe Swanson",
            "Cleveland Brown",
            "Mort Goldman"
        ],
        "level": 2
    },
    {
        "cat": "Family Guy",
        "answer": "Cleveland Brown",
        "clue": "the neighbor who later received a spinoff",
        "wrong": [
            "Joe Swanson",
            "Tom Tucker",
            "Adam West"
        ],
        "level": 2
    },
    {
        "cat": "Family Guy",
        "answer": "Joe Swanson",
        "clue": "the police officer neighbor of the Griffins",
        "wrong": [
            "Glenn Quagmire",
            "Carter Pewterschmidt",
            "Horace"
        ],
        "level": 2
    },
    {
        "cat": "Family Guy",
        "answer": "Quahog",
        "clue": "the fictional Rhode Island town where Family Guy is set",
        "wrong": [
            "Springfield",
            "Arlen",
            "Langley Falls"
        ],
        "level": 1
    },
    {
        "cat": "King of the Hill",
        "answer": "Hank Hill",
        "clue": "the propane salesman who values order, lawn care, and responsibility",
        "wrong": [
            "Dale Gribble",
            "Bill Dauterive",
            "Boomhauer"
        ],
        "level": 1
    },
    {
        "cat": "King of the Hill",
        "answer": "Peggy Hill",
        "clue": "Hank's confident substitute-teacher wife",
        "wrong": [
            "Nancy Gribble",
            "Minh Souphanousinphone",
            "Luanne Platter"
        ],
        "level": 1
    },
    {
        "cat": "King of the Hill",
        "answer": "Bobby Hill",
        "clue": "Hank and Peggy's son who loves comedy and performance",
        "wrong": [
            "Joseph Gribble",
            "Connie Souphanousinphone",
            "Dooley"
        ],
        "level": 1
    },
    {
        "cat": "King of the Hill",
        "answer": "Dale Gribble",
        "clue": "the conspiracy-minded exterminator who uses the alias Rusty Shackleford",
        "wrong": [
            "Bill Dauterive",
            "Boomhauer",
            "Buck Strickland"
        ],
        "level": 2
    },
    {
        "cat": "King of the Hill",
        "answer": "Boomhauer",
        "clue": "Hank's fast-talking neighbor with a famously hard-to-follow voice",
        "wrong": [
            "Bill Dauterive",
            "Dale Gribble",
            "Lucky"
        ],
        "level": 2
    },
    {
        "cat": "King of the Hill",
        "answer": "Bill Dauterive",
        "clue": "Hank's lonely barber friend and former high school football teammate",
        "wrong": [
            "Dale Gribble",
            "Buck Strickland",
            "Kahn"
        ],
        "level": 2
    },
    {
        "cat": "King of the Hill",
        "answer": "Strickland Propane",
        "clue": "the company where Hank works",
        "wrong": [
            "Mega Lo Mart",
            "Kwik-E-Mart",
            "Pawtucket Brewery"
        ],
        "level": 1
    },
    {
        "cat": "King of the Hill",
        "answer": "Luanne Platter",
        "clue": "Peggy's niece who lives with the Hills for much of the show",
        "wrong": [
            "Connie",
            "Nancy",
            "Minh"
        ],
        "level": 2
    },
    {
        "cat": "King of the Hill",
        "answer": "Arlen",
        "clue": "the fictional Texas town where King of the Hill is set",
        "wrong": [
            "Springfield",
            "Quahog",
            "Woodcrest"
        ],
        "level": 1
    },
    {
        "cat": "King of the Hill",
        "answer": "Buck Strickland",
        "clue": "Hank's boss at Strickland Propane",
        "wrong": [
            "Cotton Hill",
            "Kahn Souphanousinphone",
            "Ted Wassanasong"
        ],
        "level": 2
    },
    {
        "cat": "Disney Films",
        "answer": "Simba",
        "clue": "the lion cub protagonist of The Lion King",
        "wrong": [
            "Mowgli",
            "Kovu",
            "Bambi"
        ],
        "level": 1
    },
    {
        "cat": "Disney Films",
        "answer": "Ariel",
        "clue": "the mermaid princess who wants to be part of the human world",
        "wrong": [
            "Belle",
            "Jasmine",
            "Moana"
        ],
        "level": 1
    },
    {
        "cat": "Disney Films",
        "answer": "Ursula",
        "clue": "the sea witch who makes a dangerous contract with Ariel",
        "wrong": [
            "Maleficent",
            "Cruella de Vil",
            "Yzma"
        ],
        "level": 2
    },
    {
        "cat": "Disney Films",
        "answer": "Mulan",
        "clue": "the heroine who disguises herself to take her father's place in war",
        "wrong": [
            "Pocahontas",
            "Raya",
            "Merida"
        ],
        "level": 1
    },
    {
        "cat": "Disney Films",
        "answer": "Genie",
        "clue": "the magical blue wish-granter in Aladdin",
        "wrong": [
            "Jafar",
            "Mushu",
            "Kronk"
        ],
        "level": 1
    },
    {
        "cat": "Disney Films",
        "answer": "Yzma",
        "clue": "the villain in The Emperor's New Groove who schemes with Kronk",
        "wrong": [
            "Ursula",
            "Madam Mim",
            "Mother Gothel"
        ],
        "level": 2
    },
    {
        "cat": "Disney Films",
        "answer": "Experiment 626",
        "clue": "the alien designation of Stitch",
        "wrong": [
            "WALL-E",
            "Baymax",
            "EVE"
        ],
        "level": 2
    },
    {
        "cat": "Disney Films",
        "answer": "Miguel",
        "clue": "the young musician at the center of Coco",
        "wrong": [
            "Ernesto de la Cruz",
            "Hiro Hamada",
            "Luca"
        ],
        "level": 2
    },
    {
        "cat": "Disney Films",
        "answer": "Moana",
        "clue": "the wayfinder chosen by the ocean",
        "wrong": [
            "Raya",
            "Elsa",
            "Mirabel"
        ],
        "level": 1
    },
    {
        "cat": "Disney Films",
        "answer": "Maleficent",
        "clue": "the villain who curses Princess Aurora",
        "wrong": [
            "The Evil Queen",
            "Lady Tremaine",
            "Cruella de Vil"
        ],
        "level": 2
    },
    {
        "cat": "Horror Films",
        "answer": "Ghostface",
        "clue": "the masked killer identity used in the Scream franchise",
        "wrong": [
            "Michael Myers",
            "Jason Voorhees",
            "Leatherface"
        ],
        "level": 1
    },
    {
        "cat": "Horror Films",
        "answer": "Michael Myers",
        "clue": "the silent masked killer associated with Halloween",
        "wrong": [
            "Freddy Krueger",
            "Jason Voorhees",
            "Ghostface"
        ],
        "level": 1
    },
    {
        "cat": "Horror Films",
        "answer": "Freddy Krueger",
        "clue": "the dream-stalking killer from A Nightmare on Elm Street",
        "wrong": [
            "Pinhead",
            "Chucky",
            "Candyman"
        ],
        "level": 1
    },
    {
        "cat": "Horror Films",
        "answer": "Jason Voorhees",
        "clue": "the hockey-masked figure tied to Friday the 13th",
        "wrong": [
            "Michael Myers",
            "Leatherface",
            "Jigsaw"
        ],
        "level": 1
    },
    {
        "cat": "Horror Films",
        "answer": "Laurie Strode",
        "clue": "the main survivor associated with Halloween",
        "wrong": [
            "Sidney Prescott",
            "Nancy Thompson",
            "Ellen Ripley"
        ],
        "level": 2
    },
    {
        "cat": "Horror Films",
        "answer": "Sidney Prescott",
        "clue": "the recurring final girl of the Scream films",
        "wrong": [
            "Gale Weathers",
            "Tatum Riley",
            "Laurie Strode"
        ],
        "level": 2
    },
    {
        "cat": "Horror Films",
        "answer": "The Thing",
        "clue": "the Antarctic horror film about a shape-shifting imitation threat",
        "wrong": [
            "Alien",
            "The Fly",
            "The Mist"
        ],
        "level": 3
    },
    {
        "cat": "Horror Films",
        "answer": "Alien",
        "clue": "the film that introduced the Xenomorph aboard the Nostromo",
        "wrong": [
            "Predator",
            "Event Horizon",
            "Species"
        ],
        "level": 2
    },
    {
        "cat": "Horror Films",
        "answer": "Hellraiser",
        "clue": "the franchise associated with the Lament Configuration puzzle box",
        "wrong": [
            "Candyman",
            "Insidious",
            "Sinister"
        ],
        "level": 3
    },
    {
        "cat": "Horror Films",
        "answer": "Midsommar",
        "clue": "the daylight folk-horror film centered around a festival nightmare",
        "wrong": [
            "Hereditary",
            "The Witch",
            "The Ritual"
        ],
        "level": 3
    }
];

  const TEMPLATES = [
    "Which answer best matches this clue: {clue}?",
    "In {cat}, who or what is described as {clue}?",
    "Fan-detail check: choose the reference that fits '{clue}'.",
    "Which option correctly connects to this {cat} detail: {clue}?",
    "Pick the right answer for this clue: {clue}.",
    "Hard memory check — {clue}. What is the answer?",
    "What {cat} reference is being described here: {clue}?",
    "Only one option fits: {clue}. Which is it?",
    "Which name/title belongs to this description: {clue}?",
    "Trivia card: {clue}. Select the correct match.",
    "Which answer would a specific fan connect with: {clue}?",
    "What is the smart match for this pop-culture clue: {clue}?",
    "Identify the correct reference: {clue}.",
    "Which option is not a distractor for this clue: {clue}?",
    "Choose the canon-style match: {clue}."
];

  function buildQuestionBank() {
    const cards = [];
    let id = 1;
    FACTS.forEach((fact, factIndex) => {
      TEMPLATES.forEach((template, templateIndex) => {
        const difficulty = Math.min(10, fact.level + Math.floor(templateIndex / 3));
        cards.push({
          id: `trivia-${String(id++).padStart(4, '0')}`,
          level: difficulty,
          cat: fact.cat,
          q: template.replaceAll('{clue}', fact.clue).replaceAll('{cat}', fact.cat),
          a: fact.answer,
          wrong: [...fact.wrong],
          seed: `${factIndex}-${templateIndex}`
        });
      });
    });
    return cards;
  }

  const QUESTIONS = buildQuestionBank();
  const maxCards = 20;

  let level = 1;
  let highestLevel = 1;
  let score = 0;
  let streak = 0;
  let asked = 0;
  let correct = 0;
  let wrong = 0;
  let current = null;
  let locked = false;
  let deck = [];
  let advanceTimer = null;
  let history = [];

  const shuffle = (arr) => arr
    .map(value => [Math.random(), value])
    .sort((a, b) => a[0] - b[0])
    .map(pair => pair[1]);

  function setMessage(text, type = '') {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`.trim();
  }

  function syncStats() {
    levelEl.textContent = `Level ${level}`;
    scoreEl.textContent = `Score ${score}`;
    streakEl.textContent = `Streak ${streak}`;
    categoryEl.textContent = current ? current.cat : `Bank: ${QUESTIONS.length} cards`;
  }

  function getPool() {
    const maxLevel = Math.min(10, level + 1);
    const pool = QUESTIONS.filter(card => card.level <= maxLevel && !history.includes(card.id));
    return pool.length ? pool : QUESTIONS.filter(card => card.level <= maxLevel);
  }

  function refillDeck() {
    deck = shuffle(getPool());
  }

  function animateCard() {
    const card = panel.querySelector('.trivia-card');
    if (!card) return;
    card.classList.remove('flip');
    void card.offsetWidth;
    card.classList.add('flip');
  }

  function nextCard() {
    clearTimeout(advanceTimer);
    if (asked >= maxCards) {
      finishRun();
      return;
    }

    locked = false;
    if (!deck.length) refillDeck();
    current = deck.pop();
    if (!current) {
      finishRun();
      return;
    }

    history.push(current.id);
    asked++;

    animateCard();
    diffEl.textContent = `${current.cat} • Difficulty ${current.level}/10 • Card ${asked}/${maxCards}`;
    questionEl.textContent = current.q;
    answersEl.innerHTML = '';

    shuffle([current.a, ...current.wrong]).forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'trivia-answer';
      btn.type = 'button';
      btn.textContent = choice;
      btn.addEventListener('click', () => chooseAnswer(btn, choice));
      answersEl.appendChild(btn);
    });

    setMessage('Choose the best answer.', '');
    syncStats();
  }

  function chooseAnswer(btn, choice) {
    if (locked || !current) return;
    locked = true;
    const isCorrect = choice === current.a;

    [...answersEl.children].forEach(answerBtn => {
      answerBtn.disabled = true;
      if (answerBtn.textContent === current.a) answerBtn.classList.add('correct');
    });

    if (isCorrect) {
      correct++;
      streak++;
      const gained = 10 + current.level * 4 + streak;
      score += gained;
      btn.classList.add('correct');
      if (streak > 0 && streak % 2 === 0) level = Math.min(10, level + 1);
      highestLevel = Math.max(highestLevel, level);
      setMessage(`Correct. +${gained} points. Next card loading...`, 'good');
    } else {
      wrong++;
      streak = 0;
      const lost = 8 + current.level * 3;
      score -= lost;
      btn.classList.add('wrong');
      level = Math.max(1, level - 1);
      setMessage(`Wrong. -${lost} points. Correct: ${current.a}. Next card loading...`, 'bad');
    }

    syncStats();
    advanceTimer = setTimeout(() => nextCard(), isCorrect ? 850 : 1500);
  }

  function finishRun() {
    clearTimeout(advanceTimer);
    locked = true;
    current = null;
    diffEl.textContent = 'Run Complete';
    questionEl.textContent = `Final Score: ${score}`;
    answersEl.innerHTML = `<div class="trivia-summary">Correct: ${correct}<br>Wrong: ${wrong}<br>Highest Level Reached: ${highestLevel}<br>Cards Played: ${asked}<br>Total Bank Available: ${QUESTIONS.length} cards</div>`;
    setMessage('Run complete. Press Reset to start over.', 'good');
    syncStats();
  }

  function startRun() {
    clearTimeout(advanceTimer);
    level = 1;
    highestLevel = 1;
    score = 0;
    streak = 0;
    asked = 0;
    correct = 0;
    wrong = 0;
    current = null;
    locked = false;
    deck = [];
    history = [];
    syncStats();
    nextCard();
  }

  startBtn.addEventListener('click', startRun);
  resetBtn.addEventListener('click', startRun);
  nextBtn.addEventListener('click', () => {
    clearTimeout(advanceTimer);
    if (!current && asked === 0) startRun();
    else nextCard();
  });

  syncStats();
  setMessage(`Press Start Trivia to begin. ${QUESTIONS.length} cards loaded.`, '');
})();
