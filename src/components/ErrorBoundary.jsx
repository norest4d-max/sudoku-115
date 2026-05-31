import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unknown render error'
    };
  }

  componentDidCatch(error, info) {
    console.error(`Game module failed: ${this.props.name || 'Unknown module'}`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel game-error" role="alert">
          <p className="eyebrow">Module Recovery</p>
          <h2>{this.props.name || 'Game'} paused</h2>
          <p>This game hit an error, but the rest of Sudoku 115 is still running.</p>
          <p className="message bad">{this.state.errorMessage}</p>
          <button type="button" onClick={() => this.setState({ hasError: false, errorMessage: '' })}>
            Try Loading Again
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
