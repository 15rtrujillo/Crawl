import type {Enemy, Entity, Player} from "./entity.ts";
import {type Dungeon, createTestDungeon} from "./dungeon.ts";
import {createRng, type Rng} from "../rng.ts";

export interface GameState {
  readonly player: Player;
  readonly enemies: readonly Enemy[];
  readonly dungeon: Dungeon;
  readonly rng: Rng;
}

export const getEntity = (s: GameState, id: string): Entity | undefined =>
  s.player.id === id ? s.player : s.enemies.find(e => e.id === id);

export const withEntity = (s: GameState, id: string, f: <E extends Entity>(e: E) => E): GameState =>
  s.player.id === id ? withPlayer(s, f) : withEnemy(s, id, f);

export const withPlayer = (s: GameState, f: (p: Player) => Player): GameState =>
  ({ ...s, player: f(s.player) });

export const withEnemy = (s: GameState, id: string, f: (e: Enemy) => Enemy): GameState => {
  if (!s.enemies.some(e => e.id === id)) return s;
  return { ...s, enemies: s.enemies.map(e => (e.id === id ? f(e) : e)) };
};

export const withRng = <T>(s: GameState, f: (rng: Rng) => [T, Rng]): [T, GameState] => {
  const [roll, rng] = f(s.rng);
  return [roll, { ...s, rng }];
};

export const createTestGame = (seed: number): GameState => ({
  player: {
    id: "player",
    name: "Test",
    rep: "P",
    hp: 10,
    maxHp: 10,
    attackPower: 1,
    position: { x: 2, y: 3 },
    gold: 0,
    potions: 0,
  },
  enemies: [
    {
      id: "enemy",
      name: "Test Enemy",
      rep: "e",
      hp: 5,
      maxHp: 5,
      attackPower: 1,
      position: { x: 9, y: 2 },
      detectionRadius: 7,
      goldDrop: 2,
      potionDropChance: 100,
    }
  ],
  dungeon: createTestDungeon(),
  rng: createRng(seed),
});
