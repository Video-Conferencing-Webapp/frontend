import { useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Stack,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createRoom, joinRoom } from "../redux/slices/room";

export default function HomePage() {
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCreateRoom = async () => {
    try {
      const room = await dispatch(
        createRoom({ name: roomName, max_participants: 10 })
      );
      if (room && room.code) {
        navigate(`/room/${room.code}`);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      // You might want to show a snackbar here
    }
  };

  const handleJoinRoom = async () => {
    const peerId = "temp-peer-id";
    await dispatch(joinRoom({ code: roomCode, peer_id: peerId }));
    navigate(`/room/${roomCode}`);
  };

  return (
    <Container maxWidth="sm">
      <Stack spacing={4} sx={{ mt: 8 }}>
        <Typography variant="h4" align="center">
          Google Meet Clone
        </Typography>

        <Box>
          <Typography variant="h6">Create a new room</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleCreateRoom}
              disabled={!roomName}
            >
              Create
            </Button>
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6">Join a room</Typography>
          <Stack direction="row"spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleJoinRoom}
              disabled={!roomCode}
            >
              Join
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
} 