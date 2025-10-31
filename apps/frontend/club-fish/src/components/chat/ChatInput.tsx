"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FieldSet, FieldGroup, Field } from "../ui/field";
import { Button } from "../ui/button";


export default function ChatInput({ onSend }: { onSend: (message: string) => void }) {
    const [message, setMessage] = useState("");


    const handleMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage("");
        }
    };

    return (

        <form
            onSubmit={handleMessage}
            className="flex items-center justify-center w-full pb-2 px-2 gap-2"
        >
            <FieldSet className="w-full">
                <FieldGroup>
                    <Field>
                        <Input
                            id="chat-box"
                            type="text"
                            required
                            placeholder="type message here"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="text-black"
                            autoComplete="off"
                        />
                    </Field>
                </FieldGroup>
            </FieldSet>
            <Button type="submit">Submit</Button>
        </form>

    );
}
