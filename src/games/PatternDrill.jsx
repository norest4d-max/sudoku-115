import { useMemo, useRef, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { patternLevels } from '../data/levelData.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function levelConfig(level) {
  const listed = patternLevels[level - 1];
  if (listed) return listed;
  const extra = level - patternLevels.length;
  return {
    level,
    name: `Endless ${extra}`,
    size: 6,
    length: Math.min(36, 30 + extra),
    speed: Math.max(120, 165 - extra * 6),
    label: 'Endless'
  };
}

function makeSequence(size, length, level) {
  const total = size * size;
  const sequence = [];
  for (let i = 0; i < length; i++) {
    let next = Math.floor(Math.random() * total);
    if (i > 0 && next === sequence[i - 1]) next = (next + 1 + Math.floor(Math.random() * (total - 1))) % total;
    if (level >= 8 && i > 1 && next === sequence[i - 2]) next = (next + 2 + Math.floor(Math.random() * Math.max(1, total - 2))) % total;
    sequence.push(next);
  }
  return sequence;
}

export default function PatternDrill() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [userIndex, setUserIndex] = useState(0);
  const [activeTile, setActiveTile] = useState(null);
  const [pressedTile, setPressedTile] = useState(null);
  const [wrongTile, setWrongTile] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState(`Press Start Pattern. ${patternLevels.length} designed levels are loaded.`);
  const [messageType, setMessageType] = useState('');
  const runId = useRef(0);

  const config = useMemo(() => levelConfig(level), [level]);
  const totalTiles = config.size * config.size;

  async function flash(index, className = 'flash') {
    if (className === 'purple-twitch') setPressedTile(index);
    else setActiveTile(index);
    await sleep(className === 'purple-twitch' ? 145 : config.speed);
    if (className === 'purple-twitch') setPressedTile(null);
    else setActiveTile(null);
    await sleep(Math.max(45, config.speed * 0.22));
  }

  async function playRound(nextLevel = level, nextScore = score) {
    const cfg = levelConfig(nextLevel);
    const currentRun = ++runId.current;
    const nextSequence = makeSequence(cfg.size, cfg.length, nextLevel);
    setLevel(nextLevel);
    setScore(nextScore);
    setSequence(nextSequence);
    setUserIndex(0);
    setAccepting(false);
    setPlaying(true);
    setGameOver(false);
    setMessage(`Level ${nextLevel}: ${cfg.name}. Watch ${cfg.length} lights.`);
    setMessageType('');
    await sleep(650);

    for (const index of nextSequence) {
      if (runId.current !== currentRun) return;
      await flash(index, 'flash');
    }

    if (runId.current !== currentRun) return;
    setPlaying(false);
    setAccepting(true);
    setMessage('Your turn. Match the full pattern by position.');
    setMessageType('good');
  }

  function startGame() {
    setScore(0);
    setGameOver(false);
    playRound(1, 0);
  }

  async function handleTilePress(index) {
    if (!accepting || playing || gameOver) return;
    await flash(index, 'purple-twitch');

    if (index !== sequence[userIndex]) {
      setGameOver(true);
      setAccepting(false);
      setWrongTile(index);
      setMessage(`GAME OVER - reached Level ${level}, Score ${score}. Press Start Pattern to retry.`);
      setMessageType('bad');
      setTimeout(() => setWrongTile(null), 350);
      return;
    }

    const nextIndex = userIndex + 1;
    const nextScore = score + 10 + level + config.length;
    setUserIndex(nextIndex);
    setScore(nextScore);

    if (nextIndex >= sequence.length) {
      setAccepting(false);
      setMessage(`Level ${level} cleared. Pattern gets longer.`);
      setMessageType('good');
      await sleep(850);
      playRound(level + 1, nextScore);
    } else {
      setMessage(`${nextIndex}/${sequence.length} correct. Keep going.`);
      setMessageType('good');
    }
  }

  return (
    <section aria-label="Pattern Drill memory game">
      <SectionHeader
        actions={(
          <>
            <button onClick={startGame} type="button">Start Pattern</button>
            <button onClick={() => (sequence.length && !gameOver ? playRound(level, score) : startGame())} type="button">Replay</button>
          </>
        )}
        eyebrow="Bottom Drill // Memory Pattern"
        title="Pattern Drill"
      >
        Watch the ink lights. Repeat the path. One wrong tap ends the run.
      </SectionHeader>

      <div className="pattern-stats">
        <span>{level <= patternLevels.length ? `Level ${level}/${patternLevels.length}` : `Level ${level}+`}</span>
        <span>{config.name}: {userIndex}/{sequence.length || config.length}</span>
        <span>Speed: {config.label} | Score {score}</span>
      </div>
      <div
        aria-label="Simon says pattern grid"
        className="pattern-grid"
        data-size={config.size}
        style={{ gridTemplateColumns: `repeat(${config.size}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalTiles }, (_, index) => {
          const className = [
            'pattern-tile',
            activeTile === index ? 'flash' : '',
            pressedTile === index ? 'purple-twitch' : '',
            wrongTile === index ? 'soft-wrong' : ''
          ].filter(Boolean).join(' ');
          return (
            <button
              aria-label={`Pattern tile ${index + 1}`}
              className={className}
              disabled={playing}
              key={index}
              onClick={() => handleTilePress(index)}
              type="button"
            />
          );
        })}
      </div>
      <p className={`message ${messageType}`.trim()}>{message}</p>
    </section>
  );
}
