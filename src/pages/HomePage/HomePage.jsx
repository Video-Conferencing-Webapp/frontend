import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Grid
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'Start Instant Meeting',
      description: 'Begin a video call right now',
      icon: <VideoCallIcon sx={{ fontSize: '2rem' }} />,
      color: 'primary',
      action: () => console.log('Start meeting'),
    },
    {
      title: 'Schedule Meeting',
      description: 'Plan a meeting for later',
      icon: <ScheduleIcon sx={{ fontSize: '2rem' }} />,
      color: 'secondary',
      action: () => console.log('Schedule meeting'),
    },
    {
      title: 'Join Meeting',
      description: 'Enter a meeting with ID',
      icon: <PeopleIcon sx={{ fontSize: '2rem' }} />,
      color: 'success',
      action: () => console.log('Join meeting'),
    },
  ];

  const recentActivity = [
    { type: 'meeting', title: 'Team Standup', time: '2 hours ago', participants: 5 },
    { type: 'meeting', title: 'Client Presentation', time: '1 day ago', participants: 8 },
    { type: 'meeting', title: 'Design Review', time: '2 days ago', participants: 3 },
  ];

  return (
    <Container maxWidth="xl" sx={{ p: '0 !important' }}>
      {/* Welcome Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(45deg, #6366f1, #06b6d4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {getGreeting()}, {user?.full_name?.split(' ')[0] || 'there'}!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Ready to connect with your team?
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={action.action}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: `${action.color}.light`,
                      color: `${action.color}.main`,
                      mb: 2,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Recent Activity
        </Typography>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentActivity.map((activity, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                }}
              >
                <VideoCallIcon color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {activity.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time} • {activity.participants} participants
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage; 