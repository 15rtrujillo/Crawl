import type {Player} from "./entity.ts";
import type {Dungeon} from "./dungeon.ts";

export interface GameState {
  player: Player;
  dungeon: Dungeon;
}