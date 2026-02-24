"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-shell flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">Une erreur est survenue</h2>
          <p className="text-sm text-muted">{this.state.error?.message ?? "Erreur inconnue."}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg bg-accent px-4 py-2 text-sm text-white"
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
