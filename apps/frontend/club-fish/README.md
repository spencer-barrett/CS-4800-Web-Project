# Club-Guppy Next.js

A minimal Next.js project using the App Router, TypeScript, and Tailwind-ready configs. This README explanis how to install dependencies, run the app, and understand the folder layout.

## Requirements
- Node.js 18.18+ or 20+
- npm 9+ (or pnpm/yarn)

## Getting Started


1) Install Deps
` npm install `

1.5) Also install Phaser, wasn't sure how to add it correctly to the package.json file. 
` npm install phaser `

3) Start the development server `npm run dev`

4) Navigate to http://localhost:3000

## Project Structure
```
.
├── components.json
├── eslint.config.mjs
├── image.png
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── public
│   ├── assets
│   │   ├── background.png
│   │   ├── back.png
│   │   ├── Clownfish.png
│   │   ├── front.png
│   │   └── wave_overlay.png
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── src
│   ├── app
│   │   ├── api                     // Testing: Ignore for now
│   │   │   └── dump
│   │   │       └── route.ts
│   │   ├── assets
│   │   ├── chat
│   │   │   └── page.tsx
│   │   ├── contact-us
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                // Home/Landing Page
│   │   └── providers.tsx
│   ├── components
│   │   └── ui
│   │       ├── button.tsx
│   │       └── scroll-area.tsx
│   └── lib
│       ├── firebase
│       │   ├── admin.ts            // Server-side access
│       │   ├── clientApp.ts        // Client-side access
│       └── utils.ts
├── tailwind.config.js
└── tsconfig.json

13 directories, 35 files
```
## Learn More

- Next.js Docs: https://nextjs.org/docs
