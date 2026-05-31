import SudokuGame from './games/SudokuGame.jsx';
import PatternDrill from './games/PatternDrill.jsx';
import CartoonCrossword from './games/CartoonCrossword.jsx';
import TriviaCards from './games/TriviaCards.jsx';
import GuessThatQuote from './games/GuessThatQuote.jsx';

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero panel">
        <p className="eyebrow">Paper // Ink // Focus</p>
        <h1>Sudoku 115</h1>
        <p className="tagline">
          A black and white paper puzzle table built for clean thinking, memory,
          trivia, mistakes, quotes, and replay.
        </p>
      </section>

      <SudokuGame />

      <section className="pattern-panel panel game-stack" aria-label="Bottom game modes">
        <PatternDrill />
        <CartoonCrossword />
        <TriviaCards />
        <GuessThatQuote />
      </section>
    </main>
  );
}
