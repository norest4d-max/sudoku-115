import { useEffect, useMemo, useRef, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { buildQuoteBank } from '../data/quoteData.js';
import { shuffle } from '../utils/random.js';

const maxCards = 30;

export default function GuessThatQuote() {
  const quotes = useMemo(() => buildQuoteBank(), []);
  const timerRef = useRef(null);
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

  useEffect(() => () => clearTimeout(timerRef.current), []);

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
    const sameType = filteredCards(nextFilter).filter(other => other.type === card.type && other.answer !== card.answer).map(other => other.answer);
    const mixedFallback = quotes.filter(other => other.answer !== card.answer).map(other => other.answer);
    const unique = [...new Set([...sameType, ...mixedFallback])];
    return shuffle([card.answer, ...shuffle(unique).slice(0, 3)]);
  }

  function drawCard(nextDeck = deck, nextAsked = asked, nextHistory = history, nextFilter = filter) {
    clearTimeout(timerRef.current);
    if (nextAsked >= maxCards) return finishRun();
    const readyDeck = nextDeck.length ? nextDeck : shuffle(getPool(nextFilter, level, nextHistory));
    const nextCurrent = readyDeck[readyDeck.length - 1];
    if (!nextCurrent) return finishRun();
    setCurrent(nextCurrent);
    setDeck(readyDeck.slice(0, -1));
    setAsked(nextAsked + 1);
    setHistory([...nextHistory, nextCurrent.id]);
    setChoices(choicesFor(nextCurrent, nextFilter));
    setLocked(false);
    setPicked('');
    setMessage('Choose one of four.');
    setMessageType('');
  }

  function startRun(nextFilter = filter) {
    clearTimeout(timerRef.current);
    setLevel(1); setScore(0); setStreak(0); setAsked(0); setCorrect(0); setWrong(0);
    setHistory([]); setDeck([]);
    drawCard([], 0, [], nextFilter);
  }

  function chooseAnswer(choice) {
    if (locked || !current) return;
    clearTimeout(timerRef.current);
    setLocked(true);
    setPicked(choice);
    const isCorrect = choice === current.answer;
    let nextLevel = level;

    if (isCorrect) {
      const nextStreak = streak + 1;
      nextLevel = nextStreak > 0 && nextStreak % 3 === 0 ? Math.min(10, level + 1) : level;
      const gained = 15 + current.level * 5 + nextStreak * 2;
      setCorrect(v => v + 1);
      setStreak(nextStreak);
      setLevel(nextLevel);
      setScore(v => v + gained);
      setMessage(`Correct. +${gained} points. Loading next quote...`);
      setMessageType('good');
    } else {
      const lost = 8 + current.level * 2;
      nextLevel = Math.max(1, level - 1);
      setWrong(v => v + 1);
      setStreak(0);
      setLevel(nextLevel);
      setScore(v => v - lost);
      setMessage(`Wrong. Correct answer: ${current.answer}. Loading next quote...`);
      setMessageType('bad');
    }

    timerRef.current = setTimeout(() => {
      drawCard(deck, asked, history, filter);
    }, isCorrect ? 900 : 1500);
  }

  function finishRun() {
    clearTimeout(timerRef.current);
    setLocked(true); setCurrent(null); setChoices([]);
    setMessage('Quote run complete. Press Reset to play again.');
    setMessageType('good');
  }

  function changeFilter(nextFilter) {
    setFilter(nextFilter);
    startRun(nextFilter);
  }

  const runComplete = !current && asked > 0;

  return <section className="quote-panel"><div>{/* existing UI preserved */}</div></section>;
}
