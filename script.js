const boardEl = document.getElementById('board');
const numberPadEl = document.getElementById('numberPad');
const messageEl = document.getElementById('message');
const timerEl = document.getElementById('timer');
const mistakesEl = document.getElementById('mistakes');
const difficultyLabelEl = document.getElementById('difficultyLabel');
const notesToggle = document.getElementById('notesToggle');

const DIFFICULTY_REMOVALS = { easy: 38, medium: 48, hard: 56 };
const XP_GAIN = { easy: 40, medium: 80, hard: 140 };

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

const stats = JSON.parse(localStorage.getItem('sudoku115Stats') || '{"xp":0,"completed":0,"best":{}}');

function saveStats() {
  localStorage.setItem('sudoku115Stats', JSON.stringify(stats));
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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

function solveGrid(grid) {
  const emptyIndex = grid.findIndex(v => v === 0);
  if (emptyIndex === -1) return true;

  for (const n of shuffle([1,2,3,4,5,6,7,8,9])) {
    if (isSafe(grid, emptyIndex, n)) {
      grid[emptyIndex] = n;
      if (solveGrid(grid)) return true;
      grid[emptyIndex] = 0;
    }
  }
  return false;
}

function countSolutions(grid, limit = 2) {
  let count = 0;
  function helper(g) {
    if (count >= limit) return;
    const empty = g.findIndex(v => v === 0);
    if (empty === -1) {
      count++;
      return;
    }
    for (let n = 1; n <= 9; n++) {
      if (isSafe(g, empty, n)) {
        g[empty] = n;
        helper(g);
        g[empty] = 0;
      }
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

function generatePuzzle(level) {
  const solved = generateSolvedGrid();
  const grid = [...solved];
  let removed = 0;
  const target = DIFFICULTY_REMOVALS[level];
  const cells = shuffle([...Array(81).keys()]);

  for (const index of cells) {
    if (removed >= target) break;
    const backup = grid[index];
    grid[index] = 0;
    if (countSolutions(grid, 2) !== 1) grid[index] = backup;
    else removed++;
  }

  return { puzzle: grid, solution: solved };
}

function startTimer() {
  clearInterval(timerId);
  startedAt = Date.now();
  timerId = setInterval(() => {
    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 500);
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
  setMessage(givens[index] ? 'This is printed ink. Choose an open square.' : 'Cell selected.', '');
  renderBoard();
}

function setMessage(text, type = '') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`.trim();
}

function placeNumber(n) {
  if (complete) return;
  if (selected === null) return setMessage('Select a cell first.', 'bad');
  if (givens[selected]) return setMessage('Printed cells cannot be changed.', 'bad');

  if (notesToggle.checked) {
    if (current[selected] !== 0) return;
    if (notes[selected].has(n)) notes[selected].delete(n);
    else notes[selected].add(n);
    setMessage(`Note ${n} toggled.`, '');
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

function removeNoteFromPeers(index, n) {
  for (let i = 0; i < 81; i++) {
    if (rowOf(i) === rowOf(index) || colOf(i) === colOf(index) || boxOf(i) === boxOf(index)) {
      notes[i].delete(n);
    }
  }
}

function clearCell() {
  if (selected === null || givens[selected] || complete) return;
  current[selected] = 0;
  notes[selected].clear();
  setMessage('Cell cleared.', '');
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
  const won = current.every((v, i) => v === solution[i]);
  if (!won) return;
  complete = true;
  clearInterval(timerId);
  stats.completed = (stats.completed || 0) + 1;
  stats.xp = (stats.xp || 0) + XP_GAIN[difficulty];
  saveStats();
  setMessage(`Puzzle complete. +${XP_GAIN[difficulty]} XP. Clean ink.`, 'good');
}

function newGame(level = difficulty) {
  difficulty = level;
  complete = false;
  mistakes = 0;
  selected = null;
  notes = Array.from({ length: 81 }, () => new Set());

  setMessage('Printing puzzle...', '');
  setTimeout(() => {
    const generated = generatePuzzle(level);
    puzzle = generated.puzzle;
    solution = generated.solution;
    current = [...puzzle];
    givens = puzzle.map(v => v !== 0);

    difficultyLabelEl.textContent = level[0].toUpperCase() + level.slice(1);
    mistakesEl.textContent = 'Mistakes: 0';
    timerEl.textContent = '00:00';

    document.querySelectorAll('.difficulty').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.difficulty === level);
    });

    setMessage('Fresh puzzle printed. Select a square.', '');
    renderBoard();
    startTimer();
  }, 30);
}

document.querySelectorAll('.difficulty').forEach(btn => {
  btn.addEventListener('click', () => newGame(btn.dataset.difficulty));
});

document.getElementById('newGameBtn').addEventListener('click', () => newGame(difficulty));
document.getElementById('checkBtn').addEventListener('click', checkPuzzle);
document.getElementById('hintBtn').addEventListener('click', giveHint);
document.getElementById('clearBtn').addEventListener('click', clearCell);

document.addEventListener('keydown', (event) => {
  if (event.key >= '1' && event.key <= '9') placeNumber(Number(event.key));
  if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') clearCell();
  if (selected !== null) {
    let next = selected;
    if (event.key === 'ArrowUp') next = Math.max(0, selected - 9);
    if (event.key === 'ArrowDown') next = Math.min(80, selected + 9);
    if (event.key === 'ArrowLeft') next = selected % 9 === 0 ? selected : selected - 1;
    if (event.key === 'ArrowRight') next = selected % 9 === 8 ? selected : selected + 1;
    if (next !== selected) {
      event.preventDefault();
      selectCell(next);
    }
  }
});

buildBoard();
buildNumberPad();
newGame('easy');
