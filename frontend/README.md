This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## English World

The English learning experience is available at `/english`. Activity content and earned progress are stored in the current browser's `localStorage` under `kiddoworld-english-progress-v1`. The app saves unique completed activity IDs, daily reward dates, and the last activity opened. It does not save an in-progress story page, quiz question, or tile arrangement, so reopening a lesson after a refresh starts that activity over. This first version has no Django English API, learner account, or cross-device sync; clearing browser storage resets its progress.

Read-aloud and listening prompts use browser speech synthesis when it is available. Speaking uses browser speech recognition only when the browser exposes it and the learner grants microphone access. The text alternative checks the transcribed or entered words against the prompt; it does not measure pronunciation. Browser support and microphone permission vary by device.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
