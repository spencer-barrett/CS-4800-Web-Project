export default function MessageBubble({ sender, text }: { sender: string; text: string }) {
    return (
        <div
            className="rounded bg-gray-100 px-2 py-1 w-fit max-w-[90%]"
        >
            <span className="font-semibold mr-2">{sender}:</span>
            {text}
        </div>
    );
}