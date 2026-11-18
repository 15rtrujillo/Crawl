import type {Position} from "./position.ts";

export const Tile = {
  floor: 0,
  wall: 1,
} as const;

export type Tile = (typeof Tile)[keyof typeof Tile];

export type Dungeon = readonly ( readonly Tile[])[];

export const onTile = (d: Dungeon, pos: Position): Tile | undefined => {
  return d[pos.y]?.[pos.x];
};