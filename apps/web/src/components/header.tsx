import { UserButton } from "@stackframe/stack"
import Link from "next/link"
import { ThemeMenu } from "./theme-menu"

export default function Header() {
  const links = [
    { to: "/", label: "home" },
    { to: "/demo1", label: "demo1" },
  ] as const

  return (
    <div className="fixed inset-x-0 flex items-center justify-between px-2 py-1">
      <nav className="flex gap-4 p-1 font-mono text-xs">
        {links.map(({ to, label }) => (
          <Link href={to} key={to}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <ThemeMenu />
        <UserButton />
      </div>
    </div>
  )
}
