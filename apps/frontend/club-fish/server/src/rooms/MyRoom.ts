import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
//import { Schema, type} from "@colyseus/schema";


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
    this.onMessage("movement", (client: Client, payload: { x: number, y: number}) => {
      //get ref to the player who sent the message
      const player = this.state.players.get(client.sessionId)
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

    //broadcast player joining
    this.broadcast("someone-joined", client.sessionId, { except: client});

    

  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
