// types/myroomstate.ts
import type { Room } from "colyseus.js";
import type { MapSchema } from "@colyseus/schema";

export interface Player { x: number; y: number; color: string; tick: number}
export interface MyRoomState { players: MapSchema<Player>; }
export type MainRoom = Room<MyRoomState>;
