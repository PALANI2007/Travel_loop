import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white p-8 text-center">
          <div className="w-20 h-20 bg-accent-500/10 rounded-full flex items-center justify-center text-accent-500 mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-black mb-4">Something went wrong</h1>
          <p className="text-slate-400 mb-8 max-w-md">
            An unexpected error occurred. We've logged the details and will fix it soon.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black transition-all"
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-black/40 rounded-xl text-left text-xs overflow-auto max-w-full text-red-400">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
