import { useEffect, useMemo, useState } from 'react';
import { sudokuLevels } from '../data/levelData.js';
import { shuffle } from '../utils/random.js';

const blankNotes = () => Array.from({ length: 81 }, () => new Set());
const rowOf = (index) => Math.floor(index / 9);
const colOf = (index) => index % 9;
const boxOf = (index) => Math.floor(rowOf(index) / 3) * 3 + Math.floor(colOf(index) / 3);

function isSafe(grid, index, num) {
  const row = rowOf(index);
  const col = colOf(index);
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (grid[row * 9 + i] === num) return false;
    if (grid[i * 9 + col] === num) return false;
  }

  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r * 9 + c] === num) return false;
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
  function helper(copy) {
    if (count >= limit) return;
    const next = bestEmptyCell(copy);
    if (!next) {
      count++;
      return;
    }
    for (const n of next.options) {
      copy[next.index] = n;
      helper(copy);
      copy[next.index] = 0;
      if (count >= limit) return;
    }
  }
  helper([...grid]);
  return count;
}

function generatePuzzle(config) {
  const solution = Array(81).fill(0);
  solveGrid(solution);
  const puzzle = [...solution];
  let removed = 0;

  for (const index of shuffle([...Array(81).keys()])) {
    if (removed >= config.removals) break;
    const backup = puzzle[index];
    puzzle[index] = 0;
    if (countSolutions(puzzle, 2) === 1) removed++;
    else puzzle[index] = backup;
  }

  return { puzzle, solution, removed };
}

function formatClock(startedAt, done) {
  const seconds = Math.max(0, Math.floor(((done || Date.now()) - startedAt) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function SudokuGame() {
  const [levelId, setLevelId] = useState('easy');
  const level = useMemo(() => sudokuLevels.find(item => item.id === levelId) || sudokuLevels[1], [levelId]);
  const [puzzleState, setPuzzleState] = useState(() => generatePuzzle(level));
  const [current, setCurrent] = useState(() => [...puzzleState.puzzle]);
  const [notes, setNotes] = useState(blankNotes);
  const [selected, setSelected] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('Fresh puzzle printed. Select a square.');
  const [messageType, setMessageType] = useState('');
  const [notesMode, setNotesMode] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [tick, setTick] = useState(Date.now());
  const [complete, setComplete] = useState(false);

  const givens = useMemo(() => puzzleState.puzzle.map(value => value !== 0), [puzzleState]);

  useEffect(() => {
    if (complete) return undefined;
    const timer = setInterval(() => setTick(Date.now()), 500);
    return () => clearInterval(timer);
  }, [complete]);

  function newGame(nextLevelId = levelId) {
    const nextLevel = sudokuLevels.find(item => item.id === nextLevelId) || sudokuLevels[1];
    setMessage(`Printing ${nextLevel.label} puzzle...`);
    setMessageType('');
    setTimeout(() => {
      const generated = generatePuzzle(nextLevel);
      setLevelId(nextLevel.id);
      setPuzzleState(generated);
      setCurrent([...generated.puzzle]);
      setNotes(blankNotes());
      setSelected(null);
      setMistakes(0);
      setStartedAt(Date.now());
      setTick(Date.now());
      setComplete(false);
      setMessage('Fresh puzzle printed. Select a square.');
    }, 30);
  }

  function removeNoteFromPeers(noteGrid, index, n) {
    return noteGrid.map((set, i) => {
      if (rowOf(i) === rowOf(index) || colOf(i) === colOf(index) || boxOf(i) === boxOf(index)) {
        const next = new Set(set);
        next.delete(n);
        return next;
      }
      return set;
    });
  }

  function checkWin(nextCurrent) {
    if (!nextCurrent.every((value, index) => value === puzzleState.solution[index])) return;
    setComplete(true);
    setMessage(`Puzzle complete. +${level.xp} XP. Clean ink.`);
    setMessageType('good');
  }

  function placeNumber(n) {
    if (complete) return;
    if (selected === null) {
      setMessage('Select a cell first.');
      setMessageType('bad');
      return;
    }
    if (givens[selected]) {
      setMessage('Printed cells cannot be changed.');
      setMessageType('bad');
      return;
    }

    if (notesMode) {
      if (current[selected] !== 0) return;
      setNotes(previous => previous.map((set, i) => {
        if (i !== selected) return set;
        const next = new Set(set);
        if (next.has(n)) next.delete(n);
        else next.add(n);
        return next;
      }));
      setMessage(`Note ${n} toggled.`);
      setMessageType('');
      return;
    }

    const nextCurrent = current.map((value, i) => (i === selected ? n : value));
    setCurrent(nextCurrent);
    setNotes(previous => removeNoteFromPeers(previous.map((set, i) => (i === selected ? new Set() : set)), selected, n));

    if (n !== puzzleState.solution[selected]) {
      setMistakes(value => value + 1);
      setMessage('Wrong ink. Check row, column, or box.');
      setMessageType('bad');
    } else {
      setMessage('Correct placement.');
      setMessageType('good');
    }
    checkWin(nextCurrent);
  }

  function clearCell() {
    if (selected === null || givens[selected] || complete) return;
    setCurrent(previous => previous.map((value, i) => (i === selected ? 0 : value)));
    setNotes(previous => previous.map((set, i) => (i === selected ? new Set() : set)));
    setMessage('Cell cleared.');
    setMessageType('');
  }

  function checkPuzzle() {
    let wrong = 0;
    let empty = 0;
    current.forEach((value, index) => {
      if (value === 0) empty++;
      else if (value !== puzzleState.solution[index]) wrong++;
    });
    if (wrong) {
      setMessage(`${wrong} wrong cell${wrong > 1 ? 's' : ''}. Re-scan the grid.`);
      setMessageType('bad');
    } else if (empty) {
      setMessage(`No wrong cells. ${empty} empty square${empty > 1 ? 's' : ''} left.`);
      setMessageType('good');
    } else {
      checkWin(current);
    }
  }

  function giveHint() {
    if (complete) return;
    const empties = current.map((value, index) => value === 0 && !givens[index] ? index : null).filter(value => value !== null);
    if (!empties.length) return checkWin(current);
    const index = empties[Math.floor(Math.random() * empties.length)];
    const nextCurrent = current.map((value, i) => (i === index ? puzzleState.solution[index] : value));
    setSelected(index);
    setCurrent(nextCurrent);
    setNotes(previous => removeNoteFromPeers(previous.map((set, i) => (i === index ? new Set() : set)), index, puzzleState.solution[index]));
    setMessage(`Hint placed at row ${rowOf(index) + 1}, column ${colOf(index) + 1}.`);
    setMessageType('good');
    checkWin(nextCurrent);
  }

  useEffect(() => {
    function onKeyDown(event) {
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
        setSelected(next);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [current, givens, selected, complete, notesMode, puzzleState, level]);

  return (
    <>
      <section className="menu panel" aria-label="Sudoku menu">
        <div>
          <h2>Choose Puzzle</h2>
          <p>Select a difficulty, then tap a square and place numbers using the ink keys.</p>
        </div>
        <div className="difficulty-row">
          {sudokuLevels.map(item => (
            <button
              className={`difficulty ${item.id === levelId ? 'active' : ''}`.trim()}
              key={item.id}
              onClick={() => newGame(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="action-row">
          <button type="button" onClick={() => newGame(levelId)}>New Puzzle</button>
          <button type="button" onClick={checkPuzzle}>Check</button>
          <button type="button" onClick={giveHint}>Hint</button>
          <button type="button" onClick={clearCell}>Clear Cell</button>
        </div>
      </section>

      <section className="game-layout">
        <section className="board-card panel">
          <div className="status-bar">
            <span>{level.label} ({puzzleState.removed} open)</span>
            <span>{formatClock(startedAt, complete ? tick : null)}</span>
            <span>Mistakes: {mistakes}</span>
          </div>
          <div className="sudoku-board" aria-label="Sudoku board">
            {current.map((value, index) => {
              const related = selected !== null && (rowOf(index) === rowOf(selected) || colOf(index) === colOf(selected) || boxOf(index) === boxOf(selected));
              const same = selected !== null && current[index] !== 0 && current[index] === current[selected];
              const classes = [
                'cell',
                givens[index] ? 'given' : '',
                related ? 'related' : '',
                same ? 'same' : '',
                selected === index ? 'selected' : '',
                !givens[index] && value && value !== puzzleState.solution[index] ? 'error' : '',
                !givens[index] && value && value === puzzleState.solution[index] ? 'correct' : ''
              ].filter(Boolean).join(' ');

              return (
                <button
                  aria-label={`Row ${rowOf(index) + 1}, column ${colOf(index) + 1}`}
                  className={classes}
                  key={index}
                  onClick={() => {
                    setSelected(index);
                    setMessage(givens[index] ? 'This is printed ink. Choose an open square.' : 'Cell selected.');
                    setMessageType('');
                  }}
                  type="button"
                >
                  {value ? value : notes[index].size ? (
                    <span className="notes">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <span key={n}>{notes[index].has(n) ? n : ''}</span>)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className={`message ${messageType}`.trim()}>{message}</p>
        </section>

        <aside className="side panel">
          <h2>Ink Keys</h2>
          <div className="number-pad" aria-label="Number pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button className="number-key" key={n} onClick={() => placeNumber(n)} type="button">{n}</button>
            ))}
          </div>
          <label className="toggle">
            <input checked={notesMode} onChange={event => setNotesMode(event.target.checked)} type="checkbox" />
            <span>Notes mode</span>
          </label>
          <div className="rules">
            <h3>Proper Sudoku Maneuver</h3>
            <ol>
              <li>Scan rows, columns, then 3x3 boxes.</li>
              <li>Pick the square with the fewest possible numbers.</li>
              <li>Use notes first when unsure.</li>
              <li>Confirm a number appears once per row, column, and box.</li>
            </ol>
          </div>
        </aside>
      </section>
    </>
  );
}
