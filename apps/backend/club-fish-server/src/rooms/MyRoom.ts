import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();
  static instance: MyRoom | null = null;
  onCreate(options: any) {
    console.log("MyRoom created!");

    // keep room alive even with 0 clients
    this.autoDispose = false;

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
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
