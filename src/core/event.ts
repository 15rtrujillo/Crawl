import type {Position} from "./models/position.ts";
import type {GameState} from "./models/gameState.ts";

export type GameEvent =
  | { type: "playerMoved"; to: Position }
  | { type: "moveBlocked"; at: Position }
  | { type: "attacked"; attackerId: string; targetId: string; amount: number }
  | { type: "died"; entityId: string }
  | { type: "potionDrunk"; healed: number }
  | { type: "noPotions" }
  | { type: "lootDropped"; gold: number; potion: boolean }
  | { type: "playerDied" };

export interface TurnResult {
  readonly state: GameState;
  readonly events: readonly GameEvent[];
}

export type Emit = (e: GameEvent) => void;
