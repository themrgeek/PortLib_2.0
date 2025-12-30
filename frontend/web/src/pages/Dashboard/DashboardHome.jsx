import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Card as MuiCard,
  CardContent,
} from '@mui/material';
import {
  MenuBook,
  People,
  TrendingUp,
  Assignment,
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import { USER_ROLES } from '../../utils/constants';

function DashboardHome() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.LIBRARIAN;

  const stats = [
    {
      title: 'Total Books',
      value: '1,234',
      icon: MenuBook,
      color: '#2196f3',
      show: true,
    },
    {
      title: 'Active Users',
      value: '567',
      icon: People,
      color: '#4caf50',
      show: isAdmin,
    },
    {
      title: 'Books Issued',
      value: '89',
      icon: Assignment,
      color: '#ff9800',
      show: isAdmin,
    },
    {
      title: 'Popularity',
      value: '+12%',
      icon: TrendingUp,
      color: '#f44336',
      show: true,
    },
  ].filter((stat) => stat.show);

  return (
    <Box>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'white',
              color: 'primary.main',
              fontSize: 24,
            }}
          >
            {user?.name?.charAt(0) || user?.email?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome back, {user?.name || user?.email}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {user?.role?.toUpperCase()} Dashboard
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MuiCard>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                    <stat.icon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </MuiCard>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <MuiCard sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <CardContent>
                <MenuBook color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Browse Books</Typography>
                <Typography variant="body2" color="text.secondary">
                  Search and explore available books
                </Typography>
              </CardContent>
            </MuiCard>
          </Grid>
          {isAdmin && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <MuiCard
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <CardContent>
                    <People color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">Manage Users</Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage library users
                    </Typography>
                  </CardContent>
                </MuiCard>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MuiCard
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <CardContent>
                    <Assignment color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">View Reports</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generate and view reports
                    </Typography>
                  </CardContent>
                </MuiCard>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}

export default DashboardHome;

