# 🚀 Quick Start Guide - Health Tracker

Get the Health Tracker application up and running in minutes!

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- OpenAI API key
- Git

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd health-tracker
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Set Up Environment Variables

Create a `.env.local` file in the `health-tracker` directory:

```bash
# Database Connection (Neon PostgreSQL)
POSTGRES_URL=postgresql://user:password@host/database?sslmode=require

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Authentication
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Serverless Configuration (Optional)
DATABASE_TIMEOUT=10000
DATABASE_MAX_RETRIES=3
```

**⚠️ IMPORTANT**: Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## 4. Initialize the Database

The database schema will be created automatically on first run. To manually initialize:

```bash
npm run dev
```

The application will create the necessary tables on startup.

---

## 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 6. Access the Application

1. Open `http://localhost:3000` in your browser
2. Create a new user or select an existing user
3. Start tracking your health metrics!

---

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

---

## Features

✅ User authentication and management  
✅ Health metrics tracking (8+ metrics)  
✅ Analytics dashboard with trends  
✅ AI-powered health insights  
✅ Data export (CSV, Markdown, HTML, Text)  
✅ Mobile-responsive design  
✅ Real-time data visualization  

---

## Supported Health Metrics

- Blood Pressure
- Weight
- Steps
- Heart Rate
- Sleep
- Water Intake
- Exercise Duration
- Mood

---

## Database Setup (Neon)

1. Create a free account at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Add to `.env.local` as `POSTGRES_URL`

---

## OpenAI Setup

1. Create an account at https://openai.com
2. Generate an API key
3. Add to `.env.local` as `OPENAI_API_KEY`

---

## Troubleshooting

### "Cannot find module 'pg'"
```bash
npm install pg @types/pg
```

### "Database connection failed"
- Verify `POSTGRES_URL` is correct
- Check database is running
- Ensure SSL mode is enabled

### "OpenAI API error"
- Verify `OPENAI_API_KEY` is correct
- Check API key has sufficient credits
- Verify API key is not expired

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```

---

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables
5. Deploy!

See `VERCEL_IMPLEMENTATION_GUIDE.md` for detailed instructions.

---

## Documentation

- **README.md** - Project overview
- **VERCEL_IMPLEMENTATION_GUIDE.md** - Vercel deployment guide
- **SECURITY.md** - Security best practices
- **PROJECT_STRUCTURE.md** - Project architecture

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the documentation files
3. Check GitHub issues

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Install dependencies
3. ✅ Start development server
4. ✅ Create a user account
5. ✅ Add health metrics
6. ✅ View analytics dashboard
7. ✅ Generate AI insights
8. ✅ Export your data

---

**Happy tracking! 🎉**

