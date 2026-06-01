const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const frac = (n, d) => {
  const g = gcd(n, d);
  const sign = d < 0 ? -1 : 1;
  return `${sign * n / g}/${Math.abs(d / g)}`;
};

function uniqueChoices(correct, distractors) {
  const pool = [correct, ...distractors].map(String);
  const out = [];
  for (const item of pool) if (!out.includes(item)) out.push(item);
  let pad = 1;
  while (out.length < 4) out.push(`${correct} ${pad++}`);
  return out.slice(0, 4);
}

function formatComplex(real, imag) {
  if (imag === 0) return String(real);
  if (real === 0) return imag === 1 ? 'i' : imag === -1 ? '-i' : `${imag}i`;
  const sign = imag > 0 ? '+' : '-';
  const absImag = Math.abs(imag) === 1 ? 'i' : `${Math.abs(imag)}i`;
  return `${real} ${sign} ${absImag}`;
}

function complexAddCard(id, r1, i1, r2, i2) {
  const realSum = r1 + r2;
  const imagSum = i1 + i2;
  const correct = formatComplex(realSum, imagSum);
  const wrong = [
    formatComplex(r1 + i1, r2 + i2),
    formatComplex(r1 - r2, i1 - i2),
    formatComplex(realSum, i1 - i2),
    formatComplex(r1 + i2, i1 + r2)
  ];
  return card(
    id,
    'Complex Numbers',
    3 + Math.min(5, Math.floor((Math.abs(r1) + Math.abs(i1) + Math.abs(r2) + Math.abs(i2)) / 12)),
    `Add complex numbers: (${formatComplex(r1, i1)}) + (${formatComplex(r2, i2)}).`,
    correct,
    wrong,
    `Combine real parts first: ${r1} + ${r2} = ${realSum}. Combine imaginary parts second: ${i1}i + ${i2}i = ${imagSum}i. Final answer: ${correct}.`
  );
}

const TOPICS = [
  'Linear Functions', 'Quadratics', 'Polynomial Features', 'Rational Expressions', 'Exponents',
  'Logarithms', 'Function Transformations', 'Function Composition', 'Inverse Functions',
  'Trigonometry', 'Unit Circle', 'Trig Identities', 'Law of Sines', 'Law of Cosines',
  'Sequences', 'Series', 'Conics', 'Complex Numbers', 'Inequalities', 'Domain and Range'
];

function card(id, topic, level, question, answer, wrong, hint) {
  return {
    id: `precalc-${String(id).padStart(5, '0')}`,
    topic,
    level: Math.max(1, Math.min(10, level)),
    question,
    a: String(answer),
    wrong: uniqueChoices(String(answer), wrong).filter(choice => choice !== String(answer)).slice(0, 3),
    hint,
    explanation: hint
  };
}

function buildCoreCards() {
  const cards = [];
  let id = 1;

  for (let a = -20; a <= 20; a++) {
    if (a === 0) continue;
    for (let b = -20; b <= 20; b++) {
      const level = Math.min(10, 1 + Math.floor(Math.abs(a) / 5) + Math.floor(Math.abs(b) / 10));
      cards.push(card(id++, 'Linear Functions', level, `For f(x) = ${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}, what is f(2)?`, a * 2 + b, [a + b, 2 * b + a, a * 2 - b], `Substitute x = 2: ${a}(2) ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${a * 2 + b}.`));
      cards.push(card(id++, 'Linear Functions', level, `What is the slope of y = ${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}?`, a, [b, -a, a + b], 'Slope-intercept form is y = mx + b, so the coefficient of x is the slope.'));
    }
  }

  for (let h = -25; h <= 24; h++) {
    for (let k = -25; k <= 24; k++) {
      const level = 2 + Math.floor((Math.abs(h) + Math.abs(k)) / 18);
      cards.push(card(id++, 'Quadratics', level, `What is the vertex of y = (x ${h < 0 ? '+' : '-'} ${Math.abs(h)})² ${k >= 0 ? '+' : '-'} ${Math.abs(k)}?`, `(${h}, ${k})`, [`(${-h}, ${k})`, `(${h}, ${-k})`, `(${-h}, ${-k})`], 'Vertex form is y = a(x - h)^2 + k, so the vertex is (h, k).'));
    }
  }

  for (let base = 2; base <= 12; base++) {
    for (let exp = 0; exp <= 9; exp++) {
      cards.push(card(id++, 'Exponents', Math.min(10, exp + 1), `Simplify ${base}^${exp}.`, base ** exp, [base * exp, base + exp, exp === 0 ? 0 : base ** Math.max(0, exp - 1)], 'Repeated multiplication. Any nonzero base to the 0 power is 1.'));
    }
  }

  for (let base = 2; base <= 12; base++) {
    for (let exp = 1; exp <= 8; exp++) {
      const value = base ** exp;
      cards.push(card(id++, 'Logarithms', Math.min(10, exp + 1), `Evaluate log base ${base} of ${value}.`, exp, [base, value, exp + 1], `A logarithm asks which exponent works: ${base}^${exp} = ${value}.`));
    }
  }

  const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
  const sinMap = {0:'0',30:'1/2',45:'√2/2',60:'√3/2',90:'1',120:'√3/2',135:'√2/2',150:'1/2',180:'0',210:'-1/2',225:'-√2/2',240:'-√3/2',270:'-1',300:'-√3/2',315:'-√2/2',330:'-1/2',360:'0'};
  const cosMap = {0:'1',30:'√3/2',45:'√2/2',60:'1/2',90:'0',120:'-1/2',135:'-√2/2',150:'-√3/2',180:'-1',210:'-√3/2',225:'-√2/2',240:'-1/2',270:'0',300:'1/2',315:'√2/2',330:'√3/2',360:'1'};
  for (const deg of angles) {
    cards.push(card(id++, 'Unit Circle', deg % 90 === 0 ? 2 : 4, `What is sin(${deg}°)?`, sinMap[deg], [cosMap[deg], `-${sinMap[deg]}`.replace('--',''), 'undefined'], 'Use the unit circle y-coordinate.'));
    cards.push(card(id++, 'Unit Circle', deg % 90 === 0 ? 2 : 4, `What is cos(${deg}°)?`, cosMap[deg], [sinMap[deg], `-${cosMap[deg]}`.replace('--',''), 'undefined'], 'Use the unit circle x-coordinate.'));
  }

  for (let n = 1; n <= 120; n++) {
    const a1 = (n % 17) - 8;
    const d = (n % 13) - 6 || 3;
    const term = a1 + (n - 1) * d;
    cards.push(card(id++, 'Sequences', Math.min(10, Math.ceil(n / 15)), `Arithmetic sequence: a₁ = ${a1}, d = ${d}. What is a_${n}?`, term, [term + d, a1 + n * d, term - d], 'Use a_n = a1 + (n - 1)d.'));
  }

  for (let r = -12; r <= 12; r++) {
    if (r === 0) continue;
    for (let a1 = -10; a1 <= 10; a1++) {
      if (a1 === 0) continue;
      const n = Math.abs((r * a1) % 6) + 2;
      const term = a1 * (r ** (n - 1));
      cards.push(card(id++, 'Sequences', Math.min(10, Math.abs(r)), `Geometric sequence: a₁ = ${a1}, r = ${r}. What is a_${n}?`, term, [a1 + (n - 1) * r, term * r, term + r], 'Use a_n = a1·r^(n - 1).'));
    }
  }

  for (let r1 = -10; r1 <= 10; r1++) {
    for (let i1 = -10; i1 <= 10; i1++) {
      const r2 = ((r1 * 3 + i1 * 2 + 7) % 21) - 10;
      const i2 = ((i1 * 5 - r1 + 31) % 21) - 10;
      if (i1 === 0 && i2 === 0) continue;
      cards.push(complexAddCard(id++, r1, i1, r2, i2));
    }
  }

  for (let radius = 1; radius <= 80; radius++) {
    const h = (radius % 11) - 5;
    const k = (radius % 13) - 6;
    cards.push(card(id++, 'Conics', Math.min(10, Math.ceil(radius / 10)), `Circle equation: (x - ${h})² + (y - ${k})² = ${radius ** 2}. What is the radius?`, radius, [radius ** 2, Math.abs(h), Math.abs(k)], 'For a circle, r² is on the right side.'));
  }

  for (let a = 1; a <= 50; a++) {
    for (let b = 1; b <= 50; b++) {
      cards.push(card(id++, 'Rational Expressions', Math.min(10, Math.ceil((a + b) / 12)), `Simplify ${a * b}x / ${b}x, assuming x ≠ 0.`, a, [b, a * b, frac(a, b)], 'Cancel common factors including x.'));
    }
  }

  return cards;
}

const CONCEPTS = [
  ['Domain and Range', 'What does domain describe?', 'All allowed x-values', ['All output y-values','The slope only','The y-intercept only'], 1, 'Domain is input.'],
  ['Domain and Range', 'What does range describe?', 'All possible y-values', ['All input x-values','Only zeros','Only asymptotes'], 1, 'Range is output.'],
  ['Function Composition', 'What does (f ∘ g)(x) mean?', 'f(g(x))', ['g(f(x))','f(x)+g(x)','f(x)g(x)'], 2, 'The right function goes inside first.'],
  ['Inverse Functions', 'What must pass the horizontal line test?', 'A one-to-one function', ['Every quadratic','Every relation','Only even functions'], 3, 'Horizontal line test checks inverse as a function.'],
  ['Trig Identities', 'Which identity is always true?', 'sin²x + cos²x = 1', ['sinx + cosx = 1','tan²x + cos²x = 1','secx - tanx = 1'], 3, 'The Pythagorean identity.'],
  ['Trigonometry', 'What is tan(x)?', 'sin(x)/cos(x)', ['cos(x)/sin(x)','1/sin(x)','1/cos(x)'], 2, 'Tangent is sine over cosine.'],
  ['Logarithms', 'What is the inverse of an exponential function?', 'A logarithmic function', ['A quadratic function','A linear function','A reciprocal function'], 2, 'Logs undo exponentials.'],
  ['Polynomial Features', 'What does a zero of a polynomial represent?', 'An x-intercept', ['A y-intercept','A vertical asymptote','The degree'], 2, 'Zeros make y = 0.'],
  ['Inequalities', 'When solving an inequality, when do you flip the sign?', 'When multiplying or dividing by a negative', ['When adding a positive','When subtracting zero','Whenever variables appear'], 2, 'Negative multiplication/division reverses order.'],
  ['Complex Numbers', 'When adding complex numbers, what do you combine first?', 'Real with real and imaginary with imaginary', ['Real with imaginary','Only the coefficients of x','Only the constants'], 2, 'For (a + bi) + (c + di), compute (a + c) + (b + d)i.'],
  ['Function Transformations', 'What does f(x) + k do?', 'Moves the graph up k units', ['Moves right k units','Reflects over x-axis','Compresses horizontally'], 2, 'Outside changes affect vertical movement.']
];

export function buildPrecalcCards() {
  const cards = buildCoreCards();
  let id = cards.length + 1;
  let templateRound = 0;
  while (cards.length < 10000) {
    for (const [topic, question, answer, wrong, level, hint] of CONCEPTS) {
      if (cards.length >= 10000) break;
      const suffix = templateRound % 4 === 0 ? '' : templateRound % 4 === 1 ? ' Choose the exact idea.' : templateRound % 4 === 2 ? ' Memorization check.' : ' Fast recall.';
      cards.push(card(id++, topic, Math.min(10, level + (templateRound % 5)), `${question}${suffix}`, answer, wrong, hint));
    }
    templateRound++;
  }
  return cards.slice(0, 10000);
}

export const precalcTopics = TOPICS;
export const precalcCardCount = 10000;
