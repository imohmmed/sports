# AlAli Sport - Sports Streaming Platform

## Overview

AlAli Sport is a subscription-based sports streaming platform focused on Arabic-language football/soccer content. The application provides live streaming of beIN Sports channels with multiple quality options (FHD, HD, LOW). The platform features a premium viewing experience with RTL (Right-to-Left) Arabic language support, subscription management, and secure stream URL encryption.

The project is built as a full-stack web application with a React frontend and Express backend, utilizing PostgreSQL for data persistence and Replit's authentication system for user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, bundled using Vite

**UI Component System**: The application uses shadcn/ui components built on Radix UI primitives, providing a comprehensive set of accessible, customizable components. The design system follows a "new-york" style variant with dark mode as the primary theme.

**Styling Approach**: Tailwind CSS with extensive customization for RTL Arabic support. The design is inspired by premium sports streaming platforms (DAZN, ESPN+, beIN Sports) with Netflix-style card layouts. Custom CSS variables enable theme switching between dark and light modes.

**Typography**: Uses Cairo font for Arabic text and Inter for numbers/Latin text, loaded from Google Fonts.

**State Management**: TanStack Query (React Query) for server state management, with custom query client configuration for API requests.

**Routing**: Wouter for client-side routing, providing a lightweight alternative to React Router.

**Video Playback**: HLS.js for adaptive streaming of encrypted video URLs, supporting multiple quality levels per channel.

**Key Design Decisions**:
- RTL-first design with Arabic as the primary language
- Dark mode prioritized for premium viewing experience
- Component-based architecture with reusable UI elements
- Responsive grid layouts for channel display
- Animated transitions and hover effects for enhanced UX

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**Authentication Strategy**: Replit's OpenID Connect (OIDC) integration using Passport.js strategy. Session-based authentication with PostgreSQL session storage (connect-pg-simple). This provides seamless authentication within the Replit environment.

**Security Measures**:
- Stream URL encryption using AES-256-CBC cipher to protect content URLs
- Session-based authentication with secure, HTTP-only cookies
- Active session tracking for concurrent device management
- CSRF protection through session validation

**API Design**: RESTful API with the following key endpoints:
- `/api/auth/*` - Authentication flow (login, logout, user info)
- `/api/channels` - Public channel listing with quality options
- `/api/stream` - Encrypted stream URL retrieval (subscription-required)
- `/api/admin/*` - Admin operations for subscription management

**Database ORM**: Drizzle ORM with PostgreSQL, providing type-safe database operations and schema management.

**Real-time Features**: WebSocket support for active session heartbeat monitoring and concurrent device enforcement.

**Key Design Decisions**:
- Session-based auth chosen over JWT for better security and session control
- URL encryption protects premium content from unauthorized access
- Separation of public (channel list) and protected (stream URLs) endpoints
- Admin functionality segregated with role-based access control

### Data Storage Solutions

**Database**: PostgreSQL (via Neon serverless)

**Schema Design**:

1. **sessions** - Passport session storage (required for Replit Auth)
   - Stores serialized session data with expiration timestamps
   - Indexed on expiry for efficient cleanup

2. **users** - User accounts and subscription status
   - Fields: id, email, firstName, lastName, profileImageUrl, isSubscribed, isAdmin
   - Tracks subscription status and admin privileges
   - Integrates with Replit OIDC for user identity

3. **channels** - Sports channel definitions
   - Fields: id, name, displayOrder
   - Supports ordering for UI presentation

4. **channelStreams** - Stream URLs per channel and quality
   - Fields: id, channelId, quality (FHD/HD/LOW), encryptedUrl
   - Multiple streams per channel for quality selection
   - URLs are encrypted at rest

5. **activeSessions** - Concurrent device tracking
   - Fields: id, userId, sessionToken, channelId, lastHeartbeat
   - Enables enforcement of concurrent viewing limits
   - Automatically cleaned up on expiration

**Database Connection**: Neon serverless PostgreSQL with WebSocket support for connection pooling.

**Migration Strategy**: Drizzle Kit for schema migrations with push-based deployment.

**Key Design Decisions**:
- Normalized schema separating channels from stream quality options
- Encrypted URLs stored in database for content protection
- Active session tracking enables business rule enforcement (device limits)
- UUID primary keys for security and scalability

### Authentication and Authorization

**Provider**: Replit OpenID Connect (OIDC)

**Flow**:
1. User initiates login via `/api/login` endpoint
2. Redirect to Replit OIDC provider for authentication
3. Callback to `/api/login/callback` with authorization code
4. Exchange code for tokens and create user session
5. User information synchronized to local database

**Session Management**:
- Server-side sessions stored in PostgreSQL
- 7-day session TTL with automatic renewal
- Secure, HTTP-only cookies for session tokens
- Session cleanup on logout or expiration

**Authorization Levels**:
1. **Unauthenticated** - Can view channel list (locked state)
2. **Authenticated (Not Subscribed)** - Can view subscription prompts
3. **Authenticated (Subscribed)** - Full access to stream playback
4. **Admin** - Subscription management capabilities

**Middleware**:
- `isAuthenticated` - Protects routes requiring login
- Role-based checks for admin functionality
- Query-level authorization for subscription-only content

**Key Design Decisions**:
- Leverages Replit's authentication infrastructure
- Local user table maintains subscription state separate from auth provider
- Session-based approach enables server-side validation and session revocation
- Admin flag in user table for role-based access control

### External Dependencies

**Third-Party Services**:

1. **Replit OpenID Connect (OIDC)**
   - Purpose: User authentication and identity management
   - Integration: Passport.js with openid-client strategy
   - Environment variables: REPL_ID, ISSUER_URL, SESSION_SECRET

2. **Neon Serverless PostgreSQL**
   - Purpose: Primary database with WebSocket support
   - Connection: @neondatabase/serverless driver
   - Environment variables: DATABASE_URL

3. **Telegram**
   - Purpose: Subscription support contact (t.me/mohmmed)
   - Integration: External link for user support
   - Used for subscription activation requests

**Content Delivery**:
- HLS stream URLs from tecflix.vip (third-party sports streaming service)
- URLs encrypted server-side before storage and transmission
- Client-side HLS.js handles adaptive bitrate streaming

**Font Resources**:
- Google Fonts (Cairo, Inter)
- Loaded via client HTML for Arabic and Latin typography

**Build Tools**:
- Vite (frontend bundling and dev server)
- esbuild (backend bundling for production)
- Drizzle Kit (database migrations)
- TypeScript (type checking)

**Key npm Dependencies**:
- @radix-ui/* - Headless UI component primitives
- @tanstack/react-query - Server state management
- hls.js - HLS video streaming
- drizzle-orm - Type-safe database ORM
- express-session - Session management
- passport - Authentication middleware
- ws - WebSocket support

**Environment Requirements**:
- DATABASE_URL - PostgreSQL connection string
- ENCRYPTION_KEY - AES-256 encryption key for stream URLs
- SESSION_SECRET - Express session signing secret
- REPL_ID - Replit deployment identifier
- REPLIT_DOMAINS - Allowed domains for OIDC
- ISSUER_URL - OIDC provider endpoint (default: https://replit.com/oidc)

**Key Design Decisions**:
- Minimal external service dependencies for reliability
- Encryption key management via environment variables
- WebSocket support for real-time session management
- Third-party stream URLs encrypted to prevent unauthorized access
- Neon serverless PostgreSQL chosen for Replit compatibility and WebSocket support