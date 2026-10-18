# MangaTracker

<div align="center">

**Your personal manga and manhwa library, all in one place.**

Discover titles, organize your reading list, and keep track of the chapters you've read.

<p>
  <a href="https://manga-tracker-two-xi.vercel.app/#/"><strong>Open Live App →</strong></a>
  ·
  <a href="https://github.com/KyleDomSar/MangaTracker">View Source Code</a>
</p>

</div>

<p align="center">
  <a href="https://github.com/KyleDomSar/MangaTracker/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/KyleDomSar/MangaTracker/actions/workflows/ci.yml/badge.svg" /></a>
  <img alt="React 18" src="https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white" />
  <img alt="Deployed on Vercel" src="https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel&logoColor=white" />
</p>

MangaTracker is a responsive reading tracker built with React and TypeScript. It brings manga discovery, a personal library, chapter-by-chapter progress, reading statistics, and activity history into one dark-themed interface. Manga metadata comes from AniList, with MangaBaka as an additional source for chapter counts when available.

## Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Run Locally](#run-locally)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Data and Privacy](#data-and-privacy)
- [Acknowledgements](#acknowledgements)

## Live Demo

**[manga-tracker-two-xi.vercel.app](https://manga-tracker-two-xi.vercel.app/#/)**

Open the app in your browser and start building your reading library.

## Features

### Discover manga and manhwa

- Browse popular and trending manga from AniList.
- Search for titles and explore paginated results.
- Filter results by genre and publication status.
- Open detailed title pages with synopsis, creators, characters, tags, recommendations, and related titles.
- View available publication details, genres, scores, and cover art.

### Organize your personal library

- Add titles and assign a reading status: **Reading**, **Plan to Read**, **Completed**, **Paused**, or **Dropped**.
- Search, sort, and filter saved titles.
- Switch between grid and list views.
- Select multiple titles to update statuses or remove items in bulk.
- Set a default status for new library entries.

### Track chapter progress

- Mark individual chapters as read or unread.
- Jump to a chapter number to update your progress.
- Keep track of the current, last-read, and next chapter.
- Automatically mark a title completed when its known chapter total is reached.
- Use AniList chapter information first and look up additional chapter counts through MangaBaka when available.

### Review your reading activity

- See an at-a-glance dashboard with library statistics and reading progress.
- Continue from recently updated titles and revisit recently added manga.
- Review activity history, including library changes and chapter progress.
- View profile statistics such as library distribution, completed titles, chapters read, and average progress.

### Manage your data

- Export your library, progress, activity, and settings to a JSON backup.
- Restore a previously exported backup.
- Clear API cache, activity history, or the entire library from Settings.
- Keep your data saved in the browser between visits.
- Use the responsive interface on desktop, tablet, and mobile.
- Access the app with Progressive Web App (PWA) metadata and service-worker caching support on compatible browsers.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React 18 | UI and interactive components |
| TypeScript | Type-safe application code |
| Vite 6 | Development server and production build |
| Tailwind CSS 4 | Utility-first styling |
| Zustand | Application state and browser persistence |
| React Router | Hash-based client-side routing |
| AniList GraphQL API | Manga catalog, search, and title metadata |
| MangaBaka API | Additional chapter-count lookup when available |
| Lucide React | Interface icons |
| Vercel | Live deployment |

## How It Works

MangaTracker uses two external data sources:

- **AniList** provides manga search, discovery, title details, and catalog metadata through its GraphQL API.
- **MangaBaka** is queried for additional chapter-count information when available. If the lookup cannot provide a result, the app can fall back to the chapter information from AniList.

The personal library and reading activity are managed with Zustand stores and persisted in the browser's `localStorage`.

```text
React + TypeScript frontend
          |
          +---- AniList GraphQL API
          |       Manga search, discovery, metadata
          |
          +---- MangaBaka API
          |       Additional chapter-count lookup
          |
          +---- Browser localStorage
                  Library, chapter progress,
                  activity, settings, API cache
```

The service worker supports caching for same-origin requests, which can help the app load previously cached resources when the network is unavailable. Live catalog searches and fresh manga information still depend on the external APIs and an internet connection.

## Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later recommended
- npm (included with Node.js)
- An internet connection for live manga data

### 1. Clone the repository

```bash
git clone https://github.com/KyleDomSar/MangaTracker.git
cd MangaTracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Vite is configured to use port **3000**. Open the local address printed in your terminal, usually [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm run build` | Type-checking is handled separately; create the production build in `dist/` |

To run the same checks used in the GitHub Actions workflow:

```bash
npm ci
npm run typecheck
npm run build
```

The CI workflow runs on pushes and pull requests targeting `main`, using Node.js 20.

## Project Structure

```text
MangaTracker/
├── .github/
│   └── workflows/
│       └── ci.yml             # Typecheck and production build checks
├── public/
│   ├── icons/                 # App icons
│   ├── manifest.webmanifest   # PWA metadata
│   └── sw.js                  # Service worker and cache handling
├── src/
│   ├── api/
│   │   ├── anilist.ts         # AniList GraphQL integration
│   │   └── mangabaka.ts       # Chapter-count lookup
│   ├── components/            # Manga cards and shared UI
│   ├── layouts/               # Main app layout and navigation
│   ├── models/                # Shared TypeScript types
│   ├── pages/                 # Dashboard, Discover, Library, and more
│   ├── store/
│   │   └── stores.ts          # Zustand stores and persistence
│   ├── App.tsx                # Routes
│   ├── index.css              # Global styles
│   └── main.tsx               # Application entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.js
```

## Data and Privacy

- **Local-first library:** your saved titles, progress, activity, and settings are stored in your browser's local storage.
- **No account or cloud sync:** the app does not currently synchronize your personal library automatically across browsers or devices.
- **Back up your data:** use Settings to export a JSON backup. Restore it later from the same page.
- **Catalog requests:** searches and manga details are retrieved from AniList, with MangaBaka used for additional chapter-count lookups when available.
- **Cache:** some API responses are cached locally to reduce repeated requests.

Clearing browser site data or moving to a different browser or device may leave your saved library unavailable. Export a backup before clearing site data or switching devices.

## Acknowledgements

- [AniList](https://anilist.co/) for manga catalog data and its GraphQL API.
- [MangaBaka](https://mangabaka.org/) for additional chapter-count information when available.
- [Lucide](https://lucide.dev/) for icons.

MangaTracker is an independent personal project and is not affiliated with AniList or MangaBaka.
