import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InternalHub - Internal apps, zero security headaches",
  description: "Deploy AI-generated tools for your team. Drag, drop, done. Only your coworkers can access—secured by Google Workspace.",
  openGraph: {
    title: "InternalHub - Internal apps, zero security headaches",
    description: "Deploy AI-generated tools for your team. Drag, drop, done. Only your coworkers can access—secured by Google Workspace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
