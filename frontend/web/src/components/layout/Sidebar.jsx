import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  Person,
  MenuBook,
  People,
  Settings,
  Assessment,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import useAuthStore from '../../store/authStore';
import { USER_ROLES } from '../../utils/constants';

const drawerWidth = 260;

function Sidebar({ open, onClose, variant = 'temporary' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { text: 'Dashboard', icon: Dashboard, path: '/dashboard', roles: 'all' },
    { text: 'Profile', icon: Person, path: '/dashboard/profile', roles: 'all' },
    { text: 'Books', icon: MenuBook, path: '/dashboard/books', roles: 'all' },
    {
      text: 'Users',
      icon: People,
      path: '/dashboard/users',
      roles: [USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN],
    },
    {
      text: 'Reports',
      icon: Assessment,
      path: '/dashboard/reports',
      roles: [USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN],
    },
    {
      text: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
      roles: [USER_ROLES.ADMIN],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.roles === 'all') return true;
    return item.roles.includes(user?.role);
  });

  const handleNavigation = (path) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3 }}>
        <Logo size="small" />
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: '8px',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default Sidebar;

