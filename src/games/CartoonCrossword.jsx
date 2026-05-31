import { useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { crosswordPuzzleBank, crosswordPuzzleCount } from '../data/crosswordData.js';
import { titleCase } from '../utils/random.js';

const cellId = (r, c) => `${r}-${c}`;

function normalizeRows(puzzle) {
  return puzzle.grid.map(row => row.padEnd(puzzle.size, '#').slice(0, puzzle.size));
}

function isBlock(rows, r, c) {
  return rows[r]?.[c] === '#';
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
      if (answer.length > 1) found.push({ number: numberMap.get(cellId(r, start)), direction: 'across', answer, cells: answer.split('').map((_, i) => [r, start + i]) });
    }
  }

  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      if (isBlock(rows, r, c)) { r++; continue; }
      const start = r;
      let answer = '';
      while (r < size && !isBlock(rows, r, c)) answer += rows[r++][c];
      if (answer.length > 1) found.push({ number: numberMap.get(cellId(start, c)), direction: 'down', answer, cells: answer.split('').map((_, i) => [start + i, c]) });
    }
  }

  return { words: found, numberMap };
}

export default function CartoonCrossword() {
  const [difficulty, setDifficulty] = useState('easy');
  const [indexes, setIndexes] = useState({ easy: 0, medium: 0, hard: 0 });
  const [values, setValues] = useState({});
  const [selected, setSelected] = useState(null);
  const [direction, setDirection] = useState('across');
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState(`Crossword bank loaded: ${crosswordPuzzleCount} generated puzzles.`);
  const [messageType, setMessageType] = useState('good');

  const bank = crosswordPuzzleBank[difficulty] || crosswordPuzzleBank.easy;
  const puzzle = bank[indexes[difficulty] % bank.length];
  const rows = useMemo(() => normalizeRows(puzzle), [puzzle]);
  const { words, numberMap } = useMemo(() => findWords(rows, puzzle.size), [rows, puzzle.size]);

  function resetBoard(nextDifficulty = difficulty) {
    setDifficulty(nextDifficulty);
    setValues({});
    setSelected(null);
    setDirection('across');
    setChecked(false);
    setMessage(`Loaded ${titleCase(nextDifficulty)} crossword. Pick a clue or tap the grid.`);
    setMessageType('good');
  }

  function newLevel() {
    const length = crosswordPuzzleBank[difficulty].length;
    setIndexes(previous => ({ ...previous, [difficulty]: (previous[difficulty] + 1) % length }));
    setValues({});
    setSelected(null);
    setDirection('across');
    setChecked(false);
    setMessage(`New ${titleCase(difficulty)} crossword loaded from the 1,000 puzzle bank.`);
    setMessageType('good');
  }

  function wordForCell(r, c, dir = direction) {
    return words.find(word => word.direction === dir && word.cells.some(([wr, wc]) => wr === r && wc === c));
  }

  function activeWord() {
    if (!selected) return null;
    return wordForCell(selected.r, selected.c, direction) || wordForCell(selected.r, selected.c, direction === 'across' ? 'down' : 'across');
  }

  function selectCell(r, c, forcedDirection) {
    if (isBlock(rows, r, c)) return;
    let nextDirection = forcedDirection || direction;
    if (!forcedDirection && selected?.r === r && selected?.c === c) nextDirection = direction === 'across' ? 'down' : 'across';
    const word = wordForCell(r, c, nextDirection) || wordForCell(r, c, nextDirection === 'across' ? 'down' : 'across');
    setDirection(word?.direction || nextDirection);
    setSelected({ r, c });
  }

  function moveFocus(r, c, dr, dc) {
    const nr = r + dr;
    const nc = c + dc;
    if (rows[nr]?.[nc] && !isBlock(rows, nr, nc)) {
      document.querySelector(`[data-crossword-input='${cellId(nr, nc)}']`)?.focus();
      selectCell(nr, nc);
    }
  }

  function nextCell(r, c, dir, step) {
    const nr = r + (dir === 'down' ? step : 0);
    const nc = c + (dir === 'across' ? step : 0);
    return rows[nr]?.[nc] && !isBlock(rows, nr, nc) ? { r: nr, c: nc } : null;
  }

  function updateCell(r, c, rawValue) {
    const value = rawValue.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
    setValues(previous => ({ ...previous, [cellId(r, c)]: value }));
    if (value) {
      const next = nextCell(r, c, direction, 1);
      if (next) document.querySelector(`[data-crossword-input='${cellId(next.r, next.c)}']`)?.focus();
    }
  }

  function handleKey(event, r, c) {
    if (event.key === 'ArrowRight') { setDirection('across'); event.preventDefault(); moveFocus(r, c, 0, 1); }
    if (event.key === 'ArrowLeft') { setDirection('across'); event.preventDefault(); moveFocus(r, c, 0, -1); }
    if (event.key === 'ArrowDown') { setDirection('down'); event.preventDefault(); moveFocus(r, c, 1, 0); }
    if (event.key === 'ArrowUp') { setDirection('down'); event.preventDefault(); moveFocus(r, c, -1, 0); }
    if (event.key === 'Backspace' && !values[cellId(r, c)]) {
      const previous = nextCell(r, c, direction, -1);
      if (previous) document.querySelector(`[data-crossword-input='${cellId(previous.r, previous.c)}']`)?.focus();
    }
  }

  function checkPuzzle() {
    let wrong = 0;
    let empty = 0;
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (isBlock(rows, r, c)) continue;
        const value = values[cellId(r, c)] || '';
        if (!value) empty++;
        else if (value !== rows[r][c]) wrong++;
      }
    }
    setChecked(true);
    if (wrong) {
      setMessage(`${wrong} wrong letter${wrong > 1 ? 's' : ''}. Keep solving.`);
      setMessageType('bad');
    } else if (empty) {
      setMessage(`No wrong letters. ${empty} blank square${empty > 1 ? 's' : ''} left.`);
      setMessageType('good');
    } else {
      setMessage('Crossword complete. Cartoon logic locked in. Hit New Level for another puzzle.');
      setMessageType('good');
    }
  }

  function revealLetter() {
    const target = selected || words.flatMap(word => word.cells).find(([r, c]) => !values[cellId(r, c)]);
    if (!target) return;
    const [r, c] = Array.isArray(target) ? target : [target.r, target.c];
    setValues(previous => ({ ...previous, [cellId(r, c)]: rows[r][c] }));
    setSelected({ r, c });
    setMessage('One letter revealed.');
    setMessageType('good');
  }

  const word = activeWord();
  const completeIndex = indexes[difficulty] + 1;

  return (
    <section className="crossword-panel" aria-label="Cartoon crossword puzzle">
      <SectionHeader
        actions={(
          <div className="crossword-controls">
            {Object.keys(crosswordPuzzleBank).map(item => (
              <button className={`crossword-difficulty ${item === difficulty ? 'active' : ''}`.trim()} key={item} onClick={() => resetBoard(item)} type="button">
                {titleCase(item)}
              </button>
            ))}
          </div>
        )}
        eyebrow="Bottom Puzzle // Cartoon Logic"
        title="Cartoon Crossword"
      >
        A generated bank of {crosswordPuzzleCount} black-and-white crossword puzzles about Cartoon Network characters, action icons, objects, places, adult animation, Disney, and horror references.
      </SectionHeader>
      <div className="crossword-actions">
        <button onClick={checkPuzzle} type="button">Check</button>
        <button onClick={revealLetter} type="button">Reveal Letter</button>
        <button onClick={() => resetBoard(difficulty)} type="button">Clear</button>
        <button onClick={newLevel} type="button">New Level</button>
        <span className="crossword-level">{titleCase(difficulty)} Level {completeIndex}/{bank.length} • {puzzle.title}</span>
      </div>
      <div className="crossword-layout">
        <div
          className="crossword-grid"
          style={{
            gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${puzzle.size}, minmax(0, 1fr))`
          }}
        >
          {rows.flatMap((row, r) => row.split('').map((answer, c) => {
            const id = cellId(r, c);
            const block = answer === '#';
            const inWord = word?.cells.some(([wr, wc]) => wr === r && wc === c);
            const selectedCell = selected?.r === r && selected?.c === c;
            const value = values[id] || '';
            const status = checked && !block && value ? (value === answer ? 'correct' : 'wrong') : '';
            const classes = ['crossword-cell', block ? 'block' : '', inWord ? 'in-word' : '', selectedCell ? 'selected' : '', status].filter(Boolean).join(' ');
            return (
              <div className={classes} key={id}>
                {!block && numberMap.get(id) ? <span className="crossword-number">{numberMap.get(id)}</span> : null}
                {!block ? (
                  <input
                    aria-label={`Crossword cell row ${r + 1} column ${c + 1}`}
                    data-crossword-input={id}
                    inputMode="text"
                    maxLength={1}
                    onChange={event => updateCell(r, c, event.target.value)}
                    onClick={() => selectCell(r, c)}
                    onFocus={() => selectCell(r, c)}
                    onKeyDown={event => handleKey(event, r, c)}
                    value={value}
                  />
                ) : null}
              </div>
            );
          }))}
        </div>
        <div className="clue-box">
          <h3>Across</h3>
          <ol>
            {words.filter(item => item.direction === 'across').map(item => (
              <li className={word?.number === item.number && word.direction === item.direction ? 'active' : ''} key={`${item.direction}-${item.number}`} onClick={() => {
                const [r, c] = item.cells[0];
                setDirection(item.direction);
                setSelected({ r, c });
                document.querySelector(`[data-crossword-input='${cellId(r, c)}']`)?.focus();
              }}>
                {item.number}. {puzzle.clues.across[item.number] || `${puzzle.title} answer with ${item.answer.length} letters.`} ({item.answer.length})
              </li>
            ))}
          </ol>
          <h3>Down</h3>
          <ol>
            {words.filter(item => item.direction === 'down').map(item => (
              <li className={word?.number === item.number && word.direction === item.direction ? 'active' : ''} key={`${item.direction}-${item.number}`} onClick={() => {
                const [r, c] = item.cells[0];
                setDirection(item.direction);
                setSelected({ r, c });
                document.querySelector(`[data-crossword-input='${cellId(r, c)}']`)?.focus();
              }}>
                {item.number}. {puzzle.clues.down[item.number] || `${puzzle.title} answer with ${item.answer.length} letters.`} ({item.answer.length})
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p className={`message ${messageType}`.trim()}>{message}</p>
    </section>
  );
}
