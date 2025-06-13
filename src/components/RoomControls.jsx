import { Button, IconButton, Stack } from "@mui/material";
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  CallEnd,
  ScreenShare,
  StopScreenShare,
  Chat as ChatIcon,
  People,
} from "@mui/icons-material";

export default function RoomControls({
  onLeave,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipantList,
  isAudioMuted,
  isVideoMuted,
  isScreenSharing,
  isChatOpen,
  isParticipantListOpen,
  audioDisabled,
  videoDisabled,
}) {
  return (
    <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
      <IconButton onClick={onToggleAudio} color={isAudioMuted ? "default" : "primary"} disabled={audioDisabled}>
        {isAudioMuted ? <MicOff /> : <Mic />}
      </IconButton>
      <IconButton onClick={onToggleVideo} color={isVideoMuted ? "default" : "primary"} disabled={videoDisabled}>
        {isVideoMuted ? <VideocamOff /> : <Videocam />}
      </IconButton>
      <IconButton onClick={onToggleScreenShare} color={isScreenSharing ? "primary" : "default"}>
        {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
      </IconButton>
      <IconButton onClick={onToggleChat} color={isChatOpen ? "primary" : "default"}>
        <ChatIcon />
      </IconButton>
      <IconButton onClick={onToggleParticipantList} color={isParticipantListOpen ? "primary" : "default"}>
        <People />
      </IconButton>
      <Button
        variant="contained"
        color="error"
        startIcon={<CallEnd />}
        onClick={onLeave}
      >
        Leave
      </Button>
    </Stack>
  );
} 