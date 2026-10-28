import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KiddoWorld | Learn, Type, Play, Grow",
  description: "Explore a magical learning world, practise typing, and discover English, games, and rewards for young learners.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
