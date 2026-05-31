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

  const QUESTIONS = [
    { level: 1, cat: 'Boondocks', q: 'Who is Huey Freeman’s younger brother?', a: 'Riley Freeman', wrong: ['Robert Freeman', 'Tom Dubois', 'Ed Wuncler'] },
    { level: 1, cat: 'Aqua Teen', q: 'Which character is a floating box of fries?', a: 'Frylock', wrong: ['Master Shake', 'Meatwad', 'Carl'] },
    { level: 1, cat: 'Simpsons', q: 'What is the name of the town where The Simpsons live?', a: 'Springfield', wrong: ['Quahog', 'Arlen', 'South Park'] },
    { level: 1, cat: 'Family Guy', q: 'What is the Griffin family dog named?', a: 'Brian', wrong: ['Santa’s Little Helper', 'Buckley', 'Mr. Peanutbutter'] },
    { level: 1, cat: 'King of the Hill', q: 'What does Hank Hill famously sell?', a: 'Propane and propane accessories', wrong: ['Auto parts', 'Lawn mowers', 'Fishing supplies'] },
    { level: 1, cat: 'Disney', q: 'Which Disney movie features Simba?', a: 'The Lion King', wrong: ['Aladdin', 'Tarzan', 'Hercules'] },
    { level: 1, cat: 'Horror', q: 'Which horror franchise uses the Ghostface mask?', a: 'Scream', wrong: ['Halloween', 'Saw', 'Friday the 13th'] },
    { level: 2, cat: 'Aqua Teen', q: 'What neighbor often gets dragged into Aqua Teen chaos?', a: 'Carl Brutananadilewski', wrong: ['Coach McGuirk', 'Brock Samson', 'Principal Skinner'] },
    { level: 2, cat: 'Boondocks', q: 'Who is Huey and Riley’s grandfather?', a: 'Robert Freeman', wrong: ['Uncle Ruckus', 'Tom Dubois', 'Thugnificent'] },
    { level: 2, cat: 'Simpsons', q: 'What is the name of Homer’s workplace?', a: 'Springfield Nuclear Power Plant', wrong: ['Planet Express', 'Strickland Propane', 'Quahog Brewery'] },
    { level: 2, cat: 'Family Guy', q: 'What fictional Rhode Island town is Family Guy set in?', a: 'Quahog', wrong: ['Springfield', 'Arlen', 'Langley Falls'] },
    { level: 2, cat: 'King of the Hill', q: 'What is Bobby Hill’s relationship to Hank?', a: 'His son', wrong: ['His nephew', 'His neighbor', 'His cousin'] },
    { level: 2, cat: 'Disney', q: 'Which Disney villain is tied to the sea and contracts?', a: 'Ursula', wrong: ['Maleficent', 'Cruella de Vil', 'Yzma'] },
    { level: 2, cat: 'Horror', q: 'Which horror film features a cursed videotape?', a: 'The Ring', wrong: ['The Grudge', 'Sinister', 'Insidious'] },
    { level: 3, cat: 'Boondocks', q: 'Which character is known for deeply internalized prejudice and wild rants?', a: 'Uncle Ruckus', wrong: ['Stinkmeaner', 'A Pimp Named Slickback', 'Ed Wuncler III'] },
    { level: 3, cat: 'Aqua Teen', q: 'Which Aqua Teen character is a shapeshifting ball of meat?', a: 'Meatwad', wrong: ['Frylock', 'Master Shake', 'Mooninite'] },
    { level: 3, cat: 'Simpsons', q: 'What instrument does Lisa Simpson play?', a: 'Saxophone', wrong: ['Trumpet', 'Clarinet', 'Trombone'] },
    { level: 3, cat: 'Family Guy', q: 'Who is Peter Griffin’s wife?', a: 'Lois Griffin', wrong: ['Marge Simpson', 'Peggy Hill', 'Francine Smith'] },
    { level: 3, cat: 'King of the Hill', q: 'Who is Hank’s chain-smoking wife?', a: 'Peggy Hill', wrong: ['Nancy Gribble', 'Minh Souphanousinphone', 'Luanne Platter'] },
    { level: 3, cat: 'Disney', q: 'Which Disney film centers on Miguel and Día de los Muertos?', a: 'Coco', wrong: ['Encanto', 'Moana', 'Soul'] },
    { level: 3, cat: 'Horror', q: 'Which movie features the Lament Configuration puzzle box?', a: 'Hellraiser', wrong: ['Candyman', 'The Thing', 'Event Horizon'] },
    { level: 4, cat: 'Boondocks', q: 'Which rapper character moves into Woodcrest?', a: 'Thugnificent', wrong: ['Gangstalicious', 'Rollo Goodlove', 'Bushido Brown'] },
    { level: 4, cat: 'Aqua Teen', q: 'The Mooninites are mainly styled after what old-school visual idea?', a: 'Pixelated arcade graphics', wrong: ['Clay animation', 'Newspaper comics', 'Stop-motion puppets'] },
    { level: 4, cat: 'Simpsons', q: 'Who owns the Kwik-E-Mart?', a: 'Apu Nahasapeemapetilon', wrong: ['Moe Szyslak', 'Ned Flanders', 'Waylon Smithers'] },
    { level: 4, cat: 'Family Guy', q: 'Which character is obsessed with world domination as a baby?', a: 'Stewie Griffin', wrong: ['Chris Griffin', 'Meg Griffin', 'Cleveland Brown Jr.'] },
    { level: 4, cat: 'King of the Hill', q: 'Who is Dale Gribble’s wife?', a: 'Nancy Gribble', wrong: ['Peggy Hill', 'Minh Souphanousinphone', 'Luanne Platter'] },
    { level: 4, cat: 'Disney', q: 'Which Disney movie features Yzma and Kronk?', a: 'The Emperor’s New Groove', wrong: ['Hercules', 'Treasure Planet', 'Atlantis'] },
    { level: 4, cat: 'Horror', q: 'Which 1982 film is about an Antarctic imitation threat?', a: 'The Thing', wrong: ['Alien', 'The Fly', 'The Mist'] },
    { level: 5, cat: 'Boondocks', q: 'Which Boondocks character is a mild attorney often pulled into chaos?', a: 'Tom Dubois', wrong: ['Ed Wuncler', 'Gin Rummy', 'Stinkmeaner'] },
    { level: 5, cat: 'Aqua Teen', q: 'What is Master Shake best known for behavior-wise?', a: 'Selfish chaotic schemes', wrong: ['Quiet wisdom', 'Strict leadership', 'Heroic planning'] },
    { level: 5, cat: 'Simpsons', q: 'Who is Mr. Burns’ loyal assistant?', a: 'Waylon Smithers', wrong: ['Lenny Leonard', 'Carl Carlson', 'Barney Gumble'] },
    { level: 5, cat: 'Family Guy', q: 'Which Family Guy neighbor later got his own spinoff?', a: 'Cleveland Brown', wrong: ['Joe Swanson', 'Glenn Quagmire', 'Mort Goldman'] },
    { level: 5, cat: 'King of the Hill', q: 'What is Dale Gribble’s exterminator alias?', a: 'Rusty Shackleford', wrong: ['Buck Strickland', 'Octavio', 'Lucky Kleinschmidt'] },
    { level: 5, cat: 'Disney', q: 'Which film features a Hawaiian girl and Experiment 626?', a: 'Lilo & Stitch', wrong: ['Moana', 'Brother Bear', 'Bolt'] },
    { level: 5, cat: 'Horror', q: 'Which film uses daylight folk-horror as its main nightmare?', a: 'Midsommar', wrong: ['Hereditary', 'The Witch', 'The Ritual'] }
  ];

  let level = 1;
  let score = 0;
  let streak = 0;
  let asked = 0;
  let correct = 0;
  let wrong = 0;
  let current = null;
  let locked = false;
  let deck = [];
  const maxCards = 20;

  const shuffle = (arr) => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(pair => pair[1]);

  function setMessage(text, type = '') {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`.trim();
  }

  function syncStats() {
    levelEl.textContent = `Level ${level}`;
    scoreEl.textContent = `Score ${score}`;
    streakEl.textContent = `Streak ${streak}`;
    categoryEl.textContent = current ? current.cat : 'Mixed Deck';
  }

  function getPool() {
    return QUESTIONS.filter(q => q.level <= Math.min(5, level + 1));
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
    if (asked >= maxCards) {
      finishRun();
      return;
    }
    locked = false;
    if (!deck.length) refillDeck();
    current = deck.pop();
    asked++;

    animateCard();
    diffEl.textContent = `${current.cat} • Level ${current.level} • Card ${asked}/${maxCards}`;
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
      const gained = 10 + level * 5 + streak;
      score += gained;
      btn.classList.add('correct');
      if (streak > 0 && streak % 3 === 0) level = Math.min(5, level + 1);
      setMessage(`Correct. +${gained} points. Harder cards unlock through streaks.`, 'good');
    } else {
      wrong++;
      streak = 0;
      const lost = 7 + level * 3;
      score -= lost;
      btn.classList.add('wrong');
      level = Math.max(1, level - 1);
      setMessage(`Wrong. -${lost} points. Correct answer: ${current.a}`, 'bad');
    }

    syncStats();
  }

  function finishRun() {
    locked = true;
    current = null;
    diffEl.textContent = 'Run Complete';
    questionEl.textContent = `Final Score: ${score}`;
    answersEl.innerHTML = `<div class="trivia-summary">Correct: ${correct}<br>Wrong: ${wrong}<br>Highest Level Reached: ${level}<br>Cards Played: ${asked}</div>`;
    setMessage('Run complete. Press Reset to start over.', 'good');
    syncStats();
  }

  function startRun() {
    level = 1;
    score = 0;
    streak = 0;
    asked = 0;
    correct = 0;
    wrong = 0;
    current = null;
    locked = false;
    deck = [];
    syncStats();
    nextCard();
  }

  startBtn.addEventListener('click', startRun);
  resetBtn.addEventListener('click', startRun);
  nextBtn.addEventListener('click', () => {
    if (!current && asked === 0) startRun();
    else nextCard();
  });

  syncStats();
  setMessage('Press Start Trivia to begin.', '');
})();
