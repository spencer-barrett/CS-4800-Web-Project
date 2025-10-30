
import {Client, getStateCallbacks, Room} from 'colyseus.js'
export default async function Connect<T>(): Promise<Room<T>> {
const client = new Client("ws://134.199.225.59:2567");
const room = await client.joinOrCreate('my_room', {
  
});
  console.log("joined successfully", room);

const $ = getStateCallbacks(room);

 
    return room;

}
