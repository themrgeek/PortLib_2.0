-- =====================================================
-- PORTLIB Database Schema Updates
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Add new columns to users table for warning system
ALTER TABLE users ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- =====================================================
-- BOOKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    category VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    available_count INTEGER DEFAULT 1,
    publisher VARCHAR(255),
    publication_year INTEGER,
    description TEXT,
    cover_image_url TEXT,
    location VARCHAR(100),
    shelf_number VARCHAR(50),
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('new', 'good', 'fair', 'poor')),
    price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);

-- =====================================================
-- WARNINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS warnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('overdue', 'nuisance', 'harassment', 'hate_speech', 'other')),
    description TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_warnings_user_id ON warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_warnings_admin_id ON warnings(admin_id);
CREATE INDEX IF NOT EXISTS idx_warnings_type ON warnings(type);

-- =====================================================
-- BOOK BORROWINGS TABLE (for tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS book_borrowings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue')),
    fine_amount DECIMAL(10, 2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_borrowings_book_id ON book_borrowings(book_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_user_id ON book_borrowings(user_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_status ON book_borrowings(status);

-- =====================================================
-- TRIGGER: Auto-update updated_at on books
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Auto-increment warning_count and suspend
-- =====================================================
CREATE OR REPLACE FUNCTION handle_warning_insert()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    -- Increment warning count
    UPDATE users 
    SET warning_count = warning_count + 1 
    WHERE id = NEW.user_id
    RETURNING warning_count INTO current_count;
    
    -- Auto-suspend after 3 warnings
    IF current_count >= 3 THEN
        UPDATE users 
        SET is_suspended = TRUE,
            suspended_until = NOW() + INTERVAL '30 days',
            suspended_reason = 'Auto-suspended after 3 warnings'
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS on_warning_insert ON warnings;
CREATE TRIGGER on_warning_insert
    AFTER INSERT ON warnings
    FOR EACH ROW
    EXECUTE FUNCTION handle_warning_insert();

-- =====================================================
-- RLS POLICIES (Disable for backend service access)
-- =====================================================
-- Note: If using service_role key, RLS is bypassed automatically.
-- Only enable these if needed for additional security layers.

-- ALTER TABLE books ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE warnings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE book_borrowings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- INSERT INTO books (title, author, isbn, category, quantity, available_count, publisher, publication_year, description, location, shelf_number, condition, price)
-- VALUES 
--     ('Clean Code', 'Robert C. Martin', '978-0132350884', 'Programming', 5, 5, 'Prentice Hall', 2008, 'A handbook of agile software craftsmanship', 'Section A', 'A-101', 'good', 39.99),
--     ('The Pragmatic Programmer', 'David Thomas', '978-0135957059', 'Programming', 3, 3, 'Addison-Wesley', 2019, 'Your journey to mastery', 'Section A', 'A-102', 'new', 49.99),
--     ('Design Patterns', 'Gang of Four', '978-0201633610', 'Programming', 2, 2, 'Addison-Wesley', 1994, 'Elements of Reusable Object-Oriented Software', 'Section A', 'A-103', 'fair', 54.99);

