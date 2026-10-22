import type { CSSProperties } from "react";
import Link from "next/link";
import HeroPointerMotion from "@/components/HeroPointerMotion";
import LearningZoneIsland from "@/components/3d/LearningZoneIsland";
import PlanetScene from "@/components/3d/PlanetScene";
import RocketRider from "@/components/RocketRider";
import ScrollReveal from "@/components/ScrollReveal";
import SparkleTrail from "@/components/SparkleTrail";
import WorldNavigation from "@/components/WorldNavigation";
import ConfettiLink from "@/components/ConfettiLink";
import HideAndSeekShow from "@/components/HideAndSeekShow";

function BouncyLetters({ text, offset = 0 }: { text: string; offset?: number }) {
  return Array.from(text).map((letter, index) => (
    <span key={`${letter}-${index}`} className="space-title-letter" style={{ "--i": index + offset } as CSSProperties}>
      {letter}
    </span>
  ));
}

function BouncyWords({ words, offset = 0 }: { words: string[]; offset?: number }) {
  return words.map((word, index) => (
    <span key={word} className="space-tagline-word" style={{ "--i": index + offset } as CSSProperties}>
      {word}
    </span>
  ));
}

const learningZones = [
  {
    id: "typing-zone",
    title: "Typing Academy",
    subtitle: "Type · Improve · Achieve",
    description: "Build confident fingers with friendly letter, word, and sentence practice.",
    symbol: "keyboard",
    color: "typing",
    state: "Ready to play",
    href: "/typing",
  },
  {
    id: "english-zone",
    title: "English World",
    subtitle: "Learn · Read · Grow",
    description: "A vocabulary and spelling adventure is being prepared for curious learners.",
    symbol: "book",
    color: "english",
    state: "Coming soon",
    href: null,
  },
  {
    id: "games",
    title: "Fun Games",
    subtitle: "Play · Learn · Win",
    description: "Educational games are on the way. The activities here will be playable soon.",
    symbol: "game",
    color: "games",
    state: "Coming soon",
    href: null,
  },
  {
    id: "rewards",
    title: "Rewards & Progress",
    subtitle: "Celebrate little steps",
    description: "Your practice results are shown during typing sessions; saved rewards are not available yet.",
    symbol: "treasure",
    color: "rewards",
    state: "Coming soon",
    href: null,
  },
] as const;

function ChildOnRocket() {
  return (
    <div className="space-rider-art">
      <RocketRider />
    </div>
  );
}

function BenefitIcon({ kind }: { kind: "book" | "keyboard" | "game" | "trophy" }) {
  const paths = {
    book: <><path d="M6 5.5c3.4-1.2 6.9-.5 10 1.5v11c-3.1-2-6.6-2.7-10-1.5v-11Zm20 0c-3.4-1.2-6.9-.5-10 1.5v11c3.1-2 6.6-2.7 10-1.5v-11Z" /><path d="M10 10c1.5-.3 3 .1 4 1m8-1c-1.5-.3-3 .1-4 1" /></>,
    keyboard: <><rect x="3.5" y="6" width="25" height="16" rx="4" /><path d="M8 10h2m3 0h2m3 0h2m3 0h2M8 14h2m3 0h2m3 0h2m3 0h2M11 18h10" /></>,
    game: <><path d="M9 9h14c4 0 6 4 7 10 .5 4-3 5-5 2l-3-4H11l-3 4c-2 3-5.5 2-5-2 1-6 3-10 6-10Z" /><path d="M10 11v6m-3-3h6m7-1h.1m4 4h.1" /></>,
    trophy: <><path d="M9 5h14v7a7 7 0 0 1-14 0V5Zm7 14v6m-6 3h12m-13-19H4v3a6 6 0 0 0 6 6m12-9h6v3a6 6 0 0 1-6 6" /></>,
  };

  return <svg viewBox="0 0 32 32" aria-hidden="true" className="space-benefit-icon">{paths[kind]}</svg>;
}

function SkyDecor() {
  return (
    <div className="space-sky-decor" aria-hidden="true">
      <span className="space-shooting-star space-shooting-star--one" />
      <span className="space-shooting-star space-shooting-star--two" />
      <span className="space-twinkle space-twinkle--one">✦</span>
      <span className="space-twinkle space-twinkle--two">✧</span>
      <span className="space-twinkle space-twinkle--three">✦</span>
      <span className="space-twinkle space-twinkle--four">✧</span>
      <span className="space-floating-letter space-floating-letter--aa">Aa</span>
      <span className="space-floating-letter space-floating-letter--abc">ABC</span>
      <span className="space-open-book"><span /><span /></span>
      <span className="space-cloud space-cloud--distant" />
      <span className="space-cloud space-cloud--left" data-hide-target="cloud-left" />
      <span className="space-cloud space-cloud--right" data-hide-target="cloud-right" />
      <span className="space-floating-island space-floating-island--left"><i /><b /><em /></span>
      <span className="space-floating-island space-floating-island--right">
        <i /><b /><em />
        <span className="space-island-orbit space-island-orbit--outer" aria-hidden="true" style={{ "--start-angle": "-18deg" } as CSSProperties} />
        <span className="space-island-orbit space-island-orbit--inner" aria-hidden="true" style={{ "--start-angle": "14deg" } as CSSProperties} />
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="space-home" id="home">
      <div className="space-sky" aria-hidden="true" />
      <SkyDecor />
      <SparkleTrail />
      <WorldNavigation active="home" />

      <div className="space-home-content">
        <section className="space-hero" aria-labelledby="space-hero-title">
          <HeroPointerMotion>
            <div className="space-hero-grid">
            <div className="space-hero-rider" data-hide-target="hero-rider"><div className="space-rider-motion"><ChildOnRocket /></div></div>

            <div className="space-hero-copy">
              <p className="space-welcome-ribbon"><span aria-hidden="true">✦</span> Welcome to <b>KiddoWorld</b> <span aria-hidden="true">✦</span></p>
              <h1 id="space-hero-title" aria-label="KiddoWorld"><span className="space-title-kiddo" aria-hidden="true"><BouncyLetters text="Kiddo" /></span><span className="space-title-world" aria-hidden="true"><BouncyLetters text="World" offset={5} /></span></h1>
              <p className="space-hero-tagline">
                <BouncyWords words={["Where", "little", "learners"]} />
                <br />
                <BouncyWords words={["build"]} offset={3} />{" "}
                <strong><BouncyWords words={["big", "dreams!"]} offset={4} /></strong>
              </p>
              <p className="space-hero-description">Learn English, improve your typing skills, and play educational games — all in one amazing adventure!</p>
              <span className="space-start-wrap">
                <ConfettiLink href="/typing" className="space-start-button">
                  <span className="space-button-pulse" aria-hidden="true" />
                  <span>Start Learning</span>
                  <span className="space-button-arrow" aria-hidden="true">→</span>
                </ConfettiLink>
              </span>
              <p className="space-hero-caption">A bright place to learn at your own pace</p>
            </div>

            <div className="space-planet-wrap">
              <span className="space-planet-orbit space-planet-orbit--outer" aria-hidden="true" />
              <span className="space-planet-orbit space-planet-orbit--inner" aria-hidden="true" />
              <span className="space-planet-spark space-planet-spark--one" aria-hidden="true">✦</span>
              <span className="space-planet-spark space-planet-spark--two" aria-hidden="true">✧</span>
              <div className="space-planet-scene"><HideAndSeekShow><PlanetScene /></HideAndSeekShow></div>
              <span className="space-planet-ribbon">Learn <i>·</i> Type <i>·</i> Play</span>
            </div>
            </div>
          </HeroPointerMotion>
        </section>

        <ScrollReveal>
          <section className="space-benefits" data-hide-target="benefit-strip" aria-label="What you can do in KiddoWorld">
            <div className="space-benefit">
              <span className="space-benefit-badge space-benefit-badge--book"><BenefitIcon kind="book" /></span>
              <span><strong>Learn English</strong><small>Vocabulary adventures soon</small></span>
            </div>
            <span className="space-benefit-divider" aria-hidden="true" />
            <div className="space-benefit">
              <span className="space-benefit-badge space-benefit-badge--keyboard"><BenefitIcon kind="keyboard" /></span>
              <span><strong>Improve Typing</strong><small>Letters, words, sentences</small></span>
            </div>
            <span className="space-benefit-divider" aria-hidden="true" />
            <div className="space-benefit">
              <span className="space-benefit-badge space-benefit-badge--game"><BenefitIcon kind="game" /></span>
              <span><strong>Play Games</strong><small>Educational games soon</small></span>
            </div>
            <span className="space-benefit-divider" aria-hidden="true" />
            <div className="space-benefit">
              <span className="space-benefit-badge space-benefit-badge--trophy"><BenefitIcon kind="trophy" /></span>
              <span><strong>Rewards Ahead</strong><small>Progress celebrations soon</small></span>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className="space-zones" id="zones" aria-labelledby="space-zones-title">
            <div className="space-zones-heading">
              <div>
                <p className="space-section-kicker"><span aria-hidden="true">✦</span> Featured learning zones <span aria-hidden="true">✦</span></p>
                <h2 id="space-zones-title">Choose Your Adventure</h2>
                <p>Explore a learning zone and pick your favourite way to grow.</p>
              </div>
              <a href="#typing-zone" className="space-explore-link">Explore the map <span aria-hidden="true">⌄</span></a>
            </div>

            <div className="space-zone-grid">
              {learningZones.map((zone, index) => {
                const contents = (
                  <>
                    <div className="space-zone-art" data-hide-target={`zone-${zone.color}`} aria-hidden="true">
                      <span className="space-zone-art-halo" />
                      <span className="space-zone-art-spark space-zone-art-spark--one">✦</span>
                      <span className="space-zone-art-spark space-zone-art-spark--two">✧</span>
                      <span className="space-zone-burst space-zone-burst--one" style={{ "--bx": "-36px", "--by": "-32px" } as CSSProperties}>✦</span>
                      <span className="space-zone-burst space-zone-burst--two" style={{ "--bx": "38px", "--by": "-24px" } as CSSProperties}>✧</span>
                      <span className="space-zone-burst space-zone-burst--three" style={{ "--bx": "3px", "--by": "-48px" } as CSSProperties}>★</span>
                      <span className="space-zone-island-visual"><LearningZoneIsland kind={zone.color} /></span>
                      {zone.color === "typing" && <span className="space-art-letter space-art-letter--one">A</span>}
                      {zone.color === "english" && <span className="space-art-letter space-art-letter--two">Aa</span>}
                      {zone.color === "games" && <span className="space-art-letter space-art-letter--three">★</span>}
                      {zone.color === "rewards" && <span className="space-art-letter space-art-letter--four">✦</span>}
                    </div>
                    <div className="space-zone-text">
                      <span className={`space-zone-status${zone.href ? " is-ready" : ""}`}><i aria-hidden="true" />{zone.state}</span>
                      <h3>{zone.title}</h3>
                      <p className="space-zone-subtitle">{zone.subtitle}</p>
                      <p className="space-zone-description">{zone.description}</p>
                      <span className={`space-zone-action${zone.href ? " is-active" : ""}`}>
                        {zone.href ? "Enter the academy" : "Adventure coming soon"}
                        <span className="space-zone-arrow" aria-hidden="true">{zone.href ? "→" : "✦"}</span>
                      </span>
                    </div>
                  </>
                );

                return (
                  <ScrollReveal key={zone.id} delay={index * 80} className={`space-zone-reveal space-zone-reveal--${zone.color}`}>
                    {zone.href ? (
                      <Link id={zone.id} href={zone.href} className={`space-zone-card space-zone-card--${zone.color}`}>
                        {contents}
                      </Link>
                    ) : (
                      <article id={zone.id} className={`space-zone-card space-zone-card--${zone.color}`} aria-label={`${zone.title}, coming soon`}>
                        {contents}
                      </article>
                    )}
                  </ScrollReveal>
                );
              })}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <footer className="space-footer">
            <Link href="/" className="space-footer-brand"><span aria-hidden="true">✦</span> KiddoWorld</Link>
            <p>Learn a little. Dream a lot. Keep exploring.</p>
            <Link href="/typing" className="space-footer-link">Visit Typing Academy <span aria-hidden="true">→</span></Link>
          </footer>
        </ScrollReveal>
      </div>
    </main>
  );
}
