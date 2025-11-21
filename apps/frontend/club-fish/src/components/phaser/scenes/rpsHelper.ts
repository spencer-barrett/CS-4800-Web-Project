import Phaser from 'phaser'
import { room_, createNonMainRoom } from './MainScene';

export class rpsHelper extends Phaser.Scene {
    private waitingText?: Phaser.GameObjects.Text;

    constructor(){
        super({key : 'rps-helper'})
    }
    async create() {
        const room = await createNonMainRoom("rps", 2);
        room_.removeAllListeners();
        room_.onMessage("roomIsFull", (msg) => {
            console.log("room is full, starting rps:", msg);
            this.scene.start("rps");
        });
        const {width, height} = this.scale
        this.add.image(width*0.5, height*0.5, 'rps-bg').setDisplaySize(width, height)
        this.waitingText = this.add.text((this.cameras.main.worldView.x + this.cameras.main.width / 2), height*0.5, `Waiting for player 2...`, {
			fontSize: '48px',
			color: '#ffffffff'
		})
        this.waitingText.setOrigin(0.5,0.5)
    }
}