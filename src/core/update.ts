import {type GameState, withEnemy, withPlayer} from "./models/gameState.ts";
import {Action, movementDeltas} from "./action.ts";
import {type Enemy, moveTo} from "./models/entity.ts";
import {add, manhattanDistance, equals, type Position, euclideanSq} from "./models/position.ts";
import {Tile, tileAt} from "./models/dungeon.ts";

const isOccupied = (s: GameState, pos: Position): boolean =>
  equals(s.player.position, pos) || s.enemies.some(e => equals(e.position, pos));

const tryMovePlayer = (s: GameState, delta: Position): GameState => {
  const newPos = add(s.player.position, delta);
  const tile = tileAt(s.dungeon, newPos)
  if (tile === Tile.floor && !isOccupied(s, newPos)) {
    return withPlayer(s, p => moveTo(p, newPos))
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

const moveEnemyRelToPlayer = (s: GameState, e: Enemy, axis: "x" | "y"): GameState => {
  const sign = Math.sign(
    axis === "x"
      ? s.player.position.x - e.position.x
      : s.player.position.y - e.position.y
  );
  if (sign !== 0) {
    const newPos = add(e.position, axis === "x" ? { x: sign, y: 0 } : { x: 0, y: sign });
    const tile = tileAt(s.dungeon, newPos);
    if (tile === Tile.floor && !isOccupied(s, newPos)) {
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
    } else if (euclideanSq(enemy.position, afterEnemies.player.position) <= Math.pow(enemy.detectionRadius, 2)) {
      let tryMoveToPlayer = moveEnemyRelToPlayer(afterEnemies, enemy, "x");
      if (tryMoveToPlayer === afterEnemies) {
        tryMoveToPlayer = moveEnemyRelToPlayer(afterEnemies, enemy, "y");
      }
      afterEnemies = tryMoveToPlayer;
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
