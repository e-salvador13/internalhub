# InternalHub

Simple app hosting for AI-generated tools. Upload, share, done.

## Features

- 📦 **Drag & drop upload** — HTML, CSS, JS, images
- 🔐 **Password protected** — Single password for your hub
- 🔗 **Shareable links** — Get a URL to share your apps
- ⭐ **Favorites** — Star apps you use often
- 🔍 **Search** — Find apps quickly

## Quick Start

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

**Default password:** `demo123`

## Configuration

Create `.env.local` in the `web` folder:

```env
# Set your password
IH_PASSWORD=your-secure-password

# Optional: Custom data directory
# DATA_DIR=/path/to/data
```

## How It Works

1. **Login** with the password
2. **Drag & drop** files onto the upload zone
3. **Get a link** to view/share your app
4. **Publish** when ready to share

## Data Storage

All data is stored locally:
- `data/store.json` — App metadata
- `data/uploads/` — Uploaded files

No database required.

## Deploy

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set `IH_PASSWORD` in environment variables
4. Deploy

**Note:** For persistent storage on Vercel, connect external storage (e.g., Vercel Blob, S3).

### Self-Hosted

```bash
npm run build
npm start
```

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS
- Local JSON + file storage

---

*Upload your AI creations. Share with anyone. Simple.*
