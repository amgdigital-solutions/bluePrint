import { jwtVerify, SignJWT } from "jose";

export const AUTH_COOKIE = "auth-token";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type Session = {
  userId: string;
  email: string;
  name: string;
  role: "user" | "admin";
};

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for authentication.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: Session, rememberMe = true) {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${rememberMe ? SESSION_TTL_SECONDS : 60 * 60 * 8}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token?: string | null): Promise<Session | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "user" && payload.role !== "admin")
    ) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = (rememberMe = true) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: rememberMe ? SESSION_TTL_SECONDS : 60 * 60 * 8,
});
