import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 2;
  state = new MyRoomState();

  onCreate (options: any) {
    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });
    this.state.players;

    //handle player input
    this.onMessage("movement", (client: Client, payload: { left: boolean, right: boolean, up: boolean, down: boolean}) => {
      //get ref to the player who sent the message
      const player = this.state.players.get(client.sessionId)
      const velocity = 2;
      console.log(`Client ${client.sessionId} sent move: left=${payload.left}, right=${payload.right}`);
      // if (payload.left) {
      //   player.x -= velocity;
      //   console.log(client.sessionId, "pressed left")
      // } else if (payload.right) {
      //   player.x += velocity;
      // }
      // if (payload.up) {
      //   player.y -= velocity;
      // } else if (payload.down) {
      //   player.y =+ velocity;
      // }
    });
    // test message, this works!
    this.onMessage("hi", (client: Client, message: { x: number, y: number }) => {
      console.log(`Client ${client.sessionId} sent move: x=${message.x}, y=${message.y}`);

      // Here you would typically update the room's state based on the received x and y
      // For example:
      // this.state.players.get(client.sessionId).x = message.x;
      // this.state.players.get(client.sessionId).y = message.y;
    });

  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const mapWidth = 960; //sizes from phaser canvas, not sure if these need to be dynamically sized somehow
    const mapHeight = 540;
    //create player instance
    const player = new Player();

    //place player at random pos
    player.x = (Math.random() * mapWidth - 200) + 100 //don't want player to spawn at an edge
    player.y = (Math.random() * mapHeight - 200) + 100

    // place player in the map of players by its sessionID
    // client.sessionId is unique per connection
    this.state.players.set(client.sessionId, player);

  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
