import Phaser from 'phaser'
import { TimerBar } from './TimerBar'
//new below
import { Math as pMath } from "phaser";
import { room_, createNonMainRoom } from './MainScene';
import Pointer = Phaser.Input.Pointer;
import { Client, Room, getStateCallbacks } from "colyseus.js";
import type { MainRoom } from "@/types/myroomstate";
import { networkManager } from "@/lib/colyseus/networkController";
const { Vector2 } = pMath;
export let selectedCard: string = "None";
export let opponentSelectedCard: string = "None";
export class minigameRPS extends Phaser.Scene {
    private timerBar!: TimerBar;
    private timerText?: Phaser.GameObjects.Text
    private initialTime: number = 10 //set back to 10 later
    private timerEvent!: Phaser.Time.TimerEvent;
    //cards
    private claw!: Phaser.GameObjects.Sprite
    private kelp!: Phaser.GameObjects.Sprite
    private coral!: Phaser.GameObjects.Sprite

    //global mouse click cooldown
    private canClick: boolean = true;

    //Game Text
    private playerSelection!: Phaser.GameObjects.Text
    private opponentSelection!: Phaser.GameObjects.Text

    //just for resetting the scene with shift, no game functionality yet
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

    //selected card, can be Claw, Kelp, Coral, or None
    sent: boolean = false;
    //public selectedCard: String = "None";
    //public opponentSelectedCard: String = "None";


    //connectivity
    //private room!: MainRoom;
    myId = "";

    constructor(){
        super({key : 'rps'})
    }
    preload(){
        //preload assets in bootscene for now
        
    }
    async create(){
        this.initialTime = 10;
        //const room = await createNonMainRoom(2);
        selectedCard = "None";
        opponentSelectedCard = "None";

        //room_.onMessage("roomIsFull", (msg) => this.scene.restart()); //make a helper scene that starts the rps when room is full
        room_.onMessage("opponent move", (msg) => {
            opponentSelectedCard = msg;
            console.log("opponent move was: ", msg)
        }); 
            
        
        //global width and height
        const {width, height} = this.scale
        
        this.add.image(width*0.5, height*0.5, 'rps-bg').setDisplaySize(width, height)
        this.input.on('pointerdown', this.handleGlobalClick, this);
        //custom cursor
        //this.input.setDefaultCursor('url(assets/cursor-small.cur), pointer')


        

        //create playing cards
        this.claw = this.add.sprite(width*0.3, height*0.5, 'claw').setScale(0.25).setInteractive()

        this.kelp = this.add.sprite(width*0.5, height*0.5, 'kelp').setScale(0.25).setInteractive()

        this.coral = this.add.sprite(width*0.7, height*0.5, 'coral').setScale(0.25).setInteractive()

        const originalPosY = this.claw.y

        //round timer
        this.timerBar = new TimerBar(this, width*0.2, 50, 600, 20, 10000);
        this.timerText = this.add.text((this.cameras.main.worldView.x + this.cameras.main.width / 2), height*0.05, `${this.initialTime}`, {
			fontSize: '32px',
			color: '#ffffffff'
		}).setShadow(2, 2, '#000000', 4, true, true);
        this.timerText.setOrigin(0.5,0.5)
        this.timerEvent = this.time.addEvent({
                delay: 1000, // 1 second
                callback: this.onTimerTick,
                callbackScope: this,
                loop: true
            });

        //player selection text
        this.playerSelection = this.add.text((this.cameras.main.worldView.x + this.cameras.main.width / 2), height*0.85, "Select A Card!", {
			fontSize: '32px',
			color: '#ffffffff'
		}).setShadow(2, 2, '#000000', 4, true, true);
        this.playerSelection.setOrigin(0.5,0.5)


        //mouse hover interactions for the cards. originalPosY = 300
        this.input.on('pointerdown', (pointer: Pointer) => {
            if (this.claw.getBounds().contains(this.input.activePointer.x, this.input.activePointer.y)){
                if (this.claw.y == originalPosY){
                    this.selectCard(this.claw)
                    this.playerSelection.setText("Claw!")
                    selectedCard = "Claw"
                }
                else{
                    this.deselectCard(this.claw)
                    this.playerSelection.setText("Select A Card!")
                    selectedCard = "None"
                }
                if (this.kelp.y != originalPosY){
                    this.deselectCard(this.kelp)
                }
                if (this.coral.y != originalPosY){
                    this.deselectCard(this.coral)
                }
            }
            else if (this.kelp.getBounds().contains(this.input.activePointer.x, this.input.activePointer.y)){
                if (this.claw.y != originalPosY){
                    this.deselectCard(this.claw)
                }
                if (this.kelp.y == originalPosY){
                    this.selectCard(this.kelp)
                    this.playerSelection.setText("Kelp!")
                    selectedCard = "Kelp"
                }
                else{
                    this.deselectCard(this.kelp)
                    this.playerSelection.setText("Select A Card!")
                    selectedCard = "None"
                }
                if (this.coral.y != originalPosY){
                    this.deselectCard(this.coral)
                }
            }
            else if (this.coral.getBounds().contains(this.input.activePointer.x, this.input.activePointer.y)){
                if (this.claw.y != originalPosY){
                    this.deselectCard(this.claw)
                }
                if (this.kelp.y != originalPosY){
                    this.deselectCard(this.kelp)
                }
                if (this.coral.y == originalPosY){
                    this.selectCard(this.coral)
                    this.playerSelection.setText("Coral!")
                    selectedCard = "Coral"
                }
                else{
                    this.deselectCard(this.coral)
                    this.playerSelection.setText("Select A Card!")
                    selectedCard = "None"
                }
            }
        })

        this.cursors = this.input.keyboard?.createCursorKeys()

        //debug
        // this.events.on('shutdown', () => {
            
        // })
    }

    private selectCard(c: Phaser.GameObjects.Sprite){
        const card = c as Phaser.GameObjects.Sprite
        this.tweens.add({
                        targets: card,
                        y: card.y - 100,
                        duration: 300,
                        ease: 'Power1'
                    })
    }
    private deselectCard(c: Phaser.GameObjects.Sprite){
        const card = c as Phaser.GameObjects.Sprite
        this.tweens.add({
                        targets: card,
                        y: card.y + 100,
                        duration: 300,
                        ease: 'Power1'
                    })
    }

    private handleGlobalClick(): void {
        if (this.initialTime > 0){
            if (this.canClick) {
            // Schedule the re-enabling of clicks after 0.4 seconds 
            this.time.delayedCall(400, () => {
                this.canClick = true;
            }, [], this);
            } else {

            }
        }
        this.canClick = false;
    }
    private onTimerTick() {
        this.initialTime--; // Decrement the time

        // Update the text display
        this.timerText?.setText(`${this.initialTime}`);

        // Check if the countdown has reached zero
        if (this.initialTime <= 0) {
            this.timerEvent.destroy(); // Stop the timer
            this.timerText?.setText('Time\'s Up!'); // Display a final message
            this.canClick = false //remove residuary click permission
            //pick random card for user if they have nothing selected
            if (selectedCard == "None"){
                const randomNum = Math.floor(Math.random() * 3) + 1
                switch (randomNum){
                    case 1: //select claw
                        this.selectCard(this.claw)
                        this.playerSelection.setText("Claw!")
                        selectedCard = "Claw"
                        break;
                    case 2: //select kelp
                        this.selectCard(this.kelp)
                        this.playerSelection.setText("Kelp!")
                        selectedCard = "Kelp"
                        break;
                    case 3: //select coral
                        this.selectCard(this.coral)
                        this.playerSelection.setText("Coral!")
                        selectedCard = "Coral"
                        break;
                    default:
                        console.log("unexpected no automatic choice")
                        break;
                }
            }
            //send player choice to the server as a message this.selectedCard
            if (this.sent == false){
                room_.send("player_selection", selectedCard)
            }
            
        }
    }


    async update(){
        this.timerBar.updateBar(); //update bar fill amount
        //dev scene reset/movement keybinds, change as needed
        if (!this.cursors){
			return
		}
        // if (this.cursors.shift?.isDown){
        //     console.log("leaving rps scene");
		// }
        // if (this.cursors.space?.isDown){
        //     this.scene.start("MainScene")
        // }
        if (opponentSelectedCard != "None" && selectedCard != "None" && this.initialTime <= 0){
            await new Promise(res => setTimeout(res, 2000)); //wait 2 seconds
            // this.claw.destroy();
            // this.coral.destroy();
            // this.kelp.destroy();
            this.scene.start("rps-results");
        }

    }
}