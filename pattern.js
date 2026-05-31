(() => {
  const panel = document.getElementById('patternPanel');
  const grid = document.getElementById('patternGrid');
  const startBtn = document.getElementById('patternStartBtn');
  const replayBtn = document.getElementById('patternReplayBtn');
  const homeBtn = document.getElementById('patternHomeBtn');
  const message = document.getElementById('patternMessage');
  const levelEl = document.getElementById('patternLevel');
  const streakEl = document.getElementById('patternStreak');
  const speedEl = document.getElementById('patternSpeed');

  if (!panel || !grid || !startBtn || !replayBtn || !homeBtn) return;

  const STORAGE_KEY = 'sudoku115PatternStats';
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"bestLevel":1,"bestScore":0,"games":0}');

  let level = 1;
  let score = 0;
  let size = 3;
  let sequence = [];
  let userIndex = 0;
  let acceptingInput = false;
  let playing = false;
  let gameOver = false;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const rand = (max) => Math.floor(Math.random() * max);

  function sequenceLength() {
    return Math.min(2 + level, 28);
  }

  function playbackSpeed() {
    return Math.max(170, 860 - level * 45);
  }

  function speedLabel() {
    if (level < 3) return 'Slow';
    if (level < 6) return 'Steady';
    if (level < 10) return 'Fast';
    if (level < 15) return 'Extreme';
    return 'Nightmare';
  }

  function gridSizeForLevel() {
    if (level >= 13) return 6;
    if (level >= 9) return 5;
    if (level >= 5) return 4;
    return 3;
  }

  function saveStats() {
    saved.bestLevel = Math.max(saved.bestLevel || 1, level);
    saved.bestScore = Math.max(saved.bestScore || 0, score);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  function updateStats() {
    levelEl.textContent = `Level ${level}`;
    streakEl.textContent = `Pattern: ${userIndex}/${sequence.length || sequenceLength()} • Best L${saved.bestLevel || 1}`;
    speedEl.textContent = `Speed: ${speedLabel()} • Score ${score}`;
  }

  function setMessage(text, type = '') {
    message.textContent = text;
    message.className = `message ${type}`.trim();
  }

  function buildGrid() {
    size = gridSizeForLevel();
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
    grid.dataset.size = size;

    const total = size * size;
    for (let i = 0; i < total; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pattern-tile';
      btn.dataset.index = String(i);
      btn.setAttribute('aria-label', `Pattern tile ${i + 1}`);
      btn.addEventListener('click', () => handleTilePress(i));
      grid.appendChild(btn);
    }
  }

  function makeSequence() {
    const total = size * size;
    const length = sequenceLength();
    sequence = [];

    for (let i = 0; i < length; i++) {
      let next = rand(total);
      if (i > 0 && next === sequence[i - 1]) next = (next + 1 + rand(total - 1)) % total;
      if (level >= 7 && i > 1 && next === sequence[i - 2]) next = (next + 2 + rand(total - 2)) % total;
      sequence.push(next);
    }
    userIndex = 0;
  }

  function tileAt(index) {
    return grid.querySelector(`[data-index="${index}"]`);
  }

  async function flashTile(index, className = 'flash') {
    const tile = tileAt(index);
    if (!tile) return;
    tile.classList.add(className);
    await sleep(className === 'purple-twitch' ? 160 : playbackSpeed());
    tile.classList.remove(className);
    await sleep(Math.max(55, playbackSpeed() * 0.25));
  }

  function setTilesDisabled(disabled) {
    [...grid.children].forEach(tile => { tile.disabled = disabled; });
  }

  async function playSequence() {
    if (!sequence.length || gameOver) return;
    playing = true;
    acceptingInput = false;
    setTilesDisabled(true);
    updateStats();
    setMessage(`Watch ${sequence.length} lights. One mistake = game over.`, '');
    await sleep(700);

    for (const index of sequence) {
      await flashTile(index, 'flash');
    }

    userIndex = 0;
    acceptingInput = true;
    playing = false;
    setTilesDisabled(false);
    updateStats();
    setMessage('Your turn. Match the full pattern by position.', 'good');
  }

  function enterPatternMode() {
    document.body.classList.add('pattern-mode');
    panel.classList.add('pattern-fullscreen');
    homeBtn.hidden = false;
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function leavePatternMode() {
    document.body.classList.remove('pattern-mode');
    panel.classList.remove('pattern-fullscreen');
    homeBtn.hidden = true;
    acceptingInput = false;
    playing = false;
    setTilesDisabled(false);
    document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function startGame() {
    if (playing) return;
    enterPatternMode();
    level = 1;
    score = 0;
    userIndex = 0;
    gameOver = false;
    saved.games = (saved.games || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    await nextLevel();
  }

  async function nextLevel() {
    if (gameOver) return;
    buildGrid();
    makeSequence();
    updateStats();
    setMessage(`Level ${level}: ${sequence.length} count pattern.`, '');
    await playSequence();
  }

  async function handleTilePress(index) {
    if (!acceptingInput || playing || gameOver) return;
    await flashTile(index, 'purple-twitch');

    if (index === sequence[userIndex]) {
      userIndex++;
      score += 10 + level;
      updateStats();

      if (userIndex >= sequence.length) {
        acceptingInput = false;
        saveStats();
        setMessage(`Level ${level} cleared. Pattern gets longer.`, 'good');
        level++;
        await sleep(900);
        await nextLevel();
      } else {
        setMessage(`${userIndex}/${sequence.length} correct. Keep going.`, 'good');
      }
      return;
    }

    await triggerGameOver(index);
  }

  async function triggerGameOver(index) {
    gameOver = true;
    acceptingInput = false;
    playing = false;
    setTilesDisabled(true);

    const tile = tileAt(index);
    tile?.classList.add('soft-wrong');
    setTimeout(() => tile?.classList.remove('soft-wrong'), 350);

    saveStats();
    setMessage(`GAME OVER — reached Level ${level}, Score ${score}. Press Start Pattern to retry.`, 'bad');
    updateStats();
    await sleep(500);
    setTilesDisabled(false);
  }

  startBtn.addEventListener('click', startGame);
  replayBtn.addEventListener('click', () => {
    enterPatternMode();
    if (gameOver || !sequence.length) {
      startGame();
      return;
    }
    playSequence();
  });
  homeBtn.addEventListener('click', leavePatternMode);

  buildGrid();
  updateStats();
  setMessage('Press Start Pattern. No numbers now — memorize the tile positions.', '');
})();
