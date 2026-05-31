import { useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { buildQuoteBank } from '../data/quoteData.js';
import { shuffle } from '../utils/random.js';

const maxCards = 30;

export default function GuessThatQuote() {
  const quotes = useMemo(() => buildQuoteBank(), []);
  const [filter, setFilter] = useState('mixed');
  const [level, setLevel] = useState(1);
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
  const [message, setMessage] = useState(`Ready. ${quotes.length} quote cards loaded.`);
  const [messageType, setMessageType] = useState('');

  function filteredCards(nextFilter = filter) {
    if (nextFilter === 'adult') return quotes.filter(card => card.type === 'adult');
    if (nextFilter === 'horror') return quotes.filter(card => card.type === 'horror');
    return quotes;
  }

  function getPool(nextFilter = filter, nextLevel = level, nextHistory = history) {
    const maxLevel = Math.min(10, nextLevel + 2);
    const bank = filteredCards(nextFilter);
    const fresh = bank.filter(card => card.level <= maxLevel && !nextHistory.includes(card.id));
    return fresh.length ? fresh : bank.filter(card => card.level <= maxLevel);
  }

  function choicesFor(card, nextFilter = filter) {
    const sameType = filteredCards(nextFilter)
      .filter(other => other.type === card.type && other.answer !== card.answer)
      .map(other => other.answer);
    const mixedFallback = quotes
      .filter(other => other.answer !== card.answer)
      .map(other => other.answer);
    const unique = [...new Set([...sameType, ...mixedFallback])];
    return shuffle([card.answer, ...shuffle(unique).slice(0, 3)]);
  }

  function drawCard(nextDeck = deck, nextAsked = asked, nextHistory = history, nextFilter = filter) {
    if (nextAsked >= maxCards) {
      finishRun();
      return;
    }
    const readyDeck = nextDeck.length ? nextDeck : shuffle(getPool(nextFilter, level, nextHistory));
    const nextCurrent = readyDeck[readyDeck.length - 1];
    if (!nextCurrent) {
      finishRun();
      return;
    }
    const remaining = readyDeck.slice(0, -1);
    setCurrent(nextCurrent);
    setDeck(remaining);
    setAsked(nextAsked + 1);
    setHistory([...nextHistory, nextCurrent.id]);
    setChoices(choicesFor(nextCurrent, nextFilter));
    setLocked(false);
    setPicked('');
    setMessage('Choose one of four.');
    setMessageType('');
  }

  function startRun(nextFilter = filter) {
    setLevel(1);
    setScore(0);
    setStreak(0);
    setAsked(0);
    setCorrect(0);
    setWrong(0);
    setHistory([]);
    setDeck([]);
    drawCard([], 0, [], nextFilter);
  }

  function chooseAnswer(choice) {
    if (locked || !current) return;
    setLocked(true);
    setPicked(choice);
    const isCorrect = choice === current.answer;

    if (isCorrect) {
      const nextStreak = streak + 1;
      const nextLevel = nextStreak > 0 && nextStreak % 3 === 0 ? Math.min(10, level + 1) : level;
      const gained = 15 + current.level * 5 + nextStreak * 2;
      setCorrect(value => value + 1);
      setStreak(nextStreak);
      setLevel(nextLevel);
      setScore(value => value + gained);
      setMessage(`Correct. +${gained} points.`);
      setMessageType('good');
    } else {
      const lost = 8 + current.level * 2;
      setWrong(value => value + 1);
      setStreak(0);
      setLevel(value => Math.max(1, value - 1));
      setScore(value => value - lost);
      setMessage(`Wrong. Correct answer: ${current.answer}.`);
      setMessageType('bad');
    }
  }

  function finishRun() {
    setLocked(true);
    setCurrent(null);
    setChoices([]);
    setMessage('Quote run complete. Press Reset to play again.');
    setMessageType('good');
  }

  function changeFilter(nextFilter) {
    setFilter(nextFilter);
    startRun(nextFilter);
  }

  const runComplete = !current && asked > 0;

  return (
    <section className="quote-panel" aria-label="Guess That Quote game">
      <SectionHeader
        actions={(
          <>
            <button onClick={() => startRun()} type="button">Start Quotes</button>
            <button onClick={() => (!current && asked === 0 ? startRun() : drawCard())} type="button">Next Quote</button>
            <button onClick={() => startRun()} type="button">Reset</button>
          </>
        )}
        eyebrow="Bottom Lines // Quote Bank"
        title="Guess That Quote"
      >
        Ink-dry quote cards with four possible answers. Adult Swim characters and horror movie pulls share the deck.
      </SectionHeader>
      <div className="quote-filters" aria-label="Quote deck filter">
        {[
          ['mixed', 'Mixed'],
          ['adult', 'Adult Swim'],
          ['horror', 'Horror Movies']
        ].map(([id, label]) => (
          <button className={`quote-filter ${filter === id ? 'active' : ''}`.trim()} key={id} onClick={() => changeFilter(id)} type="button">
            {label}
          </button>
        ))}
      </div>
      <div className="quote-stats">
        <span>Level {level}</span>
        <span>Score {score}</span>
        <span>Streak {streak}</span>
        <span>Bank {quotes.length}</span>
      </div>
      <article className="quote-card">
        <p className="quote-meta">
          {current ? `${current.type === 'adult' ? current.source : 'Horror Movie'} | Difficulty ${current.level}/10 | Card ${asked}/${maxCards}` : runComplete ? 'Run Complete' : 'Press Start Quotes'}
        </p>
        <blockquote>{current ? current.line : runComplete ? `Final Score: ${score}` : 'Your quote card will appear here.'}</blockquote>
        <p className="quote-prompt">{current ? current.prompt : runComplete ? `Correct ${correct} | Wrong ${wrong}` : 'Pick one of four.'}</p>
        <div className="quote-choices">
          {current ? choices.map(choice => (
            <button
              className={[
                'quote-choice',
                locked && choice === current.answer ? 'correct' : '',
                locked && picked === choice && choice !== current.answer ? 'wrong' : ''
              ].filter(Boolean).join(' ')}
              disabled={locked}
              key={choice}
              onClick={() => chooseAnswer(choice)}
              type="button"
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
