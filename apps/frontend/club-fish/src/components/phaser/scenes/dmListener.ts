import Phaser from 'phaser'
import { getStateCallbacks } from "colyseus.js";
import type { MainRoom } from "@/types/myroomstate";
import { networkManager } from "@/lib/colyseus/networkController";
import { PlayerData } from "@/types/player-data";
import { createNonMainRoom } from './MainScene';
export let routing_room: MainRoom;
export class dmListener extends Phaser.Scene {
    private dmRoutingRoom!: MainRoom;
    myDmId: string | undefined = "";
    private playerData!: PlayerData;

    init(data: PlayerData) {
        console.log('recieved data:', data);
        this.playerData = data;
        this.myDmId = data.displayName;
    }

    constructor(){
        super({key : 'dms'})
    }
    async create() {
        this.dmRoutingRoom = await networkManager.connectNonMainRoom("dmRouting", 300);
        routing_room = this.dmRoutingRoom;
        const $ = getStateCallbacks(this.dmRoutingRoom);
        console.log("Connected to dm routing room:", this.dmRoutingRoom.roomId);

        //can do both dms and invites here or wherever the main chat logic is 
    }
}