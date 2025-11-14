import Phaser from 'phaser'
import { room_ } from './MainScene';
import { selectedCard, opponentSelectedCard, minigameRPS } from './minigameRPS';

export class rpsResults extends Phaser.Scene {

    private resultsText?: Phaser.GameObjects.Text
    private rewardsText?: Phaser.GameObjects.Text
    player: string = "";
    opponent: string = "";

    private playerCard!: Phaser.GameObjects.Sprite
    private opponentCard!: Phaser.GameObjects.Sprite

    gameStatus: string = "";
    winningCard: string = "";

    constructor(){
        super({key: 'rps-results'});
    }
    async create(){
        const {width, height} = this.scale
        //visualize results here and declare winner
        this.player = selectedCard.toLowerCase();
        this.opponent = opponentSelectedCard.toLowerCase();

        //testing
        console.log(opponentSelectedCard);

        this.add.image(width*0.5, height*0.5, 'rps-bg').setDisplaySize(width, height)
        if (this.player == "coral"){
            this.playerCard = this.add.sprite(width*0.3, height*0.5, this.player).setScale(0.19)
        } else {
            this.playerCard = this.add.sprite(width*0.3, height*0.5, this.player).setScale(0.15)
        }
        if (this.opponent == "coral"){
            this.opponentCard = this.add.sprite(width*0.7, height*0.5, this.opponent).setScale(0.19)
        } else {
            this.opponentCard = this.add.sprite(width*0.7, height*0.5, this.opponent).setScale(0.15)
        }

        this.gameStatus = this.determineWinner();
        this.resultsText = this.add.text((this.cameras.main.worldView.x + this.cameras.main.width / 2), height*0.9, `You ${this.gameStatus}!`, {
			fontSize: '42px',
			color: '#ffffffff'
		})
        this.resultsText.setOrigin(0.5,0.5)

        await new Promise(res => setTimeout(res, 2000)); //wait 2 seconds
        //award them currency here if the won
        //
        //
        //////////////////////////

        //return to lobby
        this.resultsText.setText("Returning to lobby...")
        await new Promise(res => setTimeout(res, 2000)); //wait 2 seconds
        this.transitionScene("MainScene");
        

    }
    determineWinner(): "won" | "lost" | "tied" {
        const beats: Record<string, string> = {
            claw: "kelp",
            kelp: "coral",
            coral: "claw"
        };
        if (this.player === this.opponent){
            return "tied";
        }

        return beats[this.player] === this.opponent ? "won" : "lost";
    }
    transitionScene(nextScene: string) {
        const {width, height} = this.scale
        const transitionImage = this.add.image(width*0.5, height*0.5, "loading");
        transitionImage.setDepth(1000);

        transitionImage.setDisplaySize(this.sys.game.config.width as number, this.sys.game.config.height as number);

        //give delay to render
        this.time.delayedCall(500, () => {
            this.scene.start(nextScene)
        })
    }
}