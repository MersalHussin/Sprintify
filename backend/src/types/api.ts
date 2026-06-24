export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseJsonUnknown(raw: string): unknown {
  return JSON.parse(raw) as unknown;
}

export function parseJsonArray<T>(raw: string): T[] {
  const parsed = parseJsonUnknown(raw);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

export function omitKeys<T extends Record<string, unknown>, K extends keyof T>(
  value: T,
  keys: readonly K[],
): Omit<T, K> {
  const result = { ...value };
  for (const key of keys) delete result[key];
  return result;
}
