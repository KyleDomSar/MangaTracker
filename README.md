# MangaTracker

MangaTracker is a modern web application for managing a personal manga and manhwa reading library.

## Features

- Dashboard with reading statistics
- Discover manga and manhwa through AniList
- Personal Library with reading statuses
- Manga Details with synopsis, creators, characters, recommendations, and relations
- Chapter-by-chapter reading progress
- Real chapter count lookup through MangaBaka when AniList does not provide one
- Mark chapters as read or unread
- Automatic completion when the final known chapter is reached
- Activity history for library and reading actions
- Profile and reading statistics
- Settings for library and data management
- Persistent browser storage through Zustand
- Responsive desktop and mobile interface

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Router
- AniList GraphQL API
- MangaBaka API
- Lucide React

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/manga-tracker.git
cd manga-tracker
npm install
npm run dev
```

Then open the local Vite development URL shown in the terminal.

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── api/              # AniList and MangaBaka API integration
├── components/       # Reusable UI components
├── layouts/          # Application layout and navigation
├── models/           # TypeScript types
├── pages/            # Application pages
├── store/            # Zustand stores
├── App.tsx           # Application routes
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Data

- AniList provides manga metadata and catalog information.
- MangaBaka is used as an additional source for chapter totals when available.
- Library, reading progress, activity history, and settings are persisted locally in the browser.

## License

MIT License
