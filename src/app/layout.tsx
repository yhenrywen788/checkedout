import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "checkedOut — real work, real talk",
  description:
    "A work-focused network about real accomplishments and honest conversation. Accomplishments over productivity, real talk over a curated image.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="py-6">{children}</main>
        <footer className="mt-10 border-t border-line py-8 text-center text-xs text-muted">
          checkedOut · accomplishments over productivity · real talk over a
          curated image
        </footer>
      </body>
    </html>
  );
}
