import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';

function Input({ 
  label, 
  type = 'text', 
  error, 
  helperText, 
  icon: Icon,
  showPasswordToggle,
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' && showPasswordToggle
    ? (showPassword ? 'text' : 'password')
    : type;

  return (
    <TextField
      label={label}
      type={inputType}
      error={!!error}
      helperText={helperText || error}
      fullWidth
      variant="outlined"
      {...props}
      InputProps={{
        ...(Icon && {
          startAdornment: (
            <InputAdornment position="start">
              <Icon sx={{ color: 'action.active' }} />
            </InputAdornment>
          ),
        }),
        ...(showPasswordToggle && type === 'password' && {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }),
        ...props.InputProps,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
        },
        ...props.sx,
      }}
    />
  );
}

export default Input;

