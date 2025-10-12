"use client"

import Link from "next/link"

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/demo1", label: "Demo_1" },
  ] as const

  return (
    <div className="flex justify-between">
      <nav className="flex gap-4 p-1 font-mono text-xs">
        {links.map(({ to, label }) => (
          <Link href={to} key={to}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
