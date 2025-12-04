"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterForward } from "@/components/svg/char-forward";
import { usePlayer } from "@/context/playerContext";
import {
    subscribeFriends,
    subscribeFriendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
} from "@/lib/friends/friendService";
import { Check, X, UserMinus, MessageCircle } from "lucide-react";
import DMChat from "./DmChat";
import { Friend, FriendRequest } from "@/types/friends-data";


type FriendsListProps = {
    onClose: () => void;
};

export default function FriendsList({ onClose }: FriendsListProps) {
    const { playerData } = usePlayer();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDM, setActiveDM] = useState<Friend | null>(null);

    useEffect(() => {
        if (!playerData?.userId) return;

        const unsubFriends = subscribeFriends(playerData.userId, (data) => {
            setFriends(data);
            setLoading(false);
        });

        const unsubRequests = subscribeFriendRequests(playerData.userId, (data) => {
            setRequests(data);
        });

        return () => {
            unsubFriends();
            unsubRequests();
        };
    }, [playerData?.userId]);

    const handleAccept = async (fromUserId: string) => {
        if (!playerData?.userId) return;
        const result = await acceptFriendRequest(playerData.userId, fromUserId);
        if (!result.success) {
            console.error(result.error);
        }
    };

    const handleDecline = async (fromUserId: string) => {
        if (!playerData?.userId) return;
        const result = await declineFriendRequest(playerData.userId, fromUserId);
        if (!result.success) {
            console.error(result.error);
        }
    };

    const handleRemove = async (friendUserId: string) => {
        if (!playerData?.userId) return;
        const result = await removeFriend(playerData.userId, friendUserId);
        if (!result.success) {
            console.error(result.error);
        }
    };

    const handleVisitBowl = (friendUserId: string) => {
    const game = window.PhaserGame;
    if (!game) return;

    // Set the bowl owner to the friend being visited
    (window as any).__bowlOwnerId = friendUserId;

    game.scene.stop("MainScene");
    game.scene.stop("PrivateScene");
    game.scene.start("LoadingScene", {
        targetScene: "PrivateScene",
        targetData: { playerData, targetSessionId: friendUserId },
    });

    onClose();
};

    const handleOpenDM = (friend: Friend) => {
        setActiveDM(friend);
    };

    const handleCloseDM = () => {
        setActiveDM(null);
    };

    return (
        <div className="flex gap-2">
            {activeDM && (
                <DMChat
                    friend={activeDM}
                    onClose={handleCloseDM}
                />
            )}

            <div className="w-[450px] h-[500px] rounded-xl border border-white/10 bg-[#0f403c] p-4 text-white backdrop-blur hud-frame flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        onClick={onClose}
                        className="hud-frame !rounded-full bg-[#0f403c] hover:bg-[#144D52] text-white !h-8 !w-8 p-2 !text-xs"
                    >
                        <X size={16} />
                    </Button>
                    <h2 className="text-xl font-bold">Friends</h2>
                    <div className="w-8"></div>
                </div>

                <Tabs defaultValue="friends" className="flex flex-col flex-1 min-h-0">
                    <TabsList className="grid w-full grid-cols-2 bg-[#0c2d30]">
                        <TabsTrigger
                            value="friends"
                            className="data-[state=active]:bg-[#27A59B] data-[state=active]:text-white"
                        >
                            Friends ({friends.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="requests"
                            className="data-[state=active]:bg-[#27A59B] data-[state=active]:text-white"
                        >
                            Requests ({requests.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends" className="flex-1 mt-4 min-h-0">
                        <ScrollArea className="h-full">
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <p className="text-white/60">Loading...</p>
                                </div>
                            ) : friends.length === 0 ? (
                                <div className="flex items-center justify-center h-32">
                                    <p className="text-white/60">No friends yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2 pr-2">
                                    {friends.map((friend) => (
                                        <div
                                            key={friend.userId}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-[#0c2d30] hud-frame"
                                        >
                                            <div className="w-12 h-12 flex items-center justify-center">
                                                <CharacterForward
                                                    bodyColor={friend.bodyColor}
                                                    size={48}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">{friend.displayName}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOpenDM(friend)}
                                                    className="bg-[#27A59B] hover:bg-[#2ab8ad] px-2"
                                                >
                                                    <MessageCircle size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleVisitBowl(friend.userId)}
                                                    className="bg-[#27A59B] hover:bg-[#2ab8ad] px-2"
                                                >
                                                    Visit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleRemove(friend.userId)}
                                                    className="bg-red-600/80 hover:bg-red-600 px-2"
                                                >
                                                    <UserMinus size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="requests" className="flex-1 mt-4 min-h-0">
                        <ScrollArea className="h-full">
                            {requests.length === 0 ? (
                                <div className="flex items-center justify-center h-32">
                                    <p className="text-white/60">No pending requests</p>
                                </div>
                            ) : (
                                <div className="space-y-2 pr-2">
                                    {requests.map((request) => (
                                        <div
                                            key={request.userId}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-[#0c2d30] hud-frame"
                                        >
                                            <div className="w-12 h-12 flex items-center justify-center">
                                                <CharacterForward
                                                    bodyColor={request.bodyColor}
                                                    size={48}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">{request.displayName}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAccept(request.userId)}
                                                    className="bg-green-600/80 hover:bg-green-600 px-2"
                                                >
                                                    <Check size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDecline(request.userId)}
                                                    className="bg-red-600/80 hover:bg-red-600 px-2"
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}