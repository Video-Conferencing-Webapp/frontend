import React from 'react';
import { Box, Typography, CircularProgress, keyframes } from '@mui/material';
import { VideoCall as VideoCallIcon } from '@mui/icons-material';

// Custom animations
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LoadingScreen = ({ 
  message = 'Loading MeetSphere...', 
  submessage = 'Please wait while we prepare your experience',
  variant = 'full', // 'full', 'inline', 'minimal'
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const sizeConfig = {
    small: {
      iconSize: '2rem',
      titleSize: 'h6',
      spacing: 2,
      progressSize: 32
    },
    medium: {
      iconSize: '3.5rem',
      titleSize: 'h4',
      spacing: 4,
      progressSize: 48
    },
    large: {
      iconSize: '5rem',
      titleSize: 'h3',
      spacing: 6,
      progressSize: 64
    }
  };

  const config = sizeConfig[size];

  const LoadingContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: config.spacing,
        animation: `${fadeInUp} 0.6s ease-out`,
      }}
    >
      {/* Animated Logo */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <VideoCallIcon
          sx={{
            fontSize: config.iconSize,
            color: variant === 'full' ? 'white' : 'primary.main',
            animation: `${pulseAnimation} 2s ease-in-out infinite`,
            zIndex: 2,
          }}
        />
        
        {/* Rotating progress ring */}
        <CircularProgress
          size={config.progressSize}
          thickness={2}
          sx={{
            position: 'absolute',
            color: variant === 'full' ? 'rgba(255,255,255,0.5)' : 'primary.light',
            opacity: 0.3,
          }}
        />
      </Box>

      {/* Brand Title */}
      <Typography
        variant={config.titleSize}
        component="h1"
        sx={{
          fontWeight: 700,
          ...(variant === 'full' 
            ? { 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }
            : {
                background: 'linear-gradient(45deg, #6366f1, #06b6d4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }
          ),
          mb: 1,
        }}
      >
        MeetSphere
      </Typography>

      {/* Loading Message */}
      <Box sx={{ maxWidth: 400 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            mb: 1,
            color: variant === 'full' ? 'white' : 'text.primary',
            textShadow: variant === 'full' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {message}
        </Typography>
        
        {submessage && (
          <Typography
            variant="body2"
            sx={{
              opacity: variant === 'full' ? 0.9 : 0.8,
              color: variant === 'full' ? 'white' : 'text.secondary',
              textShadow: variant === 'full' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {submessage}
          </Typography>
        )}
      </Box>

      {/* Loading dots animation */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: variant === 'full' ? 'white' : 'primary.main',
              animation: `${pulseAnimation} 1.4s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );

  // Full screen variant
  if (variant === 'full') {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          zIndex: 9999,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            color: 'white',
            px: 4,
          }}
        >
          <LoadingContent />
        </Box>
      </Box>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          py: 4,
          px: 2,
        }}
      >
        <LoadingContent />
      </Box>
    );
  }

  // Minimal variant
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 2,
      }}
    >
      <CircularProgress size={24} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen; 