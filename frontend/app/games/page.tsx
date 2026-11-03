import type { Metadata } from "next";
import GameHub from "@/components/games/GameHub";
import "./games.css";
import "../english/english.css";
import "../english/dashboard.css";

export const metadata: Metadata = {
  title: "Learning Games | KiddoWorld",
  description: "Play vocabulary, grammar, spelling, listening, and story games in KiddoWorld.",
};

export default function GamesPage() {
  return <GameHub />;
}
