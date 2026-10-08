"use client";

import { logoutStats } from "@/app/(private)/stats/actions";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navigation = [
  { href: "/rotation", label: "Rotation planner" },
  { href: "/stats", label: "Team stats" },
];

type HeaderProps = {
  isLoggedIn: boolean;
};

export default function Header({ isLoggedIn }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-[#cbd5c8] bg-[#fbfaf5]">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-4 py-4 md:grid-cols-3">
          <div className="flex items-center justify-start">
            <Link
              className="flex shrink-0 items-center gap-3 text-sm font-extrabold uppercase tracking-[0.16em] text-[#18302b]"
              href="/"
            >
              <Image
                alt="Coach Paulo"
                className="h-10 w-10 rounded-full object-cover object-[center_30%] ring-1 ring-[#cbd5c8]"
                height={40}
                priority
                src="/CoachPaulo.jpeg"
                width={40}
              />
              <span>Coach Paulo</span>
            </Link>
          </div>

          <div className="flex items-center justify-center">
            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-1 overflow-x-auto text-sm text-[#456158] md:flex"
            >
              {navigation.map((item) => (
                <Link
                  className="whitespace-nowrap px-3 py-2 transition hover:bg-[#e8eee4] hover:text-[#18302b]"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex h-10 w-10 items-center justify-center text-[#18302b] transition hover:bg-[#e8eee4] md:hidden"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center justify-end">
            {isLoggedIn ? (
              <form action={logoutStats}>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-[#cbd5c8] bg-[#18302b] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f9f7f2] transition hover:bg-[#24413d]"
                  type="submit"
                >
                  Logout
                </button>
              </form>
            ) : null}
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="border-t border-[#d6ddd1] px-2 pb-3 pt-2 md:hidden"
          >
            {navigation.map((item) => (
              <Link
                className="block px-3 py-3 text-sm text-[#456158] transition hover:bg-[#e8eee4] hover:text-[#18302b]"
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
