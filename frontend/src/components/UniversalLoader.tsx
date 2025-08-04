import React from 'react';
import { Box, Paper, Typography, CircularProgress, Avatar, Button } from '@mui/material';
import { themeConfig } from '../theme/themeConfig';

interface UniversalLoaderProps {
  variant?: 'page' | 'component' | 'overlay';
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showSteps?: boolean;
  steps?: Array<{ text: string; completed?: boolean }>;
  onRetry?: () => void;
  error?: string | null;
  size?: 'small' | 'medium' | 'large';
}

const UniversalLoader: React.FC<UniversalLoaderProps> = ({
  variant = 'page',
  title = 'Loading...',
  subtitle = 'Please wait while we prepare your content',
  showLogo = true,
  showSteps = false,
  steps = [],
  onRetry,
  error = null,
  size = 'medium'
}) => {
  const logoUrl = '/Logo.png';
  
  const sizeConfig = {
    small: { logoSize: 40, progressSize: 24, spacing: 2 },
    medium: { logoSize: 60, progressSize: 40, spacing: 3 },
    large: { logoSize: 80, progressSize: 60, spacing: 4 }
  };

  const config = sizeConfig[size];

  // Error state
  if (error) {
    return (
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: variant === 'page' ? '100vh' : '400px',
          p: 3,
          gap: config.spacing,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: config.logoSize,
              height: config.logoSize,
              borderRadius: '50%',
              bgcolor: themeConfig.colors.error,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img 
              src={logoUrl} 
              alt="KampusKart" 
              style={{ 
                width: config.logoSize * 0.6, 
                height: config.logoSize * 0.6,
                filter: 'brightness(0) invert(1)',
              }} 
            />
          </Box>
          
          <Typography variant={size === 'large' ? 'h5' : 'h6'} fontWeight={600} sx={{ color: themeConfig.colors.error }}>
            {title}
          </Typography>
          
          <Typography variant="body2" sx={{ color: themeConfig.colors.text.secondary }} textAlign="center">
            {error}
          </Typography>
        </Box>

        {onRetry && (
          <Button 
            variant="contained" 
            onClick={onRetry}
            sx={{ 
              mt: 2,
              bgcolor: themeConfig.colors.primary,
              '&:hover': {
                bgcolor: themeConfig.colors.primary,
                opacity: 0.9
              }
            }}
          >
            Retry
          </Button>
        )}
      </Box>
    );
  }

  // Loading state
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: variant === 'page' ? '100vh' : '400px',
        p: 3,
        gap: config.spacing,
        bgcolor: variant === 'overlay' ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
        position: variant === 'overlay' ? 'absolute' : 'relative',
        top: variant === 'overlay' ? 0 : 'auto',
        left: variant === 'overlay' ? 0 : 'auto',
        right: variant === 'overlay' ? 0 : 'auto',
        bottom: variant === 'overlay' ? 0 : 'auto',
        zIndex: variant === 'overlay' ? 1000 : 'auto',
      }}
    >
      {/* Animated Logo */}
      {showLogo && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
                      <Box
              sx={{
                width: config.logoSize,
                height: config.logoSize,
                borderRadius: '50%',
                bgcolor: themeConfig.colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: themeConfig.animations.pulse,
                '@keyframes pulse': themeConfig.loading.logo.pulse,
              }}
            >
            <img 
              src={logoUrl} 
              alt="KampusKart" 
              style={{ 
                width: config.logoSize * 0.6, 
                height: config.logoSize * 0.6,
                filter: 'brightness(0) invert(1)',
              }} 
            />
          </Box>
          
          <Typography variant={size === 'large' ? 'h5' : 'h6'} fontWeight={600} sx={{ color: themeConfig.colors.primary }}>
            {title}
          </Typography>
          
          <Typography variant="body2" sx={{ color: themeConfig.colors.text.secondary }} textAlign="center">
            {subtitle}
          </Typography>
        </Box>
      )}

      {/* Progress Indicator */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <CircularProgress 
          size={config.progressSize} 
          thickness={4}
          sx={{ 
            color: themeConfig.colors.primary,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Typography variant="caption" sx={{ color: themeConfig.colors.text.secondary }}>
          Loading content...
        </Typography>
      </Box>

      {/* Loading Steps */}
      {showSteps && steps.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 300 }}>
          {steps.map((step, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress 
                size={16} 
                sx={{ 
                  color: step.completed ? themeConfig.loading.steps.completed : themeConfig.loading.steps.active
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: step.completed ? themeConfig.loading.steps.completed : themeConfig.loading.steps.pending
                }}
              >
                {step.text}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UniversalLoader; 