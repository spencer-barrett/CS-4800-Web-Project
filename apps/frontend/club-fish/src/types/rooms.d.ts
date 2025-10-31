import { Room } from "colyseus.js"; 
export interface PlayerState {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

export interface MainRoomState {
  players: Record<string, PlayerState>;
  worldTime: number;
  id: string;
}

export type MainRoom = Room<MainRoomState>;

