import { Client } from "colyseus.js";
import type { MyRoomState, MainRoom } from "@/types/myroomstate";
import { PlayerData } from "@/types/player-data";



export class NetworkManager {
  private readonly client: Client;
  private mainRoom: MainRoom | null = null;
  private nonMainRoom: MainRoom | null = null;
  private privateRoom: MainRoom | null = null;
  private isConnectingMain: boolean = false;

  constructor(serverUrl: string) {
    this.client = new Client(serverUrl);
  }

  async connectPrivateRoom(player: PlayerData, roomId?: string): Promise<MainRoom> {
    try {
      const room = await this.client.joinOrCreate<MyRoomState>("private_room", {
        bodyColor: player.bodyColor,
        displayName: player.displayName,
        currency: player.currency,
        roomId: roomId
      });

      this.privateRoom = room;
      return room;
    } catch (error) {
      console.error("Failed to connect to private room:", error);
      throw error;
    }
  }

  clearMainRoom(): void {
    if (this.mainRoom) {
      this.mainRoom = null;
      console.log("Cleared main room reference");
    }
  }

  clearPrivateRoom(): void {
    this.privateRoom = null;
    console.log("Cleared private room reference");
  }

  async joinPrivateRoomByUserId(
    player: PlayerData,
    targetSessionId: string
  ): Promise<MainRoom> {
    try {

      // use the target session ID to create a unique room name
      const roomName = `private_${targetSessionId}`;

      const room = await this.client.joinOrCreate<MyRoomState>("private_room", {
        bodyColor: player.bodyColor,
        displayName: player.displayName,
        currency: player.currency,
        roomName: roomName,
        userId: player.userId,
        equippedCosmetics: player.equippedCosmetics || {}, // NEW
      });

      this.privateRoom = room;
      console.log(`Joined/Created private room: ${room.roomId} (based on session: ${targetSessionId})`);

      return room;
    } catch (error) {
      console.error("Failed to join private room by session ID:", error);
      throw error;
    }
  }

  /** Connect to main persistent world room */
  async connectMainRoom(player: PlayerData, roomSize?: number): Promise<MainRoom> {

    if (this.mainRoom && this.mainRoom.connection.isOpen) {
      console.log("Reusing existing main room connection");
      return this.mainRoom;
    }


    if (this.isConnectingMain) {
      console.log("Already connecting to main room, waiting...");
      while (this.isConnectingMain) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.mainRoom) return this.mainRoom;
    }

    this.isConnectingMain = true;

    try {

      const room = await this.client.joinOrCreate<MyRoomState>("my_room", {
        size: roomSize,
        bodyColor: player.bodyColor,
        displayName: player.displayName,
        currency: player.currency,
        userId: player.userId,
        equippedCosmetics: player.equippedCosmetics || {}, // NEW 
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
    } finally {
      this.isConnectingMain = false;
    }
  }

  async connectNonMainRoom(type: string, roomSize?: number, player?: PlayerData): Promise<MainRoom> { //create a different type of room later
    try {
      const room = await this.client.joinOrCreate<MyRoomState>(type + "_room", { size: roomSize });

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

  sendColorChange(color: string) {
    let sent = false;

    // send to main room if connected
    if (this.mainRoom && this.mainRoom.connection.isOpen) {
      this.mainRoom.send("color", color);
      console.log("Sent body color to main room:", color);
      sent = true;
    }

    // send to private room if connected
    if (this.privateRoom && this.privateRoom.connection.isOpen) {
      this.privateRoom.send("color", color);
      console.log("Sent body color to private room:", color);
      sent = true;
    }

    if (!sent) {
      console.warn("No room available to send color change");
    }
    return sent;
  }

  getMainRoom(): MainRoom | null {
    return this.mainRoom;
  }

  getPrivateRoom(): MainRoom | null {
    return this.privateRoom;
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

  async leavePrivateRoom(): Promise<void> {
    if (!this.privateRoom) {
      console.log("No private room to leave");
      return;
    }

    console.log("Leaving private room:", this.privateRoom.roomId);
    await this.privateRoom.leave();
    this.privateRoom = null;
    console.log("Left private room successfully");
  }

  async sendChatMessage(text: string): Promise<void> {
    if (!this.mainRoom) throw new Error("Main room not connected");
    this.mainRoom.send("chat", { text });
  }

  onChatMessage(callback: (msg: { text: string; sender: string }) => void): void {
    if (!this.mainRoom) throw new Error("Main room not connected");
    this.mainRoom.onMessage("chat", callback);
  }

  isConnected(): boolean {
    return this.mainRoom !== null;
  }

  equipCosmeticInRoom(slot: 'hat' | 'accessory' | 'background' | 'bracelet', itemId: string): void {
    if (this.mainRoom && this.mainRoom.connection.isOpen) {
      this.mainRoom.send("equip_cosmetic", { slot, itemId });
      console.log(`Equipped ${itemId} in slot ${slot} (main room)`);
    }

    if (this.privateRoom && this.privateRoom.connection.isOpen) {
      this.privateRoom.send("equip_cosmetic", { slot, itemId });
      console.log(`Equipped ${itemId} in slot ${slot} (private room)`);
    }
  }

  unequipCosmeticInRoom(slot: 'hat' | 'accessory' | 'background' | 'bracelet'): void {
    if (this.mainRoom && this.mainRoom.connection.isOpen) {
      this.mainRoom.send("equip_cosmetic", { slot, itemId: "" });
      console.log(`Unequipped ${slot} (main room)`);
    }

    if (this.privateRoom && this.privateRoom.connection.isOpen) {
      this.privateRoom.send("equip_cosmetic", { slot, itemId: "" });
      console.log(`Unequipped ${slot} (private room)`);
    }
  }



}





export const networkManager = new NetworkManager(
  process.env.NEXT_PUBLIC_COLYSEUS_URL ?? "wss://game.fishfish.io"
  // process.env.NEXT_PUBLIC_COLYSEUS_URL ?? "ws://localhost:2567"
);