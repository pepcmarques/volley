import Link from "next/link";
import { ArrowRight, ShieldCheck, TrendingUp, Users } from "lucide-react";
import Image from "next/image";


export default function LandingPage() {
  return (
    <main className="bg-[#f4f1e9] text-[#18302b] min-h-screen">
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

          </div>

          <div className="rounded-[28px] border border-[#cbd5c8] bg-[#fbfaf5] p-4 shadow-[0_20px_50px_rgba(24,48,43,0.08)] sm:p-6">
            <div className="rounded-[22px] border border-[#d6ddd1] bg-[#eef3eb] p-5">
              <div className="flex items-center justify-center gap-4 border-[#d6ddd1] pb-4">
                <Image 
                  src="/volleyball.jpg"
                  alt="Volleyball"
                  width={300}
                  height={140}
                  className="rounded-full object-cover"
                  loading="eager"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
