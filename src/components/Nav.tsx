import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { Avatar } from "@/components/Avatar";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-ink/70 no-underline transition hover:bg-white hover:text-ink"
    >
      {children}
    </Link>
  );
}

export async function Nav() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href={user ? "/feed" : "/"} className="no-underline">
          <span className="text-lg font-black tracking-tight">
            checked<span className="text-accent">Out</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {user ? (
            <>
              <NavLink href="/feed">Feed</NavLink>
              <NavLink href="/spaces">Spaces</NavLink>
              <Link href="/compose" className="btn-accent ml-1">
                Post something real
              </Link>
              <Link
                href={`/u/${user.handle}`}
                className="ml-1 no-underline"
                title="Your profile"
              >
                <Avatar
                  label={user.name}
                  seed={user.avatarColor ?? user.handle}
                  size={32}
                />
              </Link>
              <form action={signOut}>
                <button className="btn-ghost px-3 py-1.5 text-xs">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <NavLink href="/spaces">Spaces</NavLink>
              <NavLink href="/sign-in">Sign in</NavLink>
              <Link href="/sign-up" className="btn-primary">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
