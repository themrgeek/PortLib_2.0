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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  MenuBook,
  CloudUpload,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import booksService from '../../services/books.service';
import { BOOK_CONDITIONS, MESSAGES } from '../../utils/constants';

const bookSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  author: Yup.string().required('Author is required'),
  isbn: Yup.string(),
  category: Yup.string(),
  quantity: Yup.number().min(0).required('Quantity is required'),
  publisher: Yup.string(),
  publication_year: Yup.number().min(1000).max(new Date().getFullYear()),
  description: Yup.string(),
  location: Yup.string(),
  shelf_number: Yup.string(),
  condition: Yup.string(),
  price: Yup.number().min(0),
});

function BooksManagement() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalBooks, setTotalBooks] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [page, rowsPerPage, search]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await booksService.getBooks({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      setBooks(data.books || []);
      setTotalBooks(data.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      author: '',
      isbn: '',
      category: '',
      quantity: 1,
      publisher: '',
      publication_year: '',
      description: '',
      location: '',
      shelf_number: '',
      condition: 'good',
      price: '',
    },
    validationSchema: bookSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (values[key] !== '' && values[key] !== null) {
            formData.append(key, values[key]);
          }
        });
        if (coverImage) {
          formData.append('cover_image', coverImage);
        }

        if (editingBook) {
          await booksService.updateBook(editingBook.id, formData);
          toast.success(MESSAGES.BOOK_UPDATED);
        } else {
          await booksService.createBook(formData);
          toast.success(MESSAGES.BOOK_ADDED);
        }

        handleCloseDialog();
        resetForm();
        fetchBooks();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Operation failed');
      }
    },
  });

  const handleOpenDialog = (book = null) => {
    if (book) {
      setEditingBook(book);
      formik.setValues({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        category: book.category || '',
        quantity: book.quantity || 1,
        publisher: book.publisher || '',
        publication_year: book.publication_year || '',
        description: book.description || '',
        location: book.location || '',
        shelf_number: book.shelf_number || '',
        condition: book.condition || 'good',
        price: book.price || '',
      });
    } else {
      setEditingBook(null);
      formik.resetForm();
    }
    setCoverImage(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBook(null);
    setCoverImage(null);
  };

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await booksService.deleteBook(bookToDelete.id);
      toast.success(MESSAGES.BOOK_DELETED);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete book');
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      new: 'success',
      good: 'primary',
      fair: 'warning',
      poor: 'error',
    };
    return colors[condition] || 'default';
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Books Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Add Book
          </Button>
        </Box>

        <TextField
          fullWidth
          placeholder="Search books by title, author, or ISBN..."
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
                <TableCell>Book</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>ISBN</TableCell>
                <TableCell>Qty / Available</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No books found
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={book.cover_image_url}
                          variant="rounded"
                          sx={{ width: 40, height: 50, bgcolor: '#667eea' }}
                        >
                          <MenuBook />
                        </Avatar>
                        <Typography fontWeight="500">{book.title}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.category || '-'}</TableCell>
                    <TableCell>{book.isbn || '-'}</TableCell>
                    <TableCell>
                      {book.quantity} / {book.available_count}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.condition}
                        size="small"
                        color={getConditionColor(book.condition)}
                      />
                    </TableCell>
                    <TableCell>{book.location || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(book)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(book)}
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
          count={totalBooks}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBook ? 'Edit Book' : 'Add New Book'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Title *"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Author *"
                  name="author"
                  value={formik.values.author}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.author && Boolean(formik.errors.author)}
                  helperText={formik.touched.author && formik.errors.author}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ISBN"
                  name="isbn"
                  value={formik.values.isbn}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Quantity *"
                  name="quantity"
                  type="number"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Publisher"
                  name="publisher"
                  value={formik.values.publisher}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Publication Year"
                  name="publication_year"
                  type="number"
                  value={formik.values.publication_year}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Shelf Number"
                  name="shelf_number"
                  value={formik.values.shelf_number}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Condition"
                  name="condition"
                  value={formik.values.condition}
                  onChange={formik.handleChange}
                >
                  {Object.entries(BOOK_CONDITIONS).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUpload />}
                  sx={{ height: '56px' }}
                >
                  {coverImage ? coverImage.name : 'Upload Cover Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files[0])}
                  />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              {editingBook ? 'Update' : 'Add Book'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BooksManagement;

