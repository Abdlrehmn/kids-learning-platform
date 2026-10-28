import type { Metadata } from "next";
import EnglishWorld from "@/components/english/EnglishWorld";
import "./english.css";

export const metadata: Metadata = {
  title: "English World | KiddoWorld",
  description: "Explore vocabulary, stories, grammar, listening, speaking, and sentence games in English World.",
};

export default function EnglishPage() {
  return <EnglishWorld />;
}
