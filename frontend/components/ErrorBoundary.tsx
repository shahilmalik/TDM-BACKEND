import React from "react";

interface State {
  hasError: boolean;
  error?: Error | null;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  State
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("Uncaught error in component tree:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-xl w-full text-center">
            <h2 className="text-2xl font-bold mb-2 text-slate-800">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              An unexpected error occurred while rendering the app. Check the
              console for details.
            </p>
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 bg-[#6C5CE7] text-white rounded-lg"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
