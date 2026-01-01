import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import {
  Search,
  Delete,
  Block,
  CheckCircle,
  Warning,
  Visibility,
  Person,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/admin.service';
import { MESSAGES, WARNING_TYPES } from '../../utils/constants';

const WARNING_TYPE_LABELS = {
  overdue: 'Overdue',
  nuisance: 'Nuisance',
  harassment: 'Harassment',
  hate_speech: 'Hate Speech',
  other: 'Other',
};

function UsersManagement() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(searchParams.get('status') === 'suspended' ? 2 : 0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(30);

  const getRoleFilter = () => {
    if (tab === 0) return undefined;
    if (tab === 1) return 'student';
    return undefined;
  };

  const getStatusFilter = () => {
    if (tab === 2) return 'suspended';
    return 'active';
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, search, tab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        role: getRoleFilter(),
        status: getStatusFilter(),
      });
      setUsers(data.users || []);
      setTotalUsers(data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user) => {
    try {
      const userData = await adminService.getUserById(user.id);
      setSelectedUser(userData);
      setViewDialogOpen(true);
    } catch (err) {
      toast.error('Failed to load user details');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(selectedUser.id);
      toast.success(MESSAGES.USER_REMOVED);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleSuspendUser = async () => {
    try {
      await adminService.suspendUser(selectedUser.id, {
        reason: suspendReason,
        duration_days: suspendDays,
      });
      toast.success(MESSAGES.USER_SUSPENDED);
      setSuspendDialogOpen(false);
      setSuspendReason('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to suspend user');
    }
  };

  const handleUnsuspendUser = async (user) => {
    try {
      await adminService.unsuspendUser(user.id);
      toast.success('User suspension lifted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to unsuspend user');
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Users Management
        </Typography>

        <Tabs
          value={tab}
          onChange={(e, newValue) => {
            setTab(newValue);
            setPage(0);
          }}
          sx={{ mb: 3 }}
        >
          <Tab label="All Users" />
          <Tab label="Students" />
          <Tab label="Suspended" />
        </Tabs>

        <TextField
          fullWidth
          placeholder="Search by email, phone, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Warnings</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: user.is_suspended ? '#f44336' : '#667eea' }}>
                          <Person />
                        </Avatar>
                        <Typography>{user.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'student' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>{user.student_id || user.employee_id || '-'}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<Warning />}
                        label={user.warning_count || 0}
                        size="small"
                        color={user.warning_count >= 3 ? 'error' : user.warning_count > 0 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {user.is_suspended ? (
                        <Chip label="Suspended" color="error" size="small" />
                      ) : (
                        <Chip label="Active" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleViewUser(user)}>
                        <Visibility />
                      </IconButton>
                      {user.is_suspended ? (
                        <IconButton color="success" onClick={() => handleUnsuspendUser(user)}>
                          <CheckCircle />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="warning"
                          onClick={() => {
                            setSelectedUser(user);
                            setSuspendDialogOpen(true);
                          }}
                        >
                          <Block />
                        </IconButton>
                      )}
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSelectedUser(user);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography>{selectedUser.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography>{selectedUser.phone || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Typography>{selectedUser.role}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">ID</Typography>
                  <Typography>{selectedUser.student_id || selectedUser.employee_id || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Warning Count</Typography>
                  <Typography color={selectedUser.warning_count >= 3 ? 'error' : 'inherit'}>
                    {selectedUser.warning_count || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography color={selectedUser.is_suspended ? 'error' : 'success.main'}>
                    {selectedUser.is_suspended ? 'Suspended' : 'Active'}
                  </Typography>
                </Grid>
              </Grid>

              {selectedUser.warnings && selectedUser.warnings.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Warning History
                  </Typography>
                  <List dense>
                    {selectedUser.warnings.map((warning, index) => (
                      <ListItem key={warning.id || index}>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip label={WARNING_TYPE_LABELS[warning.type]} size="small" color="warning" />
                              <Typography variant="caption">
                                {new Date(warning.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                          secondary={warning.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)}>
        <DialogTitle>Suspend User</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Are you sure you want to suspend {selectedUser?.email}?
          </Typography>
          <TextField
            fullWidth
            label="Reason"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Duration (days)"
            type="number"
            value={suspendDays}
            onChange={(e) => setSuspendDays(parseInt(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSuspendUser} color="warning" variant="contained">
            Suspend
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.email}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UsersManagement;

