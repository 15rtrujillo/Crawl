import {type GameState, getEnemy, getEntity, withEnemy, withEntity, withPlayer, withRng} from "./models/gameState.ts";
import {Action, movementDeltas} from "./action.ts";
import {damage, type Enemy, moveTo} from "./models/entity.ts";
import {add, manhattanDistance, equals, type Position, euclideanSq} from "./models/position.ts";
import {Tile, tileAt} from "./models/dungeon.ts";
import type {Emit, GameEvent, TurnResult} from "./event.ts";
import {nextInt} from "./rng.ts";

type PlayerTurn = { state: GameState, tookTurn: boolean };

const isOccupied = (s: GameState, pos: Position): boolean =>
  equals(s.player.position, pos) || s.enemies.some(e => equals(e.position, pos));

const canMoveTo = (s: GameState, pos: Position): boolean =>
  tileAt(s.dungeon, pos) === Tile.floor && !isOccupied(s, pos);

const death = (s: GameState, id: string, emit: Emit): GameState => {
  if (id === s.player.id) {
    emit({ type: "playerDied" });
    return s;
  }

  const enemy = getEnemy(s, id);
  if (!enemy) return s;

  const [roll, afterRng] = withRng(s, rng => nextInt(rng, 1, 100));
  const potion = roll <= enemy.potionDropChance;
  emit({ type: "died", enemyName: enemy.name });
  emit({ type: "lootDropped", gold: enemy.goldDrop, potion });
  return {
    ...withPlayer(afterRng, p => ({ ...p, gold: p.gold + enemy.goldDrop, potions: p.potions + (potion ? 1 : 0) })),
    enemies: afterRng.enemies.filter(e => e.id !== id),
  };
};

const attack = (s: GameState, attackerId: string, targetId: string, emit: Emit): GameState => {
  const attacker = getEntity(s, attackerId);
  if (!attacker) return s;
  const target = getEntity(s, targetId);
  if (!target) return s;

  const [roll, afterRng] = withRng(s, rng => nextInt(rng, 1, attacker.attackPower));
  emit({ type: "attacked", attackerId, targetId, amount: roll });
  const afterDamage = withEntity(afterRng, targetId, e => damage(e, roll));
  const after = getEntity(afterDamage, targetId);
  return after && after.hp <= 0 ? death(afterDamage, targetId, emit) : afterDamage;
};

const tryMovePlayer = (s: GameState, delta: Position, emit: Emit): PlayerTurn => {
  const newPos = add(s.player.position, delta);
  const target = s.enemies.find(e => equals(e.position, newPos));
  if (target) {
    return { state: attack(s, s.player.id, target.id, emit), tookTurn: true };
  }

  if (canMoveTo(s, newPos)) {
    emit({ type: "playerMoved", to: newPos });
    return { state: withPlayer(s, p => moveTo(p, newPos)), tookTurn: true };
  }

  emit({ type: "moveBlocked", at: newPos });
  return { state: s, tookTurn: false };
};

const playerTurn = (s: GameState, action: Action, emit: Emit): PlayerTurn => {
  switch (action) {
    case Action.moveUp:
    case Action.moveRight:
    case Action.moveDown:
    case Action.moveLeft:
      return tryMovePlayer(s, movementDeltas[action], emit);
  }

  return { state: s, tookTurn: false };
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

const enemiesTurn = (s: GameState, emit: Emit): GameState => {
  let afterEnemies = s;
  for (const { id } of s.enemies) {
    if (afterEnemies.player.hp === 0) break;

    const enemy = getEnemy(afterEnemies, id);
    if (!enemy) continue;

    if (manhattanDistance(enemy.position, afterEnemies.player.position) === 1) {
      afterEnemies = attack(afterEnemies, id, s.player.id, emit)
    } else if (euclideanSq(enemy.position, afterEnemies.player.position) <= enemy.detectionRadius * enemy.detectionRadius) {
      afterEnemies = moveToPlayer(afterEnemies, enemy);
    } else {
      // Randomly move (or don't)
    }
  }

  return afterEnemies;
};

export const update = (s: GameState, action: Action): TurnResult => {
  const events: GameEvent[] = [];
  const emit: Emit = e => events.push(e);

  const afterPlayer = playerTurn(s, action, emit);
  if (!afterPlayer.tookTurn) {
    return { events, state: s };
  }

  return { events, state: enemiesTurn(afterPlayer.state, emit) };
};
