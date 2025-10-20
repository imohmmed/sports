# AlAli Sport - Sports Streaming Platform

## Overview

AlAli Sport is a subscription-based sports streaming platform dedicated to Arabic-language football content, primarily offering live streaming of beIN Sports channels in multiple quality options (FHD, HD, LOW). It provides a premium viewing experience with Right-to-Left (RTL) Arabic language support, robust subscription management, and secure stream URL encryption. The platform features hierarchical channel organization (Categories > Groups > Channels), channel logos, backup streaming URLs for automatic fallback, and is designed for VPS deployment with Email/Password authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React, TypeScript, and Vite, utilizing `shadcn/ui` components based on Radix UI primitives. It features a "new-york" style dark theme by default, with an RTL-first design and comprehensive Arabic language support achieved using Tailwind CSS. Typography uses Cairo for Arabic and Inter for Latin text. The design is inspired by premium sports streaming platforms, featuring Netflix-style card layouts with hierarchical navigation (Category Tabs → Group Cards → Channel Dialogs), responsive grid layouts, and animated transitions for an enhanced user experience. Video playback is handled by HLS.js, supporting adaptive streaming, quality selection, automatic fallback to backup URLs, and cross-browser fullscreen functionality.

### Technical Implementations

The backend, developed with Express.js and TypeScript, uses Email/Password authentication with bcrypt hashing via Passport.js Local Strategy (migrated from Replit OIDC for VPS deployment compatibility) and PostgreSQL (Neon serverless) for data persistence, managed with Drizzle ORM. Key security features include AES-256-CBC encryption for stream URLs, session-based authentication with HTTP-only cookies, and active session tracking with an "Auto Session Replacement System" that instantly terminates previous sessions when a new stream is accessed. The RESTful API provides endpoints for authentication (login/register/logout), hierarchical channel listing (categories with groups and channels), encrypted stream retrieval with backup URLs, session management (including heartbeat and cleanup), and an admin dashboard for user and subscription management.

### Feature Specifications

- **Email/Password Authentication**: Secure bcrypt password hashing with Passport.js Local Strategy, designed for VPS deployment (migrated from Replit OIDC).
- **Hierarchical Channel Organization**: Three-tier structure (Categories > Groups > Channels) with Arabic names and display ordering:
  - Categories: أخبار (News), رياضة (Sports), عامة (General)
  - Groups: Organized collections like "Al Jazeera Network", "beIN Sports", "Saudi Channels", etc.
  - Channels: Individual streaming channels with logos and quality options
- **Channel Logos**: All channels include logo URLs for enhanced visual presentation.
- **Backup URL System**: Each stream quality (FHD/HD/LOW) includes primary and backup encrypted URLs for automatic fallback.
- **Subscription Management**: Supports 1, 2, 3, 6, or 12-month subscriptions with automatic expiration checks.
- **Concurrent Device Management**: Enforces one active stream per user by automatically replacing older sessions.
- **Stream Proxy System**: Handles HLS stream proxying, M3U8 playlist rewriting, and resolves CORS issues.
- **Admin Dashboard**: Provides statistics on total users, active/expired subscriptions, and inactive users, along with tools to activate or deactivate user subscriptions.

### System Design Choices

- **Authentication**: Email/Password with bcrypt hashing via Passport.js Local Strategy for VPS deployment compatibility.
- **Data Storage**: PostgreSQL with Drizzle ORM for type-safe and scalable data handling.
- **Content Organization**: Three-tier hierarchical structure (categories → channelGroups → channels) with foreign key relationships.
- **Content Protection**: Encrypted stream URLs both at rest and in transit, with backup URLs also encrypted.
- **Session Handling**: Server-side sessions with a 7-day TTL and a heartbeat mechanism for active session monitoring.
- **API Security**: CSRF protection, role-based access control for admin functionalities, and secure cookie practices.

## External Dependencies

1.  **Neon Serverless PostgreSQL**: The primary database solution, utilizing `@neondatabase/serverless` for connection.
2.  **Telegram**: Used as an external link for subscription support and activation (t.me/mohmmed).
3.  **HLS stream URLs from tecflix.vip**: Third-party service providing sports streaming content, with URLs encrypted by the platform.
4.  **Google Fonts**: Used for custom typography (Cairo, Inter).
5.  **Key npm Libraries**:
    *   `@radix-ui/*`: Headless UI components.
    *   `@tanstack/react-query`: Server state management.
    *   `hls.js`: HLS video streaming.
    *   `drizzle-orm`: Type-safe database ORM.
    *   `express-session`, `passport`, `bcrypt`: Authentication and session management.
    *   `crypto`: Node.js built-in module for encryption/decryption.