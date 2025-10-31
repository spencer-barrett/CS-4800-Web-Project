import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();
  static instance: MyRoom | null = null;
  onCreate(options: any) {
    console.log("MyRoom created!");

    // keep room alive even with 0 clients
    this.autoDispose = false;
    this.state.players;

    // optional: mark as public and searchable
    this.setPrivate(false);
    this.onMessage("chat", (client, message) => {
      console.log(`chat from ${client.sessionId}: ${message.text}`);
      const payload = {
        text: message.text,
        sender: message.sender,
      };
      this.broadcast("chat", payload)
      // handle "type" message
      //
    });

    //handle player input
    this.onMessage("movement", (client: Client) => {
      //get ref to the player who sent the message

      const payload = {
        x: this.state.players.get(client.sessionId)?.x,
        y: this.state.players.get(client.sessionId)?.y
      }



      const player = this.state.players.get(client.sessionId);
      console.log(`Client ${client.sessionId} sent desired movement: left=${payload.x}, right=${payload.y}`);
      player.x = payload.x;
      player.y = payload.y;
      
      //now broadcast this movement to all clients
      this.broadcast("someone-moved", {
        id: client.sessionId,
        x: payload.x,
        y: payload.y
      });
    });

    //send leave message back to client so it can access it's own id
    this.onMessage("i-joined", (client: Client, message: any) => {
      client.send("your-id", client.sessionId)
      console.log("key color", message)
      //broadcast player joining
      const payload = {
        id: client.sessionId,
        key: message
      };
      this.broadcast("someone-joined", payload, { except: client});
    });
    this.onMessage("i-left", (client: Client, message: any) => {
      this.broadcast("someone-left", client.sessionId)
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
