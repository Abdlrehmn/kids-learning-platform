import type { Metadata } from "next";
import GameHub from "@/components/games/GameHub";
import "./games.css";
import "../english/english.css";
import "../english/dashboard.css";
import "./gamesWorld.css";

export const metadata: Metadata = {
  title: "Games World | KiddoWorld",
  description: "Play 46 colorful word, math, memory, puzzle, logic, and challenge games in KiddoWorld.",
};

export default function GamesPage() {
  return <GameHub />;
}
