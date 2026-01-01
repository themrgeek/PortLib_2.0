import { Button as MuiButton, CircularProgress } from '@mui/material';

function Button({ children, loading, variant = 'contained', color = 'primary', fullWidth, ...props }) {
  return (
    <MuiButton
      variant={variant}
      color={color}
      fullWidth={fullWidth}
      disabled={loading}
      {...props}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        padding: '12px 24px',
        borderRadius: '8px',
        ...props.sx,
      }}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </MuiButton>
  );
}

export default Button;

