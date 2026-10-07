import { redirect } from "next/navigation";
import { authenticateStats, getStatsSessionToken } from "./actions";
import StatsDashboard, { type StatRow } from "./dashboard";

const backendUrl = process.env.BACKEND_URL;

export const dynamic = "force-dynamic";

function getString(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (typeof row[key] === "string") return row[key].trim();
    if (typeof row[key] === "number") return String(row[key]);
  }

  return "";
}

function getNumber(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = Number(row[key]);
    if (Number.isFinite(value)) return value;
  }

  return 0;
}

function getRows(body: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(body)) return body.filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null);
  if (typeof body !== "object" || body === null) return null;

  const response = body as { data?: unknown; stats?: unknown };
  const data = response.stats ?? response.data;
  return Array.isArray(data)
    ? data.filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    : null;
}

function normalizeRows(body: unknown): StatRow[] | null {
  const rows = getRows(body);
  if (!rows) return null;

  return rows
    .map((row) => {
      const gameNumber = getString(row, "game_number", "gameNumber");
      const versus = getString(row, "versus", "opponent");
      const player = getString(row, "player", "player_name", "playerName") || "Team total";
      const set = getString(row, "set", "set_number", "setNumber") || "All";
      return {
        player,
        playerNumber: getNumber(row, "player_number", "playerNumber"),
        gameNumber,
        versus,
        game: [gameNumber, versus].filter(Boolean).join(" - "),
        set,
        ace: getNumber(row, "ace"),
        in: getNumber(row, "in"),
        miss: getNumber(row, "miss"),
      };
    })
    .filter((row) => row.player && row.game && row.set);
}

async function readStatsRows(token: string): Promise<StatRow[] | null> {
  let response: Response;

  try {
    response = await fetch(`${backendUrl}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

  } catch {
    return null;
  }

  if (response.status === 401) {
    redirect("/stats?error=session-expired");
  }
  if (!response.ok) return null;

  try {
    return normalizeRows(await response.json());
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return null;
  }
}

export default async function StatsPage({ searchParams }: PageProps<"/stats">) {
  const error = (await searchParams).error;
  const token = await getStatsSessionToken();

  if (!token || error === "session-expired") {
    return (
      <div className="planner-page">
        <form action={authenticateStats} className="w-full mx-auto max-w-sm rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Volleyball analytics</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Private statistics</h1>
          <p className="mt-2 text-sm text-slate-600">Enter the password to view the team statistics.</p>
          {error === "invalid-password" && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              The role or password is incorrect.
            </p>
          )}
          {error === "invalid-input" && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              Choose a role and enter your password.
            </p>
          )}
          {error === "session-expired" && (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
              Your session expired. Please log in again.
            </p>
          )}
          {error === "backend-unavailable" && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              The login service is unavailable. Please try again.
            </p>
          )}
          {error === "backend-error" && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              The login service returned an unexpected response. Please try again.
            </p>
          )}
          {error === "logout-failed" && (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert">
              You were signed out of this browser, but the login service could not confirm the logout.
            </p>
          )}
          <fieldset className="mt-5">
            <legend className="block text-sm font-medium text-slate-700">Access type</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {[
                { id: "staff", label: "Staff" },
                { id: "player", label: "Player" },
              ].map((option) => (
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition has-checked:border-blue-600 has-checked:bg-blue-50 has-checked:text-blue-700"
                  key={option.id}
                >
                  <input
                    className="h-4 w-4 accent-blue-600"
                    name="role"
                    type="radio"
                    value={option.id}
                    required
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
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

  const rows = await readStatsRows(token);

  if (!rows) {
    return (
      <div className="planner-page">
        <p className="mx-auto max-w-xl rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          The statistics service returned an invalid or unavailable response. Please log in again and try again.
        </p>
      </div>
    );
  }

  return <StatsDashboard initialRows={rows} />;
}
