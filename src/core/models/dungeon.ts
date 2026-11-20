import type {Position} from "./position.ts";

export const Tile = {
  floor: 0,
  wall: 1,
} as const;

export type Tile = (typeof Tile)[keyof typeof Tile];

export type Dungeon = readonly ( readonly Tile[])[];

export const tileAt = (d: Dungeon, pos: Position): Tile | undefined =>
  d[pos.y]?.[pos.x];

export const createTestDungeon = (): Dungeon =>
  [
    "############",
    "#....#.....#",
    "#....#.....#",
    "#..........#",
    "#....#..#..#",
    "#....#.....#",
    "############",
  ].map(row => [...row].map(c => (c === "#" ? Tile.wall : Tile.floor)));
