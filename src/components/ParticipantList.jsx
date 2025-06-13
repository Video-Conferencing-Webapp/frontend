import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
} from "@mui/material";

export default function ParticipantList({ participants }) {
  return (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Participants
      </Typography>
      <List sx={{ flexGrow: 1, overflow: "auto" }}>
        {participants.map((participant, index) => (
          <ListItem key={index}>
            <ListItemText primary={participant.username} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
} 