# AlAli Sport - Sports & News Streaming Platform

## Overview

AlAli Sport is a **free, open-access** streaming platform offering live Arabic-language content across two categories: **Sports Channels** (beIN Sports network) and **News Channels** (44 Arabic and international news channels including Al Jazeera, Al Arabiya, Lebanese channels, and international outlets). The platform provides multiple quality options (FHD, HD, LOW) and server options (main/BK backup) with Right-to-Left (RTL) Arabic language support and secure stream URL encryption.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React, TypeScript, and Vite, utilizing `shadcn/ui` components based on Radix UI primitives. It features a "new-york" style dark theme by default, with an RTL-first design and comprehensive Arabic language support achieved using Tailwind CSS. Typography uses Cairo for Arabic and Inter for Latin text. The design is inspired by premium sports streaming platforms, featuring Netflix-style card layouts, responsive grid layouts, and animated transitions for an enhanced user experience. Video playback is handled by HLS.js, configured as **LIVE broadcast mode** with seeking disabled, low-latency streaming, quality selection, and cross-browser fullscreen functionality (including native iOS Safari fullscreen support via webkitEnterFullscreen).

### Technical Implementations

The backend is a minimal Express.js + TypeScript server that provides:
- **Channel Listing API**: Public endpoint (`/api/channels`) returning all available channels with category, servers, and quality options
- **Stream Token Generation**: Public endpoint (`/api/stream/:channelId/:quality?server=main|BK`) that generates JWT-signed URLs with 15-minute expiry
- **Secure Streaming**: Protected endpoint (`/api/secure-stream?token=...`) that:
  - Validates JWT tokens with signature and expiry verification
  - Rebuilds master playlist URLs from database (not exposed in token)
  - Accepts nested resource URLs from token payload (segments, sub-playlists)
  - Streams content with backpressure handling and Range support
  - Rewrites M3U8 playlists to use signed URLs for all nested resources
  - Enforces hostname whitelist (tecflix.vip) to prevent SSRF
  - Returns proper cache headers (private, max-age for segments)
- **Stream Protection**: All stream URLs are time-limited (15min), channel-specific, and hash-validated to prevent URL theft and tampering

The frontend is a **pure client-side application** with:
- **No Authentication**: Direct access to all channels and streams
- **No Subscription Management**: All content is freely accessible
- **Category Tabs**: Home page with tabs for Sports and News categories
- **Server Selection**: Users can switch between main and BK backup servers
- **Quality Selection**: Users can switch between FHD, HD, and LOW quality streams in real-time

### Feature Specifications

- **Open Access**: No login or subscription required - all channels accessible to everyone
- **Category System**: Separate tabs for Sports (beIN Sports) and News (44 channels) with channel counts
- **Multi-Server Support**: Main and BK backup servers for each channel with automatic failover capability
- **Stream Proxy System**: Backend proxies HLS streams with SSRF protection (hostname whitelist validation)
- **Cross-Browser Fullscreen**: Standard fullscreen API for desktop/Android, native video fullscreen for iOS Safari
- **Quality & Server Switching**: Real-time quality (FHD/HD/LOW) and server (main/BK) changes without page reload
- **RTL Arabic UI**: Complete right-to-left layout with Arabic typography

### System Design Choices

- **No User Authentication**: Removed all user authentication and session management for simplicity
- **Stream Security**: JWT-based token authentication for all stream URLs (15-minute expiry)
- **Minimal Backend**: Only provides channel data, stream token generation, and secure streaming
- **Data Storage**: PostgreSQL with Drizzle ORM stores channel and stream information (no user data)
- **Content Protection**: 
  - Stream URLs are AES-256-CBC encrypted at rest
  - JWT tokens generated on-demand with channel-specific payload
  - Tokens expire after 15 minutes to prevent URL theft
  - Tokens cannot be reused across different channels
- **Performance**: Direct streaming with proper cache headers for video segments (max-age: 1 year)

## External Dependencies

1. **Neon Serverless PostgreSQL**: The primary database solution for channel/stream storage
2. **HLS stream URLs from tecflix.vip**: Third-party service providing sports streaming content
3. **Google Fonts**: Used for custom typography (Cairo, Inter)
4. **Key npm Libraries**:
    - `@radix-ui/*`: Headless UI components
    - `@tanstack/react-query`: Server state management
    - `hls.js`: HLS video streaming with adaptive bitrate
    - `drizzle-orm`: Type-safe database ORM
    - `express`: Minimal backend server
    - `crypto`: Node.js built-in module for encryption/decryption
    - `wouter`: Lightweight routing for React
    - `lucide-react`: Icon library

## Recent Changes (October 21, 2025)

### Phase 1: Platform Simplification
- **REMOVED**: All authentication and login system (Replit OIDC, Passport.js)
- **REMOVED**: All subscription management (no user accounts, subscriptions, or admin dashboard)
- **REMOVED**: Session tracking and heartbeat system
- **SIMPLIFIED**: Backend now only provides channel data, stream decryption, and HLS proxy
- **SIMPLIFIED**: Frontend is pure client-side with direct access to all content
- **SIMPLIFIED**: Removed all user-related pages (Landing, Dashboard, Admin, Auth)

### Phase 2: Category System & News Channels
- **ADDED**: Category system with "sports" and "news" categories
- **ADDED**: 44 news channels including:
  - Al Jazeera network (Main, Mubasher, Documentary, English)
  - Al Arabiya network (Main, Hadath, English, Business)
  - Lebanese channels (LBCI, OTV, MTV Lebanon, Future TV, NBN)
  - International news (BBC Arabic, DW Arabic, France 24, RT, Press TV)
  - And many more Arabic news sources
- **ADDED**: Multi-server support (main and BK backup) for all channels
- **ADDED**: Category tabs on homepage to filter channels by type
- **ADDED**: Server selector in video player for manual server switching
- **SECURITY**: Added hostname whitelist validation to proxy endpoint to prevent SSRF attacks

### Phase 3: Performance & Security Enhancements
- **SECURITY**: Implemented JWT-based stream authentication with 15-minute token expiry
- **PERFORMANCE**: New `/api/secure-stream` endpoint for faster, direct streaming with token validation
- **SECURITY**: All stream URLs now protected with signed tokens to prevent URL theft
- **PERFORMANCE**: Added proper cache headers (public, max-age for video segments)
- **VALIDATION**: Enhanced stream URL validation with content-type checking
- **SECURITY**: Tokens are channel-specific and time-limited, preventing unauthorized access

### Phase 4: Advanced Security & Performance (Current)
- **SECURITY ENHANCEMENT**: Dual JWT approach for maximum security:
  - Master playlists: JWT contains only channelId, quality, server, urlHash (URL rebuilt from database)
  - Nested resources: JWT contains channelId, quality, server, urlHash, and URL (not in database)
- **STREAMING PERFORMANCE**: Implemented true streaming with:
  - ReadableStream support with backpressure handling (drain events)
  - AbortController for timeout (30s) and client disconnect handling
  - Forward Range headers for partial content support (206 responses)
  - Forward conditional headers (If-Range, If-None-Match, If-Modified-Since)
  - Proper 304 Not Modified handling with ETag/Last-Modified
- **M3U8 PARSING**: Enhanced playlist rewriting with:
  - #EXT-X-KEY URI support (encryption keys)
  - #EXT-X-MAP URI support (initialization segments)
  - Query string support in segment URLs (e.g., segment.ts?token=abc)
  - Support for multiple segment types (.ts, .m3u8, .m4s, .mp4, .aac, .vtt)
- **CACHE OPTIMIZATION**: Refined cache headers:
  - Playlists: `private, no-cache, must-revalidate` (always fresh)
  - Segments: `private, max-age=3600` (1 hour cache)
- **SECURITY HARDENING**:
  - SESSION_SECRET required at startup (prevents weak JWT signatures)
  - Hostname whitelist enforced (tecflix.vip only)
  - `/api/proxy-stream` disabled (HTTP 410 Gone) to prevent JWT bypass
  - URL hash validation for all token types (prevents tampering)
- **LIVE BROADCAST MODE**: Video player configured for live streaming:
  - Native video controls disabled (no seek bar or timeline)
  - Seeking prevented - any attempt returns to live edge
  - Low-latency HLS configuration (3s sync duration)
  - "LIVE" badge with animated indicator
  - Right-click context menu disabled
  - Picture-in-picture disabled for live broadcasts
- **KNOWN LIMITATIONS**:
  - Tokens can be replayed across devices during 15-minute validity (no session binding)
  - No rate limiting on `/api/secure-stream` endpoint
  - Fixed 30s timeout for all content types

## Application Structure

### Backend Routes
- `GET /api/channels` - Returns all channels with category, servers, and quality options per server
- `GET /api/stream/:channelId/:quality?server=main|BK` - Generates JWT-signed stream URL with 15-minute expiry
- `GET /api/secure-stream?token=<jwt>` - Validates token and streams content with proper caching, backpressure, and Range support
- `GET /api/proxy-stream` - **DISABLED** (returns HTTP 410 Gone) for security reasons

### Frontend Pages
- `/` - HomePage: Displays channels filtered by category (sports/news) with tab navigation
- `/player/:id` - Player: Video player with server selection (main/BK) and quality selection (FHD/HD/LOW)

### Key Components
- `Header`: Logo, theme toggle (dark/light mode)
- `ChannelGrid`: Grid display of channels with category filtering support
- `VideoPlayer`: HLS player with server selection, quality selection, and fullscreen controls
- `Footer`: Simple footer with branding
- `Tabs`: Category navigation (Sports/News) with channel counts

## Database Schema

### Channels Table
- `id` (varchar, primary key): Unique channel identifier
- `name` (varchar): Display name (Arabic)
- `category` (varchar): Channel category ("sports" or "news")

### ChannelStreams Table
- `id` (serial, primary key): Auto-increment ID
- `channelId` (varchar, foreign key): References channels.id
- `serverName` (varchar): Server identifier ("main" or "BK")
- `quality` (varchar): Stream quality (FHD, HD, LOW)
- `encryptedUrl` (text): AES-256-CBC encrypted HLS stream URL

### Channel Categories
- **Sports**: beIN Sports channels (1-7, Premium 1-3, NBA, AFC, Xtra 1-2)
- **News**: 44 Arabic and international news channels across major networks
