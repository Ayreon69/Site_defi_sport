import { DashboardClient } from "@/components/dashboard-client";
import { ErrorBoundary } from "@/components/error-boundary";
import { getAllRows, getPeople } from "@/lib/data";

export default function HomePage() {
  try {
    const rows = getAllRows();
    const people = getPeople(rows);
    return (
      <ErrorBoundary>
        <DashboardClient rows={rows} people={people} />
      </ErrorBoundary>
    );
  } catch {
    return (
      <div className="container-shell flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">Données inaccessibles</h2>
        <p className="text-sm text-muted">
          Impossible de charger les données du tableau de bord. Vérifiez que le fichier de données est présent.
        </p>
      </div>
    );
  }
}
