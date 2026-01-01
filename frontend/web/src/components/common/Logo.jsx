import { Box, Typography } from '@mui/material';
import { MenuBook } from '@mui/icons-material';

function Logo({ size = 'medium', showTagline = false }) {
  const iconSize = {
    small: 32,
    medium: 48,
    large: 64,
  }[size];

  const titleSize = {
    small: 'h6',
    medium: 'h4',
    large: 'h3',
  }[size];

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      <Box
        sx={{
          width: iconSize * 1.5,
          height: iconSize * 1.5,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        }}
      >
        <MenuBook sx={{ fontSize: iconSize, color: 'white' }} />
      </Box>
      <Typography
        variant={titleSize}
        component="h1"
        fontWeight="bold"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        PortLib
      </Typography>
      {showTagline && (
        <Typography variant="subtitle1" color="text.secondary">
          Smart Library Management
        </Typography>
      )}
    </Box>
  );
}

export default Logo;

