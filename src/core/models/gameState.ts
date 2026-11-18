import type {Enemy, Player} from "./entity.ts";
import type {Dungeon} from "./dungeon.ts";
import type {Rng} from "../rng.ts";

export interface GameState {
  readonly player: Player;
  readonly enemies: readonly Enemy[];
  readonly dungeon: Dungeon;
  readonly rng: Rng;
}

export const withPlayer = (s: GameState, f: (p: Player) => Player): GameState =>
  ({ ...s, player: f(s.player) });

export const withEnemy = (s: GameState, id: string, f: (e: Enemy) => Enemy): GameState => {
  if (!s.enemies.some(e => e.id === id)) return s;
  return { ...s, enemies: s.enemies.map(e => (e.id === id ? f(e) : e)) };
};