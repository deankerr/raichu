export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-svh overflow-hidden bg-black/50 p-1.5">
      <div className="flex flex-1 overflow-hidden rounded-md border bg-background">{children}</div>
    </div>
  )
}
