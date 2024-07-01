import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";

function Room() {
  const socket = useSocket();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [showbtn, setShowbtn] = useState(false);
  const [join, setJoin] = useState(false);
  
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const handleMute = () => {
    if (myStream) {
      myStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };
  const handleCameraToggle = () => {
    if (myStream) {
      myStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsCameraOff(!track.enabled);
      });
    }
  };
  

  
  // const handleAudioToggle = () => {
  //   if (join && remoteStream) {
  //     // Toggle audio of remoteStream
  //     const remoteAudioTrack = remoteStream.getAudioTracks()[0];
  //     if (remoteAudioTrack) {
  //       remoteAudioTrack.enabled = !remoteAudioTrack.enabled;
  //     }
  //   } else if (myStream) {
  //     // Toggle audio of myStream
  //     myStream.getAudioTracks().forEach((track) => {
  //       track.enabled = !track.enabled;
  //     });
  //     setIsMuted((prevState) => !prevState);
  //   }
  // };

  
  
  

  const handleHangup = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    }

    setRemoteSocketId(null);
    setJoin(false);
    setShowbtn(false);
    setIsMuted(false);
    setIsCameraOff(false);

    socket.emit("user:hangup", { to: remoteSocketId });

    if (peer.peer) {
      peer.peer.close();
    }
  };

  
  // Inside Room component

const handleScreenShareToggle = async () => {
  if (isScreenSharing) {
    screenStream.getTracks().forEach((track) => track.stop());
    setScreenStream(null);
    setIsScreenSharing(false);
    // Modify here to send the regular stream after stopping screen share if necessary
  } else {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setScreenStream(screenStream);
      setIsScreenSharing(true);
      // Send screen stream to both myStream and remoteStream
      sendStreams(screenStream);
      setMyStream((prevStream) => {
        if (prevStream) {
          return new MediaStream([...prevStream.getTracks(), ...screenStream.getTracks()]);
        }
        return screenStream;
      });
      if (remoteStream) {
        setRemoteStream((prevStream) => {
          const newStream = new MediaStream(prevStream);
          screenStream.getTracks().forEach((track) => {
            newStream.addTrack(track);
          });
          return newStream;
        });
      }
    } catch (error) {
      console.error("Error accessing display media.", error);
    }
  }
};

// Update the useEffect hook that listens for the track event
useEffect(() => {
  const handleTrackEvent = (ev) => {
    const newStream = remoteStream ? new MediaStream(remoteStream) : new MediaStream();
    ev.streams.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        newStream.addTrack(track);
      });
    });
    setRemoteStream(newStream);
  };

  peer.peer.addEventListener("track", handleTrackEvent);

  return () => {
    peer.peer.removeEventListener("track", handleTrackEvent);
  };
}, [remoteStream]);

  
  
  const handleUserJoined = useCallback(({ email, id }) => {
    setRemoteSocketId(id);
    setShowbtn(true);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
      setJoin(true);
    },
    [socket]
  );


  const sendStreams = useCallback((stream) => {
    for (const track of stream.getTracks()) {
      peer.peer.addTrack(track, stream);
      socket.emit("send:track", { track, to: remoteSocketId });
    }
  }, []);
  


  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStreams(myStream);
    },
    [myStream, sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams[0];
      setRemoteStream(remoteStream);
    });
  }, []);
  
  
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    socket.on("user:hangup", handleHangup);
   
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
      socket.off("user:hangup", handleHangup);
      
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoFinal,
    handleNegoNeedIncoming,
    
  ]);

  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 flex justify-center items-center overflow-hidden">
        {/* this is remote screen for participant means host scree */}
        {join && myStream && (
          <ReactPlayer
            height="100%"
            width="100%"
            playing
            muted={isMuted}
            url={myStream}
            className="object-cover"
          />
        )}
        {/* this is participants my stream */}
        {!join && remoteStream && (
          <ReactPlayer
            height="100%"
            width="100%"
            playing
            muted={false}
            url={remoteStream}
            className="object-cover"
          />
        )}
        {join && screenStream && (
          <ReactPlayer
            height="100%"
            width="100%"
            playing
            muted={false}
            url={screenStream}
            className="object-cover"
          />
        )}
                {!join && screenStream && (
          <ReactPlayer
            height="100%"
            width="100%"
            playing
            muted={false}
            url={screenStream}
            className="rounded-lg shadow-md"
          />
        )}
        
      </div>
      <div className="absolute bottom-4 right-4 w-64 h-48">
        {/* this is host mystream */}
        {join && remoteStream && (
          <ReactPlayer
            height="100%"
            width="100%"
            playing
            muted={false} // unmuted for the remote user's stream
            url={remoteStream}
            className="rounded-lg shadow-md"
          />
        )}
        {/* this is host remote screen means participant screen */}
        {!join && myStream && (
          <ReactPlayer
            height="100%"
            width="100%"
            playing
            muted={isMuted}
            url={myStream}
            className="rounded-lg shadow-md"
          />
        )}

      </div>
      <div className="absolute bottom-4 flex justify-center w-full space-x-2">
        <button
         onClick={handleMute}
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={handleCameraToggle}
          className="py-2 px-4 bg-yellow-500 text-white font-semibold rounded-md shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          {isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        </button>

        
        <button
          onClick={handleScreenShareToggle}
          className="py-2 px-4 bg-yellow-500 text-white font-semibold rounded-md shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          {isScreenSharing ? "Stop Screen Share" : "Share Screen"}
        </button>
        <button
          onClick={handleHangup}
          className="py-2 px-4 bg-red-500 text-white font-semibold rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Hang Up
        </button>
      </div>
      <div className="absolute top-4 flex justify-center w-full space-x-2">
        {myStream && join && (
          <button
            onClick={() => sendStreams(myStream)}
            className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Join
          </button>
        )}
        {remoteSocketId && showbtn && (
          <button
            onClick={handleCallUser}
            className="py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            START MEETING
          </button>
        )}
      </div>
    </div>
  );
}

export default Room;
