import SudokuGame from './games/SudokuGame.jsx';
import PatternDrill from './games/PatternDrill.jsx';
import CartoonCrossword from './games/CartoonCrossword.jsx';
import TriviaCards from './games/TriviaCards.jsx';
import GuessThatQuote from './games/GuessThatQuote.jsx';
import PrecalculusTrainer from './games/PrecalculusTrainer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero panel">
        <p className="eyebrow">Paper // Ink // Focus</p>
        <h1>Sudoku 115</h1>
        <p className="tagline">
          A black and white paper puzzle table built for clean thinking, memory,
          trivia, mistakes, quotes, math, and replay.
        </p>
      </section>

      <ErrorBoundary name="Sudoku">
        <SudokuGame />
      </ErrorBoundary>

      <section className="pattern-panel panel game-stack" aria-label="Bottom game modes">
        <ErrorBoundary name="Pattern Drill"><PatternDrill /></ErrorBoundary>
        <ErrorBoundary name="Cartoon Crossword"><CartoonCrossword /></ErrorBoundary>
        <ErrorBoundary name="Trivia Cards"><TriviaCards /></ErrorBoundary>
        <ErrorBoundary name="Quote Stack"><GuessThatQuote /></ErrorBoundary>
        <ErrorBoundary name="Precalculus Trainer"><PrecalculusTrainer /></ErrorBoundary>
      </section>
    </main>
  );
}
