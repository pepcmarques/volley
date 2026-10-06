import { readFile } from "node:fs/promises";
import Papa from "papaparse";
import { authenticateStats, isStatsAuthenticated } from "./actions";
import StatsDashboard, { type StatRow } from "./dashboard";

async function readSampleRows(): Promise<StatRow[]> {
  const csv = await readFile(`${process.cwd()}/data/volleyball-stats.csv`, "utf8");
  const result = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });

  return result.data
    .map((row) => ({
      player: row.player?.trim() ?? "",
      playerNumber: Number(row.player_number) || 0,
      gameNumber: row.game_number?.trim() ?? "",
      versus: row.versus?.trim() ?? "",
      game: [row.game_number, row.versus]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" - "),
      set: row.set?.trim() ?? "",
      ace: Number(row.ace) || 0,
      in: Number(row.in) || 0,
      miss: Number(row.miss) || 0,
    }))
    .filter((row) => row.player && row.game && row.set);
}

export default async function StatsPage({ searchParams }: PageProps<"/stats">) {
  const authenticated = await isStatsAuthenticated();
  const error = (await searchParams).error;

  if (!authenticated) {
    return (
      <div className="planner-page">
        <form action={authenticateStats} className="w-full mx-auto max-w-sm rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Volleyball analytics</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Private statistics</h1>
          <p className="mt-2 text-sm text-slate-600">Enter the password to view the team statistics.</p>
          {error === "invalid-password" && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              The password is incorrect or has not been configured.
            </p>
          )}
          <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            id="password"
            name="password"
            type="password"
            required
            autoFocus
          />
          <button
            className="mt-5 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            type="submit"
          >
            Unlock statistics
          </button>
        </form>
      </div>
    );
  }

  const sampleRows = await readSampleRows();
  return <StatsDashboard initialRows={sampleRows} />;
}
