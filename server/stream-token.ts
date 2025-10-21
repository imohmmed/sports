import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.SESSION_SECRET || "default-secret-key-change-in-production";
const TOKEN_EXPIRY = "15m"; // 15 minutes

interface StreamTokenPayload {
  channelId: string;
  quality: string;
  server: string;
  urlHash: string; // Hash of URL for validation (not the URL itself)
  url?: string; // Optional: for nested resources (segments, sub-playlists) that aren't in DB
}

export function generateStreamToken(
  url: string,
  channelId: string,
  quality: string,
  server: string,
  includeUrl: boolean = false // For nested resources, include URL in token
): string {
  // Create hash of URL for validation without exposing it
  const urlHash = crypto.createHash('sha256').update(url).digest('hex').substring(0, 16);
  
  const payload: StreamTokenPayload = {
    channelId,
    quality,
    server,
    urlHash,
  };
  
  // For nested resources (segments, sub-playlists), include URL since they're not in DB
  if (includeUrl) {
    payload.url = url;
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyStreamToken(token: string): StreamTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as StreamTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Validate that the actual URL matches the hash in the token
export function validateUrlHash(url: string, urlHash: string): boolean {
  const actualHash = crypto.createHash('sha256').update(url).digest('hex').substring(0, 16);
  return actualHash === urlHash;
}
