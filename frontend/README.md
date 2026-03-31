# Netflix Clone - Frontend

Modern React/Next.js 14 frontend for Netflix Clone project.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # User dashboard
│   ├── trending/          # Trending movies
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   ├── auth/             # Auth components
│   └── movies/           # Movie components
├── contexts/             # React contexts
│   └── auth.tsx          # Auth context & hooks
├── lib/                  # Utilities
│   └── api/             # API client
├── services/            # API services
├── types/              # TypeScript types
├── styles/             # Global styles
└── public/             # Static assets
```

## 🔐 Authentication Flow

1. **Register/Login** - Create account or authenticate
2. **JWT Tokens** - Access & Refresh tokens stored in localStorage
3. **Auto Refresh** - Tokens automatically refreshed on 401
4. **Protected Routes** - Dashboard requires authentication

## 🎬 Features

- ✅ User authentication (Register/Login)
- ✅ Profile management
- ✅ Trending movies from TMDB
- ✅ Watchlist management
- ✅ Responsive design
- ✅ Dark theme (Netflix-like)

## 📚 API Integration

Frontend connects to backend at `http://localhost:3001/api`

### Key Endpoints:
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /profiles` - Get user profiles
- `POST /profiles` - Create profile
- `GET /trending/movies` - Get trending movies
- `GET /watchlist/:profileId` - Get watchlist
- `POST /watchlist` - Add to watchlist
- `DELETE /watchlist/:itemId` - Remove from watchlist

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (Ready to integrate)
- **HTTP Client**: Axios
- **API State**: React Query (Ready to integrate)
- **Validation**: React Hook Form (Ready to integrate)
- **Notifications**: React Hot Toast
- **UI Components**: Shadcn/ui (Ready to integrate)

## 📝 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

## 🧪 Testing

```bash
npm test
```

## 📦 Build & Deploy

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```bash
docker build -t netflix-clone-frontend .
docker run -p 3000:3000 netflix-clone-frontend
```

## 🔗 Links

- Backend: [Backend Documentation](../backend/)
- API: `http://localhost:3001/api`
- Frontend Dev: `http://localhost:3000`

## 📄 License

MIT

## 👨‍💻 Author

Natan Furletti
