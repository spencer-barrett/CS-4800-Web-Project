import Phaser from "phaser";
import { Client, Room } from "colyseus.js"
import { Player, MyRoomState } from "../../../../server/src/rooms/schema/MyRoomState";
export let room!: Room;
export class BootScene extends Phaser.Scene {
  //colyseus connection
  client = new Client("ws://localhost:2567");
  playerEntities: {[sessionId: string]: any} = {};



  constructor() {
    super("boot");
  }
  preload() {
    // You guys can load any assetts here and define names from public folder!
    // /public/assets
    this.load.image("bg", "/assets/background.png");
    this.load.image("clownfish", "/assets/Clownfish.png");

    //minigameRPS assets
    this.load.image('rps-bg', 'assets/rps-bg2.png') //replace asset later
    this.load.spritesheet('kelp', 'assets/kelp.png', { frameWidth: 1000, frameHeight: 1000})
    this.load.spritesheet('claw', 'assets/claw.png', { frameWidth: 1000, frameHeight: 1000})
    this.load.spritesheet('coral', 'assets/coral.png', { frameWidth: 1000, frameHeight: 1000})

    //colyseus testing assets
    

  }
  async create() {
    //colyseus room connection
    // console.log("Joining room...");

    try { //causing errors with updateBar function
      room = await this.client.joinOrCreate("my_room");
      console.log("Joined successfully!");
    } catch (e) {
      console.error(e);
    } 
    
    

    //initial boot scene for now
    //this.scene.start("main");
    this.scene.start("rps"); //add a button or something later to get to minigame instead of skipping main scene
  }

  
}
