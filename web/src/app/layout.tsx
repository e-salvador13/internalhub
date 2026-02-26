import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InternalHub - Host & Share AI Apps",
  description: "Upload your AI-generated tools, get a shareable link. Password protected.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
