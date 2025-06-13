import { useRef, useEffect } from "react";
import { Avatar, Box, Chip, IconButton, Typography, styled } from "@mui/material";
import { Mic, MicOff } from "@mui/icons-material";

const TileContainer = styled(Box)({
  position: "relative",
  width: "100%",
  paddingTop: "75%", // 4:3 Aspect Ratio
  borderRadius: "8px",
  backgroundColor: "#202124",
  overflow: "hidden",
});

const VideoWrapper = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const Video = styled("video")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transform: "rotateY(180deg)", // Mirror local video
});

const Overlay = styled(Box)({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "8px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
});

const UserInfo = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

export default function VideoTile({
  stream,
  username,
  isHost,
  isMuted,
  isVideoOff,
  isLocal = false,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const showAvatar = isVideoOff || !stream?.getVideoTracks()[0]?.enabled;

  return (
    <TileContainer>
      <VideoWrapper>
        {showAvatar ? (
          <Avatar sx={{ width: 100, height: 100, fontSize: "48px" }}>
            {username ? username[0].toUpperCase() : "U"}
          </Avatar>
        ) : (
          <Video ref={videoRef} autoPlay playsInline muted={isLocal} sx={{ transform: isLocal ? 'rotateY(180deg)' : 'none' }} />
        )}
      </VideoWrapper>
      <Overlay>
        <UserInfo>
          <Typography variant="body2" color="white">
            {username} {isLocal && "(You)"}
          </Typography>
          {isHost && <Chip label="Host" size="small" color="primary" />}
        </UserInfo>
        <Box>
          <IconButton size="small" sx={{ color: "white" }} disabled>
            {isMuted ? <MicOff fontSize="small" /> : <Mic fontSize="small" />}
          </IconButton>
        </Box>
      </Overlay>
    </TileContainer>
  );
} 