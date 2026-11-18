import type {Position} from "./position.ts";

export interface Entity {
  readonly id: string;
  readonly name: string;
  readonly position: Position;
  readonly hp: number;
  readonly maxHp: number;
  readonly attackPower: number;
}

export interface Player extends Entity {
  readonly gold: number;
  readonly potions: number;
}

export interface Enemy extends Entity {
  readonly lineOfSight: number;
  readonly goldDrop: number;
  readonly potionDropChance: number;
}

export const damage = <E extends Entity>(e: E, amount: number): E =>
  ({ ...e, hp: Math.max(e.hp - amount, 0) });

export const heal = <E extends Entity>(e: E, amount: number): E =>
  ({ ...e, hp: Math.min(e.hp + amount, e.maxHp) });

export const fullHeal = <E extends Entity>(e: E): E =>
  ({ ...e, hp: e.maxHp });

export const moveTo = <E extends Entity>(e: E, newPos: Position): E =>
  ({ ...e, position: newPos });
