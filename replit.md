# AlAli Sport - Sports Streaming Platform

## Overview

AlAli Sport is a **free, open-access** sports streaming platform dedicated to Arabic-language football content, offering live streaming of beIN Sports channels in multiple quality options (FHD, HD, LOW). It provides a premium viewing experience with Right-to-Left (RTL) Arabic language support and secure stream URL encryption. The platform aims to be a simple, accessible destination for Arabic sports enthusiasts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is built with React, TypeScript, and Vite, utilizing `shadcn/ui` components based on Radix UI primitives. It features a "new-york" style dark theme by default, with an RTL-first design and comprehensive Arabic language support achieved using Tailwind CSS. Typography uses Cairo for Arabic and Inter for Latin text. The design is inspired by premium sports streaming platforms, featuring Netflix-style card layouts, responsive grid layouts, and animated transitions for an enhanced user experience. Video playback is handled by HLS.js, supporting adaptive streaming, quality selection, and cross-browser fullscreen functionality (including native iOS Safari fullscreen support via webkitEnterFullscreen).

### Technical Implementations

The backend is a minimal Express.js + TypeScript server that provides:
- **Channel Listing API**: Public endpoint (`/api/channels`) returning all available channels with their quality options
- **Stream URL Decryption**: Public endpoint (`/api/stream/:channelId/:quality`) that decrypts stored stream URLs
- **HLS Proxy System**: Public endpoint (`/api/proxy-stream`) that proxies HLS streams to handle CORS and mixed content issues, including M3U8 playlist rewriting for absolute and relative URLs

The frontend is a **pure client-side application** with:
- **No Authentication**: Direct access to all channels and streams
- **No Subscription Management**: All content is freely accessible
- **Simple Navigation**: Home page with channel grid, player page for streaming
- **Quality Selection**: Users can switch between FHD, HD, and LOW quality streams in real-time

### Feature Specifications

- **Open Access**: No login or subscription required - all channels accessible to everyone
- **Stream Proxy System**: Backend proxies HLS streams to handle CORS, mixed content, and M3U8 playlist URL rewriting
- **Cross-Browser Fullscreen**: Standard fullscreen API for desktop/Android, native video fullscreen for iOS Safari
- **Quality Switching**: Real-time quality changes (FHD/HD/LOW) without page reload
- **RTL Arabic UI**: Complete right-to-left layout with Arabic typography

### System Design Choices

- **No Authentication**: Removed all authentication and session management for simplicity
- **Minimal Backend**: Only provides channel data, stream decryption, and proxy functionality
- **Data Storage**: PostgreSQL with Drizzle ORM stores channel and stream information (no user data)
- **Content Protection**: Stream URLs are AES-256-CBC encrypted at rest, decrypted on-demand
- **HLS Proxy**: Handles CORS issues and rewrites M3U8 playlists to route all requests through backend proxy

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

- **REMOVED**: All authentication and login system (Replit OIDC, Passport.js)
- **REMOVED**: All subscription management (no user accounts, subscriptions, or admin dashboard)
- **REMOVED**: Session tracking and heartbeat system
- **SIMPLIFIED**: Backend now only provides channel data, stream decryption, and HLS proxy
- **SIMPLIFIED**: Frontend is pure client-side with direct access to all content
- **SIMPLIFIED**: Removed all user-related pages (Landing, Dashboard, Admin, Auth)
- **SIMPLIFIED**: Created single HomePage that displays all channels without login requirement

## Application Structure

### Backend Routes
- `GET /api/channels` - Returns all channels with available quality options
- `GET /api/stream/:channelId/:quality` - Returns decrypted stream URL for given channel and quality
- `GET /api/proxy-stream?url=<encoded_url>` - Proxies HLS streams and rewrites M3U8 playlists

### Frontend Pages
- `/` - HomePage: Displays all available channels in a grid layout
- `/player/:id` - Player: Video player for selected channel with quality selection

### Key Components
- `Header`: Logo, theme toggle (dark/light mode)
- `ChannelGrid`: Grid display of all available channels
- `VideoPlayer`: HLS player with quality selection and fullscreen controls
- `Footer`: Simple footer with branding

## Database Schema

### Channels Table
- `id` (varchar, primary key): Unique channel identifier
- `name` (varchar): Display name (Arabic)

### Streams Table
- `id` (serial, primary key): Auto-increment ID
- `channelId` (varchar, foreign key): References channels.id
- `quality` (varchar): Stream quality (FHD, HD, LOW)
- `encryptedUrl` (text): AES-256-CBC encrypted HLS stream URL
