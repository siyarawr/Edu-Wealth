# Edu Wealth

A comprehensive student platform combining financial management and seminar planning.

## Overview

Edu Wealth is a full-stack web application designed to help students manage their academic and professional journey. It combines financial tracking, career opportunities, and educational resources in one place.

## Authentication

- Uses custom email/password authentication with Passport.js
- Passwords hashed with bcrypt (10 salt rounds)
- Sessions stored in PostgreSQL using connect-pg-simple
- All routes require authentication (no fallback to default user)
- Landing page shown to unauthenticated users

## Features

- **Dashboard**: Overview of expenses, upcoming seminars, and quick stats
- **Expense Tracking**: Track expenses by category with budgeting and visual charts
- **Internship Finder**: Browse internship opportunities with filtering by type and location
- **Scholarship Finder**: Discover scholarships filtered by country
- **Acceptance Calculator**: Estimate university acceptance rates based on GPA, SAT scores, and extracurriculars
- **Entrepreneurship Library**: Educational content for aspiring entrepreneurs
- **Seminar Calendar**: Browse and manage seminar schedules
- **AI-Powered Notes**: Paste text and generate intelligent notes using OpenAI integration
- **Calendar**: Schedule events with 4-day/7-day toggle views and color-coded event types
- **Meeting Notes**: Share notes with granular permissions

## Tech Stack

- **Frontend**: React with TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy, bcrypt for password hashing
- **AI Integration**: OpenAI via Replit AI Integrations (gpt-4o model)
- **State Management**: TanStack React Query
- **Routing**: Wouter

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and query client
├── server/                 # Backend Express server
│   ├── auth/               # Authentication (localAuth.ts)
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database storage layer
│   ├── db.ts               # Database connection
│   └── seed.ts             # Database seeding script
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle ORM schemas
├── extension/              # Chrome Web Store extension
│   ├── manifest.json       # Chrome extension manifest v3
│   ├── popup.html          # Extension popup UI
│   ├── popup.js            # Popup functionality
│   ├── background.js       # Service worker
│   └── icons/              # Extension icons
└── design_guidelines.md    # Frontend design specifications
```

## Chrome Extension

The `extension/` folder contains a Chrome Web Store extension for quick access to the app.

### Installation (Development)
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension` folder

### Publishing to Chrome Web Store
1. Create icon files (16x16, 48x48, 128x128 PNG)
2. Update `APP_URL` in popup.js and background.js to deployed URL
3. Zip the extension folder
4. Upload to Chrome Web Store Developer Dashboard

## Database Schema

- **users**: User accounts with email/password
- **expenses**: User expense records
- **budgets**: Monthly budget limits by category
- **internships**: Internship listings
- **scholarships**: Scholarship opportunities
- **seminars**: Seminar events
- **seminarNotes**: AI-generated notes for seminars
- **entrepreneurContent**: Educational content for entrepreneurs
- **calendarEvents**: User calendar events
- **meetingNotes**: Meeting notes with sharing permissions

## Running the Application

The application runs on port 5000 with both frontend and backend served together.

```bash
npm run dev
```

## Database Commands

```bash
npm run db:push    # Push schema changes to database
npx tsx server/seed.ts  # Seed initial data
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user
- `GET/POST /api/expenses` - Expense CRUD
- `GET/POST /api/budgets` - Budget management
- `GET /api/internships` - List internships
- `GET /api/scholarships` - List scholarships (with country filter)
- `GET /api/seminars` - List seminars
- `GET/POST/DELETE /api/notes` - AI-generated notes
- `POST /api/notes/generate` - Generate AI notes from pasted text
- `GET /api/entrepreneur-content` - Entrepreneurship resources
- `GET/POST/PATCH/DELETE /api/calendar` - Calendar events
- `GET/POST /api/meeting-notes` - Meeting notes

## Design

Uses a hybrid Linear/Material Design aesthetic with:
- Inter font for UI
- JetBrains Mono for financial data
- Teal/cyan accent colors
- Support for dark/light themes
