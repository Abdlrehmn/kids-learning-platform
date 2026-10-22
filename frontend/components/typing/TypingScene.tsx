"use client";

import { memo } from "react";

/**
 * Decorative layers for the Typing Academy sky: drifting clouds, floating
 * alphabet letters, floating keyboard keycaps, twinkling sparkles, a tiny
 * keyboard island and two rolling hills. Every node is `aria-hidden` and
 * never captures pointer events, so the typing workspace stays usable.
 */
function TypingScene() {
  return (
    <div className="typing-scene" aria-hidden="true">
      <div className="typing-scene__sun" />
      <div className="typing-scene__glow typing-scene__glow--one" />
      <div className="typing-scene__glow typing-scene__glow--two" />

      <div className="typing-scene__clouds">
        <span className="typing-scene__cloud typing-scene__cloud--one" />
        <span className="typing-scene__cloud typing-scene__cloud--two" />
        <span className="typing-scene__cloud typing-scene__cloud--three" />
        <span className="typing-scene__cloud typing-scene__cloud--four" />
      </div>

      <div className="typing-scene__floaters">
        <span className="typing-scene__floater typing-scene__floater--letter-a">A</span>
        <span className="typing-scene__floater typing-scene__floater--letter-b">B</span>
        <span className="typing-scene__floater typing-scene__floater--letter-c">C</span>
        <span className="typing-scene__floater typing-scene__floater--letter-d">Zz</span>
        <span className="typing-scene__floater typing-scene__floater--letter-e">Q</span>
        <span className="typing-scene__floater typing-scene__floater--letter-f">X</span>
        <span className="typing-scene__floater typing-scene__floater--key-a">↵</span>
        <span className="typing-scene__floater typing-scene__floater--key-b">⇧</span>
        <span className="typing-scene__floater typing-scene__floater--key-c">␣</span>
        <span className="typing-scene__floater typing-scene__floater--key-d">⌫</span>
      </div>

      <div className="typing-scene__sparkles">
        <span className="typing-scene__sparkle typing-scene__sparkle--one">✦</span>
        <span className="typing-scene__sparkle typing-scene__sparkle--two">✧</span>
        <span className="typing-scene__sparkle typing-scene__sparkle--three">✦</span>
        <span className="typing-scene__sparkle typing-scene__sparkle--four">✧</span>
        <span className="typing-scene__sparkle typing-scene__sparkle--five">✦</span>
        <span className="typing-scene__sparkle typing-scene__sparkle--six">✧</span>
      </div>

      <div className="typing-scene__hills">
        <span className="typing-scene__hill typing-scene__hill--far" />
        <span className="typing-scene__hill typing-scene__hill--near" />
      </div>

      <div className="typing-scene__island">
        <span className="typing-scene__island-orbit" />
        <span className="typing-scene__island-rock typing-scene__island-rock--lower" />
        <span className="typing-scene__island-rock typing-scene__island-rock--middle" />
        <span className="typing-scene__island-rock typing-scene__island-rock--upper" />
        <div className="typing-scene__island-top">
          <span className="typing-scene__island-grass typing-scene__island-grass--left" />
          <span className="typing-scene__island-grass typing-scene__island-grass--right" />
          <div className="typing-scene__island-keyboard">
            <span>Q</span>
            <span>W</span>
            <span>E</span>
            <span className="typing-scene__island-spacebar" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TypingScene);
