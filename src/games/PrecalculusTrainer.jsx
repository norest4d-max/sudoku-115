import { useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { buildPrecalcCards, precalcCardCount } from '../data/precalcData.js';
import { shuffle } from '../utils/random.js';

const course = [
  ['Ch 1: Fundamentals', ['1.1: Real Numbers','1.2: Exponents and Radicals','1.3: Algebraic Expressions','1.4: Rational Expressions','1.5: Equations','1.6: Complex Numbers','1.7: Modeling with Equations','1.8: Inequalities','1.9: The Coordinate Plane; Graphs of Equations; Circles','1.10: Lines','1.11: Solving Equations and Inequalities Graphically','1.12: Modeling Variation','Chapter 1: Review','Chapter 1: Test']],
  ['Ch 2: Functions', ['2.1: Functions','2.2: Graphs of Functions','2.3: Getting Information from the Graph of a Function','2.4: Average Rate of Change of a Function','2.5: Linear Functions and Models','2.6: Transformations of Functions','2.7: Combining Functions','2.8: One-to-One Functions and Their Inverses','Chapter 2: Review','Chapter 2: Test']],
  ['Ch 3: Polynomial and Rational Functions', ['3.1: Quadratic Functions and Models','3.2: Polynomial Functions and Their Graphs','3.3: Dividing Polynomials','3.4: Real Zeros of Polynomials','3.5: Complex Zeros and the Fundamental Theorem of Algebra','3.6: Rational Functions','3.7: Polynomial and Rational Inequalities','Chapter 3: Review','Chapter 3: Test','Focus on Modeling: Fitting Polynomial Curves to Data']],
  ['Ch 4: Exponential and Logarithmic Functions', ['4.1: Exponential Functions','4.2: The Natural Exponential Function','4.3: Logarithmic Functions','4.4: Laws of Logarithms','4.5: Exponential and Logarithmic Equations','4.6: Modeling with Exponential Functions','4.7: Logarithmic Scales','Chapter 4: Review','Chapter 4: Test']],
  ['Ch 5: Trigonometric Functions: Unit Circle Approach', ['5.1: The Unit Circle','5.2: Trigonometric Functions of Real Numbers','5.3: Trigonometric Graphs','5.4: More Trigonometric Graphs','5.5: Inverse Trigonometric Functions and Their Graphs','5.6: Modeling Harmonic Motion','Chapter 5: Review','Chapter 5: Test','Focus on Modeling: Fitting Sinusoidal Curves to Data']],
  ['Ch 6: Trigonometric Functions: Right Triangle Approach', ['6.1: Angle Measure','6.2: Trigonometry of Right Triangles','6.3: Trigonometric Functions of Angles','6.4: Inverse Trigonometric Functions and Right Triangles','6.5: The Law of Sines','6.6: The Law of Cosines','Chapter 6: Review','Chapter 6: Test','Focus on Modeling: Surveying']],
  ['Ch 7: Analytic Trigonometry', ['7.1: Trigonometric Identities','7.2: Addition and Subtraction Formulas','7.3: Double-Angle, Half-Angle, and Product-Sum Formulas','7.4: Basic Trigonometric Equations','7.5: More Trigonometric Equations','Chapter 7: Review','Chapter 7: Test','Focus on Modeling: Traveling and Standing Waves']],
  ['Ch 8: Polar Coordinates and Parametric Equations', ['8.1: Polar Coordinates','8.2: Graphs of Polar Equations',"8.3: Polar Form of Complex Numbers; De Moivre's Theorem",'8.4: Plane Curves and Parametric Equations','Chapter 8: Review','Chapter 8: Test','Focus on Modeling: The Path of a Projectile']],
  ['Ch 9: Vectors in Two and Three Dimensions', ['9.1: Vectors in Two Dimensions','9.2: The Dot Product','9.3: Three-Dimensional Coordinate Geometry','9.4: Vectors in Three Dimensions','9.5: The Cross Product','9.6: Equations of Lines and Planes','Chapter 9: Review','Chapter 9: Test','Focus on Modeling: Vector Fields']],
  ['Ch 10: Systems of Equations and Inequalities', ['10.1: Systems of Linear Equations in Two Variables','10.2: Systems of Linear Equations in Several Variables','10.3: Matrices and Systems of Linear Equations','10.4: The Algebra of Matrices','10.5: Inverses of Matrices and Matrix Equations',"10.6: Determinants and Cramer's Rule",'10.7: Partial Fractions','10.8: Systems of Nonlinear Equations','10.9: Systems of Inequalities','Chapter 10: Review','Chapter 10: Test']],
  ['Ch 11: Conic Sections', ['11.1: Parabolas','11.2: Ellipses','11.3: Hyperbolas','11.4: Shifted Conics','11.5: Rotation of Axes','11.6: Polar Equations of Conics','Chapter 11: Review','Chapter 11: Test','Focus on Modeling: Conics in Architecture']],
  ['Ch 12: Sequences and Series', ['12.1: Sequences and Summation Notation','12.2: Arithmetic Sequences','12.3: Geometric Sequences','12.4: Mathematics of Finance','12.5: Mathematical Induction','12.6: The Binomial Theorem','Chapter 12: Review','Chapter 12: Test','Focus on Modeling: Modeling with Recursive Sequences']],
  ['Ch 13: Limits: A Preview of Calculus', ['13.1: Finding Limits Numerically and Graphically','13.2: Finding Limits Algebraically','13.3: Tangent Lines and Derivatives','13.4: Limits at Infinity; Limits of Sequences','13.5: Areas','Chapter 13: Review','Chapter 13: Test','Focus on Modeling: Interpretations of Area']]
];

const lessons = course.flatMap(([chapter, sections], chapterIndex) => sections.map((title, sectionIndex) => ({ id: `${chapterIndex + 1}-${sectionIndex + 1}`, chapter, title, chapterIndex, sectionIndex, topics: topicsFor(title) })));

function topicsFor(title) {
  if (/Exponent|Radical|Exponential|Natural/.test(title)) return ['Exponents'];
  if (/Logarithm|Logarithmic/.test(title)) return ['Logarithms'];
  if (/Trig|Unit Circle|Angle|Sines|Cosines|Harmonic|Waves/.test(title)) return ['Trigonometry', 'Unit Circle', 'Trig Identities'];
  if (/Quadratic|Polynomial|Zeros|Dividing/.test(title)) return ['Quadratics', 'Polynomial Features'];
  if (/Rational|Partial/.test(title)) return ['Rational Expressions'];
  if (/Complex|De Moivre/.test(title)) return ['Complex Numbers'];
  if (/Inequal/.test(title)) return ['Inequalities'];
  if (/Coordinate|Circle|Conic|Parabola|Ellipse|Hyperbola|Polar/.test(title)) return ['Conics', 'Function Transformations'];
  if (/Line|Linear|Systems|Matrices|Determinants|Cramer/.test(title)) return ['Linear Functions'];
  if (/Sequence|Series|Summation|Induction|Binomial|Recursive/.test(title)) return ['Sequences', 'Series'];
  if (/Function|Inverse|Transform|Combining|Graph|Rate/.test(title)) return ['Function Composition', 'Inverse Functions', 'Function Transformations', 'Domain and Range'];
  if (/Vector|Dot|Cross|Plane/.test(title)) return ['Linear Functions', 'Complex Numbers'];
  return ['Linear Functions', 'Domain and Range'];
}

function teachFor(lesson) {
  const title = lesson.title;
  if (/Complex Numbers/.test(title)) return 'Complex numbers have a real part and an imaginary part. For addition, compute the real answer first, compute the imaginary answer second, then write them together as a + bi.';
  if (/Exponents|Radicals/.test(title)) return 'Exponents repeat multiplication. Radicals undo powers. Rewrite both sides into compatible forms, then simplify using exponent rules.';
  if (/Rational Expressions/.test(title)) return 'Rational expressions behave like fractions. Factor first, note restrictions, then cancel common factors.';
  if (/Inequalities/.test(title)) return 'Inequalities compare size. Solve like equations, but flip the sign when multiplying or dividing by a negative.';
  if (/Functions/.test(title)) return 'Functions are input-output machines. Domain is allowed x-values, range is possible y-values, and graphs show behavior.';
  if (/Quadratic/.test(title)) return 'Quadratics make parabolas. Vertex form shows the turning point; factored form shows zeros.';
  if (/Logarithm/.test(title)) return 'Logarithms are inverse exponents. A log asks: what exponent turns the base into the value?';
  if (/Unit Circle/.test(title)) return 'On the unit circle, cosine is x and sine is y. Quadrants decide signs.';
  if (/Sequence|Series/.test(title)) return 'Sequences list values in order. Series add them. Arithmetic adds; geometric multiplies.';
  if (/Limit|Derivative|Areas/.test(title)) return 'Limits ask what value a function approaches. This prepares you for derivatives, tangent lines, and area.';
  return 'Read the section title, identify the rule being tested, write the setup, simplify carefully, and check the result.';
}

function exampleFor(lesson) {
  const title = lesson.title;
  if (/Complex Numbers/.test(title)) return 'Example: (3 + 4i) + (2 - i). Real parts: 3 + 2 = 5. Imaginary parts: 4i + -1i = 3i. Final answer: 5 + 3i.';
  if (/Exponents|Radicals/.test(title)) return 'Example: x^3 · x^2 = x^5 because matching bases add exponents. √49 = 7 because 7^2 = 49.';
  if (/Rational Expressions/.test(title)) return 'Example: (x^2 - 9)/(x - 3) = ((x - 3)(x + 3))/(x - 3) = x + 3, with x ≠ 3.';
  if (/Equations/.test(title)) return 'Example: 2x + 5 = 17 → 2x = 12 → x = 6. Check: 2(6)+5=17.';
  if (/Inequalities/.test(title)) return 'Example: -2x < 8. Divide by -2 and flip the sign: x > -4.';
  if (/Quadratic/.test(title)) return 'Example: y=(x-2)^2+3 has vertex (2,3). The graph shifts right 2 and up 3.';
  if (/Logarithm/.test(title)) return 'Example: log_2(32)=5 because 2^5=32.';
  if (/Unit Circle/.test(title)) return 'Example: at 60°, cos(60°)=1/2 and sin(60°)=√3/2. Coordinate is (cosθ, sinθ).';
  if (/Sequence/.test(title)) return 'Example: arithmetic a_n=a_1+(n-1)d. If a_1=5, d=3, then a_4=14.';
  return 'Example: identify the rule, write the formula, substitute carefully, simplify, then check the result.';
}

function MathText({ children }) {
  const parts = String(children).replaceAll('sqrt', '√').split(/(\^[\w()+\-/]+|_[\w()+\-/]+|[²³⁴⁵⁶⁷⁸⁹⁰₁₂₃₄₅₆₇₈₉₀])/g).filter(Boolean);
  return <>{parts.map((part, i) => part.startsWith('^') ? <sup key={i}>{part.slice(1)}</sup> : part.startsWith('_') ? <sub key={i}>{part.slice(1)}</sub> : <span key={i}>{part}</span>)}</>;
}

function fallbackQuestion(lesson, level) {
  return { id: `fallback-${lesson.id}-${level}`, topic: lesson.topics[0], level, question: `For ${lesson.title}, what is the strongest first move?`, a: 'Identify the rule, write the setup, then simplify carefully', wrong: ['Guess the largest answer', 'Skip the setup and memorize only symbols', 'Change signs randomly until it looks right'], hint: teachFor(lesson), explanation: teachFor(lesson) };
}

export default function PrecalculusTrainer() {
  const cards = useMemo(() => buildPrecalcCards(), []);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [phase, setPhase] = useState('teach');
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [weakIds, setWeakIds] = useState([]);
  const [explainAgain, setExplainAgain] = useState('');
  const [message, setMessage] = useState('Start at 1.1. Teach → example → locked practice. Correct answer unlocks the next section.');
  const [messageType, setMessageType] = useState('');

  const lesson = lessons[lessonIndex];
  const progress = Math.round(((lessonIndex + (phase === 'teach' ? 0 : phase === 'example' ? .4 : .75)) / lessons.length) * 100);

  function lessonPool(target = lesson) {
    const maxLevel = Math.min(10, 2 + Math.floor(target.chapterIndex / 2) + Math.floor(target.sectionIndex / 3));
    const pool = cards.filter(card => target.topics.includes(card.topic) && card.level <= maxLevel);
    return pool.length ? pool : cards.filter(card => target.topics.includes(card.topic));
  }

  function makePractice(target = lesson) {
    const pool = lessonPool(target);
    const weak = pool.filter(card => weakIds.includes(card.id));
    return shuffle(weak.length ? weak : pool)[0] || fallbackQuestion(target, Math.min(10, target.chapterIndex + 1));
  }

  function loadPractice(target = lesson) {
    const card = makePractice(target);
    setCurrent(card);
    setChoices(shuffle([card.a, ...card.wrong].slice(0, 4)));
    setPicked('');
    setExplainAgain('');
    setPhase('practice');
    setMessage('Locked practice: answer correctly to unlock the next section.');
    setMessageType('');
  }

  function openLesson(index) {
    if (index > unlocked) { setMessage('Locked. Clear the current practice problem first.'); setMessageType('bad'); return; }
    setLessonIndex(index); setPhase('teach'); setCurrent(null); setChoices([]); setPicked(''); setExplainAgain('');
    setMessage(`${lessons[index].title} loaded. Read the concept first.`); setMessageType('good');
  }

  function nextPhase() {
    if (phase === 'teach') { setPhase('example'); setMessage('Study the worked example. Then start locked practice.'); setMessageType('good'); }
    else if (phase === 'example') loadPractice();
    else if (phase === 'practice') { setMessage('Advance is locked until you answer this practice problem correctly.'); setMessageType('bad'); }
  }

  function choose(choice) {
    if (!current || phase !== 'practice' || picked) return;
    setPicked(choice);
    const ok = choice === current.a;
    if (ok) {
      const gain = 25 + current.level * 4 + streak;
      const next = Math.min(lessons.length - 1, lessonIndex + 1);
      setScore(v => v + gain); setStreak(v => v + 1); setCorrect(v => v + 1); setUnlocked(v => Math.max(v, next)); setExplainAgain('');
      setMessage(`Correct. +${gain}. Next section unlocked.`); setMessageType('good');
      if (lessonIndex < lessons.length - 1) setTimeout(() => openLesson(next), 650);
      else { setPhase('complete'); setMessage('Course complete. Use Weak Review to strengthen missed problems.'); }
    } else {
      const loss = 10 + current.level * 2;
      const explanation = current.explanation || current.hint || teachFor(lesson);
      setScore(v => v - loss); setStreak(0); setMissed(v => v + 1); setWeakIds(v => [...new Set([current.id, ...v])].slice(0, 300));
      setExplainAgain(`Breakdown: ${explanation}`);
      setMessage(`Wrong. -${loss}. Correct answer: ${current.a}. You cannot advance yet.`); setMessageType('bad');
    }
  }

  return (
    <section className="precalc-panel" aria-label="Precalculus textbook training">
      <SectionHeader actions={<><button type="button" onClick={nextPhase}>{phase === 'teach' ? 'Study Example' : phase === 'example' ? 'Start Practice' : 'Advance Locked'}</button><button type="button" onClick={() => loadPractice()}>Retry Practice</button></>} eyebrow="Math Book Mode // Section Progression" title="Precalculus Course Trainer">
        Full textbook-style flow: section concept, worked example, locked practice, then the next section unlocks.
      </SectionHeader>
      <div className="precalc-course-layout">
        <aside className="precalc-chapters" aria-label="Precalculus textbook sections">
          {course.map(([chapterTitle, sectionTitles], ci) => <div className="chapter-group" key={chapterTitle}><p className="chapter-group-title">{chapterTitle}</p>{sectionTitles.map((title, si) => { const index = lessons.findIndex(item => item.chapterIndex === ci && item.sectionIndex === si); return <button className={`chapter-button ${index === lessonIndex ? 'active' : ''} ${index > unlocked ? 'locked' : ''}`.trim()} key={title} onClick={() => openLesson(index)} type="button"><span>{index < unlocked ? '✓' : index === unlocked ? '›' : '▸'}</span>{title}</button>; })}</div>)}
        </aside>
        <div className="precalc-learning-zone">
          <div className="precalc-stats"><span>Progress {progress}%</span><span>{lesson.title}</span><span>Score {score}</span><span>Streak {streak}</span><span>Correct {correct}</span><span>Missed {missed}</span><span>Bank {precalcCardCount.toLocaleString()}</span></div>
          <article className={`precalc-card phase-${phase}`}>
            <p className="precalc-meta">{lesson.chapter} • {phase === 'teach' ? 'Concept' : phase === 'example' ? 'Worked Example' : phase === 'complete' ? 'Complete' : 'Locked Practice'}</p>
            {phase === 'teach' && <><h3>{lesson.title}</h3><p className="lesson-text"><MathText>{teachFor(lesson)}</MathText></p><p className="lesson-note">Press Study Example when the concept is clear.</p></>}
            {phase === 'example' && <><h3>Worked Example</h3><p className="lesson-text worked"><MathText>{exampleFor(lesson)}</MathText></p><p className="lesson-note">Next you must answer correctly to unlock the following section.</p></>}
            {phase === 'complete' && <><h3>Course Complete</h3><p className="lesson-text">You cleared every section. Use Retry Practice for weak review.</p></>}
            {phase === 'practice' && <><h3><MathText>{current?.question || 'Practice loading...'}</MathText></h3><div className="precalc-answers">{choices.map(choice => <button disabled={Boolean(picked)} className={['precalc-answer', choice === current?.a && picked ? 'correct' : '', picked === choice && choice !== current?.a ? 'wrong' : ''].filter(Boolean).join(' ')} key={choice} onClick={() => choose(choice)} type="button"><MathText>{choice}</MathText></button>)}</div>{explainAgain && <p className="lesson-text worked"><MathText>{explainAgain}</MathText></p>}</>}
          </article>
          <p className={`message ${messageType}`.trim()}>{message}</p>
        </div>
      </div>
    </section>
  );
}
