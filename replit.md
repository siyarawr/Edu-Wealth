# StudentHub

A comprehensive student platform combining financial management and seminar planning.

## Overview

StudentHub is a full-stack web application designed to help students manage their academic and professional journey. It combines financial tracking, career opportunities, and educational resources in one place.

## Features

- **Dashboard**: Overview of expenses, upcoming seminars, and quick stats
- **Expense Tracking**: Track expenses by category with budgeting and visual charts
- **Internship Finder**: Browse internship opportunities with filtering by type and location
- **Scholarship Finder**: Discover scholarships filtered by country
- **Acceptance Calculator**: Estimate university acceptance rates based on GPA, SAT scores, and extracurriculars
- **Entrepreneurship Library**: Educational content for aspiring entrepreneurs
- **Seminar Calendar**: Browse and manage seminar schedules
- **AI-Powered Notes**: Generate intelligent notes from seminar content using OpenAI integration

## Tech Stack

- **Frontend**: React with TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
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
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database storage layer
│   ├── db.ts               # Database connection
│   └── seed.ts             # Database seeding script
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle ORM schemas
└── design_guidelines.md    # Frontend design specifications
```

## Database Schema

- **users**: User accounts
- **expenses**: User expense records
- **budgets**: Monthly budget limits by category
- **internships**: Internship listings
- **scholarships**: Scholarship opportunities
- **seminars**: Seminar events
- **seminarNotes**: AI-generated notes for seminars
- **entrepreneurContent**: Educational content for entrepreneurs

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

- `GET/POST /api/expenses` - Expense CRUD
- `GET/POST /api/budgets` - Budget management
- `GET /api/internships` - List internships
- `GET /api/scholarships` - List scholarships (with country filter)
- `GET /api/seminars` - List seminars
- `GET/POST/DELETE /api/notes` - AI-generated notes
- `POST /api/notes/generate` - Generate AI notes from content
- `GET /api/entrepreneur-content` - Entrepreneurship resources

## Design

Uses a hybrid Linear/Material Design aesthetic with:
- Inter font for UI
- JetBrains Mono for financial data
- Teal/cyan accent colors
- Support for dark/light themes
