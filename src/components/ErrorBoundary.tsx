import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-slate-800 border border-red-500/30 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">⚠️</span>
              <div>
                <h2 className="text-xl font-bold text-red-400">Application Error</h2>
                <p className="text-sm text-slate-400">Something went wrong while rendering this component.</p>
              </div>
            </div>
            
            <div className="bg-slate-950/80 border border-slate-700/50 rounded-xl p-4 font-mono text-xs overflow-auto max-h-[180px] text-red-300">
              <strong>Error:</strong> {this.state.error?.toString()}
            </div>

            {this.state.errorInfo && (
              <div className="bg-slate-950/80 border border-slate-700/50 rounded-xl p-4 font-mono text-xs overflow-auto max-h-[250px] text-slate-400">
                <strong>Component Stack:</strong>
                <pre className="mt-2 whitespace-pre-wrap leading-relaxed">{this.state.errorInfo.componentStack}</pre>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
