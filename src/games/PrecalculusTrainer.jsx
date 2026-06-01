import { useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { buildPrecalcCards, precalcCardCount } from '../data/precalcData.js';
import { shuffle } from '../utils/random.js';

const chapters = [
  {
    id: 'fundamentals',
    title: 'Ch 1: Fundamentals',
    topics: ['Linear Functions', 'Inequalities', 'Domain and Range'],
    teach: 'Start by reading expressions like instructions. Substitute values carefully, simplify one operation at a time, and watch negative signs. Precalculus rewards clean algebra habits.',
    example: 'Example: For f(x) = 3x - 5, f(2) = 3(2) - 5 = 1. The input replaces x; then normal order of operations finishes it.'
  },
  {
    id: 'functions',
    title: 'Ch 2: Functions',
    topics: ['Function Composition', 'Inverse Functions', 'Function Transformations', 'Domain and Range'],
    teach: 'A function is a machine: input goes in, one output comes out. Composition means one machine feeds another. Inverses reverse the machine when possible.',
    example: 'Example: If f(x)=x+4 and g(x)=2x, then (f ∘ g)(3)=f(g(3))=f(6)=10. Work from the inside out.'
  },
  {
    id: 'poly-rational',
    title: 'Ch 3: Polynomial and Rational Functions',
    topics: ['Quadratics', 'Polynomial Features', 'Rational Expressions'],
    teach: 'Polynomials are built from powers of x. Rational functions are fractions with expressions. Look for zeros, intercepts, factors, and restrictions.',
    example: 'Example: (x² - 9)/(x - 3) factors to (x - 3)(x + 3)/(x - 3), so it simplifies to x + 3, but x cannot equal 3.'
  },
  {
    id: 'logs-exp',
    title: 'Ch 4: Exponential and Logarithmic Functions',
    topics: ['Exponents', 'Logarithms'],
    teach: 'Exponents build numbers by repeated multiplication. Logarithms undo exponents. A log asks: what power made this value?',
    example: 'Example: log₂(32)=5 because 2⁵=32. The base is 2, the result is the exponent.'
  },
  {
    id: 'unit-circle',
    title: 'Ch 5: Trigonometric Functions: Unit Circle Approach',
    topics: ['Unit Circle', 'Trigonometry'],
    teach: 'On the unit circle, cosine is the x-coordinate and sine is the y-coordinate. Quadrants decide whether values are positive or negative.',
    example: 'Example: At 60°, cos(60°)=1/2 and sin(60°)=√3/2. Remember: x first, y second.'
  },
  {
    id: 'right-triangle',
    title: 'Ch 6: Trigonometric Functions: Right Triangle Approach',
    topics: ['Trigonometry'],
    teach: 'Right-triangle trig compares sides. SOH-CAH-TOA means sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.',
    example: 'Example: If opposite = 3 and hypotenuse = 5, then sin(θ)=3/5.'
  },
  {
    id: 'analytic-trig',
    title: 'Ch 7: Analytic Trigonometry',
    topics: ['Trig Identities', 'Trigonometry'],
    teach: 'Analytic trig is algebra with trig identities. Replace expressions using identities until both sides match or the equation becomes solvable.',
    example: 'Example: sin²x + cos²x = 1 is the main identity. If sin²x = 1 - cos²x, that came from rearranging it.'
  },
  {
    id: 'polar-parametric',
    title: 'Ch 8: Polar Coordinates and Parametric Equations',
    topics: ['Function Transformations', 'Trigonometry'],
    teach: 'Polar form uses distance and angle instead of x and y. Parametric equations use a third variable, often t, to describe motion.',
    example: 'Example: x = r cosθ and y = r sinθ convert polar points into rectangular coordinates.'
  },
  {
    id: 'vectors',
    title: 'Ch 9: Vectors in Two and Three Dimensions',
    topics: ['Linear Functions', 'Complex Numbers'],
    teach: 'Vectors have direction and magnitude. Treat components like ordered movement: horizontal part, vertical part, and sometimes depth.',
    example: 'Example: A vector <3,4> has magnitude √(3²+4²)=5.'
  },
  {
    id: 'systems',
    title: 'Ch 10: Systems of Equations and Inequalities',
    topics: ['Linear Functions', 'Inequalities'],
    teach: 'A system asks where conditions are true at the same time. For equations, look for intersection. For inequalities, look for overlapping shaded regions.',
    example: 'Example: y=2x+1 and y=x+4 intersect when 2x+1=x+4, so x=3 and y=7.'
  },
  {
    id: 'conics',
    title: 'Ch 11: Conic Sections',
    topics: ['Conics', 'Quadratics'],
    teach: 'Conics come from slicing cones: circles, ellipses, parabolas, and hyperbolas. Their equations reveal centers, radii, and direction.',
    example: 'Example: (x-h)² + (y-k)² = r² is a circle with center (h,k) and radius r.'
  },
  {
    id: 'sequences',
    title: 'Ch 12: Sequences and Series',
    topics: ['Sequences', 'Series'],
    teach: 'A sequence lists terms in order. Arithmetic sequences add the same amount; geometric sequences multiply by the same amount.',
    example: 'Example: If a₁=5 and d=3, then a₄=5+(4-1)3=14.'
  },
  {
    id: 'limits',
    title: 'Ch 13: Limits: A Preview of Calculus',
    topics: ['Function Transformations', 'Rational Expressions'],
    teach: 'A limit asks what value a function approaches, not always what it equals. This is the doorway into calculus.',
    example: 'Example: If a graph approaches y=2 as x gets close to 1, then the limit is 2 even if the point at x=1 is missing.'
  }
];

function MathText({ children }) {
  const parts = String(children)
    .replaceAll('sqrt', '√')
    .split(/(\^[\w()+\-/]+|_[\w()+\-/]+|[₁₂₃₄₅₆₇₈₉₀]|[²³⁴⁵⁶⁷⁸⁹⁰])/g)
    .filter(Boolean);

  return <>{parts.map((part, index) => {
    if (part.startsWith('^')) return <sup key={index}>{part.slice(1)}</sup>;
    if (part.startsWith('_')) return <sub key={index}>{part.slice(1)}</sub>;
    return <span key={index}>{part}</span>;
  })}</>;
}

function makeFallbackQuestion(chapter, step) {
  return {
    id: `${chapter.id}-concept-${step}`,
    topic: chapter.topics[0],
    level: Math.min(10, step + 1),
    question: `Concept check for ${chapter.title}: what should you focus on first?`,
    a: 'Understand the rule, then practice one clean step at a time',
    wrong: ['Guess from the answers first', 'Skip the example and only memorize letters', 'Only look for the biggest number'],
    hint: chapter.teach
  };
}

export default function PrecalculusTrainer() {
  const cards = useMemo(() => buildPrecalcCards(), []);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('teach');
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState('');
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [weakIds, setWeakIds] = useState([]);
  const [message, setMessage] = useState('Choose a chapter. Read the teaching card, study the example, then pass the practice to advance.');
  const [messageType, setMessageType] = useState('');

  const chapter = chapters[chapterIndex];
  const chapterProgress = Math.round(((chapterIndex + (phase === 'teach' ? 0 : phase === 'example' ? 0.35 : 0.7)) / chapters.length) * 100);

  function chapterCards(targetChapter = chapter, nextStep = step) {
    const levelCap = Math.min(10, 2 + nextStep + chapterIndex);
    const pool = cards.filter(card => targetChapter.topics.includes(card.topic) && card.level <= levelCap);
    return pool.length ? pool : cards.filter(card => targetChapter.topics.includes(card.topic));
  }

  function selectPractice(targetChapter = chapter, nextStep = step) {
    const pool = chapterCards(targetChapter, nextStep);
    const weakPool = pool.filter(card => weakIds.includes(card.id));
    const source = weakPool.length && nextStep % 3 === 2 ? weakPool : pool;
    return shuffle(source)[0] || makeFallbackQuestion(targetChapter, nextStep);
  }

  function setPracticeCard(card) {
    setCurrent(card);
    setChoices(shuffle([card.a, ...card.wrong].slice(0, 4)));
    setPicked('');
    setLocked(false);
  }

  function openChapter(index) {
    const allowed = index <= unlocked;
    if (!allowed) {
      setMessage('Locked. Pass the current chapter practice first.');
      setMessageType('bad');
      return;
    }
    setChapterIndex(index);
    setStep(0);
    setPhase('teach');
    setCurrent(null);
    setChoices([]);
    setPicked('');
    setLocked(false);
    setMessage(`${chapters[index].title} opened. Start with the teaching card.`);
    setMessageType('good');
  }

  function nextPhase() {
    if (phase === 'teach') {
      setPhase('example');
      setMessage('Study the worked example. Next step is locked practice.');
      setMessageType('good');
      return;
    }
    if (phase === 'example') {
      const card = selectPractice(chapter, step);
      setPhase('practice');
      setPracticeCard(card);
      setMessage('Practice is locked: answer correctly to advance.');
      setMessageType('');
      return;
    }
    if (phase === 'practice') {
      setMessage('You cannot advance yet. Answer the practice card correctly first.');
      setMessageType('bad');
    }
  }

  function choose(choice) {
    if (!current || locked || phase !== 'practice') return;
    setLocked(true);
    setPicked(choice);
    const ok = choice === current.a;

    if (ok) {
      const gain = 20 + current.level * 5 + streak;
      const nextStep = step + 1;
      setScore(value => value + gain);
      setStreak(value => value + 1);
      setCorrect(value => value + 1);
      setMessage(`Correct. +${gain}. Chapter strength increased. ${current.hint}`);
      setMessageType('good');

      if (nextStep >= 3) {
        const nextUnlock = Math.min(chapters.length - 1, Math.max(unlocked, chapterIndex + 1));
        setUnlocked(nextUnlock);
        setStep(0);
        setCurrent(null);
        setChoices([]);
        if (chapterIndex < chapters.length - 1) {
          setChapterIndex(chapterIndex + 1);
          setPhase('teach');
          setMessage(`Chapter cleared. ${chapters[chapterIndex + 1].title} unlocked.`);
        } else {
          setPhase('complete');
          setMessage('Course complete. Keep using Weak Review to strengthen mistakes.');
        }
      } else {
        setStep(nextStep);
        setPhase('teach');
        setCurrent(null);
        setChoices([]);
      }
    } else {
      const loss = 10 + current.level * 2;
      setScore(value => value - loss);
      setStreak(0);
      setMissed(value => value + 1);
      setWeakIds(value => [...new Set([current.id, ...value])].slice(0, 300));
      setMessage(`Wrong. -${loss}. Correct answer: ${current.a}. You stay on this lesson until you get it right. ${current.hint}`);
      setMessageType('bad');
    }
  }

  function retryPractice() {
    const card = weakIds.length ? cards.find(item => item.id === weakIds[0]) || selectPractice() : selectPractice();
    setPhase('practice');
    setPracticeCard(card);
    setMessage('Weak review loaded. Correct answer required to move on.');
    setMessageType('');
  }

  return (
    <section className="precalc-panel" aria-label="Precalculus textbook training">
      <SectionHeader
        actions={(
          <>
            <button type="button" onClick={nextPhase}>{phase === 'teach' ? 'Study Example' : phase === 'example' ? 'Start Practice' : 'Advance Locked'}</button>
            <button type="button" onClick={retryPractice}>Weak Review</button>
          </>
        )}
        eyebrow="Math Book Mode // Locked Progression"
        title="Precalculus Course Trainer"
      >
        Chapter-based learning: teaching card, worked example, then locked practice. You cannot advance without answering correctly.
      </SectionHeader>

      <div className="precalc-course-layout">
        <aside className="precalc-chapters" aria-label="Precalculus chapters">
          {chapters.map((item, index) => (
            <button
              className={`chapter-button ${index === chapterIndex ? 'active' : ''} ${index > unlocked ? 'locked' : ''}`.trim()}
              key={item.id}
              onClick={() => openChapter(index)}
              type="button"
            >
              <span>{index > unlocked ? '▸' : index < chapterIndex ? '✓' : '›'}</span>
              {item.title}
            </button>
          ))}
        </aside>

        <div className="precalc-learning-zone">
          <div className="precalc-stats">
            <span>Progress {chapterProgress}%</span>
            <span>Lesson {step + 1}/3</span>
            <span>Score {score}</span>
            <span>Streak {streak}</span>
            <span>Correct {correct}</span>
            <span>Missed {missed}</span>
            <span>Bank {precalcCardCount.toLocaleString()}</span>
          </div>

          <article className={`precalc-card phase-${phase}`}>
            <p className="precalc-meta">{chapter.title} • {phase === 'teach' ? 'Teach' : phase === 'example' ? 'Worked Example' : phase === 'complete' ? 'Complete' : `Practice Level ${current?.level || step + 1}`}</p>
            {phase === 'teach' ? (
              <>
                <h3>Concept</h3>
                <p className="lesson-text"><MathText>{chapter.teach}</MathText></p>
                <p className="lesson-note">Press Study Example when this makes sense.</p>
              </>
            ) : phase === 'example' ? (
              <>
                <h3>Worked Example</h3>
                <p className="lesson-text worked"><MathText>{chapter.example}</MathText></p>
                <p className="lesson-note">Next is locked practice. You advance only when correct.</p>
              </>
            ) : phase === 'complete' ? (
              <>
                <h3>Course Complete</h3>
                <p className="lesson-text">You cleared every chapter. Use Weak Review to revisit missed cards.</p>
              </>
            ) : (
              <>
                <h3><MathText>{current?.question || 'Practice loading...'}</MathText></h3>
                <div className="precalc-answers">
                  {choices.map(choice => (
                    <button
                      className={[
                        'precalc-answer',
                        locked && choice === current?.a ? 'correct' : '',
                        locked && picked === choice && choice !== current?.a ? 'wrong' : ''
                      ].filter(Boolean).join(' ')}
                      disabled={locked && picked === current?.a}
                      key={choice}
                      onClick={() => choose(choice)}
                      type="button"
                    >
                      <MathText>{choice}</MathText>
                    </button>
                  ))}
                </div>
              </>
            )}
          </article>
          <p className={`message ${messageType}`.trim()}>{message}</p>
        </div>
      </div>
    </section>
  );
}
