(() => {
  const panel = document.getElementById('quotePanel');
  const startBtn = document.getElementById('quoteStartBtn');
  const nextBtn = document.getElementById('quoteNextBtn');
  const resetBtn = document.getElementById('quoteResetBtn');
  const levelEl = document.getElementById('quoteLevel');
  const scoreEl = document.getElementById('quoteScore');
  const streakEl = document.getElementById('quoteStreak');
  const bankEl = document.getElementById('quoteBank');
  const metaEl = document.getElementById('quoteMeta');
  const lineEl = document.getElementById('quoteLine');
  const promptEl = document.getElementById('quotePrompt');
  const choicesEl = document.getElementById('quoteChoices');
  const messageEl = document.getElementById('quoteMessage');
  const filterBtns = [...document.querySelectorAll('.quote-filter')];

  if (!panel || !startBtn || !nextBtn || !resetBtn || !choicesEl) return;

  const ADULT_SWIM = [
    ['Rick Sanchez', 'Rick and Morty', 'reckless genius', 'portal math', 'the garage', 2],
    ['Morty Smith', 'Rick and Morty', 'panicked loyalty', 'a school backpack', 'another dimension', 1],
    ['Summer Smith', 'Rick and Morty', 'teenage nerve', 'a stolen gadget', 'the spaceship', 1],
    ['Beth Smith', 'Rick and Morty', 'cold confidence', 'surgical precision', 'the horse hospital', 2],
    ['Jerry Smith', 'Rick and Morty', 'fragile optimism', 'a coupon', 'the driveway', 1],
    ['Mr. Poopybutthole', 'Rick and Morty', 'sunny weirdness', 'a scrapbook', 'the living room', 2],
    ['Frylock', 'Aqua Teen Hunger Force', 'tired intelligence', 'laser eyes', 'the rental house', 1],
    ['Master Shake', 'Aqua Teen Hunger Force', 'selfish noise', 'a doomed plan', 'the kitchen', 1],
    ['Meatwad', 'Aqua Teen Hunger Force', 'sweet confusion', 'a new shape', 'the carpet', 1],
    ['Carl Brutananadilewski', 'Aqua Teen Hunger Force', 'neighborhood rage', 'a lawn chair', 'the driveway', 1],
    ['Dr. Weird', 'Aqua Teen Hunger Force', 'lab insanity', 'a failed experiment', 'the cliffside lab', 2],
    ['Steve', 'Aqua Teen Hunger Force', 'assistant dread', 'a clipboard', 'the cliffside lab', 2],
    ['Rusty Venture', 'The Venture Bros.', 'bitter science', 'a bad invention', 'the Venture compound', 2],
    ['Brock Samson', 'The Venture Bros.', 'quiet violence', 'a knife', 'the hangar', 2],
    ['Hank Venture', 'The Venture Bros.', 'costumed bravery', 'a homemade disguise', 'the compound', 1],
    ['Dean Venture', 'The Venture Bros.', 'nervous sincerity', 'a textbook', 'the compound', 1],
    ['The Monarch', 'The Venture Bros.', 'theatrical revenge', 'wings and hatred', 'the cocoon', 2],
    ['Dr. Girlfriend', 'The Venture Bros.', 'deadpan command', 'a villain briefing', 'the cocoon', 2],
    ['Gary', 'The Venture Bros.', 'henchman anxiety', 'a numbered uniform', 'the loading bay', 2],
    ['Coach McGuirk', 'Home Movies', 'bad advice', 'a whistle', 'the soccer field', 1],
    ['Brendon Small', 'Home Movies', 'kid-director focus', 'a camcorder', 'the basement set', 1],
    ['Jason Penopolis', 'Home Movies', 'blunt kid logic', 'a snack', 'the backyard set', 1],
    ['Melissa Robbins', 'Home Movies', 'practical patience', 'a script page', 'the school hallway', 1],
    ['Early Cuyler', 'Squidbillies', 'backwoods fury', 'a trucker hat', 'the Georgia hills', 2],
    ['Granny Cuyler', 'Squidbillies', 'old-family menace', 'a frying pan', 'the shack', 2],
    ['Dan Halen', 'Squidbillies', 'corporate villainy', 'a development plan', 'the boardroom', 3],
    ['Space Ghost', 'Space Ghost Coast to Coast', 'talk-show ego', 'a cue card', 'the studio desk', 1],
    ['Zorak', 'Space Ghost Coast to Coast', 'sidekick contempt', 'a keyboard riff', 'the studio bandstand', 1],
    ['Moltar', 'Space Ghost Coast to Coast', 'control-room boredom', 'a monitor bank', 'the production booth', 1],
    ['Harvey Birdman', 'Harvey Birdman Attorney at Law', 'legal panic', 'a court file', 'the law office', 1],
    ['Phil Ken Sebben', 'Harvey Birdman Attorney at Law', 'executive nonsense', 'an eye patch', 'the conference room', 2],
    ['Birdgirl', 'Harvey Birdman Attorney at Law', 'heroic overcorrection', 'a legal pad', 'the rooftop', 2],
    ['Huey Freeman', 'The Boondocks', 'revolutionary clarity', 'a history book', 'Woodcrest', 1],
    ['Riley Freeman', 'The Boondocks', 'loud bravado', 'a spray can', 'Woodcrest', 1],
    ['Robert Freeman', 'The Boondocks', 'granddad pride', 'a belt', 'the Freeman house', 1],
    ['Uncle Ruckus', 'The Boondocks', 'toxic certainty', 'a terrible speech', 'the neighborhood', 2],
    ['Tom Dubois', 'The Boondocks', 'legal fear', 'a briefcase', 'the courthouse', 2],
    ['Stinkmeaner', 'The Boondocks', 'spiteful chaos', 'a fight stance', 'the street', 3],
    ['Thugnificent', 'The Boondocks', 'rap-star ego', 'a chain', 'Woodcrest', 2],
    ['Pim Pimling', 'Smiling Friends', 'bright helpfulness', 'a tiny mission', 'the office', 1],
    ['Charlie Dompler', 'Smiling Friends', 'dry reluctance', 'a deadpan stare', 'the office', 1],
    ['Mr. Boss', 'Smiling Friends', 'managerial weirdness', 'a staff memo', 'the break room', 2],
    ['Allan Red', 'Smiling Friends', 'organized frustration', 'a paperclip', 'the supply closet', 1],
    ['Glep', 'Smiling Friends', 'small mystery', 'a little hat', 'the couch', 2],
    ['Xavier', 'Xavier Renegade Angel', 'wandering philosophy', 'a question nobody asked', 'the desert road', 3],
    ['Assy McGee', 'Assy McGee', 'gruff detective work', 'a badge', 'the precinct', 3],
    ['Captain Murphy', 'Sealab 2021', 'undersea authority', 'a bad order', 'Sealab', 2],
    ['Debbie Dupree', 'Sealab 2021', 'crew sarcasm', 'a headset', 'Sealab', 2],
    ['Nathan Explosion', 'Metalocalypse', 'brutal seriousness', 'a microphone', 'the stage', 2],
    ['Pickles', 'Metalocalypse', 'drummer exhaustion', 'a tour schedule', 'the backstage room', 2]
  ];

  const HORROR_MOVIES = [
    ['Halloween', 'masked patience', 'a kitchen knife', 'Haddonfield', 1],
    ['Scream', 'phone-call terror', 'a voice changer', 'a suburban hallway', 1],
    ['A Nightmare on Elm Street', 'dream punishment', 'a bladed glove', 'the boiler room', 1],
    ['Friday the 13th', 'campfire dread', 'a hockey mask', 'Camp Crystal Lake', 1],
    ['The Texas Chain Saw Massacre', 'sunbaked panic', 'a roaring saw', 'a farmhouse', 2],
    ['Childs Play', 'doll-sized malice', 'a toy box', 'a city apartment', 1],
    ['Saw', 'trap-room logic', 'a tape recorder', 'a locked bathroom', 2],
    ['Hellraiser', 'forbidden pain', 'a puzzle box', 'a candlelit room', 3],
    ['Candyman', 'mirror folklore', 'a hook', 'a bathroom mirror', 2],
    ['The Exorcist', 'faith under siege', 'a bedroom window', 'Georgetown', 2],
    ['The Shining', 'hotel madness', 'a typewriter', 'the Overlook', 2],
    ['Psycho', 'motel suspicion', 'a shower curtain', 'Bates Motel', 1],
    ['Alien', 'spaceborne dread', 'a distress signal', 'the Nostromo', 2],
    ['Aliens', 'combat panic', 'a motion tracker', 'the colony', 2],
    ['Predator', 'jungle hunting', 'thermal vision', 'the rainforest', 2],
    ['The Thing', 'imitation paranoia', 'a blood test', 'the Antarctic station', 3],
    ['Poltergeist', 'suburban haunting', 'a static screen', 'the family house', 1],
    ['The Ring', 'cursed media', 'a videotape', 'a rainy room', 2],
    ['The Grudge', 'house-bound rage', 'a croaking sound', 'the staircase', 2],
    ['Insidious', 'astral danger', 'a red door', 'the Further', 2],
    ['The Conjuring', 'case-file dread', 'a music box', 'the farmhouse', 2],
    ['Annabelle', 'porcelain menace', 'a nursery shelf', 'the nursery', 1],
    ['Hereditary', 'family doom', 'a miniature house', 'the attic', 3],
    ['Midsommar', 'daylight ritual', 'flower crowns', 'the festival field', 3],
    ['Get Out', 'polite menace', 'a teacup', 'the family estate', 2],
    ['Us', 'double-life terror', 'red jumpsuits', 'the boardwalk', 2],
    ['Nope', 'skyward dread', 'a cloud that will not move', 'the ranch', 2],
    ['The Babadook', 'grief made monstrous', 'a pop-up book', 'the bedroom', 2],
    ['It Follows', 'slow pursuit', 'a fixed stare', 'the neighborhood', 3],
    ['The Witch', 'Puritan dread', 'a dark forest', 'the farmstead', 3],
    ['The Blair Witch Project', 'found-footage panic', 'stick figures', 'the woods', 2],
    ['Paranormal Activity', 'night-camera fear', 'a bedroom door', 'the house', 1],
    ['The Descent', 'cave panic', 'a headlamp', 'the tunnels', 3],
    ['28 Days Later', 'empty-city panic', 'an infection', 'London streets', 2],
    ['Dawn of the Dead', 'mall survival', 'barricades', 'the shopping mall', 2],
    ['Night of the Living Dead', 'siege survival', 'boarded windows', 'the farmhouse', 2],
    ['Evil Dead', 'cabin possession', 'a forbidden book', 'the woods cabin', 2],
    ['Evil Dead II', 'splatter chaos', 'a chainsaw hand', 'the cabin', 2],
    ['The Cabin in the Woods', 'genre machinery', 'a control panel', 'the hidden facility', 2],
    ['Final Destination', 'fate mechanics', 'a warning vision', 'the accident scene', 1],
    ['The Fly', 'body-horror science', 'a teleport pod', 'the lab', 2],
    ['Re-Animator', 'mad-science resurrection', 'green reagent', 'the medical school', 3],
    ['Bride of Chucky', 'killer-doll romance', 'a stitched face', 'the roadside', 2],
    ['Terrifier', 'silent cruelty', 'black-and-white face paint', 'the empty street', 3],
    ['Pearl', 'farmhouse ambition', 'a red dress', 'the barn', 3],
    ['X', 'backroad slasher tension', 'a film camera', 'the rented farm', 3],
    ['The Omen', 'ominous childhood', 'a birthday party', 'the mansion', 2],
    ['Rosemarys Baby', 'apartment paranoia', 'a strange necklace', 'the old building', 3],
    ['Suspiria', 'witch-school color', 'a dance academy', 'the academy hallway', 3],
    ['Jaws', 'summer-water panic', 'a closed beach sign', 'Amity Island', 1]
  ];

  const ADULT_TEMPLATES = [
    'I brought {object} into {place}, and now everyone is pretending my {trait} is the problem.',
    'If {place} gets any worse, I am blaming the person who doubted my {trait}.',
    'Nobody asked for {object}, but this situation clearly needed my {trait}.',
    'This is exactly why I do not trust {place} without {object}.',
    'I can fix this with {object}, a little {trait}, and no follow-up questions.',
    'Some people see a normal day in {place}; I see a reason to weaponize {trait}.',
    'The minute I walked into {place}, {object} became everybody else problem.',
    'Do not confuse my {trait} with a plan, because the plan is mostly {object}.',
    'I was calm until {place} started acting like it deserved my {trait}.',
    'Write this down: {object} plus {trait} equals a perfectly avoidable disaster.'
  ];

  const HORROR_TEMPLATES = [
    'The minute {object} showed up in {place}, everybody should have left.',
    'Nothing good waits in {place} when {object} is already in the room.',
    'You can survive {place}, but not if you ignore {object} and the {trait}.',
    'By sunrise, {place} will remember exactly what {object} started.',
    'A normal person sees {place}; a doomed person follows {object}.',
    'The warning was simple: do not touch {object}, especially with all that {trait}.',
    'Every hallway in {place} feels longer once {object} enters the story.',
    'The real mistake was thinking {trait} would stay outside {place}.',
    'If {object} is your first clue, {place} is already the trap.',
    'Nobody believes the danger until {trait} turns {object} into proof.'
  ];

  const maxCards = 30;
  const STORAGE_KEY = 'sudoku115QuoteStats';
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  let filter = 'mixed';
  let level = 1;
  let score = 0;
  let streak = 0;
  let asked = 0;
  let correct = 0;
  let wrong = 0;
  let current = null;
  let locked = false;
  let deck = [];
  let history = [];
  let advanceTimer = null;

  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  function fill(template, entry) {
    return template
      .replaceAll('{trait}', entry.trait)
      .replaceAll('{object}', entry.object)
      .replaceAll('{place}', entry.place);
  }

  function makeBank() {
    const cards = [];
    let id = 1;

    ADULT_SWIM.forEach(([answer, source, trait, object, place, baseLevel], entryIndex) => {
      ADULT_TEMPLATES.forEach((template, templateIndex) => {
        cards.push({
          id: `quote-${String(id++).padStart(4, '0')}`,
          type: 'adult',
          answer,
          source,
          level: Math.min(10, baseLevel + Math.floor(templateIndex / 3)),
          line: fill(template, { trait, object, place }),
          prompt: 'Which Adult Swim character said it?',
          seed: `${entryIndex}-${templateIndex}`
        });
      });
    });

    HORROR_MOVIES.forEach(([answer, trait, object, place, baseLevel], entryIndex) => {
      HORROR_TEMPLATES.forEach((template, templateIndex) => {
        cards.push({
          id: `quote-${String(id++).padStart(4, '0')}`,
          type: 'horror',
          answer,
          source: 'Horror Movie',
          level: Math.min(10, baseLevel + Math.floor(templateIndex / 3)),
          line: fill(template, { trait, object, place }),
          prompt: 'Which horror movie owns this line?',
          seed: `${entryIndex}-${templateIndex}`
        });
      });
    });

    return cards;
  }

  const QUOTES = makeBank();

  function setMessage(text, type = '') {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`.trim();
  }

  function saveStats() {
    saved.bestScore = Math.max(saved.bestScore || 0, score);
    saved.bestStreak = Math.max(saved.bestStreak || 0, streak);
    saved.plays = (saved.plays || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  function syncStats() {
    levelEl.textContent = `Level ${level}`;
    scoreEl.textContent = `Score ${score}`;
    streakEl.textContent = `Streak ${streak}`;
    bankEl.textContent = `Bank ${QUOTES.length}`;
  }

  function filteredCards() {
    if (filter === 'adult') return QUOTES.filter(card => card.type === 'adult');
    if (filter === 'horror') return QUOTES.filter(card => card.type === 'horror');
    return QUOTES;
  }

  function getPool() {
    const maxLevel = Math.min(10, level + 2);
    const bank = filteredCards();
    const fresh = bank.filter(card => card.level <= maxLevel && !history.includes(card.id));
    return fresh.length ? fresh : bank.filter(card => card.level <= maxLevel);
  }

  function refillDeck() {
    deck = shuffle(getPool());
  }

  function choicesFor(card) {
    const sameType = filteredCards()
      .filter(other => other.type === card.type && other.answer !== card.answer)
      .map(other => other.answer);
    const unique = [...new Set(sameType)];
    return shuffle([card.answer, ...shuffle(unique).slice(0, 2)]);
  }

  function animateCard() {
    const card = panel.querySelector('.quote-card');
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
    metaEl.textContent = `${current.type === 'adult' ? current.source : 'Horror Movie'} | Difficulty ${current.level}/10 | Card ${asked}/${maxCards}`;
    lineEl.textContent = current.line;
    promptEl.textContent = current.prompt;
    choicesEl.innerHTML = '';

    choicesFor(current).forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'quote-choice';
      btn.type = 'button';
      btn.textContent = choice;
      btn.addEventListener('click', () => chooseAnswer(btn, choice));
      choicesEl.appendChild(btn);
    });

    setMessage('Choose one of three.');
    syncStats();
  }

  function chooseAnswer(btn, choice) {
    if (locked || !current) return;
    locked = true;
    const isCorrect = choice === current.answer;

    [...choicesEl.children].forEach(choiceBtn => {
      choiceBtn.disabled = true;
      if (choiceBtn.textContent === current.answer) choiceBtn.classList.add('correct');
    });

    if (isCorrect) {
      correct++;
      streak++;
      const gained = 15 + current.level * 5 + streak * 2;
      score += gained;
      btn.classList.add('correct');
      if (streak > 0 && streak % 3 === 0) level = Math.min(10, level + 1);
      setMessage(`Correct. +${gained} points.`, 'good');
    } else {
      wrong++;
      streak = 0;
      const lost = 8 + current.level * 2;
      score -= lost;
      level = Math.max(1, level - 1);
      btn.classList.add('wrong');
      setMessage(`Wrong. Correct answer: ${current.answer}.`, 'bad');
    }

    syncStats();
    advanceTimer = setTimeout(nextCard, isCorrect ? 900 : 1550);
  }

  function finishRun() {
    clearTimeout(advanceTimer);
    locked = true;
    saveStats();
    current = null;
    metaEl.textContent = 'Run Complete';
    lineEl.textContent = `Final Score: ${score}`;
    promptEl.textContent = `Correct ${correct} | Wrong ${wrong} | Best streak saved ${saved.bestStreak || streak || 0}`;
    choicesEl.innerHTML = '';
    setMessage('Quote run complete. Press Reset to play again.', 'good');
    syncStats();
  }

  function startRun() {
    clearTimeout(advanceTimer);
    level = 1;
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

  function setFilter(nextFilter) {
    filter = nextFilter;
    filterBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.quoteFilter === filter));
    startRun();
  }

  startBtn.addEventListener('click', startRun);
  resetBtn.addEventListener('click', startRun);
  nextBtn.addEventListener('click', () => {
    clearTimeout(advanceTimer);
    if (!current && asked === 0) startRun();
    else nextCard();
  });
  filterBtns.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.quoteFilter)));

  syncStats();
  setMessage(`Ready. ${QUOTES.length} quote cards loaded.`);
})();
