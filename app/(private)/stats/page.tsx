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
  if (Array.isArray(body))
    return body.filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null);
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
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1e9] px-5 py-12">
        <form
          action={authenticateStats}
          className="w-full max-w-md rounded-[28px] border border-[#cbd5c8] bg-[#fbfaf5] p-6 shadow-[0_20px_50px_rgba(24,48,43,0.08)] sm:p-7"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#648078]">Volleyball analytics</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#18302b]">Private statistics</h1>
          <p className="mt-2 text-sm leading-6 text-[#456158]">Enter the password to view the team statistics.</p>

          {error === "invalid-password" && (
            <p className="mt-4 rounded-xl border border-[#f1b7a5] bg-[#fff4f0] p-3 text-sm text-[#7a4132]" role="alert">
              The role or password is incorrect.
            </p>
          )}
          {error === "invalid-input" && (
            <p className="mt-4 rounded-xl border border-[#f1b7a5] bg-[#fff4f0] p-3 text-sm text-[#7a4132]" role="alert">
              Choose a role and enter your password.
            </p>
          )}
          {error === "session-expired" && (
            <p className="mt-4 rounded-xl border border-[#e7d7a9] bg-[#fbf6e9] p-3 text-sm text-[#6b5a2d]" role="alert">
              Your session expired. Please log in again.
            </p>
          )}
          {error === "backend-unavailable" && (
            <p className="mt-4 rounded-xl border border-[#f1b7a5] bg-[#fff4f0] p-3 text-sm text-[#7a4132]" role="alert">
              The login service is unavailable. Please try again.
            </p>
          )}
          {error === "backend-error" && (
            <p className="mt-4 rounded-xl border border-[#f1b7a5] bg-[#fff4f0] p-3 text-sm text-[#7a4132]" role="alert">
              The login service returned an unexpected response. Please try again.
            </p>
          )}
          {error === "logout-failed" && (
            <p className="mt-4 rounded-xl border border-[#e7d7a9] bg-[#fbf6e9] p-3 text-sm text-[#6b5a2d]" role="alert">
              You were signed out of this browser, but the login service could not confirm the logout.
            </p>
          )}

          <fieldset className="mt-6">
            <legend className="block text-sm font-medium text-[#456158]">Access type</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {[
                { id: "staff", label: "Staff" },
                { id: "player", label: "Player" },
              ].map((option) => (
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#cbd5c8] bg-[#f8f7f2] px-3 py-2.5 text-sm text-[#18302b] transition has-checked:border-[#18302b] has-checked:bg-[#eef3eb]"
                  key={option.id}
                >
                  <input className="h-4 w-4 accent-[#18302b]" name="role" type="radio" value={option.id} required />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 block text-sm font-medium text-[#456158]" htmlFor="password">
            Password
          </label>
          <input
            className="mt-1.5 w-full rounded-xl border border-[#cbd5c8] bg-[#fffdf8] px-3 py-2.5 text-[#18302b] outline-none transition focus:border-[#18302b] focus:ring-2 focus:ring-[#dfe9e3]"
            id="password"
            name="password"
            type="password"
            required
            autoFocus
          />

          <button
            className="mt-6 w-full rounded-full bg-[#18302b] px-4 py-3 text-sm font-semibold text-[#f9f7f2] transition hover:bg-[#24413d]"
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
        <p
          className="mx-auto max-w-xl rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          The statistics service returned an invalid or unavailable response. Please log in again and try again.
        </p>
      </div>
    );
  }

  return <StatsDashboard initialRows={rows} />;
}
