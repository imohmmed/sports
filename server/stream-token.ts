import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "default-secret-key-change-in-production";
const TOKEN_EXPIRY = "15m"; // 15 minutes

interface StreamTokenPayload {
  url: string;
  channelId: string;
  quality: string;
  server: string;
}

export function generateStreamToken(
  url: string,
  channelId: string,
  quality: string,
  server: string
): string {
  const payload: StreamTokenPayload = {
    url,
    channelId,
    quality,
    server,
  };

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
