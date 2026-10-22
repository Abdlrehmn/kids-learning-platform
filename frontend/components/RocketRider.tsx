export default function RocketRider() {
  return (
    <svg
      className="space-rider-svg"
      viewBox="0 0 520 430"
      role="img"
      aria-labelledby="rocket-rider-title rocket-rider-description"
      focusable="false"
    >
      <title id="rocket-rider-title">A young explorer riding a rocket</title>
      <desc id="rocket-rider-description">
        A smiling boy in a blue and yellow adventure outfit sits astride a white rocket and holds both handlebars.
      </desc>
      <defs>
        <linearGradient id="rocket-shell" x1="-120" y1="-62" x2="80" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset=".55" stopColor="#f3f8ff" />
          <stop offset="1" stopColor="#c8d8f0" />
        </linearGradient>
        <linearGradient id="rocket-red" x1="87" y1="-60" x2="181" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff887e" />
          <stop offset=".45" stopColor="#f34758" />
          <stop offset="1" stopColor="#c92852" />
        </linearGradient>
        <linearGradient id="rocket-blue" x1="-26" y1="-32" x2="25" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ae4ff" />
          <stop offset=".5" stopColor="#13b8e7" />
          <stop offset="1" stopColor="#2877d7" />
        </linearGradient>
        <linearGradient id="rocket-flame" x1="-190" y1="0" x2="-282" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff8a4" />
          <stop offset=".34" stopColor="#ffd347" />
          <stop offset=".73" stopColor="#ff8757" />
          <stop offset="1" stopColor="#ff6ca4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="jacket-blue" x1="190" y1="146" x2="250" y2="225" gradientUnits="userSpaceOnUse">
          <stop stopColor="#35d8df" />
          <stop offset="1" stopColor="#2462d1" />
        </linearGradient>
        <linearGradient id="hair-brown" x1="189" y1="57" x2="251" y2="103" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8c4c42" />
          <stop offset=".55" stopColor="#60384a" />
          <stop offset="1" stopColor="#392f50" />
        </linearGradient>
        <linearGradient id="skin" x1="190" y1="74" x2="248" y2="147" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd4aa" />
          <stop offset="1" stopColor="#ed9b75" />
        </linearGradient>
        <filter id="rocket-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <ellipse cx="264" cy="355" rx="181" ry="23" fill="#183f99" opacity=".13" />
      <path d="M90 297c31-12 56-12 83-4" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".65" />
      <path d="M356 121c25-8 45-7 62 0" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".6" />

      <g className="rocket-flight" transform="translate(250 276) rotate(-29)">
        <ellipse className="rocket-engine-glow" cx="-207" cy="0" rx="69" ry="31" fill="#ffbe45" opacity=".65" filter="url(#rocket-glow)" />
        <g className="rocket-flame">
          <path d="M-181-23c-34-16-74-8-111 23 39 27 76 36 111 23Z" fill="url(#rocket-flame)" />
          <path d="M-181-11c-23-9-48-5-75 11 28 16 52 20 75 11Z" fill="#fff8b0" opacity=".95" />
        </g>
        <g className="rocket-fin rocket-fin--upper">
          <path d="m-116-43-57-49 16 76 35 25Z" fill="#ed4055" stroke="#b92d55" strokeWidth="5" strokeLinejoin="round" />
          <path d="m-158-81 22 43" stroke="#ff8b83" strokeWidth="5" strokeLinecap="round" />
        </g>
        <g className="rocket-fin rocket-fin--lower">
          <path d="m-119 41-58 47 18-74 35-22Z" fill="#327de2" stroke="#265bb8" strokeWidth="5" strokeLinejoin="round" />
          <path d="m-160 75 22-40" stroke="#8edcff" strokeWidth="5" strokeLinecap="round" />
        </g>
        <path d="M-174-28h29v56h-29c-12 0-20-9-20-20v-16c0-11 8-20 20-20Z" fill="#38537d" stroke="#263f70" strokeWidth="5" />
        <path d="M-153-31v62" stroke="#a4bad7" strokeWidth="8" />
        <path d="M-148-53h229c17 0 25 8 31 19v68c-6 11-14 19-31 19h-229c-15 0-26-10-26-26v-54c0-16 11-26 26-26Z" fill="url(#rocket-shell)" stroke="#a7bad8" strokeWidth="5" />
        <path d="M81-55c53 1 101 23 128 55-27 32-75 54-128 55-12-15-18-34-18-55s6-40 18-55Z" fill="url(#rocket-red)" stroke="#c73653" strokeWidth="5" strokeLinejoin="round" />
        <path d="M97-43c37 5 68 18 89 37" fill="none" stroke="#ffb0a0" strokeWidth="7" strokeLinecap="round" opacity=".75" />
        <path d="M-119 41h176" stroke="#49a5e9" strokeWidth="10" opacity=".82" />
        <path d="M-113-42h176" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".9" />
        <circle cx="45" cy="20" r="35" fill="#385ca3" stroke="#fff" strokeWidth="7" />
        <circle cx="45" cy="20" r="25" fill="url(#rocket-blue)" stroke="#98eaff" strokeWidth="4" />
        <path d="M34 7c8-8 20-10 29-5" fill="none" stroke="#e1fbff" strokeWidth="5" strokeLinecap="round" opacity=".85" />
        <path d="M38 44c8 5 18 5 25 0" fill="none" stroke="#0c72c4" strokeWidth="4" strokeLinecap="round" opacity=".55" />
      </g>

      <g className="rocket-sparks" aria-hidden="true">
        <path className="rocket-spark rocket-spark--one" d="m55 328 6 12 12 6-12 5-6 12-5-12-12-5 12-6Z" fill="#fff19a" />
        <path className="rocket-spark rocket-spark--two" d="m147 365 4 8 8 4-8 4-4 8-4-8-8-4 8-4Z" fill="#fff" />
        <circle className="rocket-spark rocket-spark--three" cx="92" cy="365" r="4" fill="#ff8c69" />
      </g>

      <g className="rider-character">
        <path d="M190 147 170 158c-11 7-16 22-12 35l9 27 31-8 12-52Z" fill="#ef9a48" stroke="#b86c48" strokeWidth="5" strokeLinejoin="round" />
        <path d="m169 169 27-8 3 13-26 8Z" fill="#ffe174" />
        <path d="M213 207c-6 18-23 27-30 46l-12 27c-4 10 6 16 15 12l26-19 21-39-2-27Z" fill="#365caa" stroke="#263f7d" strokeWidth="7" strokeLinejoin="round" />
        <path d="M229 207c16 2 28 17 39 31l27 19c10 7 6 20-6 19l-29-8c-17-5-31-19-47-39l-5-14Z" fill="#31559f" stroke="#263f7d" strokeWidth="7" strokeLinejoin="round" />
        <path d="m172 276 26-22 12 9-16 26c-7 11-25 10-27 1Z" fill="#fff" stroke="#a9c2e4" strokeWidth="5" strokeLinejoin="round" />
        <path d="m276 261 26 11c11 5 8 18-4 18h-26l-14-10Z" fill="#fff" stroke="#a9c2e4" strokeWidth="5" strokeLinejoin="round" />
        <path d="m175 293 37-1-3 8h-37c-7 0-8-5-3-7Z" fill="#ffbe37" />
        <path d="m274 287 30-1c6 0 7 6 1 8l-29 2-8-4Z" fill="#ffbe37" />

        <path d="M190 145c13-13 39-15 57-4l19 18-8 56c-19 15-48 18-72 4l-8-47c-1-13 2-22 12-27Z" fill="url(#jacket-blue)" stroke="#2460b7" strokeWidth="6" strokeLinejoin="round" />
        <path d="m203 148 12 8-3 63-13-4Z" fill="#ffd343" />
        <path d="m239 148 12-5 11 16-13 8Z" fill="#ffdf57" />
        <path d="M190 157c-14 4-20 15-16 30l19 22 14 10 10-10-17-19 7-20Z" fill="url(#jacket-blue)" stroke="#2460b7" strokeWidth="6" strokeLinejoin="round" />
        <path d="M244 155c14-4 24 3 32 16l-3 17-8 4-11-7-13-13Z" fill="url(#jacket-blue)" stroke="#2460b7" strokeWidth="6" strokeLinejoin="round" />
        <g className="rocket-handlebar-front" transform="translate(250 276) rotate(-29)">
          <path d="M-8-68 58-66" fill="none" stroke="#324a77" strokeWidth="9" strokeLinecap="round" />
          <path d="M-8-68 58-66" fill="none" stroke="#9aeaff" strokeWidth="3" strokeLinecap="round" />
          <path d="m-18-75 14 1 2 13-15 1Z" fill="#283d69" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          <path d="m52-73 15 1-1 13-15-1Z" fill="#283d69" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          <path d="M-7-68v-13m65 15 2-13" fill="none" stroke="#627da9" strokeWidth="5" strokeLinecap="round" />
        </g>
        <path d="M202 215c1-6 8-8 12-3l4 5 5-2c5-1 8 5 4 9l-7 7c-5 4-12 2-16-2l-5-6Z" fill="url(#skin)" stroke="#d98768" strokeWidth="4" strokeLinejoin="round" />
        <path d="M261 187c2-6 9-7 12-2l4 4 5-2c5-1 8 5 4 9l-6 7c-5 4-12 3-16-1l-6-6Z" fill="url(#skin)" stroke="#d98768" strokeWidth="4" strokeLinejoin="round" />

        <g className="rider-head">
          <path d="M190 97c2-26 20-43 44-40 25 3 38 22 34 49l-7 35c-5 17-22 27-42 24-20-3-32-19-31-38Z" fill="url(#skin)" stroke="#d9886b" strokeWidth="4" />
          <path d="M187 107c-9-14-7-38 5-52 9-13 24-20 39-16 12-7 27-1 31 11 13 7 18 22 12 36-6-9-15-14-27-16-14 13-34 17-54 12l-6 25Z" fill="url(#hair-brown)" />
          <path d="M194 70c5-18 19-29 35-31m8 4c14 0 23 7 27 18m-72 24c-2 9 0 17 4 23" fill="none" stroke="#b8755c" strokeWidth="5" strokeLinecap="round" opacity=".65" />
          <path d="M202 96c5-4 11-4 16-1m17-3c5-3 11-2 15 2" fill="none" stroke="#563947" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="210" cy="108" rx="7" ry="10" fill="#fff" />
          <ellipse cx="244" cy="106" rx="7" ry="10" fill="#fff" />
          <ellipse cx="212" cy="109" rx="3.5" ry="6" fill="#315587" />
          <ellipse cx="246" cy="107" rx="3.5" ry="6" fill="#315587" />
          <circle cx="213" cy="107" r="1.8" fill="#fff" />
          <circle cx="247" cy="105" r="1.8" fill="#fff" />
          <path d="M226 111c-4 7-2 10 3 11m-15 10c8 9 22 10 31 1" fill="none" stroke="#a84953" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="199" cy="127" rx="7" ry="4" fill="#ef8981" opacity=".58" />
          <ellipse cx="257" cy="125" rx="7" ry="4" fill="#ef8981" opacity=".58" />
        </g>

        <path d="M203 149c-5 13-7 23-6 32" fill="none" stroke="#f7faff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
      </g>
    </svg>
  );
}
