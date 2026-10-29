function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export interface RandomSource {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(values: readonly T[]): T;
}

export function seededRandom(seed: string): RandomSource {
  let state = hashSeed(seed) || 0x9e3779b9;
  const next = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(min, max) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    pick<T>(values: readonly T[]) {
      if (!values.length) throw new Error("Cannot pick from an empty list");
      return values[Math.floor(next() * values.length)] as T;
    }
  };
}

export function freshSeed(): string {
  const values = new Uint32Array(4);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(8, "0")).join("");
}
