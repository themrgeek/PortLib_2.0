import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  MenuBook,
  People,
  Warning,
  Block,
  TrendingUp,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import adminService from '../../services/admin.service';

const WARNING_TYPE_COLORS = {
  overdue: 'warning',
  nuisance: 'info',
  harassment: 'error',
  hate_speech: 'error',
  other: 'default',
};

function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [recentWarnings, setRecentWarnings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data.stats);
      setRecentWarnings(data.recentWarnings || []);
      setRecentUsers(data.recentUsers || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Books',
      value: stats?.totalBooks || 0,
      icon: MenuBook,
      color: '#2196f3',
      onClick: () => navigate('/admin/books'),
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: People,
      color: '#4caf50',
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Pending Warnings',
      value: stats?.pendingWarnings || 0,
      icon: Warning,
      color: '#ff9800',
      onClick: () => navigate('/admin/warnings'),
    },
    {
      title: 'Suspended Users',
      value: stats?.suspendedUsers || 0,
      icon: Block,
      color: '#f44336',
      onClick: () => navigate('/admin/users?status=suspended'),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

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
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome back, Admin!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Here's what's happening in your library today.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} mb={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={stat.onClick}
            >
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
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Warnings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Recent Warnings
              </Typography>
              <Chip
                label="View All"
                size="small"
                onClick={() => navigate('/admin/warnings')}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            {recentWarnings.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={3}>
                No recent warnings
              </Typography>
            ) : (
              <List>
                {recentWarnings.map((warning, index) => (
                  <ListItem key={warning.id || index} divider={index < recentWarnings.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#ff9800' }}>
                        <Warning />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={warning.user?.email || 'Unknown User'}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={warning.type}
                            size="small"
                            color={WARNING_TYPE_COLORS[warning.type] || 'default'}
                          />
                          <Typography variant="caption">
                            {new Date(warning.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                New Users
              </Typography>
              <Chip
                label="View All"
                size="small"
                onClick={() => navigate('/admin/users')}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            {recentUsers.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={3}>
                No recent users
              </Typography>
            ) : (
              <List>
                {recentUsers.map((recentUser, index) => (
                  <ListItem key={recentUser.id || index} divider={index < recentUsers.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#4caf50' }}>
                        <PersonAdd />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={recentUser.email}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={recentUser.role}
                            size="small"
                            color={recentUser.role === 'student' ? 'primary' : 'secondary'}
                          />
                          <Typography variant="caption">
                            {new Date(recentUser.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          User Breakdown
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h3" color="primary" fontWeight="bold">
                {stats?.students || 0}
              </Typography>
              <Typography color="text.secondary">Students</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h3" color="secondary" fontWeight="bold">
                {stats?.librarians || 0}
              </Typography>
              <Typography color="text.secondary">Librarians</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                {stats?.warningsThisMonth || 0}
              </Typography>
              <Typography color="text.secondary">Warnings This Month</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default AdminDashboard;

