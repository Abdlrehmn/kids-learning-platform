import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EnglishAdventure } from "@/components/english/EnglishWorld";
import { englishCategories, type EnglishCategoryId } from "@/components/english/englishContent";

type AdventurePageProps = {
  params: Promise<{ adventure: string }>;
  searchParams: Promise<{ activity?: string | string[] }>;
};

function categoryFor(value: string) {
  return englishCategories.find((category) => category.id === value);
}

export function generateStaticParams() {
  return englishCategories.map((category) => ({ adventure: category.id }));
}

export async function generateMetadata({ params }: AdventurePageProps): Promise<Metadata> {
  const { adventure } = await params;
  const category = categoryFor(adventure);
  if (!category) return { title: "Adventure not found | English World" };
  return {
    title: `${category.title} | English World`,
    description: `${category.subtitle}. Play a friendly English learning activity in KiddoWorld.`,
  };
}

async function EnglishAdventureResolvedRoute({ params, searchParams }: AdventurePageProps) {
  const [{ adventure }, query] = await Promise.all([params, searchParams]);
  const category = categoryFor(adventure);
  if (!category) notFound();
  const requestedActivity = Array.isArray(query.activity) ? query.activity[0] : query.activity;

  return <EnglishAdventure key={`${category.id}:${requestedActivity ?? ""}`} adventure={category.id as EnglishCategoryId} initialActivityId={requestedActivity} />;
}

export default function EnglishAdventureRoute(props: AdventurePageProps) {
  return (
    <Suspense fallback={<main className="ew-adventure-loading"><p>Opening your adventure…</p></main>}>
      <EnglishAdventureResolvedRoute {...props} />
    </Suspense>
  );
}
