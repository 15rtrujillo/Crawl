export interface Position {
  readonly x: number;
  readonly y: number;
}

export const equals = (p1: Position, p2: Position) =>
  p1.x === p2.x && p1.y === p2.y;

export const add = (p1: Position, p2: Position): Position =>
  ({ x: p1.x + p2.x, y: p1.y + p2.y });

export const subtract = (p1: Position, p2: Position): Position =>
  ({ x: p1.x - p2.x, y: p1.y - p2.y });

export const manhattanDistance = (p1: Position, p2: Position): number =>
  Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);

export const euclideanSq = (p1: Position, p2: Position): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
};
