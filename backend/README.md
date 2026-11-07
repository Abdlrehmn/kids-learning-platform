# KiddoWorld API

The API is a Django REST Framework application under `/api/v1/`. Local development uses SQLite and the console email backend. Production settings reject SQLite and require PostgreSQL, Redis (shared throttling), exact CORS/CSRF origins, SMTP, a secret key, and allowed hosts.

## Setup

Create a virtual environment, install `requirements.txt`, copy `.env.example` to a private environment file, then run:

```powershell
python manage.py migrate
python manage.py runserver
```

Never commit production environment values. Deploy the Django API on an HTTPS host, provision PostgreSQL and Redis, and run `python manage.py migrate` as a release step. Run `python manage.py collectstatic --noinput`; configure the host or CDN to serve `STATIC_ROOT`. Vercel hosts the frontend only and does not host this Django process or its database.

## Browser authentication

The API uses Django sessions and CSRF tokens. Before a state-changing request the browser client calls `/api/v1/auth/csrf/`, then sends the returned token in `X-CSRFToken` with `credentials: "include"`. Configure `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` with the exact frontend origins. Production cookies require HTTPS and use `SameSite=None` for the separate frontend/API hosts. Browsers increasingly restrict third-party cookies; for reliable sessions, use frontend and API hostnames under the same registrable domain, such as `www.example.com` and `api.example.com`, or proxy `/api` through the frontend domain.

## Endpoints

| Route                                                                  | Purpose                                                           |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `POST /auth/register/`                                               | Guardian signup; sends signed email verification link             |
| `POST /auth/verify-email/`                                           | Activate a guardian account                                       |
| `POST /auth/login/`, `POST /auth/logout/`                          | Session sign-in and sign-out                                      |
| `POST /auth/password-reset/`, `POST /auth/password-reset/confirm/` | Password reset flow                                               |
| `GET /auth/me/`, `/auth/children/`                                 | Current guardian and child profiles                               |
| `GET /games/`                                                        | Active game catalog                                               |
| `POST /game-sessions/complete/`                                      | Idempotent game-level completion and reward record                |
| `POST /learning/english/complete/`                                   | English activity completion                                       |
| `POST /learning/typing/complete/`                                    | Aggregate typing completion; raw typed text is not sent or stored |
| `GET /children/{id}/summary/`, `/rewards/`                         | Child-scoped XP, stars, streak, achievements, activity history    |

Every child endpoint scopes lookup to the authenticated guardian. XP ledger source keys and unique client request IDs prevent retry duplicates. The frontend still supports local guest progress. For signed-in learners it submits completion summaries; current client-only game engines do not send answers for server validation, so a sufficiently skilled user can forge a completion request or submit new session IDs. Validate gameplay server-side before using rewards for purchases or other high-value outcomes.

## Reward integrity and abuse limits

- **Idempotency.** Every completion carries a client `client_session_id` (UUID). The server claims each UUID once per child and activity type; retries return the stored result without new rewards, and a UUID reused for a different child, game, level, or activity is rejected with HTTP 400.
- **Game sessions.** A session can be completed exactly once and only from `started` status; abandoned sessions are permanently rejected. The server re-checks game state, level (`1-1000`), score (`0-500`), and rounds (`== 5`) under a transaction, and awards XP only when the ledger entry matches the session.
- **Ledger consistency.** XP and stars are append-only `XPTransaction` rows with unique source keys; every completion writes the session and its ledger entry inside one transaction, so a failure rolls back both. Session `xp_awarded` fields are validated against the ledger on completion and on retry.
- **Streaks and daily bonus.** Streak activity is keyed to the child's local calendar day (child `timezone` field; recalculation uses the current zone). Events with a UTC instant equal to or earlier than the stored one are ignored, so out-of-order submissions never move dates or counts backwards. The per-day bonus is a unique ledger entry keyed by the local date. A concurrent-fetch streak test runs where the database supports `SELECT FOR UPDATE` (PostgreSQL); SQLite test runs skip it.
- **Typing Academy trust boundary.** Typing rewards are computed from browser-reported aggregates (`correct_words`, `completed_rounds`, `elapsed_ms`). These numbers are **not trustworthy**: a modified client can claim plausible-looking metrics or fresh session UUIDs, and the server has previously only seen completed language activities submitted by the same client-side engines. Server-side protections are therefore damage caps, not guarantees: per-submission caps (`correct_words ≤ 80`, `completed_rounds ≤ 20`, `elapsed_ms ≤ 3,600,000`), plausibility floors (`elapsed ≥ 100 ms × words + 500 ms × rounds`), a 30/hour throttle (`API_TYPING_RATE`), and fixed reward formulas. Treat typing XP as cosmetic and controlled by these caps until game-state or answer validation is implemented server-side; the same caveat applies to English completions, which validate the activity ID against the allowlist but not the child's answers.

## Data model and privacy

Guardian identities use Django's password-hashed user model; child profiles are nickname-only subprofiles and never authenticate. Game/learning sessions store bounded aggregate metrics, not raw typed content. XP changes are append-only transactions; balances, achievements, and streaks derive from that ledger and completion history. Configure database encryption, automated encrypted backups with restore drills, retention/deletion policy, centralized logs with no passwords/tokens/child content, and provider-level access controls before launch.
