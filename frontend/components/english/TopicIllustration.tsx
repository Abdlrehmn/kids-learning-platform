import type { EnglishCategoryId } from "./englishContent";

export default function TopicIllustration({ category, index }: { category: EnglishCategoryId; index: number }) {
  const illustration = index % 5;

  return (
    <svg className={`ew-topic-illustration ew-topic-illustration--${category}`} viewBox="0 0 160 106" aria-hidden="true" focusable="false">
      <ellipse className="ew-topic-illustration-shadow" cx="80" cy="91" rx="43" ry="7" />
      {illustration === 0 && (
        <g className="ew-topic-illustration-object ew-topic-illustration-book">
          <path d="M42 36c15-9 28-8 39 1v42c-12-8-25-9-39-1z" fill="#fff9e9" stroke="#d3c5ff" strokeWidth="4" />
          <path d="M81 37c12-9 25-10 39-2v42c-14-7-27-7-39 3z" fill="#fffdf6" stroke="#bba6f5" strokeWidth="4" />
          <path d="M81 38v42m-30-30 20 0m-20 9 20 0m20-9 20-2m-20 11 20-2" fill="none" stroke="#9a84db" strokeWidth="3" strokeLinecap="round" />
          <path d="m113 20 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffcd4c" stroke="#fff" strokeWidth="2" />
        </g>
      )}
      {illustration === 1 && (
        <g className="ew-topic-illustration-object ew-topic-illustration-pencil" transform="translate(80 53) rotate(32)">
          <rect x="-13" y="-37" width="26" height="63" rx="10" fill="#ffd05a" stroke="#fff" strokeWidth="4" />
          <path d="M-13-20h26m-26 7h26" stroke="#f39a48" strokeWidth="3" opacity=".8" />
          <path d="m-13 24 13 21 13-21z" fill="#f4c59e" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          <path d="m-4 39 4 7 4-7z" fill="#514e66" />
          <rect x="-13" y="-39" width="26" height="10" rx="5" fill="#54b5f1" stroke="#fff" strokeWidth="3" />
          <path d="M-5-32v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <path d="m22-22 3 6 7 1-5 4 2 7-7-4-6 4 1-7-5-4 7-1z" fill="#fff" />
        </g>
      )}
      {illustration === 2 && (
        <g className="ew-topic-illustration-object ew-topic-illustration-blocks" stroke="#fff" strokeWidth="3" strokeLinejoin="round">
          <path d="m44 48 21-12 22 12-22 13z" fill="#c8a7ff" /><path d="M44 48v27l21 13V61z" fill="#8053db" /><path d="M65 61v27l22-13V48z" fill="#a77af0" />
          <path d="m77 33 20-12 21 12-21 12z" fill="#8de2a0" /><path d="M77 33v26l20 12V45z" fill="#36b978" /><path d="M97 45v26l21-12V33z" fill="#58ce8c" />
          <path d="m91 60 16-9 17 9-17 10z" fill="#8bdfff" /><path d="M91 60v19l16 10V70z" fill="#299ed0" /><path d="M107 70v19l17-10V60z" fill="#52bce5" />
          <text x="65" y="78" fill="#fff" stroke="none" textAnchor="middle" fontSize="16" fontWeight="900">A</text>
          <text x="97" y="55" fill="#fff" stroke="none" textAnchor="middle" fontSize="14" fontWeight="900">B</text>
          <text x="108" y="84" fill="#fff" stroke="none" textAnchor="middle" fontSize="13" fontWeight="900">C</text>
        </g>
      )}
      {illustration === 3 && (
        <g className="ew-topic-illustration-object ew-topic-illustration-punctuation">
          <path d="M48 27h39a16 16 0 0 1 16 16v8a16 16 0 0 1-16 16H68L54 78l3-11a16 16 0 0 1-9-15v-9a16 16 0 0 1 16-16Z" fill="#6bc8f3" stroke="#fff" strokeWidth="4" />
          <text x="69" y="56" fill="#fff" textAnchor="middle" fontSize="34" fontWeight="1000">?</text>
          <path d="M100 47h24a11 11 0 0 1 11 11v6a11 11 0 0 1-11 11h-7l-9 8 2-9a11 11 0 0 1-10-10v-6a11 11 0 0 1 11-11Z" fill="#ff8b9d" stroke="#fff" strokeWidth="4" />
          <text x="112" y="68" fill="#fff" textAnchor="middle" fontSize="22" fontWeight="1000">!</text>
          <circle cx="42" cy="29" r="5" fill="#ffcf55" /><path d="m117 25 3 6 7 1-5 4 1 7-6-3-6 3 1-7-5-4 7-1z" fill="#ffe685" />
        </g>
      )}
      {illustration === 4 && (
        <g className="ew-topic-illustration-object ew-topic-illustration-star">
          <path d="m80 18 14 21 25 2-16 18 5 25-28-11-24 13 3-27-19-18 27-4z" fill="#ffcf42" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
          <ellipse cx="72" cy="53" rx="3" ry="4" fill="#7452a8" /><ellipse cx="91" cy="53" rx="3" ry="4" fill="#7452a8" />
          <path d="M73 65q9 8 18-1" fill="none" stroke="#cf7545" strokeWidth="3" strokeLinecap="round" />
          <circle cx="120" cy="31" r="15" fill="#fff9e9" stroke="#9c81e9" strokeWidth="4" />
          <path d="M120 22v10l7 4" fill="none" stroke="#7255c9" strokeWidth="3" strokeLinecap="round" />
          <path d="m41 25 3 6 7 1-5 4 1 7-6-3-6 3 1-7-5-4 7-1z" fill="#fff" />
        </g>
      )}
    </svg>
  );
}
