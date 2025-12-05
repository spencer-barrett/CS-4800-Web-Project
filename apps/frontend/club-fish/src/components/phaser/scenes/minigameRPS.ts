import Phaser from 'phaser'
import { TimerBar } from './TimerBar'
import { room_, createNonMainRoom } from './MainScene';
import Pointer = Phaser.Input.Pointer;

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
        this.sent = false;
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
        this.initialTime--;
        this.timerText?.setText(`${this.initialTime}`);

        if (this.initialTime <= 0) {
            this.timerEvent.destroy();
            this.timerText?.setText("Time's Up!");
            this.canClick = false;

            // Pick random card if player didn't select
            if (selectedCard === "None") {
                const choices = ["Claw", "Kelp", "Coral"];
                selectedCard = choices[Math.floor(Math.random() * 3)];
                if (selectedCard === "Claw") this.selectCard(this.claw);
                if (selectedCard === "Kelp") this.selectCard(this.kelp);
                if (selectedCard === "Coral") this.selectCard(this.coral);

                this.playerSelection.setText(selectedCard + "!");
            }

            // Send player's choice once
            if (!this.sent) {
                room_.send("player_selection", selectedCard);
                this.sent = true;
            }

            // 5-second timeout for opponent
            this.time.delayedCall(5000, () => {
                if (opponentSelectedCard === "None") {
                    console.warn("Opponent did not respond — assigning random move.");
                    const random = ["Claw", "Kelp", "Coral"];
                    opponentSelectedCard = random[Math.floor(Math.random() * 3)];
                }
            });
        }
}


    async update() {
        this.timerBar.updateBar();

        // Only proceed if both choices are ready
        if (selectedCard !== "None" && opponentSelectedCard !== "None" && this.initialTime <= 0) {
            // Prevent multiple scene transitions
            if (!this.scene.isActive("rps-results")) {
                this.time.delayedCall(1500, () => {
                    this.scene.start("rps-results");
                })
            }
        }
    }
}