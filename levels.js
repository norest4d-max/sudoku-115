(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function cloneById(id) {
    const oldEl = byId(id);
    if (!oldEl) return null;
    const fresh = oldEl.cloneNode(true);
    oldEl.replaceWith(fresh);
    return fresh;
  }

  function shuffle(values) {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function titleCase(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function bootSudokuLevels() {
    const boardEl = cloneById('board');
    const numberPadEl = cloneById('numberPad');
    const newGameBtn = cloneById('newGameBtn');
    const checkBtn = cloneById('checkBtn');
    const hintBtn = cloneById('hintBtn');
    const clearBtn = cloneById('clearBtn');
    const messageEl = byId('message');
    const timerEl = byId('timer');
    const mistakesEl = byId('mistakes');
    const difficultyLabelEl = byId('difficultyLabel');
    const notesToggle = byId('notesToggle');
    const difficultyRow = document.querySelector('.difficulty-row');

    if (!boardEl || !numberPadEl || !newGameBtn || !checkBtn || !hintBtn || !clearBtn || !difficultyRow) return;

    const SUDOKU_LEVELS = [
      { id: 'warmup', label: 'Warmup', removals: 30, xp: 25 },
      { id: 'easy', label: 'Easy', removals: 38, xp: 45 },
      { id: 'steady', label: 'Steady', removals: 44, xp: 70 },
      { id: 'medium', label: 'Medium', removals: 48, xp: 95 },
      { id: 'hard', label: 'Hard', removals: 54, xp: 145 },
      { id: 'expert', label: 'Expert', removals: 58, xp: 205 },
      { id: 'master', label: 'Master', removals: 61, xp: 275 },
      { id: 'legend', label: 'Legend', removals: 63, xp: 360 }
    ];
    const levelMap = new Map(SUDOKU_LEVELS.map(level => [level.id, level]));
    const stats = JSON.parse(localStorage.getItem('sudoku115Stats') || '{}');
    stats.best ||= {};

    let difficulty = 'easy';
    let puzzle = [];
    let solution = [];
    let current = [];
    let givens = [];
    let notes = Array.from({ length: 81 }, () => new Set());
    let selected = null;
    let mistakes = 0;
    let startedAt = Date.now();
    let timerId = null;
    let complete = false;

    function saveStats() {
      localStorage.setItem('sudoku115Stats', JSON.stringify(stats));
    }

    function levelConfig(id = difficulty) {
      return levelMap.get(id) || levelMap.get('easy');
    }

    function rowOf(index) { return Math.floor(index / 9); }
    function colOf(index) { return index % 9; }
    function boxOf(index) {
      return Math.floor(rowOf(index) / 3) * 3 + Math.floor(colOf(index) / 3);
    }

    function isSafe(grid, index, num) {
      const r = rowOf(index);
      const c = colOf(index);
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;

      for (let i = 0; i < 9; i++) {
        if (grid[r * 9 + i] === num) return false;
        if (grid[i * 9 + c] === num) return false;
      }

      for (let rr = br; rr < br + 3; rr++) {
        for (let cc = bc; cc < bc + 3; cc++) {
          if (grid[rr * 9 + cc] === num) return false;
        }
      }
      return true;
    }

    function candidates(grid, index) {
      const options = [];
      for (let n = 1; n <= 9; n++) {
        if (isSafe(grid, index, n)) options.push(n);
      }
      return options;
    }

    function bestEmptyCell(grid) {
      let best = -1;
      let bestOptions = null;
      for (let i = 0; i < 81; i++) {
        if (grid[i] !== 0) continue;
        const options = candidates(grid, i);
        if (!options.length) return { index: i, options };
        if (!bestOptions || options.length < bestOptions.length) {
          best = i;
          bestOptions = options;
          if (options.length === 1) break;
        }
      }
      return best === -1 ? null : { index: best, options: bestOptions };
    }

    function solveGrid(grid) {
      const next = bestEmptyCell(grid);
      if (!next) return true;
      for (const n of shuffle(next.options)) {
        grid[next.index] = n;
        if (solveGrid(grid)) return true;
        grid[next.index] = 0;
      }
      return false;
    }

    function countSolutions(grid, limit = 2) {
      let count = 0;
      function helper(g) {
        if (count >= limit) return;
        const next = bestEmptyCell(g);
        if (!next) {
          count++;
          return;
        }
        for (const n of next.options) {
          g[next.index] = n;
          helper(g);
          g[next.index] = 0;
          if (count >= limit) return;
        }
      }
      helper([...grid]);
      return count;
    }

    function generateSolvedGrid() {
      const grid = Array(81).fill(0);
      solveGrid(grid);
      return grid;
    }

    function generatePuzzle(levelId) {
      const cfg = levelConfig(levelId);
      const solved = generateSolvedGrid();
      const grid = [...solved];
      let removed = 0;

      for (const index of shuffle([...Array(81).keys()])) {
        if (removed >= cfg.removals) break;
        const backup = grid[index];
        grid[index] = 0;
        if (countSolutions(grid, 2) === 1) removed++;
        else grid[index] = backup;
      }

      return { puzzle: grid, solution: solved, removed };
    }

    function setMessage(text, type = '') {
      messageEl.textContent = text;
      messageEl.className = `message ${type}`.trim();
    }

    function startTimer() {
      clearInterval(timerId);
      startedAt = Date.now();
      timerId = setInterval(() => {
        const seconds = Math.floor((Date.now() - startedAt) / 1000);
        timerEl.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      }, 500);
    }

    function buildDifficultyButtons() {
      difficultyRow.innerHTML = '';
      for (const level of SUDOKU_LEVELS) {
        const btn = document.createElement('button');
        btn.className = 'difficulty';
        btn.type = 'button';
        btn.dataset.difficulty = level.id;
        btn.textContent = level.label;
        btn.addEventListener('click', () => newGame(level.id));
        difficultyRow.appendChild(btn);
      }
    }

    function buildBoard() {
      boardEl.innerHTML = '';
      for (let i = 0; i < 81; i++) {
        const cell = document.createElement('button');
        cell.className = 'cell';
        cell.type = 'button';
        cell.dataset.index = i;
        cell.setAttribute('aria-label', `Row ${rowOf(i) + 1}, column ${colOf(i) + 1}`);
        cell.addEventListener('click', () => selectCell(i));
        boardEl.appendChild(cell);
      }
    }

    function buildNumberPad() {
      numberPadEl.innerHTML = '';
      for (let n = 1; n <= 9; n++) {
        const btn = document.createElement('button');
        btn.className = 'number-key';
        btn.type = 'button';
        btn.textContent = n;
        btn.addEventListener('click', () => placeNumber(n));
        numberPadEl.appendChild(btn);
      }
    }

    function renderBoard() {
      [...boardEl.children].forEach((cell, i) => {
        cell.className = 'cell';
        cell.innerHTML = '';
        if (givens[i]) cell.classList.add('given');

        if (selected !== null) {
          const related = rowOf(i) === rowOf(selected) || colOf(i) === colOf(selected) || boxOf(i) === boxOf(selected);
          if (related) cell.classList.add('related');
          if (current[i] !== 0 && current[i] === current[selected]) cell.classList.add('same');
        }
        if (selected === i) cell.classList.add('selected');

        if (current[i] !== 0) {
          cell.textContent = current[i];
          if (!givens[i] && current[i] !== solution[i]) cell.classList.add('error');
          if (!givens[i] && current[i] === solution[i]) cell.classList.add('correct');
        } else if (notes[i].size) {
          const noteGrid = document.createElement('div');
          noteGrid.className = 'notes';
          for (let n = 1; n <= 9; n++) {
            const span = document.createElement('span');
            span.textContent = notes[i].has(n) ? n : '';
            noteGrid.appendChild(span);
          }
          cell.appendChild(noteGrid);
        }
      });
    }

    function selectCell(index) {
      selected = index;
      setMessage(givens[index] ? 'This is printed ink. Choose an open square.' : 'Cell selected.');
      renderBoard();
    }

    function removeNoteFromPeers(index, n) {
      for (let i = 0; i < 81; i++) {
        if (rowOf(i) === rowOf(index) || colOf(i) === colOf(index) || boxOf(i) === boxOf(index)) {
          notes[i].delete(n);
        }
      }
    }

    function placeNumber(n) {
      if (complete) return;
      if (selected === null) return setMessage('Select a cell first.', 'bad');
      if (givens[selected]) return setMessage('Printed cells cannot be changed.', 'bad');

      if (notesToggle?.checked) {
        if (current[selected] !== 0) return;
        if (notes[selected].has(n)) notes[selected].delete(n);
        else notes[selected].add(n);
        setMessage(`Note ${n} toggled.`);
        renderBoard();
        return;
      }

      current[selected] = n;
      notes[selected].clear();
      if (n !== solution[selected]) {
        mistakes++;
        mistakesEl.textContent = `Mistakes: ${mistakes}`;
        setMessage('Wrong ink. Check row, column, or box.', 'bad');
      } else {
        removeNoteFromPeers(selected, n);
        setMessage('Correct placement.', 'good');
      }
      renderBoard();
      checkWin();
    }

    function clearCell() {
      if (selected === null || givens[selected] || complete) return;
      current[selected] = 0;
      notes[selected].clear();
      setMessage('Cell cleared.');
      renderBoard();
    }

    function checkPuzzle() {
      let wrong = 0;
      let empty = 0;
      for (let i = 0; i < 81; i++) {
        if (current[i] === 0) empty++;
        else if (current[i] !== solution[i]) wrong++;
      }
      if (wrong) setMessage(`${wrong} wrong cell${wrong > 1 ? 's' : ''}. Re-scan the grid.`, 'bad');
      else if (empty) setMessage(`No wrong cells. ${empty} empty square${empty > 1 ? 's' : ''} left.`, 'good');
      else checkWin();
    }

    function giveHint() {
      if (complete) return;
      const empties = current.map((v, i) => v === 0 && !givens[i] ? i : null).filter(v => v !== null);
      if (!empties.length) return checkWin();
      const index = empties[Math.floor(Math.random() * empties.length)];
      selected = index;
      current[index] = solution[index];
      notes[index].clear();
      removeNoteFromPeers(index, solution[index]);
      setMessage(`Hint placed at row ${rowOf(index) + 1}, column ${colOf(index) + 1}.`, 'good');
      renderBoard();
      checkWin();
    }

    function checkWin() {
      if (!current.every((v, i) => v === solution[i])) return;
      const cfg = levelConfig();
      complete = true;
      clearInterval(timerId);
      stats.completed = (stats.completed || 0) + 1;
      stats.xp = (stats.xp || 0) + cfg.xp;
      saveStats();
      setMessage(`Puzzle complete. +${cfg.xp} XP. Clean ink.`, 'good');
    }

    function newGame(levelId = difficulty) {
      const cfg = levelConfig(levelId);
      difficulty = cfg.id;
      complete = false;
      mistakes = 0;
      selected = null;
      notes = Array.from({ length: 81 }, () => new Set());
      setMessage(`Printing ${cfg.label} puzzle...`);

      setTimeout(() => {
        const generated = generatePuzzle(cfg.id);
        puzzle = generated.puzzle;
        solution = generated.solution;
        current = [...puzzle];
        givens = puzzle.map(value => value !== 0);

        difficultyLabelEl.textContent = `${cfg.label} (${generated.removed} open)`;
        mistakesEl.textContent = 'Mistakes: 0';
        timerEl.textContent = '00:00';
        document.querySelectorAll('.difficulty').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.difficulty === cfg.id);
        });
        setMessage('Fresh puzzle printed. Select a square.');
        renderBoard();
        startTimer();
      }, 30);
    }

    document.addEventListener('keydown', (event) => {
      if (event.key >= '1' && event.key <= '9') placeNumber(Number(event.key));
      if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') clearCell();
      if (selected === null) return;
      let next = selected;
      if (event.key === 'ArrowUp') next = Math.max(0, selected - 9);
      if (event.key === 'ArrowDown') next = Math.min(80, selected + 9);
      if (event.key === 'ArrowLeft') next = selected % 9 === 0 ? selected : selected - 1;
      if (event.key === 'ArrowRight') next = selected % 9 === 8 ? selected : selected + 1;
      if (next !== selected) {
        event.preventDefault();
        selectCell(next);
      }
    });

    buildDifficultyButtons();
    buildBoard();
    buildNumberPad();
    newGameBtn.addEventListener('click', () => newGame(difficulty));
    checkBtn.addEventListener('click', checkPuzzle);
    hintBtn.addEventListener('click', giveHint);
    clearBtn.addEventListener('click', clearCell);
    newGame('easy');
  }

  function bootPatternLevels() {
    const panel = byId('patternPanel');
    const grid = cloneById('patternGrid');
    const startBtn = cloneById('patternStartBtn');
    const replayBtn = cloneById('patternReplayBtn');
    const homeBtn = cloneById('patternHomeBtn');
    const message = byId('patternMessage');
    const levelEl = byId('patternLevel');
    const streakEl = byId('patternStreak');
    const speedEl = byId('patternSpeed');

    if (!panel || !grid || !startBtn || !replayBtn || !homeBtn || !message) return;

    const PATTERN_LEVELS = [
      ['Warm Trace', 3, 3, 820, 'Slow'],
      ['Corner Steps', 3, 4, 780, 'Slow'],
      ['Short Ink Run', 3, 5, 735, 'Steady'],
      ['Box Memory', 3, 6, 700, 'Steady'],
      ['Four Grid Intro', 4, 6, 660, 'Steady'],
      ['Cross Flash', 4, 7, 625, 'Steady'],
      ['Double Back', 4, 8, 590, 'Quick'],
      ['Long Corner', 4, 9, 555, 'Quick'],
      ['Five Grid Intro', 5, 9, 520, 'Fast'],
      ['Skip Trace', 5, 10, 490, 'Fast'],
      ['Wide Sweep', 5, 11, 460, 'Fast'],
      ['Tight Recall', 5, 12, 430, 'Fast'],
      ['Six Grid Intro', 6, 12, 405, 'Extreme'],
      ['Column Storm', 6, 13, 382, 'Extreme'],
      ['Row Storm', 6, 14, 360, 'Extreme'],
      ['Mirror Walk', 6, 15, 340, 'Extreme'],
      ['Long Form', 6, 16, 320, 'Nightmare'],
      ['Needle Thread', 6, 17, 300, 'Nightmare'],
      ['Blackout Path', 6, 18, 282, 'Nightmare'],
      ['Full Table', 6, 19, 265, 'Nightmare'],
      ['Ink Sprint', 6, 20, 250, 'Nightmare'],
      ['Hard Recall', 6, 21, 238, 'Nightmare'],
      ['Pressure Loop', 6, 22, 226, 'Nightmare'],
      ['No Drift', 6, 23, 215, 'Nightmare'],
      ['Final Ledger', 6, 24, 205, 'Nightmare'],
      ['Paper Cut', 6, 25, 196, 'Nightmare'],
      ['Last Page', 6, 26, 188, 'Nightmare'],
      ['Deep Focus', 6, 27, 180, 'Nightmare'],
      ['Perfect Ink', 6, 28, 172, 'Nightmare'],
      ['Endless Gate', 6, 30, 165, 'Endless']
    ].map(([name, size, length, speed, label], index) => ({ level: index + 1, name, size, length, speed, label }));

    const STORAGE_KEY = 'sudoku115PatternStats';
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    let level = 1;
    let score = 0;
    let size = 3;
    let sequence = [];
    let userIndex = 0;
    let acceptingInput = false;
    let playing = false;
    let gameOver = false;

    function config() {
      const listed = PATTERN_LEVELS[level - 1];
      if (listed) return listed;
      const extra = level - PATTERN_LEVELS.length;
      return {
        level,
        name: `Endless ${extra}`,
        size: 6,
        length: Math.min(36, 30 + extra),
        speed: Math.max(120, 165 - extra * 6),
        label: 'Endless'
      };
    }

    function setMessage(text, type = '') {
      message.textContent = text;
      message.className = `message ${type}`.trim();
    }

    function updateStats() {
      const cfg = config();
      levelEl.textContent = level <= PATTERN_LEVELS.length ? `Level ${level}/${PATTERN_LEVELS.length}` : `Level ${level}+`;
      streakEl.textContent = `${cfg.name}: ${userIndex}/${sequence.length || cfg.length} | Best L${saved.bestLevel || 1}`;
      speedEl.textContent = `Speed: ${cfg.label} | Score ${score}`;
    }

    function buildGrid() {
      const cfg = config();
      size = cfg.size;
      grid.innerHTML = '';
      grid.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
      grid.dataset.size = size;

      for (let i = 0; i < size * size; i++) {
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
      const cfg = config();
      const total = size * size;
      sequence = [];
      for (let i = 0; i < cfg.length; i++) {
        let next = Math.floor(Math.random() * total);
        if (i > 0 && next === sequence[i - 1]) next = (next + 1 + Math.floor(Math.random() * (total - 1))) % total;
        if (level >= 8 && i > 1 && next === sequence[i - 2]) next = (next + 2 + Math.floor(Math.random() * Math.max(1, total - 2))) % total;
        sequence.push(next);
      }
      userIndex = 0;
    }

    function tileAt(index) {
      return grid.querySelector(`[data-index='${index}']`);
    }

    async function flashTile(index, className = 'flash') {
      const tile = tileAt(index);
      if (!tile) return;
      const cfg = config();
      tile.classList.add(className);
      await sleep(className === 'purple-twitch' ? 145 : cfg.speed);
      tile.classList.remove(className);
      await sleep(Math.max(45, cfg.speed * 0.22));
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
      setMessage(`Watch ${sequence.length} lights. One mistake ends the run.`);
      await sleep(650);
      for (const index of sequence) await flashTile(index, 'flash');
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

    function saveStats() {
      saved.bestLevel = Math.max(saved.bestLevel || 1, level);
      saved.bestScore = Math.max(saved.bestScore || 0, score);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
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
      setMessage(`Level ${level}: ${config().name}.`);
      await playSequence();
    }

    async function handleTilePress(index) {
      if (!acceptingInput || playing || gameOver) return;
      await flashTile(index, 'purple-twitch');
      if (index === sequence[userIndex]) {
        userIndex++;
        score += 10 + level + config().length;
        updateStats();
        if (userIndex >= sequence.length) {
          acceptingInput = false;
          saveStats();
          setMessage(`Level ${level} cleared. Pattern gets longer.`, 'good');
          level++;
          await sleep(850);
          await nextLevel();
        } else {
          setMessage(`${userIndex}/${sequence.length} correct. Keep going.`, 'good');
        }
        return;
      }
      gameOver = true;
      acceptingInput = false;
      playing = false;
      setTilesDisabled(true);
      tileAt(index)?.classList.add('soft-wrong');
      saveStats();
      setMessage(`GAME OVER - reached Level ${level}, Score ${score}. Press Start Pattern to retry.`, 'bad');
      updateStats();
      await sleep(450);
      setTilesDisabled(false);
    }

    startBtn.addEventListener('click', startGame);
    replayBtn.addEventListener('click', () => {
      enterPatternMode();
      if (gameOver || !sequence.length) startGame();
      else playSequence();
    });
    homeBtn.addEventListener('click', leavePatternMode);
    buildGrid();
    updateStats();
    setMessage(`Press Start Pattern. ${PATTERN_LEVELS.length} designed levels are loaded.`);
  }

  function bootCrosswordLevels() {
    const gridEl = cloneById('crosswordGrid');
    const acrossEl = cloneById('acrossClues');
    const downEl = cloneById('downClues');
    const messageEl = byId('crosswordMessage');
    const checkBtn = cloneById('crosswordCheckBtn');
    const revealBtn = cloneById('crosswordRevealBtn');
    const clearBtn = cloneById('crosswordClearBtn');
    const actions = document.querySelector('.crossword-actions');

    if (!gridEl || !acrossEl || !downEl || !messageEl || !checkBtn || !revealBtn || !clearBtn) return;

    let nextBtn = byId('crosswordNextBtn');
    if (!nextBtn && actions) {
      nextBtn = document.createElement('button');
      nextBtn.id = 'crosswordNextBtn';
      nextBtn.type = 'button';
      nextBtn.textContent = 'New Level';
      actions.appendChild(nextBtn);
    }

    let levelBadge = byId('crosswordLevel');
    if (!levelBadge && actions) {
      levelBadge = document.createElement('span');
      levelBadge.id = 'crosswordLevel';
      levelBadge.className = 'crossword-level';
      actions.appendChild(levelBadge);
    }

    const difficultyBtns = [...document.querySelectorAll('.crossword-difficulty')].map(btn => {
      const fresh = btn.cloneNode(true);
      btn.replaceWith(fresh);
      return fresh;
    });

    const blockRow = (size) => '#'.repeat(size);
    const answerRow = (answer, size) => answer.toUpperCase().replace(/[^A-Z]/g, '').padEnd(size, '#').slice(0, size);
    const makeRows = (size, answers) => {
      const rows = [];
      for (const answer of answers) {
        rows.push(answerRow(answer, size));
        if (rows.length < size) rows.push(blockRow(size));
      }
      return rows.slice(0, size);
    };
    const makePuzzle = (title, size, answers, clues) => ({ title, size, grid: makeRows(size, answers), clues: { across: clues, down: {} } });

    const PUZZLE_BANK = {
      easy: [
        makePuzzle('Park Friends', 10, ['Mordecai', 'Rigby', 'Benson', 'Skips', 'Pops'], {
          1: 'Blue bird Regular Show lead.',
          2: 'Mordecai best friend.',
          3: 'Gumball-machine park boss.',
          4: 'Wise park worker.',
          5: 'Cheerful lollipop-shaped friend.'
        }),
        makePuzzle('Cartoon Network', 10, ['Gumball', 'Darwin', 'Finn', 'Jake', 'Bubbles'], {
          1: 'Blue cat from Elmore.',
          2: 'Orange fish brother from Elmore.',
          3: 'Human hero of Adventure Time.',
          4: 'Stretchy dog from Adventure Time.',
          5: 'Blue Powerpuff sister.'
        }),
        makePuzzle('Disney Starts', 10, ['Simba', 'Ariel', 'Mulan', 'Genie', 'Moana'], {
          1: 'Lion cub who becomes king.',
          2: 'Mermaid princess with a human-world dream.',
          3: 'Heroine who joins the army in disguise.',
          4: 'Blue wish-granter from Aladdin.',
          5: 'Wayfinder chosen by the ocean.'
        }),
        makePuzzle('Springfield', 10, ['Homer', 'Marge', 'Bart', 'Lisa', 'Krusty'], {
          1: 'Springfield dad in Sector 7-G.',
          2: 'Blue-haired Simpson mother.',
          3: 'Skateboarding Simpson son.',
          4: 'Saxophone-playing Simpson daughter.',
          5: 'Television clown from Springfield.'
        })
      ],
      medium: [
        makePuzzle('Adult Swim', 11, ['Frylock', 'Meatwad', 'Carl', 'Mooninite', 'Rabbot', 'Shake'], {
          1: 'Floating fries with the level head.',
          2: 'Childlike shapeshifting meatball.',
          3: 'Aqua Teens neighbor.',
          4: 'Pixel-styled alien type.',
          5: 'Robot from the first Aqua Teen episode.',
          6: 'Selfish talking milkshake.'
        }),
        makePuzzle('Family Table', 11, ['Peter', 'Lois', 'Stewie', 'Brian', 'Quahog', 'Cleveland'], {
          1: 'Chaotic Griffin father.',
          2: 'Griffin mother.',
          3: 'Brilliant Griffin baby.',
          4: 'Talking Griffin dog.',
          5: 'Rhode Island town in Family Guy.',
          6: 'Neighbor who got a spinoff.'
        }),
        makePuzzle('Propane Alley', 11, ['Hank', 'Peggy', 'Bobby', 'Dale', 'Boomhauer', 'Strickland'], {
          1: 'Propane salesman from Arlen.',
          2: 'Confident substitute teacher.',
          3: 'Hank and Peggy son.',
          4: 'Conspiracy-minded exterminator.',
          5: 'Fast-talking neighbor.',
          6: 'Propane company name.'
        }),
        makePuzzle('Villain Shelf', 11, ['Mojojojo', 'Ursula', 'Scar', 'Yzma', 'Jafar', 'Maleficent'], {
          1: 'Powerpuff villain with a big brain.',
          2: 'Sea witch from The Little Mermaid.',
          3: 'Lion King usurper.',
          4: 'Emperor New Groove schemer.',
          5: 'Aladdin sorcerer.',
          6: 'Aurora-cursing villain.'
        })
      ],
      hard: [
        makePuzzle('Deep Cuts', 14, ['Stinkmeaner', 'Thugnificent', 'Gangstalicious', 'Wuncler', 'Ruckus', 'Woodcrest'], {
          1: 'Recurring blind fighter from The Boondocks.',
          2: 'Rapper who moves into Woodcrest.',
          3: 'Rapper tied to Riley fan worship.',
          4: 'Powerful family name in The Boondocks.',
          5: 'Controversial neighbor from The Boondocks.',
          6: 'Freeman family suburb.'
        }),
        makePuzzle('Horror Icons', 12, ['Ghostface', 'Michael', 'Freddy', 'Jason', 'Pinhead', 'Candyman'], {
          1: 'Masked identity used in Scream.',
          2: 'Silent Halloween killer first name.',
          3: 'Dream-stalking slasher first name.',
          4: 'Hockey-mask slasher first name.',
          5: 'Hellraiser icon.',
          6: 'Mirror-summoned horror figure.'
        }),
        makePuzzle('Creature Features', 12, ['Xenomorph', 'Predator', 'Leatherface', 'Chucky', 'Jigsaw', 'Midsommar'], {
          1: 'Alien franchise creature.',
          2: 'Hunter from the jungle sci-fi horror series.',
          3: 'Texas chainsaw killer nickname.',
          4: 'Killer doll.',
          5: 'Saw mastermind identity.',
          6: 'Daylight folk-horror title.'
        }),
        makePuzzle('Hard Animation', 12, ['Muscleman', 'Quagmire', 'Smithers', 'Burns', 'Cotton', 'Luanne'], {
          1: 'Regular Show character known for loud jokes.',
          2: 'Family Guy neighbor with a famous catchphrase.',
          3: 'Mr. Burns assistant.',
          4: 'Springfield plant owner.',
          5: 'Hank Hill father.',
          6: 'Peggy niece who lives with the Hills.'
        })
      ]
    };

    const activeIndex = { easy: 0, medium: 0, hard: 0 };
    let activeDifficulty = 'easy';
    let activePuzzle = PUZZLE_BANK.easy[0];
    let cells = [];
    let words = [];
    let selected = null;
    let direction = 'across';

    function normalizeRows(puzzle) {
      return puzzle.grid.map(row => row.padEnd(puzzle.size, '#').slice(0, puzzle.size));
    }

    function setMessage(text, type = '') {
      messageEl.textContent = text;
      messageEl.className = `message ${type}`.trim();
    }

    function isBlock(rows, r, c) {
      return rows[r]?.[c] === '#';
    }

    function cellId(r, c) {
      return `${r}-${c}`;
    }

    function findWords(rows, size) {
      const found = [];
      let number = 1;
      const numberMap = new Map();

      function needsNumber(r, c) {
        const startsAcross = c === 0 || isBlock(rows, r, c - 1);
        const hasAcross = c + 1 < size && !isBlock(rows, r, c + 1);
        const startsDown = r === 0 || isBlock(rows, r - 1, c);
        const hasDown = r + 1 < size && !isBlock(rows, r + 1, c);
        return (startsAcross && hasAcross) || (startsDown && hasDown);
      }

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!isBlock(rows, r, c) && needsNumber(r, c)) numberMap.set(cellId(r, c), number++);
        }
      }

      for (let r = 0; r < size; r++) {
        let c = 0;
        while (c < size) {
          if (isBlock(rows, r, c)) { c++; continue; }
          const start = c;
          let answer = '';
          while (c < size && !isBlock(rows, r, c)) answer += rows[r][c++];
          if (answer.length > 1) {
            const num = numberMap.get(cellId(r, start));
            found.push({ number: num, direction: 'across', answer, cells: answer.split('').map((_, i) => [r, start + i]) });
          }
        }
      }

      for (let c = 0; c < size; c++) {
        let r = 0;
        while (r < size) {
          if (isBlock(rows, r, c)) { r++; continue; }
          const start = r;
          let answer = '';
          while (r < size && !isBlock(rows, r, c)) answer += rows[r++][c];
          if (answer.length > 1) {
            const num = numberMap.get(cellId(start, c));
            found.push({ number: num, direction: 'down', answer, cells: answer.split('').map((_, i) => [start + i, c]) });
          }
        }
      }
      return { found, numberMap };
    }

    function renderPuzzle(level = activeDifficulty) {
      activeDifficulty = level;
      const bank = PUZZLE_BANK[level] || PUZZLE_BANK.easy;
      activeIndex[level] = activeIndex[level] % bank.length;
      activePuzzle = bank[activeIndex[level]];

      const rows = normalizeRows(activePuzzle);
      const size = activePuzzle.size;
      const found = findWords(rows, size);
      words = found.found;
      cells = [];
      selected = null;
      direction = 'across';

      difficultyBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.crossword === level));
      if (levelBadge) levelBadge.textContent = `${titleCase(level)} Level ${activeIndex[level] + 1}/${bank.length}`;

      gridEl.innerHTML = '';
      gridEl.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
      gridEl.style.gridTemplateRows = `repeat(${size}, minmax(0, 1fr))`;

      for (let r = 0; r < size; r++) {
        cells[r] = [];
        for (let c = 0; c < size; c++) {
          const square = document.createElement('div');
          square.className = 'crossword-cell';
          square.dataset.r = r;
          square.dataset.c = c;

          if (isBlock(rows, r, c)) {
            square.classList.add('block');
            gridEl.appendChild(square);
            cells[r][c] = { block: true, square };
            continue;
          }

          const number = found.numberMap.get(cellId(r, c));
          if (number) {
            const marker = document.createElement('span');
            marker.className = 'crossword-number';
            marker.textContent = number;
            square.appendChild(marker);
          }

          const input = document.createElement('input');
          input.maxLength = 1;
          input.autocomplete = 'off';
          input.inputMode = 'text';
          input.dataset.answer = rows[r][c];
          input.addEventListener('focus', () => selectCell(r, c));
          input.addEventListener('click', () => selectCell(r, c));
          input.addEventListener('input', () => handleInput(input, r, c));
          input.addEventListener('keydown', (event) => handleKey(event, r, c));
          square.appendChild(input);
          gridEl.appendChild(square);
          cells[r][c] = { block: false, square, input, answer: rows[r][c] };
        }
      }

      renderClues();
      setMessage(`${activePuzzle.title} loaded. Pick a clue or tap the grid.`, 'good');
    }

    function wordForCell(r, c, dir = direction) {
      return words.find(word => word.direction === dir && word.cells.some(([wr, wc]) => wr === r && wc === c));
    }

    function clearHighlights() {
      cells.flat().forEach(cell => cell?.square?.classList.remove('selected', 'in-word', 'correct', 'wrong'));
      document.querySelectorAll('.clue-box li').forEach(li => li.classList.remove('active'));
    }

    function selectCell(r, c, forcedDirection) {
      if (!cells[r]?.[c] || cells[r][c].block) return;
      if (forcedDirection) direction = forcedDirection;
      else if (selected && selected.r === r && selected.c === c) direction = direction === 'across' ? 'down' : 'across';
      selected = { r, c };

      let word = wordForCell(r, c, direction) || wordForCell(r, c, direction === 'across' ? 'down' : 'across');
      if (word) direction = word.direction;
      clearHighlights();
      cells[r][c].square.classList.add('selected');
      if (word) {
        word.cells.forEach(([wr, wc]) => cells[wr][wc].square.classList.add('in-word'));
        document.querySelector(`[data-clue='${word.direction}-${word.number}']`)?.classList.add('active');
      }
    }

    function handleInput(input, r, c) {
      input.value = input.value.toUpperCase().replace(/[^A-Z]/g, '');
      if (!input.value) return;
      const next = nextCell(r, c, direction, 1);
      if (next) next.input.focus();
    }

    function nextCell(r, c, dir, step) {
      const dr = dir === 'down' ? step : 0;
      const dc = dir === 'across' ? step : 0;
      const nr = r + dr;
      const nc = c + dc;
      if (cells[nr]?.[nc] && !cells[nr][nc].block) return cells[nr][nc];
      return null;
    }

    function handleKey(event, r, c) {
      if (event.key === 'ArrowRight') { direction = 'across'; event.preventDefault(); moveFocus(r, c, 0, 1); }
      if (event.key === 'ArrowLeft') { direction = 'across'; event.preventDefault(); moveFocus(r, c, 0, -1); }
      if (event.key === 'ArrowDown') { direction = 'down'; event.preventDefault(); moveFocus(r, c, 1, 0); }
      if (event.key === 'ArrowUp') { direction = 'down'; event.preventDefault(); moveFocus(r, c, -1, 0); }
      if (event.key === 'Backspace' && !cells[r][c].input.value) {
        const prev = nextCell(r, c, direction, -1);
        if (prev) prev.input.focus();
      }
    }

    function moveFocus(r, c, dr, dc) {
      const nr = r + dr;
      const nc = c + dc;
      if (cells[nr]?.[nc] && !cells[nr][nc].block) cells[nr][nc].input.focus();
    }

    function renderClues() {
      acrossEl.innerHTML = '';
      downEl.innerHTML = '';
      for (const word of words) {
        const li = document.createElement('li');
        li.dataset.clue = `${word.direction}-${word.number}`;
        const clueText = activePuzzle.clues[word.direction][word.number] || `${titleCase(activePuzzle.title)} answer with ${word.answer.length} letters.`;
        li.textContent = `${word.number}. ${clueText} (${word.answer.length})`;
        li.addEventListener('click', () => {
          direction = word.direction;
          const [r, c] = word.cells[0];
          cells[r][c].input.focus();
          selectCell(r, c, word.direction);
        });
        if (word.direction === 'across') acrossEl.appendChild(li);
        else downEl.appendChild(li);
      }
    }

    function checkPuzzle() {
      let wrong = 0;
      let empty = 0;
      cells.flat().forEach(cell => {
        if (!cell || cell.block) return;
        cell.square.classList.remove('correct', 'wrong');
        const value = cell.input.value.toUpperCase();
        if (!value) { empty++; return; }
        if (value === cell.answer) cell.square.classList.add('correct');
        else { wrong++; cell.square.classList.add('wrong'); }
      });
      if (wrong) setMessage(`${wrong} wrong letter${wrong > 1 ? 's' : ''}.`, 'bad');
      else if (empty) setMessage(`No wrong letters. ${empty} blank square${empty > 1 ? 's' : ''} left.`, 'good');
      else setMessage('Crossword complete. Cartoon logic locked in.', 'good');
    }

    function revealLetter() {
      let target = selected ? cells[selected.r][selected.c] : null;
      if (!target || target.block) target = cells.flat().find(cell => cell && !cell.block && !cell.input.value);
      if (!target) return;
      target.input.value = target.answer;
      target.input.focus();
      setMessage('One letter revealed.', 'good');
    }

    function clearPuzzle() {
      cells.flat().forEach(cell => {
        if (cell && !cell.block) {
          cell.input.value = '';
          cell.square.classList.remove('correct', 'wrong', 'selected', 'in-word');
        }
      });
      setMessage('Crossword cleared.');
    }

    difficultyBtns.forEach(btn => btn.addEventListener('click', () => renderPuzzle(btn.dataset.crossword)));
    nextBtn?.addEventListener('click', () => {
      const bank = PUZZLE_BANK[activeDifficulty];
      activeIndex[activeDifficulty] = (activeIndex[activeDifficulty] + 1) % bank.length;
      renderPuzzle(activeDifficulty);
    });
    checkBtn.addEventListener('click', checkPuzzle);
    revealBtn.addEventListener('click', revealLetter);
    clearBtn.addEventListener('click', clearPuzzle);
    renderPuzzle('easy');
  }

  function bootTriviaLevels() {
    const panel = byId('triviaPanel');
    const startBtn = cloneById('triviaStartBtn');
    const nextBtn = cloneById('triviaNextBtn');
    const resetBtn = cloneById('triviaResetBtn');
    const levelEl = byId('triviaLevel');
    const scoreEl = byId('triviaScore');
    const streakEl = byId('triviaStreak');
    const categoryEl = byId('triviaCategory');
    const diffEl = byId('triviaDifficulty');
    const questionEl = byId('triviaQuestion');
    const answersEl = byId('triviaAnswers');
    const messageEl = byId('triviaMessage');

    if (!panel || !startBtn || !nextBtn || !resetBtn || !answersEl) return;

    const factRows = [
      ['Boondocks', 'Huey Freeman', 'the politically serious older Freeman brother with the afro', 1, ['Riley Freeman', 'Tom Dubois', 'Robert Freeman']],
      ['Boondocks', 'Riley Freeman', 'the younger Freeman brother who idolizes chaos and rap culture', 1, ['Huey Freeman', 'Jazmine Dubois', 'Uncle Ruckus']],
      ['Boondocks', 'Robert Freeman', 'the grandfather who moves Huey and Riley to Woodcrest', 1, ['Tom Dubois', 'Ed Wuncler', 'Gin Rummy']],
      ['Boondocks', 'Jazmine Dubois', 'Tom and Sarah daughter and Huey classmate', 2, ['Cindy McPhearson', 'Sarah Dubois', 'Cristal']],
      ['Boondocks', 'Tom Dubois', 'the mild attorney often pulled into Freeman family chaos', 2, ['Robert Freeman', 'Gin Rummy', 'Ed Wuncler III']],
      ['Boondocks', 'Uncle Ruckus', 'the recurring neighbor known for extreme self-hating rants', 2, ['Stinkmeaner', 'Bushido Brown', 'Thugnificent']],
      ['Boondocks', 'Thugnificent', 'the rapper who moves into Woodcrest and disrupts the block', 3, ['Gangstalicious', 'Rollo Goodlove', 'Macktastic']],
      ['Boondocks', 'Gangstalicious', 'the rapper Riley deeply admires', 3, ['Thugnificent', 'Macktastic', 'Gin Rummy']],
      ['Boondocks', 'Stinkmeaner', 'the blind fighter whose spirit becomes a recurring problem', 3, ['Uncle Ruckus', 'Bushido Brown', 'Colonel H. Stinkmeaner']],
      ['Boondocks', 'A Pimp Named Slickback', 'the character whose full name is part of the joke', 4, ['Thugnificent', 'Ed Wuncler III', 'Rollo Goodlove']],
      ['Boondocks', 'Ed Wuncler', 'the wealthy Woodcrest power broker', 4, ['Robert Freeman', 'Tom Dubois', 'Buck Strickland']],
      ['Boondocks', 'Woodcrest', 'the suburb where the Freeman family lives', 1, ['Springfield', 'Quahog', 'Arlen']],
      ['Aqua Teen Hunger Force', 'Frylock', 'the floating fries who usually acts as the smart one', 1, ['Master Shake', 'Meatwad', 'Carl']],
      ['Aqua Teen Hunger Force', 'Master Shake', 'the selfish talking milkshake who creates many problems', 1, ['Frylock', 'Meatwad', 'Dr. Weird']],
      ['Aqua Teen Hunger Force', 'Meatwad', 'the simple shapeshifting ball of meat', 1, ['Frylock', 'Carl', 'Mooninite']],
      ['Aqua Teen Hunger Force', 'Carl Brutananadilewski', 'the neighbor who suffers from the Aqua Teens chaos', 2, ['Coach McGuirk', 'Hank Hill', 'Brock Samson']],
      ['Aqua Teen Hunger Force', 'Dr. Weird', 'the scientist whose strange experiments open many early episodes', 2, ['Steve', 'Frylock', 'Oglethorpe']],
      ['Aqua Teen Hunger Force', 'Steve', 'the assistant often standing beside Dr. Weird', 2, ['Carl', 'Err', 'Emory']],
      ['Aqua Teen Hunger Force', 'Mooninites', 'the pixel-styled alien duo who act superior', 2, ['Plutonians', 'Brownie Monsters', 'Cybernetic Ghost']],
      ['Aqua Teen Hunger Force', 'Ignignokt', 'the green Mooninite who often leads the duo', 3, ['Err', 'Oglethorpe', 'Emory']],
      ['Aqua Teen Hunger Force', 'Err', 'the smaller purple Mooninite', 3, ['Ignignokt', 'Meatwad', 'MC Pee Pants']],
      ['Aqua Teen Hunger Force', 'Oglethorpe', 'one of the Plutonians', 3, ['Emory', 'Ignignokt', 'Rabbot']],
      ['Aqua Teen Hunger Force', 'MC Pee Pants', 'the giant spider rapper', 3, ['Sir Loin', 'Handbanana', 'Rabbot']],
      ['Aqua Teen Hunger Force', 'Rabbot', 'the robotic rabbit from the first episode', 2, ['Handbanana', 'Cybernetic Ghost', 'Willie Nelson']],
      ['Simpsons', 'Homer Simpson', 'the Sector 7-G safety inspector and Simpson father', 1, ['Bart Simpson', 'Ned Flanders', 'Waylon Smithers']],
      ['Simpsons', 'Marge Simpson', 'the blue-haired mother of the Simpson family', 1, ['Lisa Simpson', 'Patty Bouvier', 'Edna Krabappel']],
      ['Simpsons', 'Bart Simpson', 'the prankster Simpson son with a skateboard', 1, ['Milhouse Van Houten', 'Nelson Muntz', 'Ralph Wiggum']],
      ['Simpsons', 'Lisa Simpson', 'the intelligent saxophone-playing Simpson daughter', 1, ['Maggie Simpson', 'Janey Powell', 'Allison Taylor']],
      ['Simpsons', 'Maggie Simpson', 'the pacifier-sucking Simpson baby', 1, ['Lisa Simpson', 'Ling Bouvier', 'Gerald Samson']],
      ['Simpsons', 'Mr. Burns', 'the elderly owner of Springfield Nuclear Power Plant', 2, ['Waylon Smithers', 'Kent Brockman', 'Mayor Quimby']],
      ['Simpsons', 'Waylon Smithers', 'Mr. Burns loyal assistant', 2, ['Lenny Leonard', 'Carl Carlson', 'Seymour Skinner']],
      ['Simpsons', 'Moe Szyslak', 'the bartender who runs Moe Tavern', 2, ['Barney Gumble', 'Apu Nahasapeemapetilon', 'Chief Wiggum']],
      ['Simpsons', 'Krusty', 'the clown with a long-running Springfield show', 2, ['Sideshow Bob', 'Kent Brockman', 'Troy McClure']],
      ['Simpsons', 'Chief Wiggum', 'Springfield police chief', 2, ['Mayor Quimby', 'Lou', 'Eddie']],
      ['Simpsons', 'Ned Flanders', 'Homer extremely friendly religious neighbor', 2, ['Reverend Lovejoy', 'Principal Skinner', 'Chief Wiggum']],
      ['Simpsons', 'Springfield', 'the town where the Simpson family lives', 1, ['Quahog', 'Arlen', 'Woodcrest']],
      ['Family Guy', 'Peter Griffin', 'the chaotic father of the Griffin family', 1, ['Brian Griffin', 'Joe Swanson', 'Cleveland Brown']],
      ['Family Guy', 'Lois Griffin', 'Peter wife and Griffin family mother', 1, ['Marge Simpson', 'Peggy Hill', 'Francine Smith']],
      ['Family Guy', 'Stewie Griffin', 'the unusually intelligent Griffin baby', 1, ['Chris Griffin', 'Rallo Tubbs', 'Bobby Hill']],
      ['Family Guy', 'Brian Griffin', 'the Griffin family dog who talks and writes', 1, ['Santa Little Helper', 'Vinny', 'Jasper']],
      ['Family Guy', 'Meg Griffin', 'the often-mocked oldest Griffin child', 1, ['Lisa Simpson', 'Hayley Smith', 'Luanne Platter']],
      ['Family Guy', 'Chris Griffin', 'the Griffin son voiced by Seth Green', 2, ['Neil Goldman', 'Kevin Swanson', 'Bobby Hill']],
      ['Family Guy', 'Glenn Quagmire', 'Peter neighbor known for a famous catchphrase', 2, ['Joe Swanson', 'Cleveland Brown', 'Mort Goldman']],
      ['Family Guy', 'Cleveland Brown', 'the neighbor who later received a spinoff', 2, ['Joe Swanson', 'Tom Tucker', 'Adam West']],
      ['Family Guy', 'Joe Swanson', 'the police officer neighbor of the Griffins', 2, ['Glenn Quagmire', 'Carter Pewterschmidt', 'Horace']],
      ['Family Guy', 'Carter Pewterschmidt', 'Lois wealthy father', 3, ['Adam West', 'Mort Goldman', 'Tom Tucker']],
      ['Family Guy', 'Pawtucket Brewery', 'the brewery where Peter works in many episodes', 2, ['Duff Brewery', 'Strickland Propane', 'Kwik-E-Mart']],
      ['Family Guy', 'Quahog', 'the fictional Rhode Island town where Family Guy is set', 1, ['Springfield', 'Arlen', 'Langley Falls']],
      ['King of the Hill', 'Hank Hill', 'the propane salesman who values order and responsibility', 1, ['Dale Gribble', 'Bill Dauterive', 'Boomhauer']],
      ['King of the Hill', 'Peggy Hill', 'Hank confident substitute-teacher wife', 1, ['Nancy Gribble', 'Minh Souphanousinphone', 'Luanne Platter']],
      ['King of the Hill', 'Bobby Hill', 'Hank and Peggy son who loves comedy', 1, ['Joseph Gribble', 'Connie Souphanousinphone', 'Dooley']],
      ['King of the Hill', 'Dale Gribble', 'the conspiracy-minded exterminator with an alias', 2, ['Bill Dauterive', 'Boomhauer', 'Buck Strickland']],
      ['King of the Hill', 'Boomhauer', 'Hank fast-talking neighbor', 2, ['Bill Dauterive', 'Dale Gribble', 'Lucky']],
      ['King of the Hill', 'Bill Dauterive', 'Hank lonely barber friend and former teammate', 2, ['Dale Gribble', 'Buck Strickland', 'Kahn']],
      ['King of the Hill', 'Luanne Platter', 'Peggy niece who lives with the Hills', 2, ['Connie', 'Nancy', 'Minh']],
      ['King of the Hill', 'Buck Strickland', 'Hank boss at Strickland Propane', 2, ['Cotton Hill', 'Kahn Souphanousinphone', 'Ted Wassanasong']],
      ['King of the Hill', 'Cotton Hill', 'Hank combative father', 3, ['Buck Strickland', 'Dale Gribble', 'Bill Dauterive']],
      ['King of the Hill', 'Kahn Souphanousinphone', 'the Hills competitive Laotian neighbor', 3, ['Ted Wassanasong', 'Dale Gribble', 'Buck Strickland']],
      ['King of the Hill', 'Strickland Propane', 'the company where Hank works', 1, ['Mega Lo Mart', 'Kwik-E-Mart', 'Pawtucket Brewery']],
      ['King of the Hill', 'Arlen', 'the fictional Texas town where King of the Hill is set', 1, ['Springfield', 'Quahog', 'Woodcrest']],
      ['Disney Films', 'Simba', 'the lion cub protagonist of The Lion King', 1, ['Mowgli', 'Kovu', 'Bambi']],
      ['Disney Films', 'Mufasa', 'Simba father and king of the Pride Lands', 1, ['Scar', 'Rafiki', 'Zazu']],
      ['Disney Films', 'Scar', 'the Lion King villain who wants the throne', 2, ['Jafar', 'Shere Khan', 'Hades']],
      ['Disney Films', 'Ariel', 'the mermaid princess who wants the human world', 1, ['Belle', 'Jasmine', 'Moana']],
      ['Disney Films', 'Ursula', 'the sea witch who bargains with Ariel', 2, ['Maleficent', 'Cruella de Vil', 'Yzma']],
      ['Disney Films', 'Belle', 'the book-loving heroine from Beauty and the Beast', 1, ['Ariel', 'Jasmine', 'Aurora']],
      ['Disney Films', 'Beast', 'the cursed prince in Beauty and the Beast', 1, ['Gaston', 'Prince Eric', 'Li Shang']],
      ['Disney Films', 'Mulan', 'the heroine who takes her father place in war', 1, ['Pocahontas', 'Raya', 'Merida']],
      ['Disney Films', 'Mushu', 'the small dragon companion in Mulan', 2, ['Cri-Kee', 'Genie', 'Timon']],
      ['Disney Films', 'Genie', 'the magical blue wish-granter in Aladdin', 1, ['Jafar', 'Mushu', 'Kronk']],
      ['Disney Films', 'Moana', 'the wayfinder chosen by the ocean', 1, ['Raya', 'Elsa', 'Mirabel']],
      ['Disney Films', 'Mirabel', 'the Encanto heroine without an obvious magical gift', 2, ['Isabela', 'Luisa', 'Dolores']],
      ['Horror Films', 'Ghostface', 'the masked killer identity used in Scream', 1, ['Michael Myers', 'Jason Voorhees', 'Leatherface']],
      ['Horror Films', 'Michael Myers', 'the silent masked killer associated with Halloween', 1, ['Freddy Krueger', 'Jason Voorhees', 'Ghostface']],
      ['Horror Films', 'Freddy Krueger', 'the dream-stalking killer from Elm Street', 1, ['Pinhead', 'Chucky', 'Candyman']],
      ['Horror Films', 'Jason Voorhees', 'the hockey-masked figure tied to Friday the 13th', 1, ['Michael Myers', 'Leatherface', 'Jigsaw']],
      ['Horror Films', 'Leatherface', 'the chainsaw killer from The Texas Chain Saw Massacre', 2, ['Ghostface', 'Pinhead', 'Candyman']],
      ['Horror Films', 'Chucky', 'the killer doll from Child Play', 1, ['Annabelle', 'Billy', 'M3GAN']],
      ['Horror Films', 'Jigsaw', 'the Saw franchise mastermind identity', 2, ['Pinhead', 'Candyman', 'Ghostface']],
      ['Horror Films', 'Pinhead', 'the Hellraiser figure tied to the puzzle box', 3, ['Jigsaw', 'Freddy Krueger', 'Leatherface']],
      ['Horror Films', 'Candyman', 'the horror figure summoned through a mirror ritual', 3, ['Ghostface', 'Pinhead', 'Michael Myers']],
      ['Horror Films', 'Xenomorph', 'the alien creature introduced aboard the Nostromo', 2, ['Predator', 'The Thing', 'Cloverfield']],
      ['Horror Films', 'Predator', 'the alien hunter from the jungle sci-fi horror film', 2, ['Xenomorph', 'The Thing', 'Pumpkinhead']],
      ['Horror Films', 'Laurie Strode', 'the main survivor associated with Halloween', 2, ['Sidney Prescott', 'Nancy Thompson', 'Ellen Ripley']]
    ];

    const TEMPLATES = [
      'Which answer best matches this clue: {clue}?',
      'In {cat}, who or what is described as {clue}?',
      'Choose the reference that fits: {clue}.',
      'Which option correctly connects to this {cat} detail: {clue}?',
      'Pick the right answer for this clue: {clue}.',
      'Memory check: {clue}. What is the answer?',
      'What {cat} reference is being described here: {clue}?',
      'Only one option fits: {clue}. Which is it?',
      'Which name or title belongs to this description: {clue}?',
      'Trivia card: {clue}. Select the correct match.',
      'Which answer would a specific fan connect with: {clue}?',
      'What is the smart match for this pop-culture clue: {clue}?',
      'Identify the correct reference: {clue}.',
      'Which option is not a distractor for this clue: {clue}?',
      'Choose the canon-style match: {clue}.',
      'Level check: connect {clue} to the right answer.',
      'Harder card: in {cat}, this clue points to {clue}.',
      'Fast round: {clue}.',
      'What answer completes this fan-memory prompt: {clue}?',
      'Database card: {cat} clue, {clue}.'
    ];

    const FACTS = factRows.map(([cat, answer, clue, level, wrong]) => ({ cat, answer, clue, level, wrong }));

    function buildQuestionBank() {
      const cards = [];
      let id = 1;
      FACTS.forEach((fact, factIndex) => {
        TEMPLATES.forEach((template, templateIndex) => {
          const difficulty = Math.min(10, fact.level + Math.floor(templateIndex / 4));
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
    const maxCards = 25;
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
      const maxLevel = Math.min(10, level + 2);
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
      diffEl.textContent = `${current.cat} | Difficulty ${current.level}/10 | Card ${asked}/${maxCards}`;
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

      setMessage('Choose the best answer.');
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
        const gained = 12 + current.level * 5 + streak;
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
      answersEl.innerHTML = `<div class='trivia-summary'>Correct: ${correct}<br>Wrong: ${wrong}<br>Highest Level Reached: ${highestLevel}<br>Cards Played: ${asked}<br>Total Bank Available: ${QUESTIONS.length} cards</div>`;
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
    setMessage(`Press Start Trivia to begin. ${QUESTIONS.length} cards loaded.`);
  }

  bootSudokuLevels();
  bootPatternLevels();
  bootCrosswordLevels();
  bootTriviaLevels();
})();
