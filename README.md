# 📖 ManhwaTimeline

Ang **ManhwaTimeline** ay isang modern web application para sa pag-track ng iyong manga at manhwa reading journey.

## ✨ Features

- 🏠 **Dashboard** - Tingnan ang iyong reading progress at statistics
- 🔍 **Discover** - Maghanap ng bagong manga at manhwa mula sa AniList API
- 📚 **Library** - I-manage ang iyong personal na manga collection
- 📖 **Manga Details** - Tingnan ang detalye ng bawat manga
- 📊 **Reading Progress** - I-track ang iyong chapter progress
- 🕐 **Story Timeline** - Explore story arcs at events (with spoiler protection!)
- 📍 **Where Was I?** - Alamin kung saan ka tumigil sa pagbabasa
- 🔒 **Spoiler Protection** - Auto-lock ng events beyond your reading progress
- 📋 **Activity Feed** - Tingnan ang iyong reading history
- 👤 **Profile** - View your reading statistics
- ⚙️ **Settings** - Manage your preferences
- 💾 **Persistent Storage** - Lahat ng data ay naka-save sa localStorage
- 🌐 **Offline Mode** - Gumagana kahit walang internet (cached data)
- 📱 **Responsive Design** - Desktop at mobile friendly

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router
- **API:** AniList GraphQL API
- **Icons:** Lucide React

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/manhwa-timeline.git
cd manhwa-timeline

# Install dependencies
npm install

# Run development server
npm run dev
```

Pagkatapos, buksan ang `http://localhost:3000` sa iyong browser.

## 📦 Build for Production

```bash
npm run build
```

Ang output ay nasa `dist/` folder.

## 📁 Project Structure

```
src/
├── api/              # API integration (AniList)
├── components/       # Reusable UI components
├── data/             # Mock timeline data
├── layouts/          # Layout components
├── models/           # TypeScript types
├── pages/            # Page components
├── store/            # Zustand stores
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## 🎯 Key Features Explained

### Story Timeline
Ang signature feature ng app! Nagpapakita ng story arcs at events para sa mga popular na manga. May spoiler protection na auto-locks ng events beyond your current reading progress.

### Where Was I?
Kapag bumalik ka sa isang manga, ipapakita nito:
- Last read chapter
- Current arc
- Last story event
- Next chapter to read

### Activity Tracking
Lahat ng actions (add to library, read chapter, etc.) ay naka-record sa activity feed, grouped by date.

## 📝 Note

- Ang manga data ay galing sa [AniList API](https://anilist.co/)
- Ang story timeline data ay curated demo data para sa demonstration
- Lahat ng user data ay naka-store locally sa browser (localStorage)

## 🤝 Contributing

Feel free to fork, modify, at mag-submit ng pull requests!

## 📄 License

MIT License - feel free to use this project for learning or personal use.

---

Made with ❤️ for manga and manhwa readers
