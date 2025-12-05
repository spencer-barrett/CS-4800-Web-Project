import { MapSchema, Schema, ArraySchema, type } from "@colyseus/schema";

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
  @type("string") userId: string;
  @type("string") equippedHat: string = "";
  @type("string") equippedBracelet: string = ""; 
  inputQueue: InputData[] = [];
}
export class ChatMessageSchema extends Schema {
  @type("string") text = "";
  @type("string") sender = "";
}
export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type([ChatMessageSchema]) messages = new ArraySchema<ChatMessageSchema>();
}
