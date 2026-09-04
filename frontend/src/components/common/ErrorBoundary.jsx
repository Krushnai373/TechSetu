import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("TechSetu Component Error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    localStorage.removeItem("techsetu_active_user");
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0f1d] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-black">Something went wrong</h2>
          <p className="text-sm text-slate-400 max-w-md">
            The application encountered a display glitch. Click below to reload and restore normal classroom mode.
          </p>

          {/* Detailed Error Box for immediate identification */}
          {this.state.error && (
            <div className="max-w-2xl w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-4 text-left font-mono text-xs text-rose-300 overflow-x-auto space-y-2">
              <div className="font-bold text-rose-400">Error: {this.state.error.toString()}</div>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[11px] text-slate-400 overflow-x-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm flex items-center gap-2 hover:brightness-110 shadow-lg shadow-orange-500/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset & Reload Classroom</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
