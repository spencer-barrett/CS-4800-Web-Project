
import {Client, getStateCallbacks} from 'colyseus.js'
export default async function Connect() {
const client = new Client('http://localhost:2567');
const room = await client.joinOrCreate('my_room', {
  
});
  console.log("joined successfully", room);

const $ = getStateCallbacks(room);

 
    return room;

}



Connect();