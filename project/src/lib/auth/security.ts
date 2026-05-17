import bcrypt from "bcryptjs";
import crypto from "crypto";

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
const PASSWORD_LENGTH = 14;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 12);
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function hashOpaqueToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateRandomPassword(length = PASSWORD_LENGTH): string {
  const targetLength = Math.max(length, 10);
  let password = "";
  for (let i = 0; i < targetLength; i += 1) {
    const randomIndex = crypto.randomInt(0, PASSWORD_CHARS.length);
    password += PASSWORD_CHARS[randomIndex];
  }
  return password;
}

export function createRefreshTokenValue(): string {
  return crypto.randomBytes(48).toString("base64url");
}
