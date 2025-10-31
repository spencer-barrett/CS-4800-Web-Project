import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("string") color: string = "#60cbfcff";
}
export class MyRoomState extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();
  @type("string") mySynchronizedProperty: string = "Hello world";

}
