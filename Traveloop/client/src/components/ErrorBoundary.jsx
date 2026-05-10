import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Traveloop Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Oops! Something went sideways</h2>
          <p className="text-slate-400 max-w-md font-medium leading-relaxed">
            Our engines hit a small bump. Don't worry, your data is safe. Try refreshing or going back.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary px-10 py-3 text-sm"
          >
            Refresh Adventure
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
