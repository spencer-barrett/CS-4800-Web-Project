
import {Client, getStateCallbacks, Room} from 'colyseus.js'
export default async function Connect<T>(): Promise<Room<T>> {
const client = new Client("wss://bridge-aggregate-collected-struck.trycloudflare.com");
const room = await client.joinOrCreate('my_room', {
  
});
  console.log("joined successfully", room);

const $ = getStateCallbacks(room);

 
    return room;

}
