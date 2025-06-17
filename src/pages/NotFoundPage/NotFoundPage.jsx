import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  keyframes,
} from '@mui/material';
import {
  Home as HomeIcon,
  VideoCall as VideoCallIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Animation for the 404 number
const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: { xs: 3, sm: 4, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3,
            }}
          >
            <VideoCallIcon
              sx={{
                fontSize: '2rem',
                color: 'primary.main',
              }}
            />
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #6366f1, #06b6d4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MeetSphere
            </Typography>
          </Box>

          {/* 404 Animation */}
          <Box
            sx={{
              position: 'relative',
              mb: 3,
              height: { xs: '120px', sm: '150px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '4rem', sm: '6rem' },
                fontWeight: 800,
                color: 'primary.main',
                opacity: 0.1,
                lineHeight: 1,
                animation: `${floatAnimation} 3s ease-in-out infinite`,
              }}
            >
              404
            </Typography>
            
            <SearchIcon
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: { xs: '2.5rem', sm: '3rem' },
                color: 'primary.main',
                opacity: 0.4,
              }}
            />
          </Box>

          {/* Error Message */}
          <Box sx={{ mb: 4, width: '100%' }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 2,
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              Oops! Page Not Found
            </Typography>
            
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mb: 2,
                fontWeight: 500,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              The meeting room you're looking for doesn't exist
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                px: { xs: 1, sm: 2 },
              }}
            >
              It looks like the page you're trying to reach has been moved, deleted, or never existed. 
              Don't worry, let's get you back to connecting with your team!
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #6366f1, #06b6d4)',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    '&:hover': {
                      background: 'linear-gradient(45deg, #4f46e5, #0891b2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  GO HOME
                </Button>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleGoBack}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.main',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  GO BACK
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Additional Help */}
          <Box
            sx={{
              p: 3,
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(99, 102, 241, 0.2)',
              width: '100%',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 2,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              Need Help?
            </Typography>
            
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                lineHeight: 1.5,
              }}
            >
              If you were trying to join a specific meeting, make sure you have the correct room ID or meeting link.
            </Typography>
            
            <Button
              variant="text"
              color="primary"
              onClick={handleGoLogin}
              sx={{
                textDecoration: 'underline',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                '&:hover': {
                  textDecoration: 'underline',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              SIGN IN TO ACCESS YOUR MEETINGS
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFoundPage; 