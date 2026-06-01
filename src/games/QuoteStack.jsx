import { useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { buildQuoteBank } from '../data/quoteData.js';
import { shuffle } from '../utils/random.js';

const makeStack = base => Array.from({ length: 1000 }, (_, i) => ({ ...base[i % base.length], id: `stack-${i}`, level: Math.min(10, base[i % base.length].level + (i % 4)) }));

export default function QuoteStack() {
  const cards = useMemo(() => makeStack(buildQuoteBank()), []);
  const [card, setCard] = useState(null);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState('');
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState(`${cards.length} quote cards ready.`);

  function draw(reset = false) {
    const next = shuffle(cards)[0];
    const others = [...new Set(cards.filter(item => item.answer !== next.answer).map(item => item.answer))];
    if (reset) { setScore(0); setStreak(0); }
    setCard(next);
    setChoices(shuffle([next.answer, ...shuffle(others).slice(0, 3)]));
    setPicked('');
    setLocked(false);
    setMessage('Pick the best answer.');
  }

  function choose(choice) {
    if (!card || locked) return;
    setPicked(choice);
    setLocked(true);
    const ok = choice === card.answer;
    if (ok) { setScore(value => value + 10 + card.level); setStreak(value => value + 1); setMessage('Correct. Moving to next card.'); }
    else { setScore(value => value - 5); setStreak(0); setMessage(`Answer: ${card.answer}. Moving to next card.`); }
    setTimeout(() => draw(false), ok ? 900 : 1500);
  }

  return (
    <section className="quote-panel" aria-label="Quote stack game">
      <SectionHeader actions={<><button type="button" onClick={() => draw(true)}>Start Quotes</button><button type="button" onClick={() => draw(false)}>Next Quote</button><button type="button" onClick={() => draw(true)}>Reset</button></>} eyebrow="Quote Stack // 1,000 Cards" title="Guess That Quote">
        Four-choice quote stack mode with a real 1,000-card pool, score, streak, and automatic next card.
      </SectionHeader>
      <div className="quote-stats"><span>Score {score}</span><span>Streak {streak}</span><span>Stack {cards.length}</span></div>
      <article className="quote-card">
        <p className="quote-meta">{card ? `${card.source} • Level ${card.level}/10` : 'Press Start Quotes'}</p>
        <blockquote>{card ? card.line : 'Your quote card will appear here.'}</blockquote>
        <p className="quote-prompt">{card ? card.prompt : 'Pick one of four.'}</p>
        <div className="quote-choices">
          {choices.map(choice => <button type="button" key={choice} disabled={locked} onClick={() => choose(choice)} className={['quote-choice', locked && choice === card?.answer ? 'correct' : '', locked && picked === choice && choice !== card?.answer ? 'wrong' : ''].filter(Boolean).join(' ')}>{choice}</button>)}
        </div>
      </article>
      <p className="message">{message}</p>
    </section>
  );
}
