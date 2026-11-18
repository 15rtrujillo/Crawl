export interface Rng {
  readonly seed: number;
}

export const createRng = (seed: number): Rng => ({ seed: seed | 0 });

/** Returns a float in [0, 1). */
export const nextFloat = (rng: Rng): [number, Rng] => {
  const a = (rng.seed + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), a | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, { seed: a }];
};

/** Returns an integer in [min, max]. */
export const nextInt = (rng: Rng, min: number, max: number): [number, Rng] => {
  const [f, r] = nextFloat(rng);
  return [min + Math.floor(f * (max - min + 1)), r];
};

/** Picks a random element from a non-empty array. */
export const pick = <T>(rng: Rng, items: readonly [T, ...T[]]): [T, Rng] => {
  const [i, r] = nextInt(rng, 0, items.length - 1);
  return [items[i]!, r];
};
