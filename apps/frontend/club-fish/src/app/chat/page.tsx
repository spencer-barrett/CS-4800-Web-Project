'use client';

// import { Button, Input } from '@heroui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';

type WireMessage = { author: string; content: string };
type CountMessage = { type: 'count'; count: number };

export default function ChatPage() {
  const [joined, setJoined] = React.useState(false);
  const [name, setName] = React.useState('');
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<string[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const socketRef = React.useRef<WebSocket | null>(null);

  const joinChat = () => {
    if (!name.trim()) return;

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://localhost:8080/ws?name=${encodeURIComponent(name)}`;
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data) as Partial<WireMessage & CountMessage>;
        if (data.type === 'count') {
          setCount(data.count ?? 0);
        } else if (data.author && data.content) {
          setMessages((prev) => [...prev, `${data.author}: ${data.content}`]);
        }
      } catch {
        setMessages((prev) => [...prev, evt.data]);
      }
    };

    ws.onclose = () => setMessages((prev) => [...prev, '[disconnected]']);
    setJoined(true);
  };

  const sendMessage = () => {
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && input.trim()) {
      ws.send(JSON.stringify({ author: name, content: input }));
      setInput('');
    }
  };

  if (!joined) {
    return (
      <main className='p-16 w-full h-svh'>
        <div className='flex h-full w-full items-center justify-center'>
          <div className='flex flex-col items-center justify-center'>
            <div>

              <p className='text-3xl font-bold'>Join Chat</p>
            </div>
            <div className='flex items-center my-6'>
            
              <Input
                
                type='text'
                onChange={(e) => setName(e.target.value)}
                value={name}
                className='mr-6'
                placeholder='Enter a username'
                // size='sm'
              />
              
              <Button color="primary" className='text-background' onClick={joinChat} disabled={!name.trim()}>Enter</Button>
            </div>
          </div>

        </div>



      </main>
    );
  }

  return (
    <main className='sm:p-16 p-8 w-full h-svh'>
      <div className='flex h-full w-full items-center justify-center'>
        <div className='flex flex-col items-center justify-center w-full'>
          <div className='flex flex-col items-center mb-6'>
            <p className='text-3xl font-bold'>Chat Room</p>
            <p>Active users: {count}</p>
          </div>
          <div className='flex w-full items-center justify-center'>
            <div className='border-1 h-[40svh] mb-12 sm:w-[60svw] w-[75svw]'>
              {messages.map((m, i) => (
                <div key={i}>{m}</div>
              ))}
            </div>
          </div>
          <div className='flex flex-col w-full items-center justify-center'>

            <div className='mb-6 sm:w-[60svw] w-[75svw]'>


              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."

              />
            </div>
            <Button color='primary' className='text-background' onClick={sendMessage}>Send</Button>
          </div>
        </div>
      </div>

    </main>
  );
}
