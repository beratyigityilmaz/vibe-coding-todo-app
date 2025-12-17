# replit.md

## Overview

This is a Todo List application - a simple, focused productivity tool for managing tasks. The app follows a utility-first design approach inspired by modern productivity apps like Things, Todoist, and Linear, emphasizing clarity, efficiency, and minimal visual noise.

The application is a full-stack TypeScript project with a React frontend and Express backend, though currently tasks are persisted client-side via localStorage rather than through the backend API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Query (@tanstack/react-query) for server state, React useState for local state
- **Styling**: Tailwind CSS with CSS variables for theming
- **Component Library**: shadcn/ui (Radix UI primitives with custom styling)
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Pattern**: REST API with `/api` prefix for routes
- **Build**: esbuild for production bundling

### Data Layer
- **Current State**: Tasks stored in browser localStorage (client-side only)
- **ORM**: Drizzle ORM configured for PostgreSQL (ready for database integration)
- **Schema Validation**: Zod for runtime type validation, drizzle-zod for schema integration
- **Database Config**: PostgreSQL via DATABASE_URL environment variable

### Project Structure
```
client/           # Frontend React application
  src/
    components/ui/  # shadcn/ui components
    pages/          # Route pages (home, not-found)
    hooks/          # Custom React hooks
    lib/            # Utilities and query client
server/           # Backend Express application
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data storage interface
shared/           # Shared code between client/server
  schema.ts       # Zod schemas and types
```

### Key Design Decisions
1. **Client-side persistence**: Tasks currently use localStorage for simplicity; storage interface exists for future database migration
2. **Single-column layout**: Focused, distraction-free UI following productivity app conventions
3. **Type sharing**: Shared schema between frontend and backend via `@shared` alias
4. **Component architecture**: Pre-built shadcn/ui components for consistent, accessible UI

## External Dependencies

### Database
- **PostgreSQL**: Configured via Drizzle ORM but not currently used for task storage
- **Drizzle Kit**: Database migration tooling (`npm run db:push`)

### UI Component Libraries
- **Radix UI**: Accessible primitive components (checkbox, dialog, dropdown, etc.)
- **Embla Carousel**: Carousel component
- **cmdk**: Command palette component
- **Vaul**: Drawer component
- **react-day-picker**: Calendar/date picker

### Build & Development
- **Vite**: Frontend build and dev server
- **esbuild**: Production server bundling
- **tsx**: TypeScript execution for development

### Fonts
- **Inter**: Primary font loaded via Google Fonts