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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Cloudflare Pages

This project is fully configured and optimized for **Cloudflare Pages**.

### Cloudflare Pages Dashboard Settings
1. Connect your Git repository in the **Cloudflare Dashboard** under **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Set the build settings:
   - **Framework preset**: `None` or `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node.js Version** (Environment variables):
     - `NODE_VERSION`: `20`
3. Click **Save and Deploy**.

### Deploying via Wrangler CLI
You can also build and deploy directly using Wrangler:
```bash
npm run build
npx wrangler pages deploy out
```

### Architecture Highlights on Cloudflare Pages
- **Static HTML Export**: Pre-renders all pages to pure static HTML/CSS/JS in `out/` for instant edge caching and 0ms cold starts.
- **Pages Functions**: API routes are hosted as Cloudflare Edge Functions in `functions/api/telegram/` with `nodejs_compat` enabled.
- **Dual-Mode Telegram MTProto**: Supports both Cloudflare Functions and direct in-browser WebSocket connections (`useWSS: true`).
- **Dynamic Route Rewrite**: `public/_redirects` transparently handles dynamic repository URLs (`/files/:owner/:repo`) with SPA routing fallback.
- **Global Headers**: `public/_headers` enforces immutable caching for static bundles and strict security headers.

