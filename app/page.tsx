import { DashboardClient } from "@/components/dashboard-client";
import { getAllRows, getPeople } from "@/lib/data";

export default function HomePage() {
  const rows = getAllRows();
  const people = getPeople(rows);

  return <DashboardClient rows={rows} people={people} />;
}
