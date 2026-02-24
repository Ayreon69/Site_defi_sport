"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-shell flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="font-display text-2xl font-semibold text-ink">Une erreur est survenue</h2>
      <p className="text-sm text-muted">
        {error.message || "Une erreur inattendue s'est produite."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-accent px-4 py-2 text-sm text-white"
      >
        Réessayer
      </button>
    </div>
  );
}
