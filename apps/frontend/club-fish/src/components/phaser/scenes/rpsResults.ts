import Phaser from 'phaser'
import { room_ } from './MainScene';
import { selectedCard, opponentSelectedCard, minigameRPS } from './minigameRPS';
import { addCurrency } from '@/lib/purchases/purchaseItem';
import { networkManager } from '@/lib/colyseus/networkController';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/clientApp';

export class rpsResults extends Phaser.Scene {

    private resultsText?: Phaser.GameObjects.Text
    private rewardsText?: Phaser.GameObjects.Text
    player: string = "";
    opponent: string = "";

    private playerCard!: Phaser.GameObjects.Sprite
    private opponentCard!: Phaser.GameObjects.Sprite
    private playerLabel!: Phaser.GameObjects.Text
    private opponentLabel!: Phaser.GameObjects.Text

    private hasLogged = false;
    private hasTransitioned = false;

    gameStatus: string = "";
    winningCard: string = "";

    constructor() {
        super({ key: 'rps-results' });
    }

    create() {
        const { width, height } = this.scale
        this.hasLogged = false;
        this.hasTransitioned = false;

        //visualize results here and declare winner
        this.player = selectedCard.toLowerCase();
        this.opponent = opponentSelectedCard.toLowerCase();

        console.log("Results - Player:", this.player, "Opponent:", this.opponent);

        this.add.image(width * 0.5, height * 0.5, 'rps-bg').setDisplaySize(width, height)

        this.playerCard = this.add.sprite(width * 0.3, height * 0.5, this.player).setScale(0.25)
        this.opponentCard = this.add.sprite(width * 0.7, height * 0.5, this.opponent).setScale(0.25)

        this.gameStatus = this.determineWinner();

        this.resultsText = this.add.text((this.cameras.main.worldView.x + this.cameras.main.width / 2), height * 0.85, `You ${this.gameStatus}!`, {
            fontSize: '42px',
            color: '#ffffffff'
        }).setShadow(2, 2, '#000000', 4, true, true);
        this.resultsText.setOrigin(0.5, 0.5).setShadow(2, 2, '#000000', 4, true, true);

        //set labels above player cards
        this.playerLabel = this.add.text((this.playerCard.x), this.playerCard.y - (this.playerCard.y / 2.5), `You`, {
            fontSize: '24px',
            color: '#ffffffff'
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4, true, true);
        this.opponentLabel = this.add.text((this.opponentCard.x), this.opponentCard.y - (this.opponentCard.y / 2.5), `Opponent`, {
            fontSize: '24px',
            color: '#ffffffff'
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 4, true, true);

        // Award currency if won 
        if (this.gameStatus === "won" && !this.hasLogged) {
            addCurrency(10);
            console.log("Player won! Added 10 currency");
            this.hasLogged = true;
        }

        // Use Phaser timers instead of async/await
        this.time.delayedCall(2000, () => {
            this.resultsText?.setText("Returning to lobby...");

            // Start transition after another delay
            this.time.delayedCall(1000, () => {
                this.startTransition();
            });
        });
    }

    startTransition() {
        if (this.hasTransitioned) {
            console.log("[RPS] Already transitioned, skipping...");
            return;
        }

        this.hasTransitioned = true;
        console.log("[RPS] Starting transition");

        // Clean up RPS room
        console.log("[RPS] Cleaning up RPS room");
        if (room_ && room_.connection.isOpen) {
            room_.leave().then(() => {
                console.log("[RPS] Successfully left RPS room");
            }).catch((err) => {
                console.error("[RPS] Error leaving room:", err);
            });
        }

        networkManager.leaveNonMainRoom().catch(err => {
            console.error("[RPS] Error clearing non-main room:", err);
        });

        // Fetch fresh player data and transition via LoadingScene
        this.fetchFreshPlayerData().then((freshPlayerData) => {
            this.time.delayedCall(500, () => {
                const privateRoom = networkManager.getPrivateRoom();

                console.log("[RPS] Fresh playerData:", freshPlayerData);

                // Stop RPS scenes
                this.scene.stop('rps-results');
                this.scene.stop('rps');

                if (privateRoom && privateRoom.connection.isOpen) {
                    console.log("[RPS] Returning to PrivateScene with fresh data via LoadingScene");
                    this.scene.start("LoadingScene", {
                        targetScene: "PrivateScene",
                        targetData: {
                            room: privateRoom,
                            playerData: freshPlayerData
                        }
                    });
                } else {
                    console.log("[RPS] Returning to MainScene with fresh data via LoadingScene");
                    this.scene.start("LoadingScene", {
                        targetScene: "MainScene",
                        targetData: {
                            playerData: freshPlayerData
                        }
                    });
                }
            });
        }).catch((err) => {
            console.error("[RPS] Error fetching fresh playerData:", err);
            const oldPlayerData = this.game.registry.get("playerData");
            this.scene.stop('rps-results');
            this.scene.stop('rps');
            this.scene.start("LoadingScene", {
                targetScene: "MainScene",
                targetData: {
                    playerData: oldPlayerData
                }
            });
        });
    }

    async fetchFreshPlayerData() {
        const user = auth.currentUser;
        if (!user) {
            console.error("[RPS] No authenticated user");
            return this.game.registry.get("playerData");
        }

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                console.error("[RPS] User document not found");
                return this.game.registry.get("playerData");
            }

            const data = userDoc.data();
            const freshPlayerData = {
                userId: user.uid,
                displayName: data.displayName || "Anonymous",
                bodyColor: data.bodyColor || "#ff3650",
                currency: data.currency || 0,
                inventory: data.inventory || [],
                equippedCosmetics: data.equippedCosmetics || {},
                sessionId: this.game.registry.get("playerData")?.sessionId
            };

            this.game.registry.set("playerData", freshPlayerData);

            return freshPlayerData;
        } catch (error) {
            console.error("[RPS] Error fetching player data:", error);
            return this.game.registry.get("playerData");
        }
    }

    determineWinner(): "won" | "lost" | "tied" {
        const beats: Record<string, string> = {
            claw: "kelp",
            kelp: "coral",
            coral: "claw"
        };

        if (this.player === this.opponent) {
            return "tied";
        }

        const playerResult = beats[this.player] === this.opponent ? "won" : "lost";
        return playerResult;
    }
}