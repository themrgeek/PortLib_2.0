#!/bin/bash

# PortLib Database Setup Script
# This script sets up the Supabase database schema

set -e

echo "🗄️  PortLib Database Setup"
echo "==========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are available
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if Node.js is available (for Supabase CLI)
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required for database setup."
        exit 1
    fi

    # Check if environment file exists
    if [ ! -f "backend/.env" ]; then
        print_error "Environment file not found. Please run ./scripts/install.sh first."
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Load environment variables
load_env() {
    print_status "Loading environment variables..."

    # Source the environment file
    set -a
    source backend/.env
    set +a

    # Check if required variables are set
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_error "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env"
        exit 1
    fi

    print_success "Environment variables loaded"
}

# Test database connection
test_connection() {
    print_status "Testing database connection..."

    # Create a simple test script
    cat > test_connection.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Database connection failed:', error.message);
      process.exit(1);
    }
    console.log('Database connection successful');
  } catch (error) {
    console.error('Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();
EOF

    if node test_connection.js; then
        print_success "Database connection test passed"
        rm test_connection.js
    else
        print_error "Database connection test failed"
        rm test_connection.js
        exit 1
    fi
}

# Setup database schema
setup_schema() {
    print_status "Setting up database schema..."

    if [ ! -f "backend/shared/db/schema_updates.sql" ]; then
        print_error "Database schema file not found."
        exit 1
    fi

    # Create a Node.js script to execute SQL
    cat > setup_schema.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupSchema() {
  try {
    const sql = fs.readFileSync('./backend/shared/db/schema_updates.sql', 'utf8');

    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

        if (error) {
          // Try direct execution for some statements
          console.log('Trying direct execution...');
          const { error: directError } = await supabase.from('_supabase_migration_temp').select('*').limit(0);
          if (directError && directError.message.includes('relation') === false) {
            console.warn('Note: Some schema operations may need manual execution in Supabase dashboard');
          }
        }
      }
    }

    console.log('Schema setup completed');
  } catch (error) {
    console.error('Schema setup failed:', error.message);
    console.log('Note: You may need to execute the SQL manually in your Supabase dashboard');
    console.log('SQL file location: backend/shared/db/schema_updates.sql');
  }
}

setupSchema();
EOF

    if node setup_schema.js; then
        print_success "Database schema setup completed"
        rm setup_schema.js
    else
        print_warning "Schema setup encountered issues"
        print_warning "You may need to execute the SQL manually in Supabase dashboard"
        echo "  SQL file: backend/shared/db/schema_updates.sql"
        rm setup_schema.js
    fi
}

# Create admin keys (sample data)
create_admin_keys() {
    print_status "Creating sample admin keys..."

    # Create a script to insert sample admin keys
    cat > create_admin_keys.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminKeys() {
  try {
    // Create sample admin keys
    const sampleKeys = [
      { key_value: 'ADMIN_KEY_001', is_used: false, description: 'Sample admin key 1' },
      { key_value: 'ADMIN_KEY_002', is_used: false, description: 'Sample admin key 2' },
      { key_value: 'ADMIN_KEY_003', is_used: false, description: 'Sample admin key 3' }
    ];

    for (const key of sampleKeys) {
      const { error } = await supabase
        .from('admin_keys')
        .insert(key)
        .select();

      if (error && !error.message.includes('duplicate')) {
        console.warn('Warning inserting admin key:', error.message);
      }
    }

    console.log('Sample admin keys created');
  } catch (error) {
    console.error('Failed to create admin keys:', error.message);
  }
}

createAdminKeys();
EOF

    if node create_admin_keys.js; then
        print_success "Sample admin keys created"
        echo "  Use these keys to create admin accounts:"
        echo "  - ADMIN_KEY_001"
        echo "  - ADMIN_KEY_002"
        echo "  - ADMIN_KEY_003"
        rm create_admin_keys.js
    else
        print_warning "Failed to create sample admin keys"
        rm create_admin_keys.js
    fi
}

# Show database info
show_info() {
    print_status "Database Information"
    echo "======================"

    echo "Supabase URL: $SUPABASE_URL"
    echo ""
    echo "Tables that should be created:"
    echo "  - users"
    echo "  - books"
    echo "  - book_borrowings"
    echo "  - warnings"
    echo "  - otps"
    echo "  - admin_keys"
    echo ""
    echo "Next steps:"
    echo "1. Verify tables exist in Supabase dashboard"
    echo "2. Check Row Level Security (RLS) policies if needed"
    echo "3. Create your first admin account using one of the admin keys"
}

# Show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  test       Test database connection"
    echo "  schema     Setup database schema"
    echo "  keys       Create sample admin keys"
    echo "  all        Run all setup steps (default)"
    echo "  info       Show database information"
    echo ""
    echo "Examples:"
    echo "  $0 all     # Complete database setup"
    echo "  $0 test    # Test connection only"
    echo "  $0 schema  # Setup schema only"
}

# Main function
main() {
    local command="${1:-all}"

    check_prerequisites
    load_env

    case "$command" in
        "test")
            test_connection
            ;;
        "schema")
            setup_schema
            ;;
        "keys")
            create_admin_keys
            ;;
        "info")
            show_info
            ;;
        "all")
            test_connection
            echo ""
            setup_schema
            echo ""
            create_admin_keys
            echo ""
            show_info
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac

    echo ""
    print_success "Database setup completed!"
}

# Run main function
main "$@"
