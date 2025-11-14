import { MapSchema, Schema, type } from "@colyseus/schema";

export interface InputData {
  x: 0;
  y: 0;
  tick: number;
}

export class Player extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("string") color: string;
  @type("string") displayName: string;
  @type("number") tick: number;
  @type("number") currency: number;
  inputQueue: InputData[] = [];
}
export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

}
