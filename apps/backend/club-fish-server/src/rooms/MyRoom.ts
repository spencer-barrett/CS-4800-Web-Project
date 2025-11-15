import { Room, Client } from "@colyseus/core";
import { InputData, MyRoomState, Player } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  state = new MyRoomState();
  fixedTimeStep = 1000 / 60;

  onCreate(options: any) {
    this.maxClients = 4;
    console.log("MyRoom created!");

    
    this.onMessage("chat", (client, message) => {
      console.log(`chat from ${client.sessionId}: ${message.text}`);
      const payload = {
        text: message.text,
        sender: message.sender,
      };
      this.broadcast("chat", payload)
    });

    this.onMessage("color", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      player.color = message;
      console.log(player.color);
    })

    this.onMessage(0, (client, payload) => {
      const player = this.state.players.get(client.sessionId);
      console.log(`   Received from ${client.sessionId}: (${payload.x}, ${payload.y})`);

      player.inputQueue.push(payload);
    })
let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }
    });
    
  }

  

  fixedTick(timestep: number){
    this.state.players.forEach(player => {
      let input: InputData;

      while(input = player.inputQueue.shift()){
        player.x = input.x;
        player.y = input.y;
        player.tick = input.tick;
      }
    })
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();

    player.x = (Math.random() * (800-200) + 200);
    player.y = (Math.random() * (600-400) + 400);
    const bodyColor = options.bodyColor || "#ff3650"
    const displayName = options.displayName || "anonymous";
    var currency = options.currency || 0;
    player.color = `fish-${bodyColor}`;
    player.displayName = displayName;
    player.currency = currency;
    this.state.players.set(client.sessionId, player);
    console.log("server color: ", player.color);
    console.log("server display name: ", player.displayName);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    const player = this.state.players.get(client.sessionId);
    if (player) {
        this.state.players.delete(client.sessionId);
         console.log(`Deleted player ${client.sessionId}`);
  }
}

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    
  }
}
