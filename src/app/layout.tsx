import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fagbo Kehinde Omolola — Product Engineer & AI Builder",
  description:
    "Personal portfolio of Fagbo Kehinde Omolola — product engineer, AI builder, technical writer, and founder of Provly. Open to remote roles worldwide.",
};

const fontsHref =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={fontsHref} rel="stylesheet" />
      </head>
      <body>
        {children}
        {/* ChatWidget goes here once built in Phase 3 — see AGENTS.md phase build order */}
      </body>
    </html>
  );
}