"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, RefreshCw, Target, Trophy, Users, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type StatRow = {
  player: string;
  playerNumber: number;
  gameNumber: string;
  versus: string;
  game: string;
  set: string;
  ace: number;
  in: number;
  miss: number;
};

type PlayerAggregationMode = "all" | "game" | "set";

const COLORS = ["#2563eb", "#10b981", "#f59e0b"];

function formatSetTick(value: string) {
  const match = value.match(/^(?:Game )?(\d+).*· Set (\d+)$/);
  return match ? `G${match[1]} / S${match[2]}` : value;
}

function formatGameTick(value: string) {
  const match = value.match(/^(?:Game )?(\d+)$/);
  return match ? `Game ${match[1]}` : value;
}

export default function StatsDashboard({ initialRows }: { initialRows: StatRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [playerFilter, setPlayerFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [aggregationMode, setAggregationMode] = useState<"game" | "set">("game");
  const [playerAggregationMode, setPlayerAggregationMode] = useState<PlayerAggregationMode>("all");

  const players = useMemo(() => [...new Set(rows.map((row) => row.player))].sort(), [rows]);
  const games = useMemo(() => {
    const opponentsByGame = new Map<string, Set<string>>();
    rows.forEach((row) => {
      const opponents = opponentsByGame.get(row.gameNumber) ?? new Set<string>();
      if (row.versus) opponents.add(row.versus);
      opponentsByGame.set(row.gameNumber, opponents);
    });

    return [...opponentsByGame.entries()]
      .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
      .map(([gameNumber, opponents]) => ({
        gameNumber,
        label: [formatGameTick(gameNumber), ...opponents].join(" - "),
      }));
  }, [rows]);
  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          (playerFilter === "all" || row.player === playerFilter) &&
          (gameFilter === "all" || row.gameNumber === gameFilter),
      ),
    [rows, playerFilter, gameFilter],
  );
  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, row) => ({
          ace: acc.ace + row.ace,
          in: acc.in + row.in,
          miss: acc.miss + row.miss,
        }),
        { ace: 0, in: 0, miss: 0 },
      ),
    [filtered],
  );
  const playerChart = useMemo(() => {
    const map = new Map<string, { label: string; ace: number; in: number; miss: number }>();
    filtered.forEach((row) => {
      const mode = playerFilter === "all" ? "all" : playerAggregationMode;
      const label =
        mode === "all" ? row.player : mode === "game" ? row.gameNumber : `${row.gameNumber} · Set ${row.set}`;
      const item = map.get(label) ?? { label, ace: 0, in: 0, miss: 0 };
      item.ace += row.ace;
      item.in += row.in;
      item.miss += row.miss;
      map.set(label, item);
    });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [filtered, playerFilter, playerAggregationMode]);
  const outcomeTrend = useMemo(() => {
    const map = new Map<string, { label: string; ace: number; in: number; miss: number }>();
    filtered.forEach((row) => {
      const label = aggregationMode === "game" ? row.gameNumber : `${row.gameNumber} · Set ${row.set}`;
      const item = map.get(label) ?? { label, ace: 0, in: 0, miss: 0 };
      item.ace += row.ace;
      item.in += row.in;
      item.miss += row.miss;
      map.set(label, item);
    });
    return [...map.values()];
  }, [filtered, aggregationMode]);
  const outcomeChart = [
    { name: "Aces", value: totals.ace },
    { name: "In", value: totals.in },
    { name: "Misses", value: totals.miss },
  ];

  function resetSample() {
    setRows(initialRows);
    setPlayerFilter("all");
    setGameFilter("all");
    setAggregationMode("game");
    setPlayerAggregationMode("all");
  }

  return (
    <div className="planner-page">
      <div className="mb-5 flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current data</p>
          <p className="mt-1 text-xs text-slate-500">{rows.length} records loaded</p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:min-w-90 sm:grid-cols-3 sm:items-end sm:w-auto">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Player</label>
            <Select
              value={playerFilter}
              onValueChange={(value) => {
                setPlayerFilter(value);
                setPlayerAggregationMode("all");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All players</SelectItem>
                {players.map((player) => (
                  <SelectItem key={player} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Game</label>
            <Select
              value={gameFilter}
              onValueChange={(value) => {
                setGameFilter(value);
                setAggregationMode(value === "all" ? "game" : "set");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All games</SelectItem>
                {games.map((game) => (
                  <SelectItem key={game.gameNumber} value={game.gameNumber}>
                    {game.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="h-10 w-full" variant="outline" onClick={resetSample}>
              <RefreshCw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </div>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Aces"
          value={totals.ace}
          subtitle="Direct points from serve"
          icon={<Trophy className="h-5 w-5" />}
        />
        <MetricCard
          title="Serves in"
          value={totals.in}
          subtitle="Successful serves"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <MetricCard
          title="Misses"
          value={totals.miss}
          subtitle="Serving errors"
          icon={<XCircle className="h-5 w-5" />}
        />
        <MetricCard
          title="Players"
          value={new Set(filtered.map((row) => row.player)).size}
          subtitle="In the current selection"
          icon={<Users className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Serve outcomes by player</CardTitle>
              <CardDescription>
                {playerFilter === "all"
                  ? "Compare total aces, serves in, and misses for each player."
                  : "Compare this player across all games, games, or sets."}
              </CardDescription>
            </div>
            {playerFilter !== "all" && (
              <div className="flex shrink-0 gap-1" aria-label="Player aggregation level" role="group">
                {(["all", "game", "set"] as PlayerAggregationMode[]).map((mode) => (
                  <Button
                    key={mode}
                    aria-pressed={playerAggregationMode === mode}
                    variant={playerAggregationMode === mode ? "default" : "outline"}
                    onClick={() => setPlayerAggregationMode(mode)}
                  >
                    {mode === "all" ? "All Games" : mode === "game" ? "Per Game" : "Per Set"}
                  </Button>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="h-77.5 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playerChart} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={playerFilter !== "all" && playerAggregationMode === "set" ? -35 : 0}
                    textAnchor={playerFilter !== "all" && playerAggregationMode === "set" ? "end" : "middle"}
                    height={playerFilter !== "all" && playerAggregationMode === "set" ? 70 : 30}
                    tickFormatter={
                      playerFilter !== "all" && playerAggregationMode === "set"
                        ? formatSetTick
                        : playerFilter !== "all" && playerAggregationMode === "game"
                          ? formatGameTick
                          : undefined
                    }
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ace" name="Aces" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="in" name="In" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="miss" name="Misses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Serve outcomes</CardTitle>
              <CardDescription>Track how the team performed across games and sets.</CardDescription>
            </div>
            <div className="flex shrink-0 gap-1" aria-label="Aggregation level" role="group">
              <Button
                aria-pressed={aggregationMode === "game"}
                variant={aggregationMode === "game" ? "default" : "outline"}
                onClick={() => setAggregationMode("game")}
              >
                Game
              </Button>
              <Button
                aria-pressed={aggregationMode === "set"}
                variant={aggregationMode === "set" ? "default" : "outline"}
                onClick={() => setAggregationMode("set")}
              >
                Set
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-77.5 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={outcomeTrend} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    interval={aggregationMode === "set" ? 0 : "preserveStartEnd"}
                    angle={aggregationMode === "set" ? -35 : 0}
                    textAnchor={aggregationMode === "set" ? "end" : "middle"}
                    height={aggregationMode === "set" ? 70 : 30}
                    tickFormatter={aggregationMode === "set" ? formatSetTick : formatGameTick}
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ace" name="Aces" stroke="#2563eb" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="in" name="In" stroke="#10b981" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="miss" name="Misses" stroke="#f59e0b" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overall distribution</CardTitle>
            <CardDescription>Share of recorded serving outcomes in the current selection.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-71.25 w-full">
              {totals.ace + totals.in + totals.miss === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No outcomes to display.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomeChart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {outcomeChart.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Player summary</CardTitle>
            <CardDescription>Totals for the selected game and player filters.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-3 pr-3 font-medium">Player</th>
                    <th className="px-2 pb-3 text-right font-medium">Aces</th>
                    <th className="px-2 pb-3 text-right font-medium">In</th>
                    <th className="pb-3 pl-2 text-right font-medium">Miss</th>
                  </tr>
                </thead>
                <tbody>
                  {playerChart.map((player) => (
                    <tr key={player.label} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-3 font-medium">{player.label}</td>
                      <td className="px-2 py-3 text-right tabular-nums">{player.ace}</td>
                      <td className="px-2 py-3 text-right tabular-nums">{player.in}</td>
                      <td className="py-3 pl-2 text-right tabular-nums">{player.miss}</td>
                    </tr>
                  ))}
                  {playerChart.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No rows match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <Target className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Developed by Paulo Marques.
        </p>
      </footer>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">{icon}</div>
      </CardContent>
    </Card>
  );
}
