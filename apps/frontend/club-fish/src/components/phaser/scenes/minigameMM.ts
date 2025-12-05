import Phaser from 'phaser'
import { TimerBar } from './TimerBar'
import { addCurrency } from '@/lib/purchases/purchaseItem';

export class minigameMM extends Phaser.Scene {
    //timer
    private timerBar!: TimerBar;
    private timerText?: Phaser.GameObjects.Text
    private initialTime: number = 45
    private timerEvent!: Phaser.Time.TimerEvent;

    //global mouse click cooldown
    private canClick: boolean = true;

    //cards
    private cards: Phaser.GameObjects.Sprite[] = [];
    private flippedCards: Phaser.GameObjects.Sprite[] = [];

    //global vars
    private pairsLeft = 8;

    private resultsText?: Phaser.GameObjects.Text;

    constructor(){
        super("memoryMatch");
    }

    async create(){
        this.pairsLeft = 8;
        // initialize card sprites
        this.cards = [];
        this.flippedCards = [];
        this.canClick = true;
        //reset timer
        this.initialTime = 45;
        //global width and height
        const {width, height} = this.scale


        this.add.image(width*0.5, height*0.5, 'table').setDisplaySize(width, height)

        //round timer
        this.timerBar = new TimerBar(this, width*0.2, 50, 600, 20, 45000); //45 seconds
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

        //begin game logic
        
        // X positions for each card in a row
        const xPositions = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85];

        // Y positions for two rows
        const yPositions = [0.60, 0.37];
        // Loop through rows and columns
        for (let row = 0; row < yPositions.length; row++) {
            for (let col = 0; col < xPositions.length; col++) {
                const card = this.add
                    .sprite(width * xPositions[col], height * yPositions[row], 'card_back')
                    .setScale(2)
                    .setInteractive();

                this.cards.push(card);
            }
        }

        this.assignCards();
        this.setupCardClicks();
    }

    //need a select card function that 'flips' the card using tweens, then replacing the sprite
    private flipCard(card: Phaser.GameObjects.Sprite) {
        const faceTexture = card.getData('type');

        // shrink width
        this.tweens.add({
            targets: card,
            scaleX: 0,
            duration: 150,
            ease: 'Linear',
            onComplete: () => {
                card.setTexture(faceTexture);

                // expand width
                this.tweens.add({
                    targets: card,
                    scaleX: 2,
                    duration: 150,
                    ease: 'Linear'
                });
            }
        });
    }
    private flipCardBack(card: Phaser.GameObjects.Sprite) {
        this.tweens.add({
            targets: card,
            scaleX: 0,
            duration: 150,
            ease: 'Linear',
            onComplete: () => {
                card.setTexture('card_back');

                this.tweens.add({
                    targets: card,
                    scaleX: 2,
                    duration: 150,
                    ease: 'Linear'
                });
            }
        });
    }

    private setupCardClicks() {
    this.cards.forEach((card) => {
        card.setInteractive();

        card.on('pointerdown', () => {
            if (!this.canClick) return;
            if (card.texture.key !== 'card_back') return;

            this.flipCard(card);

            this.flippedCards.push(card);

            // If two cards are flipped
            if (this.flippedCards.length === 2) {
                this.canClick = false;

                const [first, second] = this.flippedCards;

                this.time.delayedCall(800, () => {
                    if (first.getData('type') === second.getData('type')) {
                        // MATCH → destroy both cards
                        this.time.delayedCall(300, () => {
                            first.destroy();
                            second.destroy();
                        });

                        // Remove from array
                        this.cards = this.cards.filter(c => c !== first && c !== second);
                        this.pairsLeft -= 1;
                    } else {
                        // NOT MATCH → flip both back
                        this.flipCardBack(first);
                        this.flipCardBack(second);
                    }

                    this.flippedCards = [];

                    // Re-enable clicking after animations finish
                    this.time.delayedCall(600, () => {
                        this.canClick = true;
                    });
                });
            }
        });
    });
}

    //need to know how to make pairs and remove cards when paired

    private assignCards() {
        // 8 unique cards
        const cardTypes = [
            'Spades_ACE',
            'Spades_K',
            'Spades_Q',
            'Spades_J',
            'Diamonds_ACE',
            'Diamonds_K',
            'Diamonds_Q',
            'Diamonds_J',
        ];

        // duplicate each card to create pairs
        const cardsPool = [...cardTypes, ...cardTypes]; // 16 total

        // shuffle the array
        for (let i = cardsPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardsPool[i], cardsPool[j]] = [cardsPool[j], cardsPool[i]];
        }

        // assign shuffled types to card sprites
        this.cards.forEach((card, index) => {
            // store type in card's data for later match checking
            card.setData('type', cardsPool[index]);

            // for testing purposes, displaying the card front. this needs to be hidden and only shown on click however. 
            //card.setTexture(card.getData('type')); 
        });
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
            
            this.resultsText = this.add.text((this.cameras.main.worldView.x + this.cameras.main.width / 2), this.cameras.main.height/2, `You Lost...
            \nUse Minigame Menu to Return.`, {
                fontSize: '48px',
                color: '#ffffffff'
            })
            this.resultsText.setOrigin(0.5,0.5).setShadow(2, 2, '#000000', 4, true, true);
        }
    }

    async update(){
        if (this.pairsLeft == 0) {//stop timer and perform win actions (timer stopped by making the update the else condition)
            //win scene
            const rewardCalc = Math.floor(this.initialTime / 3) + 3;
            this.timerEvent.destroy(); // Stop the timer
            this.timerText?.destroy();
            this.timerBar.destroy();
            this.resultsText = this.add.text((this.cameras.main.worldView.x + this.cameras.main.width / 2), this.cameras.main.height/2, `You Won ${rewardCalc} Shells! 
            \nUse Minigame Menu to Return.`, {
                fontSize: '48px',
                color: '#ffffffff'
            }).setShadow(2, 2, '#000000', 4, true, true);
            this.resultsText.setOrigin(0.5,0.5)
            //reward distribution
            addCurrency(rewardCalc);
        } else {
            this.timerBar.updateBar();
        }
        
    }
}