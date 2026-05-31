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

  let level = 1;
  let comfort = 0;
  let size = 3;
  let sequence = [];
  let userIndex = 0;
  let acceptingInput = false;
  let playing = false;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const rand = (max) => Math.floor(Math.random() * max);

  function sequenceLength() {
    return Math.min(4 + level, 18);
  }

  function playbackSpeed() {
    return Math.max(210, 620 - level * 35);
  }

  function speedLabel() {
    if (level < 3) return 'Calm';
    if (level < 6) return 'Focused';
    if (level < 10) return 'Fast';
    return 'Nightmare';
  }

  function gridSizeForLevel() {
    if (level >= 9) return 5;
    if (level >= 5) return 4;
    return 3;
  }

  function updateStats() {
    levelEl.textContent = `Level ${level}`;
    streakEl.textContent = `Comfort: ${comfort}/3`;
    speedEl.textContent = `Speed: ${speedLabel()}`;
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
      btn.textContent = i + 1;
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
    await sleep(className === 'purple-twitch' ? 180 : playbackSpeed());
    tile.classList.remove(className);
    await sleep(Math.max(70, playbackSpeed() * 0.28));
  }

  function setTilesDisabled(disabled) {
    [...grid.children].forEach(tile => { tile.disabled = disabled; });
  }

  async function playSequence() {
    if (!sequence.length) return;
    playing = true;
    acceptingInput = false;
    setTilesDisabled(true);
    setMessage('Watch the ink lights...', '');
    await sleep(450);

    for (const index of sequence) {
      await flashTile(index, 'flash');
    }

    userIndex = 0;
    acceptingInput = true;
    playing = false;
    setTilesDisabled(false);
    setMessage('Your turn. Repeat the pattern.', 'good');
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
    setTilesDisabled(false);
    document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function startRound({ keepLevel = false } = {}) {
    if (playing) return;
    enterPatternMode();
    if (!keepLevel) comfort = 0;
    buildGrid();
    makeSequence();
    updateStats();
    setMessage(`Level ${level}: memorize ${sequence.length} lights.`, '');
    await playSequence();
  }

  async function handleTilePress(index) {
    if (!acceptingInput || playing) return;
    await flashTile(index, 'purple-twitch');

    if (index === sequence[userIndex]) {
      userIndex++;
      if (userIndex >= sequence.length) {
        acceptingInput = false;
        comfort++;
        if (comfort >= 3) {
          level++;
          comfort = 0;
          setMessage('Pattern locked in. Level up.', 'good');
        } else {
          setMessage('Clean repeat. Again until it feels automatic.', 'good');
        }
        updateStats();
        await sleep(750);
        await startRound({ keepLevel: true });
      } else {
        setMessage(`${userIndex}/${sequence.length} correct. Keep the rhythm.`, 'good');
      }
      return;
    }

    const tile = tileAt(index);
    tile?.classList.add('soft-wrong');
    setTimeout(() => tile?.classList.remove('soft-wrong'), 250);

    comfort = Math.max(0, comfort - 1);
    updateStats();
    acceptingInput = false;
    setMessage('No fail. Watch it again and match the path.', 'bad');
    await sleep(600);
    await playSequence();
  }

  startBtn.addEventListener('click', () => startRound());
  replayBtn.addEventListener('click', () => {
    enterPatternMode();
    if (!sequence.length) {
      startRound();
      return;
    }
    playSequence();
  });
  homeBtn.addEventListener('click', leavePatternMode);

  buildGrid();
  updateStats();
  setMessage('Press Start Pattern. Simon Says begins easy, then adapts.', '');
})();
