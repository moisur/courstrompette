import jwt from "jsonwebtoken";
import { AccessTokenPayload } from "@/lib/auth/types";
import { createRefreshTokenValue, hashOpaqueToken } from "@/lib/auth/security";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/lib/auth/constants";

function requiredEnv(name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "type">): string {
  return jwt.sign(
    {
      ...payload,
      type: "access",
    } satisfies AccessTokenPayload,
    requiredEnv("JWT_ACCESS_SECRET"),
    {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, requiredEnv("JWT_ACCESS_SECRET"));
    if (typeof decoded !== "object" || decoded === null) {
      return null;
    }
    if (decoded.type !== "access" || typeof decoded.sub !== "string" || typeof decoded.role !== "string") {
      return null;
    }
    if (decoded.role !== "ADMIN" && decoded.role !== "STUDENT") {
      return null;
    }

    return {
      sub: decoded.sub,
      role: decoded.role as AccessTokenPayload["role"],
      studentId: typeof decoded.studentId === "string" ? decoded.studentId : undefined,
      type: "access",
    };
  } catch {
    return null;
  }
}

export function issueRefreshToken(): {
  token: string;
  tokenHash: string;
  expiresAt: Date;
} {
  const token = createRefreshTokenValue();
  return {
    token,
    tokenHash: hashOpaqueToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
  };
}
