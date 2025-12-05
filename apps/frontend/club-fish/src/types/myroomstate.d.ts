import type { Room } from "colyseus.js";
import type { MapSchema } from "@colyseus/schema";

export interface Player { x: number; y: number; color: string; tick: number, displayName: string, userId: string,  equippedHat?: string; equippedAccessory?: string; equippedBackground?: string; equippedBracelet?: string; }
export interface MyRoomState { players: MapSchema<Player>; }
export type MainRoom = Room<MyRoomState>;
