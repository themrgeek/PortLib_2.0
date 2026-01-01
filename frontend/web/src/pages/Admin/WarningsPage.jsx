import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  Grid,
  Autocomplete,
} from '@mui/material';
import {
  Add,
  Search,
  Warning,
  Person,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import adminService from '../../services/admin.service';
import { MESSAGES, WARNING_TYPES } from '../../utils/constants';

const WARNING_TYPE_LABELS = {
  overdue: 'Overdue Book Return',
  nuisance: 'Nuisance Behavior',
  harassment: 'Harassment',
  hate_speech: 'Hate Speech',
  other: 'Other Violation',
};

const WARNING_TYPE_COLORS = {
  overdue: 'warning',
  nuisance: 'info',
  harassment: 'error',
  hate_speech: 'error',
  other: 'default',
};

const warningSchema = Yup.object().shape({
  user_id: Yup.string().required('User is required'),
  type: Yup.string().required('Warning type is required'),
  description: Yup.string().required('Description is required'),
});

function WarningsPage() {
  const [warnings, setWarnings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalWarnings, setTotalWarnings] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchWarnings();
    fetchUsers();
  }, [page, rowsPerPage, typeFilter]);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getWarnings({
        page: page + 1,
        limit: rowsPerPage,
        type: typeFilter || undefined,
      });
      setWarnings(data.warnings || []);
      setTotalWarnings(data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load warnings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers({ limit: 100 });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const formik = useFormik({
    initialValues: {
      user_id: '',
      type: '',
      description: '',
    },
    validationSchema: warningSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await adminService.sendWarning(values);
        toast.success(MESSAGES.WARNING_SENT);
        
        if (response.userSuspended) {
          toast.warning(`User has been auto-suspended after 3 warnings`);
        }
        
        handleCloseDialog();
        resetForm();
        setSelectedUser(null);
        fetchWarnings();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to send warning');
      }
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    formik.resetForm();
  };

  const handleUserSelect = (event, value) => {
    setSelectedUser(value);
    if (value) {
      formik.setFieldValue('user_id', value.id);
    } else {
      formik.setFieldValue('user_id', '');
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Warnings Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Send Warning
          </Button>
        </Box>

        <TextField
          select
          label="Filter by Type"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 200, mb: 3 }}
        >
          <MenuItem value="">All Types</MenuItem>
          {Object.entries(WARNING_TYPE_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </TextField>

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
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Sent By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : warnings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No warnings found
                  </TableCell>
                </TableRow>
              ) : (
                warnings.map((warning) => (
                  <TableRow key={warning.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: '#ff9800' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography>{warning.user?.email || 'Unknown'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {warning.user?.role}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={WARNING_TYPE_LABELS[warning.type] || warning.type}
                        size="small"
                        color={WARNING_TYPE_COLORS[warning.type] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {warning.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{warning.admin?.email || 'System'}</TableCell>
                    <TableCell>
                      {new Date(warning.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={warning.is_read ? 'Read' : 'Unread'}
                        size="small"
                        color={warning.is_read ? 'default' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalWarnings}
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

      {/* Send Warning Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Send Warning</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) => `${option.email} (${option.role})`}
                  value={selectedUser}
                  onChange={handleUserSelect}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select User *"
                      error={formik.touched.user_id && Boolean(formik.errors.user_id)}
                      helperText={formik.touched.user_id && formik.errors.user_id}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ mr: 2, bgcolor: '#667eea' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography>{option.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.role} | Warnings: {option.warning_count || 0}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Warning Type *"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}
                >
                  {Object.entries(WARNING_TYPE_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description *"
                  name="description"
                  placeholder="Describe the violation in detail..."
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              {selectedUser && selectedUser.warning_count >= 2 && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    This user already has {selectedUser.warning_count} warning(s). 
                    Sending this warning will result in automatic suspension.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              startIcon={<Warning />}
            >
              Send Warning
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default WarningsPage;

