import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 border border-red-200">
            <h1 className="text-xl font-bold text-red-600 mb-2">Erro de Aplicação</h1>
            <p className="text-slate-600 mb-4">Ocorreu um erro inesperado que impediu o carregamento da aplicação.</p>
            <pre className="bg-slate-100 p-3 rounded text-xs overflow-auto font-mono text-slate-700 mb-4">
              {this.state.error?.message || "Erro desconhecido"}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);