import { Client } from "colyseus.js";
import type { MyRoomState, MainRoom } from "@/types/myroomstate";
import { PlayerData } from "@/types/player-data";



export class NetworkManager {
  private readonly client: Client;
  private mainRoom: MainRoom | null = null;
  private nonMainRoom: MainRoom | null = null;

  constructor(serverUrl: string) {
    this.client = new Client(serverUrl);
  }


  /** Connect to main persistent world room */
  async connectMainRoom(player: PlayerData, roomSize?: number): Promise<MainRoom> {

    if (this.mainRoom) return this.mainRoom;

    try {

      const room = await this.client.joinOrCreate<MyRoomState>("my_room", {
        size: roomSize,
        bodyColor: player.bodyColor,
        displayName: player.displayName,
        currency: player.currency
      });


      this.mainRoom = room;
      player.sessionId = this.mainRoom.sessionId;

      localStorage.setItem("main_room_id", room.roomId);
      localStorage.setItem("main_session_id", room.sessionId);

      console.log(`Connected to main room: ${room.roomId}`);
      return room;
    } catch (err) {
      console.error("Failed to join main room:", err);
      throw err;
    }
  }

  async connectNonMainRoom(type: string, roomSize?: number, player?: PlayerData): Promise<MainRoom> { //create a different type of room later
    try {
      const room = await this.client.joinOrCreate<MyRoomState>(type+"_room", { size: roomSize});

      this.nonMainRoom = room;

      localStorage.setItem("new_room_id", room.roomId);
      localStorage.setItem("new_session_id", room.sessionId);

      console.log(`Connected to new room: ${room.roomId}`);
      return room;
    } catch (err) {
      console.error("Failed to join new room:", err);
      throw err;
    }
  }

  getMainRoom(): MainRoom | null {
    return this.mainRoom;
  }

  getNonMainRoom(): MainRoom | null {
    return this.nonMainRoom;
  }

  async leaveMainRoom(): Promise<void> {
    if (!this.mainRoom) return;
    await this.mainRoom.leave();
    this.mainRoom = null;
    localStorage.removeItem("main_room_id");
    localStorage.removeItem("main_session_id");
    console.log("Left main room");
  }

  async leaveNonMainRoom(): Promise<void> { //set to rps for now
    if (!this.nonMainRoom) return;
    await this.nonMainRoom.leave();
    this.nonMainRoom = null;
    localStorage.removeItem("rps_room_id");
    localStorage.removeItem("rps_session_id");
    console.log("Left rps room");
  }

  async sendChatMessage(text: string): Promise<void> {
    if (!this.mainRoom) throw new Error("Main room not connected");
    this.mainRoom.send("chat", { text });
  }

  onChatMessage(callback: (msg: { text: string; sender: string }) => void): void {
    if (!this.mainRoom) throw new Error("Main room not connected");
    this.mainRoom.onMessage("chat", callback);
  }

  /** Check if currently connected to main room */
  isConnected(): boolean {
    return this.mainRoom !== null;
  }
}



export const networkManager = new NetworkManager(
  // process.env.NEXT_PUBLIC_COLYSEUS_URL ?? "wss://game.fishfish.io"
  process.env.NEXT_PUBLIC_COLYSEUS_URL ?? "ws://localhost:2567"
);
