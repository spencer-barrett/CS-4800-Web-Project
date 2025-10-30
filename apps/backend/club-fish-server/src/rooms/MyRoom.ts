import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();
  static instance: MyRoom | null = null;
  onCreate(options: any) {
    if (MyRoom.instance) {
      throw new Error("Room already exists");
    }
    MyRoom.instance = this;
    console.log("MyRoom created!");
    this.onMessage("chat", (client, message) => {
      console.log(`chat from ${client.sessionId}: ${message.text}`);
      this.broadcast("chat", {
        text: message.text,
        sender: client.sessionId,
      });
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
