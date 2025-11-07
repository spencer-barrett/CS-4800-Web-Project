import { Button } from "@/components/ui/button";
import { StoreIcon, Swords, BedSingle, Users } from "lucide-react";
import { useState } from "react";


export default function MenuBar() {
        const [showMenu, setShowMenu] = useState(false);
        const [showShop, setShowShop] = useState(false); // commented out for now
        const [showMinigames, setShowMinigames] = useState(false);
        const [showFriendsList, setShowFriendsList] = useState(false);
        const [showPrivateRoom, setShowPrivateRoom] = useState(false);

    return (
         <>

            {/* Block-style bar: rectangular, subtle border and shado w */}
            <div
                className="absolute bottom-3 right-3 flex items-stretch gap-0 bg-black/75 rounded-md px-1 py-1 border border-white/10 shadow-sm"
                style={{ pointerEvents: "none" }}
            >
                <Button
                    size="sm"
                    variant="secondary"
                    //onClick={() => changeScene("CharacterCreate")}
                    onClick={() => setShowShop((v) => !v)}
                    style={{ pointerEvents: "auto" }}
                    className="rounded-none px-3 py-1 text-sm"
                >
                    <StoreIcon />
                </Button>

                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowMinigames((v) => !v)}
                    style={{ pointerEvents: "auto" }}
                    className="rounded-none border-l border-white/10 px-3 py-1 text-sm"
                >
                    <Swords />
                </Button>

                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowPrivateRoom((v) => !v)}
                    style={{ pointerEvents: "auto" }}
                    className="rounded-none border-l border-white/10 px-3 py-1 text-sm"
                >
                    <BedSingle />
                </Button>

                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowFriendsList((v) => !v)}
                    style={{ pointerEvents: "auto" }}
                    className="rounded-none border-l border-white/10 px-3 py-1 text-sm"
                >
                    <Users />
                </Button>

                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowMenu((v) => !v)}
                    style={{ pointerEvents: "auto" }}
                    className="rounded-none border-l border-white/10 px-3 py-1 text-sm"
                >
                    Menu
                </Button>
            </div>
            {showMenu && (
                <div className="absolute inset-0 grid place-items-center " style={{ pointerEvents: "auto" }}>
                    <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
                        <h2 className="mb-3 text-xl font-bold">Game Menu</h2>
                        <p className="mb-4 text-sm opacity-80">Change settings or exit to lobby.</p>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowMenu(false)}>Resume</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shop modal commented out — re-enable by uncommenting and restoring state above */}
            {showShop && (
                <div className="absolute inset-0 grid place-items-center " style={{ pointerEvents: "auto" }}>
                    <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
                        <h2 className="mb-3 text-xl font-bold">Shop Menu</h2>
                        <p className="mb-4 text-sm opacity-80">Open shop</p>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowShop(false)}>Resume</Button>
                        </div>
                    </div>
                </div>
            )}

            {showMinigames && (
                <div className="absolute inset-0 grid place-items-center " style={{ pointerEvents: "auto" }}>
                    <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
                        <h2 className="mb-3 text-xl font-bold">MiniGames</h2>
                        <p className="mb-4 text-sm opacity-80">Open MiniGames</p>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowMinigames(false)}>Resume</Button>
                        </div>
                    </div>
                </div>
            )}

            {showFriendsList && (
                <div className="absolute inset-0 grid place-items-center " style={{ pointerEvents: "auto" }}>
                    <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
                        <h2 className="mb-3 text-xl font-bold">Friends List</h2>
                        <p className="mb-4 text-sm opacity-80">Open Friends List</p>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowFriendsList(false)}>Resume</Button>
                        </div>
                    </div>
                </div>
            )}

             {showPrivateRoom && (
                <div className="absolute inset-0 grid place-items-center " style={{ pointerEvents: "auto" }}>
                    <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
                        <h2 className="mb-3 text-xl font-bold">Private Rooms</h2>
                        <p className="mb-4 text-sm opacity-80">Open Private Rooms</p>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowPrivateRoom(false)}>Resume</Button>
                        </div>
                    </div>
                </div>
            )}
           

        </>
    )
}