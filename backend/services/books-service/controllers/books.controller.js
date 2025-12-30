const supabase = require("../../../shared/db/supabase");
const { uploadFile } = require("../../../shared/services/storage.service");

// Get all books with pagination and search
const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, condition } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("books")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    // Search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`
      );
    }

    // Category filter
    if (category) {
      query = query.eq("category", category);
    }

    // Condition filter
    if (condition) {
      query = query.eq("condition", condition);
    }

    const { data: books, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: book, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create new book (Admin only)
const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      quantity,
      publisher,
      publication_year,
      description,
      location,
      shelf_number,
      condition,
      price,
    } = req.body;

    // Check for duplicate ISBN
    if (isbn) {
      const { data: existing } = await supabase
        .from("books")
        .select("id")
        .eq("isbn", isbn)
        .single();

      if (existing) {
        return res.status(400).json({ error: "A book with this ISBN already exists" });
      }
    }

    let cover_image_url = null;

    // Upload cover image if provided
    if (req.file) {
      const fileName = `books/${Date.now()}_${req.file.originalname}`;
      cover_image_url = await uploadFile(
        "book-covers",
        fileName,
        req.file.buffer,
        req.file.mimetype
      );
    }

    const { data: book, error } = await supabase
      .from("books")
      .insert([
        {
          title,
          author,
          isbn,
          category,
          quantity: parseInt(quantity) || 1,
          available_count: parseInt(quantity) || 1,
          publisher,
          publication_year: publication_year ? parseInt(publication_year) : null,
          description,
          cover_image_url,
          location,
          shelf_number,
          condition: condition || "good",
          price: price ? parseFloat(price) : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Book added successfully",
      book,
    });
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update book (Admin only)
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Remove undefined fields
    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key]
    );

    // Handle cover image upload
    if (req.file) {
      const fileName = `books/${Date.now()}_${req.file.originalname}`;
      updates.cover_image_url = await uploadFile(
        "book-covers",
        fileName,
        req.file.buffer,
        req.file.mimetype
      );
    }

    // Parse numeric fields
    if (updates.quantity) updates.quantity = parseInt(updates.quantity);
    if (updates.available_count) updates.available_count = parseInt(updates.available_count);
    if (updates.publication_year) updates.publication_year = parseInt(updates.publication_year);
    if (updates.price) updates.price = parseFloat(updates.price);

    const { data: book, error } = await supabase
      .from("books")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete book (Admin only)
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: book, error } = await supabase
      .from("books")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get book statistics for dashboard
const getBookStats = async (req, res) => {
  try {
    const { count: totalBooks } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true });

    const { data: availableData } = await supabase
      .from("books")
      .select("available_count");

    const totalAvailable = availableData?.reduce(
      (sum, book) => sum + (book.available_count || 0),
      0
    ) || 0;

    const { data: categories } = await supabase
      .from("books")
      .select("category")
      .not("category", "is", null);

    const uniqueCategories = [...new Set(categories?.map((c) => c.category) || [])];

    res.status(200).json({
      totalBooks: totalBooks || 0,
      totalAvailable,
      totalCategories: uniqueCategories.length,
      categories: uniqueCategories,
    });
  } catch (error) {
    console.error("Get book stats error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookStats,
};

