import type { Metadata } from "next";
import GameHub from "@/components/games/GameHub";
import "./games.css";
import "../english/english.css";
import "../english/dashboard.css";

export const metadata: Metadata = {
  title: "Games World | KiddoWorld",
  description: "Play colorful word, memory, puzzle, logic, and math games in KiddoWorld.",
};

export default function GamesPage() {
  return <GameHub />;
}
