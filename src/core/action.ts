import type {Position} from "./models/position.ts";

export const Action = {
  moveUp: 0,
  moveRight: 1,
  moveLeft: 2,
  moveDown: 3,
  attack: 4,
  drinkPotion: 5,
} as const;

export type Action = (typeof Action)[keyof typeof Action];

type MoveAction = typeof Action.moveUp | typeof Action.moveRight | typeof Action.moveDown | typeof Action.moveLeft;
export const movementDeltas: Record<MoveAction, Position> = {
  [Action.moveUp]: {x: 0, y: -1},
  [Action.moveRight]: {x: 1, y: 0},
  [Action.moveDown]: {x: 0, y: 1},
  [Action.moveLeft]: {x: -1, y: 0},
};
