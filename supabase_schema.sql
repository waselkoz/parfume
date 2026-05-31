-- ==============================================================================
-- VÉLOURS PARIS - SUPABASE DATABASE SCHEMA & SEED DATA
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/projects
-- 2. Select your project.
-- 3. Go to the "SQL Editor" tab in the left-hand navigation sidebar (marked by a ">_" terminal icon).
-- 4. Click "New Query" -> "New Blank Query".
-- 5. Copy the entire contents of this file and paste it into the editor window.
-- 6. Click the "Run" button in the top right corner.
-- 7. Verify that the query executes successfully with "Success".
-- ==============================================================================

-- 1. CLEANUP EXISTING TABLES (Optional / Fresh Start)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS brands CASCADE;

-- 2. CREATE BRANDS TABLE
CREATE TABLE brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to brands" ON brands FOR SELECT USING (true);

-- Seed Brands (the 6 uploaded logos)
INSERT INTO brands (id, name, logo) VALUES
('brand-1', 'Chanel',    '/logos/t%C3%A9l%C3%A9charg%C3%A9.png'),
('brand-2', 'Dior',      '/logos/t%C3%A9l%C3%A9charg%C3%A9%20(1).png'),
('brand-3', 'YSL',       '/logos/t%C3%A9l%C3%A9charg%C3%A9%20(2).png'),
('brand-4', 'Creed',     '/logos/t%C3%A9l%C3%A9charg%C3%A9%20(3).png'),
('brand-5', 'Tom Ford',  '/logos/t%C3%A9l%C3%A9charg%C3%A9%20(4).png'),
('brand-6', 'Hugo Boss', '/logos/t%C3%A9l%C3%A9charg%C3%A9.jpeg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, logo = EXCLUDED.logo;

-- 3. CREATE CATEGORIES TABLE
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT 'Tag',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create Policies for Categories
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);


-- 3. CREATE PRODUCTS TABLE
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    price NUMERIC NOT NULL,
    category TEXT REFERENCES categories(name) ON UPDATE CASCADE ON DELETE SET NULL,
    image TEXT,
    top_notes TEXT[] DEFAULT '{}',
    heart_notes TEXT[] DEFAULT '{}',
    base_notes TEXT[] DEFAULT '{}',
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    stock_50ml INTEGER DEFAULT 15,
    stock_100ml INTEGER DEFAULT 8,
    low_stock_alert INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create Policies for Products
CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT USING (true);


-- 4. CREATE ORDERS TABLE
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    customer_email TEXT, -- Nullable / optional
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    wilaya TEXT DEFAULT '',
    residence TEXT DEFAULT '',
    items JSONB NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TEXT NOT NULL,
    db_created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create Policies for Orders
CREATE POLICY "Allow insert access to orders for anyone" ON orders
    FOR INSERT WITH CHECK (true);

-- MIGRATION COMMANDS (For existing databases):
-- ALTER TABLE orders ALTER COLUMN customer_email DROP NOT NULL;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '';
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '';
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS wilaya TEXT DEFAULT '';
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS residence TEXT DEFAULT '';


-- ==============================================================================
-- SEED DATA (POPULATE DEFAULT COLLECTIONS AND FRAGRANCES)
-- ==============================================================================

-- Seed Categories
INSERT INTO categories (id, name, description) VALUES
('cat-1', 'Maison Collection', 'Vélours flagship signature fragrances'),
('cat-2', 'Oud & Wood', 'Deep, smokey, resinous masterpieces'),
('cat-3', 'Floral Elixirs', 'Delicate, sweet, and blooming bouquets'),
('cat-4', 'Fresh Citrus', 'Vibrant, refreshing, and energizing notes')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Seed Products
INSERT INTO products (
    id, name, description, brand, price, category, image, 
    top_notes, heart_notes, base_notes, rating, reviews_count, 
    stock_50ml, stock_100ml, low_stock_alert
) VALUES
(
    'prod-1', 
    'L''Or Obsidien', 
    'An enigmatic masterpiece balancing dark smoke with sweet honey. L''Or Obsidien weaves a dense blanket of rare black oud, creamy Madagascar vanilla, and burnt amber, leaving a mesmerizing, powerful trail.', 
    'Vélours',
    280, 
    'Oud & Wood', 
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop', 
    ARRAY['Burnt Amber', 'Saffron', 'Honey'], 
    ARRAY['Black Oud', 'Incense', 'Atlas Cedar'], 
    ARRAY['Madagascar Vanilla', 'Leather', 'Patchouli'], 
    4.9, 124, 15, 8, 5
),
(
    'prod-2', 
    'Nuit Vélours', 
    'Seductive, mysterious, and velvety. Nuit Vélours captures the essence of Parisian romance under a dark sky, wrapping opulent Turkish rose and ripe black cherry in a warm leather jacket.', 
    'Vélours',
    245, 
    'Maison Collection', 
    'https://images.unsplash.com/photo-1615655404746-8f041380969b?q=80&w=600&auto=format&fit=crop', 
    ARRAY['Black Cherry', 'Almond', 'Pink Pepper'], 
    ARRAY['Turkish Rose', 'Jasmine Sambac', 'Plum'], 
    ARRAY['Leather', 'Sandalwood', 'Tonka Bean'], 
    4.8, 98, 20, 12, 5
),
(
    'prod-3', 
    'Ambre d''Orient', 
    'A warm, spicy golden embrace that echoes ancient desert nights. Rich cardamom and exotic saffron flow effortlessly into a creamy, resinous heart of sandalwood and warm mineral musk.', 
    'Vélours',
    260, 
    'Maison Collection', 
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop', 
    ARRAY['Cardamom', 'Cinnamon', 'Bergamot'], 
    ARRAY['Saffron', 'Labdanum', 'Myrrh'], 
    ARRAY['Sandalwood', 'Warm Amber', 'White Musk'], 
    4.7, 73, 10, 5, 5
),
(
    'prod-4', 
    'Jardin de Flore', 
    'A breath of early morning dew in a private botanical sanctuary. jardin de Flore is a rich bouquet of pristine white jasmine and soft peony layered over a smooth, grounding base of cashmere woods.', 
    'Vélours',
    210, 
    'Floral Elixirs', 
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop', 
    ARRAY['White Peony', 'Litchi', 'Freesia'], 
    ARRAY['Jasmine Infusion', 'Damask Rose', 'Tuberose'], 
    ARRAY['Cashmere Wood', 'Ambergris', 'Virginia Cedar'], 
    4.6, 65, 25, 15, 5
),
(
    'prod-5', 
    'Verde Espéride', 
    'An invigorating coastal escape along the sun-drenched cliffs of Calabria. Crisp bergamot and radiant orange blossom are swept up by clean ocean sea-salt and a green vetiver breeze.', 
    'Vélours',
    195, 
    'Fresh Citrus', 
    'https://images.unsplash.com/photo-1588405748373-122b2321bc31?q=80&w=600&auto=format&fit=crop', 
    ARRAY['Calabrian Bergamot', 'Lemon Zest', 'Ocean Salt'], 
    ARRAY['Neroli', 'Green Tea', 'Petitgrain'], 
    ARRAY['Haitian Vetiver', 'Cedarwood', 'White Amber'], 
    4.8, 42, 18, 10, 5
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    brand = EXCLUDED.brand,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    image = EXCLUDED.image,
    top_notes = EXCLUDED.top_notes,
    heart_notes = EXCLUDED.heart_notes,
    base_notes = EXCLUDED.base_notes,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count,
    stock_50ml = EXCLUDED.stock_50ml,
    stock_100ml = EXCLUDED.stock_100ml,
    low_stock_alert = EXCLUDED.low_stock_alert;
