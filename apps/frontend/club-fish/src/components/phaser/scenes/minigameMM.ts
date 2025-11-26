import Phaser from 'phaser'
import { TimerBar } from './TimerBar'

export class minigameMM extends Phaser.Scene {
    //timer
    private timerBar!: TimerBar;
    private timerText?: Phaser.GameObjects.Text
    private initialTime: number = 30
    private timerEvent!: Phaser.Time.TimerEvent;

    //global mouse click cooldown
    private canClick: boolean = true;

    constructor(){
        super("memoryMatch");
    }

    async create(){
        //reset timer
        this.initialTime = 30;
        //global width and height
        const {width, height} = this.scale


        this.add.image(width*0.5, height*0.5, 'table').setDisplaySize(width, height)

        //round timer
        this.timerBar = new TimerBar(this, width*0.2, 50, 600, 20, 30000); //30 seconds
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
                
        }
    }

    async update(){
        this.timerBar.updateBar();
    }
}