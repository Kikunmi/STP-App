import React from 'react';
import PropTypes from 'prop-types';

/**
 * Catches rendering errors in the child tree and shows a fallback UI
 * instead of a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 hero-bg">
          <div className="glass card-base max-w-md text-center flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-slate-600">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={this.handleReset}
              className="btn-base bg-gradient-to-r from-[var(--color-primary)] to-[#7C3AED] text-white px-6 py-2"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};
