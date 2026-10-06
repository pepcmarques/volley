import Link from "next/link";
import Image from "next/image";

const navigation = [
  { href: "/", label: "Rotation planner" },
  { href: "/stats", label: "Team stats" },
];

export default function Header() {
  return (
    <header className="mx-auto w-full max-w-295 border-b border-[#cbd5c8] bg-[#fbfaf5]">
      <div className="flex items-center justify-between gap-6 px-5 py-4 sm:px-8">
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
        <nav aria-label="Primary navigation" className="flex items-center gap-1 overflow-x-auto text-sm text-[#456158]">
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
      </div>
    </header>
  );
}
