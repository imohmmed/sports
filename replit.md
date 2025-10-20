# AlAli Sport - Sports Streaming Platform

## Overview

AlAli Sport is a subscription-based sports streaming platform dedicated to Arabic-language football content, primarily offering live streaming of beIN Sports channels in multiple quality options (FHD, HD, LOW). It provides a premium viewing experience with Right-to-Left (RTL) Arabic language support, robust subscription management, and secure stream URL encryption. The platform aims to be a leading destination for Arabic sports enthusiasts, offering a seamless and protected streaming service.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React, TypeScript, and Vite, utilizing `shadcn/ui` components based on Radix UI primitives. It features a "new-york" style dark theme by default, with an RTL-first design and comprehensive Arabic language support achieved using Tailwind CSS. Typography uses Cairo for Arabic and Inter for Latin text. The design is inspired by premium sports streaming platforms, featuring Netflix-style card layouts, responsive grid layouts, and animated transitions for an enhanced user experience. Video playback is handled by HLS.js, supporting adaptive streaming, quality selection, and cross-browser fullscreen functionality.

### Technical Implementations

The backend, developed with Express.js and TypeScript, leverages Replit's OpenID Connect (OIDC) via Passport.js for authentication and PostgreSQL (Neon serverless) for data persistence, managed with Drizzle ORM. Key security features include AES-256-CBC encryption for stream URLs, session-based authentication with HTTP-only cookies, and active session tracking with an "Auto Session Replacement System" that instantly terminates previous sessions when a new stream is accessed. The RESTful API provides endpoints for authentication, channel listing, encrypted stream retrieval, session management (including heartbeat and cleanup), and an admin dashboard for user and subscription management.

### Feature Specifications

- **Subscription Management**: Supports 1, 2, 3, 6, or 12-month subscriptions with automatic expiration checks.
- **Concurrent Device Management**: Enforces one active stream per user by automatically replacing older sessions.
- **Stream Proxy System**: Handles HLS stream proxying, M3U8 playlist rewriting, and resolves CORS issues.
- **Admin Dashboard**: Provides statistics on total users, active/expired subscriptions, and inactive users, along with tools to activate or deactivate user subscriptions.

### System Design Choices

- **Authentication**: Replit OIDC for seamless integration and Passport.js for session management.
- **Data Storage**: PostgreSQL with Drizzle ORM for type-safe and scalable data handling.
- **Content Protection**: Encrypted stream URLs both at rest and in transit.
- **Session Handling**: Server-side sessions with a 7-day TTL and a heartbeat mechanism for active session monitoring.
- **API Security**: CSRF protection, role-based access control for admin functionalities, and secure cookie practices.

## External Dependencies

1.  **Replit OpenID Connect (OIDC)**: Used for user authentication and identity management.
2.  **Neon Serverless PostgreSQL**: The primary database solution, utilizing `@neondatabase/serverless` for connection.
3.  **Telegram**: Used as an external link for subscription support and activation (t.me/mohmmed).
4.  **HLS stream URLs from tecflix.vip**: Third-party service providing sports streaming content, with URLs encrypted by the platform.
5.  **Google Fonts**: Used for custom typography (Cairo, Inter).
6.  **Key npm Libraries**:
    *   `@radix-ui/*`: Headless UI components.
    *   `@tanstack/react-query`: Server state management.
    *   `hls.js`: HLS video streaming.
    *   `drizzle-orm`: Type-safe database ORM.
    *   `express-session`, `passport`, `openid-client`: Authentication and session management.
    *   `crypto`: Node.js built-in module for encryption/decryption.