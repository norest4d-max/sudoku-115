import { useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { buildTriviaQuestions } from '../data/triviaData.js';
import { shuffle } from '../utils/random.js';

const maxCards = 25;

export default function TriviaCards() {
  const questions = useMemo(() => buildTriviaQuestions(), []);
  const [level, setLevel] = useState(1);
  const [highestLevel, setHighestLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [asked, setAsked] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [current, setCurrent] = useState(null);
  const [locked, setLocked] = useState(false);
  const [deck, setDeck] = useState([]);
  const [history, setHistory] = useState([]);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState('');
  const [message, setMessage] = useState(`Press Start Trivia to begin. ${questions.length} cards loaded.`);
  const [messageType, setMessageType] = useState('');

  function getPool(nextLevel = level, nextHistory = history) {
    const maxLevel = Math.min(10, nextLevel + 2);
    const fresh = questions.filter(card => card.level <= maxLevel && !nextHistory.includes(card.id));
    return fresh.length ? fresh : questions.filter(card => card.level <= maxLevel);
  }

  function drawCard(nextDeck = deck, nextAsked = asked, nextHistory = history) {
    if (nextAsked >= maxCards) {
      finishRun();
      return;
    }
    const readyDeck = nextDeck.length ? nextDeck : shuffle(getPool(level, nextHistory));
    const nextCurrent = readyDeck[readyDeck.length - 1];
    const remaining = readyDeck.slice(0, -1);
    setCurrent(nextCurrent);
    setDeck(remaining);
    setAsked(nextAsked + 1);
    setHistory([...nextHistory, nextCurrent.id]);
    setChoices(shuffle([nextCurrent.a, ...nextCurrent.wrong]));
    setLocked(false);
    setPicked('');
    setMessage('Choose the best answer.');
    setMessageType('');
  }

  function startRun() {
    setLevel(1);
    setHighestLevel(1);
    setScore(0);
    setStreak(0);
    setAsked(0);
    setCorrect(0);
    setWrong(0);
    setHistory([]);
    setDeck([]);
    drawCard([], 0, []);
  }

  function chooseAnswer(choice) {
    if (locked || !current) return;
    setLocked(true);
    setPicked(choice);
    const isCorrect = choice === current.a;

    if (isCorrect) {
      const nextStreak = streak + 1;
      const nextLevel = nextStreak > 0 && nextStreak % 2 === 0 ? Math.min(10, level + 1) : level;
      const gained = 12 + current.level * 5 + nextStreak;
      setCorrect(value => value + 1);
      setStreak(nextStreak);
      setLevel(nextLevel);
      setHighestLevel(value => Math.max(value, nextLevel));
      setScore(value => value + gained);
      setMessage(`Correct. +${gained} points.`);
      setMessageType('good');
    } else {
      const lost = 8 + current.level * 3;
      setWrong(value => value + 1);
      setStreak(0);
      setLevel(value => Math.max(1, value - 1));
      setScore(value => value - lost);
      setMessage(`Wrong. -${lost} points. Correct: ${current.a}.`);
      setMessageType('bad');
    }
  }

  function finishRun() {
    setLocked(true);
    setCurrent(null);
    setChoices([]);
    setMessage('Run complete. Press Reset to start over.');
    setMessageType('good');
  }

  const runComplete = !current && asked > 0;

  return (
    <section className="trivia-panel" aria-label="Trivia card game">
      <SectionHeader
        actions={(
          <>
            <button onClick={startRun} type="button">Start Trivia</button>
            <button onClick={() => (!current && asked === 0 ? startRun() : drawCard())} type="button">Next Card</button>
            <button onClick={startRun} type="button">Reset</button>
          </>
        )}
        eyebrow="Bottom Cards // Trivia Deck"
        title="Trivia Cards"
      >
        Four-answer TV and film trivia. Answers shuffle every round and the deck gets harder when your streak rises.
      </SectionHeader>
      <div className="trivia-stats">
        <span>Level {level}</span>
        <span>Score {score}</span>
        <span>Streak {streak}</span>
        <span>{current ? current.cat : `Bank: ${questions.length} cards`}</span>
      </div>
      <article className="trivia-card">
        <p className="trivia-difficulty">
          {current ? `${current.cat} | Difficulty ${current.level}/10 | Card ${asked}/${maxCards}` : runComplete ? 'Run Complete' : 'Press Start Trivia'}
        </p>
        <h3>{current ? current.q : runComplete ? `Final Score: ${score}` : 'Your question will appear here.'}</h3>
        <div className="trivia-answers">
          {current ? choices.map(choice => (
            <button
              className={[
                'trivia-answer',
                locked && choice === current.a ? 'correct' : '',
                locked && picked === choice && choice !== current.a ? 'wrong' : ''
              ].filter(Boolean).join(' ')}
              disabled={locked}
              key={choice}
              onClick={() => chooseAnswer(choice)}
              type="button"
            >
              {choice}
            </button>
          )) : runComplete ? (
            <div className="trivia-summary">
              Correct: {correct}<br />
              Wrong: {wrong}<br />
              Highest Level Reached: {highestLevel}<br />
              Cards Played: {asked}<br />
              Total Bank Available: {questions.length} cards
            </div>
          ) : null}
        </div>
      </article>
      <p className={`message ${messageType}`.trim()}>{message}</p>
    </section>
  );
}
