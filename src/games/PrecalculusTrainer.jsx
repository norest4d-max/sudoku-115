import { useMemo, useRef, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { buildPrecalcCards, precalcCardCount, precalcTopics } from '../data/precalcData.js';
import { shuffle } from '../utils/random.js';

const modeNames = {
  mixed: 'Random Mix',
  weak: 'Weak Spots',
  climb: 'Level Climb',
  topic: 'Topic Drill'
};

export default function PrecalculusTrainer() {
  const cards = useMemo(() => buildPrecalcCards(), []);
  const [mode, setMode] = useState('mixed');
  const [topic, setTopic] = useState('Trigonometry');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [asked, setAsked] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState(0);
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState('');
  const [locked, setLocked] = useState(false);
  const [history, setHistory] = useState([]);
  const [weakIds, setWeakIds] = useState([]);
  const [message, setMessage] = useState(`${precalcCardCount.toLocaleString()} precalculus flashcards ready. Press Start.`);
  const [messageType, setMessageType] = useState('');
  const timer = useRef(null);

  function pool(nextMode = mode, nextLevel = level) {
    let bank = cards;
    if (nextMode === 'topic') bank = cards.filter(card => card.topic === topic);
    if (nextMode === 'weak' && weakIds.length) bank = cards.filter(card => weakIds.includes(card.id));
    if (nextMode === 'climb') bank = bank.filter(card => card.level <= Math.min(10, nextLevel + 1));
    const fresh = bank.filter(card => !history.includes(card.id));
    return fresh.length ? fresh : bank;
  }

  function weightedPick(list) {
    const target = mode === 'climb' ? Math.min(10, level + (streak >= 3 ? 2 : 1)) : Math.ceil(Math.random() * 10);
    const close = list.filter(card => Math.abs(card.level - target) <= 1);
    const source = close.length ? close : list;
    return shuffle(source)[0];
  }

  function start(nextMode = mode) {
    clearTimeout(timer.current);
    setMode(nextMode);
    setLevel(1);
    setScore(0);
    setStreak(0);
    setAsked(0);
    setCorrect(0);
    setMissed(0);
    setHistory([]);
    draw(nextMode, 1, []);
  }

  function draw(nextMode = mode, nextLevel = level, nextHistory = history) {
    clearTimeout(timer.current);
    const bank = pool(nextMode, nextLevel).filter(card => !nextHistory.includes(card.id));
    const source = bank.length ? bank : pool(nextMode, nextLevel);
    const next = weightedPick(source);
    if (!next) return;
    setCurrent(next);
    setChoices(shuffle([next.a, ...next.wrong]));
    setPicked('');
    setLocked(false);
    setAsked(value => value + 1);
    setHistory([...nextHistory, next.id].slice(-500));
    setMessage(`Mode: ${modeNames[nextMode]}. Pick the best answer.`);
    setMessageType('');
  }

  function choose(choice) {
    if (!current || locked) return;
    setLocked(true);
    setPicked(choice);
    const ok = choice === current.a;
    let nextLevel = level;

    if (ok) {
      const nextStreak = streak + 1;
      const gained = 10 + current.level * 4 + nextStreak;
      nextLevel = nextStreak % 3 === 0 ? Math.min(10, level + 1) : level;
      setCorrect(value => value + 1);
      setStreak(nextStreak);
      setScore(value => value + gained);
      setLevel(nextLevel);
      setMessage(`Correct. +${gained}. ${current.hint}`);
      setMessageType('good');
    } else {
      const lost = 6 + current.level * 2;
      nextLevel = Math.max(1, level - 1);
      setMissed(value => value + 1);
      setStreak(0);
      setScore(value => value - lost);
      setLevel(nextLevel);
      setWeakIds(value => [...new Set([current.id, ...value])].slice(0, 200));
      setMessage(`Wrong. -${lost}. Answer: ${current.a}. ${current.hint}`);
      setMessageType('bad');
    }

    timer.current = setTimeout(() => draw(mode, nextLevel, history), ok ? 950 : 1700);
  }

  return (
    <section className="precalc-panel" aria-label="Precalculus training flashcards">
      <SectionHeader
        actions={(
          <>
            <button type="button" onClick={() => start('mixed')}>Start Random</button>
            <button type="button" onClick={() => start('climb')}>Level Climb</button>
            <button type="button" onClick={() => start('weak')}>Weak Spots</button>
            <button type="button" onClick={() => draw()}>Next</button>
          </>
        )}
        eyebrow="Math Mode // Precalculus Memory"
        title="Precalculus Trainer"
      >
        A 10,000-card generated flashcard bank with four choices, adaptive difficulty, weak-spot repeats, randomized topic flow, and fast memorization feedback.
      </SectionHeader>

      <div className="precalc-toolbar">
        <label>
          Topic Drill
          <select value={topic} onChange={event => setTopic(event.target.value)}>
            {precalcTopics.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => start('topic')}>Start Topic</button>
      </div>

      <div className="precalc-stats">
        <span>{modeNames[mode]}</span>
        <span>Level {level}</span>
        <span>Score {score}</span>
        <span>Streak {streak}</span>
        <span>Correct {correct}</span>
        <span>Missed {missed}</span>
        <span>Bank {cards.length.toLocaleString()}</span>
      </div>

      <article className="precalc-card">
        <p className="precalc-meta">{current ? `${current.topic} • Difficulty ${current.level}/10 • Card ${asked}` : 'Press Start Random'}</p>
        <h3>{current ? current.question : 'Your precalculus flashcard will appear here.'}</h3>
        <div className="precalc-answers">
          {current ? choices.map(choice => (
            <button
              type="button"
              key={choice}
              disabled={locked}
              onClick={() => choose(choice)}
              className={[
                'precalc-answer',
                locked && choice === current.a ? 'correct' : '',
                locked && picked === choice && choice !== current.a ? 'wrong' : ''
              ].filter(Boolean).join(' ')}
            >
              {choice}
            </button>
          )) : null}
        </div>
      </article>
      <p className={`message ${messageType}`.trim()}>{message}</p>
    </section>
  );
}
