import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-neutral-900 mb-2">
              {this.props.fallbackTitle || 'Application Notice'}
            </h3>
            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              An unexpected interface error was safely intercepted to prevent data loss.
            </p>
            {this.state.error && (
              <div className="bg-neutral-50 rounded p-3 mb-5 text-left border border-neutral-200">
                <p className="text-[11px] font-mono text-red-700 break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-[9px] font-mono text-neutral-500 max-h-36 overflow-auto whitespace-pre-wrap leading-tight">
                    {this.state.error.stack.split("\n").slice(0, 8).join("\n")}
                  </pre>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw size={13} />
                <span>Reload Page</span>
              </button>
              <a
                href="/admin"
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded flex items-center gap-2 transition-colors"
              >
                <Home size={13} />
                <span>Admin Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
