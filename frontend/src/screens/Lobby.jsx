import React, { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketProvider';
import { CopyToClipboard} from 'react-copy-to-clipboard';

function Lobby() {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const [name, setName] = useState('');
  const socket = useSocket();
  const navigate = useNavigate();
  const handleSubmitForm = useCallback((e) => {
    e.preventDefault();
    socket.emit("room:join", {email, room})
    
  }, [email, room, socket])

  const handelJoinRoom = useCallback ((data) => {
    const {email, room} = data
    navigate(`/room/${room}`)
  }, [navigate])
  useEffect(() => {
    socket.on("room:join", handelJoinRoom)
    
    return() => {
      socket.off("room:join", handelJoinRoom)
      socket.off('me');
    }
  }, [socket, handelJoinRoom])
  
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  
  return (
    <div>
      <div className="flex flex-col  bg-gray-100  h-screen ">
       

     

  <div className="bg-white p-8 rounded-lg shadow-md">
    <h1 className="text-2xl font-bold mb-4 text-center">Lobby</h1>
    
    
  
    <form onSubmit={handleSubmitForm} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="room">Room Link:</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={e => setRoom(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="text-center">
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Join
        </button>
      </div>
    </form>
    
</div>
</div>
    </div>
  )
}

export default Lobby
