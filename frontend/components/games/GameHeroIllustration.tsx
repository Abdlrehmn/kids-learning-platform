type GameHeroIllustrationProps = { className?: string };

/** A lightweight, decorative scene used behind the Games World hero copy. */
export default function GameHeroIllustration({ className }: GameHeroIllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 1600 480" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="hero-sky" x1="800" x2="800" y2="480" gradientUnits="userSpaceOnUse"><stop stopColor="#1b9cf1"/><stop offset=".6" stopColor="#65d6f3"/><stop offset="1" stopColor="#c8f4ff"/></linearGradient>
        <linearGradient id="hero-rock" x1="0" x2=".75" y2="1"><stop stopColor="#765b82"/><stop offset="1" stopColor="#3f497b"/></linearGradient>
        <linearGradient id="hero-grass" x1="0" x2="0" y2="1"><stop stopColor="#b9f378"/><stop offset="1" stopColor="#46bd82"/></linearGradient>
        <linearGradient id="hero-shirt" x1="0" x2="1" y2="1"><stop stopColor="#36c6ef"/><stop offset="1" stopColor="#2c69d8"/></linearGradient>
        <linearGradient id="hero-skin" x1="0" x2="1" y2="1"><stop stopColor="#ffe0b4"/><stop offset="1" stopColor="#f2a66f"/></linearGradient>
        <linearGradient id="hero-castle" x1="0" x2="1" y2="1"><stop stopColor="#fff9e9"/><stop offset="1" stopColor="#f2b5dc"/></linearGradient>
        <filter id="hero-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#174b94" floodOpacity=".24"/></filter>
        <filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <rect width="1600" height="480" fill="url(#hero-sky)"/>
      <g className="hero-clouds" opacity=".74" fill="#fff"><path d="M50 140c18-38 58-44 82-15 18-30 64-24 74 14h36c29 0 32 37 0 37H68c-33 0-43-24-18-36Z"/><path d="M1180 90c18-37 58-43 82-15 20-30 65-24 76 14h41c29 0 32 37 0 37h-177c-33 0-43-24-22-36Z"/><path d="M740 72c13-26 42-31 59-10 15-21 47-17 56 10h32c23 0 25 29 0 29H757c-25 0-33-19-17-29Z"/></g>
      <g fill="#fff8a6" filter="url(#hero-glow)"><circle cx="654" cy="75" r="7"/><circle cx="702" cy="125" r="4"/><circle cx="1072" cy="89" r="6"/><circle cx="506" cy="204" r="4"/></g>

      <g className="hero-sparkles" fill="#fff8a6"><path d="m618 63 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z"/><path d="m1043 44 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z"/><path d="m1116 171 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z"/></g>

      <g className="hero-character" transform="translate(42 109)" filter="url(#hero-shadow)">
        <path d="M116 291c-22-53-13-110 28-137 36-24 89-22 123 8 37 33 41 86 17 129H116Z" fill="url(#hero-shirt)" stroke="#fff" strokeWidth="5"/>
        <path d="m144 276 34-50 33 54-20 29h-55l8-33Z" fill="#3150a0" opacity=".62"/>
        <path d="M150 120c0-56 40-95 90-95 52 0 93 39 93 96 0 67-42 113-92 113-51 0-91-46-91-114Z" fill="url(#hero-skin)" stroke="#fff" strokeWidth="5"/>
        <path d="M157 111c5-61 45-95 96-89 42 4 73 31 79 76-23-19-43-30-74-28-31 1-55 16-76 43l-25-2Z" fill="#743d32"/>
        <path d="M171 89c7-30 29-54 58-64l-3 31 25-35 19 35 17-23c23 16 37 39 40 66-26-16-73-28-156-10Z" fill="#5d362e"/>
        <ellipse cx="198" cy="133" rx="17" ry="22" fill="#fff"/><ellipse cx="277" cy="133" rx="17" ry="22" fill="#fff"/><ellipse cx="202" cy="137" rx="8" ry="12" fill="#24335e"/><ellipse cx="273" cy="137" rx="8" ry="12" fill="#24335e"/><circle cx="205" cy="132" r="3" fill="#fff"/><circle cx="276" cy="132" r="3" fill="#fff"/>
        <path d="M213 178c18 17 39 17 57 0" stroke="#b95f6b" strokeWidth="7" strokeLinecap="round"/>
        <circle cx="179" cy="164" r="10" fill="#f58e99" opacity=".58"/><circle cx="300" cy="164" r="10" fill="#f58e99" opacity=".58"/>
        <path d="M156 231 91 201c-12-6-25 2-20 15l22 45 67 12" fill="url(#hero-skin)" stroke="#fff" strokeWidth="5" strokeLinejoin="round"/>
        <path d="m90 204 13-29 21 17-7 25" fill="#f7bf3e" stroke="#fff" strokeWidth="4"/><path d="m103 182 6 14 15 2-11 10 3 15-13-7-13 7 3-15-11-10 15-2 6-14Z" fill="#fff37a"/>
        <path d="M280 234c32-19 49-26 65-15 8 5 8 17 0 22l-53 36-20-43Z" fill="url(#hero-skin)" stroke="#fff" strokeWidth="5"/>
        <path d="M187 237h108l-14 58H198l-11-58Z" fill="#2d5ccb"/><path d="m236 241 12 18-12 18-12-18 12-18Z" fill="#ffd749"/>
        <path d="M158 299h136" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".85"/>
      </g>
      <g transform="translate(300 300)" filter="url(#hero-shadow)">
        <ellipse cx="93" cy="94" rx="83" ry="22" fill="#3063a6" opacity=".16"/>
        <path d="M34 70C30 22 59 0 100 0c50 0 75 32 66 77-6 35-39 51-77 48C55 123 38 103 34 70Z" fill="#fff4e8" stroke="#fff" strokeWidth="5"/>
        <path d="M45 38 25 7l40 13m57 1 36-17-14 39" fill="#a55c42" stroke="#fff" strokeWidth="5" strokeLinejoin="round"/>
        <ellipse cx="76" cy="57" rx="11" ry="14" fill="#fff"/><ellipse cx="128" cy="57" rx="11" ry="14" fill="#fff"/><circle cx="78" cy="60" r="6" fill="#263155"/><circle cx="126" cy="60" r="6" fill="#263155"/><ellipse cx="102" cy="78" rx="15" ry="11" fill="#6c3c4d"/><path d="M90 91q12 14 24 0" stroke="#b85c6f" strokeWidth="4" strokeLinecap="round"/>
        <path d="M43 90c-22 16-25 39-6 50m94-49c28 9 36 31 17 51" stroke="#a85b42" strokeWidth="13" strokeLinecap="round"/>
      </g>

      <g className="hero-floating-island" transform="translate(1205 121)" filter="url(#hero-shadow)">
        <path d="M33 213 203 213 172 330 140 360 111 324 77 350 54 302 33 213Z" fill="url(#hero-rock)" stroke="#fff" strokeWidth="5" strokeLinejoin="round"/>
        <path d="M15 181c4-51 52-72 105-63 59-13 109 20 108 68-2 43-44 62-105 62-64 0-112-21-108-67Z" fill="url(#hero-grass)" stroke="#fff" strokeWidth="5"/>
        <path d="M41 203c35 17 111 17 157-7" stroke="#eaffac" strokeWidth="10" strokeLinecap="round" opacity=".8"/>
        <path d="M157 220v95l-20 32-18-32 20-95h18Z" fill="#60d5f3" stroke="#d9fbff" strokeWidth="4"/>
        <g fill="url(#hero-castle)" stroke="#fff" strokeWidth="4" strokeLinejoin="round">
          <path d="M91 94h64v105H91z"/><path d="M57 115h35v83H57z"/><path d="M155 115h35v83h-35z"/>
          <path d="m82 94 27-42 27 42Z" fill="#b868e8"/><path d="m51 115 23-38 20 38Z" fill="#f77ca9"/><path d="m153 115 21-38 23 38Z" fill="#f77ca9"/>
        </g>
        <path d="M112 157c0-17 22-17 22 0v42h-22v-42Z" fill="#7d55c9"/><g fill="#61c9ef" stroke="#fff" strokeWidth="2"><rect x="68" y="139" width="12" height="18" rx="5"/><rect x="167" y="139" width="12" height="18" rx="5"/><rect x="107" y="116" width="12" height="18" rx="5"/><rect x="136" y="116" width="12" height="18" rx="5"/></g>
        <g><path d="M42 175v-33" stroke="#8d633d" strokeWidth="8"/><path d="M24 157 42 121l18 36Z" fill="#53b978" stroke="#fff" strokeWidth="3"/><path d="M199 177v-34" stroke="#8d633d" strokeWidth="8"/><path d="m181 158 18-37 18 37Z" fill="#53b978" stroke="#fff" strokeWidth="3"/></g>
        <g fill="#ffdb65"><circle cx="52" cy="201" r="5"/><circle cx="75" cy="210" r="4"/><circle cx="183" cy="202" r="5"/></g>
      </g>
      <g transform="translate(1440 242)" filter="url(#hero-shadow)"><path d="M0 18 135 0l8 92-135 18z" fill="#a8653d" stroke="#f2cd8d" strokeWidth="6" strokeLinejoin="round"/><path d="M15 38h112M20 69h101" stroke="#e4a96e" strokeWidth="3" opacity=".8"/><text x="72" y="35" fill="#fff8df" fontFamily="Trebuchet MS, sans-serif" fontWeight="900" fontSize="17" textAnchor="middle">LEARN</text><text x="72" y="60" fill="#fff8df" fontFamily="Trebuchet MS, sans-serif" fontWeight="900" fontSize="17" textAnchor="middle">WHILE YOU</text><text x="72" y="85" fill="#fff8df" fontFamily="Trebuchet MS, sans-serif" fontWeight="900" fontSize="17" textAnchor="middle">PLAY!</text></g>
    </svg>
  );
}
