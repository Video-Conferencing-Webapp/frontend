import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  styled,
  Drawer,
} from "@mui/material";
import Peer from "simple-peer";
import io from "socket.io-client";
import RoomControls from "../components/RoomControls";
import Chat from "../components/Chat";
import ParticipantList from "../components/ParticipantList";
import VideoTile from "../components/VideoTile";

const Video = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const StyledBox = styled(Box)({
  position: "relative",
  width: "100%",
  paddingTop: "75%", // 4:3 aspect ratio
});

const VideoContainer = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
});

export default function RoomPage() {
  const { roomCode } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [hostId, setHostId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isAudioMuted, setAudioMuted] = useState(false);
  const [isVideoMuted, setVideoMuted] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [hasVideoPermission, setHasVideoPermission] = useState(false);
  const [isScreenSharing, setScreenSharing] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isParticipantListOpen, setParticipantListOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const socketRef = useRef();
  const peersRef = useRef({}); // Store peers by peerId

  useEffect(() => {
    const initialize = async () => {
      let videoStream = null;
      let audioStream = null;

      try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasVideoPermission(true);
      } catch (err) {
        console.error("Video permission denied:", err);
        setHasVideoPermission(false);
      }

      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasAudioPermission(true);
      } catch (err) {
        console.error("Audio permission denied:", err);
        setHasAudioPermission(false);
      }

      const tracks = [
        ...(videoStream ? videoStream.getVideoTracks() : []),
        ...(audioStream ? audioStream.getAudioTracks() : []),
      ];

      console.log("Tracks:", tracks);
      const stream = new MediaStream(tracks);
      setLocalStream(stream);

      socketRef.current = io(import.meta.env.VITE_WS_URL);
      
      socketRef.current.on('connect', () => {
        socketRef.current.emit("join_room", { 
          roomId: roomCode, 
          peerId: user.id,
          userData: { username: user.username } 
        }, (response) => {
          setHostId(response.roomHostId);
          const initialPeers = [];
          for (const [peerId, userData] of Object.entries(response.participants)) {
            const peer = createPeer(peerId, socketRef.current.id, stream);
            peersRef.current[peerId] = peer;
            initialPeers.push({
              id: peerId,
              ...userData,
              stream: null, // Stream will be added on 'stream' event
              isMuted: false,
              isVideoOff: false,
            });
          }
          setParticipants(initialPeers);
        });
      });

      socketRef.current.on("peer_joined", ({ peerId, userData }) => {
        const peer = addPeer(null, peerId, stream);
        peersRef.current[peerId] = peer;
        setParticipants((prev) => [
          ...prev,
          { id: peerId, ...userData, stream: null, isMuted: false, isVideoOff: false },
        ]);
      });
      
      socketRef.current.on('update_media_state', ({ peerId, media, state }) => {
        setParticipants(prev => prev.map(p => {
          if (p.id === peerId) {
            return { ...p, [media === 'audio' ? 'isMuted' : 'isVideoOff']: state };
          }
          return p;
        }));
      });

      socketRef.current.on("receiving returned signal", (payload) => {
        const item = participants.find((p) => p.id === payload.id);
        item.peer.signal(payload.signal);
      });

      socketRef.current.on("peer_left", (payload) => {
        const newParticipants = participants.filter((p) => p.id !== payload.peerId);
        setParticipants(newParticipants);
      });

      socketRef.current.on("screen_share_started", (payload) => {
        // Handle another user starting screen share
      });

      socketRef.current.on("screen_share_stopped", (payload) => {
        // Handle another user stopping screen share
      });

      socketRef.current.on("new_chat_message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    };

    initialize();

    return () => {
      // Cleanup logic
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomCode, user.id]);

  const addPeerStream = (peerId, stream) => {
    setParticipants(prev => 
      prev.map(p => p.id === peerId ? { ...p, stream } : p)
    );
  };

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    peer.on("stream", (remoteStream) => addPeerStream(userToSignal, remoteStream));

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.on("stream", (remoteStream) => addPeerStream(callerID, remoteStream));

    if (incomingSignal) peer.signal(incomingSignal);

    return peer;
  }

  const handleToggleAudio = () => {
    if (!hasAudioPermission) return;
    const newState = !isAudioMuted;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !newState;
    });
    setAudioMuted(newState);
    socketRef.current.emit("update_media_state", { peerId: user.id, media: "audio", state: newState });
  };

  const handleToggleVideo = () => {
    if (!hasVideoPermission) return;
    const newState = !isVideoMuted;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !newState;
    });
    setVideoMuted(newState);
    socketRef.current.emit("update_media_state", { peerId: user.id, media: "video", state: newState });
  };

  const handleLeaveRoom = () => {
    socketRef.current.emit("leave_room", { peerId: socketRef.current.id });
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    socketRef.current.disconnect();
    navigate("/");
  };

  const handleToggleScreenShare = () => {
    if (!isScreenSharing) {
      navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((stream) => {
        const screenTrack = stream.getVideoTracks()[0];
        const audioTrack = localStream?.getAudioTracks()[0];
        
        const newStream = new MediaStream([screenTrack, ...(audioTrack ? [audioTrack] : [])]);
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(newStream);

        participants.forEach(p => {
          const sender = p.peer.streams[0].getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        screenTrack.onended = () => {
          handleToggleScreenShare(); // Toggle back
        };
        
        setScreenSharing(true);
        socketRef.current.emit("start_screen_share", { peerId: socketRef.current.id });
      });
    } else {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      setScreenSharing(false);
      socketRef.current.emit("stop_screen_share", { peerId: socketRef.current.id });
    }
  };

  const handleSendMessage = (message) => {
    const messageData = {
      text: message,
      sender: user.username,
      peerId: socketRef.current.id,
    };
    socketRef.current.emit("send_chat_message", messageData);
    setMessages((prevMessages) => [...prevMessages, messageData]);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        anchor="left"
        open={isParticipantListOpen}
        onClose={() => setParticipantListOpen(false)}
        variant="persistent"
      >
        <Box sx={{ width: 240, height: '100%' }}>
          <ParticipantList participants={participants} />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, position: "relative" }}>
        <Typography variant="h4" gutterBottom>
          Room: {roomCode}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <VideoTile
              stream={localStream}
              username={user.username}
              isHost={user.id === hostId}
              isMuted={isAudioMuted}
              isVideoOff={!hasVideoPermission || isVideoMuted}
              isLocal={true}
            />
          </Grid>
          {participants.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <VideoTile
                stream={p.stream}
                username={p.username}
                isHost={p.id === hostId}
                isMuted={p.isMuted}
                isVideoOff={p.isVideoOff}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0, p: 2, bgcolor: "background.paper" }}>
          <RoomControls
            onLeave={handleLeaveRoom}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleChat={() => setChatOpen(!isChatOpen)}
            onToggleParticipantList={() => setParticipantListOpen(!isParticipantListOpen)}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            isScreenSharing={isScreenSharing}
            isChatOpen={isChatOpen}
            isParticipantListOpen={isParticipantListOpen}
            audioDisabled={!hasAudioPermission}
            videoDisabled={!hasVideoPermission}
          />
        </Box>
      </Box>
      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={() => setChatOpen(false)}
        variant="persistent"
      >
        <Box sx={{ width: 320, height: '100%' }}>
          <Chat messages={messages} onSendMessage={handleSendMessage} />
        </Box>
      </Drawer>
    </Box>
  );
}

const PeerVideo = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <Video playsInline autoPlay ref={ref} />;
}; 