# Overview

NoteBot AI is a full-stack web application designed to help students and professionals turn their notes into interactive conversations. The application leverages AI to provide document-based chat functionality alongside a comprehensive suite of study and productivity tools including PDF manipulation, text processing, citation generation, and creative design utilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with **React 18** using **TypeScript** and **Vite** for fast development and building. The UI follows a modern component-based architecture using:

- **shadcn/ui components** with Radix UI primitives for accessible, customizable components
- **Tailwind CSS** for styling with custom design tokens and CSS variables
- **React Router** for client-side routing with lazy loading for performance optimization
- **TanStack Query** for server state management and caching
- **React Hook Form** with Zod validation for form handling

The application uses a mobile-first responsive design approach with careful attention to performance through code splitting and lazy loading of tool pages.

## Backend Architecture

The backend follows a **serverless edge function** pattern using **Supabase Edge Functions** (Deno runtime) for API endpoints. The main Express.js server handles:

- Static file serving in production
- Development middleware with Vite integration
- Basic request logging and error handling
- Route registration through a modular system

The storage layer uses an abstraction pattern with both in-memory and database implementations, allowing for flexible data persistence strategies.

## Database & Data Storage

The application uses **PostgreSQL** as the primary database, accessed through:

- **Drizzle ORM** for type-safe database operations
- **Neon Database** as the serverless PostgreSQL provider
- **Supabase** for authentication, real-time features, and additional backend services

Database schema is managed through Drizzle migrations with a shared schema definition between client and server.

## Authentication & Authorization

Authentication is handled through **Supabase Auth** providing:

- Email/password authentication
- Session management with automatic token refresh
- Protected routes using React context and custom hooks
- Server-side authentication verification in edge functions

## AI Integration & External Services

The application implements a robust **multi-provider AI system** with automatic failover:

- **Primary providers**: Google Gemini, Groq, OpenRouter
- **Fallback chain** ensures service availability
- **Universal AI client** in edge functions handles provider switching
- **Rate limiting** and quota management per provider

Additional external integrations include:
- **Remove.bg API** for background removal
- **CrossRef API** for academic citation generation
- **PDF.js** for client-side PDF processing
- **Various document processing libraries** (mammoth for DOCX, pdf-lib for PDF manipulation)

## File Processing Pipeline

The application handles multiple file formats through:

- **Client-side extraction** for PDFs, DOCX, and text files
- **Streaming processing** for large documents
- **In-memory processing** to avoid server storage dependencies
- **Format conversion utilities** for various document types

## Development & Deployment Strategy

The project uses a **monorepo structure** with:

- **Shared schema definitions** between client and server
- **TypeScript path mapping** for clean imports
- **ESM modules** throughout the codebase
- **Vite dev server** with HMR for development
- **esbuild** for production server bundling

# External Dependencies

## Core Infrastructure
- **Supabase**: Authentication, database hosting, edge functions runtime
- **Neon Database**: Serverless PostgreSQL hosting
- **Vercel/Netlify** (likely deployment target based on setup)

## AI & ML Services
- **Google Gemini API**: Primary AI provider for text generation
- **Groq API**: High-speed inference for chat responses
- **OpenRouter**: Backup AI provider access
- **Remove.bg/Eremove.bg**: Image background removal service

## Document & File Processing
- **PDF.js**: Client-side PDF rendering and text extraction
- **pdf-lib**: PDF creation and manipulation
- **Mammoth.js**: DOCX to text conversion
- **CrossRef API**: Academic citation metadata

## Frontend Libraries
- **React**: UI framework with hooks and context
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **TanStack Query**: Server state management
- **React Router**: Client-side routing
- **next-themes**: Dark/light mode theming

## Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety and developer experience
- **Drizzle Kit**: Database schema management
- **ESLint/Prettier**: Code quality and formatting