import Phaser from 'phaser'
import { room_ } from './MainScene';
import { selectedCard, opponentSelectedCard, minigameRPS } from './minigameRPS';

export class rpsResults extends Phaser.Scene {

    private resultsText?: Phaser.GameObjects.Text
    player: string = "";
    opponent: string = "";

    private playerCard!: Phaser.GameObjects.Sprite
    private opponentCard!: Phaser.GameObjects.Sprite

    constructor(){
        super({key: 'rps-results'});
    }
    async create(){
        const {width, height} = this.scale
        //visualize results here and declare winner
        this.player = selectedCard;
        this.opponent = opponentSelectedCard;

        //testing
        console.log(opponentSelectedCard);

        this.playerCard = this.add.sprite(width*0.3, height*0.5, this.player.toLowerCase()).setScale(0.15)
        this.opponentCard = this.add.sprite(width*0.7, height*0.5, this.opponent.toLowerCase()).setScale(0.15)

        this.resultsText = this.add.text((this.cameras.main.worldView.x + this.cameras.main.width / 2), height*0.9, `put winner text here`, {
			fontSize: '42px',
			color: '#ffffffff'
		})
        this.resultsText.setOrigin(0.5,0.5)
    }
}