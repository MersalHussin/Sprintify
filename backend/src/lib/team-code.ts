import crypto from "node:crypto";

import { Team } from "../models/team";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

export function generateTeamCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }

  return code;
}

export function normalizeTeamCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function generateUniqueTeamCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateTeamCode();
    const existing = await Team.findOne({ code }).select("_id").lean();
    if (!existing) return code;
  }

  throw new Error("Failed to generate unique team code");
}
