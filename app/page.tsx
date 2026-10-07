import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, TrendingUp, Users } from "lucide-react";

const featureCards = [
  {
    icon: Users,
    title: "Player-focused planning",
    description: "Build rotations around your roster and keep every player in the right phase of the game.",
  },
  {
    icon: TrendingUp,
    title: "Live match insight",
    description: "Track momentum, identify patterns, and compare key moments without losing context.",
  },
  {
    icon: ShieldCheck,
    title: "Clear decision support",
    description: "Translate complex movement into simple, actionable coaching cues before the next set.",
  },
];

const stats = [
  { value: "12", label: "systems mapped" },
  { value: "4", label: "rotation phases" },
  { value: "100%", label: "team visibility" },
];

export default function LandingPage() {
  return (
    <main className="bg-[#f4f1e9] text-[#18302b]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#648078]">
              Volleyball coaching system
            </p>
            <h1 className="max-w-xl text-5xl font-medium leading-[0.94] tracking-[-0.06em] text-[#18302b] sm:text-6xl lg:text-7xl">
              Make every rotation count.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#456158]">
              Prepare smarter match plans, understand your lineup in motion, and turn player data into confident
              decisions on the court.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/rotation"
                className="inline-flex items-center gap-2 rounded-full bg-[#18302b] px-5 py-3 text-sm font-semibold text-[#f9f7f2] transition hover:bg-[#23433b]"
              >
                Open rotation planner
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/stats"
                className="inline-flex items-center gap-2 rounded-full border border-[#cbd5c8] bg-[#fbfaf5] px-5 py-3 text-sm font-semibold text-[#18302b] transition hover:bg-[#e8eee4]"
              >
                Review team stats
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[#d6ddd1] bg-[#fbfaf5] p-4">
                  <div className="text-2xl font-semibold text-[#18302b]">{stat.value}</div>
                  <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#648078]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#cbd5c8] bg-[#fbfaf5] p-4 shadow-[0_20px_50px_rgba(24,48,43,0.08)] sm:p-6">
            <div className="rounded-[22px] border border-[#d6ddd1] bg-[#eef3eb] p-5">
              <div className="flex items-center justify-between gap-4 border-b border-[#d6ddd1] pb-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#648078]">
                    Match overview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#18302b]">Rotation plan</h2>
                </div>
                <div className="rounded-full border border-[#cbd5c8] bg-[#f8f7f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#456158]">
                  Set 3
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-[#cbd5c8] bg-[#fbfaf5] p-4">
                  <div className="flex items-center justify-between text-sm text-[#456158]">
                    <span>Current sequence</span>
                    <span className="font-semibold text-[#18302b]">2-1-5</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#648078]">
                    {"234".split("").map((item) => (
                      <div key={item} className="rounded-xl border border-[#d6ddd1] bg-[#eef3eb] p-3 text-[#18302b]">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#18302b] p-4 text-[#f9f7f2]">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#a9c0ba]">Efficiency</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-3xl font-semibold">87%</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#d6ddd1] bg-[#f8f7f2] p-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#648078]">Focus</p>
                    <div className="mt-2 flex items-center gap-2 text-xl font-semibold text-[#18302b]">
                      <BarChart3 className="h-5 w-5 text-[#18a999]" />
                      Tempo control
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d6ddd1] bg-[#f8f7f2] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#648078]">Key notes</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-[#18a999]" />
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-[#456158]">
                    <li>• Libero remains in the serving pattern for all late rotations.</li>
                    <li>• Right-side hitter should attack on the second tempo.</li>
                    <li>• Block coverage is stable if the setter delays the set by one beat.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-[24px] border border-[#d6ddd1] bg-[#fbfaf5] p-6 shadow-[0_14px_35px_rgba(24,48,43,0.04)]"
            >
              <div className="mb-4 inline-flex rounded-full bg-[#e8eee4] p-3 text-[#18302b]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-[#18302b]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#456158]">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
