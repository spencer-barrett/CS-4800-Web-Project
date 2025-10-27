import Phaser from 'phaser'
import { TimerBar } from './TimerBar'

export default class minigameRPS extends Phaser.Scene {
    private timerBar!: TimerBar;
    private timerText?: Phaser.GameObjects.Text
    private initialTime: number = 10
    private timerEvent!: Phaser.Time.TimerEvent;
    //cards
    private claw!: Phaser.GameObjects.Sprite //see if ? or ! makes any meaningful difference
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
    public selectedCard: String = "none";

    constructor(){
        super({key : 'rps'})
    }
    preload(){
        // this.load.image('bg', 'assets/sky.png') //replace asset later
        // this.load.spritesheet('kelp', 'assets/kelp.png', { frameWidth: 1000, frameHeight: 1000})
        // this.load.spritesheet('claw', 'assets/claw.png', { frameWidth: 1000, frameHeight: 1000})
        // this.load.spritesheet('coral', 'assets/coral.png', { frameWidth: 1000, frameHeight: 1000})
        // this.load.image('cursor', 'assets/cursor.cur')d
        
    }
    create(){
        //global width and height
        const {width, height} = this.scale
        
        this.add.image(width*0.5, height*0.5, 'rps-bg').setDisplaySize(width, height)
        this.input.on('pointerdown', this.handleGlobalClick, this);
        //custom cursor
        this.input.setDefaultCursor('url(assets/cursor-small.cur), pointer')


        

        //create playing cards
        this.claw = this.add.sprite(width*0.3, height*0.5, 'claw').setScale(0.15).setInteractive()

        this.kelp = this.add.sprite(width*0.5, height*0.5, 'kelp').setScale(0.15).setInteractive()

        this.coral = this.add.sprite(width*0.7, height*0.5, 'coral').setScale(0.18).setInteractive()

        const originalPosY = this.claw.y

        //round timer
        this.timerBar = new TimerBar(this, width*0.2, 50, 600, 20, 10000);
        this.timerText = this.add.text((this.cameras.main.worldView.x + this.cameras.main.width / 2), height*0.05, `${this.initialTime}`, {
			fontSize: '32px',
			color: '#ffffffff'
		})
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
		})
        this.playerSelection.setOrigin(0.5,0.5)


        //mouse hover interactions for the cards. originalPosY = 300
        this.claw.on('pointerdown', () => {
            if(this.canClick){
                if (this.claw.y == originalPosY){
                    this.tweens.add({
                        targets: this.claw,
                        y: this.claw.y - 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                    this.playerSelection.setText("Claw!")
                    this.selectedCard = "Claw"
                }
                else{
                    this.tweens.add({
                        targets: this.claw,
                        y: this.claw.y + 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                    this.playerSelection.setText("Select A Card!")
                    this.selectedCard = "None"
                }
                if (this.kelp.y != originalPosY){
                    this.tweens.add({
                    targets: this.kelp,
                        y: this.kelp.y + 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                }
                if (this.coral.y != originalPosY){
                    this.tweens.add({
                    targets: this.coral,
                        y: this.coral.y + 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                }
            }                   
        });
        this.kelp.on('pointerdown', () => {
            if(this.canClick){
                if (this.claw.y != originalPosY){
                    this.tweens.add({
                        targets: this.claw,
                        y: this.claw.y + 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                }
                if (this.kelp.y == originalPosY){
                    this.tweens.add({
                        targets: this.kelp,
                        y: this.kelp.y - 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                    this.playerSelection.setText("Kelp!")
                    this.selectedCard = "Kelp"
                }
                else{
                    this.tweens.add({
                        targets: this.kelp,
                        y: this.kelp.y + 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                    this.playerSelection.setText("Select A Card!")
                    this.selectedCard = "None"
                }
                if (this.coral.y != originalPosY){
                    this.tweens.add({
                        targets: this.coral,
                        y: this.coral.y + 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                }     
            }               
        });
        this.coral.on('pointerdown', () => {
            if (this.canClick){
                if (this.claw.y != originalPosY){
                    this.tweens.add({
                        targets: this.claw,
                        y: this.claw.y + 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                }
                if (this.kelp.y != originalPosY){
                    this.tweens.add({
                        targets: this.kelp,
                        y: this.kelp.y + 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                }
                if (this.coral.y == originalPosY){
                    this.tweens.add({
                        targets: this.coral,
                        y: this.coral.y - 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                    this.playerSelection.setText("Coral!")
                    this.selectedCard = "Coral"
                }
                else{
                    this.tweens.add({
                        targets: this.coral,
                        y: this.coral.y + 100,
                        duration: 300,
                        ease: 'Power1'
                    })
                    this.playerSelection.setText("Select A Card!")
                    this.selectedCard = "None"
                }
            }                    
        });

        this.cursors = this.input.keyboard!.createCursorKeys()
    }

    private handleGlobalClick(): void {
        if (this.initialTime > 0){
            if (this.canClick) {
            // The click is allowed
            //console.log('Global click registered!');
        
            
            // Schedule the re-enabling of clicks after 0.4 seconds 
            this.time.delayedCall(400, () => {
                this.canClick = true;
                //console.log('Click cooldown finished.');
            }, [], this);
            } else {
            // Cooldown is active
            //console.log('Global click ignored (cooldown active)...');
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
            if (this.selectedCard == "None"){
                const randomNum = Math.floor(Math.random() * 3) + 1
                switch (randomNum){
                    case 1: //select claw
                        this.tweens.add({
                            targets: this.claw,
                            y: this.claw.y - 100,
                            duration: 300,
                            ease: 'Power1'
                        })
                        this.playerSelection.setText("Claw!")
                        this.selectedCard = "Claw"
                        break;
                    case 2: //select kelp
                        this.tweens.add({
                            targets: this.kelp,
                            y: this.kelp.y - 100,
                            duration: 300,
                            ease: 'Power1'
                        })
                        this.playerSelection.setText("Kelp!")
                        this.selectedCard = "Kelp"
                        break;
                    case 3: //select coral
                        this.tweens.add({
                            targets: this.coral,
                            y: this.coral.y - 100,
                            duration: 300,
                            ease: 'Power1'
                        })
                        this.playerSelection.setText("Coral!")
                        this.selectedCard = "Coral"
                        break;
                    default:
                        console.log("unexpected no automatic choice")
                        break;
                }
            }
        }
    }


    update(){
        //dev scene reset
        this.timerBar.update();
        if (!this.cursors){
			return
		}
        if (this.cursors.shift?.isDown){
			this.scene.restart()
            this.initialTime = 10
            this.canClick = true;
		}

    }
}