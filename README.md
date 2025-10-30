# 💚 Health Tracker

A professional health tracking web application built with Next.js, TypeScript, and PostgreSQL. Track your health metrics, visualize trends, get AI-powered insights, and export your data in multiple formats.

**Live Demo:** [health.noblevision.com](https://health.noblevision.com)

## ✨ Features

### 📊 Comprehensive Health Metrics Tracking

- **Blood Pressure** - Track systolic, diastolic, and pulse (e.g., "120/80 mmHg (72 bpm)")
- **Weight** - Monitor weight changes over time
- **Steps** - Daily step count tracking
- **Heart Rate** - Resting and active heart rate monitoring
- **Sleep** - Track sleep duration and quality
- **Water Intake** - Monitor daily hydration
- **Exercise Duration** - Log workout sessions
- **Mood** - Daily mood tracking (1-10 scale)

### 📈 Analytics Dashboard

- **30-Day Trends** - Visualize metric trends with interactive charts
- **Current Values** - See your latest measurements at a glance
- **Statistics** - Average, min, max, and trend analysis
- **7-Day Projections** - Linear regression-based predictions
- **Responsive Design** - Mobile-first interface optimized for all devices

### 🤖 AI-Powered Insights

- OpenAI GPT-4o-mini integration
- Personalized health recommendations
- Trend analysis and pattern recognition
- Actionable health suggestions

### 📤 Multi-Format Data Export

- **CSV** - For spreadsheet analysis
- **Markdown** - For documentation and sharing
- **HTML** - For web viewing and printing
- **Plain Text** - For simple text editors

### 🔐 User Authentication

- Secure user registration and login
- Session management
- User-specific data isolation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon serverless PostgreSQL)
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/NobleVision/HEALTH.git
cd health-tracker
```

1. Install dependencies:

```bash
npm install
```

1. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:

```bash
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
```

1. Run the development server:

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

The application automatically initializes the database schema on first run. The `/api/init` endpoint creates:

- `users` table - User accounts
- `health_metrics` table - Health metric entries with composite data support

## 🏗️ Architecture

### Tech Stack

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL (Neon serverless)
- **Charts:** Recharts
- **AI:** OpenAI API (GPT-4o-mini)
- **Deployment:** Vercel

### Project Structure

```text
health-tracker/
├── app/
│   ├── api/
│   │   ├── ai-insights/    # AI-powered health insights
│   │   ├── export/         # Data export endpoints
│   │   ├── init/           # Database initialization
│   │   ├── metrics/        # Metrics CRUD operations
│   │   └── users/          # User management
│   ├── components/
│   │   ├── DataEntryForm.tsx    # Health metric input form
│   │   ├── Dashboard.tsx        # Analytics dashboard
│   │   └── AuthContext.tsx      # Authentication provider
│   ├── page.tsx            # Login page
│   └── dashboard/          # Dashboard page
├── lib/
│   ├── db.ts              # Database connection
│   ├── analytics.ts       # Analytics functions
│   └── auth-context.tsx   # Auth context provider
└── public/                # Static assets
```

## 📋 Blood Pressure Tracking

Blood pressure is now tracked with full medical accuracy:

### Data Entry

- **Systolic** - Top number (e.g., 120)
- **Diastolic** - Bottom number (e.g., 80)
- **Pulse** - Optional heart rate (e.g., 72 bpm)

### Display Format

- Dashboard: `165/95 mmHg (58 bpm)`
- Exports: Same format across all export types
- Analytics: Separate trend analysis for systolic and diastolic

### Database Storage

Blood pressure data is stored as composite JSON:

```json
{
  "systolic": 165,
  "diastolic": 95,
  "pulse": 58
}
```

## 🔄 API Endpoints

### Metrics

- `GET /api/metrics?userId={id}&days={days}` - Fetch metrics
- `POST /api/metrics` - Create new metric entry

### Users

- `GET /api/users` - List all users
- `POST /api/users` - Create new user

### AI Insights

- `POST /api/ai-insights?userId={id}` - Get AI health insights

### Export

- `GET /api/export?userId={id}&format={format}&days={days}` - Export data
  - Formats: `csv`, `markdown`, `html`, `text`

### Database

- `GET /api/init` - Initialize database schema

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub:

```bash
git push origin main
```

1. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Add environment variables (DATABASE_URL, OPENAI_API_KEY)
   - Click "Deploy"

The application will automatically:

- Build and optimize the Next.js app
- Initialize the database schema
- Deploy to Vercel's global CDN

### Environment Variables (Vercel)

```bash
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
```

## 📊 Recent Updates

### October 29, 2024 - Blood Pressure Enhancement

- ✅ Added composite data support for blood pressure (systolic/diastolic/pulse)
- ✅ Updated data entry form with dedicated blood pressure input fields
- ✅ Display blood pressure in standard medical format (e.g., "120/80 mmHg")
- ✅ Added pulse tracking alongside blood pressure
- ✅ Updated all export formats to show blood pressure correctly
- ✅ Added database migration for existing deployments
- ✅ Maintained backward compatibility with legacy single-value entries

### Previous Updates

- Database initialization endpoint for Vercel deployment
- OpenAI API integration for health insights
- Multi-format data export (CSV, Markdown, HTML, Plain Text)
- Responsive mobile-first UI
- 30-day trend analysis with 7-day projections

## 🛠️ Development

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Format Code

```bash
npm run format
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.
