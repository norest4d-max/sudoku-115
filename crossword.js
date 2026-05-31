(() => {
  const gridEl = document.getElementById('crosswordGrid');
  const acrossEl = document.getElementById('acrossClues');
  const downEl = document.getElementById('downClues');
  const messageEl = document.getElementById('crosswordMessage');
  const checkBtn = document.getElementById('crosswordCheckBtn');
  const revealBtn = document.getElementById('crosswordRevealBtn');
  const clearBtn = document.getElementById('crosswordClearBtn');
  const difficultyBtns = [...document.querySelectorAll('.crossword-difficulty')];

  if (!gridEl || !acrossEl || !downEl || !messageEl) return;

  const PUZZLES = {
    easy: {
      size: 9,
      grid: [
        'MORDECAI#',
        'O###D###B',
        'RIGBY###E',
        'D###E###N',
        'E###N###S',
        'CARTOON#O',
        'A###U###N',
        'I###T###G',
        '#SKIPS###'
      ],
      clues: {
        across: {
          1: 'Blue jay from Regular Show.',
          3: 'Raccoon best friend from Regular Show.',
          5: 'Network home for Regular Show, Adventure Time, and more.',
          7: 'Immortal yeti-like park worker.'
        },
        down: {
          1: 'First part of the blue jay name: MORDE____.',
          2: 'Gumball-machine park boss.',
          4: 'Pink lollipop-shaped park manager.'
        }
      }
    },
    medium: {
      size: 10,
      grid: [
        'ADVENTURE#',
        'M###BENSON',
        'A###E####',
        'Z###MOJO##',
        'I###O####',
        'N###RIGBY#',
        'G###D####',
        'WORLD####',
        '####SKIPS#',
        'CARTOON##'
      ],
      clues: {
        across: {
          1: 'Finn and Jake live for this kind of time.',
          3: 'Regular Show park manager with a temper.',
          5: 'Powerpuff Girls villain: ____ Jojo.',
          7: 'Raccoon slacker from Regular Show.',
          8: 'The Amazing ____ of Gumball.',
          9: 'Wise Regular Show worker who has seen everything.',
          10: 'The network type that ties the puzzle together.'
        },
        down: {
          1: 'Steven Universe gemstone hero: ____thyst.',
          2: 'Mordecai begins with this letter and character idea.',
          4: 'Show type where a park job turns cosmic.'
        }
      }
    },
    hard: {
      size: 11,
      grid: [
        'MUSCLEMAN#',
        'O###BENSON#',
        'R###E###I##',
        'D###MOJO###',
        'E###O###G##',
        'CAKE######',
        'A###DARWIN#',
        'I###V###A##',
        '###SKIPS###',
        'GUMBALL####',
        '#RIGBY#####'
      ],
      clues: {
        across: {
          1: 'Regular Show character famous for “my mom” jokes.',
          3: 'Park boss who often yells at Mordecai and Rigby.',
          5: 'Powerpuff Girls villain with a huge brain.',
          6: 'Adventure Time gender-swapped cat counterpart to Jake.',
          7: 'Orange fish brother from Gumball.',
          8: 'Ancient, strong Regular Show coworker.',
          9: 'Blue cat from The Amazing World of ____.',
          10: 'Regular Show raccoon chaos engine.'
        },
        down: {
          1: 'Mordecai’s name starts this long vertical answer.',
          2: 'Network era logic: ordinary job becomes supernatural.',
          4: 'Cartoon references reward memory, not math.'
        }
      }
    }
  };

  let activeDifficulty = 'easy';
  let activePuzzle = PUZZLES.easy;
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
        if (isBlock(rows, r, c)) continue;
        if (needsNumber(r, c)) numberMap.set(cellId(r, c), number++);
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
    activePuzzle = PUZZLES[level];
    const rows = normalizeRows(activePuzzle);
    const size = activePuzzle.size;
    const found = findWords(rows, size);
    words = found.found;
    cells = [];
    selected = null;
    direction = 'across';

    difficultyBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.crossword === level));

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
    setMessage('Crossword loaded. Pick a clue or tap the grid.', 'good');
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
      const clue = document.querySelector(`[data-clue="${word.direction}-${word.number}"]`);
      clue?.classList.add('active');
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
    let nr = r + dr;
    let nc = c + dc;
    while (cells[nr]?.[nc] && !cells[nr][nc].block) return cells[nr][nc];
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
      const clueText = activePuzzle.clues[word.direction][word.number] || `Cartoon answer with ${word.answer.length} letters.`;
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
    if (!target || target.block) {
      target = cells.flat().find(cell => cell && !cell.block && !cell.input.value);
    }
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
    setMessage('Crossword cleared.', '');
  }

  difficultyBtns.forEach(btn => btn.addEventListener('click', () => renderPuzzle(btn.dataset.crossword)));
  checkBtn?.addEventListener('click', checkPuzzle);
  revealBtn?.addEventListener('click', revealLetter);
  clearBtn?.addEventListener('click', clearPuzzle);

  try {
    renderPuzzle('easy');
  } catch (error) {
    console.error(error);
    gridEl.textContent = 'Crossword failed to render. Refresh the page.';
    setMessage('Crossword engine error. Refresh after GitHub Pages updates.', 'bad');
  }
})();
