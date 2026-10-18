import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Catches render-time crashes so a single bad component cannot leave the
// user with a blank white screen. User data lives in localStorage, so a
// reload is always safe here.
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('MangaTracker crashed:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Something went wrong</h1>
            <p className="text-sm text-gray-400">
              MangaTracker hit an unexpected error. Your library is stored locally, so nothing is lost.
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
