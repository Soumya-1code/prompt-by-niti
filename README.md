# Prompt by Niti

**Your prompts, organized. Your ideas, improved.**

Prompt by Niti is a workspace for saving, organizing, improving and analyzing AI prompts. It is a frontend-only app built with React, TypeScript and Vite. Everything runs in the browser and is stored in localStorage. There is no backend, no account system and no external AI service.

## Features

- Create, search, filter, favorite, copy and open prompts
- **Prompt DNA**: a local, rule-based quality analysis scoring Goal Clarity, Context, Audience, Output Definition, Constraints and Examples, with strengths, weak areas and suggestions
- **Prompt Improver**: a local, rule-based rewrite of weak prompts
- Reusable templates with fill-in variables
- Light and dark themes, saved between visits
- Demo display name (a local profile, not real authentication)
- Responsive layout: full sidebar on desktop, compact icon sidebar on tablet, drawer on mobile
- Keyboard support: `Ctrl K` / `⌘ K` focuses search, `Esc` closes dialogs

## How the analysis works

Prompt DNA and the Prompt Improver use deterministic keyword and length rules. The same prompt always gets the same score. They are not AI models and can miss things a human reader would notice, so treat the score as a checklist, not a verdict.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173/prompt-by-niti/).

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

The app is configured for the `/prompt-by-niti/` path in `vite.config.ts`.

1. Create a `.gitignore` file containing:

```
   node_modules
   dist
```

2. Push the project:

```bash
   git init
   git add .
   git commit -m "Prompt by Niti"
   git branch -M main
   git remote add origin https://github.com/Soumya-1code/prompt-by-niti.git
   git push -u origin main
```

3. Build and publish the `dist` folder:

```bash
   npm install --save-dev gh-pages
   npm run build
   npx gh-pages -d dist
```

4. In GitHub, open **Settings → Pages**, choose the `gh-pages` branch and the `/ (root)` folder, then save.

The site will be available at https://soumya-1code.github.io/prompt-by-niti/

## Project structure

```
prompt-by-niti/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── README.md
└── src/
    ├── main.tsx     entry point
    ├── App.tsx      state, analysis rules and components
    ├── App.css      layout and component styles
    └── index.css    theme variables and base styles
```

## Data storage

These localStorage keys are used. Clear them to reset the app to its defaults.

| Key | Contents |
| --- | --- |
| `pbn.prompts` | Saved prompts, including favorite flags |
| `pbn.theme` | `light` or `dark` |
| `pbn.name` | Demo display name |

If stored prompt data is malformed, the app falls back to the default prompts instead of crashing.

## Demo script (3–5 minutes)

1. Open the app and show the hero and the Prompt DNA card (30 s).
2. Search "python", then use the Coding filter (30 s).
3. Open a prompt, copy it and favorite it (45 s).
4. Open Prompt Improver, type "explain machine learning" and show the rewrite (60 s).
5. Choose "Analyze with Prompt DNA" and walk through the six scores (60 s).
6. Open Templates, fill in the variables and save one to the library (30 s).
7. Switch to dark theme and refresh to show that everything persists (15 s).