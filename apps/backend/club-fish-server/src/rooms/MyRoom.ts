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
    this.onMessage("movement", (client, message: { x: number; y: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.x = message.x;
      player.y = message.y;

      this.broadcast("someone-moved", {
        id: client.sessionId,
        x: message.x,
        y: message.y,
      }, { except: client });
    });



    this.onMessage("i-joined", (client, message: { color?: string }) => {
  const player = this.state.players.get(client.sessionId);
  if (!player) return;

  // 1) finalize player properties
  player.color = message.color ?? "#60cbfcff";

  // 2) send existing players to this client
  const existingPlayers: { id: string; color: string }[] = [];
  this.state.players.forEach((p, id) => {
    if (id !== client.sessionId) {
      existingPlayers.push({ id, color: p.color ?? "#60cbfcff" });
    }
  });
  client.send("existing-players", existingPlayers);

  // 3) notify everyone else that this client joined
  const payload = { id: client.sessionId, color: player.color };
  this.broadcast("someone-joined", payload, { except: client });
});

    this.onMessage("i-left", (client: Client, message: any) => {
      this.broadcast("someone-left", client.sessionId)
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();
    player.color = "#60cbfcff"; // default until i-joined sets it
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
