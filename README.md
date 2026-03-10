# 🍽 Recipe App

An AI-powered recipe management platform for Indian & international cuisines.

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| AI | Groq API (llama-3.1-8b-instant) |
| Auth | express-session + connect-mongo |

## ✨ Features

- **Chef AI** — AI-powered personal chef: custom recipes, nutrition tables, food-only responses
- **Fridge to Fork** — Visual ingredient shelf → smart recipe matching (Ready / 1 Away / Potential)
- **My Cookbook** — Save recipes with collections, ratings & personal notes
- **AI Taste Profile** — Groq analyses your saved recipes to generate a personalised taste identity
- **Dashboard** — Beautiful welcome, today's Indian picks, quick stats
- **Home** — Cinematic hero with parallax food photography, marquee ticker, animated counters

## 📁 Project Structure

```
Recipe App/
├── Backend/            # Express API
│   ├── controllers/    # Route handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── index.js        # Server entry point
├── Frontend/           # React (Vite)
│   ├── src/
│   │   ├── pages/      # Route-level components
│   │   ├── components/ # Reusable UI
│   │   ├── hooks/      # Custom hooks (useAuth)
│   │   └── utils/      # API utility
│   └── public/         # Static assets
└── .gitignore
```

## ⚙️ Setup

### Backend
```bash
cd Backend
npm install
# Create .env (see .env.example)
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## 🔐 Environment Variables

### Backend `.env`
```
MONGO_URI=mongodb+srv://...
SESSION_SECRET=your_secret
GROQ_API_KEY=gsk_...
NODE_ENV=development
PORT=5000
```

### Frontend `.env` (optional)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/recipes/dashboard` | Dashboard recipes |
| GET | `/api/recipes/search` | Search by ingredients |
| POST | `/api/ai/chats` | Create Chef AI chat |
| POST | `/api/ai/chat` | Send message to Chef AI |
| GET | `/api/cookbook` | Get saved recipes |
| POST | `/api/cookbook` | Save a recipe |
| GET | `/api/cookbook/taste-profile` | AI taste profile |
| POST | `/api/ai/pantry-insight` | Fridge-to-fork AI insight |

## 🌐 Deployment

- **Frontend**: Vercel / Netlify (build: `npm run build`, output: `dist/`)
- **Backend**: Render / Railway (start: `node index.js`)
- **DB**: MongoDB Atlas

---
*Built with ❤️ for Indian kitchens*
