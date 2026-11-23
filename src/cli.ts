import {emitKeypressEvents, type Key} from "node:readline";
import {type GameState, createTestGame, getEntity} from "./core/models/gameState.ts";
import {Tile} from "./core/models/dungeon.ts";
import {Action} from "./core/action.ts";
import {update} from "./core/update.ts";
import type {GameEvent} from "./core/event.ts";

const keyActions: Record<string, Action> = {
  w: Action.moveUp,
  a: Action.moveLeft,
  s: Action.moveDown,
  d: Action.moveRight,
  up: Action.moveUp,
  left: Action.moveLeft,
  down: Action.moveDown,
  right: Action.moveRight,
  p: Action.drinkPotion,
};

const render = (s: GameState): string => {
  const screen: string[][] = s.dungeon.map(row =>
    row.map(c => c === Tile.wall ? "#" : " "));

  for (const enemy of s.enemies) {
    const x = enemy.position.x;
    const y = enemy.position.y;
    if (screen[y]?.[x] !== undefined) {
      screen[y][x] = enemy.rep;
    }
  }

  const x = s.player.position.x;
  const y = s.player.position.y;
  if (screen[y]?.[x] !== undefined) {
    screen[y][x] = s.player.rep;
  }

  return screen.map(row => row.join("")).join("\n");
};

const draw = (s: GameState, e?: readonly GameEvent[]): void => {
  process.stdout.write(
    "\x1b[2J\x1b[H" + render(s) + `\nHP ${s.player.hp}/${s.player.maxHp} ` +
    `Gold: ${s.player.gold} Potions: ${s.player.potions}\nWASD/arrows: move  p: potion  q: quit\n`,
  );

  if (!e) return;
  for (const event of e) {
    let message: string;
    switch (event.type) {
      case "playerMoved":
        message = `You moved to (${event.to.x}, ${event.to.y}).`;
        break;
      case "moveBlocked":
        message = "You cannot move there!";
        break;
      case "attacked": {
        const attacker = getEntity(s, event.attackerId);
        if (!attacker) continue;
        const target = getEntity(s, event.targetId);
        if (!target) continue;

        if (event.attackerId === s.player.id) {
          message = `You hit ${target.name} for ${event.amount}! ${target.hp} HP remaining.`;
        } else {
          message = `${attacker.name} hit you for ${event.amount}!`;
        }
        break;
      }
      case "died":
        message = `${event.enemyName} died!`
        break;
      case "lootDropped":
        message = `You received ${event.gold} gold` + (event.potion ? " and a potion!" : "!");
        break;
      case "playerDied":
        message = "Oh dear! You have died!";
        return;
      default:
        message = "Nothing interesting happened...";
        break;
    }
    process.stdout.write(message + "\n");
  }
};

const quit = (): void => {
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.stdin.pause();
};

const main = (): void => {
  let state = createTestGame(Date.now());

  emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  process.stdin.on("keypress", (_str: string | undefined, key: Key | undefined) => {
    if (key?.name === "q" || (key?.ctrl && key.name === "c")) return quit();

    const action = key?.name !== undefined ? keyActions[key.name] : undefined;
    if (action === undefined) return;

    const result = update(state, action);
    state = result.state;
    draw(state, result.events);
    if (state.player.hp <= 0) {
      quit();
      return;
    }
  });

  draw(state);
};

main();
