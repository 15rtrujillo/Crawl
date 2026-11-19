import {type GameState, withEnemy, withPlayer} from "./models/gameState.ts";
import {Action, movementDeltas} from "./action.ts";
import {type Enemy, moveTo} from "./models/entity.ts";
import {add, manhattanDistance, equals, type Position, euclideanSq} from "./models/position.ts";
import {Tile, tileAt} from "./models/dungeon.ts";

const isOccupied = (s: GameState, pos: Position): boolean =>
  equals(s.player.position, pos) || s.enemies.some(e => equals(e.position, pos));

const canMoveTo = (s: GameState, pos: Position): boolean =>
  tileAt(s.dungeon, pos) === Tile.floor && !isOccupied(s, pos);

const tryMovePlayer = (s: GameState, delta: Position): GameState => {
  const newPos = add(s.player.position, delta);
  if (canMoveTo(s, newPos)) {
    return withPlayer(s, p => moveTo(p, newPos));
  }

  return s;
};

const playerTurn = (s: GameState, action: Action): GameState => {
  switch (action) {
    case Action.moveUp:
    case Action.moveRight:
    case Action.moveDown:
    case Action.moveLeft:
      return tryMovePlayer(s, movementDeltas[action]);
  }

  return s;
};

const moveToPlayer = (s: GameState, e: Enemy): GameState => {
  const dx = s.player.position.x - e.position.x;
  const dy = s.player.position.y - e.position.y;
  const xStep = { x: Math.sign(dx), y: 0 };
  const yStep = { x: 0, y: Math.sign(dy) };
  const steps = Math.abs(dx) > Math.abs(dy) ? [xStep, yStep] : [yStep, xStep];

  for (const step of steps) {
    if (step.x === 0 && step.y === 0) continue;
    const newPos = add(e.position, step);
    if (canMoveTo(s, newPos)) {
      return withEnemy(s, e.id, en => moveTo(en, newPos));
    }
  }
  return s;
};

const enemiesTurn = (s: GameState): GameState => {
  let afterEnemies = s;
  for (const { id } of s.enemies) {
    const enemy = afterEnemies.enemies.find(e => e.id === id);
    if (!enemy) continue;

    if (manhattanDistance(enemy.position, afterEnemies.player.position) === 1) {
      // attack
    } else if (euclideanSq(enemy.position, afterEnemies.player.position) <= enemy.detectionRadius * enemy.detectionRadius) {
      afterEnemies = moveToPlayer(afterEnemies, enemy);
    } else {
      // Randomly move (or don't)
    }
  }

  return afterEnemies;
};

export const update = (s: GameState, action: Action): GameState => {
  const afterPlayer = playerTurn(s, action);
  if (afterPlayer === s) {
    return s;
  }

  return enemiesTurn(afterPlayer);
};
